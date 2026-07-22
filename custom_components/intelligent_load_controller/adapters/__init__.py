"""Home Assistant actuator adapters; policy code never imports these classes."""

from .action_pair import ActionPairAdapter
from .base import AdapterCommand, AdapterFeedback, AdapterTestResult, LoadAdapter
from .battery_load import BatteryLoadAdapter
from .binary_switch import BinarySwitchAdapter
from .ev_charger import BinaryEvAdapter, VariableEvAdapter
from .factory import NullAdapter, create_adapter
from .variable_number import VariableNumberAdapter

__all__ = [
    "ActionPairAdapter",
    "AdapterCommand",
    "AdapterFeedback",
    "AdapterTestResult",
    "BatteryLoadAdapter",
    "BinaryEvAdapter",
    "BinarySwitchAdapter",
    "LoadAdapter",
    "NullAdapter",
    "VariableEvAdapter",
    "VariableNumberAdapter",
    "create_adapter",
]
