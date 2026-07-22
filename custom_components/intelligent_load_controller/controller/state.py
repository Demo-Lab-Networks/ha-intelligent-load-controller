"""Explicit policy-state and command-authorisation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .models import (
    CommandAction,
    CommandProposal,
    CommandSource,
    LoadState,
    Override,
    ReasonCode,
    as_utc,
)


@dataclass(frozen=True, slots=True)
class StateDecision:
    state: LoadState
    reasons: tuple[ReasonCode, ...]

    def __post_init__(self) -> None:
        if not self.reasons:
            raise ValueError("a state decision requires at least one reason")
        object.__setattr__(self, "reasons", tuple(self.reasons))


@dataclass(frozen=True, slots=True)
class CommandAuthorization:
    proposal: CommandProposal
    allowed: bool
    reasons: tuple[ReasonCode, ...]

    def __post_init__(self) -> None:
        if not self.reasons:
            raise ValueError("a command authorization requires at least one reason")
        object.__setattr__(self, "reasons", tuple(self.reasons))


def derive_load_state(
    *,
    at: datetime,
    automatic_enabled: bool,
    observation_ready: bool,
    is_running: bool,
    is_complete: bool = False,
    override: Override | None = None,
    planned: bool = False,
    faulted: bool = False,
    blocked_reason: ReasonCode | None = None,
) -> StateDecision:
    """Derive a display/API state without causing or implying an actuation."""

    instant = as_utc(at, field_name="at")
    if faulted:
        return StateDecision(LoadState.FAULT, (ReasonCode.ACTUATOR_FEEDBACK_MISMATCH,))
    if override is not None and override.is_active_at(instant):
        return StateDecision(LoadState.OVERRIDDEN, (ReasonCode.MANUAL_OVERRIDE,))
    if not observation_ready:
        return StateDecision(LoadState.OBSERVING, (ReasonCode.STARTUP_OBSERVING,))
    if is_complete:
        return StateDecision(LoadState.COMPLETE, (ReasonCode.LOAD_COMPLETE,))
    if is_running:
        return StateDecision(LoadState.RUNNING, (ReasonCode.PLAN_SELECTED,))
    if not automatic_enabled:
        return StateDecision(LoadState.BLOCKED, (ReasonCode.AUTOMATIC_DISABLED,))
    if blocked_reason is not None:
        return StateDecision(LoadState.BLOCKED, (blocked_reason,))
    if planned:
        return StateDecision(LoadState.PLANNED, (ReasonCode.PLAN_SELECTED,))
    return StateDecision(LoadState.IDLE, (ReasonCode.PLAN_NOT_SELECTED,))


def authorize_command(
    proposal: CommandProposal,
    *,
    automatic_enabled: bool,
    observation_ready: bool,
    hard_safety_ok: bool,
    preview: bool = False,
) -> CommandAuthorization:
    """Apply the policy's non-negotiable command gate.

    The caller must still pass an allowed proposal to the site arbitrator.  This
    function isolates cross-cutting lifecycle semantics so no backend path can
    accidentally send automatic commands while disabled, during startup, or in
    preview mode.  A stop is always permitted for an already unsafe condition.
    """

    if preview:
        return CommandAuthorization(proposal, False, (ReasonCode.PREVIEW,))
    if (
        proposal.source in (CommandSource.AUTOMATIC, CommandSource.RECOVERY)
        and not automatic_enabled
    ):
        return CommandAuthorization(proposal, False, (ReasonCode.AUTOMATIC_DISABLED,))
    if (
        proposal.source in (CommandSource.AUTOMATIC, CommandSource.RECOVERY)
        and not observation_ready
    ):
        return CommandAuthorization(proposal, False, (ReasonCode.STARTUP_OBSERVING,))
    if proposal.action is not CommandAction.STOP and not hard_safety_ok:
        return CommandAuthorization(proposal, False, (ReasonCode.HARD_SITE_LIMIT,))
    return CommandAuthorization(proposal, True, (ReasonCode.PLAN_SELECTED,))
