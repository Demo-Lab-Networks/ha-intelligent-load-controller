//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = globalThis, r = n.ShadowRoot && (n.ShadyCSS === void 0 || n.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, i = Symbol(), a = /* @__PURE__ */ new WeakMap(), o = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== i) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (r && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = a.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && a.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, s = (e) => new o(typeof e == "string" ? e : e + "", void 0, i), c = (e, ...t) => new o(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, i), l = (e, t) => {
	if (r) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let r of t) {
		let t = document.createElement("style"), i = n.litNonce;
		i !== void 0 && t.setAttribute("nonce", i), t.textContent = r.cssText, e.appendChild(t);
	}
}, u = r ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return s(t);
})(e) : e, { is: d, defineProperty: f, getOwnPropertyDescriptor: p, getOwnPropertyNames: m, getOwnPropertySymbols: h, getPrototypeOf: g } = Object, _ = globalThis, v = _.trustedTypes, y = v ? v.emptyScript : "", b = _.reactiveElementPolyfillSupport, x = (e, t) => e, S = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? y : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, C = (e, t) => !d(e, t), w = {
	attribute: !0,
	type: String,
	converter: S,
	reflect: !1,
	useDefault: !1,
	hasChanged: C
};
Symbol.metadata ??= Symbol("metadata"), _.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var T = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = w) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && f(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = p(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? w;
	}
	static _$Ei() {
		if (this.hasOwnProperty(x("elementProperties"))) return;
		let e = g(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(x("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(x("properties"))) {
			let e = this.properties, t = [...m(e), ...h(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(Infinity).reverse());
			for (let e of n) t.unshift(u(e));
		} else e !== void 0 && t.push(u(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return l(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? S : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? S : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? C)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
T.elementStyles = [], T.shadowRootOptions = { mode: "open" }, T[x("elementProperties")] = /* @__PURE__ */ new Map(), T[x("finalized")] = /* @__PURE__ */ new Map(), b?.({ ReactiveElement: T }), (_.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var E = globalThis, D = (e) => e, O = E.trustedTypes, k = O ? O.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, A = "$lit$", j = `lit$${Math.random().toFixed(9).slice(2)}$`, ee = "?" + j, te = `<${ee}>`, ne = document, re = () => ne.createComment(""), ie = (e) => e === null || typeof e != "object" && typeof e != "function", ae = Array.isArray, oe = (e) => ae(e) || typeof e?.[Symbol.iterator] == "function", se = "[ 	\n\f\r]", ce = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ue = />/g, de = RegExp(`>|${se}(?:([^\\s"'>=/]+)(${se}*=${se}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), fe = /'/g, pe = /"/g, M = /^(?:script|style|textarea|title)$/i, N = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), me = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), he = /* @__PURE__ */ new WeakMap(), ge = ne.createTreeWalker(ne, 129);
function _e(e, t) {
	if (!ae(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return k === void 0 ? t : k.createHTML(t);
}
var ve = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ce;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === ce ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = de) : (M.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = de) : o = ue : o === de ? c[0] === ">" ? (o = i ?? ce, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? de : c[3] === "\"" ? pe : fe) : o === pe || o === fe ? o = de : o === le || o === ue ? o = ce : (o = de, i = void 0);
		let d = o === de && e[t + 1].startsWith("/>") ? " " : "";
		a += o === ce ? n + te : l >= 0 ? (r.push(s), n.slice(0, l) + A + n.slice(l) + j + d) : n + j + (l === -2 ? t : d);
	}
	return [_e(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, ye = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ve(t, n);
		if (this.el = e.createElement(l, r), ge.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = ge.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(A)) {
					let t = u[o++], n = i.getAttribute(e).split(j), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? we : r[1] === "?" ? Te : r[1] === "@" ? Ee : Ce
					}), i.removeAttribute(e);
				} else e.startsWith(j) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (M.test(i.tagName)) {
					let e = i.textContent.split(j), t = e.length - 1;
					if (t > 0) {
						i.textContent = O ? O.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], re()), ge.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], re());
					}
				}
			} else if (i.nodeType === 8) if (i.data === ee) c.push({
				type: 2,
				index: a
			});
			else {
				let e = -1;
				for (; (e = i.data.indexOf(j, e + 1)) !== -1;) c.push({
					type: 7,
					index: a
				}), e += j.length - 1;
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = ne.createElement("template");
		return n.innerHTML = e, n;
	}
};
function be(e, t, n = e, r) {
	if (t === me) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ie(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = be(e, i._$AS(e, t.values), i, r)), t;
}
var xe = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? ne).importNode(t, !0);
		ge.currentNode = r;
		let i = ge.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Se(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new De(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = ge.nextNode(), a++);
		}
		return ge.currentNode = ne, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Se = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = P, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = be(this, e, t), ie(e) ? e === P || e == null || e === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : e !== this._$AH && e !== me && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== P && ie(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ne.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = ye.createElement(_e(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new xe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = he.get(e.strings);
		return t === void 0 && he.set(e.strings, t = new ye(e)), t;
	}
	k(t) {
		ae(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(re()), this.O(re()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = D(e).nextSibling;
			D(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, Ce = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = P, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = P;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = be(this, e, t, 0), a = !ie(e) || e !== this._$AH && e !== me, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = be(this, r[n + o], t, o), s === me && (s = this._$AH[o]), a ||= !ie(s) || s !== this._$AH[o], s === P ? e = P : e !== P && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === P ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, we = class extends Ce {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === P ? void 0 : e;
	}
}, Te = class extends Ce {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== P);
	}
}, Ee = class extends Ce {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = be(this, e, t, 0) ?? P) === me) return;
		let n = this._$AH, r = e === P && n !== P || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== P && (n === P || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, De = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		be(this, e);
	}
}, Oe = E.litHtmlPolyfillSupport;
Oe?.(ye, Se), (E.litHtmlVersions ??= []).push("3.3.3");
var ke = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Se(t.insertBefore(re(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ae = globalThis, je = class extends T {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ke(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return me;
	}
};
je._$litElement$ = !0, je.finalized = !0, Ae.litElementHydrateSupport?.({ LitElement: je });
var Me = Ae.litElementPolyfillSupport;
Me?.({ LitElement: je }), (Ae.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/@lit/reactive-element/decorators/custom-element.js
var Ne = (e) => (t, n) => {
	n === void 0 ? customElements.define(e, t) : n.addInitializer(() => {
		customElements.define(e, t);
	});
}, Pe = {
	attribute: !0,
	type: String,
	converter: S,
	reflect: !1,
	hasChanged: C
}, Fe = (e = Pe, t, n) => {
	let { kind: r, metadata: i } = n, a = globalThis.litPropertyMetadata.get(i);
	if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), a.set(n.name, e), r === "accessor") {
		let { name: r } = n;
		return {
			set(n) {
				let i = t.get.call(this);
				t.set.call(this, n), this.requestUpdate(r, i, e, !0, n);
			},
			init(t) {
				return t !== void 0 && this.C(r, void 0, e, t), t;
			}
		};
	}
	if (r === "setter") {
		let { name: r } = n;
		return function(n) {
			let i = this[r];
			t.call(this, n), this.requestUpdate(r, i, e, !0, n);
		};
	}
	throw Error("Unsupported decorator location: " + r);
};
function Ie(e) {
	return (t, n) => typeof n == "object" ? Fe(e, t, n) : ((e, t, n) => {
		let r = t.hasOwnProperty(n);
		return t.constructor.createProperty(n, e), r ? Object.getOwnPropertyDescriptor(t, n) : void 0;
	})(e, t, n);
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/state.js
function Le(e) {
	return Ie({
		...e,
		state: !0,
		attribute: !1
	});
}
//#endregion
//#region node_modules/@lit/reactive-element/decorators/base.js
var Re = (e, t, n) => (n.configurable = !0, n.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, n), n);
//#endregion
//#region node_modules/@lit/reactive-element/decorators/query.js
function ze(e, t) {
	return (n, r, i) => {
		let a = (t) => t.renderRoot?.querySelector(e) ?? null;
		if (t) {
			let { get: e, set: t } = typeof r == "object" ? n : i ?? (() => {
				let e = Symbol();
				return {
					get() {
						return this[e];
					},
					set(t) {
						this[e] = t;
					}
				};
			})();
			return Re(n, r, { get() {
				let n = e.call(this);
				return n === void 0 && (n = a(this), (n !== null || this.hasUpdated) && t.call(this, n)), n;
			} });
		}
		return Re(n, r, { get() {
			return a(this);
		} });
	};
}
//#endregion
//#region src/api/load-control-api.ts
var Be = "intelligent_load_controller/v1", Ve = class extends Error {
	constructor(e, t = "unknown_error") {
		super(e), this.code = t, this.name = "LoadControlApiError";
	}
};
function He(e) {
	if (e instanceof Ve) return e;
	if (typeof e == "object" && e) {
		let t = e;
		if (typeof t.message == "string") return new Ve(t.message, typeof t.code == "string" ? t.code : "websocket_error");
	}
	return new Ve(e instanceof Error ? e.message : "Unknown websocket error");
}
var Ue = class {
	constructor(e) {
		this.hass = e;
	}
	async request(e, t) {
		try {
			return await this.hass.callWS({
				type: `${Be}/${e}`,
				...t
			});
		} catch (e) {
			throw He(e);
		}
	}
	async getSites() {
		return (await this.request("site_list", {})).sites;
	}
	async getDashboard(e) {
		let t = { entry_id: e }, [n, r] = await Promise.all([this.request("site_summary", t), this.request("load_list", t)]);
		return {
			site: We(n),
			loads: r.loads.map(Ge)
		};
	}
	getConfiguration(e) {
		return this.request("configuration_read", { entry_id: e });
	}
	validateConfiguration(e, t) {
		return this.request("configuration_validate", {
			entry_id: e,
			payload: t
		});
	}
	previewConfiguration(e, t) {
		return this.request("configuration_preview", {
			entry_id: e,
			payload: t
		});
	}
	updateSite(e, t, n) {
		return this.request("configuration_update", {
			entry_id: e,
			config: t,
			if_revision: n
		});
	}
	addLoad(e, t) {
		return this.request("load_add", {
			entry_id: e,
			config: t
		});
	}
	updateLoad(e, t, n, r) {
		return this.request("load_update", {
			entry_id: e,
			load_id: t,
			config: n,
			if_revision: r
		});
	}
	duplicateLoad(e, t, n, r) {
		return this.request("load_duplicate", {
			entry_id: e,
			load_id: t,
			if_revision: n,
			...r === void 0 ? {} : { display_name: r }
		});
	}
	deleteLoad(e, t, n) {
		return this.request("load_delete", {
			entry_id: e,
			load_id: t,
			if_revision: n
		});
	}
	startOverride(e, t, n, r = {}) {
		return this.request("override_start", {
			entry_id: e,
			load_id: t,
			desired_state: n,
			...r
		});
	}
	clearOverride(e, t) {
		return this.request("override_clear", {
			entry_id: e,
			load_id: t
		});
	}
	setAutomaticControl(e, t, n, r) {
		return this.request("automatic_control_set", {
			entry_id: e,
			load_id: t,
			enabled: n,
			if_revision: r
		});
	}
	getLoadDetail(e, t) {
		return this.request("load_detail", {
			entry_id: e,
			load_id: t
		});
	}
	getCurrentPlan(e) {
		return this.request("current_plan", { entry_id: e });
	}
	getDailyTimeline(e) {
		return this.request("daily_timeline", { entry_id: e });
	}
	getHistoricalSummary(e) {
		return this.request("historical_summary", { entry_id: e });
	}
	getEventJournal(e, t) {
		return this.request("event_journal", {
			entry_id: e,
			...t === void 0 ? {} : { load_id: t }
		});
	}
	replan(e, t) {
		return this.request("replan", {
			entry_id: e,
			...t === void 0 ? {} : { load_id: t }
		});
	}
	subscribeUpdates(e, t) {
		let n = this.hass.connection;
		return n?.subscribeMessage ? n.subscribeMessage(t, {
			type: `${Be}/subscribe_updates`,
			entry_id: e
		}) : Promise.resolve(void 0);
	}
};
function We(e) {
	let t = e.warnings ?? [], n = Je(e.health) ? e.health : t.length > 0 ? "warning" : "healthy";
	return {
		site_id: e.site_id ?? e.entry_id ?? "site",
		name: e.name ?? "Load Control",
		controller_state: e.controller_state ?? e.state ?? "initialising",
		controlled_power: e.controlled_power ?? Ke(e.total_controlled_power_w),
		active_load_count: e.active_load_count ?? e.active_loads ?? 0,
		waiting_load_count: e.waiting_load_count ?? e.waiting_loads ?? 0,
		health: n,
		updated_at: e.updated_at ?? e.last_replan_at
	};
}
function Ge(e) {
	let t = e.controller_state ?? e.state ?? "initialising";
	return {
		load_id: e.load_id ?? "unknown",
		name: e.name ?? e.load_id ?? "unknown",
		load_type: e.load_type ?? e.type ?? "unknown",
		controller_state: t,
		reason_code: e.reason_code ?? "configuration_invalid",
		config_revision: e.config_revision,
		automatic_control: e.automatic_control ?? !1,
		optimisation_mode: e.optimisation_mode,
		priority: e.priority,
		manual_override: e.manual_override ?? qe(e.override),
		current_power: e.current_power ?? Ke(e.current_power_w),
		progress: e.progress,
		deadline: e.deadline,
		next_action: e.next_action,
		target_status: e.target_status,
		fault: e.fault ?? t === "fault"
	};
}
function Ke(e) {
	return e === void 0 ? void 0 : {
		value: e,
		unit: "W"
	};
}
function qe(e) {
	if (e === "timed_on" || e === "timed_off" || e === "indefinite_on" || e === "indefinite_off") return e;
	if (typeof e != "object" || !e) return;
	let t = e, n = t.desired_state, r = typeof t.expires_at == "string";
	if (n === "on") return r ? "timed_on" : "indefinite_on";
	if (n === "off") return r ? "timed_off" : "indefinite_off";
}
function Je(e) {
	return e === "healthy" || e === "warning" || e === "error" || e === "unknown";
}
//#endregion
//#region src/i18n/messages.ts
var Ye = { en: {
	"app.title": "Load Control",
	"app.siteDashboard": "Site dashboard",
	"app.loadRoute": "Load details",
	"app.plan": "Plan and timeline",
	"app.history": "History and events",
	"app.configure": "Configuration",
	"nav.label": "Load Control sections",
	"nav.dashboard": "Dashboard",
	"nav.plan": "Plan",
	"nav.history": "History",
	"nav.configure": "Configure",
	"status.loading": "Loading current site status",
	"status.reconnecting": "Reconnecting to Home Assistant",
	"status.error": "Unable to load Load Control",
	"status.empty": "No controlled loads have been configured yet.",
	"status.emptyHint": "Add a load in the Load Control configuration to begin.",
	"status.noSites": "No Load Control sites have been configured yet.",
	"status.noSitesHint": "Add a Load Control integration entry from Home Assistant Settings to begin.",
	"status.selectSite": "Choose a Load Control site",
	"status.selectSiteHint": "More than one site is available. Choose the site to view.",
	"status.siteLabel": "Site",
	"status.openSite": "Open site dashboard",
	"status.retry": "Try again",
	"status.refresh": "Refresh dashboard",
	"status.updated": "Updated {time}",
	"status.connectionHint": "The panel will refresh when the Home Assistant connection returns.",
	"status.loadingSection": "Loading section data",
	"status.saved": "Changes saved.",
	"status.updatedPlan": "Plan recalculated.",
	"status.noPlan": "No current plan is available yet.",
	"status.noEvents": "No decision events have been recorded yet.",
	"status.noHistory": "No historical summaries are available yet.",
	"status.conflict": "These settings changed in another session. Reload the latest settings before trying again.",
	"status.reloadLatest": "Reload latest settings",
	"status.previewOnly": "Preview only — this does not operate any load.",
	"status.valid": "Configuration is valid.",
	"status.invalid": "Configuration needs attention.",
	"site.import": "Grid import",
	"site.export": "Grid export",
	"site.solar": "Solar production",
	"site.controlled": "Controlled power",
	"site.activeLoads": "Active loads",
	"site.waitingLoads": "Waiting loads",
	"site.price": "Import price",
	"site.costToday": "Cost today",
	"site.energyToday": "Energy today",
	"site.nextDeadline": "Next deadline",
	"site.health": "Site health",
	"site.snapshot": "Live site power snapshot",
	"site.snapshotDescription": "Current grid, solar, and controlled-load power.",
	"site.metrics": "Current site metrics",
	"load.list": "Controlled loads",
	"load.state": "Controller state",
	"load.automatic": "Automatic control",
	"load.enableAutomatic": "Enable Automatic control",
	"load.disableAutomatic": "Disable Automatic control",
	"load.manual": "Manual override",
	"load.deadline": "Deadline",
	"load.nextAction": "Next action",
	"load.power": "Power",
	"load.progress": "Progress",
	"load.fault": "Fault",
	"load.open": "Open controls",
	"load.edit": "Edit load",
	"load.add": "Add load",
	"load.defaultName": "New load",
	"load.duplicate": "Duplicate",
	"load.delete": "Delete",
	"load.cancelEdit": "Cancel editing",
	"load.name": "Display name",
	"load.type": "Load type",
	"load.optimisation": "Optimisation mode",
	"load.priority": "Priority",
	"load.phase": "Phase assignment",
	"load.expectedPower": "Expected power (W)",
	"load.override": "Manual override",
	"load.duration": "Override duration (minutes)",
	"load.timedOn": "Turn on for duration",
	"load.timedOff": "Turn off for duration",
	"load.indefiniteOn": "Keep on until cleared",
	"load.indefiniteOff": "Keep off until cleared",
	"load.clearOverride": "Clear override",
	"load.details": "Load controls",
	"load.configuration": "Load configuration",
	"load.save": "Save load",
	"load.added": "Load added.",
	"load.updated": "Load updated.",
	"load.duplicated": "Load duplicated as an unconfigured draft. Configure its actuator before enabling Automatic control.",
	"load.deleted": "Load deleted.",
	"load.overrideUpdated": "Manual override updated.",
	"load.overrideCleared": "Manual override cleared.",
	"load.automaticUpdated": "Automatic control updated.",
	"site.configuration": "Site configuration",
	"site.name": "Site name",
	"site.signConvention": "Grid sign convention",
	"site.planningHorizon": "Planning horizon (hours)",
	"site.planningResolution": "Planning resolution (seconds)",
	"site.softImportLimit": "Soft import limit (W)",
	"site.hardImportLimit": "Hard import limit (W)",
	"site.maxControlledPower": "Maximum controlled power (W)",
	"site.save": "Save site settings",
	"config.validate": "Validate",
	"config.preview": "Preview plan",
	"config.previewResult": "Preview result",
	"config.issues": "Validation issues",
	"config.advanced": "Stored configuration",
	"plan.current": "Current plan",
	"plan.timeline": "Daily timeline",
	"plan.replan": "Recalculate plan",
	"plan.generated": "Generated {time}",
	"plan.nextAction": "Next action",
	"plan.intervals": "Scheduled intervals",
	"plan.proposals": "Control proposals",
	"plan.noIntervals": "No scheduled intervals are currently available.",
	"plan.start": "Start",
	"plan.end": "End",
	"plan.power": "Power",
	"plan.reason": "Reason",
	"plan.load": "Load",
	"plan.authorised": "Authorised",
	"history.title": "Historical summaries",
	"history.quality": "Data quality: {quality}",
	"events.title": "Decision event journal",
	"events.time": "Time",
	"events.state": "State",
	"events.reason": "Reason",
	"events.message": "Message",
	"events.load": "Load",
	"dialog.deleteTitle": "Delete load?",
	"dialog.deleteBody": "Delete {name}? This removes its integration configuration and cannot be undone.",
	"dialog.confirmDelete": "Delete load",
	"dialog.cancel": "Cancel",
	"value.unavailable": "Unavailable",
	"value.enabled": "Enabled",
	"value.disabled": "Disabled",
	"value.yes": "Yes",
	"value.no": "No",
	"health.healthy": "Healthy",
	"health.warning": "Warning",
	"health.error": "Error",
	"health.unknown": "Unknown",
	"state.disabled": "Disabled",
	"state.initialising": "Initialising",
	"state.not_controlled": "Not controlled",
	"state.idle": "Idle",
	"state.waiting_for_window": "Waiting for window",
	"state.scheduled_run": "Scheduled run",
	"state.free_period_run": "Free-energy run",
	"state.solar_qualifying": "Qualifying solar export",
	"state.solar_run": "Solar run",
	"state.low_cost_run": "Low-cost run",
	"state.deadline_catchup": "Deadline catch-up",
	"state.variable_power_run": "Variable-power run",
	"state.minimum_on_hold": "Minimum-on hold",
	"state.minimum_off_hold": "Minimum-off hold",
	"state.manual_on": "Manual on",
	"state.manual_off": "Manual off",
	"state.target_complete": "Target complete",
	"state.blocked_by_site_limit": "Blocked by site limit",
	"state.blocked_by_higher_priority": "Blocked by higher-priority load",
	"state.input_unavailable": "Input unavailable",
	"state.actuator_unavailable": "Actuator unavailable",
	"state.fault": "Fault",
	"reason.automatic_control_disabled": "Automatic control is disabled.",
	"reason.fixed_schedule": "A fixed schedule is active.",
	"reason.free_energy_window": "A free-energy window is active.",
	"reason.solar_export_qualified": "Solar export has qualified.",
	"reason.lowest_cost_window": "This is the lowest-cost valid window.",
	"reason.deadline_catchup": "Operation is needed to meet the deadline.",
	"reason.minimum_on_hold": "Minimum on time is being observed.",
	"reason.minimum_off_hold": "Minimum off time is being observed.",
	"reason.manual_timed_boost": "A timed manual override is active.",
	"reason.manual_indefinite_override": "An indefinite manual override is active.",
	"reason.daily_target_met": "Today's target has been met.",
	"reason.maximum_runtime_reached": "Maximum runtime has been reached.",
	"reason.site_import_limit": "The site import target is limiting operation.",
	"reason.hard_electrical_limit": "A hard electrical limit is active.",
	"reason.controlled_power_limit": "The controlled-load power limit is active.",
	"reason.higher_priority_load": "A higher-priority load has the allocation.",
	"reason.battery_discharge_blocked": "Battery discharge prevention is active.",
	"reason.price_unavailable": "Price data is unavailable.",
	"reason.forecast_unavailable": "Forecast data is unavailable.",
	"reason.power_sensor_unavailable": "Power feedback is unavailable.",
	"reason.actuator_unavailable": "The actuator is unavailable.",
	"reason.feedback_not_detected": "Expected feedback was not detected.",
	"reason.configuration_invalid": "The configuration needs attention.",
	"reason.restart_stabilisation": "The controller is stabilising after restart."
} };
//#endregion
//#region src/i18n/index.ts
function Xe(e) {
	return e?.locale?.language ?? e?.language ?? navigator.language;
}
function F(e, t, n = {}) {
	return ((Ye[Xe(e).toLowerCase()] ?? Ye.en)[t] ?? Ye.en[t]).replace(/\{([a-zA-Z0-9_]+)\}/g, (e, t) => {
		let r = n[t];
		return r === void 0 ? e : String(r);
	});
}
//#endregion
//#region src/i18n/reasons.ts
var Ze = /* @__PURE__ */ new Set([
	"disabled",
	"initialising",
	"not_controlled",
	"idle",
	"waiting_for_window",
	"scheduled_run",
	"free_period_run",
	"solar_qualifying",
	"solar_run",
	"low_cost_run",
	"deadline_catchup",
	"variable_power_run",
	"minimum_on_hold",
	"minimum_off_hold",
	"manual_on",
	"manual_off",
	"target_complete",
	"blocked_by_site_limit",
	"blocked_by_higher_priority",
	"input_unavailable",
	"actuator_unavailable",
	"fault"
]);
function Qe(e, t) {
	let n = `state.${t}`;
	return Ze.has(t) ? F(e, n) : t;
}
function $e(e, t) {
	let n = `reason.${t}`;
	return n in Ye.en ? F(e, n) : t;
}
//#endregion
//#region src/utils/format.ts
function et(e) {
	return e?.locale?.language ?? e?.language ?? navigator.language;
}
function tt(e) {
	return e?.config?.time_zone;
}
function nt(e, t) {
	return t ? `${new Intl.NumberFormat(et(e), { maximumFractionDigits: Math.abs(t.value) < 10 ? 2 : 0 }).format(t.value)} ${t.unit}` : "—";
}
function rt(e, t) {
	if (!t) return "—";
	try {
		return `${new Intl.NumberFormat(et(e), {
			style: "currency",
			currency: t.currency,
			maximumFractionDigits: 3
		}).format(t.value)}/${t.unit}`;
	} catch {
		return `${t.value} ${t.currency}/${t.unit}`;
	}
}
function it(e, t) {
	if (!t) return "—";
	let n = new Date(t);
	if (Number.isNaN(n.getTime())) return t;
	let r = {
		dateStyle: "medium",
		timeStyle: "short"
	}, i = tt(e);
	try {
		return new Intl.DateTimeFormat(et(e), {
			...r,
			...i === void 0 ? {} : { timeZone: i }
		}).format(n);
	} catch {
		return new Intl.DateTimeFormat(et(e), r).format(n);
	}
}
//#endregion
//#region node_modules/tslib/tslib.es6.js
var at = function(e, t) {
	return at = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
		e.__proto__ = t;
	} || function(e, t) {
		for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
	}, at(e, t);
};
function I(e, t) {
	if (typeof t != "function" && t !== null) throw TypeError("Class extends value " + String(t) + " is not a constructor or null");
	at(e, t);
	function n() {
		this.constructor = e;
	}
	e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
var ot = "12px sans-serif", st = 20, ct = 100, lt = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N";
function ut(e) {
	var t = {};
	if (typeof JSON > "u") return t;
	for (var n = 0; n < e.length; n++) {
		var r = String.fromCharCode(n + 32);
		t[r] = (e.charCodeAt(n) - st) / ct;
	}
	return t;
}
var dt = ut(lt), ft = {
	createCanvas: function() {
		return typeof document < "u" && document.createElement("canvas");
	},
	measureText: (function() {
		var e, t;
		return function(n, r) {
			if (!e) {
				var i = ft.createCanvas();
				e = i && i.getContext("2d");
			}
			if (e) return t !== r && (t = e.font = r || "12px sans-serif"), e.measureText(n);
			n ||= "", r ||= "12px sans-serif";
			var a = /((?:\d+)?\.?\d*)px/.exec(r), o = a && +a[1] || 12, s = 0;
			if (r.indexOf("mono") >= 0) s = o * n.length;
			else for (var c = 0; c < n.length; c++) {
				var l = dt[n[c]];
				s += l == null ? o : l * o;
			}
			return { width: s };
		};
	})(),
	loadImage: function(e, t, n) {
		var r = new Image();
		return r.onload = t, r.onerror = n, r.src = e, r;
	},
	getTime: function() {
		return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
	}
}, pt = Ft([
	"Function",
	"RegExp",
	"Date",
	"Error",
	"CanvasGradient",
	"CanvasPattern",
	"Image",
	"Canvas"
], function(e, t) {
	return e["[object " + t + "]"] = !0, e;
}, {}), mt = Ft([
	"Int8",
	"Uint8",
	"Uint8Clamped",
	"Int16",
	"Uint16",
	"Int32",
	"Uint32",
	"Float32",
	"Float64"
], function(e, t) {
	return e["[object " + t + "Array]"] = !0, e;
}, {}), ht = Object.prototype.toString, gt = Array.prototype, _t = gt.forEach, vt = gt.filter, yt = gt.slice, bt = gt.map, xt = function() {}.constructor, St = xt ? xt.prototype : null, Ct = "__proto__", wt = 2311, Tt = 2 ** 53 - 1;
function Et() {
	return wt >= Tt && (wt = 0), wt++;
}
function Dt() {
	var e = [...arguments];
	typeof console < "u" && console.error.apply(console, e);
}
function L(e) {
	if (typeof e != "object" || !e) return e;
	var t = e, n = ht.call(e);
	if (n === "[object Array]") {
		if (!nn(e)) {
			t = [];
			for (var r = 0, i = e.length; r < i; r++) t[r] = L(e[r]);
		}
	} else if (mt[n]) {
		if (!nn(e)) {
			var a = e.constructor;
			if (a.from) t = a.from(e);
			else {
				t = new a(e.length);
				for (var r = 0, i = e.length; r < i; r++) t[r] = e[r];
			}
		}
	} else if (!pt[n] && !nn(e) && !Gt(e)) for (var o in t = {}, e) e.hasOwnProperty(o) && o !== Ct && (t[o] = L(e[o]));
	return t;
}
function Ot(e, t, n) {
	if (!G(t) || !G(e)) return n ? L(t) : e;
	for (var r in t) if (t.hasOwnProperty(r) && r !== Ct) {
		var i = e[r], a = t[r];
		G(a) && G(i) && !H(a) && !H(i) && !Gt(a) && !Gt(i) && !Ut(a) && !Ut(i) && !nn(a) && !nn(i) ? Ot(i, a, n) : (n || !(r in e)) && (e[r] = L(t[r]));
	}
	return e;
}
function R(e, t) {
	if (Object.assign) Object.assign(e, t);
	else for (var n in t) t.hasOwnProperty(n) && n !== Ct && (e[n] = t[n]);
	return e;
}
function kt(e, t, n) {
	e ||= {};
	for (var r = 0; r < n.length; r++) {
		var i = n[r];
		e[i] = t[i];
	}
	return e;
}
function At(e, t, n) {
	for (var r = V(t), i = 0, a = r.length; i < a; i++) {
		var o = r[i];
		(n ? t[o] != null : e[o] == null) && (e[o] = t[o]);
	}
	return e;
}
ft.createCanvas;
function jt(e, t) {
	if (e) {
		if (e.indexOf) return e.indexOf(t);
		for (var n = 0, r = e.length; n < r; n++) if (e[n] === t) return n;
	}
	return -1;
}
function Mt(e, t) {
	var n = e.prototype;
	function r() {}
	for (var i in r.prototype = t.prototype, e.prototype = new r(), n) n.hasOwnProperty(i) && (e.prototype[i] = n[i]);
	e.prototype.constructor = e, e.superClass = t;
}
function Nt(e, t, n) {
	if (e = "prototype" in e ? e.prototype : e, t = "prototype" in t ? t.prototype : t, Object.getOwnPropertyNames) for (var r = Object.getOwnPropertyNames(t), i = 0; i < r.length; i++) {
		var a = r[i];
		a !== "constructor" && (n ? t[a] != null : e[a] == null) && (e[a] = t[a]);
	}
	else At(e, t, n);
}
function Pt(e) {
	return !e || typeof e == "string" ? !1 : typeof e.length == "number";
}
function z(e, t, n) {
	if (e && t) if (e.forEach && e.forEach === _t) e.forEach(t, n);
	else if (e.length === +e.length) for (var r = 0, i = e.length; r < i; r++) t.call(n, e[r], r, e);
	else for (var a in e) e.hasOwnProperty(a) && t.call(n, e[a], a, e);
}
function B(e, t, n) {
	if (!e) return [];
	if (!t) return Zt(e);
	if (e.map && e.map === bt) return e.map(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) r.push(t.call(n, e[i], i, e));
	return r;
}
function Ft(e, t, n, r) {
	if (e && t) {
		for (var i = 0, a = e.length; i < a; i++) n = t.call(r, n, e[i], i, e);
		return n;
	}
}
function It(e, t, n) {
	if (!e) return [];
	if (!t) return Zt(e);
	if (e.filter && e.filter === vt) return e.filter(t, n);
	for (var r = [], i = 0, a = e.length; i < a; i++) t.call(n, e[i], i, e) && r.push(e[i]);
	return r;
}
function Lt(e, t, n) {
	if (e && t) {
		for (var r = 0, i = e.length; r < i; r++) if (t.call(n, e[r], r, e)) return e[r];
	}
}
function V(e) {
	if (!e) return [];
	if (Object.keys) return Object.keys(e);
	var t = [];
	for (var n in e) e.hasOwnProperty(n) && t.push(n);
	return t;
}
function Rt(e, t) {
	var n = [...arguments].slice(2);
	return function() {
		return e.apply(t, n.concat(yt.call(arguments)));
	};
}
var zt = St && U(St.bind) ? St.call.bind(St.bind) : Rt;
function Bt(e) {
	var t = [...arguments].slice(1);
	return function() {
		return e.apply(this, t.concat(yt.call(arguments)));
	};
}
function H(e) {
	return Array.isArray ? Array.isArray(e) : ht.call(e) === "[object Array]";
}
function U(e) {
	return typeof e == "function";
}
function W(e) {
	return typeof e == "string";
}
function Vt(e) {
	return ht.call(e) === "[object String]";
}
function Ht(e) {
	return typeof e == "number";
}
function G(e) {
	var t = typeof e;
	return t === "function" || !!e && t === "object";
}
function Ut(e) {
	return !!pt[ht.call(e)];
}
function Wt(e) {
	return !!mt[ht.call(e)];
}
function Gt(e) {
	return typeof e == "object" && typeof e.nodeType == "number" && typeof e.ownerDocument == "object";
}
function Kt(e) {
	return e.colorStops != null;
}
function qt(e) {
	return ht.call(e) === "[object RegExp]";
}
function Jt(e) {
	return e !== e;
}
function Yt() {
	for (var e = [...arguments], t = 0, n = e.length; t < n; t++) if (e[t] != null) return e[t];
}
function K(e, t) {
	return e ?? t;
}
function Xt(e, t, n) {
	return e ?? t ?? n;
}
function Zt(e) {
	var t = [...arguments].slice(1);
	return yt.apply(e, t);
}
function Qt(e) {
	if (typeof e == "number") return [
		e,
		e,
		e,
		e
	];
	var t = e.length;
	return t === 2 ? [
		e[0],
		e[1],
		e[0],
		e[1]
	] : t === 3 ? [
		e[0],
		e[1],
		e[2],
		e[1]
	] : e;
}
function q(e, t) {
	if (!e) throw Error(t);
}
function $t(e) {
	return e == null ? null : typeof e.trim == "function" ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
var en = "__ec_primitive__";
function tn(e) {
	e[en] = !0;
}
function nn(e) {
	return e[en];
}
var rn = function() {
	function e() {
		this.data = {};
	}
	return e.prototype.delete = function(e) {
		var t = this.has(e);
		return t && delete this.data[e], t;
	}, e.prototype.has = function(e) {
		return this.data.hasOwnProperty(e);
	}, e.prototype.get = function(e) {
		return this.data[e];
	}, e.prototype.set = function(e, t) {
		return this.data[e] = t, this;
	}, e.prototype.keys = function() {
		return V(this.data);
	}, e.prototype.forEach = function(e) {
		var t = this.data;
		for (var n in t) t.hasOwnProperty(n) && e(t[n], n);
	}, e;
}(), an = typeof Map == "function";
function on() {
	return an ? /* @__PURE__ */ new Map() : new rn();
}
var sn = function() {
	function e(t) {
		var n = H(t);
		this.data = on();
		var r = this;
		t instanceof e ? t.each(i) : t && z(t, i);
		function i(e, t) {
			n ? r.set(e, t) : r.set(t, e);
		}
	}
	return e.prototype.hasKey = function(e) {
		return this.data.has(e);
	}, e.prototype.get = function(e) {
		return this.data.get(e);
	}, e.prototype.set = function(e, t) {
		return this.data.set(e, t), t;
	}, e.prototype.each = function(e, t) {
		this.data.forEach(function(n, r) {
			e.call(t, n, r);
		});
	}, e.prototype.keys = function() {
		var e = this.data.keys();
		return an ? Array.from(e) : e;
	}, e.prototype.removeKey = function(e) {
		this.data.delete(e);
	}, e;
}();
function J(e) {
	return new sn(e);
}
function cn(e, t) {
	for (var n = new e.constructor(e.length + t.length), r = 0; r < e.length; r++) n[r] = e[r];
	for (var i = e.length, r = 0; r < t.length; r++) n[r + i] = t[r];
	return n;
}
function ln(e, t) {
	var n;
	if (Object.create) n = Object.create(e);
	else {
		var r = function() {};
		r.prototype = e, n = new r();
	}
	return t && R(n, t), n;
}
function un(e, t) {
	return e.hasOwnProperty(t);
}
function dn() {}
var fn = 180 / Math.PI, pn = function() {
	function e() {
		this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
	}
	return e;
}(), Y = new (function() {
	function e() {
		this.browser = new pn(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
	}
	return e;
}())();
typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (Y.wxa = !0, Y.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? Y.worker = !0 : !Y.hasGlobalWindow || "Deno" in window || typeof navigator < "u" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Node.js") > -1 ? (Y.node = !0, Y.svgSupported = !0) : mn(navigator.userAgent, Y);
function mn(e, t) {
	var n = t.browser, r = e.match(/Firefox\/([\d.]+)/), i = e.match(/MSIE\s([\d.]+)/) || e.match(/Trident\/.+?rv:(([\d.]+))/), a = e.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(e);
	if (r && (n.firefox = !0, n.version = r[1]), i && (n.ie = !0, n.version = i[1]), a && (n.edge = !0, n.version = a[1], n.newEdge = +a[1].split(".")[0] > 18), o && (n.weChat = !0), t.svgSupported = typeof SVGRect < "u", t.touchEventsSupported = "ontouchstart" in window && !n.ie && !n.edge, t.pointerEventsSupported = "onpointerdown" in window && (n.edge || n.ie && +n.version >= 11), t.domSupported = typeof document < "u") {
		var s = document.documentElement.style;
		t.transform3dSupported = (n.ie && "transition" in s || n.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in s) && !("OTransition" in s), t.transformSupported = t.transform3dSupported || n.ie && +n.version >= 9;
	}
}
//#endregion
//#region node_modules/echarts/lib/util/clazz.js
var hn = ".", gn = "___EC__COMPONENT__CONTAINER___", _n = "___EC__EXTENDED_CLASS___";
function vn(e) {
	var t = {
		main: "",
		sub: ""
	};
	if (e) {
		var n = e.split(hn);
		t.main = n[0] || "", t.sub = n[1] || "";
	}
	return t;
}
function yn(e) {
	q(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(e), "componentType \"" + e + "\" illegal");
}
function bn(e) {
	return !!(e && e[_n]);
}
function xn(e, t) {
	e.$constructor = e, e.extend = function(e) {
		process.env.NODE_ENV !== "production" && z(t, function(t) {
			e[t] || console.warn("Method `" + t + "` should be implemented" + (e.type ? " in " + e.type : "") + ".");
		});
		var n = this, r;
		return Sn(n) ? r = function(e) {
			I(t, e);
			function t() {
				return e.apply(this, arguments) || this;
			}
			return t;
		}(n) : (r = function() {
			(e.$constructor || n).apply(this, arguments);
		}, Mt(r, this)), R(r.prototype, e), r[_n] = !0, r.extend = this.extend, r.superCall = En, r.superApply = Dn, r.superClass = n, r;
	};
}
function Sn(e) {
	return U(e) && /^class\s/.test(Function.prototype.toString.call(e));
}
function Cn(e, t) {
	e.extend = t.extend;
}
var wn = Math.round(Math.random() * 10);
function Tn(e) {
	var t = ["__\0is_clz", wn++].join("_");
	e.prototype[t] = !0, process.env.NODE_ENV !== "production" && q(!e.isInstance, "The method \"is\" can not be defined."), e.isInstance = function(e) {
		return !!(e && e[t]);
	};
}
function En(e, t) {
	var n = [...arguments].slice(2);
	return this.superClass.prototype[t].apply(e, n);
}
function Dn(e, t, n) {
	return this.superClass.prototype[t].apply(e, n);
}
function On(e) {
	var t = {};
	e.registerClass = function(e) {
		var r = e.type || e.prototype.type;
		if (r) {
			yn(r), e.prototype.type = r;
			var i = vn(r);
			if (!i.sub) process.env.NODE_ENV !== "production" && t[i.main] && console.warn(i.main + " exists."), t[i.main] = e;
			else if (i.sub !== gn) {
				var a = n(i);
				a[i.sub] = e;
			}
		}
		return e;
	}, e.getClass = function(e, n, r) {
		var i = t[e];
		if (i && i[gn] && (i = n ? i[n] : null), r && !i) throw Error(n ? "Component " + e + "." + (n || "") + " is used but not imported." : e + ".type should be specified.");
		return i;
	}, e.getClassesByMainType = function(e) {
		var n = vn(e), r = [], i = t[n.main];
		return i && i[gn] ? z(i, function(e, t) {
			t !== gn && r.push(e);
		}) : r.push(i), r;
	}, e.hasClass = function(e) {
		return !!t[vn(e).main];
	}, e.getAllClassMainTypes = function() {
		var e = [];
		return z(t, function(t, n) {
			e.push(n);
		}), e;
	}, e.hasSubTypes = function(e) {
		var n = t[vn(e).main];
		return n && n[gn];
	};
	function n(e) {
		var n = t[e.main];
		return (!n || !n[gn]) && (n = t[e.main] = {}, n[gn] = !0), n;
	}
}
//#endregion
//#region node_modules/echarts/lib/model/mixin/makeStyleMapper.js
function kn(e, t) {
	for (var n = 0; n < e.length; n++) e[n][1] || (e[n][1] = e[n][0]);
	return t ||= !1, function(n, r, i) {
		for (var a = {}, o = 0; o < e.length; o++) {
			var s = e[o][1];
			if (!(r && jt(r, s) >= 0 || i && jt(i, s) < 0)) {
				var c = n.getShallow(s, t);
				c != null && (a[e[o][0]] = c);
			}
		}
		return a;
	};
}
var An = kn([
	["fill", "color"],
	["shadowBlur"],
	["shadowOffsetX"],
	["shadowOffsetY"],
	["opacity"],
	["shadowColor"]
]), jn = function() {
	function e() {}
	return e.prototype.getAreaStyle = function(e, t) {
		return An(this, e, t);
	}, e;
}(), Mn = function() {
	function e(e) {
		this.value = e;
	}
	return e;
}(), Nn = function() {
	function e() {
		this._len = 0;
	}
	return e.prototype.insert = function(e) {
		var t = new Mn(e);
		return this.insertEntry(t), t;
	}, e.prototype.insertEntry = function(e) {
		this.head ? (this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e) : this.head = this.tail = e, this._len++;
	}, e.prototype.remove = function(e) {
		var t = e.prev, n = e.next;
		t ? t.next = n : this.head = n, n ? n.prev = t : this.tail = t, e.next = e.prev = null, this._len--;
	}, e.prototype.len = function() {
		return this._len;
	}, e.prototype.clear = function() {
		this.head = this.tail = null, this._len = 0;
	}, e;
}(), Pn = function() {
	function e(e) {
		this._list = new Nn(), this._maxSize = 10, this._map = {}, this._maxSize = e;
	}
	return e.prototype.put = function(e, t) {
		var n = this._list, r = this._map, i = null;
		if (r[e] == null) {
			var a = n.len(), o = this._lastRemovedEntry;
			if (a >= this._maxSize && a > 0) {
				var s = n.head;
				n.remove(s), delete r[s.key], i = s.value, this._lastRemovedEntry = s;
			}
			o ? o.value = t : o = new Mn(t), o.key = e, n.insertEntry(o), r[e] = o;
		}
		return i;
	}, e.prototype.get = function(e) {
		var t = this._map[e], n = this._list;
		if (t != null) return t !== n.tail && (n.remove(t), n.insertEntry(t)), t.value;
	}, e.prototype.clear = function() {
		this._list.clear(), this._map = {};
	}, e.prototype.len = function() {
		return this._list.len();
	}, e;
}(), Fn = new Pn(50);
function In(e) {
	if (typeof e == "string") {
		var t = Fn.get(e);
		return t && t.image;
	} else return e;
}
function Ln(e, t, n, r, i) {
	if (!e) return t;
	if (typeof e == "string") {
		if (t && t.__zrImageSrc === e || !n) return t;
		var a = Fn.get(e), o = {
			hostEl: n,
			cb: r,
			cbPayload: i
		};
		return a ? (t = a.image, !zn(t) && a.pending.push(o)) : (t = ft.loadImage(e, Rn, Rn), t.__zrImageSrc = e, Fn.put(e, t.__cachedImgObj = {
			image: t,
			pending: [o]
		})), t;
	} else return e;
}
function Rn() {
	var e = this.__cachedImgObj;
	this.onload = this.onerror = this.__cachedImgObj = null;
	for (var t = 0; t < e.pending.length; t++) {
		var n = e.pending[t], r = n.cb;
		r && r(this, n.cbPayload), n.hostEl.dirty();
	}
	e.pending.length = 0;
}
function zn(e) {
	return e && e.width && e.height;
}
//#endregion
//#region node_modules/zrender/lib/core/matrix.js
function Bn() {
	return [
		1,
		0,
		0,
		1,
		0,
		0
	];
}
function Vn(e) {
	return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e[4] = 0, e[5] = 0, e;
}
function Hn(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e;
}
function Un(e, t, n) {
	var r = t[0] * n[0] + t[2] * n[1], i = t[1] * n[0] + t[3] * n[1], a = t[0] * n[2] + t[2] * n[3], o = t[1] * n[2] + t[3] * n[3], s = t[0] * n[4] + t[2] * n[5] + t[4], c = t[1] * n[4] + t[3] * n[5] + t[5];
	return e[0] = r, e[1] = i, e[2] = a, e[3] = o, e[4] = s, e[5] = c, e;
}
function Wn(e, t, n) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4] + n[0], e[5] = t[5] + n[1], e;
}
function Gn(e, t, n, r) {
	r === void 0 && (r = [0, 0]);
	var i = t[0], a = t[2], o = t[4], s = t[1], c = t[3], l = t[5], u = Math.sin(n), d = Math.cos(n);
	return e[0] = i * d + s * u, e[1] = -i * u + s * d, e[2] = a * d + c * u, e[3] = -a * u + d * c, e[4] = d * (o - r[0]) + u * (l - r[1]) + r[0], e[5] = d * (l - r[1]) - u * (o - r[0]) + r[1], e;
}
function Kn(e, t, n) {
	var r = n[0], i = n[1];
	return e[0] = t[0] * r, e[1] = t[1] * i, e[2] = t[2] * r, e[3] = t[3] * i, e[4] = t[4] * r, e[5] = t[5] * i, e;
}
function qn(e, t) {
	var n = t[0], r = t[2], i = t[4], a = t[1], o = t[3], s = t[5], c = n * o - a * r;
	return c ? (c = 1 / c, e[0] = o * c, e[1] = -a * c, e[2] = -r * c, e[3] = n * c, e[4] = (r * s - o * i) * c, e[5] = (a * i - n * s) * c, e) : null;
}
//#endregion
//#region node_modules/zrender/lib/core/vector.js
function Jn(e, t) {
	return e ??= 0, t ??= 0, [e, t];
}
function Yn(e) {
	return [e[0], e[1]];
}
function Xn(e, t, n) {
	return e[0] = t, e[1] = n, e;
}
function Zn(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function Qn(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function $n(e) {
	return Math.sqrt(er(e));
}
function er(e) {
	return e[0] * e[0] + e[1] * e[1];
}
function tr(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function nr(e, t) {
	var n = $n(t);
	return n === 0 ? (e[0] = 0, e[1] = 0) : (e[0] = t[0] / n, e[1] = t[1] / n), e;
}
function rr(e, t) {
	return Math.sqrt((e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]));
}
var ir = rr;
function ar(e, t) {
	return (e[0] - t[0]) * (e[0] - t[0]) + (e[1] - t[1]) * (e[1] - t[1]);
}
var or = ar;
function sr(e, t, n) {
	var r = t[0], i = t[1];
	return e[0] = n[0] * r + n[2] * i + n[4], e[1] = n[1] * r + n[3] * i + n[5], e;
}
function cr(e, t, n) {
	return e[0] = Math.min(t[0], n[0]), e[1] = Math.min(t[1], n[1]), e;
}
function lr(e, t, n) {
	return e[0] = Math.max(t[0], n[0]), e[1] = Math.max(t[1], n[1]), e;
}
//#endregion
//#region node_modules/zrender/lib/core/Point.js
var ur = function() {
	function e(e, t) {
		this.x = e || 0, this.y = t || 0;
	}
	return e.prototype.copy = function(e) {
		return this.x = e.x, this.y = e.y, this;
	}, e.prototype.clone = function() {
		return new e(this.x, this.y);
	}, e.prototype.set = function(e, t) {
		return this.x = e, this.y = t, this;
	}, e.prototype.equal = function(e) {
		return e.x === this.x && e.y === this.y;
	}, e.prototype.add = function(e) {
		return this.x += e.x, this.y += e.y, this;
	}, e.prototype.scale = function(e) {
		this.x *= e, this.y *= e;
	}, e.prototype.scaleAndAdd = function(e, t) {
		this.x += e.x * t, this.y += e.y * t;
	}, e.prototype.sub = function(e) {
		return this.x -= e.x, this.y -= e.y, this;
	}, e.prototype.dot = function(e) {
		return this.x * e.x + this.y * e.y;
	}, e.prototype.len = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}, e.prototype.lenSquare = function() {
		return this.x * this.x + this.y * this.y;
	}, e.prototype.normalize = function() {
		var e = this.len();
		return this.x /= e, this.y /= e, this;
	}, e.prototype.distance = function(e) {
		var t = this.x - e.x, n = this.y - e.y;
		return Math.sqrt(t * t + n * n);
	}, e.prototype.distanceSquare = function(e) {
		var t = this.x - e.x, n = this.y - e.y;
		return t * t + n * n;
	}, e.prototype.negate = function() {
		return this.x = -this.x, this.y = -this.y, this;
	}, e.prototype.transform = function(e) {
		if (e) {
			var t = this.x, n = this.y;
			return this.x = e[0] * t + e[2] * n + e[4], this.y = e[1] * t + e[3] * n + e[5], this;
		}
	}, e.prototype.toArray = function(e) {
		return e[0] = this.x, e[1] = this.y, e;
	}, e.prototype.fromArray = function(e) {
		this.x = e[0], this.y = e[1];
	}, e.set = function(e, t, n) {
		e.x = t, e.y = n;
	}, e.copy = function(e, t) {
		e.x = t.x, e.y = t.y;
	}, e.len = function(e) {
		return Math.sqrt(e.x * e.x + e.y * e.y);
	}, e.lenSquare = function(e) {
		return e.x * e.x + e.y * e.y;
	}, e.dot = function(e, t) {
		return e.x * t.x + e.y * t.y;
	}, e.add = function(e, t, n) {
		e.x = t.x + n.x, e.y = t.y + n.y;
	}, e.sub = function(e, t, n) {
		e.x = t.x - n.x, e.y = t.y - n.y;
	}, e.scale = function(e, t, n) {
		e.x = t.x * n, e.y = t.y * n;
	}, e.scaleAndAdd = function(e, t, n, r) {
		e.x = t.x + n.x * r, e.y = t.y + n.y * r;
	}, e.lerp = function(e, t, n, r) {
		var i = 1 - r;
		e.x = i * t.x + r * n.x, e.y = i * t.y + r * n.y;
	}, e;
}(), dr = Math.min, fr = Math.max, pr = Math.abs, mr = ["x", "y"], hr = ["width", "height"], gr = new ur(), _r = new ur(), vr = new ur(), yr = new ur(), br = jr(), xr = br.minTv, Sr = br.maxTv, Cr = [0, 0], X = function() {
	function e(e, t, n, r) {
		wr(this, e, t, n, r);
	}
	return e.set = function(e, t, n, r, i) {
		return r < 0 && (t += r, r = -r), i < 0 && (n += i, i = -i), e.x = t, e.y = n, e.width = r, e.height = i, e;
	}, e.prototype.union = function(e) {
		var t = dr(e.x, this.x), n = dr(e.y, this.y);
		isFinite(this.x) && isFinite(this.width) ? this.width = fr(e.x + e.width, this.x + this.width) - t : this.width = e.width, isFinite(this.y) && isFinite(this.height) ? this.height = fr(e.y + e.height, this.y + this.height) - n : this.height = e.height, this.x = t, this.y = n;
	}, e.prototype.applyTransform = function(t) {
		e.applyTransform(this, this, t);
	}, e.prototype.calculateTransform = function(e) {
		return Er(Bn(), this, e);
	}, e.prototype.intersect = function(t, n, r) {
		return e.intersect(this, t, n, r);
	}, e.intersect = function(t, n, r, i) {
		r && ur.set(r, 0, 0);
		var a = i && i.outIntersectRect || null, o = i && i.clamp;
		if (a && (a.x = a.y = a.width = a.height = NaN), !t || !n) return !1;
		t instanceof e || (t = wr(Dr, t.x, t.y, t.width, t.height)), n instanceof e || (n = wr(Or, n.x, n.y, n.width, n.height));
		var s = !!r;
		br.reset(i, s);
		var c = br.touchThreshold, l = t.x + c, u = t.x + t.width - c, d = t.y + c, f = t.y + t.height - c, p = n.x + c, m = n.x + n.width - c, h = n.y + c, g = n.y + n.height - c;
		if (l > u || d > f || p > m || h > g) return !1;
		var _ = !(u < p || m < l || f < h || g < d);
		return (s || a) && (Cr[0] = Infinity, Cr[1] = 0, Ar(l, u, p, m, 0, s, a, o), Ar(d, f, h, g, 1, s, a, o), s && ur.copy(r, _ ? br.useDir ? br.dirMinTv : xr : Sr)), _;
	}, e.contain = function(e, t, n) {
		return t >= e.x && t <= e.x + e.width && n >= e.y && n <= e.y + e.height;
	}, e.prototype.contain = function(t, n) {
		return e.contain(this, t, n);
	}, e.prototype.clone = function() {
		return new e(this.x, this.y, this.width, this.height);
	}, e.prototype.copy = function(e) {
		Tr(this, e);
	}, e.prototype.plain = function() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		};
	}, e.prototype.isFinite = function() {
		return isFinite(this.x) && isFinite(this.y) && isFinite(this.width) && isFinite(this.height);
	}, e.prototype.isZero = function() {
		return this.width === 0 || this.height === 0;
	}, e.create = function(t) {
		return new e(t ? t.x : 0, t ? t.y : 0, t ? t.width : 0, t ? t.height : 0);
	}, e.copy = function(e, t) {
		return e.x = t.x, e.y = t.y, e.width = t.width, e.height = t.height, e;
	}, e.applyTransform = function(e, t, n) {
		if (!n) {
			e !== t && Tr(e, t);
			return;
		}
		if (n[1] < 1e-5 && n[1] > -1e-5 && n[2] < 1e-5 && n[2] > -1e-5) {
			var r = n[0], i = n[3], a = n[4], o = n[5];
			e.x = t.x * r + a, e.y = t.y * i + o, e.width = t.width * r, e.height = t.height * i, e.width < 0 && (e.x += e.width, e.width = -e.width), e.height < 0 && (e.y += e.height, e.height = -e.height);
			return;
		}
		gr.x = vr.x = t.x, gr.y = yr.y = t.y, _r.x = yr.x = t.x + t.width, _r.y = vr.y = t.y + t.height, gr.transform(n), yr.transform(n), _r.transform(n), vr.transform(n), e.x = dr(gr.x, _r.x, vr.x, yr.x), e.y = dr(gr.y, _r.y, vr.y, yr.y);
		var s = fr(gr.x, _r.x, vr.x, yr.x), c = fr(gr.y, _r.y, vr.y, yr.y);
		e.width = s - e.x, e.height = c - e.y;
	}, e.calculateTransform = function(e, t, n) {
		var r = n.width / t.width, i = n.height / t.height;
		return e = Vn(e || []), Wn(e, e, Xn(kr, -t.x, -t.y)), Kn(e, e, Xn(kr, r, i)), Wn(e, e, Xn(kr, n.x, n.y)), e;
	}, e;
}();
X.create;
var wr = X.set, Tr = X.copy, Er = X.calculateTransform;
X.applyTransform, X.contain;
var Dr = new X(0, 0, 0, 0), Or = new X(0, 0, 0, 0), kr = [];
function Ar(e, t, n, r, i, a, o, s) {
	var c = pr(t - n), l = pr(r - e), u = dr(c, l), d = mr[i], f = mr[1 - i], p = hr[i];
	t < n || r < e ? c < l ? (a && (Sr[d] = -c), s && (o[d] = t, o[p] = 0)) : (a && (Sr[d] = l), s && (o[d] = e, o[p] = 0)) : (o && (o[d] = fr(e, n), o[p] = dr(t, r) - o[d]), a && (u < Cr[0] || br.useDir) && (Cr[0] = dr(u, Cr[0]), (c < l || !br.bidirectional) && (xr[d] = c, xr[f] = 0, br.useDir && br.calcDirMTV()), (c >= l || !br.bidirectional) && (xr[d] = -l, xr[f] = 0, br.useDir && br.calcDirMTV())));
}
function jr() {
	var e = 0, t = new ur(), n = new ur(), r = {
		minTv: new ur(),
		maxTv: new ur(),
		useDir: !1,
		dirMinTv: new ur(),
		touchThreshold: 0,
		bidirectional: !0,
		negativeSize: !1,
		reset: function(i, a) {
			r.touchThreshold = 0, i && i.touchThreshold != null && (r.touchThreshold = fr(0, i.touchThreshold)), r.negativeSize = !1, a && (r.minTv.set(Infinity, Infinity), r.maxTv.set(0, 0), r.useDir = !1, i && i.direction != null && (r.useDir = !0, r.dirMinTv.copy(r.minTv), n.copy(r.minTv), e = i.direction, r.bidirectional = i.bidirectional == null || !!i.bidirectional, r.bidirectional || t.set(Math.cos(e), Math.sin(e))));
		},
		calcDirMTV: function() {
			var a = r.minTv, o = r.dirMinTv, s = a.y * a.y + a.x * a.x, c = Math.sin(e), l = Math.cos(e), u = c * a.y + l * a.x;
			if (i(u)) {
				i(a.x) && i(a.y) && o.set(0, 0);
				return;
			}
			if (n.x = s * l / u, n.y = s * c / u, i(n.x) && i(n.y)) {
				o.set(0, 0);
				return;
			}
			(r.bidirectional || t.dot(n) > 0) && n.len() < o.len() && o.copy(n);
		}
	};
	function i(e) {
		return pr(e) < 1e-10;
	}
	return r;
}
//#endregion
//#region node_modules/zrender/lib/contain/text.js
function Mr(e) {
	Nr ||= new Pn(100), e ||= "12px sans-serif";
	var t = Nr.get(e);
	return t || (t = {
		font: e,
		strWidthCache: new Pn(500),
		asciiWidthMap: null,
		asciiWidthMapTried: !1,
		stWideCharWidth: ft.measureText("国", e).width,
		asciiCharWidth: ft.measureText("a", e).width
	}, Nr.put(e, t)), t;
}
var Nr;
function Pr(e) {
	if (!(Fr >= Ir)) {
		e ||= "12px sans-serif";
		for (var t = [], n = +/* @__PURE__ */ new Date(), r = 0; r <= 127; r++) t[r] = ft.measureText(String.fromCharCode(r), e).width;
		var i = +/* @__PURE__ */ new Date() - n;
		return i > 16 ? Fr = Ir : i > 2 && Fr++, t;
	}
}
var Fr = 0, Ir = 5;
function Lr(e, t) {
	return e.asciiWidthMapTried ||= (e.asciiWidthMap = Pr(e.font), !0), 0 <= t && t <= 127 ? e.asciiWidthMap == null ? e.asciiCharWidth : e.asciiWidthMap[t] : e.stWideCharWidth;
}
function Rr(e, t) {
	var n = e.strWidthCache, r = n.get(t);
	return r ?? (r = ft.measureText(t, e.font).width, n.put(t, r)), r;
}
function zr(e, t, n, r) {
	var i = Rr(Mr(t), e), a = Ur(t);
	return new X(Vr(0, i, n), Hr(0, a, r), i, a);
}
function Br(e, t, n, r) {
	var i = ((e || "") + "").split("\n");
	if (i.length === 1) return zr(i[0], t, n, r);
	for (var a = new X(0, 0, 0, 0), o = 0; o < i.length; o++) {
		var s = zr(i[o], t, n, r);
		o === 0 ? a.copy(s) : a.union(s);
	}
	return a;
}
function Vr(e, t, n, r) {
	return n === "right" ? r ? e += t : e -= t : n === "center" && (r ? e += t / 2 : e -= t / 2), e;
}
function Hr(e, t, n, r) {
	return n === "middle" ? r ? e += t / 2 : e -= t / 2 : n === "bottom" && (r ? e += t : e -= t), e;
}
function Ur(e) {
	return Mr(e).stWideCharWidth;
}
function Wr(e, t) {
	return typeof e == "string" ? e.lastIndexOf("%") >= 0 ? parseFloat(e) / 100 * t : parseFloat(e) : e;
}
function Gr(e, t, n) {
	var r = t.position || "inside", i = t.distance == null ? 5 : t.distance, a = n.height, o = n.width, s = a / 2, c = n.x, l = n.y, u = "left", d = "top";
	if (r instanceof Array) c += Wr(r[0], n.width), l += Wr(r[1], n.height), u = null, d = null;
	else switch (r) {
		case "left":
			c -= i, l += s, u = "right", d = "middle";
			break;
		case "right":
			c += i + o, l += s, d = "middle";
			break;
		case "top":
			c += o / 2, l -= i, u = "center", d = "bottom";
			break;
		case "bottom":
			c += o / 2, l += a + i, u = "center";
			break;
		case "inside":
			c += o / 2, l += s, u = "center", d = "middle";
			break;
		case "insideLeft":
			c += i, l += s, d = "middle";
			break;
		case "insideRight":
			c += o - i, l += s, u = "right", d = "middle";
			break;
		case "insideTop":
			c += o / 2, l += i, u = "center";
			break;
		case "insideBottom":
			c += o / 2, l += a - i, u = "center", d = "bottom";
			break;
		case "insideTopLeft":
			c += i, l += i;
			break;
		case "insideTopRight":
			c += o - i, l += i, u = "right";
			break;
		case "insideBottomLeft":
			c += i, l += a - i, d = "bottom";
			break;
		case "insideBottomRight":
			c += o - i, l += a - i, u = "right", d = "bottom";
			break;
	}
	return e ||= {}, e.x = c, e.y = l, e.align = u, e.verticalAlign = d, e;
}
//#endregion
//#region node_modules/zrender/lib/graphic/helper/parseText.js
var Kr = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
function qr(e, t, n, r, i, a) {
	if (!n) {
		e.text = "", e.isTruncated = !1;
		return;
	}
	var o = (t + "").split("\n");
	a = Jr(n, r, i, a);
	for (var s = !1, c = {}, l = 0, u = o.length; l < u; l++) Yr(c, o[l], a), o[l] = c.textLine, s ||= c.isTruncated;
	e.text = o.join("\n"), e.isTruncated = s;
}
function Jr(e, t, n, r) {
	r ||= {};
	var i = R({}, r);
	n = K(n, "..."), i.maxIterations = K(r.maxIterations, 2);
	var a = i.minChar = K(r.minChar, 0), o = i.fontMeasureInfo = Mr(t), s = o.asciiCharWidth;
	i.placeholder = K(r.placeholder, "");
	for (var c = e = Math.max(0, e - 1), l = 0; l < a && c >= s; l++) c -= s;
	var u = Rr(o, n);
	return u > c && (n = "", u = 0), c = e - u, i.ellipsis = n, i.ellipsisWidth = u, i.contentWidth = c, i.containerWidth = e, i;
}
function Yr(e, t, n) {
	var r = n.containerWidth, i = n.contentWidth, a = n.fontMeasureInfo;
	if (!r) {
		e.textLine = "", e.isTruncated = !1;
		return;
	}
	var o = Rr(a, t);
	if (o <= r) {
		e.textLine = t, e.isTruncated = !1;
		return;
	}
	for (var s = 0;; s++) {
		if (o <= i || s >= n.maxIterations) {
			t += n.ellipsis;
			break;
		}
		var c = s === 0 ? Xr(t, i, a) : o > 0 ? Math.floor(t.length * i / o) : 0;
		t = t.substr(0, c), o = Rr(a, t);
	}
	t === "" && (t = n.placeholder), e.textLine = t, e.isTruncated = !0;
}
function Xr(e, t, n) {
	for (var r = 0, i = 0, a = e.length; i < a && r < t; i++) r += Lr(n, e.charCodeAt(i));
	return i;
}
function Zr(e, t, n, r) {
	var i = ui(e), a = t.overflow, o = t.padding, s = o ? o[1] + o[3] : 0, c = o ? o[0] + o[2] : 0, l = t.font, u = a === "truncate", d = Ur(l), f = K(t.lineHeight, d), p = t.lineOverflow === "truncate", m = !1, h = t.width;
	h == null && n != null && (h = n - s);
	var g = t.height;
	g == null && r != null && (g = r - c);
	var _ = h != null && (a === "break" || a === "breakAll") ? i ? oi(i, t.font, h, a === "breakAll", 0).lines : [] : i ? i.split("\n") : [], v = _.length * f;
	if (g ??= v, v > g && p) {
		var y = Math.floor(g / f);
		m ||= _.length > y, _ = _.slice(0, y), v = _.length * f;
	}
	if (i && u && h != null) for (var b = Jr(h, l, t.ellipsis, {
		minChar: t.truncateMinChar,
		placeholder: t.placeholder
	}), x = {}, S = 0; S < _.length; S++) Yr(x, _[S], b), _[S] = x.textLine, m ||= x.isTruncated;
	for (var C = g, w = 0, T = Mr(l), S = 0; S < _.length; S++) w = Math.max(Rr(T, _[S]), w);
	h ??= w;
	var E = h;
	return C += c, E += s, {
		lines: _,
		height: g,
		outerWidth: E,
		outerHeight: C,
		lineHeight: f,
		calculatedLineHeight: d,
		contentWidth: w,
		contentHeight: v,
		width: h,
		isTruncated: m
	};
}
var Qr = function() {
	function e() {}
	return e;
}(), $r = function() {
	function e(e) {
		this.tokens = [], e && (this.tokens = e);
	}
	return e;
}(), ei = function() {
	function e() {
		this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
	}
	return e;
}();
function ti(e, t, n, r, i) {
	var a = new ei(), o = ui(e);
	if (!o) return a;
	var s = t.padding, c = s ? s[1] + s[3] : 0, l = s ? s[0] + s[2] : 0, u = t.width;
	u == null && n != null && (u = n - c);
	var d = t.height;
	d == null && r != null && (d = r - l);
	for (var f = t.overflow, p = (f === "break" || f === "breakAll") && u != null ? {
		width: u,
		accumWidth: 0,
		breakAll: f === "breakAll"
	} : null, m = Kr.lastIndex = 0, h; (h = Kr.exec(o)) != null;) {
		var g = h.index;
		g > m && ni(a, o.substring(m, g), t, p), ni(a, h[2], t, p, h[1]), m = Kr.lastIndex;
	}
	m < o.length && ni(a, o.substring(m, o.length), t, p);
	var _ = [], v = 0, y = 0, b = f === "truncate", x = t.lineOverflow === "truncate", S = {};
	function C(e, t, n) {
		e.width = t, e.lineHeight = n, v += n, y = Math.max(y, t);
	}
	outer: for (var w = 0; w < a.lines.length; w++) {
		for (var T = a.lines[w], E = 0, D = 0, O = 0; O < T.tokens.length; O++) {
			var k = T.tokens[O], A = k.styleName && t.rich[k.styleName] || {}, j = k.textPadding = A.padding, ee = j ? j[1] + j[3] : 0, te = k.font = A.font || t.font;
			k.contentHeight = Ur(te);
			var ne = K(A.height, k.contentHeight);
			if (k.innerHeight = ne, j && (ne += j[0] + j[2]), k.height = ne, k.lineHeight = Xt(A.lineHeight, t.lineHeight, ne), k.align = A && A.align || i, k.verticalAlign = A && A.verticalAlign || "middle", x && d != null && v + k.lineHeight > d) {
				var re = a.lines.length;
				O > 0 ? (T.tokens = T.tokens.slice(0, O), C(T, D, E), a.lines = a.lines.slice(0, w + 1)) : a.lines = a.lines.slice(0, w), a.isTruncated = a.isTruncated || a.lines.length < re;
				break outer;
			}
			var ie = A.width, ae = ie == null || ie === "auto";
			if (typeof ie == "string" && ie.charAt(ie.length - 1) === "%") k.percentWidth = ie, _.push(k), k.contentWidth = Rr(Mr(te), k.text);
			else {
				if (ae) {
					var oe = A.backgroundColor, se = oe && oe.image;
					se && (se = In(se), zn(se) && (k.width = Math.max(k.width, se.width * ne / se.height)));
				}
				var ce = b && u != null ? u - D : null;
				ce != null && ce < k.width ? !ae || ce < ee ? (k.text = "", k.width = k.contentWidth = 0) : (qr(S, k.text, ce - ee, te, t.ellipsis, { minChar: t.truncateMinChar }), k.text = S.text, a.isTruncated = a.isTruncated || S.isTruncated, k.width = k.contentWidth = Rr(Mr(te), k.text)) : k.contentWidth = Rr(Mr(te), k.text);
			}
			k.width += ee, D += k.width, A && (E = Math.max(E, k.lineHeight));
		}
		C(T, D, E);
	}
	a.outerWidth = a.width = K(u, y), a.outerHeight = a.height = K(d, v), a.contentHeight = v, a.contentWidth = y, a.outerWidth += c, a.outerHeight += l;
	for (var w = 0; w < _.length; w++) {
		var k = _[w], le = k.percentWidth;
		k.width = parseInt(le, 10) / 100 * a.width;
	}
	return a;
}
function ni(e, t, n, r, i) {
	var a = t === "", o = i && n.rich[i] || {}, s = e.lines, c = o.font || n.font, l = !1, u, d;
	if (r) {
		var f = o.padding, p = f ? f[1] + f[3] : 0;
		if (o.width != null && o.width !== "auto") {
			var m = Wr(o.width, r.width) + p;
			s.length > 0 && m + r.accumWidth > r.width && (u = t.split("\n"), l = !0), r.accumWidth = m;
		} else {
			var h = oi(t, c, r.width, r.breakAll, r.accumWidth);
			r.accumWidth = h.accumWidth + p, d = h.linesWidths, u = h.lines;
		}
	}
	u ||= t.split("\n");
	for (var g = Mr(c), _ = 0; _ < u.length; _++) {
		var v = u[_], y = new Qr();
		if (y.styleName = i, y.text = v, y.isLineHolder = !v && !a, typeof o.width == "number" ? y.width = o.width : y.width = d ? d[_] : Rr(g, v), !_ && !l) {
			var b = (s[s.length - 1] || (s[0] = new $r())).tokens, x = b.length;
			x === 1 && b[0].isLineHolder ? b[0] = y : (v || !x || a) && b.push(y);
		} else s.push(new $r([y]));
	}
}
function ri(e) {
	var t = e.charCodeAt(0);
	return t >= 32 && t <= 591 || t >= 880 && t <= 4351 || t >= 4608 && t <= 5119 || t >= 7680 && t <= 8303;
}
var ii = Ft(",&?/;] ".split(""), function(e, t) {
	return e[t] = !0, e;
}, {});
function ai(e) {
	return !ri(e) || !!ii[e];
}
function oi(e, t, n, r, i) {
	for (var a = [], o = [], s = "", c = "", l = 0, u = 0, d = Mr(t), f = 0; f < e.length; f++) {
		var p = e.charAt(f);
		if (p === "\n") {
			c && (s += c, u += l), a.push(s), o.push(u), s = "", c = "", l = 0, u = 0;
			continue;
		}
		var m = Lr(d, p.charCodeAt(0)), h = !r && !ai(p);
		if (a.length ? u + m > n : i + u + m > n) {
			u ? (s || c) && (h ? (s || (s = c, c = "", l = 0, u = l), a.push(s), o.push(u - l), c += p, l += m, s = "", u = l) : (c && (s += c, c = "", l = 0), a.push(s), o.push(u), s = p, u = m)) : h ? (a.push(c), o.push(l), c = p, l = m) : (a.push(p), o.push(m));
			continue;
		}
		u += m, h ? (c += p, l += m) : (c && (s += c, c = "", l = 0), s += p);
	}
	return c && (s += c), s && (a.push(s), o.push(u)), a.length === 1 && (u += i), {
		accumWidth: u,
		lines: a,
		linesWidths: o
	};
}
function si(e, t, n, r, i, a) {
	if (e.baseX = n, e.baseY = r, e.outerWidth = e.outerHeight = null, t) {
		var o = t.width * 2, s = t.height * 2;
		X.set(ci, Vr(n, o, i), Hr(r, s, a), o, s), X.intersect(t, ci, null, li);
		var c = li.outIntersectRect;
		e.outerWidth = c.width, e.outerHeight = c.height, e.baseX = Vr(c.x, c.width, i, !0), e.baseY = Hr(c.y, c.height, a, !0);
	}
}
var ci = new X(0, 0, 0, 0), li = {
	outIntersectRect: {},
	clamp: !0
};
function ui(e) {
	return e == null ? e = "" : e += "";
}
function di(e) {
	var t = ui(e.text), n = e.font;
	return fi(e, Rr(Mr(n), t), Ur(n), null);
}
function fi(e, t, n, r) {
	var i = new X(Vr(e.x || 0, t, e.textAlign), Hr(e.y || 0, n, e.textBaseline), t, n), a = r ?? (pi(e) ? e.lineWidth : 0);
	return a > 0 && (i.x -= a / 2, i.y -= a / 2, i.width += a, i.height += a), i;
}
function pi(e) {
	var t = e.stroke;
	return t != null && t !== "none" && e.lineWidth > 0;
}
//#endregion
//#region node_modules/zrender/lib/core/Transformable.js
var mi = Vn, hi = 5e-5;
function gi(e) {
	return e > hi || e < -hi;
}
var _i = [], vi = [], yi = Bn(), bi = Math.abs, xi = function() {
	function e() {}
	return e.prototype.getLocalTransform = function(e) {
		return Si(this, e);
	}, e.prototype.setPosition = function(e) {
		this.x = e[0], this.y = e[1];
	}, e.prototype.setScale = function(e) {
		this.scaleX = e[0], this.scaleY = e[1];
	}, e.prototype.setSkew = function(e) {
		this.skewX = e[0], this.skewY = e[1];
	}, e.prototype.setOrigin = function(e) {
		this.originX = e[0], this.originY = e[1];
	}, e.prototype.needLocalTransform = function() {
		return gi(this.rotation) || gi(this.x) || gi(this.y) || gi(this.scaleX - 1) || gi(this.scaleY - 1) || gi(this.skewX) || gi(this.skewY);
	}, e.prototype.updateTransform = function() {
		var e = this.parent && this.parent.transform, t = this.needLocalTransform(), n = this.transform;
		if (!(t || e)) {
			n && (mi(n), this.invTransform = null);
			return;
		}
		n ||= Bn(), t ? this.getLocalTransform(n) : mi(n), e && (t ? Un(n, e, n) : Hn(n, e)), this.transform = n, this._resolveGlobalScaleRatio(n), this.invTransform = this.invTransform || Bn(), qn(this.invTransform, n);
	}, e.prototype._resolveGlobalScaleRatio = function(e) {
		var t = this.globalScaleRatio;
		if (t != null && t !== 1) {
			this.getGlobalScale(_i);
			var n = _i[0] < 0 ? -1 : 1, r = _i[1] < 0 ? -1 : 1, i = ((_i[0] - n) * t + n) / _i[0] || 0, a = ((_i[1] - r) * t + r) / _i[1] || 0;
			e[0] *= i, e[1] *= i, e[2] *= a, e[3] *= a;
		}
	}, e.prototype.getComputedTransform = function() {
		for (var e = this, t = []; e;) t.push(e), e = e.parent;
		for (; e = t.pop();) e.updateTransform();
		return this.transform;
	}, e.prototype.setLocalTransform = function(e) {
		if (e) {
			var t = e[0] * e[0] + e[1] * e[1], n = e[2] * e[2] + e[3] * e[3], r = Math.atan2(e[1], e[0]), i = Math.PI / 2 + r - Math.atan2(e[3], e[2]);
			n = Math.sqrt(n) * Math.cos(i), t = Math.sqrt(t), this.skewX = i, this.skewY = 0, this.rotation = -r, this.x = +e[4], this.y = +e[5], this.scaleX = t, this.scaleY = n, this.originX = 0, this.originY = 0;
		}
	}, e.prototype.decomposeTransform = function() {
		if (this.transform) {
			var e = this.parent, t = this.transform;
			e && e.transform && (e.invTransform = e.invTransform || Bn(), Un(vi, e.invTransform, t), t = vi);
			var n = this.originX, r = this.originY;
			(n || r) && (yi[4] = n, yi[5] = r, Un(vi, t, yi), vi[4] -= n, vi[5] -= r, t = vi), this.setLocalTransform(t);
		}
	}, e.prototype.getGlobalScale = function(e) {
		var t = this.transform;
		return e ||= [], t ? (e[0] = Math.sqrt(t[0] * t[0] + t[1] * t[1]), e[1] = Math.sqrt(t[2] * t[2] + t[3] * t[3]), t[0] < 0 && (e[0] = -e[0]), t[3] < 0 && (e[1] = -e[1]), e) : (e[0] = 1, e[1] = 1, e);
	}, e.prototype.transformCoordToLocal = function(e, t) {
		var n = [e, t], r = this.invTransform;
		return r && sr(n, n, r), n;
	}, e.prototype.transformCoordToGlobal = function(e, t) {
		var n = [e, t], r = this.transform;
		return r && sr(n, n, r), n;
	}, e.prototype.getLineScale = function() {
		var e = this.transform;
		return e && bi(e[0] - 1) > 1e-10 && bi(e[3] - 1) > 1e-10 ? Math.sqrt(bi(e[0] * e[3] - e[2] * e[1])) : 1;
	}, e.prototype.copyTransform = function(e) {
		wi(this, e);
	}, e.getLocalTransform = function(e, t) {
		t ||= [];
		var n = e.originX || 0, r = e.originY || 0, i = e.scaleX, a = e.scaleY, o = e.anchorX, s = e.anchorY, c = e.rotation || 0, l = e.x, u = e.y, d = e.skewX ? Math.tan(e.skewX) : 0, f = e.skewY ? Math.tan(-e.skewY) : 0;
		if (n || r || o || s) {
			var p = n + o, m = r + s;
			t[4] = -p * i - d * m * a, t[5] = -m * a - f * p * i;
		} else t[4] = t[5] = 0;
		return t[0] = i, t[3] = a, t[1] = f * i, t[2] = d * a, c && Gn(t, t, c), t[4] += n + l, t[5] += r + u, t;
	}, e.initDefaultProps = (function() {
		var t = e.prototype;
		t.scaleX = t.scaleY = t.globalScaleRatio = 1, t.x = t.y = t.originX = t.originY = t.skewX = t.skewY = t.rotation = t.anchorX = t.anchorY = 0;
	})(), e;
}(), Si = xi.getLocalTransform, Ci = [
	"x",
	"y",
	"originX",
	"originY",
	"anchorX",
	"anchorY",
	"rotation",
	"scaleX",
	"scaleY",
	"skewX",
	"skewY"
];
function wi(e, t) {
	return kt(e, t, Ci);
}
//#endregion
//#region node_modules/zrender/lib/animation/easing.js
var Ti = {
	linear: function(e) {
		return e;
	},
	quadraticIn: function(e) {
		return e * e;
	},
	quadraticOut: function(e) {
		return e * (2 - e);
	},
	quadraticInOut: function(e) {
		return (e *= 2) < 1 ? .5 * e * e : -.5 * (--e * (e - 2) - 1);
	},
	cubicIn: function(e) {
		return e * e * e;
	},
	cubicOut: function(e) {
		return --e * e * e + 1;
	},
	cubicInOut: function(e) {
		return (e *= 2) < 1 ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2);
	},
	quarticIn: function(e) {
		return e * e * e * e;
	},
	quarticOut: function(e) {
		return 1 - --e * e * e * e;
	},
	quarticInOut: function(e) {
		return (e *= 2) < 1 ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2);
	},
	quinticIn: function(e) {
		return e * e * e * e * e;
	},
	quinticOut: function(e) {
		return --e * e * e * e * e + 1;
	},
	quinticInOut: function(e) {
		return (e *= 2) < 1 ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2);
	},
	sinusoidalIn: function(e) {
		return 1 - Math.cos(e * Math.PI / 2);
	},
	sinusoidalOut: function(e) {
		return Math.sin(e * Math.PI / 2);
	},
	sinusoidalInOut: function(e) {
		return .5 * (1 - Math.cos(Math.PI * e));
	},
	exponentialIn: function(e) {
		return e === 0 ? 0 : 1024 ** (e - 1);
	},
	exponentialOut: function(e) {
		return e === 1 ? 1 : 1 - 2 ** (-10 * e);
	},
	exponentialInOut: function(e) {
		return e === 0 ? 0 : e === 1 ? 1 : (e *= 2) < 1 ? .5 * 1024 ** (e - 1) : .5 * (-(2 ** (-10 * (e - 1))) + 2);
	},
	circularIn: function(e) {
		return 1 - Math.sqrt(1 - e * e);
	},
	circularOut: function(e) {
		return Math.sqrt(1 - --e * e);
	},
	circularInOut: function(e) {
		return (e *= 2) < 1 ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
	},
	elasticIn: function(e) {
		var t, n = .1, r = .4;
		return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), -(n * 2 ** (10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r)));
	},
	elasticOut: function(e) {
		var t, n = .1, r = .4;
		return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), n * 2 ** (-10 * e) * Math.sin((e - t) * (2 * Math.PI) / r) + 1);
	},
	elasticInOut: function(e) {
		var t, n = .1, r = .4;
		return e === 0 ? 0 : e === 1 ? 1 : (!n || n < 1 ? (n = 1, t = r / 4) : t = r * Math.asin(1 / n) / (2 * Math.PI), (e *= 2) < 1 ? -.5 * (n * 2 ** (10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r)) : n * 2 ** (-10 * --e) * Math.sin((e - t) * (2 * Math.PI) / r) * .5 + 1);
	},
	backIn: function(e) {
		var t = 1.70158;
		return e * e * ((t + 1) * e - t);
	},
	backOut: function(e) {
		var t = 1.70158;
		return --e * e * ((t + 1) * e + t) + 1;
	},
	backInOut: function(e) {
		var t = 1.70158 * 1.525;
		return (e *= 2) < 1 ? .5 * (e * e * ((t + 1) * e - t)) : .5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
	},
	bounceIn: function(e) {
		return 1 - Ti.bounceOut(1 - e);
	},
	bounceOut: function(e) {
		return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375;
	},
	bounceInOut: function(e) {
		return e < .5 ? Ti.bounceIn(e * 2) * .5 : Ti.bounceOut(e * 2 - 1) * .5 + .5;
	}
}, Ei = Math.pow, Di = Math.sqrt, Oi = 1e-8, ki = 1e-4, Ai = Di(3), ji = 1 / 3, Mi = Jn(), Ni = Jn(), Pi = Jn();
function Fi(e) {
	return e > -Oi && e < Oi;
}
function Ii(e) {
	return e > Oi || e < -Oi;
}
function Li(e, t, n, r, i) {
	var a = 1 - i;
	return a * a * (a * e + 3 * i * t) + i * i * (i * r + 3 * a * n);
}
function Ri(e, t, n, r, i) {
	var a = 1 - i;
	return 3 * (((t - e) * a + 2 * (n - t) * i) * a + (r - n) * i * i);
}
function zi(e, t, n, r, i, a) {
	var o = r + 3 * (t - n) - e, s = 3 * (n - t * 2 + e), c = 3 * (t - e), l = e - i, u = s * s - 3 * o * c, d = s * c - 9 * o * l, f = c * c - 3 * s * l, p = 0;
	if (Fi(u) && Fi(d)) if (Fi(s)) a[0] = 0;
	else {
		var m = -c / s;
		m >= 0 && m <= 1 && (a[p++] = m);
	}
	else {
		var h = d * d - 4 * u * f;
		if (Fi(h)) {
			var g = d / u, m = -s / o + g, _ = -g / 2;
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _);
		} else if (h > 0) {
			var v = Di(h), y = u * s + 1.5 * o * (-d + v), b = u * s + 1.5 * o * (-d - v);
			y = y < 0 ? -Ei(-y, ji) : Ei(y, ji), b = b < 0 ? -Ei(-b, ji) : Ei(b, ji);
			var m = (-s - (y + b)) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m);
		} else {
			var x = (2 * u * s - 3 * o * d) / (2 * Di(u * u * u)), S = Math.acos(x) / 3, C = Di(u), w = Math.cos(S), m = (-s - 2 * C * w) / (3 * o), _ = (-s + C * (w + Ai * Math.sin(S))) / (3 * o), T = (-s + C * (w - Ai * Math.sin(S))) / (3 * o);
			m >= 0 && m <= 1 && (a[p++] = m), _ >= 0 && _ <= 1 && (a[p++] = _), T >= 0 && T <= 1 && (a[p++] = T);
		}
	}
	return p;
}
function Bi(e, t, n, r, i) {
	var a = 6 * n - 12 * t + 6 * e, o = 9 * t + 3 * r - 3 * e - 9 * n, s = 3 * t - 3 * e, c = 0;
	if (Fi(o)) {
		if (Ii(a)) {
			var l = -s / a;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = a * a - 4 * o * s;
		if (Fi(u)) i[0] = -a / (2 * o);
		else if (u > 0) {
			var d = Di(u), l = (-a + d) / (2 * o), f = (-a - d) / (2 * o);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function Vi(e, t, n, r, i, a) {
	var o = (t - e) * i + e, s = (n - t) * i + t, c = (r - n) * i + n, l = (s - o) * i + o, u = (c - s) * i + s, d = (u - l) * i + l;
	a[0] = e, a[1] = o, a[2] = l, a[3] = d, a[4] = d, a[5] = u, a[6] = c, a[7] = r;
}
function Hi(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f = .005, p = Infinity, m, h, g, _;
	Mi[0] = c, Mi[1] = l;
	for (var v = 0; v < 1; v += .05) Ni[0] = Li(e, n, i, o, v), Ni[1] = Li(t, r, a, s, v), g = or(Mi, Ni), g < p && (d = v, p = g);
	p = Infinity;
	for (var y = 0; y < 32 && !(f < ki); y++) m = d - f, h = d + f, Ni[0] = Li(e, n, i, o, m), Ni[1] = Li(t, r, a, s, m), g = or(Ni, Mi), m >= 0 && g < p ? (d = m, p = g) : (Pi[0] = Li(e, n, i, o, h), Pi[1] = Li(t, r, a, s, h), _ = or(Pi, Mi), h <= 1 && _ < p ? (d = h, p = _) : f *= .5);
	return u && (u[0] = Li(e, n, i, o, d), u[1] = Li(t, r, a, s, d)), Di(p);
}
function Ui(e, t, n, r, i, a, o, s, c) {
	for (var l = e, u = t, d = 0, f = 1 / c, p = 1; p <= c; p++) {
		var m = p * f, h = Li(e, n, i, o, m), g = Li(t, r, a, s, m), _ = h - l, v = g - u;
		d += Math.sqrt(_ * _ + v * v), l = h, u = g;
	}
	return d;
}
function Wi(e, t, n, r) {
	var i = 1 - r;
	return i * (i * e + 2 * r * t) + r * r * n;
}
function Gi(e, t, n, r) {
	return 2 * ((1 - r) * (t - e) + r * (n - t));
}
function Ki(e, t, n, r, i) {
	var a = e - 2 * t + n, o = 2 * (t - e), s = e - r, c = 0;
	if (Fi(a)) {
		if (Ii(o)) {
			var l = -s / o;
			l >= 0 && l <= 1 && (i[c++] = l);
		}
	} else {
		var u = o * o - 4 * a * s;
		if (Fi(u)) {
			var l = -o / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l);
		} else if (u > 0) {
			var d = Di(u), l = (-o + d) / (2 * a), f = (-o - d) / (2 * a);
			l >= 0 && l <= 1 && (i[c++] = l), f >= 0 && f <= 1 && (i[c++] = f);
		}
	}
	return c;
}
function qi(e, t, n) {
	var r = e + n - 2 * t;
	return r === 0 ? .5 : (e - t) / r;
}
function Ji(e, t, n, r, i) {
	var a = (t - e) * r + e, o = (n - t) * r + t, s = (o - a) * r + a;
	i[0] = e, i[1] = a, i[2] = s, i[3] = s, i[4] = o, i[5] = n;
}
function Yi(e, t, n, r, i, a, o, s, c) {
	var l, u = .005, d = Infinity;
	Mi[0] = o, Mi[1] = s;
	for (var f = 0; f < 1; f += .05) {
		Ni[0] = Wi(e, n, i, f), Ni[1] = Wi(t, r, a, f);
		var p = or(Mi, Ni);
		p < d && (l = f, d = p);
	}
	d = Infinity;
	for (var m = 0; m < 32 && !(u < ki); m++) {
		var h = l - u, g = l + u;
		Ni[0] = Wi(e, n, i, h), Ni[1] = Wi(t, r, a, h);
		var p = or(Ni, Mi);
		if (h >= 0 && p < d) l = h, d = p;
		else {
			Pi[0] = Wi(e, n, i, g), Pi[1] = Wi(t, r, a, g);
			var _ = or(Pi, Mi);
			g <= 1 && _ < d ? (l = g, d = _) : u *= .5;
		}
	}
	return c && (c[0] = Wi(e, n, i, l), c[1] = Wi(t, r, a, l)), Di(d);
}
function Xi(e, t, n, r, i, a, o) {
	for (var s = e, c = t, l = 0, u = 1 / o, d = 1; d <= o; d++) {
		var f = d * u, p = Wi(e, n, i, f), m = Wi(t, r, a, f), h = p - s, g = m - c;
		l += Math.sqrt(h * h + g * g), s = p, c = m;
	}
	return l;
}
//#endregion
//#region node_modules/zrender/lib/animation/cubicEasing.js
var Zi = /cubic-bezier\(([0-9,\.e ]+)\)/;
function Qi(e) {
	var t = e && Zi.exec(e);
	if (t) {
		var n = t[1].split(","), r = +$t(n[0]), i = +$t(n[1]), a = +$t(n[2]), o = +$t(n[3]);
		if (isNaN(r + i + a + o)) return;
		var s = [];
		return function(e) {
			return e <= 0 ? 0 : e >= 1 ? 1 : zi(0, r, a, 1, e, s) && Li(0, i, o, 1, s[0]);
		};
	}
}
//#endregion
//#region node_modules/zrender/lib/animation/Clip.js
var $i = function() {
	function e(e) {
		this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = e.life || 1e3, this._delay = e.delay || 0, this.loop = e.loop || !1, this.onframe = e.onframe || dn, this.ondestroy = e.ondestroy || dn, this.onrestart = e.onrestart || dn, e.easing && this.setEasing(e.easing);
	}
	return e.prototype.step = function(e, t) {
		if (this._inited ||= (this._startTime = e + this._delay, !0), this._paused) {
			this._pausedTime += t;
			return;
		}
		var n = this._life, r = e - this._startTime - this._pausedTime, i = r / n;
		i < 0 && (i = 0), i = Math.min(i, 1);
		var a = this.easingFunc, o = a ? a(i) : i;
		if (this.onframe(o), i === 1) if (this.loop) {
			var s = r % n;
			this._startTime = e - s, this._pausedTime = 0, this.onrestart();
		} else return !0;
		return !1;
	}, e.prototype.pause = function() {
		this._paused = !0;
	}, e.prototype.resume = function() {
		this._paused = !1;
	}, e.prototype.setEasing = function(e) {
		this.easing = e, this.easingFunc = U(e) ? e : Ti[e] || Qi(e);
	}, e;
}(), ea = {
	transparent: [
		0,
		0,
		0,
		0
	],
	aliceblue: [
		240,
		248,
		255,
		1
	],
	antiquewhite: [
		250,
		235,
		215,
		1
	],
	aqua: [
		0,
		255,
		255,
		1
	],
	aquamarine: [
		127,
		255,
		212,
		1
	],
	azure: [
		240,
		255,
		255,
		1
	],
	beige: [
		245,
		245,
		220,
		1
	],
	bisque: [
		255,
		228,
		196,
		1
	],
	black: [
		0,
		0,
		0,
		1
	],
	blanchedalmond: [
		255,
		235,
		205,
		1
	],
	blue: [
		0,
		0,
		255,
		1
	],
	blueviolet: [
		138,
		43,
		226,
		1
	],
	brown: [
		165,
		42,
		42,
		1
	],
	burlywood: [
		222,
		184,
		135,
		1
	],
	cadetblue: [
		95,
		158,
		160,
		1
	],
	chartreuse: [
		127,
		255,
		0,
		1
	],
	chocolate: [
		210,
		105,
		30,
		1
	],
	coral: [
		255,
		127,
		80,
		1
	],
	cornflowerblue: [
		100,
		149,
		237,
		1
	],
	cornsilk: [
		255,
		248,
		220,
		1
	],
	crimson: [
		220,
		20,
		60,
		1
	],
	cyan: [
		0,
		255,
		255,
		1
	],
	darkblue: [
		0,
		0,
		139,
		1
	],
	darkcyan: [
		0,
		139,
		139,
		1
	],
	darkgoldenrod: [
		184,
		134,
		11,
		1
	],
	darkgray: [
		169,
		169,
		169,
		1
	],
	darkgreen: [
		0,
		100,
		0,
		1
	],
	darkgrey: [
		169,
		169,
		169,
		1
	],
	darkkhaki: [
		189,
		183,
		107,
		1
	],
	darkmagenta: [
		139,
		0,
		139,
		1
	],
	darkolivegreen: [
		85,
		107,
		47,
		1
	],
	darkorange: [
		255,
		140,
		0,
		1
	],
	darkorchid: [
		153,
		50,
		204,
		1
	],
	darkred: [
		139,
		0,
		0,
		1
	],
	darksalmon: [
		233,
		150,
		122,
		1
	],
	darkseagreen: [
		143,
		188,
		143,
		1
	],
	darkslateblue: [
		72,
		61,
		139,
		1
	],
	darkslategray: [
		47,
		79,
		79,
		1
	],
	darkslategrey: [
		47,
		79,
		79,
		1
	],
	darkturquoise: [
		0,
		206,
		209,
		1
	],
	darkviolet: [
		148,
		0,
		211,
		1
	],
	deeppink: [
		255,
		20,
		147,
		1
	],
	deepskyblue: [
		0,
		191,
		255,
		1
	],
	dimgray: [
		105,
		105,
		105,
		1
	],
	dimgrey: [
		105,
		105,
		105,
		1
	],
	dodgerblue: [
		30,
		144,
		255,
		1
	],
	firebrick: [
		178,
		34,
		34,
		1
	],
	floralwhite: [
		255,
		250,
		240,
		1
	],
	forestgreen: [
		34,
		139,
		34,
		1
	],
	fuchsia: [
		255,
		0,
		255,
		1
	],
	gainsboro: [
		220,
		220,
		220,
		1
	],
	ghostwhite: [
		248,
		248,
		255,
		1
	],
	gold: [
		255,
		215,
		0,
		1
	],
	goldenrod: [
		218,
		165,
		32,
		1
	],
	gray: [
		128,
		128,
		128,
		1
	],
	green: [
		0,
		128,
		0,
		1
	],
	greenyellow: [
		173,
		255,
		47,
		1
	],
	grey: [
		128,
		128,
		128,
		1
	],
	honeydew: [
		240,
		255,
		240,
		1
	],
	hotpink: [
		255,
		105,
		180,
		1
	],
	indianred: [
		205,
		92,
		92,
		1
	],
	indigo: [
		75,
		0,
		130,
		1
	],
	ivory: [
		255,
		255,
		240,
		1
	],
	khaki: [
		240,
		230,
		140,
		1
	],
	lavender: [
		230,
		230,
		250,
		1
	],
	lavenderblush: [
		255,
		240,
		245,
		1
	],
	lawngreen: [
		124,
		252,
		0,
		1
	],
	lemonchiffon: [
		255,
		250,
		205,
		1
	],
	lightblue: [
		173,
		216,
		230,
		1
	],
	lightcoral: [
		240,
		128,
		128,
		1
	],
	lightcyan: [
		224,
		255,
		255,
		1
	],
	lightgoldenrodyellow: [
		250,
		250,
		210,
		1
	],
	lightgray: [
		211,
		211,
		211,
		1
	],
	lightgreen: [
		144,
		238,
		144,
		1
	],
	lightgrey: [
		211,
		211,
		211,
		1
	],
	lightpink: [
		255,
		182,
		193,
		1
	],
	lightsalmon: [
		255,
		160,
		122,
		1
	],
	lightseagreen: [
		32,
		178,
		170,
		1
	],
	lightskyblue: [
		135,
		206,
		250,
		1
	],
	lightslategray: [
		119,
		136,
		153,
		1
	],
	lightslategrey: [
		119,
		136,
		153,
		1
	],
	lightsteelblue: [
		176,
		196,
		222,
		1
	],
	lightyellow: [
		255,
		255,
		224,
		1
	],
	lime: [
		0,
		255,
		0,
		1
	],
	limegreen: [
		50,
		205,
		50,
		1
	],
	linen: [
		250,
		240,
		230,
		1
	],
	magenta: [
		255,
		0,
		255,
		1
	],
	maroon: [
		128,
		0,
		0,
		1
	],
	mediumaquamarine: [
		102,
		205,
		170,
		1
	],
	mediumblue: [
		0,
		0,
		205,
		1
	],
	mediumorchid: [
		186,
		85,
		211,
		1
	],
	mediumpurple: [
		147,
		112,
		219,
		1
	],
	mediumseagreen: [
		60,
		179,
		113,
		1
	],
	mediumslateblue: [
		123,
		104,
		238,
		1
	],
	mediumspringgreen: [
		0,
		250,
		154,
		1
	],
	mediumturquoise: [
		72,
		209,
		204,
		1
	],
	mediumvioletred: [
		199,
		21,
		133,
		1
	],
	midnightblue: [
		25,
		25,
		112,
		1
	],
	mintcream: [
		245,
		255,
		250,
		1
	],
	mistyrose: [
		255,
		228,
		225,
		1
	],
	moccasin: [
		255,
		228,
		181,
		1
	],
	navajowhite: [
		255,
		222,
		173,
		1
	],
	navy: [
		0,
		0,
		128,
		1
	],
	oldlace: [
		253,
		245,
		230,
		1
	],
	olive: [
		128,
		128,
		0,
		1
	],
	olivedrab: [
		107,
		142,
		35,
		1
	],
	orange: [
		255,
		165,
		0,
		1
	],
	orangered: [
		255,
		69,
		0,
		1
	],
	orchid: [
		218,
		112,
		214,
		1
	],
	palegoldenrod: [
		238,
		232,
		170,
		1
	],
	palegreen: [
		152,
		251,
		152,
		1
	],
	paleturquoise: [
		175,
		238,
		238,
		1
	],
	palevioletred: [
		219,
		112,
		147,
		1
	],
	papayawhip: [
		255,
		239,
		213,
		1
	],
	peachpuff: [
		255,
		218,
		185,
		1
	],
	peru: [
		205,
		133,
		63,
		1
	],
	pink: [
		255,
		192,
		203,
		1
	],
	plum: [
		221,
		160,
		221,
		1
	],
	powderblue: [
		176,
		224,
		230,
		1
	],
	purple: [
		128,
		0,
		128,
		1
	],
	red: [
		255,
		0,
		0,
		1
	],
	rosybrown: [
		188,
		143,
		143,
		1
	],
	royalblue: [
		65,
		105,
		225,
		1
	],
	saddlebrown: [
		139,
		69,
		19,
		1
	],
	salmon: [
		250,
		128,
		114,
		1
	],
	sandybrown: [
		244,
		164,
		96,
		1
	],
	seagreen: [
		46,
		139,
		87,
		1
	],
	seashell: [
		255,
		245,
		238,
		1
	],
	sienna: [
		160,
		82,
		45,
		1
	],
	silver: [
		192,
		192,
		192,
		1
	],
	skyblue: [
		135,
		206,
		235,
		1
	],
	slateblue: [
		106,
		90,
		205,
		1
	],
	slategray: [
		112,
		128,
		144,
		1
	],
	slategrey: [
		112,
		128,
		144,
		1
	],
	snow: [
		255,
		250,
		250,
		1
	],
	springgreen: [
		0,
		255,
		127,
		1
	],
	steelblue: [
		70,
		130,
		180,
		1
	],
	tan: [
		210,
		180,
		140,
		1
	],
	teal: [
		0,
		128,
		128,
		1
	],
	thistle: [
		216,
		191,
		216,
		1
	],
	tomato: [
		255,
		99,
		71,
		1
	],
	turquoise: [
		64,
		224,
		208,
		1
	],
	violet: [
		238,
		130,
		238,
		1
	],
	wheat: [
		245,
		222,
		179,
		1
	],
	white: [
		255,
		255,
		255,
		1
	],
	whitesmoke: [
		245,
		245,
		245,
		1
	],
	yellow: [
		255,
		255,
		0,
		1
	],
	yellowgreen: [
		154,
		205,
		50,
		1
	]
};
function ta(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 255 ? 255 : e;
}
function na(e) {
	return e = Math.round(e), e < 0 ? 0 : e > 360 ? 360 : e;
}
function ra(e) {
	return e < 0 ? 0 : e > 1 ? 1 : e;
}
function ia(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? ta(parseFloat(t) / 100 * 255) : ta(parseInt(t, 10));
}
function aa(e) {
	var t = e;
	return t.length && t.charAt(t.length - 1) === "%" ? ra(parseFloat(t) / 100) : ra(parseFloat(t));
}
function oa(e, t, n) {
	return n < 0 ? n += 1 : n > 1 && --n, n * 6 < 1 ? e + (t - e) * n * 6 : n * 2 < 1 ? t : n * 3 < 2 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function sa(e, t, n, r, i) {
	return e[0] = t, e[1] = n, e[2] = r, e[3] = i, e;
}
function ca(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e;
}
var la = new Pn(20), ua = null;
function da(e, t) {
	ua && ca(ua, t), ua = la.put(e, ua || t.slice());
}
function fa(e, t) {
	if (e) {
		t ||= [];
		var n = la.get(e);
		if (n) return ca(t, n);
		e += "";
		var r = e.replace(/ /g, "").toLowerCase();
		if (r in ea) return ca(t, ea[r]), da(e, t), t;
		var i = r.length;
		if (r.charAt(0) === "#") {
			if (i === 4 || i === 5) {
				var a = parseInt(r.slice(1, 4), 16);
				if (!(a >= 0 && a <= 4095)) {
					sa(t, 0, 0, 0, 1);
					return;
				}
				return sa(t, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, i === 5 ? parseInt(r.slice(4), 16) / 15 : 1), da(e, t), t;
			} else if (i === 7 || i === 9) {
				var a = parseInt(r.slice(1, 7), 16);
				if (!(a >= 0 && a <= 16777215)) {
					sa(t, 0, 0, 0, 1);
					return;
				}
				return sa(t, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, i === 9 ? parseInt(r.slice(7), 16) / 255 : 1), da(e, t), t;
			}
			return;
		}
		var o = r.indexOf("("), s = r.indexOf(")");
		if (o !== -1 && s + 1 === i) {
			var c = r.substr(0, o), l = r.substr(o + 1, s - (o + 1)).split(","), u = 1;
			switch (c) {
				case "rgba":
					if (l.length !== 4) return l.length === 3 ? sa(t, +l[0], +l[1], +l[2], 1) : sa(t, 0, 0, 0, 1);
					u = aa(l.pop());
				case "rgb":
					if (l.length >= 3) return sa(t, ia(l[0]), ia(l[1]), ia(l[2]), l.length === 3 ? u : aa(l[3])), da(e, t), t;
					sa(t, 0, 0, 0, 1);
					return;
				case "hsla":
					if (l.length !== 4) {
						sa(t, 0, 0, 0, 1);
						return;
					}
					return l[3] = aa(l[3]), pa(l, t), da(e, t), t;
				case "hsl":
					if (l.length !== 3) {
						sa(t, 0, 0, 0, 1);
						return;
					}
					return pa(l, t), da(e, t), t;
				default: return;
			}
		}
		sa(t, 0, 0, 0, 1);
	}
}
function pa(e, t) {
	var n = (parseFloat(e[0]) % 360 + 360) % 360 / 360, r = aa(e[1]), i = aa(e[2]), a = i <= .5 ? i * (r + 1) : i + r - i * r, o = i * 2 - a;
	return t ||= [], sa(t, ta(oa(o, a, n + 1 / 3) * 255), ta(oa(o, a, n) * 255), ta(oa(o, a, n - 1 / 3) * 255), 1), e.length === 4 && (t[3] = e[3]), t;
}
function ma(e) {
	if (e) {
		var t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = a - i, s = (a + i) / 2, c, l;
		if (o === 0) c = 0, l = 0;
		else {
			l = s < .5 ? o / (a + i) : o / (2 - a - i);
			var u = ((a - t) / 6 + o / 2) / o, d = ((a - n) / 6 + o / 2) / o, f = ((a - r) / 6 + o / 2) / o;
			t === a ? c = f - d : n === a ? c = 1 / 3 + u - f : r === a && (c = 2 / 3 + d - u), c < 0 && (c += 1), c > 1 && --c;
		}
		var p = [
			c * 360,
			l,
			s
		];
		return e[3] != null && p.push(e[3]), p;
	}
}
function ha(e, t) {
	var n = fa(e);
	if (n) {
		for (var r = 0; r < 3; r++) t < 0 ? n[r] = n[r] * (1 - t) | 0 : n[r] = (255 - n[r]) * t + n[r] | 0, n[r] > 255 ? n[r] = 255 : n[r] < 0 && (n[r] = 0);
		return _a(n, n.length === 4 ? "rgba" : "rgb");
	}
}
function ga(e, t, n, r) {
	var i = fa(e);
	if (e) return i = ma(i), t != null && (i[0] = na(U(t) ? t(i[0]) : t)), n != null && (i[1] = aa(U(n) ? n(i[1]) : n)), r != null && (i[2] = aa(U(r) ? r(i[2]) : r)), _a(pa(i), "rgba");
}
function _a(e, t) {
	if (!(!e || !e.length)) {
		var n = e[0] + "," + e[1] + "," + e[2];
		return (t === "rgba" || t === "hsva" || t === "hsla") && (n += "," + e[3]), t + "(" + n + ")";
	}
}
function va(e, t) {
	var n = fa(e);
	return n ? (.299 * n[0] + .587 * n[1] + .114 * n[2]) * n[3] / 255 + (1 - n[3]) * t : 0;
}
var ya = new Pn(100);
function ba(e) {
	if (W(e)) {
		var t = ya.get(e);
		return t || (t = ha(e, -.1), ya.put(e, t)), t;
	} else if (Kt(e)) {
		var n = R({}, e);
		return n.colorStops = B(e.colorStops, function(e) {
			return {
				offset: e.offset,
				color: ha(e.color, -.1)
			};
		}), n;
	}
	return e;
}
//#endregion
//#region node_modules/zrender/lib/svg/helper.js
var xa = Math.round;
function Sa(e) {
	var t;
	if (!e || e === "transparent") e = "none";
	else if (typeof e == "string" && e.indexOf("rgba") > -1) {
		var n = fa(e);
		n && (e = "rgb(" + n[0] + "," + n[1] + "," + n[2] + ")", t = n[3]);
	}
	return {
		color: e,
		opacity: t ?? 1
	};
}
var Ca = 1e-4;
function wa(e) {
	return e < Ca && e > -Ca;
}
function Ta(e) {
	return xa(e * 1e3) / 1e3;
}
function Ea(e) {
	return xa(e * 1e4) / 1e4;
}
function Da(e) {
	return "matrix(" + Ta(e[0]) + "," + Ta(e[1]) + "," + Ta(e[2]) + "," + Ta(e[3]) + "," + Ea(e[4]) + "," + Ea(e[5]) + ")";
}
var Oa = {
	left: "start",
	right: "end",
	center: "middle",
	middle: "middle"
};
function ka(e, t, n) {
	return n === "top" ? e += t / 2 : n === "bottom" && (e -= t / 2), e;
}
function Aa(e) {
	return e && (e.shadowBlur || e.shadowOffsetX || e.shadowOffsetY);
}
function ja(e) {
	var t = e.style, n = e.getGlobalScale();
	return [
		t.shadowColor,
		(t.shadowBlur || 0).toFixed(2),
		(t.shadowOffsetX || 0).toFixed(2),
		(t.shadowOffsetY || 0).toFixed(2),
		n[0],
		n[1]
	].join(",");
}
function Ma(e) {
	return e && !!e.image;
}
function Na(e) {
	return e && !!e.svgElement;
}
function Pa(e) {
	return Ma(e) || Na(e);
}
function Fa(e) {
	return e.type === "linear";
}
function Ia(e) {
	return e.type === "radial";
}
function La(e) {
	return e && (e.type === "linear" || e.type === "radial");
}
function Ra(e) {
	return "url(#" + e + ")";
}
function za(e) {
	var t = e.getGlobalScale(), n = Math.max(t[0], t[1]);
	return Math.max(Math.ceil(Math.log(n) / Math.log(10)), 1);
}
function Ba(e) {
	var t = e.x || 0, n = e.y || 0, r = (e.rotation || 0) * fn, i = K(e.scaleX, 1), a = K(e.scaleY, 1), o = e.skewX || 0, s = e.skewY || 0, c = [];
	return (t || n) && c.push("translate(" + t + "px," + n + "px)"), r && c.push("rotate(" + r + ")"), (i !== 1 || a !== 1) && c.push("scale(" + i + "," + a + ")"), (o || s) && c.push("skew(" + xa(o * fn) + "deg, " + xa(s * fn) + "deg)"), c.join(" ");
}
var Va = (function() {
	return typeof Buffer < "u" && typeof Buffer.from == "function" ? function(e) {
		return Buffer.from(e).toString("base64");
	} : typeof btoa == "function" && typeof unescape == "function" && typeof encodeURIComponent == "function" ? function(e) {
		return btoa(unescape(encodeURIComponent(e)));
	} : function(e) {
		return process.env.NODE_ENV !== "production" && Dt("Base64 isn't natively supported in the current environment."), null;
	};
})(), Ha = Array.prototype.slice;
function Ua(e, t, n) {
	return (t - e) * n + e;
}
function Wa(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = Ua(t[a], n[a], r);
	return e;
}
function Ga(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = Ua(t[o][s], n[o][s], r);
	}
	return e;
}
function Ka(e, t, n, r) {
	for (var i = t.length, a = 0; a < i; a++) e[a] = t[a] + n[a] * r;
	return e;
}
function qa(e, t, n, r) {
	for (var i = t.length, a = i && t[0].length, o = 0; o < i; o++) {
		e[o] || (e[o] = []);
		for (var s = 0; s < a; s++) e[o][s] = t[o][s] + n[o][s] * r;
	}
	return e;
}
function Ja(e, t) {
	for (var n = e.length, r = t.length, i = n > r ? t : e, a = Math.min(n, r), o = i[a - 1] || {
		color: [
			0,
			0,
			0,
			0
		],
		offset: 0
	}, s = a; s < Math.max(n, r); s++) i.push({
		offset: o.offset,
		color: o.color.slice()
	});
}
function Ya(e, t, n) {
	var r = e, i = t;
	if (!(!r.push || !i.push)) {
		var a = r.length, o = i.length;
		if (a !== o) if (a > o) r.length = o;
		else for (var s = a; s < o; s++) r.push(n === 1 ? i[s] : Ha.call(i[s]));
		for (var c = r[0] && r[0].length, s = 0; s < r.length; s++) if (n === 1) isNaN(r[s]) && (r[s] = i[s]);
		else for (var l = 0; l < c; l++) isNaN(r[s][l]) && (r[s][l] = i[s][l]);
	}
}
function Xa(e) {
	if (Pt(e)) {
		var t = e.length;
		if (Pt(e[0])) {
			for (var n = [], r = 0; r < t; r++) n.push(Ha.call(e[r]));
			return n;
		}
		return Ha.call(e);
	}
	return e;
}
function Za(e) {
	return e[0] = Math.floor(e[0]) || 0, e[1] = Math.floor(e[1]) || 0, e[2] = Math.floor(e[2]) || 0, e[3] = e[3] == null ? 1 : e[3], "rgba(" + e.join(",") + ")";
}
function Qa(e) {
	return Pt(e && e[0]) ? 2 : 1;
}
var $a = 0, eo = 1, to = 2, no = 3, ro = 4, io = 5, ao = 6;
function oo(e) {
	return e === ro || e === io;
}
function so(e) {
	return e === eo || e === to;
}
var co = [
	0,
	0,
	0,
	0
], lo = function() {
	function e(e) {
		this.keyframes = [], this.discrete = !1, this._invalid = !1, this._needsSort = !1, this._lastFr = 0, this._lastFrP = 0, this.propName = e;
	}
	return e.prototype.isFinished = function() {
		return this._finished;
	}, e.prototype.setFinished = function() {
		this._finished = !0, this._additiveTrack && this._additiveTrack.setFinished();
	}, e.prototype.needsAnimate = function() {
		return this.keyframes.length >= 1;
	}, e.prototype.getAdditiveTrack = function() {
		return this._additiveTrack;
	}, e.prototype.addKeyframe = function(e, t, n) {
		this._needsSort = !0;
		var r = this.keyframes, i = r.length, a = !1, o = ao, s = t;
		if (Pt(t)) {
			var c = Qa(t);
			o = c, (c === 1 && !Ht(t[0]) || c === 2 && !Ht(t[0][0])) && (a = !0);
		} else if (Ht(t) && !Jt(t)) o = $a;
		else if (W(t)) if (!isNaN(+t)) o = $a;
		else {
			var l = fa(t);
			l && (s = l, o = no);
		}
		else if (Kt(t)) {
			var u = R({}, s);
			u.colorStops = B(t.colorStops, function(e) {
				return {
					offset: e.offset,
					color: fa(e.color)
				};
			}), Fa(t) ? o = ro : Ia(t) && (o = io), s = u;
		}
		i === 0 ? this.valType = o : (o !== this.valType || o === ao) && (a = !0), this.discrete = this.discrete || a;
		var d = {
			time: e,
			value: s,
			rawValue: t,
			percent: 0
		};
		return n && (d.easing = n, d.easingFunc = U(n) ? n : Ti[n] || Qi(n)), r.push(d), d;
	}, e.prototype.prepare = function(e, t) {
		var n = this.keyframes;
		this._needsSort && n.sort(function(e, t) {
			return e.time - t.time;
		});
		for (var r = this.valType, i = n.length, a = n[i - 1], o = this.discrete, s = so(r), c = oo(r), l = 0; l < i; l++) {
			var u = n[l], d = u.value, f = a.value;
			u.percent = u.time / e, o || (s && l !== i - 1 ? Ya(d, f, r) : c && Ja(d.colorStops, f.colorStops));
		}
		if (!o && r !== io && t && this.needsAnimate() && t.needsAnimate() && r === t.valType && !t._finished) {
			this._additiveTrack = t;
			for (var p = n[0].value, l = 0; l < i; l++) r === $a ? n[l].additiveValue = n[l].value - p : r === no ? n[l].additiveValue = Ka([], n[l].value, p, -1) : so(r) && (n[l].additiveValue = r === eo ? Ka([], n[l].value, p, -1) : qa([], n[l].value, p, -1));
		}
	}, e.prototype.step = function(e, t) {
		if (!this._finished) {
			this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
			var n = this._additiveTrack != null, r = n ? "additiveValue" : "value", i = this.valType, a = this.keyframes, o = a.length, s = this.propName, c = i === no, l, u = this._lastFr, d = Math.min, f, p;
			if (o === 1) f = p = a[0];
			else {
				if (t < 0) l = 0;
				else if (t < this._lastFrP) {
					for (l = d(u + 1, o - 1); l >= 0 && !(a[l].percent <= t); l--);
					l = d(l, o - 2);
				} else {
					for (l = u; l < o && !(a[l].percent > t); l++);
					l = d(l - 1, o - 2);
				}
				p = a[l + 1], f = a[l];
			}
			if (f && p) {
				this._lastFr = l, this._lastFrP = t;
				var m = p.percent - f.percent, h = m === 0 ? 1 : d((t - f.percent) / m, 1);
				p.easingFunc && (h = p.easingFunc(h));
				var g = n ? this._additiveValue : c ? co : e[s];
				if ((so(i) || c) && !g && (g = this._additiveValue = []), this.discrete) e[s] = h < 1 ? f.rawValue : p.rawValue;
				else if (so(i)) i === eo ? Wa(g, f[r], p[r], h) : Ga(g, f[r], p[r], h);
				else if (oo(i)) {
					var _ = f[r], v = p[r], y = i === ro;
					e[s] = {
						type: y ? "linear" : "radial",
						x: Ua(_.x, v.x, h),
						y: Ua(_.y, v.y, h),
						colorStops: B(_.colorStops, function(e, t) {
							var n = v.colorStops[t];
							return {
								offset: Ua(e.offset, n.offset, h),
								color: Za(Wa([], e.color, n.color, h))
							};
						}),
						global: v.global
					}, y ? (e[s].x2 = Ua(_.x2, v.x2, h), e[s].y2 = Ua(_.y2, v.y2, h)) : e[s].r = Ua(_.r, v.r, h);
				} else if (c) Wa(g, f[r], p[r], h), n || (e[s] = Za(g));
				else {
					var b = Ua(f[r], p[r], h);
					n ? this._additiveValue = b : e[s] = b;
				}
				n && this._addToTarget(e);
			}
		}
	}, e.prototype._addToTarget = function(e) {
		var t = this.valType, n = this.propName, r = this._additiveValue;
		t === $a ? e[n] = e[n] + r : t === no ? (fa(e[n], co), Ka(co, co, r, 1), e[n] = Za(co)) : t === eo ? Ka(e[n], e[n], r, 1) : t === to && qa(e[n], e[n], r, 1);
	}, e;
}(), uo = function() {
	function e(e, t, n, r) {
		if (this._tracks = {}, this._trackKeys = [], this._maxTime = 0, this._started = 0, this._clip = null, this._target = e, this._loop = t, t && r) {
			Dt("Can' use additive animation on looped animation.");
			return;
		}
		this._additiveAnimators = r, this._allowDiscrete = n;
	}
	return e.prototype.getMaxTime = function() {
		return this._maxTime;
	}, e.prototype.getDelay = function() {
		return this._delay;
	}, e.prototype.getLoop = function() {
		return this._loop;
	}, e.prototype.getTarget = function() {
		return this._target;
	}, e.prototype.changeTarget = function(e) {
		this._target = e;
	}, e.prototype.when = function(e, t, n) {
		return this.whenWithKeys(e, t, V(t), n);
	}, e.prototype.whenWithKeys = function(e, t, n, r) {
		for (var i = this._tracks, a = 0; a < n.length; a++) {
			var o = n[a], s = i[o];
			if (!s) {
				s = i[o] = new lo(o);
				var c = void 0, l = this._getAdditiveTrack(o);
				if (l) {
					var u = l.keyframes, d = u[u.length - 1];
					c = d && d.value, l.valType === no && c && (c = Za(c));
				} else c = this._target[o];
				if (c == null) continue;
				e > 0 && s.addKeyframe(0, Xa(c), r), this._trackKeys.push(o);
			}
			s.addKeyframe(e, Xa(t[o]), r);
		}
		return this._maxTime = Math.max(this._maxTime, e), this;
	}, e.prototype.pause = function() {
		this._clip.pause(), this._paused = !0;
	}, e.prototype.resume = function() {
		this._clip.resume(), this._paused = !1;
	}, e.prototype.isPaused = function() {
		return !!this._paused;
	}, e.prototype.duration = function(e) {
		return this._maxTime = e, this._force = !0, this;
	}, e.prototype._doneCallback = function() {
		this._setTracksFinished(), this._clip = null;
		var e = this._doneCbs;
		if (e) for (var t = e.length, n = 0; n < t; n++) e[n].call(this);
	}, e.prototype._abortedCallback = function() {
		this._setTracksFinished();
		var e = this.animation, t = this._abortedCbs;
		if (e && e.removeClip(this._clip), this._clip = null, t) for (var n = 0; n < t.length; n++) t[n].call(this);
	}, e.prototype._setTracksFinished = function() {
		for (var e = this._tracks, t = this._trackKeys, n = 0; n < t.length; n++) e[t[n]].setFinished();
	}, e.prototype._getAdditiveTrack = function(e) {
		var t, n = this._additiveAnimators;
		if (n) for (var r = 0; r < n.length; r++) {
			var i = n[r].getTrack(e);
			i && (t = i);
		}
		return t;
	}, e.prototype.start = function(e) {
		if (!(this._started > 0)) {
			this._started = 1;
			for (var t = this, n = [], r = this._maxTime || 0, i = 0; i < this._trackKeys.length; i++) {
				var a = this._trackKeys[i], o = this._tracks[a], s = this._getAdditiveTrack(a), c = o.keyframes, l = c.length;
				if (o.prepare(r, s), o.needsAnimate()) if (!this._allowDiscrete && o.discrete) {
					var u = c[l - 1];
					u && (t._target[o.propName] = u.rawValue), o.setFinished();
				} else n.push(o);
			}
			if (n.length || this._force) {
				var d = new $i({
					life: r,
					loop: this._loop,
					delay: this._delay || 0,
					onframe: function(e) {
						t._started = 2;
						var r = t._additiveAnimators;
						if (r) {
							for (var i = !1, a = 0; a < r.length; a++) if (r[a]._clip) {
								i = !0;
								break;
							}
							i || (t._additiveAnimators = null);
						}
						for (var a = 0; a < n.length; a++) n[a].step(t._target, e);
						var o = t._onframeCbs;
						if (o) for (var a = 0; a < o.length; a++) o[a](t._target, e);
					},
					ondestroy: function() {
						t._doneCallback();
					}
				});
				this._clip = d, this.animation && this.animation.addClip(d), e && d.setEasing(e);
			} else this._doneCallback();
			return this;
		}
	}, e.prototype.stop = function(e) {
		if (this._clip) {
			var t = this._clip;
			e && t.onframe(1), this._abortedCallback();
		}
	}, e.prototype.delay = function(e) {
		return this._delay = e, this;
	}, e.prototype.during = function(e) {
		return e && (this._onframeCbs ||= [], this._onframeCbs.push(e)), this;
	}, e.prototype.done = function(e) {
		return e && (this._doneCbs ||= [], this._doneCbs.push(e)), this;
	}, e.prototype.aborted = function(e) {
		return e && (this._abortedCbs ||= [], this._abortedCbs.push(e)), this;
	}, e.prototype.getClip = function() {
		return this._clip;
	}, e.prototype.getTrack = function(e) {
		return this._tracks[e];
	}, e.prototype.getTracks = function() {
		var e = this;
		return B(this._trackKeys, function(t) {
			return e._tracks[t];
		});
	}, e.prototype.stopTracks = function(e, t) {
		if (!e.length || !this._clip) return !0;
		for (var n = this._tracks, r = this._trackKeys, i = 0; i < e.length; i++) {
			var a = n[e[i]];
			a && !a.isFinished() && (t ? a.step(this._target, 1) : this._started === 1 && a.step(this._target, 0), a.setFinished());
		}
		for (var o = !0, i = 0; i < r.length; i++) if (!n[r[i]].isFinished()) {
			o = !1;
			break;
		}
		return o && this._abortedCallback(), o;
	}, e.prototype.saveTo = function(e, t, n) {
		if (e) {
			t ||= this._trackKeys;
			for (var r = 0; r < t.length; r++) {
				var i = t[r], a = this._tracks[i];
				if (!(!a || a.isFinished())) {
					var o = a.keyframes, s = o[n ? 0 : o.length - 1];
					s && (e[i] = Xa(s.rawValue));
				}
			}
		}
	}, e.prototype.__changeFinalValue = function(e, t) {
		t ||= V(e);
		for (var n = 0; n < t.length; n++) {
			var r = t[n], i = this._tracks[r];
			if (i) {
				var a = i.keyframes;
				if (a.length > 1) {
					var o = a.pop();
					i.addKeyframe(o.time, e[r]), i.prepare(this._maxTime, i.getAdditiveTrack());
				}
			}
		}
	}, e;
}(), fo = function() {
	function e(e) {
		e && (this._$eventProcessor = e);
	}
	return e.prototype.on = function(e, t, n, r) {
		this._$handlers ||= {};
		var i = this._$handlers;
		if (typeof t == "function" && (r = n, n = t, t = null), !n || !e) return this;
		var a = this._$eventProcessor;
		t != null && a && a.normalizeQuery && (t = a.normalizeQuery(t)), i[e] || (i[e] = []);
		for (var o = 0; o < i[e].length; o++) if (i[e][o].h === n) return this;
		var s = {
			h: n,
			query: t,
			ctx: r || this,
			callAtLast: n.zrEventfulCallAtLast
		}, c = i[e].length - 1, l = i[e][c];
		return l && l.callAtLast ? i[e].splice(c, 0, s) : i[e].push(s), this;
	}, e.prototype.isSilent = function(e) {
		var t = this._$handlers;
		return !t || !t[e] || !t[e].length;
	}, e.prototype.off = function(e, t) {
		var n = this._$handlers;
		if (!n) return this;
		if (!e) return this._$handlers = {}, this;
		if (t) {
			if (n[e]) {
				for (var r = [], i = 0, a = n[e].length; i < a; i++) n[e][i].h !== t && r.push(n[e][i]);
				n[e] = r;
			}
			n[e] && n[e].length === 0 && delete n[e];
		} else delete n[e];
		return this;
	}, e.prototype.trigger = function(e) {
		var t = [...arguments].slice(1);
		if (!this._$handlers) return this;
		var n = this._$handlers[e], r = this._$eventProcessor;
		if (n) for (var i = t.length, a = n.length, o = 0; o < a; o++) {
			var s = n[o];
			if (!(r && r.filter && s.query != null && !r.filter(e, s.query))) switch (i) {
				case 0:
					s.h.call(s.ctx);
					break;
				case 1:
					s.h.call(s.ctx, t[0]);
					break;
				case 2:
					s.h.call(s.ctx, t[0], t[1]);
					break;
				default:
					s.h.apply(s.ctx, t);
					break;
			}
		}
		return r && r.afterTrigger && r.afterTrigger(e), this;
	}, e.prototype.triggerWithContext = function(e) {
		var t = [...arguments].slice(1);
		if (!this._$handlers) return this;
		var n = this._$handlers[e], r = this._$eventProcessor;
		if (n) for (var i = t.length, a = t[i - 1], o = n.length, s = 0; s < o; s++) {
			var c = n[s];
			if (!(r && r.filter && c.query != null && !r.filter(e, c.query))) switch (i) {
				case 0:
					c.h.call(a);
					break;
				case 1:
					c.h.call(a, t[0]);
					break;
				case 2:
					c.h.call(a, t[0], t[1]);
					break;
				default:
					c.h.apply(a, t.slice(1, i - 1));
					break;
			}
		}
		return r && r.afterTrigger && r.afterTrigger(e), this;
	}, e;
}(), po = 1;
Y.hasGlobalWindow && (po = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1));
var mo = po, ho = .4, go = "#333", _o = "#ccc", vo = "#eee", yo = "__zr_normal__", bo = Ci.concat(["ignore"]), xo = Ft(Ci, function(e, t) {
	return e[t] = !0, e;
}, { ignore: !1 }), So = {}, Co = new X(0, 0, 0, 0), wo = [], To = function() {
	function e(e) {
		this.id = Et(), this.animators = [], this.currentStates = [], this.states = {}, this._init(e);
	}
	return e.prototype._init = function(e) {
		this.attr(e);
	}, e.prototype.drift = function(e, t, n) {
		switch (this.draggable) {
			case "horizontal":
				t = 0;
				break;
			case "vertical":
				e = 0;
				break;
		}
		var r = this.transform;
		r ||= this.transform = [
			1,
			0,
			0,
			1,
			0,
			0
		], r[4] += e, r[5] += t, this.decomposeTransform(), this.markRedraw();
	}, e.prototype.beforeUpdate = function() {}, e.prototype.afterUpdate = function() {}, e.prototype.update = function() {
		this.updateTransform(), this.__dirty && this.updateInnerText();
	}, e.prototype.updateInnerText = function(e) {
		var t = this._textContent;
		if (t && (!t.ignore || e)) {
			this.textConfig ||= {};
			var n = this.textConfig, r = n.local, i = t.innerTransformable, a = void 0, o = void 0, s = !1;
			i.parent = r ? this : null;
			var c = !1;
			i.copyTransform(t);
			var l = n.position != null, u = n.autoOverflowArea, d = void 0;
			if ((u || l) && (d = Co, n.layoutRect ? d.copy(n.layoutRect) : d.copy(this.getBoundingRect()), r || d.applyTransform(this.transform)), l) {
				this.calculateTextPosition ? this.calculateTextPosition(So, n, d) : Gr(So, n, d), i.x = So.x, i.y = So.y, a = So.align, o = So.verticalAlign;
				var f = n.origin;
				if (f && n.rotation != null) {
					var p = void 0, m = void 0;
					f === "center" ? (p = d.width * .5, m = d.height * .5) : (p = Wr(f[0], d.width), m = Wr(f[1], d.height)), c = !0, i.originX = -i.x + p + (r ? 0 : d.x), i.originY = -i.y + m + (r ? 0 : d.y);
				}
			}
			n.rotation != null && (i.rotation = n.rotation);
			var h = n.offset;
			h && (i.x += h[0], i.y += h[1], c || (i.originX = -h[0], i.originY = -h[1]));
			var g = this._innerTextDefaultStyle ||= {};
			if (u) {
				var _ = g.overflowRect = g.overflowRect || new X(0, 0, 0, 0);
				i.getLocalTransform(wo), qn(wo, wo), X.copy(_, d), _.applyTransform(wo);
			} else g.overflowRect = null;
			var v = n.inside == null ? typeof n.position == "string" && n.position.indexOf("inside") >= 0 : n.inside, y = void 0, b = void 0, x = void 0;
			v && this.canBeInsideText() ? (y = n.insideFill, b = n.insideStroke, (y == null || y === "auto") && (y = this.getInsideTextFill()), (b == null || b === "auto") && (b = this.getInsideTextStroke(y), x = !0)) : (y = n.outsideFill, b = n.outsideStroke, (y == null || y === "auto") && (y = this.getOutsideFill()), (b == null || b === "auto") && (b = this.getOutsideStroke(y), x = !0)), y ||= "#000", (y !== g.fill || b !== g.stroke || x !== g.autoStroke || a !== g.align || o !== g.verticalAlign) && (s = !0, g.fill = y, g.stroke = b, g.autoStroke = x, g.align = a, g.verticalAlign = o, t.setDefaultTextStyle(g)), t.__dirty |= 1, s && t.dirtyStyle(!0);
		}
	}, e.prototype.canBeInsideText = function() {
		return !0;
	}, e.prototype.getInsideTextFill = function() {
		return "#fff";
	}, e.prototype.getInsideTextStroke = function(e) {
		return "#000";
	}, e.prototype.getOutsideFill = function() {
		return this.__zr && this.__zr.isDarkMode() ? _o : go;
	}, e.prototype.getOutsideStroke = function(e) {
		var t = this.__zr && this.__zr.getBackgroundColor(), n = typeof t == "string" && fa(t);
		n ||= [
			255,
			255,
			255,
			1
		];
		for (var r = n[3], i = this.__zr.isDarkMode(), a = 0; a < 3; a++) n[a] = n[a] * r + (i ? 0 : 255) * (1 - r);
		return n[3] = 1, _a(n, "rgba");
	}, e.prototype.traverse = function(e, t) {}, e.prototype.attrKV = function(e, t) {
		e === "textConfig" ? this.setTextConfig(t) : e === "textContent" ? this.setTextContent(t) : e === "clipPath" ? this.setClipPath(t) : e === "extra" ? (this.extra = this.extra || {}, R(this.extra, t)) : this[e] = t;
	}, e.prototype.hide = function() {
		this.ignore = !0, this.markRedraw();
	}, e.prototype.show = function() {
		this.ignore = !1, this.markRedraw();
	}, e.prototype.attr = function(e, t) {
		if (typeof e == "string") this.attrKV(e, t);
		else if (G(e)) for (var n = V(e), r = 0; r < n.length; r++) {
			var i = n[r];
			this.attrKV(i, e[i]);
		}
		return this.markRedraw(), this;
	}, e.prototype.saveCurrentToNormalState = function(e) {
		this._innerSaveToNormal(e);
		for (var t = this._normalState, n = 0; n < this.animators.length; n++) {
			var r = this.animators[n], i = r.__fromStateTransition;
			if (!(r.getLoop() || i && i !== "__zr_normal__")) {
				var a = r.targetName, o = a ? t[a] : t;
				r.saveTo(o);
			}
		}
	}, e.prototype._innerSaveToNormal = function(e) {
		var t = this._normalState;
		t ||= this._normalState = {}, e.textConfig && !t.textConfig && (t.textConfig = this.textConfig), this._savePrimaryToNormal(e, t, bo);
	}, e.prototype._savePrimaryToNormal = function(e, t, n) {
		for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e[i] != null && !(i in t) && (t[i] = this[i]);
		}
	}, e.prototype.hasState = function() {
		return this.currentStates.length > 0;
	}, e.prototype.getState = function(e) {
		return this.states[e];
	}, e.prototype.ensureState = function(e) {
		var t = this.states;
		return t[e] || (t[e] = {}), t[e];
	}, e.prototype.clearStates = function(e) {
		this.useState(yo, !1, e);
	}, e.prototype.useState = function(e, t, n, r) {
		var i = e === yo;
		if (!(!this.hasState() && i)) {
			var a = this.currentStates, o = this.stateTransition;
			if (!(jt(a, e) >= 0 && (t || a.length === 1))) {
				var s;
				if (this.stateProxy && !i && (s = this.stateProxy(e)), s ||= this.states && this.states[e], !s && !i) {
					Dt("State " + e + " not exists.");
					return;
				}
				i || this.saveCurrentToNormalState(s);
				var c = this._textContent, l = No(this, c, s, r);
				l && !this.__inHover && (this.__inHover = l), this._applyStateObj(e, s, this._normalState, t, Fo(this, n, o), o);
				var u = this._textGuide;
				return c && c.useState(e, t, n, !!l), u && u.useState(e, t, n, !!l), i ? (this.currentStates = [], this._normalState = {}) : t ? this.currentStates.push(e) : this.currentStates = [e], this._updateAnimationTargets(), this.markRedraw(), !l && this.__inHover && (this.__inHover = 0, this.__dirty &= -2), s;
			}
		}
	}, e.prototype.useStates = function(e, t, n) {
		if (!e.length) this.clearStates();
		else {
			var r = [], i = this.currentStates, a = e.length, o = a === i.length;
			if (o) {
				for (var s = 0; s < a; s++) if (e[s] !== i[s]) {
					o = !1;
					break;
				}
			}
			if (o) return;
			for (var s = 0; s < a; s++) {
				var c = e[s], l = void 0;
				this.stateProxy && (l = this.stateProxy(c, e)), l ||= this.states[c], l && r.push(l);
			}
			var u = r[a - 1], d = this._textContent, f = No(this, d, u, n);
			f && !this.__inHover && (this.__inHover = f);
			var p = this._mergeStates(r), m = this.stateTransition;
			this.saveCurrentToNormalState(p), this._applyStateObj(e.join(","), p, this._normalState, !1, Fo(this, t, m), m);
			var h = this._textGuide;
			d && d.useStates(e, t, !!f), h && h.useStates(e, t, !!f), this._updateAnimationTargets(), this.currentStates = e.slice(), this.markRedraw(), !f && this.__inHover && (this.__inHover = 0, this.__dirty &= -2);
		}
	}, e.prototype.isSilent = function() {
		for (var e = this; e;) {
			if (e.silent) return !0;
			var t = e.__hostTarget;
			e = t ? e.ignoreHostSilent ? null : t : e.parent;
		}
		return !1;
	}, e.prototype._updateAnimationTargets = function() {
		for (var e = 0; e < this.animators.length; e++) {
			var t = this.animators[e];
			t.targetName && t.changeTarget(this[t.targetName]);
		}
	}, e.prototype.removeState = function(e) {
		var t = jt(this.currentStates, e);
		if (t >= 0) {
			var n = this.currentStates.slice();
			n.splice(t, 1), this.useStates(n);
		}
	}, e.prototype.replaceState = function(e, t, n) {
		var r = this.currentStates.slice(), i = jt(r, e), a = jt(r, t) >= 0;
		i >= 0 ? a ? r.splice(i, 1) : r[i] = t : n && !a && r.push(t), this.useStates(r);
	}, e.prototype.toggleState = function(e, t) {
		t ? this.useState(e, !0) : this.removeState(e);
	}, e.prototype._mergeStates = function(e) {
		for (var t = {}, n, r = 0; r < e.length; r++) {
			var i = e[r];
			R(t, i), i.textConfig && (n ||= {}, R(n, i.textConfig));
		}
		return n && (t.textConfig = n), t;
	}, e.prototype._applyStateObj = function(e, t, n, r, i, a) {
		if (this.__inHover !== 1) {
			var o = !(t && r);
			t && t.textConfig ? (this.textConfig = R({}, r ? this.textConfig : n.textConfig), R(this.textConfig, t.textConfig)) : o && n.textConfig && (this.textConfig = n.textConfig);
			for (var s = {}, c = !1, l = 0; l < bo.length; l++) {
				var u = bo[l], d = i && xo[u];
				t && t[u] != null ? d ? (c = !0, s[u] = t[u]) : this[u] = t[u] : o && n[u] != null && (d ? (c = !0, s[u] = n[u]) : this[u] = n[u]);
			}
			if (!i) for (var l = 0; l < this.animators.length; l++) {
				var f = this.animators[l], p = f.targetName;
				f.getLoop() || f.__changeFinalValue(p ? (t || n)[p] : t || n);
			}
			c && this._transitionState(e, s, a);
		}
	}, e.prototype._attachComponent = function(e) {
		if (e.__zr && !e.__hostTarget) {
			if (process.env.NODE_ENV !== "production") throw Error("Text element has been added to zrender.");
			return;
		}
		if (e === this) {
			if (process.env.NODE_ENV !== "production") throw Error("Recursive component attachment.");
			return;
		}
		var t = this.__zr;
		t && e.addSelfToZr(t), e.__zr = t, e.__hostTarget = this;
	}, e.prototype._detachComponent = function(e) {
		e.__zr && e.removeSelfFromZr(e.__zr), e.__zr = null, e.__hostTarget = null;
	}, e.prototype.getClipPath = function() {
		return this._clipPath;
	}, e.prototype.setClipPath = function(e) {
		this._clipPath && this._clipPath !== e && this.removeClipPath(), this._attachComponent(e), this._clipPath = e, this.markRedraw();
	}, e.prototype.removeClipPath = function() {
		var e = this._clipPath;
		e && (this._detachComponent(e), this._clipPath = null, this.markRedraw());
	}, e.prototype.getTextContent = function() {
		return this._textContent;
	}, e.prototype.setTextContent = function(e) {
		var t = this._textContent;
		if (t !== e) {
			if (t && t !== e && this.removeTextContent(), process.env.NODE_ENV !== "production" && e.__zr && !e.__hostTarget) throw Error("Text element has been added to zrender.");
			e.innerTransformable = new xi(), this._attachComponent(e), this._textContent = e, this.markRedraw();
		}
	}, e.prototype.setTextConfig = function(e) {
		this.textConfig ||= {}, R(this.textConfig, e), this.markRedraw();
	}, e.prototype.removeTextConfig = function() {
		this.textConfig = null, this.markRedraw();
	}, e.prototype.removeTextContent = function() {
		var e = this._textContent;
		e && (e.innerTransformable = null, this._detachComponent(e), this._textContent = null, this._innerTextDefaultStyle = null, this.markRedraw());
	}, e.prototype.getTextGuideLine = function() {
		return this._textGuide;
	}, e.prototype.setTextGuideLine = function(e) {
		this._textGuide && this._textGuide !== e && this.removeTextGuideLine(), this._attachComponent(e), this._textGuide = e, this.markRedraw();
	}, e.prototype.removeTextGuideLine = function() {
		var e = this._textGuide;
		e && (this._detachComponent(e), this._textGuide = null, this.markRedraw());
	}, e.prototype.markRedraw = function() {
		this.__dirty |= 1;
		var e = this.__zr;
		e && (this.__inHover ? e.refreshHover() : e.refresh()), this.__hostTarget && this.__hostTarget.markRedraw();
	}, e.prototype.dirty = function() {
		this.markRedraw();
	}, e.prototype.addSelfToZr = function(e) {
		if (this.__zr !== e) {
			this.__zr = e;
			var t = this.animators;
			if (t) for (var n = 0; n < t.length; n++) e.animation.addAnimator(t[n]);
			this._clipPath && this._clipPath.addSelfToZr(e), this._textContent && this._textContent.addSelfToZr(e), this._textGuide && this._textGuide.addSelfToZr(e);
		}
	}, e.prototype.removeSelfFromZr = function(e) {
		if (this.__zr) {
			this.__zr = null;
			var t = this.animators;
			if (t) for (var n = 0; n < t.length; n++) e.animation.removeAnimator(t[n]);
			this._clipPath && this._clipPath.removeSelfFromZr(e), this._textContent && this._textContent.removeSelfFromZr(e), this._textGuide && this._textGuide.removeSelfFromZr(e);
		}
	}, e.prototype.animate = function(e, t, n) {
		var r = e ? this[e] : this;
		if (process.env.NODE_ENV !== "production" && !r) {
			Dt("Property \"" + e + "\" is not existed in element " + this.id);
			return;
		}
		var i = new uo(r, t, n);
		return e && (i.targetName = e), this.addAnimator(i, e), i;
	}, e.prototype.addAnimator = function(e, t) {
		var n = this.__zr, r = this;
		e.during(function() {
			r.updateDuringAnimation(t);
		}).done(function() {
			var t = r.animators, n = jt(t, e);
			n >= 0 && t.splice(n, 1);
		}), this.animators.push(e), n && n.animation.addAnimator(e), n && n.wakeUp();
	}, e.prototype.updateDuringAnimation = function(e) {
		this.markRedraw();
	}, e.prototype.stopAnimation = function(e, t) {
		for (var n = this.animators, r = n.length, i = [], a = 0; a < r; a++) {
			var o = n[a];
			!e || e === o.scope ? o.stop(t) : i.push(o);
		}
		return this.animators = i, this;
	}, e.prototype.animateTo = function(e, t, n) {
		Eo(this, e, t, n);
	}, e.prototype.animateFrom = function(e, t, n) {
		Eo(this, e, t, n, !0);
	}, e.prototype._transitionState = function(e, t, n, r) {
		for (var i = Eo(this, t, n, r), a = 0; a < i.length; a++) i[a].__fromStateTransition = e;
	}, e.prototype.getBoundingRect = function() {
		return null;
	}, e.prototype.getPaintRect = function() {
		return null;
	}, e.initDefaultProps = (function() {
		var t = e.prototype;
		t.type = "element", t.name = "", t.ignore = t.silent = t.ignoreHostSilent = t.isGroup = t.draggable = t.dragging = t.ignoreClip = !1, t.__inHover = 0, t.__dirty = 1;
		var n = {};
		function r(e, t, r) {
			n[e + t + r] || (console.warn("DEPRECATED: '" + e + "' has been deprecated. use '" + t + "', '" + r + "' instead"), n[e + t + r] = !0);
		}
		function i(e, n, i, a) {
			Object.defineProperty(t, e, {
				get: function() {
					if (process.env.NODE_ENV !== "production" && r(e, i, a), !this[n]) {
						var t = this[n] = [];
						o(this, t);
					}
					return this[n];
				},
				set: function(t) {
					process.env.NODE_ENV !== "production" && r(e, i, a), this[i] = t[0], this[a] = t[1], this[n] = t, o(this, t);
				}
			});
			function o(e, t) {
				Object.defineProperty(t, 0, {
					get: function() {
						return e[i];
					},
					set: function(t) {
						e[i] = t;
					}
				}), Object.defineProperty(t, 1, {
					get: function() {
						return e[a];
					},
					set: function(t) {
						e[a] = t;
					}
				});
			}
		}
		Object.defineProperty && (i("position", "_legacyPos", "x", "y"), i("scale", "_legacyScale", "scaleX", "scaleY"), i("origin", "_legacyOrigin", "originX", "originY"));
	})(), e;
}();
Nt(To, fo), Nt(To, xi);
function Eo(e, t, n, r, i) {
	n ||= {};
	var a = [];
	Mo(e, "", e, t, n, r, a, i);
	var o = a.length, s = !1, c = n.done, l = n.aborted, u = function() {
		s = !0, o--, o <= 0 && (s ? c && c() : l && l());
	}, d = function() {
		o--, o <= 0 && (s ? c && c() : l && l());
	};
	o || c && c(), a.length > 0 && n.during && a[0].during(function(e, t) {
		n.during(t);
	});
	for (var f = 0; f < a.length; f++) {
		var p = a[f];
		u && p.done(u), d && p.aborted(d), n.force && p.duration(n.duration), p.start(n.easing);
	}
	return a;
}
function Do(e, t, n) {
	for (var r = 0; r < n; r++) e[r] = t[r];
}
function Oo(e) {
	return Pt(e[0]);
}
function ko(e, t, n) {
	if (Pt(t[n])) if (Pt(e[n]) || (e[n] = []), Wt(t[n])) {
		var r = t[n].length;
		e[n].length !== r && (e[n] = new t[n].constructor(r), Do(e[n], t[n], r));
	} else {
		var i = t[n], a = e[n], o = i.length;
		if (Oo(i)) for (var s = i[0].length, c = 0; c < o; c++) a[c] ? Do(a[c], i[c], s) : a[c] = Array.prototype.slice.call(i[c]);
		else Do(a, i, o);
		a.length = i.length;
	}
	else e[n] = t[n];
}
function Ao(e, t) {
	return e === t || Pt(e) && Pt(t) && jo(e, t);
}
function jo(e, t) {
	var n = e.length;
	if (n !== t.length) return !1;
	for (var r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
	return !0;
}
function Mo(e, t, n, r, i, a, o, s) {
	for (var c = V(r), l = i.duration, u = i.delay, d = i.additive, f = i.setToFinal, p = !G(a), m = e.animators, h = [], g = 0; g < c.length; g++) {
		var _ = c[g], v = r[_];
		if (v != null && n[_] != null && (p || a[_])) if (G(v) && !Pt(v) && !Kt(v)) {
			if (t) {
				s || (n[_] = v, e.updateDuringAnimation(t));
				continue;
			}
			Mo(e, _, n[_], v, i, a && a[_], o, s);
		} else h.push(_);
		else s || (n[_] = v, e.updateDuringAnimation(t), h.push(_));
	}
	var y = h.length;
	if (!d && y) for (var b = 0; b < m.length; b++) {
		var x = m[b];
		if (x.targetName === t && x.stopTracks(h)) {
			var S = jt(m, x);
			m.splice(S, 1);
		}
	}
	if (i.force || (h = It(h, function(e) {
		return !Ao(r[e], n[e]);
	}), y = h.length), y > 0 || i.force && !o.length) {
		var C = void 0, w = void 0, T = void 0;
		if (s) {
			w = {}, f && (C = {});
			for (var b = 0; b < y; b++) {
				var _ = h[b];
				w[_] = n[_], f ? C[_] = r[_] : n[_] = r[_];
			}
		} else if (f) {
			T = {};
			for (var b = 0; b < y; b++) {
				var _ = h[b];
				T[_] = Xa(n[_]), ko(n, r, _);
			}
		}
		var x = new uo(n, !1, !1, d ? It(m, function(e) {
			return e.targetName === t;
		}) : null);
		x.targetName = t, i.scope && (x.scope = i.scope), f && C && x.whenWithKeys(0, C, h), T && x.whenWithKeys(0, T, h), x.whenWithKeys(l ?? 500, s ? w : r, h).delay(u || 0), e.addAnimator(x, t), o.push(x);
	}
}
function No(e, t, n, r) {
	return !(n && n.hoverLayer || r) || Po(e) || t && Po(t) ? 0 : 1;
}
function Po(e) {
	return e.type === "text" || e.type === "tspan";
}
function Fo(e, t, n) {
	return !t && !e.__inHover && n && n.duration > 0;
}
//#endregion
//#region node_modules/zrender/lib/graphic/Displayable.js
var Io = "__zr_style_" + Math.round(Math.random() * 10), Lo = {
	shadowBlur: 0,
	shadowOffsetX: 0,
	shadowOffsetY: 0,
	shadowColor: "#000",
	opacity: 1,
	blend: "source-over"
}, Ro = { style: {
	shadowBlur: !0,
	shadowOffsetX: !0,
	shadowOffsetY: !0,
	shadowColor: !0,
	opacity: !0
} };
Lo[Io] = !0;
var zo = [
	"z",
	"z2",
	"invisible"
], Bo = ["invisible"], Vo = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype._init = function(t) {
		for (var n = V(t), r = 0; r < n.length; r++) {
			var i = n[r];
			i === "style" ? this.useStyle(t[i]) : e.prototype.attrKV.call(this, i, t[i]);
		}
		this.style || this.useStyle({});
	}, t.prototype.beforeBrush = function(e) {}, t.prototype.afterBrush = function() {}, t.prototype.innerBeforeBrush = function() {}, t.prototype.innerAfterBrush = function() {}, t.prototype.shouldBePainted = function(e, t, n, r) {
		var i = this.transform;
		if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && Wo(this, e, t) || i && !i[0] && !i[3]) return !1;
		if (n && this.__clipPaths && this.__clipPaths.length) {
			for (var a = 0; a < this.__clipPaths.length; ++a) if (this.__clipPaths[a].isZeroArea()) return !1;
		}
		if (r && this.parent) for (var o = this.parent; o;) {
			if (o.ignore) return !1;
			o = o.parent;
		}
		return !0;
	}, t.prototype.contain = function(e, t) {
		return this.rectContain(e, t);
	}, t.prototype.traverse = function(e, t) {
		e.call(t, this);
	}, t.prototype.rectContain = function(e, t) {
		var n = this.transformCoordToLocal(e, t);
		return this.getBoundingRect().contain(n[0], n[1]);
	}, t.prototype.getPaintRect = function() {
		var e = this._paintRect;
		if (!this._paintRect || this.__dirty) {
			var t = this.transform, n = this.getBoundingRect(), r = this.style, i = r.shadowBlur || 0, a = r.shadowOffsetX || 0, o = r.shadowOffsetY || 0;
			e = this._paintRect ||= new X(0, 0, 0, 0), t ? X.applyTransform(e, n, t) : e.copy(n), (i || a || o) && (e.width += i * 2 + Math.abs(a), e.height += i * 2 + Math.abs(o), e.x = Math.min(e.x, e.x + a - i), e.y = Math.min(e.y, e.y + o - i));
			var s = this.dirtyRectTolerance;
			e.isZero() || (e.x = Math.floor(e.x - s), e.y = Math.floor(e.y - s), e.width = Math.ceil(e.width + 1 + s * 2), e.height = Math.ceil(e.height + 1 + s * 2));
		}
		return e;
	}, t.prototype.setPrevPaintRect = function(e) {
		e ? (this._prevPaintRect = this._prevPaintRect || new X(0, 0, 0, 0), this._prevPaintRect.copy(e)) : this._prevPaintRect = null;
	}, t.prototype.getPrevPaintRect = function() {
		return this._prevPaintRect;
	}, t.prototype.animateStyle = function(e) {
		return this.animate("style", e);
	}, t.prototype.updateDuringAnimation = function(e) {
		e === "style" ? this.dirtyStyle() : this.markRedraw();
	}, t.prototype.attrKV = function(t, n) {
		t === "style" ? this.style ? this.setStyle(n) : this.useStyle(n) : e.prototype.attrKV.call(this, t, n);
	}, t.prototype.setStyle = function(e, t) {
		return typeof e == "string" ? this.style[e] = t : R(this.style, e), this.dirtyStyle(), this;
	}, t.prototype.dirtyStyle = function(e) {
		e || this.markRedraw(), this.__dirty |= 2, this._rect &&= null;
	}, t.prototype.dirty = function() {
		this.dirtyStyle();
	}, t.prototype.styleChanged = function() {
		return !!(this.__dirty & 2);
	}, t.prototype.styleUpdated = function() {
		this.__dirty &= -3;
	}, t.prototype.createStyle = function(e) {
		return ln(Lo, e);
	}, t.prototype.useStyle = function(e) {
		e[Io] || (e = this.createStyle(e)), this.style = e, this.dirtyStyle();
	}, t.prototype._useHoverStyle = function(e) {
		this.__hoverStyle = e;
	}, t.prototype.isStyleObject = function(e) {
		return e[Io];
	}, t.prototype._innerSaveToNormal = function(t) {
		e.prototype._innerSaveToNormal.call(this, t);
		var n = this._normalState;
		t.style && !n.style && (n.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(t, n, zo);
	}, t.prototype._applyStateObj = function(t, n, r, i, a, o) {
		e.prototype._applyStateObj.call(this, t, n, r, i, a, o);
		var s = !(n && i), c = this.__inHover === 1, l;
		if (n && n.style ? a ? i ? l = n.style : (l = this._mergeStyle(this.createStyle(), r.style), this._mergeStyle(l, n.style)) : (l = this._mergeStyle(this.createStyle(), i ? this.style : r.style), this._mergeStyle(l, n.style)) : s && (l = r.style), l) if (a) {
			var u = this.style;
			if (this.style = this.createStyle(s ? {} : u), s) for (var d = V(u), f = 0; f < d.length; f++) {
				var p = d[f];
				p in l && (l[p] = l[p], this.style[p] = u[p]);
			}
			for (var m = V(l), f = 0; f < m.length; f++) {
				var p = m[f];
				this.style[p] = this.style[p];
			}
			this._transitionState(t, { style: l }, o, this.getAnimationStyleProps());
		} else c ? this._useHoverStyle(l) : this.useStyle(l);
		if (!c) for (var h = this.__inHover ? Bo : zo, f = 0; f < h.length; f++) {
			var p = h[f];
			n && n[p] != null ? this[p] = n[p] : s && r[p] != null && (this[p] = r[p]);
		}
	}, t.prototype._mergeStates = function(t) {
		for (var n = e.prototype._mergeStates.call(this, t), r, i = 0; i < t.length; i++) {
			var a = t[i];
			a.style && (r ||= {}, this._mergeStyle(r, a.style));
		}
		return r && (n.style = r), n;
	}, t.prototype._mergeStyle = function(e, t) {
		return R(e, t), e;
	}, t.prototype.getAnimationStyleProps = function() {
		return Ro;
	}, t.initDefaultProps = (function() {
		var e = t.prototype;
		e.type = "displayable", e.invisible = !1, e.z = 0, e.z2 = 0, e.zlevel = 0, e.culling = !1, e.cursor = "pointer", e.rectHover = !1, e.incremental = 0, e._rect = null, e.dirtyRectTolerance = 0, e.__dirty = 3;
	})(), t;
}(To), Ho = new X(0, 0, 0, 0), Uo = new X(0, 0, 0, 0);
function Wo(e, t, n) {
	return Ho.copy(e.getBoundingRect()), e.transform && Ho.applyTransform(e.transform), Uo.width = t, Uo.height = n, !Ho.intersect(Uo);
}
//#endregion
//#region node_modules/zrender/lib/core/bbox.js
var Go = Math.min, Ko = Math.max, qo = Math.sin, Jo = Math.cos, Yo = Math.PI * 2, Xo = Jn(), Zo = Jn(), Qo = Jn();
function $o(e, t, n, r, i, a) {
	i[0] = Go(e, n), i[1] = Go(t, r), a[0] = Ko(e, n), a[1] = Ko(t, r);
}
var es = [], ts = [];
function ns(e, t, n, r, i, a, o, s, c, l) {
	var u = Bi, d = Li, f = u(e, n, i, o, es);
	c[0] = Infinity, c[1] = Infinity, l[0] = -Infinity, l[1] = -Infinity;
	for (var p = 0; p < f; p++) {
		var m = d(e, n, i, o, es[p]);
		c[0] = Go(m, c[0]), l[0] = Ko(m, l[0]);
	}
	f = u(t, r, a, s, ts);
	for (var p = 0; p < f; p++) {
		var h = d(t, r, a, s, ts[p]);
		c[1] = Go(h, c[1]), l[1] = Ko(h, l[1]);
	}
	c[0] = Go(e, c[0]), l[0] = Ko(e, l[0]), c[0] = Go(o, c[0]), l[0] = Ko(o, l[0]), c[1] = Go(t, c[1]), l[1] = Ko(t, l[1]), c[1] = Go(s, c[1]), l[1] = Ko(s, l[1]);
}
function rs(e, t, n, r, i, a, o, s) {
	var c = qi, l = Wi, u = Ko(Go(c(e, n, i), 1), 0), d = Ko(Go(c(t, r, a), 1), 0), f = l(e, n, i, u), p = l(t, r, a, d);
	o[0] = Go(e, i, f), o[1] = Go(t, a, p), s[0] = Ko(e, i, f), s[1] = Ko(t, a, p);
}
function is(e, t, n, r, i, a, o, s, c) {
	var l = cr, u = lr, d = Math.abs(i - a);
	if (d % Yo < 1e-4 && d > 1e-4) {
		s[0] = e - n, s[1] = t - r, c[0] = e + n, c[1] = t + r;
		return;
	}
	if (Xo[0] = Jo(i) * n + e, Xo[1] = qo(i) * r + t, Zo[0] = Jo(a) * n + e, Zo[1] = qo(a) * r + t, l(s, Xo, Zo), u(c, Xo, Zo), i %= Yo, i < 0 && (i += Yo), a %= Yo, a < 0 && (a += Yo), i > a && !o ? a += Yo : i < a && o && (i += Yo), o) {
		var f = a;
		a = i, i = f;
	}
	for (var p = 0; p < a; p += Math.PI / 2) p > i && (Qo[0] = Jo(p) * n + e, Qo[1] = qo(p) * r + t, l(s, Qo, s), u(c, Qo, c));
}
//#endregion
//#region node_modules/zrender/lib/core/PathProxy.js
var as = {
	M: 1,
	L: 2,
	C: 3,
	Q: 4,
	A: 5,
	Z: 6,
	R: 7
}, os = [], ss = [], cs = [], ls = [], us = [], ds = [], fs = Math.min, ps = Math.max, ms = Math.cos, hs = Math.sin, gs = Math.abs, _s = Math.PI, vs = _s * 2, ys = typeof Float32Array < "u", bs = [];
function xs(e) {
	return Math.round(e / _s * 1e8) / 1e8 % 2 * _s;
}
function Ss(e, t) {
	var n = xs(e[0]);
	n < 0 && (n += vs);
	var r = n - e[0], i = e[1];
	i += r, !t && i - n >= vs ? i = n + vs : t && n - i >= vs ? i = n - vs : !t && n > i ? i = n + (vs - xs(n - i)) : t && n < i && (i = n - (vs - xs(i - n))), e[0] = n, e[1] = i;
}
var Cs = function() {
	function e(e) {
		this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, e && (this._saveData = !1), this._saveData && (this.data = []);
	}
	return e.prototype.increaseVersion = function() {
		this._version++;
	}, e.prototype.getVersion = function() {
		return this._version;
	}, e.prototype.setScale = function(e, t, n) {
		n ||= 0, n > 0 && (this._ux = gs(n / mo / e) || 0, this._uy = gs(n / mo / t) || 0);
	}, e.prototype.setDPR = function(e) {
		this.dpr = e;
	}, e.prototype.setContext = function(e) {
		this._ctx = e;
	}, e.prototype.getContext = function() {
		return this._ctx;
	}, e.prototype.beginPath = function() {
		return this._ctx && this._ctx.beginPath(), this.reset(), this;
	}, e.prototype.reset = function() {
		this._saveData && (this._len = 0), this._pathSegLen && (this._pathSegLen = null, this._pathLen = 0), this._version++;
	}, e.prototype.moveTo = function(e, t) {
		return this._drawPendingPt(), this.addData(as.M, e, t), this._ctx && this._ctx.moveTo(e, t), this._x0 = e, this._y0 = t, this._xi = e, this._yi = t, this;
	}, e.prototype.lineTo = function(e, t) {
		var n = gs(e - this._xi), r = gs(t - this._yi), i = n > this._ux || r > this._uy;
		if (this.addData(as.L, e, t), this._ctx && i && this._ctx.lineTo(e, t), i) this._xi = e, this._yi = t, this._pendingPtDist = 0;
		else {
			var a = n * n + r * r;
			a > this._pendingPtDist && (this._pendingPtX = e, this._pendingPtY = t, this._pendingPtDist = a);
		}
		return this;
	}, e.prototype.bezierCurveTo = function(e, t, n, r, i, a) {
		return this._drawPendingPt(), this.addData(as.C, e, t, n, r, i, a), this._ctx && this._ctx.bezierCurveTo(e, t, n, r, i, a), this._xi = i, this._yi = a, this;
	}, e.prototype.quadraticCurveTo = function(e, t, n, r) {
		return this._drawPendingPt(), this.addData(as.Q, e, t, n, r), this._ctx && this._ctx.quadraticCurveTo(e, t, n, r), this._xi = n, this._yi = r, this;
	}, e.prototype.arc = function(e, t, n, r, i, a) {
		this._drawPendingPt(), bs[0] = r, bs[1] = i, Ss(bs, a), r = bs[0], i = bs[1];
		var o = i - r;
		return this.addData(as.A, e, t, n, n, r, o, 0, +!a), this._ctx && this._ctx.arc(e, t, n, r, i, a), this._xi = ms(i) * n + e, this._yi = hs(i) * n + t, this;
	}, e.prototype.arcTo = function(e, t, n, r, i) {
		return this._drawPendingPt(), this._ctx && this._ctx.arcTo(e, t, n, r, i), this;
	}, e.prototype.rect = function(e, t, n, r) {
		return this._drawPendingPt(), this._ctx && this._ctx.rect(e, t, n, r), this.addData(as.R, e, t, n, r), this;
	}, e.prototype.closePath = function() {
		this._drawPendingPt(), this.addData(as.Z);
		var e = this._ctx, t = this._x0, n = this._y0;
		return e && e.closePath(), this._xi = t, this._yi = n, this;
	}, e.prototype.fill = function(e) {
		e && e.fill(), this.toStatic();
	}, e.prototype.stroke = function(e) {
		e && e.stroke(), this.toStatic();
	}, e.prototype.len = function() {
		return this._len;
	}, e.prototype.setData = function(e) {
		if (this._saveData) {
			var t = e.length;
			!(this.data && this.data.length === t) && ys && (this.data = new Float32Array(t));
			for (var n = 0; n < t; n++) this.data[n] = e[n];
			this._len = t;
		}
	}, e.prototype.appendPath = function(e) {
		if (this._saveData) {
			e instanceof Array || (e = [e]);
			for (var t = e.length, n = 0, r = this._len, i = 0; i < t; i++) n += e[i].len();
			var a = this.data;
			if (ys && (a instanceof Float32Array || !a) && (this.data = new Float32Array(r + n), r > 0 && a)) for (var o = 0; o < r; o++) this.data[o] = a[o];
			for (var i = 0; i < t; i++) for (var s = e[i].data, o = 0; o < s.length; o++) this.data[r++] = s[o];
			this._len = r;
		}
	}, e.prototype.addData = function(e, t, n, r, i, a, o, s, c) {
		if (this._saveData) {
			var l = this.data;
			this._len + arguments.length > l.length && (this._expandData(), l = this.data);
			for (var u = 0; u < arguments.length; u++) l[this._len++] = arguments[u];
		}
	}, e.prototype._drawPendingPt = function() {
		this._pendingPtDist > 0 && (this._ctx && this._ctx.lineTo(this._pendingPtX, this._pendingPtY), this._pendingPtDist = 0);
	}, e.prototype._expandData = function() {
		if (!(this.data instanceof Array)) {
			for (var e = [], t = 0; t < this._len; t++) e[t] = this.data[t];
			this.data = e;
		}
	}, e.prototype.toStatic = function() {
		if (this._saveData) {
			this._drawPendingPt();
			var e = this.data;
			e instanceof Array && (e.length = this._len, ys && this._len > 11 && (this.data = new Float32Array(e)));
		}
	}, e.prototype.getBoundingRect = function() {
		cs[0] = cs[1] = us[0] = us[1] = Number.MAX_VALUE, ls[0] = ls[1] = ds[0] = ds[1] = -Number.MAX_VALUE;
		var e = this.data, t = 0, n = 0, r = 0, i = 0, a;
		for (a = 0; a < this._len;) {
			var o = e[a++], s = a === 1;
			switch (s && (t = e[a], n = e[a + 1], r = t, i = n), o) {
				case as.M:
					t = r = e[a++], n = i = e[a++], us[0] = r, us[1] = i, ds[0] = r, ds[1] = i;
					break;
				case as.L:
					$o(t, n, e[a], e[a + 1], us, ds), t = e[a++], n = e[a++];
					break;
				case as.C:
					ns(t, n, e[a++], e[a++], e[a++], e[a++], e[a], e[a + 1], us, ds), t = e[a++], n = e[a++];
					break;
				case as.Q:
					rs(t, n, e[a++], e[a++], e[a], e[a + 1], us, ds), t = e[a++], n = e[a++];
					break;
				case as.A:
					var c = e[a++], l = e[a++], u = e[a++], d = e[a++], f = e[a++], p = e[a++] + f;
					a += 1;
					var m = !e[a++];
					s && (r = ms(f) * u + c, i = hs(f) * d + l), is(c, l, u, d, f, p, m, us, ds), t = ms(p) * u + c, n = hs(p) * d + l;
					break;
				case as.R:
					r = t = e[a++], i = n = e[a++];
					var h = e[a++], g = e[a++];
					$o(r, i, r + h, i + g, us, ds);
					break;
				case as.Z:
					t = r, n = i;
					break;
			}
			cr(cs, cs, us), lr(ls, ls, ds);
		}
		return a === 0 && (cs[0] = cs[1] = ls[0] = ls[1] = 0), new X(cs[0], cs[1], ls[0] - cs[0], ls[1] - cs[1]);
	}, e.prototype._calculateLength = function() {
		var e = this.data, t = this._len, n = this._ux, r = this._uy, i = 0, a = 0, o = 0, s = 0;
		this._pathSegLen ||= [];
		for (var c = this._pathSegLen, l = 0, u = 0, d = 0; d < t;) {
			var f = e[d++], p = d === 1;
			p && (i = e[d], a = e[d + 1], o = i, s = a);
			var m = -1;
			switch (f) {
				case as.M:
					i = o = e[d++], a = s = e[d++];
					break;
				case as.L:
					var h = e[d++], g = e[d++], _ = h - i, v = g - a;
					(gs(_) > n || gs(v) > r || d === t - 1) && (m = Math.sqrt(_ * _ + v * v), i = h, a = g);
					break;
				case as.C:
					var y = e[d++], b = e[d++], h = e[d++], g = e[d++], x = e[d++], S = e[d++];
					m = Ui(i, a, y, b, h, g, x, S, 10), i = x, a = S;
					break;
				case as.Q:
					var y = e[d++], b = e[d++], h = e[d++], g = e[d++];
					m = Xi(i, a, y, b, h, g, 10), i = h, a = g;
					break;
				case as.A:
					var C = e[d++], w = e[d++], T = e[d++], E = e[d++], D = e[d++], O = e[d++], k = O + D;
					d += 1, p && (o = ms(D) * T + C, s = hs(D) * E + w), m = ps(T, E) * fs(vs, Math.abs(O)), i = ms(k) * T + C, a = hs(k) * E + w;
					break;
				case as.R:
					o = i = e[d++], s = a = e[d++];
					var A = e[d++], j = e[d++];
					m = A * 2 + j * 2;
					break;
				case as.Z:
					var _ = o - i, v = s - a;
					m = Math.sqrt(_ * _ + v * v), i = o, a = s;
					break;
			}
			m >= 0 && (c[u++] = m, l += m);
		}
		return this._pathLen = l, l;
	}, e.prototype.rebuildPath = function(e, t) {
		var n = this.data, r = this._ux, i = this._uy, a = this._len, o, s, c, l, u, d, f = t < 1, p, m, h = 0, g = 0, _, v = 0, y, b;
		if (!(f && (this._pathSegLen || this._calculateLength(), p = this._pathSegLen, m = this._pathLen, _ = t * m, !_))) lo: for (var x = 0; x < a;) {
			var S = n[x++], C = x === 1;
			switch (C && (c = n[x], l = n[x + 1], o = c, s = l), S !== as.L && v > 0 && (e.lineTo(y, b), v = 0), S) {
				case as.M:
					o = c = n[x++], s = l = n[x++], e.moveTo(c, l);
					break;
				case as.L:
					u = n[x++], d = n[x++];
					var w = gs(u - c), T = gs(d - l);
					if (w > r || T > i) {
						if (f) {
							var E = p[g++];
							if (h + E > _) {
								var D = (_ - h) / E;
								e.lineTo(c * (1 - D) + u * D, l * (1 - D) + d * D);
								break lo;
							}
							h += E;
						}
						e.lineTo(u, d), c = u, l = d, v = 0;
					} else {
						var O = w * w + T * T;
						O > v && (y = u, b = d, v = O);
					}
					break;
				case as.C:
					var k = n[x++], A = n[x++], j = n[x++], ee = n[x++], te = n[x++], ne = n[x++];
					if (f) {
						var E = p[g++];
						if (h + E > _) {
							var D = (_ - h) / E;
							Vi(c, k, j, te, D, os), Vi(l, A, ee, ne, D, ss), e.bezierCurveTo(os[1], ss[1], os[2], ss[2], os[3], ss[3]);
							break lo;
						}
						h += E;
					}
					e.bezierCurveTo(k, A, j, ee, te, ne), c = te, l = ne;
					break;
				case as.Q:
					var k = n[x++], A = n[x++], j = n[x++], ee = n[x++];
					if (f) {
						var E = p[g++];
						if (h + E > _) {
							var D = (_ - h) / E;
							Ji(c, k, j, D, os), Ji(l, A, ee, D, ss), e.quadraticCurveTo(os[1], ss[1], os[2], ss[2]);
							break lo;
						}
						h += E;
					}
					e.quadraticCurveTo(k, A, j, ee), c = j, l = ee;
					break;
				case as.A:
					var re = n[x++], ie = n[x++], ae = n[x++], oe = n[x++], se = n[x++], ce = n[x++], le = n[x++], ue = !n[x++], de = ae > oe ? ae : oe, fe = gs(ae - oe) > .001, pe = se + ce, M = !1;
					if (f) {
						var E = p[g++];
						h + E > _ && (pe = se + ce * (_ - h) / E, M = !0), h += E;
					}
					if (fe && e.ellipse ? e.ellipse(re, ie, ae, oe, le, se, pe, ue) : e.arc(re, ie, de, se, pe, ue), M) break lo;
					C && (o = ms(se) * ae + re, s = hs(se) * oe + ie), c = ms(pe) * ae + re, l = hs(pe) * oe + ie;
					break;
				case as.R:
					o = c = n[x], s = l = n[x + 1], u = n[x++], d = n[x++];
					var N = n[x++], me = n[x++];
					if (f) {
						var E = p[g++];
						if (h + E > _) {
							var P = _ - h;
							e.moveTo(u, d), e.lineTo(u + fs(P, N), d), P -= N, P > 0 && e.lineTo(u + N, d + fs(P, me)), P -= me, P > 0 && e.lineTo(u + ps(N - P, 0), d + me), P -= N, P > 0 && e.lineTo(u, d + ps(me - P, 0));
							break lo;
						}
						h += E;
					}
					e.rect(u, d, N, me);
					break;
				case as.Z:
					if (f) {
						var E = p[g++];
						if (h + E > _) {
							var D = (_ - h) / E;
							e.lineTo(c * (1 - D) + o * D, l * (1 - D) + s * D);
							break lo;
						}
						h += E;
					}
					e.closePath(), c = o, l = s;
			}
		}
	}, e.prototype.clone = function() {
		var t = new e(), n = this.data;
		return t.data = n.slice ? n.slice() : Array.prototype.slice.call(n), t._len = this._len, t;
	}, e.prototype.canSave = function() {
		return !!this._saveData;
	}, e.CMD = as, e.initDefaultProps = (function() {
		var t = e.prototype;
		t._saveData = !0, t._ux = 0, t._uy = 0, t._pendingPtDist = 0, t._version = 0;
	})(), e;
}();
//#endregion
//#region node_modules/zrender/lib/contain/line.js
function ws(e, t, n, r, i, a, o) {
	if (i === 0) return !1;
	var s = i, c = 0, l = e;
	if (o > t + s && o > r + s || o < t - s && o < r - s || a > e + s && a > n + s || a < e - s && a < n - s) return !1;
	if (e !== n) c = (t - r) / (e - n), l = (e * r - n * t) / (e - n);
	else return Math.abs(a - e) <= s / 2;
	var u = c * a - o + l;
	return u * u / (c * c + 1) <= s / 2 * s / 2;
}
//#endregion
//#region node_modules/zrender/lib/contain/cubic.js
function Ts(e, t, n, r, i, a, o, s, c, l, u) {
	if (c === 0) return !1;
	var d = c;
	return u > t + d && u > r + d && u > a + d && u > s + d || u < t - d && u < r - d && u < a - d && u < s - d || l > e + d && l > n + d && l > i + d && l > o + d || l < e - d && l < n - d && l < i - d && l < o - d ? !1 : Hi(e, t, n, r, i, a, o, s, l, u, null) <= d / 2;
}
//#endregion
//#region node_modules/zrender/lib/contain/quadratic.js
function Es(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	return c > t + l && c > r + l && c > a + l || c < t - l && c < r - l && c < a - l || s > e + l && s > n + l && s > i + l || s < e - l && s < n - l && s < i - l ? !1 : Yi(e, t, n, r, i, a, s, c, null) <= l / 2;
}
//#endregion
//#region node_modules/zrender/lib/contain/util.js
var Ds = Math.PI * 2;
function Os(e) {
	return e %= Ds, e < 0 && (e += Ds), e;
}
//#endregion
//#region node_modules/zrender/lib/contain/arc.js
var ks = Math.PI * 2;
function As(e, t, n, r, i, a, o, s, c) {
	if (o === 0) return !1;
	var l = o;
	s -= e, c -= t;
	var u = Math.sqrt(s * s + c * c);
	if (u - l > n || u + l < n) return !1;
	if (Math.abs(r - i) % ks < 1e-4) return !0;
	if (a) {
		var d = r;
		r = Os(i), i = Os(d);
	} else r = Os(r), i = Os(i);
	r > i && (i += ks);
	var f = Math.atan2(c, s);
	return f < 0 && (f += ks), f >= r && f <= i || f + ks >= r && f + ks <= i;
}
//#endregion
//#region node_modules/zrender/lib/contain/windingLine.js
function js(e, t, n, r, i, a) {
	if (a > t && a > r || a < t && a < r || r === t) return 0;
	var o = (a - t) / (r - t), s = r < t ? 1 : -1;
	(o === 1 || o === 0) && (s = r < t ? .5 : -.5);
	var c = o * (n - e) + e;
	return c === i ? Infinity : c > i ? s : 0;
}
//#endregion
//#region node_modules/zrender/lib/contain/path.js
var Ms = Cs.CMD, Ns = Math.PI * 2, Ps = 1e-4;
function Fs(e, t) {
	return Math.abs(e - t) < Ps;
}
var Is = [
	-1,
	-1,
	-1
], Ls = [-1, -1];
function Rs() {
	var e = Ls[0];
	Ls[0] = Ls[1], Ls[1] = e;
}
function zs(e, t, n, r, i, a, o, s, c, l) {
	if (l > t && l > r && l > a && l > s || l < t && l < r && l < a && l < s) return 0;
	var u = zi(t, r, a, s, l, Is);
	if (u === 0) return 0;
	for (var d = 0, f = -1, p = void 0, m = void 0, h = 0; h < u; h++) {
		var g = Is[h], _ = g === 0 || g === 1 ? .5 : 1;
		Li(e, n, i, o, g) < c || (f < 0 && (f = Bi(t, r, a, s, Ls), Ls[1] < Ls[0] && f > 1 && Rs(), p = Li(t, r, a, s, Ls[0]), f > 1 && (m = Li(t, r, a, s, Ls[1]))), f === 2 ? g < Ls[0] ? d += p < t ? _ : -_ : g < Ls[1] ? d += m < p ? _ : -_ : d += s < m ? _ : -_ : g < Ls[0] ? d += p < t ? _ : -_ : d += s < p ? _ : -_);
	}
	return d;
}
function Bs(e, t, n, r, i, a, o, s) {
	if (s > t && s > r && s > a || s < t && s < r && s < a) return 0;
	var c = Ki(t, r, a, s, Is);
	if (c === 0) return 0;
	var l = qi(t, r, a);
	if (l >= 0 && l <= 1) {
		for (var u = 0, d = Wi(t, r, a, l), f = 0; f < c; f++) {
			var p = Is[f] === 0 || Is[f] === 1 ? .5 : 1, m = Wi(e, n, i, Is[f]);
			m < o || (Is[f] < l ? u += d < t ? p : -p : u += a < d ? p : -p);
		}
		return u;
	} else {
		var p = Is[0] === 0 || Is[0] === 1 ? .5 : 1, m = Wi(e, n, i, Is[0]);
		return m < o ? 0 : a < t ? p : -p;
	}
}
function Vs(e, t, n, r, i, a, o, s) {
	if (s -= t, s > n || s < -n) return 0;
	var c = Math.sqrt(n * n - s * s);
	Is[0] = -c, Is[1] = c;
	var l = Math.abs(r - i);
	if (l < 1e-4) return 0;
	if (l >= Ns - 1e-4) {
		r = 0, i = Ns;
		var u = a ? 1 : -1;
		return o >= Is[0] + e && o <= Is[1] + e ? u : 0;
	}
	if (r > i) {
		var d = r;
		r = i, i = d;
	}
	r < 0 && (r += Ns, i += Ns);
	for (var f = 0, p = 0; p < 2; p++) {
		var m = Is[p];
		if (m + e > o) {
			var h = Math.atan2(s, m), u = a ? 1 : -1;
			h < 0 && (h = Ns + h), (h >= r && h <= i || h + Ns >= r && h + Ns <= i) && (h > Math.PI / 2 && h < Math.PI * 1.5 && (u = -u), f += u);
		}
	}
	return f;
}
function Hs(e, t, n, r, i) {
	for (var a = e.data, o = e.len(), s = 0, c = 0, l = 0, u = 0, d = 0, f, p, m = 0; m < o;) {
		var h = a[m++], g = m === 1;
		switch (h === Ms.M && m > 1 && (n || (s += js(c, l, u, d, r, i))), g && (c = a[m], l = a[m + 1], u = c, d = l), h) {
			case Ms.M:
				u = a[m++], d = a[m++], c = u, l = d;
				break;
			case Ms.L:
				if (n) {
					if (ws(c, l, a[m], a[m + 1], t, r, i)) return !0;
				} else s += js(c, l, a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Ms.C:
				if (n) {
					if (Ts(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += zs(c, l, a[m++], a[m++], a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Ms.Q:
				if (n) {
					if (Es(c, l, a[m++], a[m++], a[m], a[m + 1], t, r, i)) return !0;
				} else s += Bs(c, l, a[m++], a[m++], a[m], a[m + 1], r, i) || 0;
				c = a[m++], l = a[m++];
				break;
			case Ms.A:
				var _ = a[m++], v = a[m++], y = a[m++], b = a[m++], x = a[m++], S = a[m++];
				m += 1;
				var C = !!(1 - a[m++]);
				f = Math.cos(x) * y + _, p = Math.sin(x) * b + v, g ? (u = f, d = p) : s += js(c, l, f, p, r, i);
				var w = (r - _) * b / y + _;
				if (n) {
					if (As(_, v, b, x, x + S, C, t, w, i)) return !0;
				} else s += Vs(_, v, b, x, x + S, C, w, i);
				c = Math.cos(x + S) * y + _, l = Math.sin(x + S) * b + v;
				break;
			case Ms.R:
				u = c = a[m++], d = l = a[m++];
				var T = a[m++], E = a[m++];
				if (f = u + T, p = d + E, n) {
					if (ws(u, d, f, d, t, r, i) || ws(f, d, f, p, t, r, i) || ws(f, p, u, p, t, r, i) || ws(u, p, u, d, t, r, i)) return !0;
				} else s += js(f, d, f, p, r, i), s += js(u, p, u, d, r, i);
				break;
			case Ms.Z:
				if (n) {
					if (ws(c, l, u, d, t, r, i)) return !0;
				} else s += js(c, l, u, d, r, i);
				c = u, l = d;
				break;
		}
	}
	return !n && !Fs(l, d) && (s += js(c, l, u, d, r, i) || 0), s !== 0;
}
function Us(e, t, n) {
	return Hs(e, 0, !1, t, n);
}
function Ws(e, t, n, r) {
	return Hs(e, t, !0, n, r);
}
//#endregion
//#region node_modules/zrender/lib/graphic/Path.js
var Gs = At({
	fill: "#000",
	stroke: null,
	strokePercent: 1,
	fillOpacity: 1,
	strokeOpacity: 1,
	lineDashOffset: 0,
	lineWidth: 1,
	lineCap: "butt",
	miterLimit: 10,
	strokeNoScale: !1,
	strokeFirst: !1
}, Lo), Ks = { style: At({
	fill: !0,
	stroke: !0,
	strokePercent: !0,
	fillOpacity: !0,
	strokeOpacity: !0,
	lineDashOffset: !0,
	lineWidth: !0,
	miterLimit: !0
}, Ro.style) }, qs = Ci.concat([
	"invisible",
	"culling",
	"z",
	"z2",
	"zlevel",
	"parent"
]), Js = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.update = function() {
		var n = this;
		e.prototype.update.call(this);
		var r = this.style;
		if (r.decal) {
			var i = this._decalEl = this._decalEl || new t();
			i.buildPath === t.prototype.buildPath && (i.buildPath = function(e) {
				n.buildPath(e, n.shape);
			}), i.silent = !0;
			var a = i.style;
			for (var o in r) a[o] !== r[o] && (a[o] = r[o]);
			a.fill = r.fill ? r.decal : null, a.decal = null, a.shadowColor = null, r.strokeFirst && (a.stroke = null);
			for (var s = 0; s < qs.length; ++s) i[qs[s]] = this[qs[s]];
			i.__dirty |= 1;
		} else this._decalEl &&= null;
	}, t.prototype.getDecalElement = function() {
		return this._decalEl;
	}, t.prototype._init = function(t) {
		var n = V(t);
		this.shape = this.getDefaultShape();
		var r = this.getDefaultStyle();
		r && this.useStyle(r);
		for (var i = 0; i < n.length; i++) {
			var a = n[i], o = t[a];
			a === "style" ? this.style ? R(this.style, o) : this.useStyle(o) : a === "shape" ? R(this.shape, o) : e.prototype.attrKV.call(this, a, o);
		}
		this.style || this.useStyle({});
	}, t.prototype.getDefaultStyle = function() {
		return null;
	}, t.prototype.getDefaultShape = function() {
		return {};
	}, t.prototype.canBeInsideText = function() {
		return this.hasFill();
	}, t.prototype.getInsideTextFill = function() {
		var e = this.style.fill;
		if (e !== "none") {
			if (W(e)) {
				var t = va(e, 0);
				return t > .5 ? go : t > .2 ? vo : _o;
			} else if (e) return _o;
		}
		return go;
	}, t.prototype.getInsideTextStroke = function(e) {
		var t = this.style.fill;
		if (W(t)) {
			var n = this.__zr;
			if (!!(n && n.isDarkMode()) == va(e, 0) < .4) return t;
		}
	}, t.prototype.buildPath = function(e, t, n) {}, t.prototype.pathUpdated = function() {
		this.__dirty &= -5;
	}, t.prototype.getUpdatedPathProxy = function(e) {
		return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, e), this.path;
	}, t.prototype.createPathProxy = function() {
		this.path = new Cs(!1);
	}, t.prototype.hasStroke = function() {
		var e = this.style, t = e.stroke;
		return !(t == null || t === "none" || !(e.lineWidth > 0));
	}, t.prototype.hasFill = function() {
		var e = this.style.fill;
		return e != null && e !== "none";
	}, t.prototype.getBoundingRect = function() {
		var e = this._rect, t = this.style, n = !e;
		if (n) {
			var r = !1;
			this.path || (r = !0, this.createPathProxy());
			var i = this.path;
			(r || this.__dirty & 4) && (i.beginPath(), this.buildPath(i, this.shape, !1), this.pathUpdated()), e = i.getBoundingRect();
		}
		if (this._rect = e, this.hasStroke() && this.path && this.path.len() > 0) {
			var a = this._rectStroke ||= e.clone();
			if (this.__dirty || n) {
				a.copy(e);
				var o = t.strokeNoScale ? this.getLineScale() : 1, s = t.lineWidth;
				if (!this.hasFill()) {
					var c = this.strokeContainThreshold;
					s = Math.max(s, c ?? 4);
				}
				o > 1e-10 && (a.width += s / o, a.height += s / o, a.x -= s / o / 2, a.y -= s / o / 2);
			}
			return a;
		}
		return e;
	}, t.prototype.contain = function(e, t) {
		var n = this.transformCoordToLocal(e, t), r = this.getBoundingRect(), i = this.style;
		if (e = n[0], t = n[1], r.contain(e, t)) {
			var a = this.path;
			if (this.hasStroke()) {
				var o = i.lineWidth, s = i.strokeNoScale ? this.getLineScale() : 1;
				if (s > 1e-10 && (this.hasFill() || (o = Math.max(o, this.strokeContainThreshold)), Ws(a, o / s, e, t))) return !0;
			}
			if (this.hasFill()) return Us(a, e, t);
		}
		return !1;
	}, t.prototype.dirtyShape = function() {
		this.__dirty |= 4, this._rect &&= null, this._decalEl && this._decalEl.dirtyShape(), this.markRedraw();
	}, t.prototype.dirty = function() {
		this.dirtyStyle(), this.dirtyShape();
	}, t.prototype.animateShape = function(e) {
		return this.animate("shape", e);
	}, t.prototype.updateDuringAnimation = function(e) {
		e === "style" ? this.dirtyStyle() : e === "shape" ? this.dirtyShape() : this.markRedraw();
	}, t.prototype.attrKV = function(t, n) {
		t === "shape" ? this.setShape(n) : e.prototype.attrKV.call(this, t, n);
	}, t.prototype.setShape = function(e, t) {
		var n = this.shape;
		return n ||= this.shape = {}, typeof e == "string" ? n[e] = t : R(n, e), this.dirtyShape(), this;
	}, t.prototype.shapeChanged = function() {
		return !!(this.__dirty & 4);
	}, t.prototype.createStyle = function(e) {
		return ln(Gs, e);
	}, t.prototype._innerSaveToNormal = function(t) {
		e.prototype._innerSaveToNormal.call(this, t);
		var n = this._normalState;
		t.shape && !n.shape && (n.shape = R({}, this.shape));
	}, t.prototype._applyStateObj = function(t, n, r, i, a, o) {
		if (e.prototype._applyStateObj.call(this, t, n, r, i, a, o), this.__inHover !== 1) {
			var s = !(n && i), c;
			if (n && n.shape ? a ? i ? c = n.shape : (c = R({}, r.shape), R(c, n.shape)) : (c = R({}, i ? this.shape : r.shape), R(c, n.shape)) : s && (c = r.shape), c) if (a) {
				this.shape = R({}, this.shape);
				for (var l = {}, u = V(c), d = 0; d < u.length; d++) {
					var f = u[d];
					typeof c[f] == "object" ? this.shape[f] = c[f] : l[f] = c[f];
				}
				this._transitionState(t, { shape: l }, o);
			} else this.shape = c, this.dirtyShape();
		}
	}, t.prototype._mergeStates = function(t) {
		for (var n = e.prototype._mergeStates.call(this, t), r, i = 0; i < t.length; i++) {
			var a = t[i];
			a.shape && (r ||= {}, this._mergeStyle(r, a.shape));
		}
		return r && (n.shape = r), n;
	}, t.prototype.getAnimationStyleProps = function() {
		return Ks;
	}, t.prototype.isZeroArea = function() {
		return !1;
	}, t.extend = function(e) {
		var n = function(t) {
			I(n, t);
			function n(n) {
				var r = t.call(this, n) || this;
				return e.init && e.init.call(r, n), r;
			}
			return n.prototype.getDefaultStyle = function() {
				return L(e.style);
			}, n.prototype.getDefaultShape = function() {
				return L(e.shape);
			}, n;
		}(t);
		for (var r in e) typeof e[r] == "function" && (n.prototype[r] = e[r]);
		return n;
	}, t.initDefaultProps = (function() {
		var e = t.prototype;
		e.type = "path", e.strokeContainThreshold = 5, e.segmentIgnoreThreshold = 0, e.subPixelOptimize = !1, e.autoBatch = !1, e.__dirty = 7;
	})(), t;
}(Vo), Ys = At({
	strokeFirst: !0,
	font: ot,
	x: 0,
	y: 0,
	textAlign: "left",
	textBaseline: "top",
	miterLimit: 2
}, Gs), Xs = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.hasStroke = function() {
		return pi(this.style);
	}, t.prototype.hasFill = function() {
		var e = this.style.fill;
		return e != null && e !== "none";
	}, t.prototype.createStyle = function(e) {
		return ln(Ys, e);
	}, t.prototype.setBoundingRect = function(e) {
		this._rect = e;
	}, t.prototype.getBoundingRect = function() {
		return this._rect ||= di(this.style), this._rect;
	}, t.initDefaultProps = (function() {
		var e = t.prototype;
		e.dirtyRectTolerance = 10;
	})(), t;
}(Vo);
Xs.prototype.type = "tspan";
//#endregion
//#region node_modules/zrender/lib/graphic/Image.js
var Zs = At({
	x: 0,
	y: 0
}, Lo), Qs = { style: At({
	x: !0,
	y: !0,
	width: !0,
	height: !0,
	sx: !0,
	sy: !0,
	sWidth: !0,
	sHeight: !0
}, Ro.style) };
function $s(e) {
	return !!(e && typeof e != "string" && e.width && e.height);
}
var ec = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.createStyle = function(e) {
		return ln(Zs, e);
	}, t.prototype._getSize = function(e) {
		var t = this.style, n = t[e];
		if (n != null) return n;
		var r = $s(t.image) ? t.image : this.__image;
		if (!r) return 0;
		var i = e === "width" ? "height" : "width", a = t[i];
		return a == null ? r[e] : r[e] / r[i] * a;
	}, t.prototype.getWidth = function() {
		return this._getSize("width");
	}, t.prototype.getHeight = function() {
		return this._getSize("height");
	}, t.prototype.getAnimationStyleProps = function() {
		return Qs;
	}, t.prototype.getBoundingRect = function() {
		var e = this.style;
		return this._rect ||= new X(e.x || 0, e.y || 0, this.getWidth(), this.getHeight()), this._rect;
	}, t;
}(Vo);
ec.prototype.type = "image";
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundRect.js
function tc(e, t) {
	var n = t.x, r = t.y, i = t.width, a = t.height, o = t.r, s, c, l, u;
	i < 0 && (n += i, i = -i), a < 0 && (r += a, a = -a), typeof o == "number" ? s = c = l = u = o : o instanceof Array ? o.length === 1 ? s = c = l = u = o[0] : o.length === 2 ? (s = l = o[0], c = u = o[1]) : o.length === 3 ? (s = o[0], c = u = o[1], l = o[2]) : (s = o[0], c = o[1], l = o[2], u = o[3]) : s = c = l = u = 0;
	var d;
	s + c > i && (d = s + c, s *= i / d, c *= i / d), l + u > i && (d = l + u, l *= i / d, u *= i / d), c + l > a && (d = c + l, c *= a / d, l *= a / d), s + u > a && (d = s + u, s *= a / d, u *= a / d), e.moveTo(n + s, r), e.lineTo(n + i - c, r), c !== 0 && e.arc(n + i - c, r + c, c, -Math.PI / 2, 0), e.lineTo(n + i, r + a - l), l !== 0 && e.arc(n + i - l, r + a - l, l, 0, Math.PI / 2), e.lineTo(n + u, r + a), u !== 0 && e.arc(n + u, r + a - u, u, Math.PI / 2, Math.PI), e.lineTo(n, r + s), s !== 0 && e.arc(n + s, r + s, s, Math.PI, Math.PI * 1.5), e.closePath();
}
//#endregion
//#region node_modules/zrender/lib/graphic/helper/subPixelOptimize.js
var nc = Math.round;
function rc(e, t, n) {
	if (t) {
		var r = t.x1, i = t.x2, a = t.y1, o = t.y2;
		e.x1 = r, e.x2 = i, e.y1 = a, e.y2 = o;
		var s = n && n.lineWidth;
		return s ? (nc(r * 2) === nc(i * 2) && (e.x1 = e.x2 = ac(r, s, !0)), nc(a * 2) === nc(o * 2) && (e.y1 = e.y2 = ac(a, s, !0)), e) : e;
	}
}
function ic(e, t, n) {
	if (t) {
		var r = t.x, i = t.y, a = t.width, o = t.height;
		e.x = r, e.y = i, e.width = a, e.height = o;
		var s = n && n.lineWidth;
		return s ? (e.x = ac(r, s, !0), e.y = ac(i, s, !0), e.width = Math.max(ac(r + a, s, !1) - e.x, a === 0 ? 0 : 1), e.height = Math.max(ac(i + o, s, !1) - e.y, o === 0 ? 0 : 1), e) : e;
	}
}
function ac(e, t, n) {
	if (!t) return e;
	var r = nc(e * 2);
	return (r + nc(t)) % 2 == 0 ? r / 2 : (r + (n ? 1 : -1)) / 2;
}
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Rect.js
var oc = function() {
	function e() {
		this.x = 0, this.y = 0, this.width = 0, this.height = 0;
	}
	return e;
}(), sc = {}, cc = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new oc();
	}, t.prototype.buildPath = function(e, t) {
		var n, r, i, a;
		if (this.subPixelOptimize) {
			var o = ic(sc, t, this.style);
			n = o.x, r = o.y, i = o.width, a = o.height, o.r = t.r, t = o;
		} else n = t.x, r = t.y, i = t.width, a = t.height;
		t.r ? tc(e, t) : e.rect(n, r, i, a);
	}, t.prototype.isZeroArea = function() {
		return !this.shape.width || !this.shape.height;
	}, t;
}(Js);
cc.prototype.type = "rect";
//#endregion
//#region node_modules/zrender/lib/graphic/Text.js
var lc = { fill: "#000" }, uc = 2, dc = {}, fc = { style: At({
	fill: !0,
	stroke: !0,
	fillOpacity: !0,
	strokeOpacity: !0,
	lineWidth: !0,
	fontSize: !0,
	lineHeight: !0,
	width: !0,
	height: !0,
	textShadowColor: !0,
	textShadowBlur: !0,
	textShadowOffsetX: !0,
	textShadowOffsetY: !0,
	backgroundColor: !0,
	padding: !0,
	borderColor: !0,
	borderWidth: !0,
	borderRadius: !0
}, Ro.style) }, pc = function(e) {
	I(t, e);
	function t(t) {
		var n = e.call(this) || this;
		return n.type = "text", n._children = [], n._defaultStyle = lc, n.attr(t), n;
	}
	return t.prototype.childrenRef = function() {
		return this._children;
	}, t.prototype.update = function() {
		e.prototype.update.call(this), this.styleChanged() && this._updateSubTexts();
		for (var t = 0; t < this._children.length; t++) {
			var n = this._children[t];
			n.zlevel = this.zlevel, n.z = this.z, n.z2 = this.z2, n.culling = this.culling, n.cursor = this.cursor, n.invisible = this.invisible;
		}
	}, t.prototype.updateTransform = function() {
		var t = this.innerTransformable;
		t ? (t.updateTransform(), t.transform && (this.transform = t.transform)) : e.prototype.updateTransform.call(this);
	}, t.prototype.getLocalTransform = function(t) {
		var n = this.innerTransformable;
		return n ? n.getLocalTransform(t) : e.prototype.getLocalTransform.call(this, t);
	}, t.prototype.getComputedTransform = function() {
		return this.__hostTarget && (this.__hostTarget.getComputedTransform(), this.__hostTarget.updateInnerText(!0)), e.prototype.getComputedTransform.call(this);
	}, t.prototype._updateSubTexts = function() {
		this._childCursor = 0, bc(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
	}, t.prototype.addSelfToZr = function(t) {
		e.prototype.addSelfToZr.call(this, t);
		for (var n = 0; n < this._children.length; n++) this._children[n].__zr = t;
	}, t.prototype.removeSelfFromZr = function(t) {
		e.prototype.removeSelfFromZr.call(this, t);
		for (var n = 0; n < this._children.length; n++) this._children[n].__zr = null;
	}, t.prototype.getBoundingRect = function() {
		if (this.styleChanged() && this._updateSubTexts(), !this._rect) {
			for (var e = new X(0, 0, 0, 0), t = this._children, n = [], r = null, i = 0; i < t.length; i++) {
				var a = t[i], o = a.getBoundingRect(), s = a.getLocalTransform(n);
				s ? (e.copy(o), e.applyTransform(s), r ||= e.clone(), r.union(e)) : (r ||= o.clone(), r.union(o));
			}
			this._rect = r || e;
		}
		return this._rect;
	}, t.prototype.setDefaultTextStyle = function(e) {
		this._defaultStyle = e || lc;
	}, t.prototype.setTextContent = function(e) {
		if (process.env.NODE_ENV !== "production") throw Error("Can't attach text on another text");
	}, t.prototype._mergeStyle = function(e, t) {
		if (!t) return e;
		var n = t.rich, r = e.rich || n && {};
		return R(e, t), n && r ? (this._mergeRich(r, n), e.rich = r) : r && (e.rich = r), e;
	}, t.prototype._mergeRich = function(e, t) {
		for (var n = V(t), r = 0; r < n.length; r++) {
			var i = n[r];
			e[i] = e[i] || {}, R(e[i], t[i]);
		}
	}, t.prototype.getAnimationStyleProps = function() {
		return fc;
	}, t.prototype._getOrCreateChild = function(e) {
		var t = this._children[this._childCursor];
		return (!t || !(t instanceof e)) && (t = new e()), this._children[this._childCursor++] = t, t.__zr = this.__zr, t.parent = this, t;
	}, t.prototype._updatePlainTexts = function() {
		var e = this.style, t = e.font || "12px sans-serif", n = e.padding, r = this._defaultStyle, i = e.x || 0, a = e.y || 0, o = e.align || r.align || "left", s = e.verticalAlign || r.verticalAlign || "top";
		si(dc, r.overflowRect, i, a, o, s), i = dc.baseX, a = dc.baseY;
		var c = Zr(Tc(e), e, dc.outerWidth, dc.outerHeight), l = Ec(e), u = !!e.backgroundColor, d = c.outerHeight, f = c.outerWidth, p = c.lines, m = c.lineHeight;
		this.isTruncated = !!c.isTruncated;
		var h = i, g = Hr(a, c.contentHeight, s);
		if (l || n) {
			var _ = Vr(i, f, o), v = Hr(a, d, s);
			l && this._renderBackground(e, e, _, v, f, d);
		}
		g += m / 2, n && (h = wc(i, o, n), s === "top" ? g += n[0] : s === "bottom" && (g -= n[2]));
		for (var y = 0, b = !1, x = !1, S = Cc("fill" in e ? e.fill : (x = !0, r.fill)), C = Sc("stroke" in e ? e.stroke : !u && (!r.autoStroke || x) ? (y = uc, b = !0, r.stroke) : null), w = e.textShadowBlur > 0, T = 0; T < p.length; T++) {
			var E = this._getOrCreateChild(Xs), D = E.createStyle();
			E.useStyle(D), D.text = p[T], D.x = h, D.y = g, o && (D.textAlign = o), D.textBaseline = "middle", D.opacity = e.opacity, D.strokeFirst = !0, w && (D.shadowBlur = e.textShadowBlur || 0, D.shadowColor = e.textShadowColor || "transparent", D.shadowOffsetX = e.textShadowOffsetX || 0, D.shadowOffsetY = e.textShadowOffsetY || 0), D.stroke = C, D.fill = S, C && (D.lineWidth = e.lineWidth || y, D.lineDash = e.lineDash, D.lineDashOffset = e.lineDashOffset || 0), D.font = t, vc(D, e), g += m, E.setBoundingRect(fi(D, c.contentWidth, c.calculatedLineHeight, b ? 0 : null));
		}
	}, t.prototype._updateRichTexts = function() {
		var e = this.style, t = this._defaultStyle, n = e.align || t.align, r = e.verticalAlign || t.verticalAlign, i = e.x || 0, a = e.y || 0;
		si(dc, t.overflowRect, i, a, n, r), i = dc.baseX, a = dc.baseY;
		var o = ti(Tc(e), e, dc.outerWidth, dc.outerHeight, n), s = o.width, c = o.outerWidth, l = o.outerHeight, u = e.padding;
		this.isTruncated = !!o.isTruncated;
		var d = Vr(i, c, n), f = Hr(a, l, r), p = d, m = f;
		u && (p += u[3], m += u[0]);
		var h = p + s;
		Ec(e) && this._renderBackground(e, e, d, f, c, l);
		for (var g = !!e.backgroundColor, _ = 0; _ < o.lines.length; _++) {
			for (var v = o.lines[_], y = v.tokens, b = y.length, x = v.lineHeight, S = v.width, C = 0, w = p, T = h, E = b - 1, D = void 0; C < b && (D = y[C], !D.align || D.align === "left");) this._placeToken(D, e, x, m, w, "left", g), S -= D.width, w += D.width, C++;
			for (; E >= 0 && (D = y[E], D.align === "right");) this._placeToken(D, e, x, m, T, "right", g), S -= D.width, T -= D.width, E--;
			for (w += (s - (w - p) - (h - T) - S) / 2; C <= E;) D = y[C], this._placeToken(D, e, x, m, w + D.width / 2, "center", g), w += D.width, C++;
			m += x;
		}
	}, t.prototype._placeToken = function(e, t, n, r, i, a, o) {
		var s = t.rich[e.styleName] || {};
		s.text = e.text;
		var c = e.verticalAlign, l = r + n / 2;
		c === "top" ? l = r + e.height / 2 : c === "bottom" && (l = r + n - e.height / 2), !e.isLineHolder && Ec(s) && this._renderBackground(s, t, a === "right" ? i - e.width : a === "center" ? i - e.width / 2 : i, l - e.height / 2, e.width, e.height);
		var u = !!s.backgroundColor, d = e.textPadding;
		d && (i = wc(i, a, d), l -= e.height / 2 - d[0] - e.innerHeight / 2);
		var f = this._getOrCreateChild(Xs), p = f.createStyle();
		f.useStyle(p);
		var m = this._defaultStyle, h = !1, g = 0, _ = !1, v = Cc("fill" in s ? s.fill : "fill" in t ? t.fill : (h = !0, m.fill)), y = Sc("stroke" in s ? s.stroke : "stroke" in t ? t.stroke : !u && !o && (!m.autoStroke || h) ? (g = uc, _ = !0, m.stroke) : null), b = s.textShadowBlur > 0 || t.textShadowBlur > 0;
		p.text = e.text, p.x = i, p.y = l, b && (p.shadowBlur = s.textShadowBlur || t.textShadowBlur || 0, p.shadowColor = s.textShadowColor || t.textShadowColor || "transparent", p.shadowOffsetX = s.textShadowOffsetX || t.textShadowOffsetX || 0, p.shadowOffsetY = s.textShadowOffsetY || t.textShadowOffsetY || 0), p.textAlign = a, p.textBaseline = "middle", p.font = e.font || "12px sans-serif", p.opacity = Xt(s.opacity, t.opacity, 1), vc(p, s), y && (p.lineWidth = Xt(s.lineWidth, t.lineWidth, g), p.lineDash = K(s.lineDash, t.lineDash), p.lineDashOffset = t.lineDashOffset || 0, p.stroke = y), v && (p.fill = v), f.setBoundingRect(fi(p, e.contentWidth, e.contentHeight, _ ? 0 : null));
	}, t.prototype._renderBackground = function(e, t, n, r, i, a) {
		var o = e.backgroundColor, s = e.borderWidth, c = e.borderColor, l = o && o.image, u = o && !l, d = e.borderRadius, f = this, p, m;
		if (u || e.lineHeight || s && c) {
			p = this._getOrCreateChild(cc), p.useStyle(p.createStyle()), p.style.fill = null;
			var h = p.shape;
			h.x = n, h.y = r, h.width = i, h.height = a, h.r = d, p.dirtyShape();
		}
		if (u) {
			var g = p.style;
			g.fill = o || null, g.fillOpacity = K(e.fillOpacity, 1);
		} else if (l) {
			m = this._getOrCreateChild(ec), m.onload = function() {
				f.dirtyStyle();
			};
			var _ = m.style;
			_.image = o.image, _.x = n, _.y = r, _.width = i, _.height = a;
		}
		if (s && c) {
			var g = p.style;
			g.lineWidth = s, g.stroke = c, g.strokeOpacity = K(e.strokeOpacity, 1), g.lineDash = e.borderDash, g.lineDashOffset = e.borderDashOffset || 0, p.strokeContainThreshold = 0, p.hasFill() && p.hasStroke() && (g.strokeFirst = !0, g.lineWidth *= 2);
		}
		var v = (p || m).style;
		v.shadowBlur = e.shadowBlur || 0, v.shadowColor = e.shadowColor || "transparent", v.shadowOffsetX = e.shadowOffsetX || 0, v.shadowOffsetY = e.shadowOffsetY || 0, v.opacity = Xt(e.opacity, t.opacity, 1);
	}, t.makeFont = function(e) {
		var t = "";
		return yc(e) && (t = [
			e.fontStyle,
			e.fontWeight,
			_c(e.fontSize),
			e.fontFamily || "sans-serif"
		].join(" ")), t && $t(t) || e.textFont || e.font;
	}, t;
}(Vo), mc = {
	left: !0,
	right: 1,
	center: 1
}, hc = {
	top: 1,
	bottom: 1,
	middle: 1
}, gc = [
	"fontStyle",
	"fontWeight",
	"fontSize",
	"fontFamily"
];
function _c(e) {
	return typeof e == "string" && (e.indexOf("px") !== -1 || e.indexOf("rem") !== -1 || e.indexOf("em") !== -1) ? e : isNaN(+e) ? "12px" : e + "px";
}
function vc(e, t) {
	for (var n = 0; n < gc.length; n++) {
		var r = gc[n], i = t[r];
		i != null && (e[r] = i);
	}
}
function yc(e) {
	return e.fontSize != null || e.fontFamily || e.fontWeight;
}
function bc(e) {
	return xc(e), z(e.rich, xc), e;
}
function xc(e) {
	if (e) {
		e.font = pc.makeFont(e);
		var t = e.align;
		t === "middle" && (t = "center"), e.align = t == null || mc[t] ? t : "left";
		var n = e.verticalAlign;
		n === "center" && (n = "middle"), e.verticalAlign = n == null || hc[n] ? n : "top", e.padding &&= Qt(e.padding);
	}
}
function Sc(e, t) {
	return e == null || t <= 0 || e === "transparent" || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function Cc(e) {
	return e == null || e === "none" ? null : e.image || e.colorStops ? "#000" : e;
}
function wc(e, t, n) {
	return t === "right" ? e - n[1] : t === "center" ? e + n[3] / 2 - n[1] / 2 : e + n[3];
}
function Tc(e) {
	var t = e.text;
	return t != null && (t += ""), t;
}
function Ec(e) {
	return !!(e.backgroundColor || e.lineHeight || e.borderWidth && e.borderColor);
}
//#endregion
//#region node_modules/echarts/lib/util/number.js
var Dc = 1e-4, Oc = 20;
function kc(e) {
	return e.replace(/^\s+|\s+$/g, "");
}
var Ac = Math.min, jc = Math.max, Mc = Math.abs, Nc = Math.round, Pc = Math.floor, Fc = Math.ceil, Ic = Math.pow, Lc = Math.log, Rc = Math.LN10, zc = Math.PI, Bc = Math.random;
function Vc(e, t, n, r) {
	var i = t[0], a = t[1], o = n[0], s = n[1], c = a - i, l = s - o;
	if (c === 0) return l === 0 ? o : (o + s) / 2;
	if (r) {
		if (c > 0) {
			if (e <= i) return o;
			if (e >= a) return s;
		} else if (e >= i) return o;
		else if (e <= a) return s;
	} else {
		if (e === i) return o;
		if (e === a) return s;
	}
	return (e - i) / c * l + o;
}
var Hc = Uc;
function Uc(e, t, n) {
	switch (e) {
		case "center":
		case "middle":
			e = "50%";
			break;
		case "left":
		case "top":
			e = "0%";
			break;
		case "right":
		case "bottom":
			e = "100%";
			break;
	}
	return Wc(e, t, n);
}
function Wc(e, t, n) {
	return W(e) ? Gc(e) ? parseFloat(e) / 100 * t + (n || 0) : parseFloat(e) : e == null ? NaN : +e;
}
function Gc(e) {
	return !!kc(e).match(/%$/);
}
function Kc(e, t, n) {
	return process.env.NODE_ENV !== "production" && q(t != null), isNaN(t) ? n ? "" + e : +e : (t = Ac(jc(0, t), Oc), e = (+e).toFixed(t), n ? e : +e);
}
function qc(e) {
	return e.sort(function(e, t) {
		return e - t;
	}), e;
}
function Jc(e) {
	if (e = +e, isNaN(e)) return 0;
	if (e > 1e-14) {
		for (var t = 1, n = 0; n < 15; n++, t *= 10) if (Nc(e * t) / t === e) return n;
	}
	return Yc(e);
}
function Yc(e) {
	var t = e.toString().toLowerCase(), n = t.indexOf("e"), r = n > 0 ? +t.slice(n + 1) : 0, i = n > 0 ? n : t.length, a = t.indexOf(".");
	return jc(0, (a < 0 ? 0 : i - 1 - a) - r);
}
function Xc(e, t, n) {
	var r = Mc(e[1] - e[0]);
	if (!isFinite(r) || r === 0) return NaN;
	var i = Lc(2 * Mc(n || 1) * Mc(r)) / Rc, a = Lc(Mc(t)) / Rc, o = jc(0, Fc(-i + a));
	return isFinite(o) || (o = NaN), o;
}
function Zc(e, t) {
	var n = jc(Jc(e), Jc(t)), r = e + t;
	return n > Oc ? r : Kc(r, n);
}
var Qc = Ic(2, 53) - 1;
function $c(e) {
	var t = zc * 2;
	return (e % t + t) % t;
}
function el(e) {
	return e > -Dc && e < Dc;
}
var tl = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
function nl(e) {
	if (e instanceof Date) return e;
	if (W(e)) {
		var t = tl.exec(e);
		if (!t) return /* @__PURE__ */ new Date(NaN);
		if (t[8]) {
			var n = +t[4] || 0;
			return t[8].toUpperCase() !== "Z" && (n -= +t[8].slice(0, 3)), new Date(Date.UTC(+t[1], (t[2] || 1) - 1, +t[3] || 1, n, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0));
		} else return new Date(+t[1], (t[2] || 1) - 1, +t[3] || 1, +t[4] || 0, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0);
	} else if (e == null) return /* @__PURE__ */ new Date(NaN);
	return new Date(Nc(e));
}
function rl(e) {
	return Ic(10, il(e));
}
function il(e) {
	if (e === 0) return 0;
	var t = Pc(Lc(e) / Rc);
	return e / Ic(10, t) >= 10 && t++, t;
}
function al(e, t) {
	var n = il(e), r = Ic(10, n), i = e / r;
	return e = (t === 2 ? 1 : t ? i < 1.5 ? 1 : i < 2.5 ? 2 : i < 4 ? 3 : i < 7 ? 5 : 10 : i < 1 ? 1 : i < 2 ? 2 : i < 3 ? 3 : i < 5 ? 5 : 10) * r, Kc(e, -n);
}
function ol(e) {
	var t = parseFloat(e);
	return t == e && (t !== 0 || !W(e) || e.indexOf("x") <= 0) ? t : NaN;
}
function sl(e) {
	return !isNaN(ol(e));
}
function cl() {
	return Nc(Bc() * 9);
}
function ll(e, t) {
	return t === 0 ? e : ll(t, e % t);
}
function ul(e, t) {
	return e == null ? t : t == null ? e : e * t / ll(e, t);
}
function dl(e) {
	return e != null && isFinite(e);
}
//#endregion
//#region node_modules/echarts/lib/util/log.js
var fl = "[ECharts] ", pl = {}, ml = typeof console < "u" && console.warn && console.log;
function hl(e, t, n) {
	if (ml) {
		if (n) {
			if (pl[t]) return;
			pl[t] = !0;
		}
		console[e](fl + t);
	}
}
function gl(e, t) {
	hl("log", e, t);
}
function _l(e, t) {
	hl("warn", e, t);
}
function vl(e, t) {
	hl("error", e, t);
}
function yl(e) {
	process.env.NODE_ENV !== "production" && hl("warn", "DEPRECATED: " + e, !0);
}
function bl(e, t, n) {
	process.env.NODE_ENV !== "production" && yl((n ? "[" + n + "]" : "") + (e + " is deprecated; use " + t + " instead."));
}
function xl() {
	var e = [...arguments], t = "";
	if (process.env.NODE_ENV !== "production") {
		var n = function(e) {
			return e === void 0 ? "undefined" : e === Infinity ? "Infinity" : e === -Infinity ? "-Infinity" : Jt(e) ? "NaN" : e instanceof Date ? "Date(" + e.toISOString() + ")" : U(e) ? "function () { ... }" : qt(e) ? e + "" : null;
		};
		t = B(e, function(e) {
			if (W(e)) return e;
			var t = n(e);
			if (t != null) return t;
			if (typeof JSON < "u" && JSON.stringify) try {
				return JSON.stringify(e, function(e, t) {
					return n(t) ?? t;
				});
			} catch {
				return "?";
			}
			else return "?";
		}).join(" ");
	}
	return t;
}
function Sl(e) {
	throw Error(e);
}
//#endregion
//#region node_modules/echarts/lib/util/model.js
var Cl = "series\0", wl = "\0_ec_\0";
function Tl(e) {
	return e instanceof Array ? e : e == null ? [] : [e];
}
function El(e, t, n) {
	if (e) {
		e[t] = e[t] || {}, e.emphasis = e.emphasis || {}, e.emphasis[t] = e.emphasis[t] || {};
		for (var r = 0, i = n.length; r < i; r++) {
			var a = n[r];
			!e.emphasis[t].hasOwnProperty(a) && e[t].hasOwnProperty(a) && (e.emphasis[t][a] = e[t][a]);
		}
	}
}
var Dl = /* @__PURE__ */ "fontStyle.fontWeight.fontSize.fontFamily.rich.tag.color.textBorderColor.textBorderWidth.width.height.lineHeight.align.verticalAlign.baseline.shadowColor.shadowBlur.shadowOffsetX.shadowOffsetY.textShadowColor.textShadowBlur.textShadowOffsetX.textShadowOffsetY.backgroundColor.borderColor.borderWidth.borderRadius.padding".split(".");
function Ol(e) {
	return G(e) && !H(e) && !(e instanceof Date) ? e.value : e;
}
function kl(e) {
	return G(e) && !(e instanceof Array);
}
function Al(e, t, n) {
	var r = n === "normalMerge", i = n === "replaceMerge", a = n === "replaceAll";
	e ||= [], t = (t || []).slice();
	var o = J();
	z(t, function(e, n) {
		if (!G(e)) {
			t[n] = null;
			return;
		}
		process.env.NODE_ENV !== "production" && (e.id != null && !Vl(e.id) && Bl(e.id), e.name != null && !Vl(e.name) && Bl(e.name));
	});
	var s = jl(e, o, n);
	return (r || i) && Ml(s, e, o, t), r && Nl(s, t), r || i ? Pl(s, t, i) : a && Fl(s, t), Il(s), s;
}
function jl(e, t, n) {
	var r = [];
	if (n === "replaceAll") return r;
	for (var i = 0; i < e.length; i++) {
		var a = e[i];
		a && a.id != null && t.set(a.id, i), r.push({
			existing: n === "replaceMerge" || Ul(a) ? null : a,
			newOption: null,
			keyInfo: null,
			brandNew: null
		});
	}
	return r;
}
function Ml(e, t, n, r) {
	z(r, function(i, a) {
		if (!(!i || i.id == null)) {
			var o = Rl(i.id), s = n.get(o);
			if (s != null) {
				var c = e[s];
				q(!c.newOption, "Duplicated option on id \"" + o + "\"."), c.newOption = i, c.existing = t[s], r[a] = null;
			}
		}
	});
}
function Nl(e, t) {
	z(t, function(n, r) {
		if (!(!n || n.name == null)) for (var i = 0; i < e.length; i++) {
			var a = e[i].existing;
			if (!e[i].newOption && a && (a.id == null || n.id == null) && !Ul(n) && !Ul(a) && Ll("name", a, n)) {
				e[i].newOption = n, t[r] = null;
				return;
			}
		}
	});
}
function Pl(e, t, n) {
	z(t, function(t) {
		if (t) {
			for (var r, i = 0; (r = e[i]) && (r.newOption || Ul(r.existing) || r.existing && t.id != null && !Ll("id", t, r.existing));) i++;
			r ? (r.newOption = t, r.brandNew = n) : e.push({
				newOption: t,
				brandNew: n,
				existing: null,
				keyInfo: null
			}), i++;
		}
	});
}
function Fl(e, t) {
	z(t, function(t) {
		e.push({
			newOption: t,
			brandNew: !0,
			existing: null,
			keyInfo: null
		});
	});
}
function Il(e) {
	var t = J();
	z(e, function(e) {
		var n = e.existing;
		n && t.set(n.id, e);
	}), z(e, function(e) {
		var n = e.newOption;
		q(!n || n.id == null || !t.get(n.id) || t.get(n.id) === e, "id duplicates: " + (n && n.id)), n && n.id != null && t.set(n.id, e), !e.keyInfo && (e.keyInfo = {});
	}), z(e, function(e, n) {
		var r = e.existing, i = e.newOption, a = e.keyInfo;
		if (G(i)) {
			if (a.name = i.name == null ? r ? r.name : Cl + n : Rl(i.name), r) a.id = Rl(r.id);
			else if (i.id != null) a.id = Rl(i.id);
			else {
				var o = 0;
				do
					a.id = "\0" + a.name + "\0" + o++;
				while (t.get(a.id));
			}
			t.set(a.id, e);
		}
	});
}
function Ll(e, t, n) {
	var r = zl(t[e], null), i = zl(n[e], null);
	return r != null && i != null && r === i;
}
function Rl(e) {
	if (process.env.NODE_ENV !== "production" && e == null) throw Error();
	return zl(e, "");
}
function zl(e, t) {
	return e == null ? t : W(e) ? e : Ht(e) || Vt(e) ? e + "" : t;
}
function Bl(e) {
	process.env.NODE_ENV !== "production" && _l("`" + e + "` is invalid id or name. Must be a string or number.");
}
function Vl(e) {
	return Vt(e) || sl(e);
}
function Hl(e) {
	var t = e.name;
	return !!(t && t.indexOf(Cl));
}
function Ul(e) {
	return e && e.id != null && Rl(e.id).indexOf(wl) === 0;
}
function Wl(e, t, n) {
	z(e, function(e) {
		var r = e.newOption;
		G(r) && (e.keyInfo.mainType = t, e.keyInfo.subType = Gl(t, r, e.existing, n));
	});
}
function Gl(e, t, n, r) {
	return t.type ? t.type : n ? n.subType : r.determineSubType(e, t);
}
function Kl(e, t) {
	if (t.dataIndexInside != null) return t.dataIndexInside;
	if (t.dataIndex != null) return H(t.dataIndex) ? B(t.dataIndex, function(t) {
		return e.indexOfRawIndex(t);
	}) : e.indexOfRawIndex(t.dataIndex);
	if (t.name != null) return H(t.name) ? B(t.name, function(t) {
		return e.indexOfName(t);
	}) : e.indexOfName(t.name);
}
function ql() {
	var e = "__ec_inner_" + Jl++;
	return function(t) {
		return t[e] || (t[e] = {});
	};
}
var Jl = cl();
function Yl(e, t, n) {
	var r = Xl(t, n), i = r.mainTypeSpecified, a = r.queryOptionMap, o = r.others, s = n ? n.defaultMainType : null;
	return !i && s && a.set(s, {}), a.each(function(t, r) {
		var i = Ql(e, r, t, {
			useDefault: s === r,
			enableAll: n && n.enableAll != null ? n.enableAll : !0,
			enableNone: n && n.enableNone != null ? n.enableNone : !0
		});
		o[r + "Models"] = i.models, o[r + "Model"] = i.models[0];
	}), o;
}
function Xl(e, t) {
	var n;
	if (W(e)) {
		var r = {};
		r[e + "Index"] = 0, n = r;
	} else n = e;
	var i = J(), a = {}, o = !1;
	return z(n, function(e, n) {
		if (n === "dataIndex" || n === "dataIndexInside") {
			a[n] = e;
			return;
		}
		var r = n.match(/^(\w+)(Index|Id|Name)$/) || [], s = r[1], c = (r[2] || "").toLowerCase();
		if (!(!s || !c || t && t.includeMainTypes && jt(t.includeMainTypes, s) < 0)) {
			o ||= !!s;
			var l = i.get(s) || i.set(s, {});
			l[c] = e;
		}
	}), {
		mainTypeSpecified: o,
		queryOptionMap: i,
		others: a
	};
}
var Zl = {
	useDefault: !0,
	enableAll: !1,
	enableNone: !1
};
function Ql(e, t, n, r) {
	r ||= Zl;
	var i = n.index, a = n.id, o = n.name, s = {
		models: null,
		specified: i != null || a != null || o != null
	};
	if (!s.specified) {
		var c = void 0;
		return s.models = r.useDefault && (c = e.getComponent(t)) ? [c] : [], s;
	}
	if (i === "none" || i === !1) {
		if (r.enableNone) return s.models = [], s;
		process.env.NODE_ENV !== "production" && vl("`\"none\"` or `false` is not a valid value on index option."), i = -1;
	}
	return i === "all" && (r.enableAll ? i = a = o = null : (process.env.NODE_ENV !== "production" && vl("`\"all\"` is not a valid value on index option."), i = -1)), s.models = e.queryComponents({
		mainType: t,
		index: i,
		id: a,
		name: o
	}), s;
}
function $l(e, t, n) {
	process.env.NODE_ENV !== "production" && q(t);
	var r = {};
	r[t + "Id"] = e[t + "Id"], r[t + "Index"] = e[t + "Index"], r[t + "Name"] = e[t + "Name"];
	var i = {
		mainType: t,
		query: r
	};
	return n && (i.subType = n), i;
}
function eu(e, t, n) {
	e.setAttribute ? e.setAttribute(t, n) : e[t] = n;
}
function tu(e, t) {
	return e.getAttribute ? e.getAttribute(t) : e[t];
}
function nu(e) {
	return e === "auto" ? Y.domSupported ? "html" : "richText" : e || "html";
}
(function() {
	function e() {}
	return e.prototype.reset = function(e, t, n, r) {
		return this._list = e, this._step = r ||= 1, this._idx = t, this._end = n ?? (r > 0 ? e.length : 0), this.item = null, this.key = NaN, this;
	}, e.prototype.next = function() {
		return (this._step > 0 ? this._idx < this._end : this._idx >= this._end) ? (this.item = this._list[this._idx], this.key = this._idx += this._step, !0) : !1;
	}, e;
})();
function ru() {
	return [Infinity, -Infinity];
}
function iu(e, t) {
	cu(t) && (t < e[0] && (e[0] = t), t > e[1] && (e[1] = t));
}
function au(e, t) {
	cu(t) && t < e[0] && (e[0] = t);
}
function ou(e, t) {
	cu(t) && t > e[1] && (e[1] = t);
}
function su(e, t) {
	lu(t[0], t[1]) && (t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]));
}
function cu(e) {
	return e != null && isFinite(e);
}
function lu(e, t) {
	return cu(e) && cu(t) && e <= t;
}
function uu(e) {
	var t = e[1] - e[0];
	return isFinite(t) && t >= 0;
}
function du(e) {
	lu(e[0], e[1]) && e[0] > e[1] && (e[0] = e[1]);
}
function fu() {
	var e = "__ec_once_" + pu++;
	return function(t, n) {
		process.env.NODE_ENV !== "production" && q(t), un(t, e) || (t[e] = 1, n());
	};
}
var pu = cl();
function mu(e, t, n) {
	var r = J(), i = 0;
	z(e, function(a) {
		var o = t(a);
		process.env.NODE_ENV !== "production" && q(W(o));
		var s = r.get(o) || 0;
		n && n(a, s), !s && !n && (e[i++] = a), r.set(o, s + 1);
	}), n || (e.length = i);
}
function hu(e) {
	return process.env.NODE_ENV !== "production" && q(e.value != null), e.value + "";
}
function gu(e) {
	return process.env.NODE_ENV !== "production" && q(e != null), e + "";
}
function _u(e, t) {
	return K(t, !0) ? e.seriesIndex + 2 : 0;
}
function vu(e, t, n) {
	var r = e.getData().count();
	return {
		progressiveRender: n.progressiveEnabled && t.incrementalPrepareRender && r >= n.threshold,
		large: e.get("large") && r >= e.get("largeThreshold"),
		modDataCount: e.get("progressiveChunkMode") === "mod" ? e.getData().count() : null
	};
}
function yu(e) {
	return { overallReset: e };
}
//#endregion
//#region node_modules/echarts/lib/util/innerStore.js
var bu = ql(), xu = function(e, t, n, r) {
	if (r) {
		var i = bu(r);
		i.dataIndex = n, i.dataType = t, i.seriesIndex = e, i.ssrType = "chart", r.type === "group" && r.traverse(function(r) {
			var i = bu(r);
			i.seriesIndex = e, i.dataIndex = n, i.dataType = t, i.ssrType = "chart";
		});
	}
}, Su = J([
	"tooltip",
	"label",
	"itemName",
	"itemId",
	"itemGroupId",
	"itemChildGroupId",
	"seriesName"
]), Cu = "original", wu = "arrayRows", Tu = "objectRows", Eu = "keyedColumns", Du = "typedArray", Ou = "unknown", ku = "column", Au = [
	"getDom",
	"getZr",
	"getWidth",
	"getHeight",
	"getDevicePixelRatio",
	"dispatchAction",
	"isSSR",
	"isDisposed",
	"on",
	"off",
	"getDataURL",
	"getConnectedDataURL",
	"getOption",
	"getId",
	"updateLabelLayout"
], ju = function() {
	function e(e) {
		z(Au, function(t) {
			this[t] = zt(e[t], e);
		}, this);
	}
	return e;
}();
function Mu(e, t) {
	return t.mainType === "series" ? e.getViewOfSeriesModel(t) : e.getViewOfComponentModel(t);
}
//#endregion
//#region node_modules/echarts/lib/util/states.js
var Nu = 1, Pu = {}, Fu = ql(), Iu = ql(), Lu = [
	"emphasis",
	"blur",
	"select"
], Ru = [
	"normal",
	"emphasis",
	"blur",
	"select"
], zu = "highlight", Bu = "downplay", Vu = "select", Hu = "unselect", Uu = "toggleSelect", Wu = "selectchanged";
function Gu(e) {
	return e != null && e !== "none";
}
function Ku(e, t, n) {
	e.onHoverStateChange && (e.hoverState || 0) !== n && e.onHoverStateChange(t), e.hoverState = n;
}
function qu(e) {
	Ku(e, "emphasis", 2);
}
function Ju(e) {
	e.hoverState === 2 && Ku(e, "normal", 0);
}
function Yu(e) {
	Ku(e, "blur", 1);
}
function Xu(e) {
	e.hoverState === 1 && Ku(e, "normal", 0);
}
function Zu(e) {
	e.selected = !0;
}
function Qu(e) {
	e.selected = !1;
}
function $u(e, t, n) {
	t(e, n);
}
function ed(e, t, n) {
	$u(e, t, n), e.isGroup && e.traverse(function(e) {
		$u(e, t, n);
	});
}
function td(e, t, n, r) {
	for (var i = e.style, a = {}, o = 0; o < t.length; o++) {
		var s = t[o];
		a[s] = i[s] ?? (r && r[s]);
	}
	for (var o = 0; o < e.animators.length; o++) {
		var c = e.animators[o];
		c.__fromStateTransition && c.__fromStateTransition.indexOf(n) < 0 && c.targetName === "style" && c.saveTo(a, t);
	}
	return a;
}
function nd(e, t, n, r) {
	var i = n && jt(n, "select") >= 0, a = !1;
	if (e instanceof Js) {
		var o = Fu(e), s = i && o.selectFill || o.normalFill, c = i && o.selectStroke || o.normalStroke;
		if (Gu(s) || Gu(c)) {
			r ||= {};
			var l = r.style || {};
			l.fill === "inherit" ? (a = !0, r = R({}, r), l = R({}, l), l.fill = s) : !Gu(l.fill) && Gu(s) ? (a = !0, r = R({}, r), l = R({}, l), l.fill = ba(s)) : !Gu(l.stroke) && Gu(c) && (a || (r = R({}, r), l = R({}, l)), l.stroke = ba(c)), r.style = l;
		}
	}
	if (r && r.z2 == null) {
		a || (r = R({}, r));
		var u = e.z2EmphasisLift;
		r.z2 = e.z2 + (u ?? 10);
	}
	return r;
}
function rd(e, t, n) {
	if (n && n.z2 == null) {
		n = R({}, n);
		var r = e.z2SelectLift;
		n.z2 = e.z2 + (r ?? 9);
	}
	return n;
}
function id(e, t, n) {
	var r = jt(e.currentStates, t) >= 0, i = e.style.opacity, a = r ? null : td(e, ["opacity"], t, { opacity: 1 });
	n ||= {};
	var o = n.style || {};
	return o.opacity ?? (n = R({}, n), o = R({ opacity: r ? i : a.opacity * .1 }, o), n.style = o), n;
}
function ad(e, t) {
	var n = this.states[e];
	if (this.style) {
		if (e === "emphasis") return nd(this, e, t, n);
		if (e === "blur") return id(this, e, n);
		if (e === "select") return rd(this, e, n);
	}
	return n;
}
function od(e) {
	e.stateProxy = ad;
	var t = e.getTextContent(), n = e.getTextGuideLine();
	t && (t.stateProxy = ad), n && (n.stateProxy = ad);
}
function sd(e, t) {
	!hd(e, t) && !e.__highByOuter && ed(e, qu);
}
function cd(e, t) {
	!hd(e, t) && !e.__highByOuter && ed(e, Ju);
}
function ld(e, t) {
	e.__highByOuter |= 1 << (t || 0), ed(e, qu);
}
function ud(e, t) {
	!(e.__highByOuter &= ~(1 << (t || 0))) && ed(e, Ju);
}
function dd(e) {
	ed(e, Yu);
}
function fd(e) {
	ed(e, Xu);
}
function pd(e) {
	ed(e, Zu);
}
function md(e) {
	ed(e, Qu);
}
function hd(e, t) {
	return e.__highDownSilentOnTouch && t.zrByTouch;
}
function gd(e) {
	var t = e.getModel(), n = [], r = [];
	t.eachComponent(function(t, i) {
		var a = Iu(i), o = Mu(e, i), s = t === "series";
		!s && r.push(o), a.isBlured && (o.group.traverse(function(e) {
			Xu(e);
		}), s && n.push(i)), a.isBlured = !1;
	}), z(r, function(e) {
		e && e.toggleBlurSeries && e.toggleBlurSeries(n, !1, t);
	});
}
function _d(e, t, n, r) {
	var i = r.getModel();
	n ||= "coordinateSystem";
	function a(e, t) {
		for (var n = 0; n < t.length; n++) {
			var r = e.getItemGraphicEl(t[n]);
			r && fd(r);
		}
	}
	if (e != null && !(!t || t === "none")) {
		var o = i.getSeriesByIndex(e), s = o.coordinateSystem;
		s && s.master && (s = s.master);
		var c = [];
		i.eachSeries(function(e) {
			var i = o === e, l = e.coordinateSystem;
			if (l && l.master && (l = l.master), !(n === "series" && !i || n === "coordinateSystem" && !(l && s ? l === s : i) || t === "series" && i)) {
				if (r.getViewOfSeriesModel(e).group.traverse(function(e) {
					e.__highByOuter && i && t === "self" || Yu(e);
				}), Pt(t)) a(e.getData(), t);
				else if (G(t)) for (var u = V(t), d = 0; d < u.length; d++) a(e.getData(u[d]), t[u[d]]);
				c.push(e), Iu(e).isBlured = !0;
			}
		}), i.eachComponent(function(e, t) {
			if (e !== "series") {
				var n = r.getViewOfComponentModel(t);
				n && n.toggleBlurSeries && n.toggleBlurSeries(c, !0, i);
			}
		});
	}
}
function vd(e, t, n) {
	if (!(e == null || t == null)) {
		var r = n.getModel().getComponent(e, t);
		if (r) {
			Iu(r).isBlured = !0;
			var i = n.getViewOfComponentModel(r);
			!i || !i.focusBlurEnabled || i.group.traverse(function(e) {
				Yu(e);
			});
		}
	}
}
function yd(e, t, n) {
	var r = e.seriesIndex, i = e.getData(t.dataType);
	if (!i) {
		process.env.NODE_ENV !== "production" && vl("Unknown dataType " + t.dataType);
		return;
	}
	var a = Kl(i, t);
	a = (H(a) ? a[0] : a) || 0;
	var o = i.getItemGraphicEl(a);
	if (!o) for (var s = i.count(), c = 0; !o && c < s;) o = i.getItemGraphicEl(c++);
	if (o) {
		var l = bu(o);
		_d(r, l.focus, l.blurScope, n);
	} else {
		var u = e.get(["emphasis", "focus"]), d = e.get(["emphasis", "blurScope"]);
		u != null && _d(r, u, d, n);
	}
}
function bd(e, t, n, r) {
	var i = {
		focusSelf: !1,
		dispatchers: null
	};
	if (e == null || e === "series" || t == null || n == null) return i;
	var a = r.getModel().getComponent(e, t);
	if (!a) return i;
	var o = r.getViewOfComponentModel(a);
	if (!o || !o.findHighDownDispatchers) return i;
	for (var s = o.findHighDownDispatchers(n), c, l = 0; l < s.length; l++) if (process.env.NODE_ENV !== "production" && !Pd(s[l]) && vl("param should be highDownDispatcher"), bu(s[l]).focus === "self") {
		c = !0;
		break;
	}
	return {
		focusSelf: c,
		dispatchers: s
	};
}
function xd(e, t, n) {
	process.env.NODE_ENV !== "production" && !Pd(e) && vl("param should be highDownDispatcher");
	var r = bu(e), i = bd(r.componentMainType, r.componentIndex, r.componentHighDownName, n), a = i.dispatchers, o = i.focusSelf;
	a ? (o && vd(r.componentMainType, r.componentIndex, n), z(a, function(e) {
		return sd(e, t);
	})) : (_d(r.seriesIndex, r.focus, r.blurScope, n), r.focus === "self" && vd(r.componentMainType, r.componentIndex, n), sd(e, t));
}
function Sd(e, t, n) {
	process.env.NODE_ENV !== "production" && !Pd(e) && vl("param should be highDownDispatcher"), gd(n);
	var r = bu(e), i = bd(r.componentMainType, r.componentIndex, r.componentHighDownName, n).dispatchers;
	i ? z(i, function(e) {
		return cd(e, t);
	}) : cd(e, t);
}
function Cd(e, t, n) {
	if (Id(t)) {
		var r = t.dataType, i = Kl(e.getData(r), t);
		H(i) || (i = [i]), e[t.type === "toggleSelect" ? "toggleSelect" : t.type === "select" ? "select" : "unselect"](i, r);
	}
}
function wd(e) {
	z(e.getAllData(), function(t) {
		var n = t.data, r = t.type;
		n.eachItemGraphicEl(function(t, n) {
			e.isSelected(n, r) ? pd(t) : md(t);
		});
	});
}
function Td(e) {
	var t = [];
	return e.eachSeries(function(e) {
		z(e.getAllData(), function(n) {
			n.data;
			var r = n.type, i = e.getSelectedDataIndices();
			if (i.length > 0) {
				var a = {
					dataIndex: i,
					seriesIndex: e.seriesIndex
				};
				r != null && (a.dataType = r), t.push(a);
			}
		});
	}), t;
}
function Ed(e, t, n) {
	Nd(e, !0), ed(e, od), kd(e, t, n);
}
function Dd(e) {
	Nd(e, !1);
}
function Od(e, t, n, r) {
	r ? Dd(e) : Ed(e, t, n);
}
function kd(e, t, n) {
	var r = bu(e);
	t == null ? r.focus &&= null : (r.focus = t, r.blurScope = n);
}
var Ad = [
	"emphasis",
	"blur",
	"select"
], jd = {
	itemStyle: "getItemStyle",
	lineStyle: "getLineStyle",
	areaStyle: "getAreaStyle"
};
function Md(e, t, n, r) {
	n ||= "itemStyle";
	for (var i = 0; i < Ad.length; i++) {
		var a = Ad[i], o = t.getModel([a, n]), s = e.ensureState(a);
		s.style = r ? r(o) : o[jd[n]]();
	}
}
function Nd(e, t) {
	var n = t === !1, r = e;
	e.highDownSilentOnTouch && (r.__highDownSilentOnTouch = e.highDownSilentOnTouch), (!n || r.__highDownDispatcher) && (r.__highByOuter = r.__highByOuter || 0, r.__highDownDispatcher = !n);
}
function Pd(e) {
	return !!(e && e.__highDownDispatcher);
}
function Fd(e) {
	var t = Pu[e];
	return t == null && Nu <= 32 && (t = Pu[e] = Nu++), t;
}
function Id(e) {
	var t = e.type;
	return t === "select" || t === "unselect" || t === "toggleSelect";
}
function Ld(e) {
	var t = e.type;
	return t === "highlight" || t === "downplay";
}
function Rd(e) {
	var t = Fu(e);
	t.normalFill = e.style.fill, t.normalStroke = e.style.stroke;
	var n = e.states.select || {};
	t.selectFill = n.style && n.style.fill || null, t.selectStroke = n.style && n.style.stroke || null;
}
//#endregion
//#region node_modules/zrender/lib/tool/transformPath.js
var zd = Cs.CMD, Bd = [
	[],
	[],
	[]
], Vd = Math.sqrt, Hd = Math.atan2;
function Ud(e, t) {
	if (t) {
		var n = e.data, r = e.len(), i, a, o, s, c, l, u = zd.M, d = zd.C, f = zd.L, p = zd.R, m = zd.A, h = zd.Q;
		for (o = 0, s = 0; o < r;) {
			switch (i = n[o++], s = o, a = 0, i) {
				case u:
					a = 1;
					break;
				case f:
					a = 1;
					break;
				case d:
					a = 3;
					break;
				case h:
					a = 2;
					break;
				case m:
					var g = t[4], _ = t[5], v = Vd(t[0] * t[0] + t[1] * t[1]), y = Vd(t[2] * t[2] + t[3] * t[3]), b = Hd(-t[1] / y, t[0] / v);
					n[o] *= v, n[o++] += g, n[o] *= y, n[o++] += _, n[o++] *= v, n[o++] *= y, n[o++] += b, n[o++] += b, o += 2, s = o;
					break;
				case p: l[0] = n[o++], l[1] = n[o++], sr(l, l, t), n[s++] = l[0], n[s++] = l[1], l[0] += n[o++], l[1] += n[o++], sr(l, l, t), n[s++] = l[0], n[s++] = l[1];
			}
			for (c = 0; c < a; c++) {
				var x = Bd[c];
				x[0] = n[o++], x[1] = n[o++], sr(x, x, t), n[s++] = x[0], n[s++] = x[1];
			}
		}
		e.increaseVersion();
	}
}
//#endregion
//#region node_modules/zrender/lib/tool/path.js
var Wd = Math.sqrt, Gd = Math.sin, Kd = Math.cos, qd = Math.PI;
function Jd(e) {
	return Math.sqrt(e[0] * e[0] + e[1] * e[1]);
}
function Yd(e, t) {
	return (e[0] * t[0] + e[1] * t[1]) / (Jd(e) * Jd(t));
}
function Xd(e, t) {
	return (e[0] * t[1] < e[1] * t[0] ? -1 : 1) * Math.acos(Yd(e, t));
}
function Zd(e, t, n, r, i, a, o, s, c, l, u) {
	var d = qd / 180 * c, f = Kd(d) * (e - n) / 2 + Gd(d) * (t - r) / 2, p = -1 * Gd(d) * (e - n) / 2 + Kd(d) * (t - r) / 2, m = f * f / (o * o) + p * p / (s * s);
	m > 1 && (o *= Wd(m), s *= Wd(m));
	var h = (i === a ? -1 : 1) * Wd((o * o * (s * s) - o * o * (p * p) - s * s * (f * f)) / (o * o * (p * p) + s * s * (f * f))) || 0, g = h * o * p / s, _ = h * -s * f / o, v = (e + n) / 2 + Kd(d) * g - Gd(d) * _, y = (t + r) / 2 + Gd(d) * g + Kd(d) * _, b = Xd([1, 0], [(f - g) / o, (p - _) / s]), x = [(f - g) / o, (p - _) / s], S = [(-1 * f - g) / o, (-1 * p - _) / s], C = Xd(x, S);
	if (Yd(x, S) <= -1 && (C = qd), Yd(x, S) >= 1 && (C = 0), C < 0) {
		var w = Math.round(C / qd * 1e6) / 1e6;
		C = qd * 2 + w % 2 * qd;
	}
	u.addData(l, v, y, o, s, b, C, d, a);
}
var Qd = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/gi, $d = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function ef(e) {
	var t = new Cs();
	if (!e) return t;
	var n = 0, r = 0, i = n, a = r, o, s = Cs.CMD, c = e.match(Qd);
	if (!c) return t;
	for (var l = 0; l < c.length; l++) {
		for (var u = c[l], d = u.charAt(0), f = void 0, p = u.match($d) || [], m = p.length, h = 0; h < m; h++) p[h] = parseFloat(p[h]);
		for (var g = 0; g < m;) {
			var _ = void 0, v = void 0, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0, w = n, T = r, E = void 0, D = void 0;
			switch (d) {
				case "l":
					n += p[g++], r += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "L":
					n = p[g++], r = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "m":
					n += p[g++], r += p[g++], f = s.M, t.addData(f, n, r), i = n, a = r, d = "l";
					break;
				case "M":
					n = p[g++], r = p[g++], f = s.M, t.addData(f, n, r), i = n, a = r, d = "L";
					break;
				case "h":
					n += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "H":
					n = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "v":
					r += p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "V":
					r = p[g++], f = s.L, t.addData(f, n, r);
					break;
				case "C":
					f = s.C, t.addData(f, p[g++], p[g++], p[g++], p[g++], p[g++], p[g++]), n = p[g - 2], r = p[g - 1];
					break;
				case "c":
					f = s.C, t.addData(f, p[g++] + n, p[g++] + r, p[g++] + n, p[g++] + r, p[g++] + n, p[g++] + r), n += p[g - 2], r += p[g - 1];
					break;
				case "S":
					_ = n, v = r, E = t.len(), D = t.data, o === s.C && (_ += n - D[E - 4], v += r - D[E - 3]), f = s.C, w = p[g++], T = p[g++], n = p[g++], r = p[g++], t.addData(f, _, v, w, T, n, r);
					break;
				case "s":
					_ = n, v = r, E = t.len(), D = t.data, o === s.C && (_ += n - D[E - 4], v += r - D[E - 3]), f = s.C, w = n + p[g++], T = r + p[g++], n += p[g++], r += p[g++], t.addData(f, _, v, w, T, n, r);
					break;
				case "Q":
					w = p[g++], T = p[g++], n = p[g++], r = p[g++], f = s.Q, t.addData(f, w, T, n, r);
					break;
				case "q":
					w = p[g++] + n, T = p[g++] + r, n += p[g++], r += p[g++], f = s.Q, t.addData(f, w, T, n, r);
					break;
				case "T":
					_ = n, v = r, E = t.len(), D = t.data, o === s.Q && (_ += n - D[E - 4], v += r - D[E - 3]), n = p[g++], r = p[g++], f = s.Q, t.addData(f, _, v, n, r);
					break;
				case "t":
					_ = n, v = r, E = t.len(), D = t.data, o === s.Q && (_ += n - D[E - 4], v += r - D[E - 3]), n += p[g++], r += p[g++], f = s.Q, t.addData(f, _, v, n, r);
					break;
				case "A":
					y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n = p[g++], r = p[g++], f = s.A, Zd(w, T, n, r, S, C, y, b, x, f, t);
					break;
				case "a":
					y = p[g++], b = p[g++], x = p[g++], S = p[g++], C = p[g++], w = n, T = r, n += p[g++], r += p[g++], f = s.A, Zd(w, T, n, r, S, C, y, b, x, f, t);
					break;
			}
		}
		(d === "z" || d === "Z") && (f = s.Z, t.addData(f), n = i, r = a), o = f;
	}
	return t.toStatic(), t;
}
var tf = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.applyTransform = function(e) {}, t;
}(Js);
function nf(e) {
	return e.setData != null;
}
function rf(e, t) {
	var n = ef(e), r = R({}, t);
	return r.buildPath = function(e) {
		var t = nf(e);
		if (t && e.canSave()) {
			e.appendPath(n);
			var r = e.getContext();
			r && e.rebuildPath(r, 1);
		} else {
			var r = t ? e.getContext() : e;
			r && n.rebuildPath(r, 1);
		}
	}, r.applyTransform = function(e) {
		Ud(n, e), this.dirtyShape();
	}, r;
}
function af(e, t) {
	return new tf(rf(e, t));
}
function of(e, t) {
	var n = rf(e, t);
	return function(e) {
		I(t, e);
		function t(t) {
			var r = e.call(this, t) || this;
			return r.applyTransform = n.applyTransform, r.buildPath = n.buildPath, r;
		}
		return t;
	}(tf);
}
function sf(e, t) {
	for (var n = [], r = e.length, i = 0; i < r; i++) {
		var a = e[i];
		n.push(a.getUpdatedPathProxy(!0));
	}
	var o = new Js(t);
	return o.createPathProxy(), o.buildPath = function(e) {
		if (nf(e)) {
			e.appendPath(n);
			var t = e.getContext();
			t && e.rebuildPath(t, 1);
		}
	}, o;
}
//#endregion
//#region node_modules/zrender/lib/graphic/Group.js
var cf = function(e) {
	I(t, e);
	function t(t) {
		var n = e.call(this) || this;
		return n.isGroup = !0, n._children = [], n.attr(t), n;
	}
	return t.prototype.childrenRef = function() {
		return this._children;
	}, t.prototype.children = function() {
		return this._children.slice();
	}, t.prototype.childAt = function(e) {
		return this._children[e];
	}, t.prototype.childOfName = function(e) {
		for (var t = this._children, n = 0; n < t.length; n++) if (t[n].name === e) return t[n];
	}, t.prototype.childCount = function() {
		return this._children.length;
	}, t.prototype.add = function(e) {
		if (e && (e !== this && e.parent !== this && (this._children.push(e), this._doAdd(e)), process.env.NODE_ENV !== "production" && e.__hostTarget)) throw "This elemenet has been used as an attachment";
		return this;
	}, t.prototype.addBefore = function(e, t) {
		if (e && e !== this && e.parent !== this && t && t.parent === this) {
			var n = this._children, r = n.indexOf(t);
			r >= 0 && (n.splice(r, 0, e), this._doAdd(e));
		}
		return this;
	}, t.prototype.replace = function(e, t) {
		var n = jt(this._children, e);
		return n >= 0 && this.replaceAt(t, n), this;
	}, t.prototype.replaceAt = function(e, t) {
		var n = this._children, r = n[t];
		if (e && e !== this && e.parent !== this && e !== r) {
			n[t] = e, r.parent = null;
			var i = this.__zr;
			i && r.removeSelfFromZr(i), this._doAdd(e);
		}
		return this;
	}, t.prototype._doAdd = function(e) {
		e.parent && e.parent.remove(e), e.parent = this;
		var t = this.__zr;
		t && t !== e.__zr && e.addSelfToZr(t), t && t.refresh();
	}, t.prototype.remove = function(e) {
		var t = this.__zr, n = this._children, r = jt(n, e);
		return r < 0 ? this : (n.splice(r, 1), e.parent = null, t && e.removeSelfFromZr(t), t && t.refresh(), this);
	}, t.prototype.removeAll = function() {
		for (var e = this._children, t = this.__zr, n = 0; n < e.length; n++) {
			var r = e[n];
			t && r.removeSelfFromZr(t), r.parent = null;
		}
		return e.length = 0, this;
	}, t.prototype.eachChild = function(e, t) {
		for (var n = this._children, r = 0; r < n.length; r++) {
			var i = n[r];
			e.call(t, i, r);
		}
		return this;
	}, t.prototype.traverse = function(e, t) {
		for (var n = 0; n < this._children.length; n++) {
			var r = this._children[n], i = e.call(t, r);
			r.isGroup && !i && r.traverse(e, t);
		}
		return this;
	}, t.prototype.addSelfToZr = function(t) {
		e.prototype.addSelfToZr.call(this, t);
		for (var n = 0; n < this._children.length; n++) this._children[n].addSelfToZr(t);
	}, t.prototype.removeSelfFromZr = function(t) {
		e.prototype.removeSelfFromZr.call(this, t);
		for (var n = 0; n < this._children.length; n++) this._children[n].removeSelfFromZr(t);
	}, t.prototype.getBoundingRect = function(e) {
		for (var t = new X(0, 0, 0, 0), n = e || this._children, r = [], i = null, a = 0; a < n.length; a++) {
			var o = n[a];
			if (!(o.ignore || o.invisible)) {
				var s = o.getBoundingRect(), c = o.getLocalTransform(r);
				c ? (X.applyTransform(t, s, c), i ||= t.clone(), i.union(t)) : (i ||= s.clone(), i.union(s));
			}
		}
		return i || t;
	}, t;
}(To);
cf.prototype.type = "group";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Circle.js
var lf = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.r = 0;
	}
	return e;
}(), uf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new lf();
	}, t.prototype.buildPath = function(e, t) {
		e.moveTo(t.cx + t.r, t.cy), e.arc(t.cx, t.cy, t.r, 0, Math.PI * 2);
	}, t;
}(Js);
uf.prototype.type = "circle";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Ellipse.js
var df = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
	}
	return e;
}(), ff = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new df();
	}, t.prototype.buildPath = function(e, t) {
		var n = .5522848, r = t.cx, i = t.cy, a = t.rx, o = t.ry, s = a * n, c = o * n;
		e.moveTo(r - a, i), e.bezierCurveTo(r - a, i - c, r - s, i - o, r, i - o), e.bezierCurveTo(r + s, i - o, r + a, i - c, r + a, i), e.bezierCurveTo(r + a, i + c, r + s, i + o, r, i + o), e.bezierCurveTo(r - s, i + o, r - a, i + c, r - a, i), e.closePath();
	}, t;
}(Js);
ff.prototype.type = "ellipse";
//#endregion
//#region node_modules/zrender/lib/graphic/helper/roundSector.js
var pf = Math.PI, mf = pf * 2, hf = Math.sin, gf = Math.cos, _f = Math.acos, vf = Math.atan2, yf = Math.abs, bf = Math.sqrt, xf = Math.max, Sf = Math.min, Cf = 1e-4;
function wf(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = d * c - u * l;
	if (!(f * f < Cf)) return f = (u * (t - a) - d * (e - i)) / f, [e + f * c, t + f * l];
}
function Tf(e, t, n, r, i, a, o) {
	var s = e - n, c = t - r, l = (o ? a : -a) / bf(s * s + c * c), u = l * c, d = -l * s, f = e + u, p = t + d, m = n + u, h = r + d, g = (f + m) / 2, _ = (p + h) / 2, v = m - f, y = h - p, b = v * v + y * y, x = i - a, S = f * h - m * p, C = (y < 0 ? -1 : 1) * bf(xf(0, x * x * b - S * S)), w = (S * y - v * C) / b, T = (-S * v - y * C) / b, E = (S * y + v * C) / b, D = (-S * v + y * C) / b, O = w - g, k = T - _, A = E - g, j = D - _;
	return O * O + k * k > A * A + j * j && (w = E, T = D), {
		cx: w,
		cy: T,
		x0: -u,
		y0: -d,
		x1: w * (i / x - 1),
		y1: T * (i / x - 1)
	};
}
function Ef(e) {
	var t;
	if (H(e)) {
		var n = e.length;
		if (!n) return e;
		t = n === 1 ? [
			e[0],
			e[0],
			0,
			0
		] : n === 2 ? [
			e[0],
			e[0],
			e[1],
			e[1]
		] : n === 3 ? e.concat(e[2]) : e;
	} else t = [
		e,
		e,
		e,
		e
	];
	return t;
}
function Df(e, t) {
	var n, r = xf(t.r, 0), i = xf(t.r0 || 0, 0), a = r > 0;
	if (!(!a && !(i > 0))) {
		if (a || (r = i, i = 0), i > r) {
			var o = r;
			r = i, i = o;
		}
		var s = t.startAngle, c = t.endAngle;
		if (!(isNaN(s) || isNaN(c))) {
			var l = t.cx, u = t.cy, d = !!t.clockwise, f = yf(c - s), p = f > mf && f % mf;
			if (p > Cf && (f = p), !(r > Cf)) e.moveTo(l, u);
			else if (f > mf - Cf) e.moveTo(l + r * gf(s), u + r * hf(s)), e.arc(l, u, r, s, c, !d), i > Cf && (e.moveTo(l + i * gf(c), u + i * hf(c)), e.arc(l, u, i, c, s, d));
			else {
				var m = void 0, h = void 0, g = void 0, _ = void 0, v = void 0, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0, w = void 0, T = void 0, E = void 0, D = void 0, O = void 0, k = void 0, A = r * gf(s), j = r * hf(s), ee = i * gf(c), te = i * hf(c), ne = f > Cf;
				if (ne) {
					var re = t.cornerRadius;
					re && (n = Ef(re), m = n[0], h = n[1], g = n[2], _ = n[3]);
					var ie = yf(r - i) / 2;
					if (v = Sf(ie, g), y = Sf(ie, _), b = Sf(ie, m), x = Sf(ie, h), w = S = xf(v, y), T = C = xf(b, x), (S > Cf || C > Cf) && (E = r * gf(c), D = r * hf(c), O = i * gf(s), k = i * hf(s), f < pf)) {
						var ae = wf(A, j, O, k, E, D, ee, te);
						if (ae) {
							var oe = A - ae[0], se = j - ae[1], ce = E - ae[0], le = D - ae[1], ue = 1 / hf(_f((oe * ce + se * le) / (bf(oe * oe + se * se) * bf(ce * ce + le * le))) / 2), de = bf(ae[0] * ae[0] + ae[1] * ae[1]);
							w = Sf(S, (r - de) / (ue + 1)), T = Sf(C, (i - de) / (ue - 1));
						}
					}
				}
				if (!ne) e.moveTo(l + A, u + j);
				else if (w > Cf) {
					var fe = Sf(g, w), pe = Sf(_, w), M = Tf(O, k, A, j, r, fe, d), N = Tf(E, D, ee, te, r, pe, d);
					e.moveTo(l + M.cx + M.x0, u + M.cy + M.y0), w < S && fe === pe ? e.arc(l + M.cx, u + M.cy, w, vf(M.y0, M.x0), vf(N.y0, N.x0), !d) : (fe > 0 && e.arc(l + M.cx, u + M.cy, fe, vf(M.y0, M.x0), vf(M.y1, M.x1), !d), e.arc(l, u, r, vf(M.cy + M.y1, M.cx + M.x1), vf(N.cy + N.y1, N.cx + N.x1), !d), pe > 0 && e.arc(l + N.cx, u + N.cy, pe, vf(N.y1, N.x1), vf(N.y0, N.x0), !d));
				} else e.moveTo(l + A, u + j), e.arc(l, u, r, s, c, !d);
				if (!(i > Cf) || !ne) e.lineTo(l + ee, u + te);
				else if (T > Cf) {
					var fe = Sf(m, T), pe = Sf(h, T), M = Tf(ee, te, E, D, i, -pe, d), N = Tf(A, j, O, k, i, -fe, d);
					e.lineTo(l + M.cx + M.x0, u + M.cy + M.y0), T < C && fe === pe ? e.arc(l + M.cx, u + M.cy, T, vf(M.y0, M.x0), vf(N.y0, N.x0), !d) : (pe > 0 && e.arc(l + M.cx, u + M.cy, pe, vf(M.y0, M.x0), vf(M.y1, M.x1), !d), e.arc(l, u, i, vf(M.cy + M.y1, M.cx + M.x1), vf(N.cy + N.y1, N.cx + N.x1), d), fe > 0 && e.arc(l + N.cx, u + N.cy, fe, vf(N.y1, N.x1), vf(N.y0, N.x0), !d));
				} else e.lineTo(l + ee, u + te), e.arc(l, u, i, c, s, d);
			}
			e.closePath();
		}
	}
}
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Sector.js
var Of = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
	}
	return e;
}(), kf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new Of();
	}, t.prototype.buildPath = function(e, t) {
		Df(e, t);
	}, t.prototype.isZeroArea = function() {
		return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
	}, t;
}(Js);
kf.prototype.type = "sector";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Ring.js
var Af = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
	}
	return e;
}(), jf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new Af();
	}, t.prototype.buildPath = function(e, t) {
		var n = t.cx, r = t.cy, i = Math.PI * 2;
		e.moveTo(n + t.r, r), e.arc(n, r, t.r, 0, i, !1), e.moveTo(n + t.r0, r), e.arc(n, r, t.r0, 0, i, !0);
	}, t;
}(Js);
jf.prototype.type = "ring";
//#endregion
//#region node_modules/zrender/lib/graphic/helper/smoothBezier.js
function Mf(e, t, n, r) {
	var i = [], a = [], o = [], s = [], c, l, u, d;
	if (r) {
		u = [Infinity, Infinity], d = [-Infinity, -Infinity];
		for (var f = 0, p = e.length; f < p; f++) cr(u, u, e[f]), lr(d, d, e[f]);
		cr(u, u, r[0]), lr(d, d, r[1]);
	}
	for (var f = 0, p = e.length; f < p; f++) {
		var m = e[f];
		if (n) c = e[f ? f - 1 : p - 1], l = e[(f + 1) % p];
		else if (f === 0 || f === p - 1) {
			i.push(Yn(e[f]));
			continue;
		} else c = e[f - 1], l = e[f + 1];
		Qn(a, l, c), tr(a, a, t);
		var h = rr(m, c), g = rr(m, l), _ = h + g;
		_ !== 0 && (h /= _, g /= _), tr(o, a, -h), tr(s, a, g);
		var v = Zn([], m, o), y = Zn([], m, s);
		r && (lr(v, v, u), cr(v, v, d), lr(y, y, u), cr(y, y, d)), i.push(v), i.push(y);
	}
	return n && i.push(i.shift()), i;
}
//#endregion
//#region node_modules/zrender/lib/graphic/helper/poly.js
function Nf(e, t, n) {
	var r = t.smooth, i = t.points;
	if (i && i.length >= 2) {
		if (r) {
			var a = Mf(i, r, n, t.smoothConstraint);
			e.moveTo(i[0][0], i[0][1]);
			for (var o = i.length, s = 0; s < (n ? o : o - 1); s++) {
				var c = a[s * 2], l = a[s * 2 + 1], u = i[(s + 1) % o];
				e.bezierCurveTo(c[0], c[1], l[0], l[1], u[0], u[1]);
			}
		} else {
			e.moveTo(i[0][0], i[0][1]);
			for (var s = 1, d = i.length; s < d; s++) e.lineTo(i[s][0], i[s][1]);
		}
		n && e.closePath();
	}
}
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Polygon.js
var Pf = function() {
	function e() {
		this.points = null, this.smooth = 0, this.smoothConstraint = null;
	}
	return e;
}(), Ff = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultShape = function() {
		return new Pf();
	}, t.prototype.buildPath = function(e, t) {
		Nf(e, t, !0);
	}, t;
}(Js);
Ff.prototype.type = "polygon";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Polyline.js
var If = function() {
	function e() {
		this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
	}
	return e;
}(), Lf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultStyle = function() {
		return {
			stroke: "#000",
			fill: null
		};
	}, t.prototype.getDefaultShape = function() {
		return new If();
	}, t.prototype.buildPath = function(e, t) {
		Nf(e, t, !1);
	}, t;
}(Js);
Lf.prototype.type = "polyline";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Line.js
var Rf = {}, zf = function() {
	function e() {
		this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
	}
	return e;
}(), Bf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultStyle = function() {
		return {
			stroke: "#000",
			fill: null
		};
	}, t.prototype.getDefaultShape = function() {
		return new zf();
	}, t.prototype.buildPath = function(e, t) {
		var n, r, i, a;
		if (this.subPixelOptimize) {
			var o = rc(Rf, t, this.style);
			n = o.x1, r = o.y1, i = o.x2, a = o.y2;
		} else n = t.x1, r = t.y1, i = t.x2, a = t.y2;
		var s = t.percent;
		s !== 0 && (e.moveTo(n, r), s < 1 && (i = n * (1 - s) + i * s, a = r * (1 - s) + a * s), e.lineTo(i, a));
	}, t.prototype.pointAt = function(e) {
		var t = this.shape;
		return [t.x1 * (1 - e) + t.x2 * e, t.y1 * (1 - e) + t.y2 * e];
	}, t;
}(Js);
Bf.prototype.type = "line";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/BezierCurve.js
var Vf = [], Hf = function() {
	function e() {
		this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
	}
	return e;
}();
function Uf(e, t, n) {
	var r = e.cpx2, i = e.cpy2;
	return r != null || i != null ? [(n ? Ri : Li)(e.x1, e.cpx1, e.cpx2, e.x2, t), (n ? Ri : Li)(e.y1, e.cpy1, e.cpy2, e.y2, t)] : [(n ? Gi : Wi)(e.x1, e.cpx1, e.x2, t), (n ? Gi : Wi)(e.y1, e.cpy1, e.y2, t)];
}
var Wf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultStyle = function() {
		return {
			stroke: "#000",
			fill: null
		};
	}, t.prototype.getDefaultShape = function() {
		return new Hf();
	}, t.prototype.buildPath = function(e, t) {
		var n = t.x1, r = t.y1, i = t.x2, a = t.y2, o = t.cpx1, s = t.cpy1, c = t.cpx2, l = t.cpy2, u = t.percent;
		u !== 0 && (e.moveTo(n, r), c == null || l == null ? (u < 1 && (Ji(n, o, i, u, Vf), o = Vf[1], i = Vf[2], Ji(r, s, a, u, Vf), s = Vf[1], a = Vf[2]), e.quadraticCurveTo(o, s, i, a)) : (u < 1 && (Vi(n, o, c, i, u, Vf), o = Vf[1], c = Vf[2], i = Vf[3], Vi(r, s, l, a, u, Vf), s = Vf[1], l = Vf[2], a = Vf[3]), e.bezierCurveTo(o, s, c, l, i, a)));
	}, t.prototype.pointAt = function(e) {
		return Uf(this.shape, e, !1);
	}, t.prototype.tangentAt = function(e) {
		var t = Uf(this.shape, e, !0);
		return nr(t, t);
	}, t;
}(Js);
Wf.prototype.type = "bezier-curve";
//#endregion
//#region node_modules/zrender/lib/graphic/shape/Arc.js
var Gf = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
	}
	return e;
}(), Kf = function(e) {
	I(t, e);
	function t(t) {
		return e.call(this, t) || this;
	}
	return t.prototype.getDefaultStyle = function() {
		return {
			stroke: "#000",
			fill: null
		};
	}, t.prototype.getDefaultShape = function() {
		return new Gf();
	}, t.prototype.buildPath = function(e, t) {
		var n = t.cx, r = t.cy, i = Math.max(t.r, 0), a = t.startAngle, o = t.endAngle, s = t.clockwise, c = Math.cos(a), l = Math.sin(a);
		e.moveTo(c * i + n, l * i + r), e.arc(n, r, i, a, o, !s);
	}, t;
}(Js);
Kf.prototype.type = "arc";
//#endregion
//#region node_modules/zrender/lib/graphic/CompoundPath.js
var qf = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.type = "compound", t;
	}
	return t.prototype._updatePathDirty = function() {
		for (var e = this.shape.paths, t = this.shapeChanged(), n = 0; n < e.length; n++) t ||= e[n].shapeChanged();
		t && this.dirtyShape();
	}, t.prototype.beforeBrush = function() {
		this._updatePathDirty();
		for (var e = this.shape.paths || [], t = this.getGlobalScale(), n = 0; n < e.length; n++) e[n].path || e[n].createPathProxy(), e[n].path.setScale(t[0], t[1], e[n].segmentIgnoreThreshold);
	}, t.prototype.buildPath = function(e, t) {
		for (var n = t.paths || [], r = 0; r < n.length; r++) n[r].buildPath(e, n[r].shape, !0);
	}, t.prototype.afterBrush = function() {
		for (var e = this.shape.paths || [], t = 0; t < e.length; t++) e[t].pathUpdated();
	}, t.prototype.getBoundingRect = function() {
		return this._updatePathDirty.call(this), Js.prototype.getBoundingRect.call(this);
	}, t;
}(Js), Jf = function() {
	function e(e) {
		this.colorStops = e || [];
	}
	return e.prototype.addColorStop = function(e, t) {
		this.colorStops.push({
			offset: e,
			color: t
		});
	}, e;
}(), Yf = function(e) {
	I(t, e);
	function t(t, n, r, i, a, o) {
		var s = e.call(this, a) || this;
		return s.x = t ?? 0, s.y = n ?? 0, s.x2 = r ?? 1, s.y2 = i ?? 0, s.type = "linear", s.global = o || !1, s;
	}
	return t;
}(Jf), Xf = function(e) {
	I(t, e);
	function t(t, n, r, i, a) {
		var o = e.call(this, i) || this;
		return o.x = t ?? .5, o.y = n ?? .5, o.r = r ?? .5, o.type = "radial", o.global = a || !1, o;
	}
	return t;
}(Jf), Zf = Math.min, Qf = Math.max, $f = Math.abs, ep = [0, 0], tp = [0, 0], np = jr(), rp = np.minTv, ip = np.maxTv, ap = function() {
	function e(e, t) {
		this._corners = [], this._axes = [], this._origin = [0, 0];
		for (var n = 0; n < 4; n++) this._corners[n] = new ur();
		for (var n = 0; n < 2; n++) this._axes[n] = new ur();
		e && this.fromBoundingRect(e, t);
	}
	return e.prototype.fromBoundingRect = function(e, t) {
		var n = this._corners, r = this._axes, i = e.x, a = e.y, o = i + e.width, s = a + e.height;
		if (n[0].set(i, a), n[1].set(o, a), n[2].set(o, s), n[3].set(i, s), t) for (var c = 0; c < 4; c++) n[c].transform(t);
		ur.sub(r[0], n[1], n[0]), ur.sub(r[1], n[3], n[0]), r[0].normalize(), r[1].normalize();
		for (var c = 0; c < 2; c++) this._origin[c] = r[c].dot(n[0]);
	}, e.prototype.intersect = function(e, t, n) {
		var r = !0, i = !t;
		return t && ur.set(t, 0, 0), np.reset(n, !i), !this._intersectCheckOneSide(this, e, i, 1) && (r = !1, i) || !this._intersectCheckOneSide(e, this, i, -1) && (r = !1, i) || !i && !np.negativeSize && ur.copy(t, r ? np.useDir ? np.dirMinTv : rp : ip), r;
	}, e.prototype._intersectCheckOneSide = function(e, t, n, r) {
		for (var i = !0, a = 0; a < 2; a++) {
			var o = e._axes[a];
			if (e._getProjMinMaxOnAxis(a, e._corners, ep), e._getProjMinMaxOnAxis(a, t._corners, tp), np.negativeSize || ep[1] < tp[0] || ep[0] > tp[1]) {
				if (i = !1, np.negativeSize || n) return i;
				var s = $f(tp[0] - ep[1]), c = $f(ep[0] - tp[1]);
				Zf(s, c) > ip.len() && (s < c ? ur.scale(ip, o, -s * r) : ur.scale(ip, o, c * r));
			} else if (!n) {
				var s = $f(tp[0] - ep[1]), c = $f(ep[0] - tp[1]);
				(np.useDir || Zf(s, c) < rp.len()) && ((s < c || !np.bidirectional) && (ur.scale(rp, o, s * r), np.useDir && np.calcDirMTV()), (s >= c || !np.bidirectional) && (ur.scale(rp, o, -c * r), np.useDir && np.calcDirMTV()));
			}
		}
		return i;
	}, e.prototype._getProjMinMaxOnAxis = function(e, t, n) {
		for (var r = this._axes[e], i = this._origin, a = t[0].dot(r) + i[e], o = a, s = a, c = 1; c < t.length; c++) {
			var l = t[c].dot(r) + i[e];
			o = Zf(l, o), s = Qf(l, s);
		}
		n[0] = o + np.touchThreshold, n[1] = s - np.touchThreshold, np.negativeSize = n[1] < n[0];
	}, e;
}(), op = [], sp = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.notClear = !0, t.incremental = 1, t._displayables = [], t._temporaryDisplayables = [], t._cursor = 0, t;
	}
	return t.prototype.traverse = function(e, t) {
		e.call(t, this);
	}, t.prototype.useStyle = function() {
		this.style = {};
	}, t.prototype._useHoverStyle = function() {
		this.__hoverStyle = null;
	}, t.prototype.getCursor = function() {
		return this._cursor;
	}, t.prototype.innerAfterBrush = function() {
		this._cursor = this._displayables.length;
	}, t.prototype.clearDisplaybles = function() {
		this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.markRedraw(), this.notClear = !1;
	}, t.prototype.clearTemporalDisplayables = function() {
		this._temporaryDisplayables = [];
	}, t.prototype.addDisplayable = function(e, t) {
		t ? this._temporaryDisplayables.push(e) : this._displayables.push(e), this.markRedraw();
	}, t.prototype.addDisplayables = function(e, t) {
		t ||= !1;
		for (var n = 0; n < e.length; n++) this.addDisplayable(e[n], t);
	}, t.prototype.getDisplayables = function() {
		return this._displayables;
	}, t.prototype.getTemporalDisplayables = function() {
		return this._temporaryDisplayables;
	}, t.prototype.eachPendingDisplayable = function(e) {
		for (var t = this._cursor; t < this._displayables.length; t++) e && e(this._displayables[t]);
		for (var t = 0; t < this._temporaryDisplayables.length; t++) e && e(this._temporaryDisplayables[t]);
	}, t.prototype.update = function() {
		this.updateTransform();
		for (var e = this._cursor; e < this._displayables.length; e++) {
			var t = this._displayables[e];
			t.parent = this, t.update(), t.parent = null;
		}
		for (var e = 0; e < this._temporaryDisplayables.length; e++) {
			var t = this._temporaryDisplayables[e];
			t.parent = this, t.update(), t.parent = null;
		}
	}, t.prototype.getBoundingRect = function() {
		if (!this._rect) {
			for (var e = new X(Infinity, Infinity, -Infinity, -Infinity), t = 0; t < this._displayables.length; t++) {
				var n = this._displayables[t], r = n.getBoundingRect().clone();
				n.needLocalTransform() && r.applyTransform(n.getLocalTransform(op)), e.union(r);
			}
			this._rect = e;
		}
		return this._rect;
	}, t.prototype.contain = function(e, t) {
		var n = this.transformCoordToLocal(e, t);
		if (this.getBoundingRect().contain(n[0], n[1])) {
			for (var r = 0; r < this._displayables.length; r++) if (this._displayables[r].contain(e, t)) return !0;
		}
		return !1;
	}, t;
}(Vo), cp = ql();
function lp(e, t, n, r, i) {
	var a;
	if (t && t.ecModel) {
		var o = t.ecModel.getUpdatePayload();
		a = o && o.animation;
	}
	var s = t && t.isAnimationEnabled(), c = e === "update";
	if (s) {
		var l = void 0, u = void 0, d = void 0;
		return r ? (l = K(r.duration, 200), u = K(r.easing, "cubicOut"), d = 0) : (l = t.getShallow(c ? "animationDurationUpdate" : "animationDuration"), u = t.getShallow(c ? "animationEasingUpdate" : "animationEasing"), d = t.getShallow(c ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (l = a.duration), a.easing != null && (u = a.easing), a.delay != null && (d = a.delay)), U(d) && (d = d(n, i)), U(l) && (l = l(n)), {
			duration: l || 0,
			delay: d,
			easing: u
		};
	} else return null;
}
function up(e, t, n, r, i, a, o) {
	var s = !1, c;
	U(i) ? (o = a, a = i, i = null) : G(i) && (a = i.cb, o = i.during, s = i.isFrom, c = i.removeOpt, i = i.dataIndex);
	var l = e === "leave";
	l || t.stopAnimation("leave");
	var u = lp(e, r, i, l ? c || {} : null, r && r.getAnimationDelayParams ? r.getAnimationDelayParams(t, i) : null);
	if (u && u.duration > 0) {
		var d = u.duration, f = u.delay, p = u.easing, m = {
			duration: d,
			delay: f || 0,
			easing: p,
			done: a,
			force: !!a || !!o,
			setToFinal: !l,
			scope: e,
			during: o
		};
		s ? t.animateFrom(n, m) : t.animateTo(n, m);
	} else t.stopAnimation(), !s && t.attr(n), o && o(1), a && a();
}
function dp(e, t, n, r, i, a) {
	up("update", e, t, n, r, i, a);
}
function fp(e, t, n, r, i, a) {
	up("enter", e, t, n, r, i, a);
}
function pp(e) {
	if (!e.__zr) return !0;
	for (var t = 0; t < e.animators.length; t++) if (e.animators[t].scope === "leave") return !0;
	return !1;
}
function mp(e, t, n, r, i, a) {
	pp(e) || up("leave", e, t, n, r, i, a);
}
function hp(e, t, n, r) {
	e.removeTextContent(), e.removeTextGuideLine(), mp(e, { style: { opacity: 0 } }, t, n, r);
}
function gp(e, t, n) {
	function r() {
		e.parent && e.parent.remove(e);
	}
	e.isGroup ? e.traverse(function(e) {
		e.isGroup || hp(e, t, n, r);
	}) : hp(e, t, n, r);
}
function _p(e) {
	cp(e).oldStyle = e.style;
}
//#endregion
//#region node_modules/echarts/lib/util/graphic.js
var vp = /* @__PURE__ */ t({
	Arc: () => Kf,
	BezierCurve: () => Wf,
	BoundingRect: () => X,
	Circle: () => uf,
	CompoundPath: () => qf,
	Ellipse: () => ff,
	Group: () => cf,
	HOVER_LAYER_FOR_INCREMENTAL: () => 2,
	HOVER_LAYER_FROM_THRESHOLD: () => 1,
	HOVER_LAYER_NO: () => 0,
	Image: () => ec,
	IncrementalDisplayable: () => sp,
	Line: () => Bf,
	LinearGradient: () => Yf,
	OrientedBoundingRect: () => ap,
	Path: () => Js,
	Point: () => ur,
	Polygon: () => Ff,
	Polyline: () => Lf,
	RadialGradient: () => Xf,
	Rect: () => cc,
	Ring: () => jf,
	Sector: () => kf,
	Text: () => pc,
	WH: () => xp,
	XY: () => bp,
	applyTransform: () => Ip,
	calcZ2Range: () => am,
	clipPointsByRect: () => Vp,
	clipRectByRect: () => Hp,
	createIcon: () => Up,
	decomposeTransform: () => lm,
	ensureCopyRect: () => nm,
	ensureCopyTransform: () => rm,
	expandOrShrinkRect: () => Jp,
	extendPath: () => wp,
	extendShape: () => Sp,
	getCurrentCanvasPainter: () => dm,
	getShapeClass: () => Ep,
	getTransform: () => Fp,
	groupTransition: () => Bp,
	initProps: () => fp,
	isBoundingRectAxisAligned: () => em,
	isElementRemoved: () => pp,
	lineLineIntersect: () => Gp,
	linePolygonIntersect: () => Wp,
	makeImage: () => Op,
	makePath: () => Dp,
	mergePath: () => Ap,
	payloadDisableAnimation: () => cm,
	registerShape: () => Tp,
	removeElement: () => mp,
	removeElementWithFadeOut: () => gp,
	resizePath: () => jp,
	retrieveZInfo: () => im,
	setTooltipConfig: () => Zp,
	subPixelOptimize: () => Pp,
	subPixelOptimizeLine: () => Mp,
	subPixelOptimizeRect: () => Np,
	transformDirection: () => Lp,
	traverseElements: () => $p,
	traverseUpdateZ: () => om,
	updateProps: () => dp
}), yp = {}, bp = ["x", "y"], xp = ["width", "height"];
function Sp(e) {
	return Js.extend(e);
}
var Cp = of;
function wp(e, t) {
	return Cp(e, t);
}
function Tp(e, t) {
	yp[e] = t;
}
function Ep(e) {
	if (yp.hasOwnProperty(e)) return yp[e];
}
function Dp(e, t, n, r) {
	var i = af(e, t);
	return n && (r === "center" && (n = kp(n, i.getBoundingRect())), jp(i, n)), i;
}
function Op(e, t, n) {
	var r = new ec({
		style: {
			image: e,
			x: t.x,
			y: t.y,
			width: t.width,
			height: t.height
		},
		onload: function(e) {
			if (n === "center") {
				var i = {
					width: e.width,
					height: e.height
				};
				r.setStyle(kp(t, i));
			}
		}
	});
	return r;
}
function kp(e, t) {
	var n = t.width / t.height, r = e.height * n, i;
	r <= e.width ? i = e.height : (r = e.width, i = r / n);
	var a = e.x + e.width / 2, o = e.y + e.height / 2;
	return {
		x: a - r / 2,
		y: o - i / 2,
		width: r,
		height: i
	};
}
var Ap = sf;
function jp(e, t) {
	if (e.applyTransform) {
		var n = e.getBoundingRect().calculateTransform(t);
		e.applyTransform(n);
	}
}
function Mp(e, t) {
	return rc(e, e, { lineWidth: t }), e;
}
function Np(e, t) {
	return ic(e, e, t), e;
}
var Pp = ac;
function Fp(e, t) {
	for (var n = Vn([]); e && e !== t;) Un(n, e.getLocalTransform(), n), e = e.parent;
	return n;
}
function Ip(e, t, n) {
	return t && !Pt(t) && (t = xi.getLocalTransform(t)), n && (t = qn([], t)), sr([], e, t);
}
function Lp(e, t, n) {
	var r = t[4] === 0 || t[5] === 0 || t[0] === 0 ? 1 : Mc(2 * t[4] / t[0]), i = t[4] === 0 || t[5] === 0 || t[2] === 0 ? 1 : Mc(2 * t[4] / t[2]), a = [e === "left" ? -r : e === "right" ? r : 0, e === "top" ? -i : e === "bottom" ? i : 0];
	return a = Ip(a, t, n), Mc(a[0]) > Mc(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function Rp(e) {
	return !e.isGroup;
}
function zp(e) {
	return e.shape != null;
}
function Bp(e, t, n) {
	if (!e || !t) return;
	function r(e) {
		var t = {};
		return e.traverse(function(e) {
			Rp(e) && e.anid && (t[e.anid] = e);
		}), t;
	}
	function i(e) {
		var t = {
			x: e.x,
			y: e.y,
			rotation: e.rotation
		};
		return zp(e) && (t.shape = L(e.shape)), t;
	}
	var a = r(e);
	t.traverse(function(e) {
		if (Rp(e) && e.anid) {
			var t = a[e.anid];
			if (t) {
				var r = i(e);
				e.attr(i(t)), dp(e, r, n, bu(e).dataIndex);
			}
		}
	});
}
function Vp(e, t) {
	return B(e, function(e) {
		var n = e[0];
		n = jc(n, t.x), n = Ac(n, t.x + t.width);
		var r = e[1];
		return r = jc(r, t.y), r = Ac(r, t.y + t.height), [n, r];
	});
}
function Hp(e, t) {
	var n = jc(e.x, t.x), r = Ac(e.x + e.width, t.x + t.width), i = jc(e.y, t.y), a = Ac(e.y + e.height, t.y + t.height);
	if (r >= n && a >= i) return {
		x: n,
		y: i,
		width: r - n,
		height: a - i
	};
}
function Up(e, t, n) {
	var r = R({ rectHover: !0 }, t), i = r.style = { strokeNoScale: !0 };
	if (n ||= {
		x: -1,
		y: -1,
		width: 2,
		height: 2
	}, e) return e.indexOf("image://") === 0 ? (i.image = e.slice(8), At(i, n), new ec(r)) : Dp(e.replace("path://", ""), r, n, "center");
}
function Wp(e, t, n, r, i) {
	for (var a = 0, o = i[i.length - 1]; a < i.length; a++) {
		var s = i[a];
		if (Gp(e, t, n, r, s[0], s[1], o[0], o[1])) return !0;
		o = s;
	}
}
function Gp(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = Kp(u, d, c, l);
	if (qp(f)) return !1;
	var p = e - i, m = t - a, h = Kp(p, m, c, l) / f;
	if (h < 0 || h > 1) return !1;
	var g = Kp(p, m, u, d) / f;
	return !(g < 0 || g > 1);
}
function Kp(e, t, n, r) {
	return e * r - n * t;
}
function qp(e) {
	return e <= 1e-6 && e >= -1e-6;
}
function Jp(e, t, n, r, i) {
	return t == null ? e : (Ht(t) ? Yp[0] = Yp[1] = Yp[2] = Yp[3] = t : (process.env.NODE_ENV !== "production" && q(t.length === 4), Yp[0] = t[0], Yp[1] = t[1], Yp[2] = t[2], Yp[3] = t[3]), r && (Yp[0] = jc(0, Yp[0]), Yp[1] = jc(0, Yp[1]), Yp[2] = jc(0, Yp[2]), Yp[3] = jc(0, Yp[3])), n && (Yp[0] = -Yp[0], Yp[1] = -Yp[1], Yp[2] = -Yp[2], Yp[3] = -Yp[3]), Xp(e, Yp, "x", "width", 3, 1, i && i[0] || 0), Xp(e, Yp, "y", "height", 0, 2, i && i[1] || 0), e);
}
var Yp = [
	0,
	0,
	0,
	0
];
function Xp(e, t, n, r, i, a, o) {
	var s = t[a] + t[i], c = e[r];
	e[r] += s, o = jc(0, Ac(o, c)), e[r] < o ? (e[r] = o, e[n] += t[i] >= 0 ? -t[i] : t[a] >= 0 ? c + t[a] : Mc(s) > 1e-8 ? (c - o) * t[i] / s : 0) : e[n] -= t[i];
}
function Zp(e) {
	var t = e.itemTooltipOption, n = e.componentModel, r = e.itemName, i = W(t) ? { formatter: t } : t, a = n.mainType, o = n.componentIndex, s = {
		componentType: a,
		name: r,
		$vars: ["name"]
	};
	s[a + "Index"] = o;
	var c = e.formatterParamsExtra;
	c && z(V(c), function(e) {
		un(s, e) || (s[e] = c[e], s.$vars.push(e));
	});
	var l = bu(e.el);
	l.componentMainType = a, l.componentIndex = o, l.tooltipConfig = {
		name: r,
		option: At({
			content: r,
			encodeHTMLContent: !0,
			formatterParams: s
		}, i)
	};
}
function Qp(e, t) {
	var n;
	e.isGroup && (n = t(e)), n || e.traverse(t);
}
function $p(e, t) {
	if (e) if (H(e)) for (var n = 0; n < e.length; n++) Qp(e[n], t);
	else Qp(e, t);
}
function em(e) {
	return !e || Mc(e[1]) < tm && Mc(e[2]) < tm || Mc(e[0]) < tm && Mc(e[3]) < tm;
}
var tm = 1e-5;
function nm(e, t) {
	return e ? X.copy(e, t) : t.clone();
}
function rm(e, t) {
	return t ? Hn(e || Bn(), t) : void 0;
}
function im(e) {
	return {
		z: e.get("z") || 0,
		zlevel: e.get("zlevel") || 0
	};
}
function am(e) {
	var t = -Infinity, n = Infinity;
	Qp(e, function(e) {
		r(e), r(e.getTextContent()), r(e.getTextGuideLine());
	});
	function r(e) {
		if (!(!e || e.isGroup)) {
			var t = e.currentStates;
			if (t.length) for (var n = 0; n < t.length; n++) i(e.states[t[n]]);
			i(e);
		}
	}
	function i(e) {
		if (e) {
			var r = e.z2;
			r > t && (t = r), r < n && (n = r);
		}
	}
	return n > t && (n = t = 0), {
		min: n,
		max: t
	};
}
function om(e, t, n) {
	sm(e, t, n, -Infinity);
}
function sm(e, t, n, r) {
	if (e.ignoreModelZ) return r;
	var i = e.getTextContent(), a = e.getTextGuideLine();
	if (e.isGroup) for (var o = e.childrenRef(), s = 0; s < o.length; s++) r = jc(sm(o[s], t, n, r), r);
	else e.z = t, e.zlevel = n, r = jc(e.z2 || 0, r);
	if (i && (i.z = t, i.zlevel = n, isFinite(r) && (i.z2 = r + 2)), a) {
		var c = e.textGuideLineConfig;
		a.z = t, a.zlevel = n, isFinite(r) && (a.z2 = r + (c && c.showAbove ? 1 : -1));
	}
	return r;
}
function cm(e) {
	return e.animation = { duration: 0 }, e;
}
function lm(e, t) {
	return t ? Hn(um.transform, t) : Vn(um.transform), um.decomposeTransform(), wi(e, um), e;
}
var um = new xi();
um.transform = Bn();
function dm(e) {
	var t = e.getZr().painter;
	return t.getType() === "canvas" ? t : null;
}
Tp("circle", uf), Tp("ellipse", ff), Tp("sector", kf), Tp("ring", jf), Tp("polygon", Ff), Tp("polyline", Lf), Tp("rect", cc), Tp("line", Bf), Tp("bezierCurve", Wf), Tp("arc", Kf);
//#endregion
//#region node_modules/echarts/lib/label/labelStyle.js
var fm = {};
function pm(e, t) {
	for (var n = 0; n < Lu.length; n++) {
		var r = Lu[n], i = t[r], a = e.ensureState(r);
		a.style = a.style || {}, a.style.text = i;
	}
	var o = e.currentStates.slice();
	e.clearStates(!0), e.setStyle({ text: t.normal }), e.useStates(o, !0);
}
function mm(e, t, n) {
	var r = e.labelFetcher, i = e.labelDataIndex, a = e.labelDimIndex, o = t.normal, s;
	r && (s = r.getFormattedLabel(i, "normal", null, a, o && o.get("formatter"), n == null ? null : { interpolatedValue: n })), s ??= U(e.defaultText) ? e.defaultText(i, e, n) : e.defaultText;
	for (var c = { normal: s }, l = 0; l < Lu.length; l++) {
		var u = Lu[l], d = t[u];
		c[u] = K(r ? r.getFormattedLabel(i, u, null, a, d && d.get("formatter")) : null, s);
	}
	return c;
}
function hm(e, t, n, r) {
	n ||= fm;
	for (var i = e instanceof pc, a = !1, o = 0; o < Ru.length; o++) {
		var s = t[Ru[o]];
		if (s && s.getShallow("show")) {
			a = !0;
			break;
		}
	}
	var c = i ? e : e.getTextContent();
	if (a) {
		i || (c || (c = new pc(), e.setTextContent(c)), e.stateProxy && (c.stateProxy = e.stateProxy));
		var l = mm(n, t), u = t.normal, d = !!u.getShallow("show"), f = _m(u, r && r.normal, n, !1, !i);
		f.text = l.normal, i || e.setTextConfig(vm(u, n, !1));
		for (var o = 0; o < Lu.length; o++) {
			var p = Lu[o], s = t[p];
			if (s) {
				var m = c.ensureState(p), h = !!K(s.getShallow("show"), d);
				if (h !== d && (m.ignore = !h), m.style = _m(s, r && r[p], n, !0, !i), m.style.text = l[p], !i) {
					var g = e.ensureState(p);
					g.textConfig = vm(s, n, !0);
				}
			}
		}
		c.silent = !!u.getShallow("silent"), c.style.x != null && (f.x = c.style.x), c.style.y != null && (f.y = c.style.y), c.ignore = !d, c.useStyle(f), c.dirty(), n.enableTextSetter && (Em(c).setLabelText = function(e) {
			var r = mm(n, t, e);
			pm(c, r);
		});
	} else c && (c.ignore = !0);
	e.dirty();
}
function gm(e, t) {
	t ||= "label";
	for (var n = { normal: e.getModel(t) }, r = 0; r < Lu.length; r++) {
		var i = Lu[r];
		n[i] = e.getModel([i, t]);
	}
	return n;
}
function _m(e, t, n, r, i) {
	var a = {};
	return ym(a, e, n, r, i), t && R(a, t), a;
}
function vm(e, t, n) {
	t ||= {};
	var r = {}, i, a = e.getShallow("rotate"), o = K(e.getShallow("distance"), n ? null : 5), s = e.getShallow("offset");
	return i = e.getShallow("position") || (n ? null : "inside"), i === "outside" && (i = t.defaultOutsidePosition || "top"), i != null && (r.position = i), s != null && (r.offset = s), a != null && (a *= Math.PI / 180, r.rotation = a), o != null && (r.distance = o), r.outsideFill = e.get("color") === "inherit" ? t.inheritColor || null : "auto", t.autoOverflowArea != null && (r.autoOverflowArea = t.autoOverflowArea), t.layoutRect != null && (r.layoutRect = t.layoutRect), r;
}
function ym(e, t, n, r, i) {
	n ||= fm;
	var a = t.ecModel, o = a && a.option.textStyle, s = bm(t), c;
	if (s) {
		c = {};
		var l = "richInheritPlainLabel", u = K(t.get(l), a ? a.get(l) : void 0);
		for (var d in s) if (s.hasOwnProperty(d)) {
			var f = t.getModel(["rich", d]);
			wm(c[d] = {}, f, o, t, u, n, r, i, !1, !0);
		}
	}
	c && (e.rich = c);
	var p = t.get("overflow");
	p && (e.overflow = p);
	var m = t.get("lineOverflow");
	m && (e.lineOverflow = m);
	var h = e, g = t.get("minMargin");
	if (g != null) g = Ht(g) ? g / 2 : 0, h.margin = [
		g,
		g,
		g,
		g
	], h.__marginType = Om.minMargin;
	else {
		var _ = t.get("textMargin");
		_ != null && (h.margin = Qt(_), h.__marginType = Om.textMargin);
	}
	wm(e, t, o, null, null, n, r, i, !0, !1);
}
function bm(e) {
	for (var t; e && e !== e.ecModel;) {
		var n = (e.option || fm).rich;
		if (n) {
			t ||= {};
			for (var r = V(n), i = 0; i < r.length; i++) {
				var a = r[i];
				t[a] = 1;
			}
		}
		e = e.parentModel;
	}
	return t;
}
var xm = [
	"fontStyle",
	"fontWeight",
	"fontSize",
	"fontFamily",
	"textShadowColor",
	"textShadowBlur",
	"textShadowOffsetX",
	"textShadowOffsetY"
], Sm = [
	"align",
	"lineHeight",
	"width",
	"height",
	"tag",
	"verticalAlign",
	"ellipsis"
], Cm = [
	"padding",
	"borderWidth",
	"borderRadius",
	"borderDashOffset",
	"backgroundColor",
	"borderColor",
	"shadowColor",
	"shadowBlur",
	"shadowOffsetX",
	"shadowOffsetY"
];
function wm(e, t, n, r, i, a, o, s, c, l) {
	n = !o && n || fm;
	var u = a && a.inheritColor, d = t.getShallow("color"), f = t.getShallow("textBorderColor"), p = K(t.getShallow("opacity"), n.opacity);
	(d === "inherit" || d === "auto") && (process.env.NODE_ENV !== "production" && d === "auto" && bl("color: 'auto'", "color: 'inherit'"), d = u || null), (f === "inherit" || f === "auto") && (process.env.NODE_ENV !== "production" && f === "auto" && bl("color: 'auto'", "color: 'inherit'"), f = u || null), s || (d ||= n.color, f ||= n.textBorderColor), d != null && (e.fill = d), f != null && (e.stroke = f);
	var m = K(t.getShallow("textBorderWidth"), n.textBorderWidth);
	m != null && (e.lineWidth = m);
	var h = K(t.getShallow("textBorderType"), n.textBorderType);
	h != null && (e.lineDash = h);
	var g = K(t.getShallow("textBorderDashOffset"), n.textBorderDashOffset);
	g != null && (e.lineDashOffset = g), !o && p == null && !l && (p = a && a.defaultOpacity), p != null && (e.opacity = p), !o && !s && e.fill == null && a.inheritColor && (e.fill = a.inheritColor);
	for (var _ = 0; _ < xm.length; _++) {
		var v = xm[_], y = i !== !1 && r ? Xt(t.getShallow(v), r.getShallow(v), n[v]) : K(t.getShallow(v), n[v]);
		y != null && (e[v] = y);
	}
	for (var _ = 0; _ < Sm.length; _++) {
		var v = Sm[_], y = t.getShallow(v);
		y != null && (e[v] = y);
	}
	if (e.verticalAlign == null) {
		var b = t.getShallow("baseline");
		b != null && (e.verticalAlign = b);
	}
	if (!c || !a.disableBox) {
		for (var _ = 0; _ < Cm.length; _++) {
			var v = Cm[_], y = t.getShallow(v);
			y != null && (e[v] = y);
		}
		var x = t.getShallow("borderType");
		x != null && (e.borderDash = x), (e.backgroundColor === "auto" || e.backgroundColor === "inherit") && u && (process.env.NODE_ENV !== "production" && e.backgroundColor === "auto" && bl("backgroundColor: 'auto'", "backgroundColor: 'inherit'"), e.backgroundColor = u), (e.borderColor === "auto" || e.borderColor === "inherit") && u && (process.env.NODE_ENV !== "production" && e.borderColor === "auto" && bl("borderColor: 'auto'", "borderColor: 'inherit'"), e.borderColor = u);
	}
}
function Tm(e, t) {
	var n = t && t.getModel("textStyle");
	return $t([
		e.fontStyle || n && n.getShallow("fontStyle") || "",
		e.fontWeight || n && n.getShallow("fontWeight") || "",
		(e.fontSize || n && n.getShallow("fontSize") || 12) + "px",
		e.fontFamily || n && n.getShallow("fontFamily") || "sans-serif"
	].join(" "));
}
var Em = ql();
function Dm(e, t, n, r) {
	if (e) {
		var i = Em(e);
		i.prevValue = i.value, i.value = n;
		var a = t.normal;
		i.valueAnimation = a.get("valueAnimation"), i.valueAnimation && (i.precision = a.get("precision"), i.defaultInterpolatedText = r, i.statesModels = t);
	}
}
var Om = {
	minMargin: 1,
	textMargin: 2
}, km = ["textStyle", "color"], Am = [
	"fontStyle",
	"fontWeight",
	"fontSize",
	"fontFamily",
	"padding",
	"lineHeight",
	"rich",
	"width",
	"height",
	"overflow"
], jm = new pc(), Mm = function() {
	function e() {}
	return e.prototype.getTextColor = function(e) {
		var t = this.ecModel;
		return this.getShallow("color") || (!e && t ? t.get(km) : null);
	}, e.prototype.getFont = function() {
		return Tm({
			fontStyle: this.getShallow("fontStyle"),
			fontWeight: this.getShallow("fontWeight"),
			fontSize: this.getShallow("fontSize"),
			fontFamily: this.getShallow("fontFamily")
		}, this.ecModel);
	}, e.prototype.getTextRect = function(e) {
		for (var t = {
			text: e,
			verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
		}, n = 0; n < Am.length; n++) t[Am[n]] = this.getShallow(Am[n]);
		return jm.useStyle(t), jm.update(), jm.getBoundingRect();
	}, e;
}(), Nm = [
	["lineWidth", "width"],
	["stroke", "color"],
	["opacity"],
	["shadowBlur"],
	["shadowOffsetX"],
	["shadowOffsetY"],
	["shadowColor"],
	["lineDash", "type"],
	["lineDashOffset", "dashOffset"],
	["lineCap", "cap"],
	["lineJoin", "join"],
	["miterLimit"]
], Pm = kn(Nm), Fm = function() {
	function e() {}
	return e.prototype.getLineStyle = function(e) {
		return Pm(this, e);
	}, e;
}(), Im = [
	["fill", "color"],
	["stroke", "borderColor"],
	["lineWidth", "borderWidth"],
	["opacity"],
	["shadowBlur"],
	["shadowOffsetX"],
	["shadowOffsetY"],
	["shadowColor"],
	["lineDash", "borderType"],
	["lineDashOffset", "borderDashOffset"],
	["lineCap", "borderCap"],
	["lineJoin", "borderJoin"],
	["miterLimit", "borderMiterLimit"]
], Lm = kn(Im), Rm = function() {
	function e() {}
	return e.prototype.getItemStyle = function(e, t) {
		return Lm(this, e, t);
	}, e;
}(), zm = function() {
	function e(e, t, n) {
		this.parentModel = t, this.ecModel = n, this.option = e;
	}
	return e.prototype.init = function(e, t, n) {}, e.prototype.mergeOption = function(e, t) {
		Ot(this.option, e, !0);
	}, e.prototype.get = function(e, t) {
		return e == null ? this.option : this._doGet(this.parsePath(e), !t && this.parentModel);
	}, e.prototype.getShallow = function(e, t) {
		var n = this.option, r = n == null ? n : n[e];
		if (r == null && !t) {
			var i = this.parentModel;
			i && (r = i.getShallow(e));
		}
		return r;
	}, e.prototype.getModel = function(t, n) {
		var r = t != null, i = r ? this.parsePath(t) : null, a = r ? this._doGet(i) : this.option;
		return n ||= this.parentModel && this.parentModel.getModel(this.resolveParentPath(i)), new e(a, n, this.ecModel);
	}, e.prototype.isEmpty = function() {
		return this.option == null;
	}, e.prototype.restoreData = function() {}, e.prototype.clone = function() {
		var e = this.constructor;
		return new e(L(this.option));
	}, e.prototype.parsePath = function(e) {
		return typeof e == "string" ? e.split(".") : e;
	}, e.prototype.resolveParentPath = function(e) {
		return e;
	}, e.prototype.isAnimationEnabled = function() {
		if (!Y.node && this.option) {
			if (this.option.animation != null) return !!this.option.animation;
			if (this.parentModel) return this.parentModel.isAnimationEnabled();
		}
	}, e.prototype._doGet = function(e, t) {
		var n = this.option;
		if (!e) return n;
		for (var r = 0; r < e.length && !(e[r] && (n = n && typeof n == "object" ? n[e[r]] : null, n == null)); r++);
		return n == null && t && (n = t._doGet(this.resolveParentPath(e), t.parentModel)), n;
	}, e;
}();
xn(zm), Tn(zm), Nt(zm, Fm), Nt(zm, Rm), Nt(zm, jn), Nt(zm, Mm);
//#endregion
//#region node_modules/echarts/lib/data/DataDiffer.js
function Bm(e) {
	return e == null ? 0 : e.length || 1;
}
function Vm(e) {
	return e;
}
var Hm = function() {
	function e(e, t, n, r, i, a) {
		this._old = e, this._new = t, this._oldKeyGetter = n || Vm, this._newKeyGetter = r || Vm, this.context = i, this._diffModeMultiple = a === "multiple";
	}
	return e.prototype.add = function(e) {
		return this._add = e, this;
	}, e.prototype.update = function(e) {
		return this._update = e, this;
	}, e.prototype.updateManyToOne = function(e) {
		return this._updateManyToOne = e, this;
	}, e.prototype.updateOneToMany = function(e) {
		return this._updateOneToMany = e, this;
	}, e.prototype.updateManyToMany = function(e) {
		return this._updateManyToMany = e, this;
	}, e.prototype.remove = function(e) {
		return this._remove = e, this;
	}, e.prototype.execute = function() {
		this[this._diffModeMultiple ? "_executeMultiple" : "_executeOneToOne"]();
	}, e.prototype._executeOneToOne = function() {
		var e = this._old, t = this._new, n = {}, r = Array(e.length), i = Array(t.length);
		this._initIndexMap(e, null, r, "_oldKeyGetter"), this._initIndexMap(t, n, i, "_newKeyGetter");
		for (var a = 0; a < e.length; a++) {
			var o = r[a], s = n[o], c = Bm(s);
			if (c > 1) {
				var l = s.shift();
				s.length === 1 && (n[o] = s[0]), this._update && this._update(l, a);
			} else c === 1 ? (n[o] = null, this._update && this._update(s, a)) : this._remove && this._remove(a);
		}
		this._performRestAdd(i, n);
	}, e.prototype._executeMultiple = function() {
		var e = this._old, t = this._new, n = {}, r = {}, i = [], a = [];
		this._initIndexMap(e, n, i, "_oldKeyGetter"), this._initIndexMap(t, r, a, "_newKeyGetter");
		for (var o = 0; o < i.length; o++) {
			var s = i[o], c = n[s], l = r[s], u = Bm(c), d = Bm(l);
			if (u > 1 && d === 1) this._updateManyToOne && this._updateManyToOne(l, c), r[s] = null;
			else if (u === 1 && d > 1) this._updateOneToMany && this._updateOneToMany(l, c), r[s] = null;
			else if (u === 1 && d === 1) this._update && this._update(l, c), r[s] = null;
			else if (u > 1 && d > 1) this._updateManyToMany && this._updateManyToMany(l, c), r[s] = null;
			else if (u > 1) for (var f = 0; f < u; f++) this._remove && this._remove(c[f]);
			else this._remove && this._remove(c);
		}
		this._performRestAdd(a, r);
	}, e.prototype._performRestAdd = function(e, t) {
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = t[r], a = Bm(i);
			if (a > 1) for (var o = 0; o < a; o++) this._add && this._add(i[o]);
			else a === 1 && this._add && this._add(i);
			t[r] = null;
		}
	}, e.prototype._initIndexMap = function(e, t, n, r) {
		for (var i = this._diffModeMultiple, a = 0; a < e.length; a++) {
			var o = "_ec_" + this[r](e[a], a);
			if (i || (n[a] = o), t) {
				var s = t[o], c = Bm(s);
				c === 0 ? (t[o] = a, i && n.push(o)) : c === 1 ? t[o] = [s, a] : s.push(a);
			}
		}
	}, e;
}(), Um = {
	Must: 1,
	Might: 2,
	Not: 3
}, Wm = ql();
function Gm(e) {
	Wm(e).datasetMap = J();
}
function Km(e, t, n) {
	var r = {}, i = qm(t);
	if (!i || !e) return r;
	var a = [], o = [], s = t.ecModel, c = Wm(s).datasetMap, l = i.uid + "_" + n.seriesLayoutBy, u, d;
	e = e.slice(), z(e, function(t, n) {
		var i = G(t) ? t : e[n] = { name: t };
		i.type === "ordinal" && u == null && (u = n, d = m(i)), r[i.name] = [];
	});
	var f = c.get(l) || c.set(l, {
		categoryWayDim: d,
		valueWayDim: 0
	});
	z(e, function(e, t) {
		var n = e.name, i = m(e);
		if (u == null) {
			var s = f.valueWayDim;
			p(r[n], s, i), p(o, s, i), f.valueWayDim += i;
		} else if (u === t) p(r[n], 0, i), p(a, 0, i);
		else {
			var s = f.categoryWayDim;
			p(r[n], s, i), p(o, s, i), f.categoryWayDim += i;
		}
	});
	function p(e, t, n) {
		for (var r = 0; r < n; r++) e.push(t + r);
	}
	function m(e) {
		var t = e.dimsDef;
		return t ? t.length : 1;
	}
	return a.length && (r.itemName = a), o.length && (r.seriesName = o), r;
}
function qm(e) {
	if (!e.get("data", !0)) return Ql(e.ecModel, "dataset", {
		index: e.get("datasetIndex", !0),
		id: e.get("datasetId", !0)
	}, Zl).models[0];
}
function Jm(e) {
	return !e.get("transform", !0) && !e.get("fromTransformResult", !0) ? [] : Ql(e.ecModel, "dataset", {
		index: e.get("fromDatasetIndex", !0),
		id: e.get("fromDatasetId", !0)
	}, Zl).models;
}
function Ym(e, t) {
	return Xm(e.data, e.sourceFormat, e.seriesLayoutBy, e.dimensionsDefine, e.startIndex, t);
}
function Xm(e, t, n, r, i, a) {
	var o, s = 5;
	if (Wt(e)) return Um.Not;
	var c, l;
	if (r) {
		var u = r[a];
		G(u) ? (c = u.name, l = u.type) : W(u) && (c = u);
	}
	if (l != null) return l === "ordinal" ? Um.Must : Um.Not;
	if (t === "arrayRows") {
		var d = e;
		if (n === "row") {
			for (var f = d[a], p = 0; p < (f || []).length && p < s; p++) if ((o = b(f[i + p])) != null) return o;
		} else for (var p = 0; p < d.length && p < s; p++) {
			var m = d[i + p];
			if (m && (o = b(m[a])) != null) return o;
		}
	} else if (t === "objectRows") {
		var h = e;
		if (!c) return Um.Not;
		for (var p = 0; p < h.length && p < s; p++) {
			var g = h[p];
			if (g && (o = b(g[c])) != null) return o;
		}
	} else if (t === "keyedColumns") {
		var _ = e;
		if (!c) return Um.Not;
		var f = _[c];
		if (!f || Wt(f)) return Um.Not;
		for (var p = 0; p < f.length && p < s; p++) if ((o = b(f[p])) != null) return o;
	} else if (t === "original") for (var v = e, p = 0; p < v.length && p < s; p++) {
		var g = v[p], y = Ol(g);
		if (!H(y)) return Um.Not;
		if ((o = b(y[a])) != null) return o;
	}
	function b(e) {
		var t = W(e);
		if (e != null && isFinite(Number(e)) && e !== "") return t ? Um.Might : Um.Not;
		if (t && e !== "-") return Um.Must;
	}
	return Um.Not;
}
//#endregion
//#region node_modules/echarts/lib/data/Source.js
var Zm = function() {
	function e(e) {
		this.data = e.data || (e.sourceFormat === "keyedColumns" ? {} : []), this.sourceFormat = e.sourceFormat || "unknown", this.seriesLayoutBy = e.seriesLayoutBy || "column", this.startIndex = e.startIndex || 0, this.dimensionsDetectedCount = e.dimensionsDetectedCount, this.metaRawOption = e.metaRawOption;
		var t = this.dimensionsDefine = e.dimensionsDefine;
		if (t) for (var n = 0; n < t.length; n++) {
			var r = t[n];
			r.type == null && Ym(this, n) === Um.Must && (r.type = "ordinal");
		}
	}
	return e;
}();
function Qm(e) {
	return e instanceof Zm;
}
function $m(e, t, n) {
	n ||= nh(e);
	var r = t.seriesLayoutBy, i = rh(e, n, r, t.sourceHeader, t.dimensions);
	return new Zm({
		data: e,
		sourceFormat: n,
		seriesLayoutBy: r,
		dimensionsDefine: i.dimensionsDefine,
		startIndex: i.startIndex,
		dimensionsDetectedCount: i.dimensionsDetectedCount,
		metaRawOption: L(t)
	});
}
function eh(e) {
	return new Zm({
		data: e,
		sourceFormat: Wt(e) ? Du : Cu
	});
}
function th(e) {
	return new Zm({
		data: e.data,
		sourceFormat: e.sourceFormat,
		seriesLayoutBy: e.seriesLayoutBy,
		dimensionsDefine: L(e.dimensionsDefine),
		startIndex: e.startIndex,
		dimensionsDetectedCount: e.dimensionsDetectedCount
	});
}
function nh(e) {
	var t = Ou;
	if (Wt(e)) t = Du;
	else if (H(e)) {
		e.length === 0 && (t = wu);
		for (var n = 0, r = e.length; n < r; n++) {
			var i = e[n];
			if (i != null) {
				if (H(i) || Wt(i)) {
					t = wu;
					break;
				} else if (G(i)) {
					t = Tu;
					break;
				}
			}
		}
	} else if (G(e)) {
		for (var a in e) if (un(e, a) && Pt(e[a])) {
			t = Eu;
			break;
		}
	}
	return t;
}
function rh(e, t, n, r, i) {
	var a, o;
	if (!e) return {
		dimensionsDefine: ah(i),
		startIndex: o,
		dimensionsDetectedCount: a
	};
	if (t === "arrayRows") {
		var s = e;
		r === "auto" || r == null ? oh(function(e) {
			e != null && e !== "-" && (W(e) ? o ??= 1 : o = 0);
		}, n, s, 10) : o = Ht(r) ? r : +!!r, !i && o === 1 && (i = [], oh(function(e, t) {
			i[t] = e == null ? "" : e + "";
		}, n, s, Infinity)), a = i ? i.length : n === "row" ? s.length : s[0] ? s[0].length : null;
	} else if (t === "objectRows") i ||= ih(e);
	else if (t === "keyedColumns") i || (i = [], z(e, function(e, t) {
		i.push(t);
	}));
	else if (t === "original") {
		var c = Ol(e[0]);
		a = H(c) && c.length || 1;
	} else t === "typedArray" && process.env.NODE_ENV !== "production" && q(!!i, "dimensions must be given if data is TypedArray.");
	return {
		startIndex: o,
		dimensionsDefine: ah(i),
		dimensionsDetectedCount: a
	};
}
function ih(e) {
	for (var t = 0, n; t < e.length && !(n = e[t++]););
	if (n) return V(n);
}
function ah(e) {
	if (e) {
		var t = J();
		return B(e, function(e, n) {
			e = G(e) ? e : { name: e };
			var r = {
				name: e.name,
				displayName: e.displayName,
				type: e.type
			};
			if (r.name == null) return r;
			r.name += "", r.displayName ??= r.name;
			var i = t.get(r.name);
			return i ? r.name += "-" + i.count++ : t.set(r.name, { count: 1 }), r;
		});
	}
}
function oh(e, t, n, r) {
	if (t === "row") for (var i = 0; i < n.length && i < r; i++) e(n[i] ? n[i][0] : null, i);
	else for (var a = n[0] || [], i = 0; i < a.length && i < r; i++) e(a[i], i);
}
function sh(e) {
	var t = e.sourceFormat;
	return t === "objectRows" || t === "keyedColumns";
}
//#endregion
//#region node_modules/echarts/lib/data/helper/dataProvider.js
var ch, lh, uh, dh, fh, ph, mh = function() {
	function e(e, t) {
		var n = Qm(e) ? e : eh(e);
		this._source = n;
		var r = this._data = n.data, i = n.sourceFormat, a = n.seriesLayoutBy;
		if (i === "typedArray") {
			if (process.env.NODE_ENV !== "production" && t == null) throw Error("Typed array data must specify dimension size");
			this._offset = 0, this._dimSize = t, this._data = r;
		}
		if (process.env.NODE_ENV !== "production") {
			var o = gh[Eh(i, a)];
			o && o(r, n.dimensionsDefine);
		}
		ph(this, r, n);
	}
	return e.prototype.getSource = function() {
		return this._source;
	}, e.prototype.count = function() {
		return 0;
	}, e.prototype.getItem = function(e, t) {}, e.prototype.appendData = function(e) {}, e.prototype.clean = function() {}, e.protoInitialize = function() {
		var t = e.prototype;
		t.pure = !1, t.persistent = !0;
	}(), e.internalField = function() {
		var e;
		ph = function(e, i, a) {
			var o = a.sourceFormat, s = a.seriesLayoutBy, c = a.startIndex, l = a.dimensionsDefine, u = fh[Eh(o, s)];
			process.env.NODE_ENV !== "production" && q(u, "Invalide sourceFormat: " + o), R(e, u), o === "typedArray" ? (e.getItem = t, e.count = r, e.fillStorage = n) : (e.getItem = zt(yh(o, s), null, i, c, l), e.count = zt(Sh(o, s), null, i, c, l));
		};
		var t = function(e, t) {
			e -= this._offset, t ||= [];
			for (var n = this._data, r = this._dimSize, i = r * e, a = 0; a < r; a++) t[a] = n[i + a];
			return t;
		}, n = function(e, t, n, r) {
			for (var i = this._data, a = this._dimSize, o = 0; o < a; o++) {
				for (var s = r[o], c = s[0] == null ? Infinity : s[0], l = s[1] == null ? -Infinity : s[1], u = t - e, d = n[o], f = 0; f < u; f++) {
					var p = i[f * a + o];
					d[e + f] = p, p < c && (c = p), p > l && (l = p);
				}
				s[0] = c, s[1] = l;
			}
		}, r = function() {
			return this._data ? this._data.length / this._dimSize : 0;
		};
		fh = (e = {}, e[wu + "_" + ku] = {
			pure: !0,
			appendData: i
		}, e[wu + "_row"] = {
			pure: !0,
			appendData: function() {
				throw Error("Do not support appendData when set seriesLayoutBy: \"row\".");
			}
		}, e[Tu] = {
			pure: !0,
			appendData: i
		}, e[Eu] = {
			pure: !0,
			appendData: function(e) {
				var t = this._data;
				z(e, function(e, n) {
					for (var r = t[n] || (t[n] = []), i = 0; i < (e || []).length; i++) r.push(e[i]);
				});
			}
		}, e[Cu] = { appendData: i }, e[Du] = {
			persistent: !1,
			pure: !0,
			appendData: function(e) {
				process.env.NODE_ENV !== "production" && q(Wt(e), "Added data must be TypedArray if data in initialization is TypedArray"), this._data = e;
			},
			clean: function() {
				this._offset += this.count(), this._data = null;
			}
		}, e);
		function i(e) {
			for (var t = 0; t < e.length; t++) this._data.push(e[t]);
		}
	}(), e;
}(), hh = function(e) {
	H(e) || vl("series.data or dataset.source must be an array.");
}, gh = (ch = {}, ch[wu + "_" + ku] = hh, ch[wu + "_row"] = hh, ch[Tu] = hh, ch[Eu] = function(e, t) {
	for (var n = 0; n < t.length; n++) t[n].name ?? vl("dimension name must not be null/undefined.");
}, ch[Cu] = hh, ch), _h = function(e, t, n, r) {
	return e[r];
}, vh = (lh = {}, lh[wu + "_" + ku] = function(e, t, n, r) {
	return e[r + t];
}, lh[wu + "_row"] = function(e, t, n, r, i) {
	r += t;
	for (var a = i || [], o = e, s = 0; s < o.length; s++) {
		var c = o[s];
		a[s] = c ? c[r] : null;
	}
	return a;
}, lh[Tu] = _h, lh[Eu] = function(e, t, n, r, i) {
	for (var a = i || [], o = 0; o < n.length; o++) {
		var s = n[o].name, c = s == null ? null : e[s];
		a[o] = c ? c[r] : null;
	}
	return a;
}, lh[Cu] = _h, lh);
function yh(e, t) {
	var n = vh[Eh(e, t)];
	return process.env.NODE_ENV !== "production" && q(n, "Do not support get item on \"" + e + "\", \"" + t + "\"."), n;
}
var bh = function(e, t, n) {
	return e.length;
}, xh = (uh = {}, uh[wu + "_" + ku] = function(e, t, n) {
	return Math.max(0, e.length - t);
}, uh[wu + "_row"] = function(e, t, n) {
	var r = e[0];
	return r ? Math.max(0, r.length - t) : 0;
}, uh[Tu] = bh, uh[Eu] = function(e, t, n) {
	var r = n[0].name, i = r == null ? null : e[r];
	return i ? i.length : 0;
}, uh[Cu] = bh, uh);
function Sh(e, t) {
	var n = xh[Eh(e, t)];
	return process.env.NODE_ENV !== "production" && q(n, "Do not support count on \"" + e + "\", \"" + t + "\"."), n;
}
var Ch = function(e, t, n) {
	return e[t];
}, wh = (dh = {}, dh[wu] = Ch, dh[Tu] = function(e, t, n) {
	return e[n];
}, dh[Eu] = Ch, dh[Cu] = function(e, t, n) {
	var r = Ol(e);
	return r instanceof Array ? r[t] : r;
}, dh[Du] = Ch, dh);
function Th(e) {
	var t = wh[e];
	return process.env.NODE_ENV !== "production" && q(t, "Do not support get value on \"" + e + "\"."), t;
}
function Eh(e, t) {
	return e === "arrayRows" ? e + "_" + t : e;
}
function Dh(e, t, n) {
	if (e) {
		var r = e.getRawDataItem(t);
		if (r != null) {
			var i = e.getStore(), a = i.getSource().sourceFormat;
			if (n != null) {
				var o = e.getDimensionIndex(n), s = i.getDimensionProperty(o);
				return Th(a)(r, o, s);
			} else {
				var c = r;
				return a === "original" && (c = Ol(r)), c;
			}
		}
	}
}
//#endregion
//#region node_modules/echarts/lib/data/helper/dimensionHelper.js
var Oh = function() {
	function e(e, t) {
		this._encode = e, this._schema = t;
	}
	return e.prototype.get = function() {
		return {
			fullDimensions: this._getFullDimensionNames(),
			encode: this._encode
		};
	}, e.prototype._getFullDimensionNames = function() {
		return this._cachedDimNames ||= this._schema ? this._schema.makeOutputDimensionNames() : [], this._cachedDimNames;
	}, e;
}();
function kh(e, t) {
	var n = {}, r = n.encode = {}, i = J(), a = [], o = [], s = {};
	z(e.dimensions, function(t) {
		var n = e.getDimensionInfo(t), c = n.coordDim;
		if (c) {
			process.env.NODE_ENV !== "production" && q(Su.get(c) == null);
			var l = n.coordDimIndex;
			Ah(r, c)[l] = t, n.isExtraCoord || (i.set(c, 1), Mh(n.type) && (a[0] = t), Ah(s, c)[l] = e.getDimensionIndex(n.name)), n.defaultTooltip && o.push(t);
		}
		Su.each(function(e, t) {
			var i = Ah(r, t), a = n.otherDims[t];
			a != null && a !== !1 && (i[a] = n.name);
		});
	});
	var c = [], l = {};
	i.each(function(e, t) {
		var n = r[t];
		l[t] = n[0], c = c.concat(n);
	}), n.dataDimsOnCoord = c, n.dataDimIndicesOnCoord = B(c, function(t) {
		return e.getDimensionInfo(t).storeDimIndex;
	}), n.encodeFirstDimNotExtra = l;
	var u = r.label;
	u && u.length && (a = u.slice());
	var d = r.tooltip;
	return d && d.length ? o = d.slice() : o.length || (o = a.slice()), r.defaultedLabel = a, r.defaultedTooltip = o, n.userOutput = new Oh(s, t), n;
}
function Ah(e, t) {
	return e.hasOwnProperty(t) || (e[t] = []), e[t];
}
function jh(e) {
	return e === "category" ? "ordinal" : e === "time" ? "time" : "float";
}
function Mh(e) {
	return !(e === "ordinal" || e === "time");
}
//#endregion
//#region node_modules/echarts/lib/data/SeriesDimensionDefine.js
var Nh = function() {
	function e(e) {
		this.otherDims = {}, e != null && R(this, e);
	}
	return e;
}();
//#endregion
//#region node_modules/echarts/lib/data/helper/dataValueHelper.js
function Ph(e, t) {
	var n = t && t.type;
	return n === "ordinal" ? e : (n === "time" && !Ht(e) && e != null && e !== "-" && (e = +nl(e)), e == null || e === "" ? NaN : Number(e));
}
J({
	number: function(e) {
		return parseFloat(e);
	},
	time: function(e) {
		return +nl(e);
	},
	trim: function(e) {
		return W(e) ? $t(e) : e;
	}
});
var Fh = {
	lt: function(e, t) {
		return e < t;
	},
	lte: function(e, t) {
		return e <= t;
	},
	gt: function(e, t) {
		return e > t;
	},
	gte: function(e, t) {
		return e >= t;
	}
};
(function() {
	function e(e, t) {
		if (!Ht(t)) {
			var n = "";
			process.env.NODE_ENV !== "production" && (n = "rvalue of \"<\", \">\", \"<=\", \">=\" can only be number in filter."), Sl(n);
		}
		this._opFn = Fh[e], this._rvalFloat = ol(t);
	}
	return e.prototype.evaluate = function(e) {
		return Ht(e) ? this._opFn(e, this._rvalFloat) : this._opFn(ol(e), this._rvalFloat);
	}, e;
})();
var Ih = function() {
	function e(e, t) {
		var n = e === "desc";
		this._resultLT = n ? 1 : -1, t ??= n ? "min" : "max", this._incomparable = t === "min" ? -Infinity : Infinity;
	}
	return e.prototype.evaluate = function(e, t) {
		var n = Ht(e) ? e : ol(e), r = Ht(t) ? t : ol(t), i = isNaN(n), a = isNaN(r);
		if (i && (n = this._incomparable), a && (r = this._incomparable), i && a) {
			var o = W(e), s = W(t);
			o && (n = s ? e : 0), s && (r = o ? t : 0);
		}
		return n < r ? this._resultLT : n > r ? -this._resultLT : 0;
	}, e;
}();
(function() {
	function e(e, t) {
		this._rval = t, this._isEQ = e, this._rvalTypeof = typeof t, this._rvalFloat = ol(t);
	}
	return e.prototype.evaluate = function(e) {
		var t = e === this._rval;
		if (!t) {
			var n = typeof e;
			n !== this._rvalTypeof && (n === "number" || this._rvalTypeof === "number") && (t = ol(e) === this._rvalFloat);
		}
		return this._isEQ ? t : !t;
	}, e;
})();
function Lh(e) {
	var t = "", n = -Infinity, r = -Infinity, i = Infinity, a = Infinity;
	return e && (e.g != null && (t += "G" + e.g, n = e.g), e.ge != null && (t += "GE" + e.ge, r = e.ge), e.l != null && (t += "L" + e.l, i = e.l), e.le != null && (t += "LE" + e.le, a = e.le)), {
		key: t,
		g: n,
		ge: r,
		l: i,
		le: a
	};
}
function Rh(e, t) {
	return t > e.g && t >= e.ge && t < e.l && t <= e.le;
}
//#endregion
//#region node_modules/echarts/lib/data/DataStore.js
var zh = typeof Uint32Array > "u" ? Array : Uint32Array, Bh = typeof Uint16Array > "u" ? Array : Uint16Array, Vh = typeof Int32Array > "u" ? Array : Int32Array, Hh = typeof Float64Array > "u" ? Array : Float64Array, Uh = {
	float: Hh,
	int: Vh,
	ordinal: Array,
	number: Array,
	time: Hh
}, Wh;
function Gh(e) {
	return e > 65535 ? zh : Bh;
}
function Kh(e) {
	var t = e.constructor;
	return t === Array ? e.slice() : new t(e);
}
function qh(e, t, n, r, i) {
	var a = Uh[n || "float"];
	if (i) {
		var o = e[t], s = o && o.length;
		if (s !== r) {
			for (var c = new a(r), l = 0; l < s; l++) c[l] = o[l];
			e[t] = c;
		}
	} else e[t] = new a(r);
}
var Jh = function() {
	function e() {
		this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = J();
	}
	return e.prototype.initData = function(e, t, n) {
		process.env.NODE_ENV !== "production" && q(U(e.getItem) && U(e.count), "Invalid data provider."), this._provider = e, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
		var r = e.getSource(), i = this.defaultDimValueGetter = Wh[r.sourceFormat];
		this._dimValueGetter = n || i, this._rawExtent = [];
		var a = sh(r);
		this._dimensions = B(t, function(e) {
			return process.env.NODE_ENV !== "production" && a && q(e.property != null), {
				type: e.type,
				property: e.property
			};
		}), this._initDataFromProvider(0, e.count());
	}, e.prototype.getProvider = function() {
		return this._provider;
	}, e.prototype.getSource = function() {
		return this._provider.getSource();
	}, e.prototype.ensureCalculationDimension = function(e, t) {
		var n = this._calcDimNameToIdx, r = this._dimensions, i = n.get(e);
		if (i != null) {
			if (r[i].type === t) return i;
		} else i = r.length;
		return r[i] = { type: t }, n.set(e, i), this._chunks[i] = new Uh[t || "float"](this._rawCount), this._rawExtent[i] = ru(), i;
	}, e.prototype.collectOrdinalMeta = function(e, t) {
		var n = this._chunks[e], r = this._dimensions[e], i = this._rawExtent, a = r.ordinalOffset || 0, o = n.length;
		a === 0 && (i[e] = ru());
		for (var s = i[e], c = a; c < o; c++) {
			var l = n[c] = t.parseAndCollect(n[c]);
			isNaN(l) || (s[0] = Math.min(l, s[0]), s[1] = Math.max(l, s[1]));
		}
		r.ordinalMeta = t, r.ordinalOffset = o, r.type = "ordinal";
	}, e.prototype.getOrdinalMeta = function(e) {
		return this._dimensions[e].ordinalMeta;
	}, e.prototype.getDimensionProperty = function(e) {
		var t = this._dimensions[e];
		return t && t.property;
	}, e.prototype.appendData = function(e) {
		process.env.NODE_ENV !== "production" && q(!this._indices, "appendData can only be called on raw data.");
		var t = this._provider, n = this.count();
		t.appendData(e);
		var r = t.count();
		return t.persistent || (r += n), n < r && this._initDataFromProvider(n, r, !0), [n, r];
	}, e.prototype.appendValues = function(e, t) {
		for (var n = this._chunks, r = this._dimensions, i = r.length, a = this._rawExtent, o = this.count(), s = o + Math.max(e.length, t || 0), c = 0; c < i; c++) {
			var l = r[c];
			qh(n, c, l.type, s, !0);
		}
		for (var u = [], d = o; d < s; d++) for (var f = d - o, p = 0; p < i; p++) {
			var l = r[p], m = Wh.arrayRows.call(this, e[f] || u, l.property, f, p);
			n[p][d] = m;
			var h = a[p];
			m < h[0] && (h[0] = m), m > h[1] && (h[1] = m);
		}
		return this._rawCount = this._count = s, {
			start: o,
			end: s
		};
	}, e.prototype._initDataFromProvider = function(e, t, n) {
		for (var r = this._provider, i = this._chunks, a = this._dimensions, o = a.length, s = this._rawExtent, c = B(a, function(e) {
			return e.property;
		}), l = 0; l < o; l++) {
			var u = a[l];
			s[l] || (s[l] = ru()), qh(i, l, u.type, t, n);
		}
		if (r.fillStorage) r.fillStorage(e, t, i, s);
		else for (var d = [], f = e; f < t; f++) {
			d = r.getItem(f, d);
			for (var p = 0; p < o; p++) {
				var m = i[p], h = this._dimValueGetter(d, c[p], f, p);
				m[f] = h;
				var g = s[p];
				h < g[0] && (g[0] = h), h > g[1] && (g[1] = h);
			}
		}
		!r.persistent && r.clean && r.clean(), this._rawCount = this._count = t, this._extent = [];
	}, e.prototype.count = function() {
		return this._count;
	}, e.prototype.get = function(e, t) {
		if (!(t >= 0 && t < this._count)) return NaN;
		var n = this._chunks[e];
		return n ? n[this.getRawIndex(t)] : NaN;
	}, e.prototype.getValues = function(e, t) {
		var n = [], r = [];
		if (t == null) {
			t = e, e = [];
			for (var i = 0; i < this._dimensions.length; i++) r.push(i);
		} else r = e;
		for (var i = 0, a = r.length; i < a; i++) n.push(this.get(r[i], t));
		return n;
	}, e.prototype.getByRawIndex = function(e, t) {
		if (!(t >= 0 && t < this._rawCount)) return NaN;
		var n = this._chunks[e];
		return n ? n[t] : NaN;
	}, e.prototype.getSum = function(e) {
		var t = this._chunks[e], n = 0;
		if (t) for (var r = 0, i = this.count(); r < i; r++) {
			var a = this.get(e, r);
			isNaN(a) || (n += a);
		}
		return n;
	}, e.prototype.getMedian = function(e) {
		var t = [];
		this.each([e], function(e) {
			isNaN(e) || t.push(e);
		}), qc(t);
		var n = this.count();
		return n === 0 ? 0 : n % 2 == 1 ? t[(n - 1) / 2] : (t[n / 2] + t[n / 2 - 1]) / 2;
	}, e.prototype.indexOfRawIndex = function(e) {
		if (e >= this._rawCount || e < 0) return -1;
		if (!this._indices) return e;
		var t = this._indices, n = t[e];
		if (n != null && n < this._count && n === e) return e;
		for (var r = 0, i = this._count - 1; r <= i;) {
			var a = (r + i) / 2 | 0;
			if (t[a] < e) r = a + 1;
			else if (t[a] > e) i = a - 1;
			else return a;
		}
		return -1;
	}, e.prototype.getIndices = function() {
		var e, t = this._indices;
		if (t) {
			var n = t.constructor, r = this._count;
			if (n === Array) {
				e = new n(r);
				for (var i = 0; i < r; i++) e[i] = t[i];
			} else e = new n(t.buffer, 0, r);
		} else {
			var n = Gh(this._rawCount);
			e = new n(this.count());
			for (var i = 0; i < e.length; i++) e[i] = i;
		}
		return e;
	}, e.prototype.filter = function(e, t) {
		if (!this._count) return this;
		for (var n = this.clone(), r = n.count(), i = new (Gh(n._rawCount))(r), a = [], o = e.length, s = 0, c = e[0], l = n._chunks, u = 0; u < r; u++) {
			var d = void 0, f = n.getRawIndex(u);
			if (o === 0) d = t(u);
			else if (o === 1) {
				var p = l[c][f];
				d = t(p, u);
			} else {
				for (var m = 0; m < o; m++) a[m] = l[e[m]][f];
				a[m] = u, d = t.apply(null, a);
			}
			d && (i[s++] = f);
		}
		return s < r && (n._indices = i), n._count = s, n._extent = [], n._updateGetRawIdx(), n;
	}, e.prototype.selectRange = function(e) {
		var t = this.clone(), n = t._count;
		if (!n) return this;
		var r = V(e), i = r.length;
		if (!i) return this;
		var a = t.count(), o = new (Gh(t._rawCount))(a), s = 0, c = r[0], l = e[c][0], u = e[c][1], d = t._chunks, f = !1;
		if (!t._indices) {
			var p = 0;
			if (i === 1) {
				for (var m = d[r[0]], h = 0; h < n; h++) {
					var g = m[h];
					(g >= l && g <= u || isNaN(g)) && (o[s++] = p), p++;
				}
				f = !0;
			} else if (i === 2) {
				for (var m = d[r[0]], _ = d[r[1]], v = e[r[1]][0], y = e[r[1]][1], h = 0; h < n; h++) {
					var g = m[h], b = _[h];
					(g >= l && g <= u || isNaN(g)) && (b >= v && b <= y || isNaN(b)) && (o[s++] = p), p++;
				}
				f = !0;
			}
		}
		if (!f) if (i === 1) for (var h = 0; h < a; h++) {
			var x = t.getRawIndex(h), g = d[r[0]][x];
			(g >= l && g <= u || isNaN(g)) && (o[s++] = x);
		}
		else for (var h = 0; h < a; h++) {
			for (var S = !0, x = t.getRawIndex(h), C = 0; C < i; C++) {
				var w = r[C], g = d[w][x];
				(g < e[w][0] || g > e[w][1]) && (S = !1);
			}
			S && (o[s++] = t.getRawIndex(h));
		}
		return s < a && (t._indices = o), t._count = s, t._extent = [], t._updateGetRawIdx(), t;
	}, e.prototype.map = function(e, t) {
		var n = this.clone(e);
		return this._updateDims(n, e, t), n;
	}, e.prototype.modify = function(e, t) {
		this._updateDims(this, e, t);
	}, e.prototype._updateDims = function(e, t, n) {
		for (var r = e._chunks, i = [], a = t.length, o = e.count(), s = [], c = e._rawExtent, l = 0; l < t.length; l++) c[t[l]] = ru();
		for (var u = 0; u < o; u++) {
			for (var d = e.getRawIndex(u), f = 0; f < a; f++) s[f] = r[t[f]][d];
			s[a] = u;
			var p = n && n.apply(null, s);
			if (p != null) {
				typeof p != "object" && (i[0] = p, p = i);
				for (var l = 0; l < p.length; l++) {
					var m = t[l], h = p[l], g = c[m], _ = r[m];
					_ && (_[d] = h), h < g[0] && (g[0] = h), h > g[1] && (g[1] = h);
				}
			}
		}
	}, e.prototype.lttbDownSample = function(e, t) {
		var n = this.clone([e], !0), r = n._chunks[e], i = this.count(), a = 0, o = Math.floor(1 / t), s = this.getRawIndex(0), c, l, u, d = new (Gh(this._rawCount))(Math.min((Math.ceil(i / o) + 2) * 2, i));
		d[a++] = s;
		for (var f = 1; f < i - 1; f += o) {
			for (var p = Math.min(f + o, i - 1), m = Math.min(f + o * 2, i), h = (m + p) / 2, g = 0, _ = p; _ < m; _++) {
				var v = this.getRawIndex(_), y = r[v];
				isNaN(y) || (g += y);
			}
			g /= m - p;
			var b = f, x = Math.min(f + o, i), S = f - 1, C = r[s];
			c = -1, u = b;
			for (var w = -1, T = 0, _ = b; _ < x; _++) {
				var v = this.getRawIndex(_), y = r[v];
				if (isNaN(y)) {
					T++, w < 0 && (w = v);
					continue;
				}
				l = Math.abs((S - h) * (y - C) - (S - _) * (g - C)), l > c && (c = l, u = v);
			}
			T > 0 && T < x - b && (d[a++] = Math.min(w, u), u = Math.max(w, u)), d[a++] = u, s = u;
		}
		return d[a++] = this.getRawIndex(i - 1), n._count = a, n._indices = d, n.getRawIndex = this._getRawIdx, n;
	}, e.prototype.minmaxDownSample = function(e, t) {
		for (var n = this.clone([e], !0), r = n._chunks, i = Math.floor(1 / t), a = r[e], o = this.count(), s = new (Gh(this._rawCount))(Math.ceil(o / i) * 2), c = 0, l = 0; l < o; l += i) {
			var u = l, d = a[this.getRawIndex(u)], f = l, p = a[this.getRawIndex(f)], m = i;
			l + i > o && (m = o - l);
			for (var h = 0; h < m; h++) {
				var g = a[this.getRawIndex(l + h)];
				g < d && (d = g, u = l + h), g > p && (p = g, f = l + h);
			}
			var _ = this.getRawIndex(u), v = this.getRawIndex(f);
			u < f ? (s[c++] = _, s[c++] = v) : (s[c++] = v, s[c++] = _);
		}
		return n._count = c, n._indices = s, n._updateGetRawIdx(), n;
	}, e.prototype.downSample = function(e, t, n, r) {
		for (var i = this.clone([e], !0), a = i._chunks, o = [], s = Math.floor(1 / t), c = a[e], l = this.count(), u = i._rawExtent[e] = ru(), d = new (Gh(this._rawCount))(Math.ceil(l / s)), f = 0, p = 0; p < l; p += s) {
			s > l - p && (s = l - p, o.length = s);
			for (var m = 0; m < s; m++) o[m] = c[this.getRawIndex(p + m)];
			var h = n(o), g = this.getRawIndex(Math.min(p + r(o, h) || 0, l - 1));
			c[g] = h, h < u[0] && (u[0] = h), h > u[1] && (u[1] = h), d[f++] = g;
		}
		return i._count = f, i._indices = d, i._updateGetRawIdx(), i;
	}, e.prototype.each = function(e, t) {
		if (this._count) for (var n = e.length, r = this._chunks, i = 0, a = this.count(); i < a; i++) {
			var o = this.getRawIndex(i);
			switch (n) {
				case 0:
					t(i);
					break;
				case 1:
					t(r[e[0]][o], i);
					break;
				case 2:
					t(r[e[0]][o], r[e[1]][o], i);
					break;
				default:
					for (var s = 0, c = []; s < n; s++) c[s] = r[e[s]][o];
					c[s] = i, t.apply(null, c);
			}
		}
	}, e.prototype.getDataExtent = function(e, t) {
		var n = this._chunks[e], r = ru();
		if (!n) return r;
		var i = this.count();
		if (!this._indices && !t) return this._rawExtent[e].slice();
		var a = this._extent, o = a[e] || (a[e] = {}), s = Lh(t), c = s.key, l = o[c];
		if (l) return l.slice();
		for (var u = r[0], d = r[1], f = 0; f < i; f++) {
			var p = n[this.getRawIndex(f)];
			(!t || Rh(s, p)) && (p < u && (u = p), p > d && (d = p));
		}
		return o[c] = [u, d];
	}, e.prototype.getRawDataItem = function(e) {
		var t = this.getRawIndex(e);
		if (this._provider.persistent) return this._provider.getItem(t);
		for (var n = [], r = this._chunks, i = 0; i < r.length; i++) n.push(r[i][t]);
		return n;
	}, e.prototype.clone = function(t, n) {
		var r = new e(), i = this._chunks, a = t && Ft(t, function(e, t) {
			return e[t] = !0, e;
		}, {});
		if (a) for (var o = 0; o < i.length; o++) r._chunks[o] = a[o] ? Kh(i[o]) : i[o];
		else r._chunks = i;
		return this._copyCommonProps(r), n || (r._indices = this._cloneIndices()), r._updateGetRawIdx(), r;
	}, e.prototype._copyCommonProps = function(e) {
		e._count = this._count, e._rawCount = this._rawCount, e._provider = this._provider, e._dimensions = this._dimensions, e._extent = L(this._extent), e._rawExtent = L(this._rawExtent);
	}, e.prototype._cloneIndices = function() {
		if (this._indices) {
			var e = this._indices.constructor, t = void 0;
			if (e === Array) {
				var n = this._indices.length;
				t = new e(n);
				for (var r = 0; r < n; r++) t[r] = this._indices[r];
			} else t = new e(this._indices);
			return t;
		}
		return null;
	}, e.prototype._getRawIdxIdentity = function(e) {
		return e;
	}, e.prototype._getRawIdx = function(e) {
		return e < this._count && e >= 0 ? this._indices[e] : -1;
	}, e.prototype._updateGetRawIdx = function() {
		this.getRawIndex = this._indices ? this._getRawIdx : this._getRawIdxIdentity;
	}, e.internalField = function() {
		function e(e, t, n, r) {
			return Ph(e[r], this._dimensions[r]);
		}
		Wh = {
			arrayRows: e,
			objectRows: function(e, t, n, r) {
				return Ph(e[t], this._dimensions[r]);
			},
			keyedColumns: e,
			original: function(e, t, n, r) {
				var i = e && (e.value == null ? e : e.value);
				return Ph(i instanceof Array ? i[r] : i, this._dimensions[r]);
			},
			typedArray: function(e, t, n, r) {
				return e[r];
			}
		};
	}(), e;
}(), Yh = ql(), Xh = {
	float: "f",
	int: "i",
	ordinal: "o",
	number: "n",
	time: "t"
}, Zh = function() {
	function e(e) {
		this.dimensions = e.dimensions, this._dimOmitted = e.dimensionOmitted, this.source = e.source, this._fullDimCount = e.fullDimensionCount, this._updateDimOmitted(e.dimensionOmitted);
	}
	return e.prototype.isDimensionOmitted = function() {
		return this._dimOmitted;
	}, e.prototype._updateDimOmitted = function(e) {
		this._dimOmitted = e, e && (this._dimNameMap ||= eg(this.source));
	}, e.prototype.getSourceDimensionIndex = function(e) {
		return K(this._dimNameMap.get(e), -1);
	}, e.prototype.getSourceDimension = function(e) {
		var t = this.source.dimensionsDefine;
		if (t) return t[e];
	}, e.prototype.makeStoreSchema = function() {
		for (var e = this._fullDimCount, t = sh(this.source), n = !tg(e), r = "", i = [], a = 0, o = 0; a < e; a++) {
			var s = void 0, c = void 0, l = void 0, u = this.dimensions[o];
			if (u && u.storeDimIndex === a) s = t ? u.name : null, c = u.type, l = u.ordinalMeta, o++;
			else {
				var d = this.getSourceDimension(a);
				d && (s = t ? d.name : null, c = d.type);
			}
			i.push({
				property: s,
				type: c,
				ordinalMeta: l
			}), t && s != null && (!u || !u.isCalculationCoord) && (r += n ? s.replace(/\`/g, "`1").replace(/\$/g, "`2") : s), r += "$", r += Xh[c] || "f", l && (r += l.uid), r += "$";
		}
		var f = this.source;
		return {
			dimensions: i,
			hash: [
				f.seriesLayoutBy,
				f.startIndex,
				r
			].join("$$")
		};
	}, e.prototype.makeOutputDimensionNames = function() {
		for (var e = [], t = 0, n = 0; t < this._fullDimCount; t++) {
			var r = void 0, i = this.dimensions[n];
			if (i && i.storeDimIndex === t) i.isCalculationCoord || (r = i.name), n++;
			else {
				var a = this.getSourceDimension(t);
				a && (r = a.name);
			}
			e.push(r);
		}
		return e;
	}, e.prototype.appendCalculationDimension = function(e) {
		this.dimensions.push(e), e.isCalculationCoord = !0, this._fullDimCount++, this._updateDimOmitted(!0);
	}, e;
}();
function Qh(e) {
	return e instanceof Zh;
}
function $h(e) {
	for (var t = J(), n = 0; n < (e || []).length; n++) {
		var r = e[n], i = G(r) ? r.name : r;
		i != null && t.get(i) == null && t.set(i, n);
	}
	return t;
}
function eg(e) {
	var t = Yh(e);
	return t.dimNameMap ||= $h(e.dimensionsDefine);
}
function tg(e) {
	return e > 30;
}
//#endregion
//#region node_modules/echarts/lib/data/SeriesData.js
var ng = G, rg = B, ig = typeof Int32Array > "u" ? Array : Int32Array, ag = "e\0\0", og = -1, sg = [
	"hasItemOption",
	"_nameList",
	"_idList",
	"_invertedIndicesMap",
	"_dimSummary",
	"userOutput",
	"_rawData",
	"_dimValueGetter",
	"_nameDimIdx",
	"_idDimIdx",
	"_nameRepeatCount"
], cg = ["_approximateExtent"], lg, ug, dg, fg, pg, mg, hg, gg = function() {
	function e(e, t) {
		this.type = "list", this._dimOmitted = !1, this._nameList = [], this._idList = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this._itemLayouts = [], this._graphicEls = [], this._approximateExtent = {}, this._calculationInfo = {}, this.hasItemOption = !1, this.TRANSFERABLE_METHODS = [
			"cloneShallow",
			"downSample",
			"minmaxDownSample",
			"lttbDownSample",
			"map"
		], this.CHANGABLE_METHODS = ["filterSelf", "selectRange"], this.DOWNSAMPLE_METHODS = [
			"downSample",
			"minmaxDownSample",
			"lttbDownSample"
		];
		var n, r = !1;
		Qh(e) ? (n = e.dimensions, this._dimOmitted = e.isDimensionOmitted(), this._schema = e) : (r = !0, n = e), n ||= ["x", "y"];
		for (var i = {}, a = [], o = {}, s = !1, c = {}, l = 0; l < n.length; l++) {
			var u = n[l], d = W(u) ? new Nh({ name: u }) : u instanceof Nh ? u : new Nh(u), f = d.name;
			d.type = d.type || "float", d.coordDim || (d.coordDim = f, d.coordDimIndex = 0);
			var p = d.otherDims = d.otherDims || {};
			a.push(f), i[f] = d, c[f] != null && (s = !0), d.createInvertedIndices && (o[f] = []), process.env.NODE_ENV !== "production" && q(r || d.storeDimIndex >= 0), r && (d.storeDimIndex = l), p.itemName === 0 && (this._nameDimIdx = d.storeDimIndex), p.itemId === 0 && (this._idDimIdx = d.storeDimIndex);
		}
		if (this.dimensions = a, this._dimInfos = i, this._initGetDimensionInfo(s), this.hostModel = t, this._invertedIndicesMap = o, this._dimOmitted) {
			var m = this._dimIdxToName = J();
			z(a, function(e) {
				m.set(i[e].storeDimIndex, e);
			});
		}
	}
	return e.prototype.getDimension = function(e) {
		var t = this._recognizeDimIndex(e);
		if (t == null) return e;
		if (t = e, !this._dimOmitted) return this.dimensions[t];
		var n = this._dimIdxToName.get(t);
		if (n != null) return n;
		var r = this._schema.getSourceDimension(t);
		if (r) return r.name;
	}, e.prototype.getDimensionIndex = function(e) {
		var t = this._recognizeDimIndex(e);
		if (t != null) return t;
		if (e == null) return -1;
		var n = this._getDimInfo(e);
		return n ? n.storeDimIndex : this._dimOmitted ? this._schema.getSourceDimensionIndex(e) : -1;
	}, e.prototype._recognizeDimIndex = function(e) {
		if (Ht(e) || e != null && !isNaN(e) && !this._getDimInfo(e) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(e) < 0)) return +e;
	}, e.prototype._getStoreDimIndex = function(e) {
		var t = this.getDimensionIndex(e);
		if (process.env.NODE_ENV !== "production" && t == null) throw Error("Unknown dimension " + e);
		return t;
	}, e.prototype.getDimensionInfo = function(e) {
		return this._getDimInfo(this.getDimension(e));
	}, e.prototype._initGetDimensionInfo = function(e) {
		var t = this._dimInfos;
		this._getDimInfo = e ? function(e) {
			return t.hasOwnProperty(e) ? t[e] : void 0;
		} : function(e) {
			return t[e];
		};
	}, e.prototype.getDimensionsOnCoord = function() {
		return this._dimSummary.dataDimsOnCoord.slice();
	}, e.prototype.mapDimension = function(e, t) {
		var n = this._dimSummary;
		if (t == null) return n.encodeFirstDimNotExtra[e];
		var r = n.encode[e];
		return r ? r[t] : null;
	}, e.prototype.mapDimensionsAll = function(e) {
		return (this._dimSummary.encode[e] || []).slice();
	}, e.prototype.getStore = function() {
		return this._store;
	}, e.prototype.initData = function(e, t, n) {
		var r = this, i;
		if (e instanceof Jh && (i = e), !i) {
			var a = this.dimensions, o = Qm(e) || Pt(e) ? new mh(e, a.length) : e;
			i = new Jh();
			var s = rg(a, function(e) {
				return {
					type: r._dimInfos[e].type,
					property: e
				};
			});
			i.initData(o, s, n);
		}
		this._store = i, this._nameList = (t || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, i.count()), this._dimSummary = kh(this, this._schema), this.userOutput = this._dimSummary.userOutput;
	}, e.prototype.appendData = function(e) {
		var t = this._store.appendData(e);
		this._doInit(t[0], t[1]);
	}, e.prototype.appendValues = function(e, t) {
		var n = this._store.appendValues(e, t && t.length), r = n.start, i = n.end, a = this._shouldMakeIdFromName();
		if (this._updateOrdinalMeta(), t) for (var o = r; o < i; o++) {
			var s = o - r;
			this._nameList[o] = t[s], a && hg(this, o);
		}
	}, e.prototype._updateOrdinalMeta = function() {
		for (var e = this._store, t = this.dimensions, n = 0; n < t.length; n++) {
			var r = this._dimInfos[t[n]];
			r.ordinalMeta && e.collectOrdinalMeta(r.storeDimIndex, r.ordinalMeta);
		}
	}, e.prototype._shouldMakeIdFromName = function() {
		var e = this._store.getProvider();
		return this._idDimIdx == null && e.getSource().sourceFormat !== "typedArray" && !e.fillStorage;
	}, e.prototype._doInit = function(e, t) {
		if (!(e >= t)) {
			var n = this._store.getProvider();
			this._updateOrdinalMeta();
			var r = this._nameList, i = this._idList;
			if (n.getSource().sourceFormat === "original" && !n.pure) for (var a = [], o = e; o < t; o++) {
				var s = n.getItem(o, a);
				if (!this.hasItemOption && kl(s) && (this.hasItemOption = !0), s) {
					var c = s.name;
					r[o] == null && c != null && (r[o] = zl(c, null));
					var l = s.id;
					i[o] == null && l != null && (i[o] = zl(l, null));
				}
			}
			if (this._shouldMakeIdFromName()) for (var o = e; o < t; o++) hg(this, o);
			lg(this);
		}
	}, e.prototype.getApproximateExtent = function(e, t) {
		return this._approximateExtent[e] || this._store.getDataExtent(this._getStoreDimIndex(e), t);
	}, e.prototype.setApproximateExtent = function(e, t) {
		t = this.getDimension(t), this._approximateExtent[t] = e.slice();
	}, e.prototype.getCalculationInfo = function(e) {
		return this._calculationInfo[e];
	}, e.prototype.setCalculationInfo = function(e, t) {
		ng(e) ? R(this._calculationInfo, e) : this._calculationInfo[e] = t;
	}, e.prototype.getName = function(e) {
		var t = this.getRawIndex(e), n = this._nameList[t];
		return n == null && this._nameDimIdx != null && (n = dg(this, this._nameDimIdx, t)), n ??= "", n;
	}, e.prototype._getCategory = function(e, t) {
		var n = this._store.get(e, t), r = this._store.getOrdinalMeta(e);
		return r ? r.categories[n] : n;
	}, e.prototype.getId = function(e) {
		return ug(this, this.getRawIndex(e));
	}, e.prototype.count = function() {
		return this._store.count();
	}, e.prototype.get = function(e, t) {
		var n = this._store, r = this._dimInfos[e];
		if (r) return n.get(r.storeDimIndex, t);
	}, e.prototype.getByRawIndex = function(e, t) {
		var n = this._store, r = this._dimInfos[e];
		if (r) return n.getByRawIndex(r.storeDimIndex, t);
	}, e.prototype.getIndices = function() {
		return this._store.getIndices();
	}, e.prototype.getDataExtent = function(e) {
		return this._store.getDataExtent(this._getStoreDimIndex(e), null);
	}, e.prototype.getSum = function(e) {
		return this._store.getSum(this._getStoreDimIndex(e));
	}, e.prototype.getMedian = function(e) {
		return this._store.getMedian(this._getStoreDimIndex(e));
	}, e.prototype.getValues = function(e, t) {
		var n = this, r = this._store;
		return H(e) ? r.getValues(rg(e, function(e) {
			return n._getStoreDimIndex(e);
		}), t) : r.getValues(e);
	}, e.prototype.hasValue = function(e) {
		for (var t = this._dimSummary.dataDimIndicesOnCoord, n = 0, r = t.length; n < r; n++) if (isNaN(this._store.get(t[n], e))) return !1;
		return !0;
	}, e.prototype.indexOfName = function(e) {
		for (var t = 0, n = this._store.count(); t < n; t++) if (this.getName(t) === e) return t;
		return -1;
	}, e.prototype.getRawIndex = function(e) {
		return this._store.getRawIndex(e);
	}, e.prototype.indexOfRawIndex = function(e) {
		return this._store.indexOfRawIndex(e);
	}, e.prototype.rawIndexOf = function(e, t) {
		var n = e && this._invertedIndicesMap[e];
		if (process.env.NODE_ENV !== "production" && !n) throw Error("Do not supported yet");
		var r = n && n[t];
		return r == null || isNaN(r) ? og : r;
	}, e.prototype.each = function(e, t, n) {
		U(e) && (n = t, t = e, e = []);
		var r = n || this, i = rg(fg(e), this._getStoreDimIndex, this);
		this._store.each(i, r ? zt(t, r) : t);
	}, e.prototype.filterSelf = function(e, t, n) {
		U(e) && (n = t, t = e, e = []);
		var r = n || this, i = rg(fg(e), this._getStoreDimIndex, this);
		return this._store = this._store.filter(i, r ? zt(t, r) : t), this;
	}, e.prototype.selectRange = function(e) {
		var t = this, n = {}, r = V(e), i = [];
		return z(r, function(r) {
			var a = t._getStoreDimIndex(r);
			n[a] = e[r], i.push(a);
		}), this._store = this._store.selectRange(n), this;
	}, e.prototype.mapArray = function(e, t, n) {
		U(e) && (n = t, t = e, e = []), n ||= this;
		var r = [];
		return this.each(e, function() {
			r.push(t && t.apply(this, arguments));
		}, n), r;
	}, e.prototype.map = function(e, t, n, r) {
		var i = n || r || this, a = rg(fg(e), this._getStoreDimIndex, this), o = mg(this);
		return o._store = this._store.map(a, i ? zt(t, i) : t), o;
	}, e.prototype.modify = function(e, t, n, r) {
		var i = this, a = n || r || this;
		process.env.NODE_ENV !== "production" && z(fg(e), function(e) {
			i.getDimensionInfo(e).isCalculationCoord || console.error("Danger: only stack dimension can be modified");
		});
		var o = rg(fg(e), this._getStoreDimIndex, this);
		this._store.modify(o, a ? zt(t, a) : t);
	}, e.prototype.downSample = function(e, t, n, r) {
		var i = mg(this);
		return i._store = this._store.downSample(this._getStoreDimIndex(e), t, n, r), i;
	}, e.prototype.minmaxDownSample = function(e, t) {
		var n = mg(this);
		return n._store = this._store.minmaxDownSample(this._getStoreDimIndex(e), t), n;
	}, e.prototype.lttbDownSample = function(e, t) {
		var n = mg(this);
		return n._store = this._store.lttbDownSample(this._getStoreDimIndex(e), t), n;
	}, e.prototype.getRawDataItem = function(e) {
		return this._store.getRawDataItem(e);
	}, e.prototype.getItemModel = function(e) {
		var t = this.hostModel;
		return new zm(this.getRawDataItem(e), t, t && t.ecModel);
	}, e.prototype.diff = function(e) {
		var t = this;
		return new Hm(e ? e.getStore().getIndices() : [], this.getStore().getIndices(), function(t) {
			return ug(e, t);
		}, function(e) {
			return ug(t, e);
		});
	}, e.prototype.getVisual = function(e) {
		var t = this._visual;
		return t && t[e];
	}, e.prototype.setVisual = function(e, t) {
		this._visual = this._visual || {}, ng(e) ? R(this._visual, e) : this._visual[e] = t;
	}, e.prototype.getItemVisual = function(e, t) {
		var n = this._itemVisuals[e];
		return (n && n[t]) ?? this.getVisual(t);
	}, e.prototype.hasItemVisual = function() {
		return this._itemVisuals.length > 0;
	}, e.prototype.ensureUniqueItemVisual = function(e, t) {
		var n = this._itemVisuals, r = n[e];
		r ||= n[e] = {};
		var i = r[t];
		return i ?? (i = this.getVisual(t), H(i) ? i = i.slice() : ng(i) && (i = R({}, i)), r[t] = i), i;
	}, e.prototype.setItemVisual = function(e, t, n) {
		var r = this._itemVisuals[e] || {};
		this._itemVisuals[e] = r, ng(t) ? R(r, t) : r[t] = n;
	}, e.prototype.clearAllVisual = function() {
		this._visual = {}, this._itemVisuals = [];
	}, e.prototype.setLayout = function(e, t) {
		ng(e) ? R(this._layout, e) : this._layout[e] = t;
	}, e.prototype.getLayout = function(e) {
		return this._layout[e];
	}, e.prototype.getItemLayout = function(e) {
		return this._itemLayouts[e];
	}, e.prototype.setItemLayout = function(e, t, n) {
		this._itemLayouts[e] = n ? R(this._itemLayouts[e] || {}, t) : t;
	}, e.prototype.clearItemLayouts = function() {
		this._itemLayouts.length = 0;
	}, e.prototype.setItemGraphicEl = function(e, t) {
		xu(this.hostModel && this.hostModel.seriesIndex, this.dataType, e, t), this._graphicEls[e] = t;
	}, e.prototype.getItemGraphicEl = function(e) {
		return this._graphicEls[e];
	}, e.prototype.eachItemGraphicEl = function(e, t) {
		z(this._graphicEls, function(n, r) {
			n && e && e.call(t, n, r);
		});
	}, e.prototype.cloneShallow = function(t) {
		return t ||= new e(this._schema ? this._schema : rg(this.dimensions, this._getDimInfo, this), this.hostModel), pg(t, this), t._store = this._store, t;
	}, e.prototype.wrapMethod = function(e, t) {
		var n = this[e];
		U(n) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(e), this[e] = function() {
			var e = n.apply(this, arguments);
			return t.apply(this, [e].concat(Zt(arguments)));
		});
	}, e.internalField = function() {
		lg = function(e) {
			var t = e._invertedIndicesMap;
			z(t, function(n, r) {
				var i = e._dimInfos[r], a = i.ordinalMeta, o = e._store;
				if (a) {
					n = t[r] = new ig(a.categories.length);
					for (var s = 0; s < n.length; s++) n[s] = og;
					for (var s = 0; s < o.count(); s++) n[o.get(i.storeDimIndex, s)] = s;
				}
			});
		}, dg = function(e, t, n) {
			return zl(e._getCategory(t, n), null);
		}, ug = function(e, t) {
			var n = e._idList[t];
			return n == null && e._idDimIdx != null && (n = dg(e, e._idDimIdx, t)), n ??= ag + t, n;
		}, fg = function(e) {
			return H(e) || (e = e == null ? [] : [e]), e;
		}, mg = function(t) {
			var n = new e(t._schema ? t._schema : rg(t.dimensions, t._getDimInfo, t), t.hostModel);
			return pg(n, t), n;
		}, pg = function(e, t) {
			z(sg.concat(t.__wrappedMethods || []), function(n) {
				t.hasOwnProperty(n) && (e[n] = t[n]);
			}), e.__wrappedMethods = t.__wrappedMethods, z(cg, function(n) {
				e[n] = L(t[n]);
			}), e._calculationInfo = R({}, t._calculationInfo);
		}, hg = function(e, t) {
			var n = e._nameList, r = e._idList, i = e._nameDimIdx, a = e._idDimIdx, o = n[t], s = r[t];
			if (o == null && i != null && (n[t] = o = dg(e, i, t)), s == null && a != null && (r[t] = s = dg(e, a, t)), s == null && o != null) {
				var c = e._nameRepeatCount, l = c[o] = (c[o] || 0) + 1;
				s = o, l > 1 && (s += "__ec__" + l), r[t] = s;
			}
		};
	}(), e;
}();
//#endregion
//#region node_modules/echarts/lib/data/helper/createDimensions.js
function _g(e, t) {
	Qm(e) || (e = eh(e)), t ||= {};
	var n = t.coordDimensions || [], r = t.dimensionsDefine || e.dimensionsDefine || [], i = J(), a = [], o = vg(e, n, r, t.dimensionsCount), s = t.canOmitUnusedDimensions && tg(o), c = r === e.dimensionsDefine, l = c ? eg(e) : $h(r), u = t.encodeDefine;
	!u && t.encodeDefaulter && (u = t.encodeDefaulter(e, o));
	for (var d = J(u), f = new Vh(o), p = 0; p < f.length; p++) f[p] = -1;
	function m(e) {
		var t = f[e];
		if (t < 0) {
			var n = r[e], i = G(n) ? n : { name: n }, o = new Nh(), s = i.name;
			return s != null && l.get(s) != null && (o.name = o.displayName = s), i.type != null && (o.type = i.type), i.displayName != null && (o.displayName = i.displayName), f[e] = a.length, o.storeDimIndex = e, a.push(o), o;
		}
		return a[t];
	}
	if (!s) for (var p = 0; p < o; p++) m(p);
	d.each(function(e, t) {
		var n = Tl(e).slice();
		if (n.length === 1 && !W(n[0]) && n[0] < 0) {
			d.set(t, !1);
			return;
		}
		var r = d.set(t, []);
		z(n, function(e, n) {
			var i = W(e) ? l.get(e) : e;
			i != null && i < o && (r[n] = i, g(m(i), t, n));
		});
	});
	var h = 0;
	z(n, function(e) {
		var t, n, r, i;
		if (W(e)) t = e, i = {};
		else {
			i = e, t = i.name;
			var a = i.ordinalMeta;
			i.ordinalMeta = null, i = R({}, i), i.ordinalMeta = a, n = i.dimsDef, r = i.otherDims, i.name = i.coordDim = i.coordDimIndex = i.dimsDef = i.otherDims = null;
		}
		var s = d.get(t);
		if (s !== !1) {
			if (s = Tl(s), !s.length) for (var l = 0; l < (n && n.length || 1); l++) {
				for (; h < o && m(h).coordDim != null;) h++;
				h < o && s.push(h++);
			}
			z(s, function(e, a) {
				var o = m(e);
				if (c && i.type != null && (o.type = i.type), g(At(o, i), t, a), o.name == null && n) {
					var s = n[a];
					!G(s) && (s = { name: s }), o.name = o.displayName = s.name, o.defaultTooltip = s.defaultTooltip;
				}
				r && At(o.otherDims, r);
			});
		}
	});
	function g(e, t, n) {
		Su.get(t) == null ? (e.coordDim = t, e.coordDimIndex = n, i.set(t, !0)) : e.otherDims[t] = n;
	}
	var _ = t.generateCoord, v = t.generateCoordCount, y = v != null;
	v = _ ? v || 1 : 0;
	var b = _ || "value";
	function x(e) {
		e.name ??= e.coordDim;
	}
	if (s) z(a, function(e) {
		x(e);
	}), a.sort(function(e, t) {
		return e.storeDimIndex - t.storeDimIndex;
	});
	else for (var S = 0; S < o; S++) {
		var C = m(S);
		C.coordDim ?? (C.coordDim = yg(b, i, y), C.coordDimIndex = 0, (!_ || v <= 0) && (C.isExtraCoord = !0), v--), x(C), C.type == null && (Ym(e, S) === Um.Must || C.isExtraCoord && (C.otherDims.itemName != null || C.otherDims.seriesName != null)) && (C.type = "ordinal");
	}
	return mu(a, function(e) {
		return e.name;
	}, function(e, t) {
		t > 0 && (e.name += t - 1);
	}), new Zh({
		source: e,
		dimensions: a,
		fullDimensionCount: o,
		dimensionOmitted: s
	});
}
function vg(e, t, n, r) {
	var i = Math.max(e.dimensionsDetectedCount || 1, t.length, n.length, r || 0);
	return z(t, function(e) {
		var t;
		G(e) && (t = e.dimsDef) && (i = Math.max(i, t.length));
	}), i;
}
function yg(e, t, n) {
	if (n || t.hasKey(e)) {
		for (var r = 0; t.hasKey(e + r);) r++;
		e += r;
	}
	return t.set(e, !0), e;
}
//#endregion
//#region node_modules/echarts/lib/core/CoordinateSystem.js
var bg = {}, xg = {}, Sg = function() {
	function e() {
		this._normalMasterList = [], this._nonSeriesBoxMasterList = [];
	}
	return e.prototype.create = function(e, t) {
		this._nonSeriesBoxMasterList = n(bg, !0), this._normalMasterList = n(xg, !1);
		function n(n, r) {
			var i = [];
			return z(n, function(n, a) {
				var o = n.create(e, t);
				i = i.concat(o || []), process.env.NODE_ENV !== "production" && r && z(o, function(e) {
					return q(!e.update);
				});
			}), i;
		}
	}, e.prototype.update = function(e, t) {
		z(this._normalMasterList, function(n) {
			n.update && n.update(e, t);
		});
	}, e.prototype.getCoordinateSystems = function() {
		return this._normalMasterList.concat(this._nonSeriesBoxMasterList);
	}, e.register = function(e, t) {
		if (e === "matrix" || e === "calendar") {
			bg[e] = t;
			return;
		}
		xg[e] = t;
	}, e.get = function(e) {
		return xg[e] || bg[e];
	}, e;
}();
function Cg(e) {
	return !!bg[e];
}
var wg = J();
function Tg(e) {
	var t = e.getShallow("coord", !0), n = 1;
	if (t == null) {
		var r = wg.get(e.type);
		r && r.getCoord2 && (n = 2, t = r.getCoord2(e));
	}
	return {
		coord: t,
		from: n
	};
}
function Eg(e, t) {
	var n = e.getShallow("coordinateSystem"), r = e.getShallow("coordinateSystemUsage", !0), i = r != null, a = 0;
	if (n) {
		var o = e.mainType === "series";
		r ??= o ? "data" : "box", r === "data" ? (a = 1, o || (process.env.NODE_ENV !== "production" && i && t && vl("coordinateSystemUsage \"data\" is not supported in non-series components."), a = 0)) : r === "box" && (a = 2, !o && !Cg(n) && (process.env.NODE_ENV !== "production" && i && t && vl("coordinateSystem \"" + n + "\" cannot be used" + (" as coordinateSystemUsage \"box\" for \"" + e.type + "\" yet.")), a = 0));
	}
	return {
		coordSysType: n,
		kind: a
	};
}
function Dg(e) {
	var t = e.targetModel, n = e.coordSysType, r = e.coordSysProvider, i = e.isDefaultDataCoordSys, a = e.allowNotFound;
	process.env.NODE_ENV !== "production" && q(!!n);
	var o = Eg(t, !0), s = o.kind, c = o.coordSysType;
	if (i && s !== 1 && (s = 1, c = n), s === 0 || c !== n) return 0;
	var l = r(n, t);
	return l ? (s === 1 ? (process.env.NODE_ENV !== "production" && q(t.mainType === "series"), t.coordinateSystem = l) : t.boxCoordinateSystem = l, s) : (process.env.NODE_ENV !== "production" && (a || vl(n + " cannot be found for" + (" " + t.type + " (index: " + t.componentIndex + ")."))), 0);
}
//#endregion
//#region node_modules/echarts/lib/model/referHelper.js
var Og = function() {
	function e(e) {
		this.coordSysDims = [], this.axisMap = J(), this.categoryAxisMap = J(), this.coordSysName = e;
	}
	return e;
}();
function kg(e) {
	var t = e.get("coordinateSystem"), n = new Og(t), r = Ag[t];
	if (r) return r(e, n, n.axisMap, n.categoryAxisMap), n;
}
var Ag = {
	cartesian2d: function(e, t, n, r) {
		var i = e.getReferringComponents("xAxis", Zl).models[0], a = e.getReferringComponents("yAxis", Zl).models[0];
		if (process.env.NODE_ENV !== "production") {
			if (!i) throw Error("xAxis \"" + Yt(e.get("xAxisIndex"), e.get("xAxisId"), 0) + "\" not found");
			if (!a) throw Error("yAxis \"" + Yt(e.get("xAxisIndex"), e.get("yAxisId"), 0) + "\" not found");
		}
		t.coordSysDims = ["x", "y"], n.set("x", i), n.set("y", a), jg(i) && (r.set("x", i), t.firstCategoryDimIndex = 0), jg(a) && (r.set("y", a), t.firstCategoryDimIndex ??= 1);
	},
	singleAxis: function(e, t, n, r) {
		var i = e.getReferringComponents("singleAxis", Zl).models[0];
		if (process.env.NODE_ENV !== "production" && !i) throw Error("singleAxis should be specified.");
		t.coordSysDims = ["single"], n.set("single", i), jg(i) && (r.set("single", i), t.firstCategoryDimIndex = 0);
	},
	polar: function(e, t, n, r) {
		var i = e.getReferringComponents("polar", Zl).models[0], a = i.findAxisModel("radiusAxis"), o = i.findAxisModel("angleAxis");
		if (process.env.NODE_ENV !== "production") {
			if (!o) throw Error("angleAxis option not found");
			if (!a) throw Error("radiusAxis option not found");
		}
		t.coordSysDims = ["radius", "angle"], n.set("radius", a), n.set("angle", o), jg(a) && (r.set("radius", a), t.firstCategoryDimIndex = 0), jg(o) && (r.set("angle", o), t.firstCategoryDimIndex ??= 1);
	},
	geo: function(e, t, n, r) {
		t.coordSysDims = ["lng", "lat"];
	},
	parallel: function(e, t, n, r) {
		var i = e.ecModel, a = i.getComponent("parallel", e.get("parallelIndex")), o = t.coordSysDims = a.dimensions.slice();
		z(a.parallelAxisIndex, function(e, a) {
			var s = i.getComponent("parallelAxis", e), c = o[a];
			n.set(c, s), jg(s) && (r.set(c, s), t.firstCategoryDimIndex ??= a);
		});
	},
	matrix: function(e, t, n, r) {
		var i = e.getReferringComponents("matrix", Zl).models[0];
		if (process.env.NODE_ENV !== "production" && !i) throw Error("matrix coordinate system should be specified.");
		t.coordSysDims = ["x", "y"];
		var a = i.getDimensionModel("x"), o = i.getDimensionModel("y");
		n.set("x", a), n.set("y", o), r.set("x", a), r.set("y", o);
	}
};
function jg(e) {
	return e.get("type") === "category";
}
//#endregion
//#region node_modules/echarts/lib/data/helper/dataStackHelper.js
function Mg(e, t, n) {
	n ||= {};
	var r = n.byIndex, i = n.stackedCoordDimension, a, o, s;
	Ng(t) ? a = t : (o = t.schema, a = o.dimensions, s = t.store);
	var c = !!(e && e.get("stack")), l, u, d, f, p = !0;
	function m(e) {
		return e.type !== "ordinal" && e.type !== "time";
	}
	if (z(a, function(e, t) {
		W(e) && (a[t] = e = { name: e }), m(e) || (p = !1);
	}), z(a, function(e, t) {
		c && !e.isExtraCoord && (!r && !l && e.ordinalMeta && (l = e), !u && m(e) && (!p || e.coordDim !== "x" && e.coordDim !== "angle") && (!i || i === e.coordDim) && (u = e));
	}), u && !r && !l && (r = !0), u) {
		d = "__\0ecstackresult_" + e.id, f = "__\0ecstackedover_" + e.id, l && (l.createInvertedIndices = !0);
		var h = u.coordDim, g = u.type, _ = 0;
		z(a, function(e) {
			e.coordDim === h && _++;
		});
		var v = {
			name: d,
			coordDim: h,
			coordDimIndex: _,
			type: g,
			isExtraCoord: !0,
			isCalculationCoord: !0,
			storeDimIndex: a.length
		}, y = {
			name: f,
			coordDim: f,
			coordDimIndex: _ + 1,
			type: g,
			isExtraCoord: !0,
			isCalculationCoord: !0,
			storeDimIndex: a.length + 1
		};
		o ? (s && (v.storeDimIndex = s.ensureCalculationDimension(f, g), y.storeDimIndex = s.ensureCalculationDimension(d, g)), o.appendCalculationDimension(v), o.appendCalculationDimension(y)) : (a.push(v), a.push(y));
	}
	return {
		stackedDimension: u && u.name,
		stackedByDimension: l && l.name,
		isStackedByIndex: r,
		stackedOverDimension: f,
		stackResultDimension: d
	};
}
function Ng(e) {
	return !Qh(e.schema);
}
function Pg(e, t) {
	return !!t && t === e.getCalculationInfo("stackedDimension");
}
function Fg(e, t) {
	return Pg(e, t) ? e.getCalculationInfo("stackResultDimension") : t;
}
//#endregion
//#region node_modules/echarts/lib/chart/helper/createSeriesData.js
function Ig(e, t) {
	var n = e.get("coordinateSystem"), r = Sg.get(n), i;
	return t && t.coordSysDims && (i = B(t.coordSysDims, function(e) {
		var n = { name: e }, r = t.axisMap.get(e);
		return r && (n.type = jh(r.get("type"))), n;
	})), i ||= r && (r.getDimensionsInfo ? r.getDimensionsInfo() : r.dimensions.slice()) || ["x", "y"], i;
}
function Lg(e, t, n) {
	var r, i;
	return n && z(e, function(e, a) {
		var o = e.coordDim, s = n.categoryAxisMap.get(o);
		s && (r ??= a, e.ordinalMeta = s.getOrdinalMeta(), t && (e.createInvertedIndices = !0)), e.otherDims.itemName != null && (i = !0);
	}), !i && r != null && (e[r].otherDims.itemName = 0), r;
}
function Rg(e, t, n) {
	n ||= {};
	var r = t.getSourceManager(), i, a = !1;
	e ? (a = !0, i = eh(e)) : (i = r.getSource(), a = i.sourceFormat === Cu);
	var o = kg(t), s = Ig(t, o), c = n.useEncodeDefaulter, l = U(c) ? c : c ? Bt(Km, s, t) : null, u = {
		coordDimensions: s,
		generateCoord: n.generateCoord,
		encodeDefine: t.getEncode(),
		encodeDefaulter: l,
		canOmitUnusedDimensions: !a
	}, d = _g(i, u), f = Lg(d.dimensions, n.createInvertedIndices, o), p = a ? null : r.getSharedDataStore(d), m = Mg(t, {
		schema: d,
		store: p
	}), h = new gg(d, t);
	h.setCalculationInfo(m);
	var g = f != null && zg(i) ? function(e, t, n, r) {
		return r === f ? n : this.defaultDimValueGetter(e, t, n, r);
	} : null;
	return h.hasItemOption = !1, h.initData(a ? i : p, null, g), h;
}
function zg(e) {
	if (e.sourceFormat === "original") return !H(Ol(Bg(e.data || [])));
}
function Bg(e) {
	for (var t = 0; t < e.length && e[t] == null;) t++;
	return e[t];
}
//#endregion
//#region node_modules/echarts/lib/util/component.js
var Vg = Math.round(Math.random() * 10);
function Hg(e) {
	return [e || "", Vg++].join("_");
}
function Ug(e) {
	var t = {};
	e.registerSubTypeDefaulter = function(e, n) {
		var r = vn(e);
		t[r.main] = n;
	}, e.determineSubType = function(n, r) {
		var i = r.type;
		if (!i) {
			var a = vn(n).main;
			e.hasSubTypes(n) && t[a] && (i = t[a](r));
		}
		return i;
	};
}
function Wg(e, t) {
	e.topologicalTravel = function(e, t, r, i) {
		if (!e.length) return;
		var a = n(t), o = a.graph, s = a.noEntryList, c = {};
		for (z(e, function(e) {
			c[e] = !0;
		}); s.length;) {
			var l = s.pop(), u = o[l], d = !!c[l];
			d && (r.call(i, l, u.originalDeps.slice()), delete c[l]), z(u.successor, d ? p : f);
		}
		z(c, function() {
			var n = "";
			throw process.env.NODE_ENV !== "production" && (n = xl("Circular dependency may exists: ", c, e, t)), Error(n);
		});
		function f(e) {
			o[e].entryCount--, o[e].entryCount === 0 && s.push(e);
		}
		function p(e) {
			c[e] = !0, f(e);
		}
	};
	function n(e) {
		var n = {}, a = [];
		return z(e, function(o) {
			var s = r(n, o), c = i(s.originalDeps = t(o), e);
			s.entryCount = c.length, s.entryCount === 0 && a.push(o), z(c, function(e) {
				jt(s.predecessor, e) < 0 && s.predecessor.push(e);
				var t = r(n, e);
				jt(t.successor, e) < 0 && t.successor.push(o);
			});
		}), {
			graph: n,
			noEntryList: a
		};
	}
	function r(e, t) {
		return e[t] || (e[t] = {
			predecessor: [],
			successor: []
		}), e[t];
	}
	function i(e, t) {
		var n = [];
		return z(e, function(e) {
			jt(t, e) >= 0 && n.push(e);
		}), n;
	}
}
function Gg(e, t) {
	return Ot(Ot({}, e, !0), t, !0);
}
//#endregion
//#region node_modules/zrender/lib/core/fourPointsTransform.js
var Kg = Math.log(2);
function qg(e, t, n, r, i, a) {
	var o = r + "-" + i, s = e.length;
	if (a.hasOwnProperty(o)) return a[o];
	if (t === 1) {
		var c = Math.round(Math.log((1 << s) - 1 & ~i) / Kg);
		return e[n][c];
	}
	for (var l = r | 1 << n, u = n + 1; r & 1 << u;) u++;
	for (var d = 0, f = 0, p = 0; f < s; f++) {
		var m = 1 << f;
		m & i || (d += (p % 2 ? -1 : 1) * e[n][f] * qg(e, t - 1, u, l, i | m, a), p++);
	}
	return a[o] = d, d;
}
function Jg(e, t) {
	var n = [
		[
			e[0],
			e[1],
			1,
			0,
			0,
			0,
			-t[0] * e[0],
			-t[0] * e[1]
		],
		[
			0,
			0,
			0,
			e[0],
			e[1],
			1,
			-t[1] * e[0],
			-t[1] * e[1]
		],
		[
			e[2],
			e[3],
			1,
			0,
			0,
			0,
			-t[2] * e[2],
			-t[2] * e[3]
		],
		[
			0,
			0,
			0,
			e[2],
			e[3],
			1,
			-t[3] * e[2],
			-t[3] * e[3]
		],
		[
			e[4],
			e[5],
			1,
			0,
			0,
			0,
			-t[4] * e[4],
			-t[4] * e[5]
		],
		[
			0,
			0,
			0,
			e[4],
			e[5],
			1,
			-t[5] * e[4],
			-t[5] * e[5]
		],
		[
			e[6],
			e[7],
			1,
			0,
			0,
			0,
			-t[6] * e[6],
			-t[6] * e[7]
		],
		[
			0,
			0,
			0,
			e[6],
			e[7],
			1,
			-t[7] * e[6],
			-t[7] * e[7]
		]
	], r = {}, i = qg(n, 8, 0, 0, 0, r);
	if (i !== 0) {
		for (var a = [], o = 0; o < 8; o++) for (var s = 0; s < 8; s++) a[s] ?? (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * qg(n, 7, +(o === 0), 1 << o, 1 << s, r) / i * t[o];
		return function(e, t, n) {
			var r = t * a[6] + n * a[7] + 1;
			e[0] = (t * a[0] + n * a[1] + a[2]) / r, e[1] = (t * a[3] + n * a[4] + a[5]) / r;
		};
	}
}
//#endregion
//#region node_modules/zrender/lib/core/dom.js
var Yg = "___zrEVENTSAVED", Xg = [];
function Zg(e, t, n, r, i) {
	return $g(Xg, t, r, i, !0) && $g(e, n, Xg[0], Xg[1]);
}
function Qg(e, t) {
	e && n(e), t && n(t);
	function n(e) {
		var t = e[Yg];
		t && (t.clearMarkers && t.clearMarkers(), delete e[Yg]);
	}
}
function $g(e, t, n, r, i) {
	if (t.getBoundingClientRect && Y.domSupported && !n_(t)) {
		var a = t[Yg] || (t[Yg] = {}), o = t_(e_(t, a), a, i);
		if (o) return o(e, n, r), !0;
	}
	return !1;
}
function e_(e, t) {
	var n = t.markers;
	if (n) return n;
	n = t.markers = [];
	for (var r = ["left", "right"], i = ["top", "bottom"], a = 0; a < 4; a++) {
		var o = document.createElement("div"), s = o.style, c = a % 2, l = (a >> 1) % 2;
		s.cssText = [
			"position: absolute",
			"visibility: hidden",
			"padding: 0",
			"margin: 0",
			"border-width: 0",
			"user-select: none",
			"width:0",
			"height:0",
			r[c] + ":0",
			i[l] + ":0",
			r[1 - c] + ":auto",
			i[1 - l] + ":auto",
			""
		].join("!important;"), e.appendChild(o), n.push(o);
	}
	return t.clearMarkers = function() {
		z(n, function(e) {
			e.parentNode && e.parentNode.removeChild(e);
		});
	}, n;
}
function t_(e, t, n) {
	for (var r = n ? "invTrans" : "trans", i = t[r], a = t.srcCoords, o = [], s = [], c = !0, l = 0; l < 4; l++) {
		var u = e[l].getBoundingClientRect(), d = 2 * l, f = u.left, p = u.top;
		o.push(f, p), c = c && a && f === a[d] && p === a[d + 1], s.push(e[l].offsetLeft, e[l].offsetTop);
	}
	return c && i ? i : (t.srcCoords = o, t[r] = n ? Jg(s, o) : Jg(o, s));
}
function n_(e) {
	return e.nodeName.toUpperCase() === "CANVAS";
}
var r_ = /([&<>"'])/g, i_ = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
};
function a_(e) {
	return e == null ? "" : (e + "").replace(r_, function(e, t) {
		return i_[t];
	});
}
//#endregion
//#region node_modules/echarts/lib/i18n/langEN.js
var o_ = {
	time: {
		month: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		],
		monthAbbr: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		],
		dayOfWeek: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		],
		dayOfWeekAbbr: [
			"Sun",
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat"
		]
	},
	legend: { selector: {
		all: "All",
		inverse: "Inv"
	} },
	toolbox: {
		brush: { title: {
			rect: "Box Select",
			polygon: "Lasso Select",
			lineX: "Horizontally Select",
			lineY: "Vertically Select",
			keep: "Keep Selections",
			clear: "Clear Selections"
		} },
		dataView: {
			title: "Data View",
			lang: [
				"Data View",
				"Close",
				"Refresh"
			]
		},
		dataZoom: { title: {
			zoom: "Zoom",
			back: "Zoom Reset"
		} },
		magicType: { title: {
			line: "Switch to Line Chart",
			bar: "Switch to Bar Chart",
			stack: "Stack",
			tiled: "Tile"
		} },
		restore: { title: "Restore" },
		saveAsImage: {
			title: "Save as Image",
			lang: ["Right Click to Save Image"]
		}
	},
	series: { typeNames: {
		pie: "Pie chart",
		bar: "Bar chart",
		line: "Line chart",
		scatter: "Scatter plot",
		effectScatter: "Ripple scatter plot",
		radar: "Radar chart",
		tree: "Tree",
		treemap: "Treemap",
		boxplot: "Boxplot",
		candlestick: "Candlestick",
		k: "K line chart",
		heatmap: "Heat map",
		map: "Map",
		parallel: "Parallel coordinate map",
		lines: "Line graph",
		graph: "Relationship graph",
		sankey: "Sankey diagram",
		funnel: "Funnel chart",
		gauge: "Gauge",
		pictorialBar: "Pictorial bar",
		themeRiver: "Theme River Map",
		sunburst: "Sunburst",
		custom: "Custom chart",
		chart: "Chart"
	} },
	aria: {
		general: {
			withTitle: "This is a chart about \"{title}\"",
			withoutTitle: "This is a chart"
		},
		series: {
			single: {
				prefix: "",
				withName: " with type {seriesType} named {seriesName}.",
				withoutName: " with type {seriesType}."
			},
			multiple: {
				prefix: ". It consists of {seriesCount} series count.",
				withName: " The {seriesId} series is a {seriesType} representing {seriesName}.",
				withoutName: " The {seriesId} series is a {seriesType}.",
				separator: {
					middle: "",
					end: ""
				}
			}
		},
		data: {
			allData: "The data is as follows: ",
			partialData: "The first {displayCnt} items are: ",
			withName: "the data for {name} is {value}",
			withoutName: "{value}",
			separator: {
				middle: ", ",
				end: ". "
			}
		}
	}
}, s_ = {
	time: {
		month: [
			"一月",
			"二月",
			"三月",
			"四月",
			"五月",
			"六月",
			"七月",
			"八月",
			"九月",
			"十月",
			"十一月",
			"十二月"
		],
		monthAbbr: [
			"1月",
			"2月",
			"3月",
			"4月",
			"5月",
			"6月",
			"7月",
			"8月",
			"9月",
			"10月",
			"11月",
			"12月"
		],
		dayOfWeek: [
			"星期日",
			"星期一",
			"星期二",
			"星期三",
			"星期四",
			"星期五",
			"星期六"
		],
		dayOfWeekAbbr: [
			"日",
			"一",
			"二",
			"三",
			"四",
			"五",
			"六"
		]
	},
	legend: { selector: {
		all: "全选",
		inverse: "反选"
	} },
	toolbox: {
		brush: { title: {
			rect: "矩形选择",
			polygon: "圈选",
			lineX: "横向选择",
			lineY: "纵向选择",
			keep: "保持选择",
			clear: "清除选择"
		} },
		dataView: {
			title: "数据视图",
			lang: [
				"数据视图",
				"关闭",
				"刷新"
			]
		},
		dataZoom: { title: {
			zoom: "区域缩放",
			back: "区域缩放还原"
		} },
		magicType: { title: {
			line: "切换为折线图",
			bar: "切换为柱状图",
			stack: "切换为堆叠",
			tiled: "切换为平铺"
		} },
		restore: { title: "还原" },
		saveAsImage: {
			title: "保存为图片",
			lang: ["右键另存为图片"]
		}
	},
	series: { typeNames: {
		pie: "饼图",
		bar: "柱状图",
		line: "折线图",
		scatter: "散点图",
		effectScatter: "涟漪散点图",
		radar: "雷达图",
		tree: "树图",
		treemap: "矩形树图",
		boxplot: "箱型图",
		candlestick: "K线图",
		k: "K线图",
		heatmap: "热力图",
		map: "地图",
		parallel: "平行坐标图",
		lines: "线图",
		graph: "关系图",
		sankey: "桑基图",
		funnel: "漏斗图",
		gauge: "仪表盘图",
		pictorialBar: "象形柱图",
		themeRiver: "主题河流图",
		sunburst: "旭日图",
		custom: "自定义图表",
		chart: "图表"
	} },
	aria: {
		general: {
			withTitle: "这是一个关于“{title}”的图表。",
			withoutTitle: "这是一个图表，"
		},
		series: {
			single: {
				prefix: "",
				withName: "图表类型是{seriesType}，表示{seriesName}。",
				withoutName: "图表类型是{seriesType}。"
			},
			multiple: {
				prefix: "它由{seriesCount}个图表系列组成。",
				withName: "第{seriesId}个系列是一个表示{seriesName}的{seriesType}，",
				withoutName: "第{seriesId}个系列是一个{seriesType}，",
				separator: {
					middle: "；",
					end: "。"
				}
			}
		},
		data: {
			allData: "其数据是——",
			partialData: "其中，前{displayCnt}项是——",
			withName: "{name}的数据是{value}",
			withoutName: "{value}",
			separator: {
				middle: "，",
				end: ""
			}
		}
	}
}, c_ = "ZH", l_ = "EN", u_ = l_, d_ = {}, f_ = {}, p_ = Y.domSupported ? function() {
	return (document.documentElement.lang || navigator.language || navigator.browserLanguage || u_).toUpperCase().indexOf(c_) > -1 ? c_ : u_;
}() : u_;
function m_(e, t) {
	e = e.toUpperCase(), f_[e] = new zm(t), d_[e] = t;
}
function h_(e) {
	if (W(e)) {
		var t = d_[e.toUpperCase()] || {};
		return e === c_ || e === l_ ? L(t) : Ot(L(t), L(d_[u_]), !1);
	} else return Ot(L(e), L(d_[u_]), !1);
}
function g_(e) {
	return f_[e];
}
function __() {
	return f_[u_];
}
m_(l_, o_), m_(c_, s_);
//#endregion
//#region node_modules/echarts/lib/scale/break.js
var v_ = null;
function y_() {
	return v_;
}
function b_(e, t) {
	var n = y_(), r = t.breakOption, i = t.breakParsed;
	return !i && n && (i = n.parseAxisBreakOption(r, e)), i;
}
function x_(e) {
	var t = e.brk;
	return t ? t.breaks : [];
}
function S_(e) {
	var t = e.brk;
	return t ? t.hasBreaks() : !1;
}
//#endregion
//#region node_modules/echarts/lib/util/time.js
var C_ = 1e3, w_ = C_ * 60, T_ = w_ * 60, E_ = T_ * 24, D_ = E_ * 365, O_ = {
	year: /({yyyy}|{yy})/,
	month: /({MMMM}|{MMM}|{MM}|{M})/,
	day: /({dd}|{d})/,
	hour: /({HH}|{H}|{hh}|{h})/,
	minute: /({mm}|{m})/,
	second: /({ss}|{s})/,
	millisecond: /({SSS}|{S})/
}, k_ = {
	year: "{yyyy}",
	month: "{MMM}",
	day: "{d}",
	hour: "{HH}:{mm}",
	minute: "{HH}:{mm}",
	second: "{HH}:{mm}:{ss}",
	millisecond: "{HH}:{mm}:{ss} {SSS}"
}, A_ = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}", j_ = "{yyyy}-{MM}-{dd}", M_ = {
	year: "{yyyy}",
	month: "{yyyy}-{MM}",
	day: j_,
	hour: j_ + " " + k_.hour,
	minute: j_ + " " + k_.minute,
	second: j_ + " " + k_.second,
	millisecond: A_
}, N_ = [
	"year",
	"month",
	"day",
	"hour",
	"minute",
	"second",
	"millisecond"
], P_ = [
	"year",
	"half-year",
	"quarter",
	"month",
	"week",
	"half-week",
	"day",
	"half-day",
	"quarter-day",
	"hour",
	"minute",
	"second",
	"millisecond"
];
function F_(e) {
	return !W(e) && !U(e) ? I_(e) : e;
}
function I_(e) {
	e ||= {};
	var t = {}, n = !0;
	return z(N_, function(t) {
		n &&= e[t] == null;
	}), z(N_, function(r, i) {
		var a = e[r];
		t[r] = {};
		for (var o = null, s = i; s >= 0; s--) {
			var c = N_[s], l = G(a) && !H(a) ? a[c] : a, u = void 0;
			H(l) ? (u = l.slice(), o = u[0] || "") : W(l) ? (o = l, u = [o]) : (o == null ? o = k_[r] : O_[c].test(o) || (o = t[c][c][0] + " " + o), u = [o], n && (u[1] = "{primary|" + o + "}")), t[r][c] = u;
		}
	}), t;
}
function L_(e, t) {
	return e += "", "0000".substr(0, t - e.length) + e;
}
function R_(e) {
	switch (e) {
		case "half-year":
		case "quarter": return "month";
		case "week":
		case "half-week": return "day";
		case "half-day":
		case "quarter-day": return "hour";
		default: return e;
	}
}
function z_(e) {
	return e === R_(e);
}
function B_(e) {
	switch (e) {
		case "year":
		case "month": return "day";
		case "millisecond": return "millisecond";
		default: return "second";
	}
}
function V_(e, t, n, r) {
	var i = nl(e), a = i[G_(n)](), o = i[K_(n)]() + 1, s = Math.floor((o - 1) / 3) + 1, c = i[q_(n)](), l = i["get" + (n ? "UTC" : "") + "Day"](), u = i[J_(n)](), d = (u - 1) % 12 + 1, f = i[Y_(n)](), p = i[X_(n)](), m = i[Z_(n)](), h = u >= 12 ? "pm" : "am", g = h.toUpperCase(), _ = (r instanceof zm ? r : g_(r || p_) || __()).getModel("time"), v = _.get("month"), y = _.get("monthAbbr"), b = _.get("dayOfWeek"), x = _.get("dayOfWeekAbbr");
	return (t || "").replace(/{a}/g, h + "").replace(/{A}/g, g + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, L_(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, v[o - 1]).replace(/{MMM}/g, y[o - 1]).replace(/{MM}/g, L_(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, L_(c, 2)).replace(/{d}/g, c + "").replace(/{eeee}/g, b[l]).replace(/{ee}/g, x[l]).replace(/{e}/g, l + "").replace(/{HH}/g, L_(u, 2)).replace(/{H}/g, u + "").replace(/{hh}/g, L_(d + "", 2)).replace(/{h}/g, d + "").replace(/{mm}/g, L_(f, 2)).replace(/{m}/g, f + "").replace(/{ss}/g, L_(p, 2)).replace(/{s}/g, p + "").replace(/{SSS}/g, L_(m, 3)).replace(/{S}/g, m + "");
}
function H_(e, t, n, r, i) {
	var a = null;
	if (W(n)) a = n;
	else if (U(n)) {
		var o = {
			time: e.time,
			level: e.time ? e.time.level : 0
		}, s = y_();
		s && s.makeAxisLabelFormatterParamBreak(o, e.break), a = n(e.value, t, o);
	} else {
		var c = e.time;
		if (c) {
			var l = n[c.lowerTimeUnit][c.upperTimeUnit];
			a = l[Math.min(c.level, l.length - 1)] || "";
		} else {
			var u = U_(e.value, i);
			a = n[u][u][0];
		}
	}
	return V_(new Date(e.value), a, i, r);
}
function U_(e, t) {
	var n = nl(e), r = n[K_(t)]() + 1, i = n[q_(t)](), a = n[J_(t)](), o = n[Y_(t)](), s = n[X_(t)](), c = n[Z_(t)]() === 0, l = c && s === 0, u = l && o === 0, d = u && a === 0, f = d && i === 1;
	return f && r === 1 ? "year" : f ? "month" : d ? "day" : u ? "hour" : l ? "minute" : c ? "second" : "millisecond";
}
function W_(e, t, n) {
	switch (t) {
		case "year": e[$_(n)](0);
		case "month": e[ev(n)](1);
		case "day": e[tv(n)](0);
		case "hour": e[nv(n)](0);
		case "minute": e[rv(n)](0);
		case "second": e[iv(n)](0);
	}
	return e;
}
function G_(e) {
	return e ? "getUTCFullYear" : "getFullYear";
}
function K_(e) {
	return e ? "getUTCMonth" : "getMonth";
}
function q_(e) {
	return e ? "getUTCDate" : "getDate";
}
function J_(e) {
	return e ? "getUTCHours" : "getHours";
}
function Y_(e) {
	return e ? "getUTCMinutes" : "getMinutes";
}
function X_(e) {
	return e ? "getUTCSeconds" : "getSeconds";
}
function Z_(e) {
	return e ? "getUTCMilliseconds" : "getMilliseconds";
}
function Q_(e) {
	return e ? "setUTCFullYear" : "setFullYear";
}
function $_(e) {
	return e ? "setUTCMonth" : "setMonth";
}
function ev(e) {
	return e ? "setUTCDate" : "setDate";
}
function tv(e) {
	return e ? "setUTCHours" : "setHours";
}
function nv(e) {
	return e ? "setUTCMinutes" : "setMinutes";
}
function rv(e) {
	return e ? "setUTCSeconds" : "setSeconds";
}
function iv(e) {
	return e ? "setUTCMilliseconds" : "setMilliseconds";
}
//#endregion
//#region node_modules/echarts/lib/util/format.js
function av(e) {
	if (!sl(e)) return W(e) ? e : "-";
	var t = (e + "").split(".");
	return t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : "");
}
function ov(e, t) {
	return e = (e || "").toLowerCase().replace(/-(.)/g, function(e, t) {
		return t.toUpperCase();
	}), t && e && (e = e.charAt(0).toUpperCase() + e.slice(1)), e;
}
var sv = Qt;
function cv(e, t, n) {
	var r = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
	function i(e) {
		return e && $t(e) ? e : "-";
	}
	function a(e) {
		return dl(e);
	}
	var o = t === "time", s = e instanceof Date;
	if (o || s) {
		var c = o ? nl(e) : e;
		if (!isNaN(+c)) return V_(c, r, n);
		if (s) return "-";
	}
	if (t === "ordinal") return Vt(e) ? i(e) : Ht(e) && a(e) ? e + "" : "-";
	var l = ol(e);
	return a(l) ? av(l) : Vt(e) ? i(e) : typeof e == "boolean" ? e + "" : "-";
}
var lv = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g"
], uv = function(e, t) {
	return "{" + e + (t ?? "") + "}";
};
function dv(e, t, n) {
	H(t) || (t = [t]);
	var r = t.length;
	if (!r) return "";
	for (var i = t[0].$vars || [], a = 0; a < i.length; a++) {
		var o = lv[a];
		e = e.replace(uv(o), uv(o, 0));
	}
	for (var s = 0; s < r; s++) for (var c = 0; c < i.length; c++) {
		var l = t[s][i[c]];
		e = e.replace(uv(lv[c], s), n ? a_(l) : l);
	}
	return e;
}
function fv(e, t) {
	var n = W(e) ? {
		color: e,
		extraCssText: t
	} : e || {}, r = n.color, i = n.type;
	t = n.extraCssText;
	var a = n.renderMode || "html";
	return r ? a === "html" ? i === "subItem" ? "<span style=\"display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:" + a_(r) + ";" + (t || "") + "\"></span>" : "<span style=\"display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:" + a_(r) + ";" + (t || "") + "\"></span>" : {
		renderMode: a,
		content: "{" + (n.markerId || "markerX") + "|}  ",
		style: i === "subItem" ? {
			width: 4,
			height: 4,
			borderRadius: 2,
			backgroundColor: r
		} : {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: r
		}
	} : "";
}
function pv(e, t) {
	return t ||= "transparent", W(e) ? e : G(e) && e.colorStops && (e.colorStops[0] || {}).color || t;
}
function mv(e, t) {
	if (t === "_blank" || t === "blank") {
		var n = window.open();
		n.opener = null, n.location.href = e;
	} else window.open(e, t);
}
//#endregion
//#region node_modules/echarts/lib/util/layout.js
var hv = z, gv = [
	"left",
	"right",
	"top",
	"bottom",
	"width",
	"height"
], _v = [[
	"width",
	"left",
	"right"
], [
	"height",
	"top",
	"bottom"
]];
function vv(e, t, n, r, i) {
	var a = 0, o = 0;
	r ??= Infinity, i ??= Infinity;
	var s = 0;
	t.eachChild(function(c, l) {
		var u = c.getBoundingRect(), d = t.childAt(l + 1), f = d && d.getBoundingRect(), p, m;
		if (e === "horizontal") {
			var h = u.width + (f ? -f.x + u.x : 0);
			p = a + h, p > r || c.newline ? (a = 0, p = h, o += s + n, s = u.height) : s = Math.max(s, u.height);
		} else {
			var g = u.height + (f ? -f.y + u.y : 0);
			m = o + g, m > i || c.newline ? (a += s + n, o = 0, m = g, s = u.width) : s = Math.max(s, u.width);
		}
		c.newline || (c.x = a, c.y = o, c.markRedraw(), e === "horizontal" ? a = p + n : o = m + n);
	});
}
Bt(vv, "vertical"), Bt(vv, "horizontal");
function yv(e, t) {
	return {
		left: e.getShallow("left", t),
		top: e.getShallow("top", t),
		right: e.getShallow("right", t),
		bottom: e.getShallow("bottom", t),
		width: e.getShallow("width", t),
		height: e.getShallow("height", t)
	};
}
function bv(e, t, n) {
	n = sv(n || 0);
	var r = t.width, i = t.height, a = Hc(e.left, r), o = Hc(e.top, i), s = Hc(e.right, r), c = Hc(e.bottom, i), l = Hc(e.width, r), u = Hc(e.height, i), d = n[2] + n[0], f = n[1] + n[3], p = e.aspect;
	switch (isNaN(l) && (l = r - s - f - a), isNaN(u) && (u = i - c - d - o), p != null && (isNaN(l) && isNaN(u) && (p > r / i ? l = r * .8 : u = i * .8), isNaN(l) && (l = p * u), isNaN(u) && (u = l / p)), isNaN(a) && (a = r - s - l - f), isNaN(o) && (o = i - c - u - d), e.left || e.right) {
		case "center":
			a = r / 2 - l / 2 - n[3];
			break;
		case "right":
			a = r - l - f;
			break;
	}
	switch (e.top || e.bottom) {
		case "middle":
		case "center":
			o = i / 2 - u / 2 - n[0];
			break;
		case "bottom":
			o = i - u - d;
			break;
	}
	a ||= 0, o ||= 0, isNaN(l) && (l = r - f - a - (s || 0)), isNaN(u) && (u = i - d - o - (c || 0));
	var m = new X((t.x || 0) + a + n[3], (t.y || 0) + o + n[0], l, u);
	return m.margin = n, m;
}
var xv = {
	rect: 1,
	point: 2
};
function Sv(e, t, n) {
	var r, i, a, o = e.boxCoordinateSystem, s;
	if (o) {
		var c = Tg(e), l = c.coord, u = c.from;
		if (o.dataToLayout) {
			a = xv.rect, s = u;
			var d = o.dataToLayout(l);
			r = d.contentRect || d.rect;
		} else n && n.enableLayoutOnlyByCenter && o.dataToPoint ? (a = xv.point, s = u, i = o.dataToPoint(l)) : process.env.NODE_ENV !== "production" && vl(e.type + "[" + e.componentIndex + "]" + (" layout based on " + o.type + " is not supported."));
	}
	return a ??= xv.rect, a === xv.rect && (r ||= {
		x: 0,
		y: 0,
		width: t.getWidth(),
		height: t.getHeight()
	}, i = [r.x + r.width / 2, r.y + r.height / 2]), {
		type: a,
		refContainer: r,
		refPoint: i,
		boxCoordFrom: s
	};
}
function Cv(e) {
	var t = e.layoutMode || e.constructor.layoutMode;
	return G(t) ? t : t ? { type: t } : null;
}
function wv(e, t, n) {
	var r = n && n.ignoreSize;
	!H(r) && (r = [r, r]);
	var i = o(_v[0], 0), a = o(_v[1], 1);
	c(_v[0], e, i), c(_v[1], e, a);
	function o(n, i) {
		var a = {}, o = 0, c = {}, l = 0, u = 2;
		if (hv(n, function(t) {
			c[t] = e[t];
		}), hv(n, function(e) {
			un(t, e) && (a[e] = c[e] = t[e]), s(a, e) && o++, s(c, e) && l++;
		}), r[i]) return s(t, n[1]) ? c[n[2]] = null : s(t, n[2]) && (c[n[1]] = null), c;
		if (l === u || !o) return c;
		if (o >= u) return a;
		for (var d = 0; d < n.length; d++) {
			var f = n[d];
			if (!un(a, f) && un(e, f)) {
				a[f] = e[f];
				break;
			}
		}
		return a;
	}
	function s(e, t) {
		return e[t] != null && e[t] !== "auto";
	}
	function c(e, t, n) {
		hv(e, function(e) {
			t[e] = n[e];
		});
	}
}
function Tv(e) {
	return Ev({}, e);
}
function Ev(e, t) {
	return t && e && hv(gv, function(n) {
		un(t, n) && (e[n] = t[n]);
	}), e;
}
//#endregion
//#region node_modules/echarts/lib/model/Component.js
var Dv = ql(), Ov = function(e) {
	I(t, e);
	function t(t, n, r) {
		var i = e.call(this, t, n, r) || this;
		return i.uid = Hg("ec_cpt_model"), i;
	}
	return t.prototype.init = function(e, t, n) {
		this.mergeDefaultAndTheme(e, n);
	}, t.prototype.mergeDefaultAndTheme = function(e, t) {
		var n = Cv(this), r = n ? Tv(e) : {};
		Ot(e, t.getTheme().get(this.mainType)), Ot(e, this.getDefaultOption()), n && wv(e, r, n);
	}, t.prototype.mergeOption = function(e, t) {
		Ot(this.option, e, !0);
		var n = Cv(this);
		n && wv(this.option, e, n);
	}, t.prototype.optionUpdated = function(e, t) {}, t.prototype.getDefaultOption = function() {
		var e = this.constructor;
		if (!bn(e)) return e.defaultOption;
		var t = Dv(this);
		if (!t.defaultOption) {
			for (var n = [], r = e; r;) {
				var i = r.prototype.defaultOption;
				i && n.push(i), r = r.superClass;
			}
			for (var a = {}, o = n.length - 1; o >= 0; o--) a = Ot(a, n[o], !0);
			t.defaultOption = a;
		}
		return t.defaultOption;
	}, t.prototype.getReferringComponents = function(e, t) {
		var n = e + "Index", r = e + "Id";
		return Ql(this.ecModel, e, {
			index: this.get(n, !0),
			id: this.get(r, !0)
		}, t);
	}, t.prototype.getBoxLayoutParams = function() {
		return yv(this, !1);
	}, t.prototype.getZLevelKey = function() {
		return "";
	}, t.prototype.setZLevel = function(e) {
		this.option.zlevel = e;
	}, t.protoInitialize = function() {
		var e = t.prototype;
		e.type = "component", e.id = "", e.name = "", e.mainType = "", e.subType = "", e.componentIndex = 0;
	}(), t;
}(zm);
Cn(Ov, zm), On(Ov), Ug(Ov), Wg(Ov, kv);
function kv(e) {
	var t = [];
	return z(Ov.getClassesByMainType(e), function(e) {
		t = t.concat(e.dependencies || e.prototype.dependencies || []);
	}), t = B(t, function(e) {
		return vn(e).main;
	}), e !== "dataset" && jt(t, "dataset") <= 0 && t.unshift("dataset"), t;
}
//#endregion
//#region node_modules/echarts/lib/model/mixin/palette.js
var Av = ql(), jv = ql(), Mv = function() {
	function e() {}
	return e.prototype.getColorFromPalette = function(e, t, n) {
		var r = Tl(this.get("color", !0)), i = this.get("colorLayer", !0);
		return Fv(this, Av, r, i, e, t, n);
	}, e.prototype.clearColorPalette = function() {
		Iv(this, Av);
	}, e;
}();
function Nv(e, t, n, r) {
	return Fv(e, jv, Tl(e.get([
		"aria",
		"decal",
		"decals"
	])), null, t, n, r);
}
function Pv(e, t) {
	for (var n = e.length, r = 0; r < n; r++) if (e[r].length > t) return e[r];
	return e[n - 1];
}
function Fv(e, t, n, r, i, a, o) {
	a ||= e;
	var s = t(a), c = s.paletteIdx || 0, l = s.paletteNameMap = s.paletteNameMap || {};
	if (l.hasOwnProperty(i)) return l[i];
	var u = o == null || !r ? n : Pv(r, o);
	if (u ||= n, !(!u || !u.length)) {
		var d = u[c];
		return i && (l[i] = d), s.paletteIdx = (c + 1) % u.length, d;
	}
}
function Iv(e, t) {
	t(e).paletteIdx = 0, t(e).paletteNameMap = {};
}
//#endregion
//#region node_modules/echarts/lib/model/mixin/dataFormat.js
var Lv = /\{@(.+?)\}/g, Rv = function() {
	function e() {}
	return e.prototype.getDataParams = function(e, t) {
		var n = this.getData(t), r = this.getRawValue(e, t), i = n.getRawIndex(e), a = n.getName(e), o = n.getRawDataItem(e), s = n.getItemVisual(e, "style"), c = s && s[n.getItemVisual(e, "drawType") || "fill"], l = s && s.stroke, u = this.mainType, d = u === "series", f = n.userOutput && n.userOutput.get();
		return {
			componentType: u,
			componentSubType: this.subType,
			componentIndex: this.componentIndex,
			seriesType: d ? this.subType : null,
			seriesIndex: this.seriesIndex,
			seriesId: d ? this.id : null,
			seriesName: d ? this.name : null,
			name: a,
			dataIndex: i,
			data: o,
			dataType: t,
			value: r,
			color: c,
			borderColor: l,
			dimensionNames: f ? f.fullDimensions : null,
			encode: f ? f.encode : null,
			$vars: [
				"seriesName",
				"name",
				"value"
			]
		};
	}, e.prototype.getFormattedLabel = function(e, t, n, r, i, a) {
		t ||= "normal";
		var o = this.getData(n), s = this.getDataParams(e, n);
		if (a && (s.value = a.interpolatedValue), r != null && H(s.value) && (s.value = s.value[r]), i ||= o.getItemModel(e).get(t === "normal" ? ["label", "formatter"] : [
			t,
			"label",
			"formatter"
		]), U(i)) return s.status = t, s.dimensionIndex = r, i(s);
		if (W(i)) return dv(i, s).replace(Lv, function(t, n) {
			var r = n.length, i = n;
			i.charAt(0) === "[" && i.charAt(r - 1) === "]" && (i = +i.slice(1, r - 1), process.env.NODE_ENV !== "production" && isNaN(i) && vl("Invalide label formatter: @" + n + ", only support @[0], @[1], @[2], ..."));
			var s = Dh(o, e, i);
			if (a && H(a.interpolatedValue)) {
				var c = o.getDimensionIndex(i);
				c >= 0 && (s = a.interpolatedValue[c]);
			}
			return s == null ? "" : s + "";
		});
	}, e.prototype.getRawValue = function(e, t) {
		return Dh(this.getData(t), e);
	}, e.prototype.formatTooltip = function(e, t, n) {}, e;
}();
function zv(e) {
	var t, n;
	return G(e) ? e.type ? n = e : process.env.NODE_ENV !== "production" && console.warn("The return type of `formatTooltip` is not supported: " + xl(e)) : t = e, {
		text: t,
		frag: n
	};
}
//#endregion
//#region node_modules/echarts/lib/core/task.js
function Bv(e) {
	return new Vv(e);
}
var Vv = function() {
	function e(e) {
		e ||= {}, this._reset = e.reset, this._plan = e.plan, this._count = e.count, this._onDirty = e.onDirty, this._dirty = !0;
	}
	return e.prototype.perform = function(e) {
		var t = this._upstream, n = e && e.skip;
		if (this._dirty && t) {
			var r = this.context;
			r.data = r.outputData = t.context.outputData;
		}
		this.__pipeline && (this.__pipeline.currentTask = this);
		var i;
		this._plan && !n && (i = this._plan(this.context));
		var a = l(this._modBy), o = this._modDataCount || 0, s = l(e && e.modBy), c = e && e.modDataCount || 0;
		(a !== s || o !== c) && (i = "reset");
		function l(e) {
			return !(e >= 1) && (e = 1), e;
		}
		var u;
		(this._dirty || i === "reset") && (this._dirty = !1, u = this._doReset(n)), this._modBy = s, this._modDataCount = c;
		var d = e && e.step;
		if (t ? (process.env.NODE_ENV !== "production" && q(t._outputDueEnd != null), this._dueEnd = t._outputDueEnd) : (process.env.NODE_ENV !== "production" && q(!this._progress || this._count), this._dueEnd = this._count ? this._count(this.context) : Infinity), this._progress) {
			var f = this._dueIndex, p = Math.min(d == null ? Infinity : this._dueIndex + d, this._dueEnd);
			if (!n && (u || f < p)) {
				var m = this._progress;
				if (H(m)) for (var h = 0; h < m.length; h++) this._doProgress(m[h], f, p, s, c);
				else this._doProgress(m, f, p, s, c);
			}
			this._dueIndex = p;
			var g = this._settedOutputEnd == null ? p : this._settedOutputEnd;
			process.env.NODE_ENV !== "production" && q(g >= this._outputDueEnd), this._outputDueEnd = g;
		} else this._dueIndex = this._outputDueEnd = this._settedOutputEnd == null ? this._dueEnd : this._settedOutputEnd;
		return this.unfinished();
	}, e.prototype.dirty = function() {
		this._dirty = !0, this._onDirty && this._onDirty(this.context);
	}, e.prototype._doProgress = function(e, t, n, r, i) {
		Hv.reset(t, n, r, i), this._callingProgress = e, this._callingProgress({
			start: t,
			end: n,
			count: n - t,
			next: Hv.next
		}, this.context);
	}, e.prototype._doReset = function(e) {
		this._dueIndex = this._outputDueEnd = this._dueEnd = 0, this._settedOutputEnd = null;
		var t, n;
		!e && this._reset && (t = this._reset(this.context), t && t.progress && (n = t.forceFirstProgress, t = t.progress), H(t) && !t.length && (t = null)), this._progress = t, this._modBy = this._modDataCount = null;
		var r = this._downstream;
		return r && r.dirty(), n;
	}, e.prototype.unfinished = function() {
		return this._progress && this._dueIndex < this._dueEnd;
	}, e.prototype.pipe = function(e) {
		process.env.NODE_ENV !== "production" && q(e && !e._disposed && e !== this), (this._downstream !== e || this._dirty) && (this._downstream = e, e._upstream = this, e.dirty());
	}, e.prototype.dispose = function() {
		this._disposed ||= (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, !0);
	}, e.prototype.getUpstream = function() {
		return this._upstream;
	}, e.prototype.getDownstream = function() {
		return this._downstream;
	}, e.prototype.setOutputEnd = function(e) {
		this._outputDueEnd = this._settedOutputEnd = e;
	}, e;
}(), Hv = function() {
	var e, t, n, r, i, a = { reset: function(c, l, u, d) {
		t = c, e = l, n = u, r = d, i = Math.ceil(r / n), a.next = n > 1 && r > 0 ? s : o;
	} };
	return a;
	function o() {
		return t < e ? t++ : null;
	}
	function s() {
		var a = t % i * n + Math.ceil(t / i), o = t >= e ? null : a < r ? a : t;
		return t++, o;
	}
}(), Uv = function() {
	function e() {}
	return e.prototype.getRawData = function() {
		throw Error("not supported");
	}, e.prototype.getRawDataItem = function(e) {
		throw Error("not supported");
	}, e.prototype.cloneRawData = function() {}, e.prototype.getDimensionInfo = function(e) {}, e.prototype.cloneAllDimensionInfo = function() {}, e.prototype.count = function() {}, e.prototype.retrieveValue = function(e, t) {}, e.prototype.retrieveValueFromItem = function(e, t) {}, e.prototype.convertValue = function(e, t) {
		return Ph(e, t);
	}, e;
}();
function Wv(e, t) {
	var n = new Uv(), r = e.data, i = n.sourceFormat = e.sourceFormat, a = e.startIndex, o = "";
	e.seriesLayoutBy !== "column" && (process.env.NODE_ENV !== "production" && (o = "`seriesLayoutBy` of upstream dataset can only be \"column\" in data transform."), Sl(o));
	var s = [], c = {}, l = e.dimensionsDefine;
	if (l) z(l, function(e, t) {
		var n = e.name, r = {
			index: t,
			name: n,
			displayName: e.displayName
		};
		if (s.push(r), n != null) {
			var i = "";
			un(c, n) && (process.env.NODE_ENV !== "production" && (i = "dimension name \"" + n + "\" duplicated."), Sl(i)), c[n] = r;
		}
	});
	else for (var u = 0; u < e.dimensionsDetectedCount; u++) s.push({ index: u });
	var d = yh(i, ku);
	t.__isBuiltIn && (n.getRawDataItem = function(e) {
		return d(r, a, s, e);
	}, n.getRawData = zt(Gv, null, e)), n.cloneRawData = zt(Kv, null, e), n.count = zt(Sh(i, ku), null, r, a, s);
	var f = Th(i);
	n.retrieveValue = function(e, t) {
		return p(d(r, a, s, e), t);
	};
	var p = n.retrieveValueFromItem = function(e, t) {
		if (e != null) {
			var n = s[t];
			if (n) return f(e, t, n.name);
		}
	};
	return n.getDimensionInfo = zt(qv, null, s, c), n.cloneAllDimensionInfo = zt(Jv, null, s), n;
}
function Gv(e) {
	var t = e.sourceFormat;
	if (!$v(t)) {
		var n = "";
		process.env.NODE_ENV !== "production" && (n = "`getRawData` is not supported in source format " + t), Sl(n);
	}
	return e.data;
}
function Kv(e) {
	var t = e.sourceFormat, n = e.data;
	if (!$v(t)) {
		var r = "";
		process.env.NODE_ENV !== "production" && (r = "`cloneRawData` is not supported in source format " + t), Sl(r);
	}
	if (t === "arrayRows") {
		for (var i = [], a = 0, o = n.length; a < o; a++) i.push(n[a].slice());
		return i;
	} else if (t === "objectRows") {
		for (var i = [], a = 0, o = n.length; a < o; a++) i.push(R({}, n[a]));
		return i;
	}
}
function qv(e, t, n) {
	if (n != null) {
		if (Ht(n) || !isNaN(n) && !un(t, n)) return e[n];
		if (un(t, n)) return t[n];
	}
}
function Jv(e) {
	return L(e);
}
var Yv = J();
function Xv(e) {
	e = L(e);
	var t = e.type, n = "";
	t || (process.env.NODE_ENV !== "production" && (n = "Must have a `type` when `registerTransform`."), Sl(n));
	var r = t.split(":");
	r.length !== 2 && (process.env.NODE_ENV !== "production" && (n = "Name must include namespace like \"ns:regression\"."), Sl(n));
	var i = !1;
	r[0] === "echarts" && (t = r[1], i = !0), e.__isBuiltIn = i, Yv.set(t, e);
}
function Zv(e, t, n) {
	var r = Tl(e), i = r.length, a = "";
	i || (process.env.NODE_ENV !== "production" && (a = "If `transform` declared, it should at least contain one transform."), Sl(a));
	for (var o = 0, s = i; o < s; o++) {
		var c = r[o];
		t = Qv(c, t, n, i === 1 ? null : o), o !== s - 1 && (t.length = Math.max(t.length, 1));
	}
	return t;
}
function Qv(e, t, n, r) {
	var i = "";
	t.length || (process.env.NODE_ENV !== "production" && (i = "Must have at least one upstream dataset."), Sl(i)), G(e) || (process.env.NODE_ENV !== "production" && (i = "transform declaration must be an object rather than " + typeof e + "."), Sl(i));
	var a = e.type, o = Yv.get(a);
	o || (process.env.NODE_ENV !== "production" && (i = "Can not find transform on type \"" + a + "\"."), Sl(i));
	var s = B(t, function(e) {
		return Wv(e, o);
	}), c = Tl(o.transform({
		upstream: s[0],
		upstreamList: s,
		config: L(e.config)
	}));
	return process.env.NODE_ENV !== "production" && e.print && gl(B(c, function(e) {
		var t = r == null ? "" : " === pipe index: " + r;
		return [
			"=== dataset index: " + n.datasetIndex + t + " ===",
			"- transform result data:",
			xl(e.data),
			"- transform result dimensions:",
			xl(e.dimensions)
		].join("\n");
	}).join("\n")), B(c, function(e, n) {
		var r = "";
		G(e) || (process.env.NODE_ENV !== "production" && (r = "A transform should not return some empty results."), Sl(r)), e.data || (process.env.NODE_ENV !== "production" && (r = "Transform result data should be not be null or undefined"), Sl(r)), $v(nh(e.data)) || (process.env.NODE_ENV !== "production" && (r = "Transform result data should be array rows or object rows."), Sl(r));
		var i, a = t[0];
		if (a && n === 0 && !e.dimensions) {
			var o = a.startIndex;
			o && (e.data = a.data.slice(0, o).concat(e.data)), i = {
				seriesLayoutBy: ku,
				sourceHeader: o,
				dimensions: a.metaRawOption.dimensions
			};
		} else i = {
			seriesLayoutBy: ku,
			sourceHeader: 0,
			dimensions: e.dimensions
		};
		return $m(e.data, i, null);
	});
}
function $v(e) {
	return e === "arrayRows" || e === "objectRows";
}
//#endregion
//#region node_modules/echarts/lib/data/helper/sourceManager.js
var ey = function() {
	function e(e) {
		this._sourceList = [], this._storeList = [], this._upstreamSignList = [], this._versionSignBase = 0, this._dirty = !0, this._sourceHost = e;
	}
	return e.prototype.dirty = function() {
		this._setLocalSource([], []), this._storeList = [], this._dirty = !0;
	}, e.prototype._setLocalSource = function(e, t) {
		this._sourceList = e, this._upstreamSignList = t, this._versionSignBase++, this._versionSignBase > 9e10 && (this._versionSignBase = 0);
	}, e.prototype._getVersionSign = function() {
		return this._sourceHost.uid + "_" + this._versionSignBase;
	}, e.prototype.prepareSource = function() {
		this._isDirty() && (this._createSource(), this._dirty = !1);
	}, e.prototype._createSource = function() {
		this._setLocalSource([], []);
		var e = this._sourceHost, t = this._getUpstreamSourceManagers(), n = !!t.length, r, i;
		if (ty(e)) {
			var a = e, o = void 0, s = void 0, c = void 0;
			if (n) {
				var l = t[0];
				l.prepareSource(), c = l.getSource(), o = c.data, s = c.sourceFormat, i = [l._getVersionSign()];
			} else o = a.get("data", !0), s = Wt(o) ? Du : Cu, i = [];
			var u = this._getSourceMetaRawOption() || {}, d = c && c.metaRawOption || {}, f = K(u.seriesLayoutBy, d.seriesLayoutBy) || null, p = K(u.sourceHeader, d.sourceHeader), m = K(u.dimensions, d.dimensions);
			r = f !== d.seriesLayoutBy || !!p != !!d.sourceHeader || m ? [$m(o, {
				seriesLayoutBy: f,
				sourceHeader: p,
				dimensions: m
			}, s)] : [];
		} else {
			var h = e;
			if (n) {
				var g = this._applyTransform(t);
				r = g.sourceList, i = g.upstreamSignList;
			} else r = [$m(h.get("source", !0), this._getSourceMetaRawOption(), null)], i = [];
		}
		process.env.NODE_ENV !== "production" && q(r && i), this._setLocalSource(r, i);
	}, e.prototype._applyTransform = function(e) {
		var t = this._sourceHost, n = t.get("transform", !0), r = t.get("fromTransformResult", !0);
		if (process.env.NODE_ENV !== "production" && q(r != null || n != null), r != null) {
			var i = "";
			e.length !== 1 && (process.env.NODE_ENV !== "production" && (i = "When using `fromTransformResult`, there should be only one upstream dataset"), ny(i));
		}
		var a, o = [], s = [];
		return z(e, function(e) {
			e.prepareSource();
			var t = e.getSource(r || 0), n = "";
			r != null && !t && (process.env.NODE_ENV !== "production" && (n = "Can not retrieve result by `fromTransformResult`: " + r), ny(n)), o.push(t), s.push(e._getVersionSign());
		}), n ? a = Zv(n, o, { datasetIndex: t.componentIndex }) : r != null && (a = [th(o[0])]), {
			sourceList: a,
			upstreamSignList: s
		};
	}, e.prototype._isDirty = function() {
		if (this._dirty) return !0;
		for (var e = this._getUpstreamSourceManagers(), t = 0; t < e.length; t++) {
			var n = e[t];
			if (n._isDirty() || this._upstreamSignList[t] !== n._getVersionSign()) return !0;
		}
	}, e.prototype.getSource = function(e) {
		e ||= 0;
		var t = this._sourceList[e];
		if (!t) {
			var n = this._getUpstreamSourceManagers();
			return n[0] && n[0].getSource(e);
		}
		return t;
	}, e.prototype.getSharedDataStore = function(e) {
		process.env.NODE_ENV !== "production" && q(ty(this._sourceHost), "Can only call getDataStore on series source manager.");
		var t = e.makeStoreSchema();
		return this._innerGetDataStore(t.dimensions, e.source, t.hash);
	}, e.prototype._innerGetDataStore = function(e, t, n) {
		var r = 0, i = this._storeList, a = i[r];
		a ||= i[r] = {};
		var o = a[n];
		if (!o) {
			var s = this._getUpstreamSourceManagers()[0];
			ty(this._sourceHost) && s ? o = s._innerGetDataStore(e, t, n) : (o = new Jh(), o.initData(new mh(t, e.length), e)), a[n] = o;
		}
		return o;
	}, e.prototype._getUpstreamSourceManagers = function() {
		var e = this._sourceHost;
		if (ty(e)) {
			var t = qm(e);
			return t ? [t.getSourceManager()] : [];
		} else return B(Jm(e), function(e) {
			return e.getSourceManager();
		});
	}, e.prototype._getSourceMetaRawOption = function() {
		var e = this._sourceHost, t, n, r;
		if (ty(e)) t = e.get("seriesLayoutBy", !0), n = e.get("sourceHeader", !0), r = e.get("dimensions", !0);
		else if (!this._getUpstreamSourceManagers().length) {
			var i = e;
			t = i.get("seriesLayoutBy", !0), n = i.get("sourceHeader", !0), r = i.get("dimensions", !0);
		}
		return {
			seriesLayoutBy: t,
			sourceHeader: n,
			dimensions: r
		};
	}, e;
}();
function ty(e) {
	return e.mainType === "series";
}
function ny(e) {
	throw Error(e);
}
//#endregion
//#region node_modules/echarts/lib/visual/tokens.js
var Z = {
	color: {},
	darkColor: {},
	size: {}
}, ry = Z.color = {
	theme: [
		"#5070dd",
		"#b6d634",
		"#505372",
		"#ff994d",
		"#0ca8df",
		"#ffd10a",
		"#fb628b",
		"#785db0",
		"#3fbe95"
	],
	neutral00: "#fff",
	neutral05: "#f4f7fd",
	neutral10: "#e8ebf0",
	neutral15: "#dbdee4",
	neutral20: "#cfd2d7",
	neutral25: "#c3c5cb",
	neutral30: "#b7b9be",
	neutral35: "#aaacb2",
	neutral40: "#9ea0a5",
	neutral45: "#929399",
	neutral50: "#86878c",
	neutral55: "#797b7f",
	neutral60: "#6d6e73",
	neutral65: "#616266",
	neutral70: "#54555a",
	neutral75: "#48494d",
	neutral80: "#3c3c41",
	neutral85: "#303034",
	neutral90: "#232328",
	neutral95: "#17171b",
	neutral99: "#000",
	accent05: "#eff1f9",
	accent10: "#e0e4f2",
	accent15: "#d0d6ec",
	accent20: "#c0c9e6",
	accent25: "#b1bbdf",
	accent30: "#a1aed9",
	accent35: "#91a0d3",
	accent40: "#8292cc",
	accent45: "#7285c6",
	accent50: "#6578ba",
	accent55: "#5c6da9",
	accent60: "#536298",
	accent65: "#4a5787",
	accent70: "#404c76",
	accent75: "#374165",
	accent80: "#2e3654",
	accent85: "#252b43",
	accent90: "#1b2032",
	accent95: "#121521",
	transparent: "rgba(0,0,0,0)",
	highlight: "rgba(255,231,130,0.8)"
};
for (var iy in R(ry, {
	primary: ry.neutral80,
	secondary: ry.neutral70,
	tertiary: ry.neutral60,
	quaternary: ry.neutral50,
	disabled: ry.neutral20,
	border: ry.neutral30,
	borderTint: ry.neutral20,
	borderShade: ry.neutral40,
	background: ry.neutral05,
	backgroundTint: "rgba(234,237,245,0.5)",
	backgroundTransparent: "rgba(255,255,255,0)",
	backgroundShade: ry.neutral10,
	shadow: "rgba(0,0,0,0.2)",
	shadowTint: "rgba(129,130,136,0.2)",
	axisLine: ry.neutral70,
	axisLineTint: ry.neutral40,
	axisTick: ry.neutral70,
	axisTickMinor: ry.neutral60,
	axisLabel: ry.neutral70,
	axisSplitLine: ry.neutral15,
	axisMinorSplitLine: ry.neutral05
}), ry) if (ry.hasOwnProperty(iy)) {
	var ay = ry[iy];
	iy === "theme" ? Z.darkColor.theme = ry.theme.slice() : iy === "highlight" ? Z.darkColor.highlight = "rgba(255,231,130,0.4)" : iy.indexOf("accent") === 0 ? Z.darkColor[iy] = ga(ay, null, function(e) {
		return e * .5;
	}, function(e) {
		return Math.min(1, 1.3 - e);
	}) : Z.darkColor[iy] = ga(ay, null, function(e) {
		return e * .9;
	}, function(e) {
		return 1 - e ** 1.5;
	});
}
Z.size = {
	xxs: 2,
	xs: 5,
	s: 10,
	m: 15,
	l: 20,
	xl: 30,
	xxl: 40,
	xxxl: 50
};
//#endregion
//#region node_modules/echarts/lib/component/tooltip/tooltipMarkup.js
var oy = "line-height:1";
function sy(e) {
	var t = e.lineHeight;
	return t == null ? oy : "line-height:" + a_(t + "") + "px";
}
function cy(e, t) {
	var n = e.color || Z.color.tertiary, r = e.fontSize || 12, i = e.fontWeight || "400", a = e.color || Z.color.secondary, o = e.fontSize || 14, s = e.fontWeight || "900";
	return t === "html" ? {
		nameStyle: "font-size:" + a_(r + "") + "px;color:" + a_(n) + ";font-weight:" + a_(i + ""),
		valueStyle: "font-size:" + a_(o + "") + "px;color:" + a_(a) + ";font-weight:" + a_(s + "")
	} : {
		nameStyle: {
			fontSize: r,
			fill: n,
			fontWeight: i
		},
		valueStyle: {
			fontSize: o,
			fill: a,
			fontWeight: s
		}
	};
}
var ly = [
	0,
	10,
	20,
	30
], uy = [
	"",
	"\n",
	"\n\n",
	"\n\n\n"
];
function dy(e, t) {
	return t.type = e, t;
}
function fy(e) {
	return e.type === "section";
}
function py(e) {
	return fy(e) ? hy : gy;
}
function my(e) {
	if (fy(e)) {
		var t = 0, n = e.blocks.length, r = n > 1 || n > 0 && !e.noHeader;
		return z(e.blocks, function(e) {
			var n = my(e);
			n >= t && (t = n + +(r && (!n || fy(e) && !e.noHeader)));
		}), t;
	}
	return 0;
}
function hy(e, t, n, r) {
	var i = t.noHeader, a = vy(my(t)), o = [], s = t.blocks || [];
	q(!s || H(s)), s ||= [];
	var c = e.orderMode;
	if (t.sortBlocks && c) {
		s = s.slice();
		var l = {
			valueAsc: "asc",
			valueDesc: "desc"
		};
		if (un(l, c)) {
			var u = new Ih(l[c], null);
			s.sort(function(e, t) {
				return u.evaluate(e.sortParam, t.sortParam);
			});
		} else c === "seriesDesc" && s.reverse();
	}
	z(s, function(n, i) {
		var s = t.valueFormatter, c = py(n)(s ? R(R({}, e), { valueFormatter: s }) : e, n, i > 0 ? a.html : 0, r);
		c != null && o.push(c);
	});
	var d = e.renderMode === "richText" ? o.join(a.richText) : yy(r, o.join(""), i ? n : a.html);
	if (i) return d;
	var f = cv(t.header, "ordinal", e.useUTC), p = cy(r, e.renderMode).nameStyle, m = sy(r);
	return e.renderMode === "richText" ? Sy(e, f, p) + a.richText + d : yy(r, "<div style=\"" + p + ";" + m + ";\">" + a_(f) + "</div>" + d, n);
}
function gy(e, t, n, r) {
	var i = e.renderMode, a = t.noName, o = t.noValue, s = !t.markerType, c = t.name, l = e.useUTC, u = t.valueFormatter || e.valueFormatter || function(e) {
		return e = H(e) ? e : [e], B(e, function(e, t) {
			return cv(e, H(p) ? p[t] : p, l);
		});
	};
	if (!(a && o)) {
		var d = s ? "" : e.markupStyleCreator.makeTooltipMarker(t.markerType, t.markerColor || Z.color.secondary, i), f = a ? "" : cv(c, "ordinal", l), p = t.valueType, m = o ? [] : u(t.value, t.rawDataIndex), h = !s || !a, g = !s && a, _ = cy(r, i), v = _.nameStyle, y = _.valueStyle;
		return i === "richText" ? (s ? "" : d) + (a ? "" : Sy(e, f, v)) + (o ? "" : Cy(e, m, h, g, y)) : yy(r, (s ? "" : d) + (a ? "" : by(f, !s, v)) + (o ? "" : xy(m, h, g, y)), n);
	}
}
function _y(e, t, n, r, i, a) {
	if (e) return py(e)({
		useUTC: i,
		renderMode: n,
		orderMode: r,
		markupStyleCreator: t,
		valueFormatter: e.valueFormatter
	}, e, 0, a);
}
function vy(e) {
	return {
		html: ly[e],
		richText: uy[e]
	};
}
function yy(e, t, n) {
	var r = "<div style=\"clear:both\"></div>", i = "margin: " + n + "px 0 0", a = sy(e);
	return "<div style=\"" + i + ";" + a + ";\">" + t + r + "</div>";
}
function by(e, t, n) {
	var r = t ? "margin-left:2px" : "";
	return "<span style=\"" + n + ";" + r + "\">" + a_(e) + "</span>";
}
function xy(e, t, n, r) {
	var i = t ? "float:right;margin-left:" + (n ? "10px" : "20px") : "";
	return e = H(e) ? e : [e], "<span style=\"" + i + ";" + r + "\">" + B(e, function(e) {
		return a_(e);
	}).join("&nbsp;&nbsp;") + "</span>";
}
function Sy(e, t, n) {
	return e.markupStyleCreator.wrapRichTextStyle(t, n);
}
function Cy(e, t, n, r, i) {
	var a = [i], o = r ? 10 : 20;
	return n && a.push({
		padding: [
			0,
			0,
			0,
			o
		],
		align: "right"
	}), e.markupStyleCreator.wrapRichTextStyle(H(t) ? t.join("  ") : t, a);
}
function wy(e, t) {
	var n = e.getData().getItemVisual(t, "style")[e.visualDrawType];
	return pv(n);
}
function Ty(e, t) {
	return e.get("padding") ?? (t === "richText" ? [8, 10] : 10);
}
var Ey = function() {
	function e() {
		this.richTextStyles = {}, this._nextStyleNameId = cl();
	}
	return e.prototype._generateStyleName = function() {
		return "__EC_aUTo_" + this._nextStyleNameId++;
	}, e.prototype.makeTooltipMarker = function(e, t, n) {
		var r = n === "richText" ? this._generateStyleName() : null, i = fv({
			color: t,
			type: e,
			renderMode: n,
			markerId: r
		});
		return W(i) ? i : (process.env.NODE_ENV !== "production" && q(r), this.richTextStyles[r] = i.style, i.content);
	}, e.prototype.wrapRichTextStyle = function(e, t) {
		var n = {};
		H(t) ? z(t, function(e) {
			return R(n, e);
		}) : R(n, t);
		var r = this._generateStyleName();
		return this.richTextStyles[r] = n, "{" + r + "|" + e + "}";
	}, e;
}();
//#endregion
//#region node_modules/echarts/lib/component/tooltip/seriesFormatTooltip.js
function Dy(e) {
	var t = e.series, n = e.dataIndex, r = e.multipleSeries, i = t.getData(), a = i.mapDimensionsAll("defaultedTooltip"), o = a.length, s = t.getRawValue(n), c = H(s), l = wy(t, n), u, d, f, p;
	if (o > 1 || c && !o) {
		var m = Oy(s, t, n, a, l);
		u = m.inlineValues, d = m.inlineValueTypes, f = m.blocks, p = m.inlineValues[0];
	} else if (o) {
		var h = i.getDimensionInfo(a[0]);
		p = u = Dh(i, n, a[0]), d = h.type;
	} else p = u = c ? s[0] : s;
	var g = Hl(t), _ = g && t.name || "", v = i.getName(n), y = r ? _ : v;
	return dy("section", {
		header: _,
		noHeader: r || !g,
		sortParam: p,
		blocks: [dy("nameValue", {
			markerType: "item",
			markerColor: l,
			name: y,
			noName: !$t(y),
			value: u,
			valueType: d,
			rawDataIndex: i.getRawIndex(n)
		})].concat(f || [])
	});
}
function Oy(e, t, n, r, i) {
	var a = t.getData(), o = Ft(e, function(e, t, n) {
		var r = a.getDimensionInfo(n);
		return e ||= r && r.tooltip !== !1 && r.displayName != null;
	}, !1), s = [], c = [], l = [];
	r.length ? z(r, function(e) {
		u(Dh(a, n, e), e);
	}) : z(e, u);
	function u(e, t) {
		var n = a.getDimensionInfo(t);
		!n || n.otherDims.tooltip === !1 || (o ? l.push(dy("nameValue", {
			markerType: "subItem",
			markerColor: i,
			name: n.displayName,
			value: e,
			valueType: n.type
		})) : (s.push(e), c.push(n.type)));
	}
	return {
		inlineValues: s,
		inlineValueTypes: c,
		blocks: l
	};
}
//#endregion
//#region node_modules/echarts/lib/model/Series.js
var ky = ql();
function Ay(e, t) {
	return e.getName(t) || e.getId(t);
}
var jy = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t._selectedDataIndicesMap = {}, t;
	}
	return t.prototype.init = function(e, t, n) {
		this.seriesIndex = this.componentIndex, this.dataTask = Bv({
			count: Py,
			reset: Fy
		}), this.dataTask.context = { model: this }, this.mergeDefaultAndTheme(e, n), (ky(this).sourceManager = new ey(this)).prepareSource();
		var r = this.getInitialData(e, n);
		Ly(r, this), this.dataTask.context.data = r, process.env.NODE_ENV !== "production" && q(r, "getInitialData returned invalid data."), ky(this).dataBeforeProcessed = r, My(this), this._initSelectedMapFromData(r);
	}, t.prototype.mergeDefaultAndTheme = function(e, t) {
		var n = Cv(this), r = n ? Tv(e) : {}, i = this.subType;
		Ov.hasClass(i) && (i += "Series"), Ot(e, t.getTheme().get(this.subType)), Ot(e, this.getDefaultOption()), El(e, "label", ["show"]), this.fillDataTextStyle(e.data), n && wv(e, r, n);
	}, t.prototype.mergeOption = function(e, t) {
		e = Ot(this.option, e, !0), this.fillDataTextStyle(e.data);
		var n = Cv(this);
		n && wv(this.option, e, n);
		var r = ky(this).sourceManager;
		r.dirty(), r.prepareSource();
		var i = this.getInitialData(e, t);
		Ly(i, this), this.dataTask.dirty(), this.dataTask.context.data = i, ky(this).dataBeforeProcessed = i, My(this), this._initSelectedMapFromData(i);
	}, t.prototype.fillDataTextStyle = function(e) {
		if (e && !Wt(e)) for (var t = ["show"], n = 0; n < e.length; n++) e[n] && e[n].label && El(e[n], "label", t);
	}, t.prototype.getInitialData = function(e, t) {}, t.prototype.appendData = function(e) {
		this.getRawData().appendData(e.data);
	}, t.prototype.getData = function(e) {
		var t = zy(this);
		if (t) {
			var n = t.context.data;
			return e == null || !n.getLinkedData ? n : n.getLinkedData(e);
		} else return ky(this).data;
	}, t.prototype.getAllData = function() {
		var e = this.getData();
		return e && e.getLinkedDataAll ? e.getLinkedDataAll() : [{ data: e }];
	}, t.prototype.setData = function(e) {
		var t = zy(this);
		if (t) {
			var n = t.context;
			n.outputData = e, t !== this.dataTask && (n.data = e);
		}
		ky(this).data = e;
	}, t.prototype.getEncode = function() {
		var e = this.get("encode", !0);
		if (e) return J(e);
	}, t.prototype.getSourceManager = function() {
		return ky(this).sourceManager;
	}, t.prototype.getSource = function() {
		return this.getSourceManager().getSource();
	}, t.prototype.getRawData = function() {
		return ky(this).dataBeforeProcessed;
	}, t.prototype.getColorBy = function() {
		return this.get("colorBy") || "series";
	}, t.prototype.isColorBySeries = function() {
		return this.getColorBy() === "series";
	}, t.prototype.getBaseAxis = function() {
		var e = this.coordinateSystem;
		return e && e.getBaseAxis && e.getBaseAxis();
	}, t.prototype.indicesOfNearest = function(e, t, n, r) {
		var i = this.getData(), a = this.coordinateSystem, o = a && a.getAxis(e);
		if (!a || !o) return [];
		var s = o.dataToCoord(n);
		r ??= Infinity;
		for (var c = [], l = Infinity, u = -1, d = 0, f = i.getDimensionIndex(t), p = i.getStore(), m = 0, h = p.count(); m < h; m++) {
			var g = p.get(f, m), _ = s - o.dataToCoord(g), v = Math.abs(_);
			v <= r && ((v < l || v === l && _ >= 0 && u < 0) && (l = v, u = _, d = 0), _ === u && (c[d++] = m));
		}
		return c.length = d, c;
	}, t.prototype.formatTooltip = function(e, t, n) {
		return Dy({
			series: this,
			dataIndex: e,
			multipleSeries: t
		});
	}, t.prototype.isAnimationEnabled = function() {
		var e = this.ecModel;
		if (Y.node && !(e && e.ssr)) return !1;
		var t = this.getShallow("animation");
		return t && this.getData().count() > this.getShallow("animationThreshold") && (t = !1), !!t;
	}, t.prototype.restoreData = function() {
		this.dataTask.dirty();
	}, t.prototype.getColorFromPalette = function(e, t, n) {
		var r = this.ecModel, i = Mv.prototype.getColorFromPalette.call(this, e, t, n);
		return i ||= r.getColorFromPalette(e, t, n), i;
	}, t.prototype.coordDimToDataDim = function(e) {
		return this.getRawData().mapDimensionsAll(e);
	}, t.prototype.getProgressive = function() {
		return this.get("progressive");
	}, t.prototype.getProgressiveThreshold = function() {
		return this.get("progressiveThreshold");
	}, t.prototype.select = function(e, t) {
		this._innerSelect(this.getData(t), e);
	}, t.prototype.unselect = function(e, t) {
		var n = this.option.selectedMap;
		if (n) {
			var r = this.option.selectedMode, i = this.getData(t);
			if (r === "series" || n === "all") {
				this.option.selectedMap = {}, this._selectedDataIndicesMap = {};
				return;
			}
			for (var a = 0; a < e.length; a++) {
				var o = e[a], s = Ay(i, o);
				n[s] = !1, this._selectedDataIndicesMap[s] = -1;
			}
		}
	}, t.prototype.toggleSelect = function(e, t) {
		for (var n = [], r = 0; r < e.length; r++) n[0] = e[r], this.isSelected(e[r], t) ? this.unselect(n, t) : this.select(n, t);
	}, t.prototype.getSelectedDataIndices = function() {
		if (this.option.selectedMap === "all") return [].slice.call(this.getData().getIndices());
		for (var e = this._selectedDataIndicesMap, t = V(e), n = [], r = 0; r < t.length; r++) {
			var i = e[t[r]];
			i >= 0 && n.push(i);
		}
		return n;
	}, t.prototype.isSelected = function(e, t) {
		var n = this.option.selectedMap;
		if (!n) return !1;
		var r = this.getData(t);
		return (n === "all" || n[Ay(r, e)]) && !r.getItemModel(e).get(["select", "disabled"]);
	}, t.prototype.isUniversalTransitionEnabled = function() {
		if (this.__universalTransitionEnabled) return !0;
		var e = this.option.universalTransition;
		return e ? e === !0 || e && e.enabled : !1;
	}, t.prototype._innerSelect = function(e, t) {
		var n, r, i = this.option, a = i.selectedMode, o = t.length;
		if (!(!a || !o)) {
			if (a === "series") i.selectedMap = "all";
			else if (a === "multiple") {
				G(i.selectedMap) || (i.selectedMap = {});
				for (var s = i.selectedMap, c = 0; c < o; c++) {
					var l = t[c], u = Ay(e, l);
					s[u] = !0, this._selectedDataIndicesMap[u] = e.getRawIndex(l);
				}
			} else if (a === "single" || a === !0) {
				var d = t[o - 1], u = Ay(e, d);
				i.selectedMap = (n = {}, n[u] = !0, n), this._selectedDataIndicesMap = (r = {}, r[u] = e.getRawIndex(d), r);
			}
		}
	}, t.prototype._initSelectedMapFromData = function(e) {
		if (!this.option.selectedMap) {
			var t = [];
			e.hasItemOption && e.each(function(n) {
				var r = e.getRawDataItem(n);
				r && r.selected && t.push(n);
			}), t.length > 0 && this._innerSelect(e, t);
		}
	}, t.registerClass = function(e) {
		return Ov.registerClass(e);
	}, t.protoInitialize = function() {
		var e = t.prototype;
		e.type = "series.__base__", e.seriesIndex = 0, e.ignoreStyleOnData = !1, e.hasSymbolVisual = !1, e.defaultSymbol = "circle", e.visualStyleAccessPath = "itemStyle", e.visualDrawType = "fill";
	}(), t;
}(Ov);
Nt(jy, Rv), Nt(jy, Mv), Cn(jy, Ov);
function My(e) {
	var t = e.name;
	Hl(e) || (e.name = Ny(e) || t);
}
function Ny(e) {
	var t = e.getRawData(), n = t.mapDimensionsAll("seriesName"), r = [];
	return z(n, function(e) {
		var n = t.getDimensionInfo(e);
		n.displayName && r.push(n.displayName);
	}), r.join(" ");
}
function Py(e) {
	return e.model.getRawData().count();
}
function Fy(e) {
	var t = e.model;
	return t.setData(t.getRawData().cloneShallow()), Iy;
}
function Iy(e, t) {
	t.outputData && e.end > t.outputData.count() && t.model.getRawData().cloneShallow(t.outputData);
}
function Ly(e, t) {
	z(cn(e.CHANGABLE_METHODS, e.DOWNSAMPLE_METHODS), function(n) {
		e.wrapMethod(n, Bt(Ry, t));
	});
}
function Ry(e, t) {
	var n = zy(e);
	return n && n.setOutputEnd((t || this).count()), t;
}
function zy(e) {
	var t = (e.ecModel || {}).scheduler, n = t && t.getPipeline(e.uid);
	if (n) {
		var r = n.currentTask;
		if (r) {
			var i = r.agentStubMap;
			i && (r = i.get(e.uid));
		}
		return r;
	}
}
//#endregion
//#region node_modules/echarts/lib/util/symbol.js
var By = Js.extend({
	type: "triangle",
	shape: {
		cx: 0,
		cy: 0,
		width: 0,
		height: 0
	},
	buildPath: function(e, t) {
		var n = t.cx, r = t.cy, i = t.width / 2, a = t.height / 2;
		e.moveTo(n, r - a), e.lineTo(n + i, r + a), e.lineTo(n - i, r + a), e.closePath();
	}
}), Vy = {
	line: Bf,
	rect: cc,
	roundRect: cc,
	square: cc,
	circle: uf,
	diamond: Js.extend({
		type: "diamond",
		shape: {
			cx: 0,
			cy: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.cx, r = t.cy, i = t.width / 2, a = t.height / 2;
			e.moveTo(n, r - a), e.lineTo(n + i, r), e.lineTo(n, r + a), e.lineTo(n - i, r), e.closePath();
		}
	}),
	pin: Js.extend({
		type: "pin",
		shape: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.x, r = t.y, i = t.width / 5 * 3, a = Math.max(i, t.height), o = i / 2, s = o * o / (a - o), c = r - a + o + s, l = Math.asin(s / o), u = Math.cos(l) * o, d = Math.sin(l), f = Math.cos(l), p = o * .6, m = o * .7;
			e.moveTo(n - u, c + s), e.arc(n, c, o, Math.PI - l, Math.PI * 2 + l), e.bezierCurveTo(n + u - d * p, c + s + f * p, n, r - m, n, r), e.bezierCurveTo(n, r - m, n - u + d * p, c + s + f * p, n - u, c + s), e.closePath();
		}
	}),
	arrow: Js.extend({
		type: "arrow",
		shape: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		buildPath: function(e, t) {
			var n = t.height, r = t.width, i = t.x, a = t.y, o = r / 3 * 2;
			e.moveTo(i, a), e.lineTo(i + o, a + n), e.lineTo(i, a + n / 4 * 3), e.lineTo(i - o, a + n), e.lineTo(i, a), e.closePath();
		}
	}),
	triangle: By
}, Hy = {
	line: function(e, t, n, r, i) {
		i.x1 = e, i.y1 = t + r / 2, i.x2 = e + n, i.y2 = t + r / 2;
	},
	rect: function(e, t, n, r, i) {
		i.x = e, i.y = t, i.width = n, i.height = r;
	},
	roundRect: function(e, t, n, r, i) {
		i.x = e, i.y = t, i.width = n, i.height = r, i.r = Math.min(n, r) / 4;
	},
	square: function(e, t, n, r, i) {
		var a = Math.min(n, r);
		i.x = e, i.y = t, i.width = a, i.height = a;
	},
	circle: function(e, t, n, r, i) {
		i.cx = e + n / 2, i.cy = t + r / 2, i.r = Math.min(n, r) / 2;
	},
	diamond: function(e, t, n, r, i) {
		i.cx = e + n / 2, i.cy = t + r / 2, i.width = n, i.height = r;
	},
	pin: function(e, t, n, r, i) {
		i.x = e + n / 2, i.y = t + r / 2, i.width = n, i.height = r;
	},
	arrow: function(e, t, n, r, i) {
		i.x = e + n / 2, i.y = t + r / 2, i.width = n, i.height = r;
	},
	triangle: function(e, t, n, r, i) {
		i.cx = e + n / 2, i.cy = t + r / 2, i.width = n, i.height = r;
	}
}, Uy = {};
z(Vy, function(e, t) {
	Uy[t] = new e();
});
var Wy = Js.extend({
	type: "symbol",
	shape: {
		symbolType: "",
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	calculateTextPosition: function(e, t, n) {
		var r = Gr(e, t, n), i = this.shape;
		return i && i.symbolType === "pin" && t.position === "inside" && (r.y = n.y + n.height * .4), r;
	},
	buildPath: function(e, t, n) {
		var r = t.symbolType;
		if (r !== "none") {
			var i = Uy[r];
			i ||= (r = "rect", Uy[r]), Hy[r](t.x, t.y, t.width, t.height, i.shape), i.buildPath(e, i.shape, n);
		}
	}
});
function Gy(e, t) {
	if (this.type !== "image") {
		var n = this.style;
		this.__isEmptyBrush ? (n.stroke = e, n.fill = t || Z.color.neutral00, n.lineWidth = 2) : this.shape.symbolType === "line" ? n.stroke = e : n.fill = e, this.markRedraw();
	}
}
function Ky(e, t, n, r, i, a, o) {
	var s = e.indexOf("empty") === 0;
	s && (e = e.substr(5, 1).toLowerCase() + e.substr(6));
	var c = e.indexOf("image://") === 0 ? Op(e.slice(8), new X(t, n, r, i), o ? "center" : "cover") : e.indexOf("path://") === 0 ? Dp(e.slice(7), {}, new X(t, n, r, i), o ? "center" : "cover") : new Wy({ shape: {
		symbolType: e,
		x: t,
		y: n,
		width: r,
		height: i
	} });
	return c.__isEmptyBrush = s, c.setColor = Gy, a && c.setColor(a), c;
}
function qy(e, t) {
	if (e != null) return H(e) || (e = [e, e]), [Hc(e[0], t[0]) || 0, Hc(K(e[1], e[0]), t[1]) || 0];
}
//#endregion
//#region node_modules/echarts/lib/chart/helper/labelHelper.js
function Jy(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel"), r = n.length;
	if (r === 1) {
		var i = Dh(e, t, n[0]);
		return i == null ? null : i + "";
	} else if (r) {
		for (var a = [], o = 0; o < n.length; o++) a.push(Dh(e, t, n[o]));
		return a.join(" ");
	}
}
function Yy(e, t) {
	var n = e.mapDimensionsAll("defaultedLabel");
	if (!H(t)) return t + "";
	for (var r = [], i = 0; i < n.length; i++) {
		var a = e.getDimensionIndex(n[i]);
		a >= 0 && r.push(t[a]);
	}
	return r.join(" ");
}
//#endregion
//#region node_modules/echarts/lib/util/vendor.js
var Xy = typeof Float32Array < "u" ? Float32Array : void 0, Zy = typeof Float64Array < "u" ? Float64Array : void 0;
function Qy(e) {
	return $y({ ctor: Xy }, e).arr;
}
function $y(e, t) {
	process.env.NODE_ENV !== "production" && q(t != null && isFinite(t) && t >= 0 && e.hasOwnProperty("ctor"));
	var n = e.arr, r = e.ctor;
	if (t > Qc && (t = Qc), !n || e.typed && n.length < t) {
		var i = void 0;
		if (r) try {
			i = new r(t), e.typed = !0, n && i.set(n);
		} catch (e) {
			process.env.NODE_ENV !== "production" && vl(e);
		}
		if (!i && (i = [], e.typed = !1, n)) for (var a = 0, o = n.length; a < o; a++) i[a] = n[a];
		e.arr = i;
	}
	return e;
}
//#endregion
//#region node_modules/echarts/lib/chart/helper/createRenderPlanner.js
function eb() {
	var e = ql();
	return function(t) {
		var n = e(t), r = t.pipelineContext, i = !!n.large, a = !!n.progressiveRender, o = n.large = !!(r && r.large), s = n.progressiveRender = !!(r && r.progressiveRender);
		return (i !== o || a !== s) && "reset";
	};
}
//#endregion
//#region node_modules/echarts/lib/view/Chart.js
var tb = ql(), nb = eb(), rb = function() {
	function e() {
		this.group = new cf(), this.uid = Hg("viewChart"), this.renderTask = Bv({
			plan: ob,
			reset: sb
		}), this.renderTask.context = { view: this };
	}
	return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {
		if (process.env.NODE_ENV !== "production") throw Error("render method must been implemented");
	}, e.prototype.highlight = function(e, t, n, r) {
		var i = e.getData(r && r.dataType);
		if (!i) {
			process.env.NODE_ENV !== "production" && vl("Unknown dataType " + r.dataType);
			return;
		}
		ab(i, r, "emphasis");
	}, e.prototype.downplay = function(e, t, n, r) {
		var i = e.getData(r && r.dataType);
		if (!i) {
			process.env.NODE_ENV !== "production" && vl("Unknown dataType " + r.dataType);
			return;
		}
		ab(i, r, "normal");
	}, e.prototype.remove = function(e, t) {
		this.group.removeAll();
	}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {
		this.render(e, t, n, r);
	}, e.prototype.updateVisual = function(e, t, n, r) {
		this.render(e, t, n, r);
	}, e.prototype.eachRendered = function(e) {
		$p(this.group, e);
	}, e.markUpdateMethod = function(e, t) {
		tb(e).updateMethod = t;
	}, e.protoInitialize = function() {
		var t = e.prototype;
		t.type = "chart";
	}(), e;
}();
function ib(e, t, n) {
	e && Pd(e) && (t === "emphasis" ? ld : ud)(e, n);
}
function ab(e, t, n) {
	var r = Kl(e, t), i = t && t.highlightKey != null ? Fd(t.highlightKey) : null;
	r == null ? e.eachItemGraphicEl(function(e) {
		ib(e, n, i);
	}) : z(Tl(r), function(t) {
		ib(e.getItemGraphicEl(t), n, i);
	});
}
xn(rb, ["dispose"]), On(rb);
function ob(e) {
	return nb(e.model);
}
function sb(e) {
	var t = e.model, n = e.ecModel, r = e.api, i = e.payload, a = t.pipelineContext.progressiveRender, o = e.view, s = i && tb(i).updateMethod, c = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
	return c !== "render" && o[c](t, n, r, i), cb[c];
}
var cb = {
	incrementalPrepareRender: { progress: function(e, t) {
		t.view.incrementalRender(e, t.model, t.ecModel, t.api, t.payload);
	} },
	render: {
		forceFirstProgress: !0,
		progress: function(e, t) {
			t.view.render(t.model, t.ecModel, t.api, t.payload);
		}
	}
};
//#endregion
//#region node_modules/echarts/lib/chart/helper/createClipPathFromCoordSys.js
function lb(e, t, n, r, i) {
	var a = e.getArea(), o = a.x, s = a.y, c = a.width, l = a.height, u = n.get(["lineStyle", "width"]) || 0;
	o -= u / 2, s -= u / 2, c += u, l += u, c = Math.ceil(c), o !== Math.floor(o) && (o = Math.floor(o), c++);
	var d = new cc({ shape: {
		x: o,
		y: s,
		width: c,
		height: l
	} });
	if (t) {
		var f = e.getBaseAxis(), p = f.isHorizontal(), m = f.inverse;
		p ? (m && (d.shape.x += c), d.shape.width = 0) : (m || (d.shape.y += l), d.shape.height = 0);
		var h = U(i) ? function(e) {
			i(e, d);
		} : null;
		fp(d, { shape: {
			width: c,
			height: l,
			x: o,
			y: s
		} }, n, null, r, h);
	}
	return d;
}
function ub(e, t, n) {
	var r = e.getArea(), i = Kc(r.r0, 1), a = Kc(r.r, 1), o = new kf({ shape: {
		cx: Kc(e.cx, 1),
		cy: Kc(e.cy, 1),
		r0: i,
		r: a,
		startAngle: r.startAngle,
		endAngle: r.endAngle,
		clockwise: r.clockwise
	} });
	return t && (e.getBaseAxis().dim === "angle" ? o.shape.endAngle = r.startAngle : o.shape.r = i, fp(o, { shape: {
		endAngle: r.endAngle,
		r: a
	} }, n)), o;
}
function db(e, t, n, r, i) {
	return e ? e.type === "polar" ? ub(e, t, n) : e.type === "cartesian2d" ? lb(e, t, n, r, i) : null : null;
}
//#endregion
//#region node_modules/echarts/lib/coord/CoordinateSystem.js
function fb(e, t) {
	return e.type === t;
}
//#endregion
//#region node_modules/echarts/lib/scale/Scale.js
var pb = function() {
	function e() {}
	return e.prototype.isBlank = function() {
		return this._isBlank;
	}, e.prototype.setBlank = function(e) {
		this._isBlank = e;
	}, e;
}();
On(pb);
//#endregion
//#region node_modules/echarts/lib/data/OrdinalMeta.js
var mb = 0, hb = function() {
	function e(e) {
		this.categories = e.categories || [], this._needCollect = e.needCollect, this._deduplication = e.deduplication, this.uid = ++mb, this._onCollect = e.onCollect;
	}
	return e.createByAxisModel = function(t) {
		var n = t.option, r = n.data, i = r && B(r, gb);
		return new e({
			categories: i,
			needCollect: !i,
			deduplication: n.dedplication !== !1
		});
	}, e.prototype.getOrdinal = function(e) {
		return this._getOrCreateMap().get(e);
	}, e.prototype.parseAndCollect = function(e) {
		var t, n = this._needCollect;
		if (!W(e) && !n) return e;
		if (n && !this._deduplication) return t = this.categories.length, this.categories[t] = e, this._onCollect && this._onCollect(e, t), t;
		var r = this._getOrCreateMap();
		return t = r.get(e), t ?? (n ? (t = this.categories.length, this.categories[t] = e, r.set(e, t), this._onCollect && this._onCollect(e, t)) : t = NaN), t;
	}, e.prototype._getOrCreateMap = function() {
		return this._map ||= J(this.categories);
	}, e;
}();
function gb(e) {
	return G(e) && e.value != null ? e.value : e + "";
}
var _b = V({
	needTransform: 1,
	normalize: 1,
	scale: 1,
	transformIn: 1,
	transformOut: 1,
	contain: 1,
	getExtent: 1,
	getExtentUnsafe: 1,
	setExtent: 1,
	setExtent2: 1,
	getFilter: 1,
	sanitize: 1,
	getDefaultStartValue: 1,
	freeze: 1
});
function vb(e, t, n) {
	var r;
	e ||= {};
	var i = y_();
	if (i) {
		var a = i.createBreakScaleMapper(t, n);
		a.hasBreaks() && (z(_b, function(t) {
			a[t] && (e[t] = zt(a[t], a));
		}), r = a);
	}
	return r ?? Tb(e, n), {
		brk: r,
		mapper: e
	};
}
function yb(e, t) {
	z(_b, function(n) {
		e[n] = t[n];
	});
}
function bb(e, t) {
	e.freeze = dn, process.env.NODE_ENV !== "production" && (e.freeze = function() {
		t.freeze();
	});
}
function xb(e) {
	return e.getExtentUnsafe(0, 2);
}
function Sb(e, t) {
	return e.getExtentUnsafe(1, t) || e.getExtentUnsafe(0, t);
}
function Cb(e) {
	var t = Sb(e, 3);
	return t[1] - t[0];
}
function wb(e) {
	var t = e.getExtentUnsafe(0, 3);
	return t[1] - t[0];
}
function Tb(e, t) {
	var n = e || {}, r = [];
	return n._extents = r, r[0] = t ? t.slice() : ru(), R(n, Eb), n;
}
var Eb = {
	needTransform: function() {
		return !1;
	},
	normalize: function(e) {
		var t = this._extents[1] || this._extents[0];
		return t[1] === t[0] ? .5 : (e - t[0]) / (t[1] - t[0]);
	},
	scale: function(e) {
		var t = this._extents[1] || this._extents[0];
		return e * (t[1] - t[0]) + t[0];
	},
	transformIn: function(e) {
		return e;
	},
	transformOut: function(e) {
		return e;
	},
	contain: function(e) {
		var t = Sb(this, null);
		return e >= t[0] && e <= t[1];
	},
	getExtent: function() {
		return this._extents[0].slice();
	},
	getExtentUnsafe: function(e) {
		return this._extents[e];
	},
	setExtent: function(e, t) {
		process.env.NODE_ENV !== "production" && q(!this._frozen), Db(this._extents, 0, e, t);
	},
	setExtent2: function(e, t, n) {
		process.env.NODE_ENV !== "production" && q(!this._frozen);
		var r = this._extents;
		r[e] || (r[e] = r[0].slice()), Db(r, e, t, n);
	},
	freeze: function() {
		process.env.NODE_ENV !== "production" && (this._frozen = !0);
	}
};
function Db(e, t, n, r) {
	lu(n, r) ? (e[t][0] = n, e[t][1] = r) : process.env.NODE_ENV !== "production" && n != null && r != null && n <= r && vl("Invalid setExtent call - start: " + n + ", end: " + r);
}
//#endregion
//#region node_modules/echarts/lib/scale/helper.js
function Ob(e) {
	return kb(e) || jb(e);
}
function kb(e) {
	return e.type === "interval";
}
function Ab(e) {
	return e.type === "time";
}
function jb(e) {
	return e.type === "log";
}
function Mb(e) {
	return e.type === "ordinal";
}
function Nb(e) {
	var t = il(e), n = Ic(10, t), r = Nc(e / n);
	return r ? r === 2 ? r = 3 : r === 3 ? r = 5 : r *= 2 : r = 1, Kc(r * n, -t);
}
function Pb(e) {
	return Jc(e) + 2;
}
function Fb(e, t) {
	return Lc(e) / Lc(t);
}
function Ib(e, t, n) {
	var r = n && n.lookup;
	if (r) {
		for (var i = 0; i < r.from.length; i++) if (e === r.from[i]) return r.to[i];
	}
	return Ic(t, e);
}
function Lb(e, t, n) {
	var r = e.slice();
	if (r[0] === r[1]) {
		var i = n && n.ctnShp;
		if (r[0] !== 0) {
			var a = Mc(r[0]);
			t[1] || (r[1] += a / 2), r[0] -= a / 2;
		} else i && (r[0] = -1), r[1] = 1;
	}
	return (!cu(r[0]) || !cu(r[1])) && (r[0] = 0, r[1] = 1), r[1] < r[0] && r.reverse(), r;
}
function Rb(e, t) {
	return [e[0] !== t[0], e[1] !== t[1]];
}
function zb(e, t) {
	return e ||= t, Nc(jc(e, 1));
}
function Bb(e, t, n) {
	var r = xb(e), i = r[0], a = e.count(), o = Math.max((t || 0) + 1, 1);
	i !== 0 && o > 1 && a / o > 2 && (i = Math.round(Math.ceil(i / o) * o)), i !== r[0] && c(r[0], !0, !0);
	for (var s = i; s <= r[1]; s += o) c(s, !1, s === r[0] || s === r[1]);
	s - o !== r[1] && c(r[1], !0, !0);
	function c(e, t, r) {
		n({
			value: e,
			offInterval: t
		}, r);
	}
}
//#endregion
//#region node_modules/echarts/lib/scale/Ordinal.js
var Vb = function(e) {
	I(t, e);
	function t(n) {
		var r = e.call(this) || this;
		r.type = "ordinal", r.parse = t.parse, yb(r, t.decoratedMethods);
		var i = n.ordinalMeta;
		i ||= new hb({}), H(i) && (i = new hb({ categories: B(i, function(e) {
			return G(e) ? e.value : e;
		}) })), r._ordinalMeta = i;
		var a = vb(null, null, n.extent || [0, i.categories.length - 1]);
		return r._mapper = a.mapper, bb(r, a.mapper), r;
	}
	return t.parse = function(e) {
		return e == null ? e = NaN : W(e) ? (e = this._ordinalMeta.getOrdinal(e), e ??= NaN) : e = Nc(e), e;
	}, t.prototype.getTicks = function() {
		var e = [];
		return Bb(this, 0, function(t) {
			e.push(t);
		}), e;
	}, t.prototype.getMinorTicks = function(e) {}, t.prototype.setSortInfo = function(e) {
		if (e == null) {
			this._ordinalNumbersByTick = this._ticksByOrdinalNumber = null;
			return;
		}
		for (var t = e.ordinalNumbers, n = this._ordinalNumbersByTick = [], r = this._ticksByOrdinalNumber = [], i = 0, a = this._ordinalMeta.categories.length, o = Ac(a, t.length); i < o; ++i) {
			var s = n[i] = t[i];
			r[s] = i;
		}
		for (var c = 0; i < a; ++i) {
			for (; r[c] != null;) c++;
			n[i] = c, r[c] = i;
		}
	}, t.prototype._getTickNumber = function(e) {
		var t = this._ticksByOrdinalNumber;
		return t && e >= 0 && e < t.length ? t[e] : e;
	}, t.prototype.getRawOrdinalNumber = function(e) {
		var t = this._ordinalNumbersByTick;
		return t && e >= 0 && e < t.length ? t[e] : e;
	}, t.prototype.getLabel = function(e) {
		if (!this.isBlank()) {
			var t = this.getRawOrdinalNumber(e.value), n = this._ordinalMeta.categories[t];
			return n == null ? "" : n + "";
		}
	}, t.prototype.count = function() {
		var e = xb(this._mapper);
		return e[1] - e[0] + 1;
	}, t.prototype.getOrdinalMeta = function() {
		return this._ordinalMeta;
	}, t.type = "ordinal", t.decoratedMethods = {
		needTransform: function() {
			return this._mapper.needTransform();
		},
		contain: function(e) {
			return this._mapper.contain(this._getTickNumber(e)) && e >= 0 && e < this._ordinalMeta.categories.length;
		},
		normalize: function(e) {
			return this._mapper.normalize(this._getTickNumber(e));
		},
		scale: function(e) {
			return this.getRawOrdinalNumber(Nc(this._mapper.scale(e)));
		},
		transformIn: function(e, t) {
			return this._mapper.transformIn(this._getTickNumber(e), t);
		},
		transformOut: function(e, t) {
			return this.getRawOrdinalNumber(this._mapper.transformOut(e, t));
		},
		getExtent: function() {
			return this._mapper.getExtent();
		},
		getExtentUnsafe: function(e, t) {
			return this._mapper.getExtentUnsafe(e, t);
		},
		setExtent: function(e, t) {
			return this._mapper.setExtent(e, t);
		},
		setExtent2: function(e, t, n) {
			return this._mapper.setExtent2(e, t, n);
		}
	}, t;
}(pb);
pb.registerClass(Vb);
//#endregion
//#region node_modules/echarts/lib/scale/minorTicks.js
function Hb(e, t, n, r) {
	for (var i = e.getTicks({ expandToNicedExtent: !0 }), a = [], o = e.getExtent(), s = 1; s < i.length; s++) {
		var c = i[s], l = i[s - 1];
		if (!(l.break || c.break)) {
			for (var u = 0, d = [], f = (c.value - l.value) / t, p = Pb(f); u < t - 1;) {
				var m = Kc(l.value + (u + 1) * f, p);
				m > o[0] && m < o[1] && d.push(m), u++;
			}
			var h = y_();
			h && h.pruneTicksByBreak("auto", d, n, function(e) {
				return e;
			}, r, o), a.push(d);
		}
	}
	return a;
}
//#endregion
//#region node_modules/echarts/lib/scale/Interval.js
var Ub = function(e) {
	I(t, e);
	function t(n) {
		var r = e.call(this) || this;
		return r.type = "interval", r.parse = t.parse, n ||= {}, r.brk = vb(r, b_(r, n), null).brk, r._cfg = {
			interval: 0,
			intervalPrecision: 2,
			intervalCount: void 0,
			niceExtent: void 0
		}, r;
	}
	return t.parse = function(e) {
		return e == null || e === "" ? NaN : Number(e);
	}, t.prototype.getConfig = function() {
		return L(this._cfg);
	}, t.prototype.setConfig = function(e) {
		var t = xb(this);
		process.env.NODE_ENV !== "production" && (q(e.interval != null), e.intervalCount != null && q(e.intervalCount >= -1 && e.intervalPrecision != null && !S_(this)), e.niceExtent != null && (q(isFinite(e.niceExtent[0]) && isFinite(e.niceExtent[1])), q(t[0] <= e.niceExtent[0] && e.niceExtent[1] <= t[1]), q(Kc(e.niceExtent[0] - e.niceExtent[1], Jc(e.interval)) <= e.interval))), this._cfg = e = L(e), e.niceExtent ??= t.slice(), e.intervalPrecision ??= Pb(e.interval);
	}, t.prototype.getTicks = function(e) {
		e ||= {};
		var t = this._cfg, n = t.interval, r = xb(this), i = t.niceExtent, a = t.intervalPrecision, o = y_(), s = this.brk, c = o && s, l = [];
		if (!n) return l;
		if (e.breakTicks === "only_break" && c) return o.addBreaksToTicks(l, s.breaks, r), l;
		process.env.NODE_ENV !== "production" && q(i != null);
		var u = 3e3;
		r[0] < i[0] && l.push({ value: e.expandToNicedExtent ? Kc(i[0] - n, a) : r[0] });
		for (var d = function(e, t) {
			return Nc((t - e) / n);
		}, f = t.intervalCount, p = i[0], m = 0;; m++) {
			if (f == null) {
				if (p > i[1] || !isFinite(p) || !isFinite(i[1])) break;
			} else {
				if (m > f) break;
				p = Ac(p, i[1]), m === f && (p = i[1]);
			}
			if (l.push({ value: p }), p = Kc(p + n, a), s) {
				var h = s.calcNiceTickMultiple(p, d);
				h >= 0 && (p = Kc(p + h * n, a));
			}
			if (l.length > 0 && p === l[l.length - 1].value) break;
			if (l.length > u) return process.env.NODE_ENV !== "production" && _l("Exceed safe limit in IntervalScale[\"getTicks\"]."), [];
		}
		var g = l.length ? l[l.length - 1].value : i[1];
		return r[1] > g && l.push({ value: e.expandToNicedExtent ? Kc(g + n, a) : r[1] }), c && o.pruneTicksByBreak(e.pruneByBreak, l, s.breaks, function(e) {
			return e.value;
		}, t.interval, r), c && e.breakTicks !== "none" && o.addBreaksToTicks(l, s.breaks, r), l;
	}, t.prototype.getMinorTicks = function(e) {
		return Hb(this, e, x_(this), this._cfg.interval);
	}, t.prototype.getLabel = function(e, t) {
		if (e == null) return "";
		var n = t && t.precision;
		return n == null ? n = Jc(e.value) || 0 : n === "auto" && (n = this._cfg.intervalPrecision), av(Kc(e.value, n, !0));
	}, t.type = "interval", t;
}(pb);
pb.registerClass(Ub);
//#endregion
//#region node_modules/echarts/lib/scale/Time.js
var Wb = function(e, t, n, r) {
	for (; n < r;) {
		var i = n + r >>> 1;
		e[i][1] < t ? n = i + 1 : r = i;
	}
	return n;
}, Gb = function(e) {
	I(t, e);
	function t(n) {
		var r = e.call(this) || this;
		return r.type = "time", r.parse = t.parse, r._locale = n.locale, r._useUTC = n.useUTC, r._interval = 0, r.brk = vb(r, b_(r, n), null).brk, r;
	}
	return t.prototype.getLabel = function(e) {
		return V_(e.value, M_[B_(R_(this._minLevelUnit))] || M_.second, this._useUTC, this._locale);
	}, t.prototype.getFormattedLabel = function(e, t, n) {
		return H_(e, t, n, this._locale, this._useUTC);
	}, t.prototype.getTicks = function(e) {
		e ||= {};
		var t = this._interval, n = xb(this), r = y_(), i = this.brk, a = r && i, o = [];
		if (!t) return o;
		var s = this._useUTC;
		if (a && e.breakTicks === "only_break") return y_().addBreaksToTicks(o, i.breaks, n), o;
		o = tx(this._minLevelUnit, this._approxInterval, s, n, wb(this), i);
		var c = N_.length - 1, l = 0;
		return z(o, function(e) {
			e.time && (c = Math.min(c, jt(N_, e.time.upperTimeUnit)), l = Math.max(l, e.time.level));
		}), a && y_().pruneTicksByBreak(e.pruneByBreak, o, i.breaks, function(e) {
			return e.value;
		}, this._approxInterval, n), a && e.breakTicks !== "none" && y_().addBreaksToTicks(o, i.breaks, n, function(e) {
			for (var t = Math.max(jt(N_, U_(e.vmin, s)), jt(N_, U_(e.vmax, s))), n = 0, r = 0; r < N_.length; r++) if (!qb(N_[r], e.vmin, e.vmax, s)) {
				n = r;
				break;
			}
			var i = Math.min(n, c);
			return {
				level: l,
				lowerTimeUnit: N_[Math.max(i, t)],
				upperTimeUnit: N_[i]
			};
		}), o;
	}, t.prototype.getMinorTicks = function(e) {
		return Hb(this, e, x_(this), this._interval);
	}, t.prototype.setTimeInterval = function(e) {
		this._interval = e.interval, this._approxInterval = e.approxInterval, this._minLevelUnit = e.minLevelUnit;
	}, t.parse = function(e) {
		return Ht(e) ? Math.round(e) : +nl(e);
	}, t.type = "time", t;
}(pb), Kb = [
	["second", C_],
	["minute", w_],
	["hour", T_],
	["quarter-day", T_ * 6],
	["half-day", T_ * 12],
	["day", E_ * 1.2],
	["half-week", E_ * 3.5],
	["week", E_ * 7],
	["month", E_ * 31],
	["quarter", E_ * 95],
	["half-year", D_ / 2],
	["year", D_]
];
function qb(e, t, n, r) {
	return W_(new Date(t), e, r).getTime() === W_(new Date(n), e, r).getTime();
}
function Jb(e, t) {
	return e /= E_, e > 16 ? 16 : e > 7.5 ? 7 : e > 3.5 ? 4 : e > 1.5 ? 2 : 1;
}
function Yb(e) {
	var t = 30 * E_;
	return e /= t, e > 6 ? 6 : e > 3 ? 3 : e > 2 ? 2 : 1;
}
function Xb(e) {
	return e /= T_, e > 12 ? 12 : e > 6 ? 6 : e > 3.5 ? 4 : e > 2 ? 2 : 1;
}
function Zb(e, t) {
	return e /= t ? w_ : C_, e > 30 ? 30 : e > 20 ? 20 : e > 15 ? 15 : e > 10 ? 10 : e > 5 ? 5 : e > 2 ? 2 : 1;
}
function Qb(e) {
	return jc(al(e, !0), 1);
}
function $b(e, t, n) {
	var r = Math.max(0, jt(N_, t) - 1);
	return W_(new Date(e), N_[r], n).getTime();
}
function ex(e, t) {
	var n = /* @__PURE__ */ new Date(0);
	n[e](1);
	var r = n.getTime();
	n[e](1 + t);
	var i = n.getTime() - r;
	return function(e, t) {
		return Math.max(0, Math.round((t - e) / i));
	};
}
function tx(e, t, n, r, i, a) {
	var o = P_, s = 0;
	function c(e, t, n, i, o, c, l) {
		for (var u = ex(o, e), d = t, f = new Date(d); d < n && d <= r[1];) {
			if (l.push({ value: d }), s++ > 3e3) {
				process.env.NODE_ENV !== "production" && _l("Exceed safe limit in TimeScale[\"getTicks\"].");
				break;
			}
			if (f[o](f[i]() + e), d = f.getTime(), a) {
				var p = a.calcNiceTickMultiple(d, u);
				p > 0 && (f[o](f[i]() + p * e), d = f.getTime());
			}
		}
		l.push({
			value: d,
			notAdd: d > r[1]
		});
	}
	function l(e, i, a) {
		var o = [], s = !i.length;
		if (!qb(R_(e), r[0], r[1], n)) {
			s && (i = [{ value: $b(r[0], e, n) }, { value: r[1] }]);
			for (var l = 0; l < i.length - 1; l++) {
				var u = i[l].value, d = i[l + 1].value;
				if (u !== d) {
					var f = void 0, p = void 0, m = void 0, h = !1;
					switch (e) {
						case "year":
							f = Math.max(1, Math.round(t / E_ / 365)), p = G_(n), m = Q_(n);
							break;
						case "half-year":
						case "quarter":
						case "month":
							f = Yb(t), p = K_(n), m = $_(n);
							break;
						case "week":
						case "half-week":
						case "day":
							f = Jb(t, 31), p = q_(n), m = ev(n), h = !0;
							break;
						case "half-day":
						case "quarter-day":
						case "hour":
							f = Xb(t), p = J_(n), m = tv(n);
							break;
						case "minute":
							f = Zb(t, !0), p = Y_(n), m = nv(n);
							break;
						case "second":
							f = Zb(t, !1), p = X_(n), m = rv(n);
							break;
						case "millisecond":
							f = Qb(t), p = Z_(n), m = iv(n);
							break;
					}
					d >= r[0] && u <= r[1] && c(f, u, d, p, m, h, o), e === "year" && a.length > 1 && l === 0 && a.unshift({ value: a[0].value - f });
				}
			}
			for (var l = 0; l < o.length; l++) a.push(o[l]);
		}
	}
	for (var u = [], d = [], f = 0, p = 0, m = 0; m < o.length; ++m) {
		var h = R_(o[m]);
		if (z_(o[m]) && (l(o[m], u[u.length - 1] || [], d), h !== (o[m + 1] ? R_(o[m + 1]) : null))) {
			if (d.length) {
				p = f, d.sort(function(e, t) {
					return e.value - t.value;
				});
				for (var g = [], _ = 0; _ < d.length; ++_) {
					var v = d[_].value;
					(_ === 0 || d[_ - 1].value !== v) && (g.push(d[_]), v >= r[0] && v <= r[1] && f++);
				}
				var y = i / t;
				if (f > y * 1.5 && p > y / 1.5 || (u.push(g), f > y || e === o[m])) break;
			}
			d = [];
		}
	}
	for (var b = It(B(u, function(e) {
		return It(e, function(e) {
			return e.value >= r[0] && e.value <= r[1] && !e.notAdd;
		});
	}), function(e) {
		return e.length > 0;
	}), x = b.length - 1, S = [], m = 0; m < b.length; ++m) for (var C = b[m], w = 0; w < C.length; ++w) {
		var T = U_(C[w].value, n);
		S.push({
			value: C[w].value,
			time: {
				level: x - m,
				upperTimeUnit: T,
				lowerTimeUnit: T
			}
		});
	}
	mu(S, hu, null), S.sort(function(e, t) {
		return e.value - t.value;
	});
	var E = S[0], D = S[S.length - 1], O = U_(r[0], n), k = U_(r[1], n);
	return (!E || E.value > r[0]) && S.unshift({
		value: r[0],
		time: {
			level: 0,
			upperTimeUnit: O,
			lowerTimeUnit: O
		},
		notNice: !0
	}), (!D || D.value < r[1]) && S.push({
		value: r[1],
		time: {
			level: 0,
			upperTimeUnit: k,
			lowerTimeUnit: k
		},
		notNice: !0
	}), S;
}
var nx = function(e, t) {
	var n = e.getExtent();
	if (n[0] === n[1] && (n[0] -= E_, n[1] += E_), n[1] === -Infinity && n[0] === Infinity) {
		var r = /* @__PURE__ */ new Date();
		n[1] = +new Date(r.getFullYear(), r.getMonth(), r.getDate()), n[0] = n[1] - E_;
	}
	e.setExtent(n[0], n[1]);
	var i = zb(t.splitNumber, 10), a = wb(e) / i, o = t.minInterval, s = t.maxInterval;
	o != null && a < o && (a = o), s != null && a > s && (a = s);
	var c = Kb.length, l = Math.min(Wb(Kb, a, 0, c), c - 1), u = Kb[l][1], d = Kb[Math.max(l - 1, 0)][0];
	e.setTimeInterval({
		approxInterval: a,
		interval: u,
		minLevelUnit: d
	});
};
pb.registerClass(Gb);
//#endregion
//#region node_modules/echarts/lib/scale/Log.js
var rx = 0, ix = 1, ax = 2, ox = function(e) {
	I(t, e);
	function t(n) {
		var r = e.call(this) || this;
		r.type = "log", r.parse = Ub.parse, r.base = n.logBase || 10;
		var i = [], a = [], o = r._lookup = {
			from: i,
			to: a
		};
		i[rx] = i[ix] = a[rx] = a[ix] = NaN, yb(r, t.mapperMethods);
		var s = y_(), c = n.breakOption, l = { lookup: o };
		return s && s.parseAxisBreakOptionInwardTransform(c, r, { noNegative: !0 }, ax, l), r.powStub = new Ub({ breakParsed: l.original }), r.intervalStub = new Ub({ breakParsed: l.transformed }), bb(r, r.intervalStub), r;
	}
	return t.prototype.getTicks = function(e) {
		var t = this.base, n = this.powStub, r = y_(), i = this.intervalStub, a = { lookup: {
			from: i.getExtent(),
			to: n.getExtent()
		} };
		return B(i.getTicks(e || {}), function(e) {
			var i = e.value, o = Ib(i, t, a), s;
			if (r) {
				var c = r.getTicksBreakOutwardTransform(this, e, x_(n), this._lookup);
				c && (s = c.vBreak, o = c.tickVal);
			}
			return {
				value: o,
				break: s
			};
		}, this);
	}, t.prototype.getMinorTicks = function(e) {
		return Hb(this, e, x_(this.powStub), this.intervalStub.getConfig().interval);
	}, t.prototype.getLabel = function(e, t) {
		return this.intervalStub.getLabel(e, t);
	}, t.type = "log", t.mapperMethods = {
		needTransform: function() {
			return !0;
		},
		normalize: function(e) {
			return this.intervalStub.normalize(Fb(e, this.base));
		},
		scale: function(e) {
			return Ib(this.intervalStub.scale(e), this.base, null);
		},
		transformIn: function(e, t) {
			return e = Fb(e, this.base), t && t.depth === 2 ? e : this.intervalStub.transformIn(e, t);
		},
		transformOut: function(e, t) {
			var n = t ? t.depth : null;
			return sx.depth = n, cx.lookup = this._lookup, Ib(n === 2 ? e : this.intervalStub.transformOut(e, sx), this.base, cx);
		},
		contain: function(e) {
			return this.powStub.contain(e);
		},
		setExtent: function(e, t) {
			this.setExtent2(0, e, t);
		},
		setExtent2: function(e, t, n) {
			if (!(!lu(t, n) || t <= 0 || n <= 0)) {
				var r = lx, i = lx;
				if (e === 0) {
					var a = this._lookup;
					r = a.to, i = a.from;
				}
				this.powStub.setExtent2(e, r[rx] = t, r[ix] = n);
				var o = this.base;
				this.intervalStub.setExtent2(e, i[rx] = Fb(t, o), i[ix] = Fb(n, o));
			}
		},
		getFilter: function() {
			return { g: 0 };
		},
		sanitize: function(e, t) {
			return lu(t[0], t[1]) && dl(e) && e <= 0 && (e = t[0]), e;
		},
		getDefaultStartValue: function() {
			return 1;
		},
		getExtent: function() {
			return this.powStub.getExtent();
		},
		getExtentUnsafe: function(e, t) {
			return t === null ? this.powStub.getExtentUnsafe(e, null) : this.intervalStub.getExtentUnsafe(e, t);
		}
	}, t;
}(pb);
pb.registerClass(ox);
var sx = {}, cx = {}, lx = [], ux = {
	value: 1,
	category: 1,
	time: 1,
	log: 1
}, dx = ql();
function fx(e) {
	var t = e.get("type");
	return (t == null || !un(ux, t) && !pb.getClass(t)) && (t = "value"), t;
}
function px(e, t, n) {
	var r = y_(), i;
	switch (r && (i = Tx(e, t, n)), t) {
		case "category": return new Vb({
			ordinalMeta: e.getOrdinalMeta ? e.getOrdinalMeta() : e.getCategories(),
			extent: ru()
		});
		case "time": return new Gb({
			locale: e.ecModel.getLocaleModel(),
			useUTC: e.ecModel.get("useUTC"),
			breakOption: i
		});
		case "log": return new ox({
			logBase: e.get("logBase"),
			breakOption: i
		});
		case "value": return new Ub({ breakOption: i });
		default: return new ((pb.getClass(t)) || Ub)({});
	}
}
function mx(e, t, n) {
	var r = n ? Sb(e, null) : e.getExtentUnsafe(0, null), i = r[0], a = r[1];
	return lu(i, a) ? i === t || a === t ? 2 : i < t && a > t ? 1 : 3 : 3;
}
function hx(e) {
	dx(e).noOnMyZero = !0;
}
function gx(e) {
	return dx(e).noOnMyZero;
}
function _x(e) {
	var t = e.getLabelModel().get("formatter");
	if (e.type === "time") {
		var n = F_(t);
		return function(t, r) {
			return e.scale.getFormattedLabel(t, r, n);
		};
	} else if (W(t)) return function(n) {
		var r = e.scale.getLabel(n);
		return t.replace("{value}", r ?? "");
	};
	else if (U(t)) {
		if (e.type === "category") return function(n, r) {
			return t(vx(e, n), n.value - e.scale.getExtent()[0], null);
		};
		var r = y_();
		return function(n, i) {
			var a = null;
			return r && (a = r.makeAxisLabelFormatterParamBreak(a, n.break)), t(vx(e, n), i, a);
		};
	} else return function(t) {
		return e.scale.getLabel(t);
	};
}
function vx(e, t) {
	var n = e.scale;
	return Mb(n) ? n.getLabel(t) : t.value;
}
function yx(e) {
	return e.get("interval") ?? "auto";
}
function bx(e) {
	return e.type === "category" && yx(e.getLabelModel()) === 0;
}
function xx(e, t) {
	var n = {};
	return z(e.mapDimensionsAll(t), function(t) {
		n[Fg(e, t)] = !0;
	}), V(n);
}
function Sx(e) {
	return e === "middle" || e === "center";
}
function Cx(e) {
	return e.getShallow("show");
}
function Tx(e, t, n) {
	var r = e.get("breaks", !0);
	if (r != null) {
		if (!y_()) {
			process.env.NODE_ENV !== "production" && vl("Must `import {AxisBreak} from \"echarts/features.js\"; use(AxisBreak);` first if using breaks option.");
			return;
		}
		if (!n || !Ex(t)) {
			process.env.NODE_ENV !== "production" && vl("Axis" + (e instanceof Ov ? " " + e.type + "[" + e.componentIndex + "]" : "") + " does not support break.");
			return;
		}
		return r;
	}
}
function Ex(e) {
	return e !== "category";
}
function Dx(e, t, n, r, i, a) {
	var o = jb(e), s = o ? e.intervalStub : e;
	if (s.setExtent(r[0], r[1]), o) {
		var c = e.powStub, l = { depth: 2 }, u = e.transformOut(r[0], l), d = e.transformOut(r[1], l), f = Rb(n, r);
		t[0] && !f[0] && (u = i[0]), t[1] && !f[1] && (d = i[1]), c.setExtent(u, d);
	}
	s.setConfig(a);
}
function Ox(e, t) {
	return Mb(e) ? e.getRawOrdinalNumber(t.value) : t.value;
}
function kx(e, t) {
	return Mb(e) && !!t.get("boundaryGap");
}
//#endregion
//#region node_modules/echarts/lib/processor/dataSample.js
var Ax = {
	average: function(e) {
		for (var t = 0, n = 0, r = 0; r < e.length; r++) isNaN(e[r]) || (t += e[r], n++);
		return n === 0 ? NaN : t / n;
	},
	sum: function(e) {
		for (var t = 0, n = 0; n < e.length; n++) t += e[n] || 0;
		return t;
	},
	max: function(e) {
		for (var t = -Infinity, n = 0; n < e.length; n++) e[n] > t && (t = e[n]);
		return isFinite(t) ? t : NaN;
	},
	min: function(e) {
		for (var t = Infinity, n = 0; n < e.length; n++) e[n] < t && (t = e[n]);
		return isFinite(t) ? t : NaN;
	},
	nearest: function(e) {
		return e[0];
	}
}, jx = function(e) {
	return Math.round(e.length / 2);
};
function Mx(e) {
	return {
		seriesType: e,
		reset: function(e, t, n) {
			var r = e.getData(), i = e.get("sampling"), a = e.coordinateSystem, o = r.count();
			if (o > 10 && a.type === "cartesian2d" && i) {
				var s = a.getBaseAxis(), c = a.getOtherAxis(s), l = s.getExtent(), u = n.getDevicePixelRatio(), d = Math.abs(l[1] - l[0]) * (u || 1), f = Math.round(o / d);
				if (isFinite(f) && f > 1) {
					i === "lttb" ? e.setData(r.lttbDownSample(r.mapDimension(c.dim), 1 / f)) : i === "minmax" && e.setData(r.minmaxDownSample(r.mapDimension(c.dim), 1 / f));
					var p = void 0;
					W(i) ? p = Ax[i] : U(i) && (p = i), p && e.setData(r.downSample(r.mapDimension(c.dim), 1 / f, p, jx));
				}
			}
		}
	};
}
//#endregion
//#region node_modules/echarts/lib/coord/axisTickLabelBuilder.js
var Nx = ql(), Px = ql(), Fx = {
	estimate: 1,
	determine: 2
};
function Ix(e) {
	return {
		out: { noPxChangeTryDetermine: [] },
		kind: e
	};
}
function Lx(e, t) {
	var n = e.getLabelModel().get("customValues");
	if (n) {
		var r = e.scale;
		return { labels: B(zx(n, r), function(t, n) {
			return {
				formattedLabel: _x(e)(t, n),
				rawLabel: r.getLabel(t),
				tick: t
			};
		}) };
	}
	return e.type === "category" ? Bx(e, t) : Ux(e);
}
function Rx(e, t, n) {
	var r = e.scale, i = e.getTickModel().get("customValues");
	return i ? { ticks: zx(i, r) } : e.type === "category" ? Hx(e, t) : { ticks: r.getTicks(n) };
}
function zx(e, t) {
	var n = t.getExtent(), r = [];
	return z(e, function(e) {
		e = t.parse(e), e >= n[0] && e <= n[1] && r.push(e);
	}), mu(r, gu, null), qc(r), B(r, function(e) {
		return { value: e };
	});
}
function Bx(e, t) {
	var n = e.getLabelModel(), r = Vx(e, n, t);
	return !n.get("show") || e.scale.isBlank() ? { labels: [] } : r;
}
function Vx(e, t, n) {
	var r = Gx(e), i = yx(t), a = n.kind === Fx.estimate;
	if (!a) {
		var o = qx(r, i);
		if (o) return o;
	}
	var s, c;
	U(i) ? s = eS(e, i, !1) : (c = i === "auto" ? Yx(e, n) : i, s = eS(e, c, !1));
	var l = {
		labels: s,
		labelCategoryInterval: c
	};
	return a ? n.out.noPxChangeTryDetermine.push(function() {
		return Jx(r, i, l), !0;
	}) : Jx(r, i, l), l;
}
function Hx(e, t) {
	var n = Wx(e), r = yx(t), i = qx(n, r);
	if (i) return i;
	var a, o;
	if ((!t.get("show") || e.scale.isBlank()) && (a = []), U(r)) a = eS(e, r, !0);
	else if (r === "auto") {
		var s = Vx(e, e.getLabelModel(), Ix(Fx.determine));
		o = s.labelCategoryInterval, a = B(s.labels, function(e) {
			return e.tick;
		});
	} else o = r, a = eS(e, o, !0);
	return Jx(n, r, {
		ticks: a,
		tickCategoryInterval: o
	});
}
function Ux(e) {
	var t = e.scale.getTicks(), n = _x(e);
	return { labels: B(t, function(t, r) {
		return {
			formattedLabel: n(t, r),
			rawLabel: e.scale.getLabel(t),
			tick: t
		};
	}) };
}
var Wx = Kx("axisTick"), Gx = Kx("axisLabel");
function Kx(e) {
	return function(t) {
		return Px(t)[e] || (Px(t)[e] = { list: [] });
	};
}
function qx(e, t) {
	for (var n = 0; n < e.list.length; n++) if (e.list[n].key === t) return e.list[n].value;
}
function Jx(e, t, n) {
	return e.list.push({
		key: t,
		value: n
	}), n;
}
function Yx(e, t) {
	if (t.kind === Fx.estimate) {
		var n = e.calculateCategoryInterval(t);
		return t.out.noPxChangeTryDetermine.push(function() {
			return Px(e).autoInterval = n, !0;
		}), n;
	}
	return Px(e).autoInterval ?? (Px(e).autoInterval = e.calculateCategoryInterval(t));
}
function Xx(e, t) {
	var n = t.kind, r = $x(e), i = _x(e), a = (r.axisRotate - r.labelRotate) / 180 * Math.PI, o = e.scale, s = o.getExtent(), c = o.count();
	if (s[1] - s[0] < 1) return 0;
	var l = 1, u = 40;
	c > u && (l = Math.max(1, Math.floor(c / u)));
	for (var d = s[0], f = e.dataToCoord(d + 1) - e.dataToCoord(d), p = Math.abs(f * Math.cos(a)), m = Math.abs(f * Math.sin(a)), h = 0, g = 0; d <= s[1]; d += l) {
		var _ = 0, v = 0, y = Br(i({ value: d }), r.font, "center", "top");
		_ = y.width * 1.3, v = y.height * 1.3, h = Math.max(h, _, 7), g = Math.max(g, v, 7);
	}
	var b = h / p, x = g / m;
	isNaN(b) && (b = Infinity), isNaN(x) && (x = Infinity);
	var S = Math.max(0, Math.floor(Math.min(b, x)));
	return n === Fx.estimate ? (t.out.noPxChangeTryDetermine.push(zt(Zx, null, e, S, c)), S) : Qx(e, S, c) ?? S;
}
function Zx(e, t, n) {
	return Qx(e, t, n) == null;
}
function Qx(e, t, n) {
	var r = Nx(e.model), i = e.getExtent(), a = r.lastAutoInterval, o = r.lastTickCount;
	if (a != null && o != null && Math.abs(a - t) <= 1 && Math.abs(o - n) <= 1 && a > t && r.axisExtent0 === i[0] && r.axisExtent1 === i[1]) return a;
	r.lastTickCount = n, r.lastAutoInterval = t, r.axisExtent0 = i[0], r.axisExtent1 = i[1];
}
function $x(e) {
	var t = e.getLabelModel();
	return {
		axisRotate: e.getRotate ? e.getRotate() : e.isHorizontal && !e.isHorizontal() ? 90 : 0,
		labelRotate: t.get("rotate") || 0,
		font: t.getFont()
	};
}
function eS(e, t, n) {
	var r = _x(e), i = e.scale, a = [], o = U(t);
	return Bb(i, o ? 0 : t, function(e, s) {
		var c = i.getLabel(e);
		if (o) {
			var l = !!t(e.value, c);
			if (e.offInterval = !l, !l && !s) return;
		}
		a.push(n ? e : {
			formattedLabel: r(e),
			rawLabel: c,
			tick: e
		});
	}), a;
}
//#endregion
//#region node_modules/echarts/lib/util/cycleCache.js
var tS = ql();
function nS(e) {
	tS(e).prepare = {};
}
function rS(e) {
	tS(e).fullUpdate = {};
}
function iS(e) {
	return tS(e).prepare;
}
function aS(e) {
	return tS(e).fullUpdate;
}
//#endregion
//#region node_modules/echarts/lib/coord/axisStatistics.js
var oS = fu(), sS = ql(), cS = ql(), lS;
process.env.NODE_ENV !== "production" && (lS = function(e) {
	q(e && e.model && e.model.uid && e.model.ecModel);
});
function uS(e, t) {
	var n = e.model, r = sS(aS(n.ecModel)).keyed, i = r && r.get(t);
	return i && i.get(n.uid);
}
function dS(e, t) {
	return process.env.NODE_ENV !== "production" && (q(t != null), lS(e)), mS(uS(e, t));
}
function fS(e, t) {
	process.env.NODE_ENV !== "production" && lS(e);
	var n = [];
	return pS(e.model.ecModel, function(e) {
		for (var r = 0; r < t.length; r++) t[r] && e.serByIdx[t[r].seriesIndex] && n.push(mS(e));
	}), n;
}
function pS(e, t) {
	var n = sS(aS(e)).keyed;
	n && n.each(function(e, n) {
		e.each(function(e, r) {
			t(e, n, r);
		});
	});
}
function mS(e) {
	return { liPosMinGap: e ? e.liPosMinGap : void 0 };
}
function hS(e, t) {
	process.env.NODE_ENV !== "production" && lS(e);
	var n = e.model.ecModel, r = sS(aS(n)).axSer;
	r && _S(n, r.get(e.model.uid), t);
}
function gS(e, t, n) {
	process.env.NODE_ENV !== "production" && (q(t != null), lS(e));
	var r = uS(e, t);
	r && _S(e.model.ecModel, r.sers, n);
}
function _S(e, t, n) {
	if (t) for (var r = 0; r < t.length; r++) {
		var i = t[r];
		e.isSeriesFiltered(i) || n(i);
	}
}
function vS(e, t, n) {
	process.env.NODE_ENV !== "production" && q(t != null);
	var r = sS(aS(e)).keyed, i = r && r.get(t);
	i && i.each(function(e) {
		process.env.NODE_ENV !== "production" && q(e.sers.length > 0), n(e.axis);
	});
}
function yS(e, t) {
	process.env.NODE_ENV !== "production" && lS(e);
	var n = e.model, r = sS(aS(n.ecModel)).keys;
	r && z(r.get(n.uid), function(n) {
		if (process.env.NODE_ENV !== "production") {
			var r = uS(e, n);
			q(r && r.sers.length > 0);
		}
		t(n);
	});
}
function bS(e) {
	var t = cS(iS(e)), n = t.keyed ||= J();
	pS(e, function(t, r, i) {
		var a = n.get(r) || n.set(r, J()), o = a.get(i) || a.set(i, {});
		t.metrics.liPosMinGap && SS.liPosMinGap(e, t, o);
	});
}
function xS(e, t) {
	SS[e] = t;
}
var SS = {};
function CS(e, t, n) {
	if (e) {
		var r = t.ecModel, i = sS(aS(r)), a = e.model.uid;
		if (process.env.NODE_ENV !== "production") {
			lS(e);
			var o = i.axSerPairCheck ||= J(), s = "" + a + "|&" + t.uid;
			q(!o.get(s)), o.set(s, 1);
		}
		var c = i.axSer ||= J(), l = c.get(a) || c.set(a, []);
		if (process.env.NODE_ENV !== "production") {
			var u = l[l.length - 1];
			u && q(u.seriesIndex < t.seriesIndex);
		}
		l.push(t);
		var d = t.subType, f = t.getBaseAxis() === e, p = DS.get(wS(d, f, n)) || DS.get(wS(d, f, null));
		if (p) {
			var m = i.keyed ||= J(), h = i.keys ||= J(), g = p.key, _ = m.get(g) || m.set(g, J()), v = _.get(a);
			v || (v = _.set(a, {
				axis: e,
				sers: [],
				serByIdx: []
			}), v.metrics = p.getMetrics(e), (h.get(a) || h.set(a, [])).push(g)), v.sers.push(t), v.serByIdx[t.seriesIndex] = t;
		}
	}
}
function wS(e, t, n) {
	return e + "|&" + K(t, !0) + "|&" + (n || "");
}
function TS(e, t) {
	var n = wS(t.seriesType, t.baseAxis, t.coordSysType);
	process.env.NODE_ENV !== "production" && (q(t.seriesType && t.key && !ES.get(t.key) && !DS.get(n)), ES.set(t.key, 1)), DS.set(n, t), oS(e, function() {
		e.registerProcessor(e.PRIORITY.PROCESSOR.AXIS_STATISTICS, { overallReset: bS });
	});
}
var ES;
process.env.NODE_ENV !== "production" && (ES = J());
var DS = J(), OS = .8;
function kS(e, t) {
	t ||= {};
	var n = {
		w: NaN,
		w2: NaN
	}, r = e.scale, i = t.fromStat, a = t.min, o = Cb(r);
	dl(o) || (o = NaN);
	var s = e.getExtent(), c = Mc(s[1] - s[0]);
	return Mb(r) ? AS(n, e, o, c) : i ? jS(n, e, o, c, i) : a == null && process.env.NODE_ENV !== "production" && q(!1), a != null && (n.w = dl(n.w) ? jc(a, n.w) : a), n;
}
function AS(e, t, n, r) {
	var i = t.onBand, a = n + +!!i;
	a === 0 && (a = 1), e.w = r / a, !i && n && r && (e.w2 = e.w * n / r);
}
function jS(e, t, n, r, i) {
	process.env.NODE_ENV !== "production" && q(i);
	var a = !1, o = -Infinity;
	z(i.key ? [dS(t, i.key)] : fS(t, i.sers || []), function(e) {
		var t = e.liPosMinGap;
		t != null && (t > 0 ? (t > o && (o = t), a = !1) : t === -2 && (a = !0));
	}), dl(n) && n > 0 && dl(o) ? (e.w = r / n * o, e.w2 = o) : a && (e.w = r * OS, e.w2 = e.w * n / r);
}
//#endregion
//#region node_modules/echarts/lib/coord/Axis.js
var MS = [0, 1], NS = function() {
	function e(e, t, n) {
		this.onBand = !1, this.inverse = !1, this.dim = e, this.scale = t, this._extent = n || [0, 0];
	}
	return e.prototype.contain = function(e) {
		var t = this._extent, n = Math.min(t[0], t[1]), r = Math.max(t[0], t[1]);
		return e >= n && e <= r;
	}, e.prototype.containData = function(e) {
		return this.scale.contain(this.scale.parse(e));
	}, e.prototype.getExtent = function() {
		return this._extent.slice();
	}, e.prototype.setExtent = function(e, t) {
		var n = this._extent;
		n[0] = e, n[1] = t;
	}, e.prototype.dataToCoord = function(e, t) {
		var n = this.scale;
		return e = n.normalize(n.parse(e)), Vc(e, MS, PS(this), t);
	}, e.prototype.coordToData = function(e, t) {
		var n = Vc(e, PS(this), MS, t);
		return this.scale.scale(n);
	}, e.prototype.pointToData = function(e, t) {}, e.prototype.getTicksCoords = function(e) {
		e ||= {};
		var t = e.tickModel || this.getTickModel(), n = B(Rx(this, t, {
			breakTicks: e.breakTicks,
			pruneByBreak: e.pruneByBreak
		}).ticks, function(e) {
			return {
				coord: this.dataToCoord(Ox(this.scale, e)),
				tick: e
			};
		}, this), r = t.get("alignWithLabel"), i = FS(this, n, r);
		return B(n, function(e) {
			return {
				coord: e.coord,
				tickValue: e.tick.value,
				onBand: i
			};
		});
	}, e.prototype.getMinorTicksCoords = function() {
		if (Mb(this.scale)) return [];
		var e = this.model.getModel("minorTick").get("splitNumber");
		return e > 0 && e < 100 || (e = 5), B(this.scale.getMinorTicks(e), function(e) {
			return B(e, function(e) {
				return {
					coord: this.dataToCoord(e),
					tickValue: e
				};
			}, this);
		}, this);
	}, e.prototype.getViewLabels = function(e) {
		return e ||= Ix(Fx.determine), Lx(this, e).labels;
	}, e.prototype.getLabelModel = function() {
		return this.model.getModel("axisLabel");
	}, e.prototype.getTickModel = function() {
		return this.model.getModel("axisTick");
	}, e.prototype.getBandWidth = function() {
		return kS(this, { min: 1 }).w;
	}, e.prototype.calculateCategoryInterval = function(e) {
		return e ||= Ix(Fx.determine), Xx(this, e);
	}, e;
}();
function PS(e) {
	var t = e.getExtent();
	if (e.onBand) {
		var n = (t[1] - t[0]) / e.scale.count() / 2;
		t[0] += n, t[1] -= n;
	}
	return t;
}
function FS(e, t, n) {
	var r = t.length;
	if (!e.onBand || n || !r) return !1;
	var i = kS(e).w;
	if (!i) return !1;
	z(t, function(e) {
		e.coord -= i / 2;
	});
	var a = e.scale.getExtent(), o = t[r - 1];
	return o.tick.offInterval && t.pop(), t.push({
		coord: o.coord + i,
		tick: { value: a[1] + 1 }
	}), !0;
}
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/Axis2D.js
var IS = function(e) {
	I(t, e);
	function t(t, n, r, i, a) {
		var o = e.call(this, t, n, r) || this;
		return o.index = 0, o.type = i || "value", o.position = a || "bottom", o;
	}
	return t.prototype.isHorizontal = function() {
		var e = this.position;
		return e === "top" || e === "bottom";
	}, t.prototype.getGlobalExtent = function(e) {
		var t = this.getExtent();
		return t[0] = this.toGlobalCoord(t[0]), t[1] = this.toGlobalCoord(t[1]), e && t[0] > t[1] && t.reverse(), t;
	}, t.prototype.pointToData = function(e, t) {
		return this.coordToData(this.toLocalCoord(e[this.dim === "x" ? 0 : 1]), t);
	}, t.prototype.setCategorySortInfo = function(e) {
		if (this.type !== "category") return !1;
		this.model.option.categorySortInfo = e, this.scale.setSortInfo(e);
	}, t;
}(NS), LS = [
	"label",
	"labelLine",
	"layoutOption",
	"priority",
	"defaultAttr",
	"marginForce",
	"minMarginForce",
	"marginDefault",
	"suggestIgnore"
], RS = 1, zS = 2, BS = RS | zS;
function VS(e, t, n) {
	n ||= BS, t ? e.dirty |= n : e.dirty &= ~n;
}
function HS(e, t) {
	return t ||= BS, e.dirty == null || !!(e.dirty & t);
}
function US(e) {
	if (e) return HS(e) && WS(e, e.label, e), e;
}
function WS(e, t, n) {
	var r = t.getComputedTransform();
	e.transform = rm(e.transform, r);
	var i = e.localRect = nm(e.localRect, t.getBoundingRect()), a = t.style, o = a.margin, s = n && n.marginForce, c = n && n.minMarginForce, l = n && n.marginDefault, u = a.__marginType;
	u == null && l && (o = l, u = Om.textMargin);
	for (var d = 0; d < 4; d++) GS[d] = u === Om.minMargin && c && c[d] != null ? c[d] : s && s[d] != null ? s[d] : o ? o[d] : 0;
	u === Om.textMargin && Jp(i, GS, !1, !1);
	var f = e.rect = nm(e.rect, i);
	return r && f.applyTransform(r), u === Om.minMargin && Jp(f, GS, !1, !1), e.axisAligned = em(r), (e.label = e.label || {}).ignore = t.ignore, VS(e, !1), VS(e, !0, zS), e;
}
var GS = [
	0,
	0,
	0,
	0
];
function KS(e, t, n) {
	return e.transform = rm(e.transform, n), e.localRect = nm(e.localRect, t), e.rect = nm(e.rect, t), n && e.rect.applyTransform(n), e.axisAligned = em(n), e.obb = void 0, (e.label = e.label || {}).ignore = !1, e;
}
function qS(e, t) {
	if (e) {
		e.label.x += t.x, e.label.y += t.y, e.label.markRedraw();
		var n = e.transform;
		n && (n[4] += t.x, n[5] += t.y);
		var r = e.rect;
		r && (r.x += t.x, r.y += t.y);
		var i = e.obb;
		i && i.fromBoundingRect(e.localRect, n);
	}
}
function JS(e, t) {
	for (var n = 0; n < LS.length; n++) {
		var r = LS[n];
		e[r] ?? (e[r] = t[r]);
	}
	return US(e);
}
function YS(e) {
	var t = e.obb;
	return (!t || HS(e, zS)) && (e.obb = t ||= new ap(), t.fromBoundingRect(e.localRect, e.transform), VS(e, !1, zS)), t;
}
function XS(e) {
	var t = [];
	e.sort(function(e, t) {
		return !!t.suggestIgnore - +!!e.suggestIgnore || t.priority - e.priority;
	});
	function n(e) {
		if (!e.ignore) {
			var t = e.ensureState("emphasis");
			t.ignore ??= !1;
		}
		e.ignore = !0;
	}
	for (var r = 0; r < e.length; r++) {
		var i = US(e[r]);
		if (!i.label.ignore) {
			for (var a = i.label, o = i.labelLine, s = !1, c = 0; c < t.length; c++) if (ZS(i, t[c], null, { touchThreshold: .05 })) {
				s = !0;
				break;
			}
			s ? (n(a), o && n(o)) : t.push(i);
		}
	}
}
function ZS(e, t, n, r) {
	return !e || !t || e.label && e.label.ignore || t.label && t.label.ignore || !e.rect.intersect(t.rect, n, r) ? !1 : e.axisAligned && t.axisAligned ? !0 : YS(e).intersect(YS(t), n, r);
}
//#endregion
//#region node_modules/echarts/lib/component/axis/axisBreakHelper.js
var QS = null;
function $S() {
	return QS;
}
//#endregion
//#region node_modules/echarts/lib/component/axis/axisAction.js
var eC = "expandAxisBreak", tC = Math.PI, nC = [
	[
		1,
		2,
		1,
		2
	],
	[
		5,
		3,
		5,
		3
	],
	[
		8,
		3,
		8,
		3
	]
], rC = [
	[
		0,
		1,
		0,
		1
	],
	[
		0,
		3,
		0,
		3
	],
	[
		0,
		3,
		0,
		3
	]
], iC = ql(), aC = ql(), oC = function() {
	function e(e) {
		this.recordMap = {}, this.resolveAxisNameOverlap = e;
	}
	return e.prototype.ensureRecord = function(e) {
		var t = e.axis.dim, n = e.componentIndex, r = this.recordMap, i = r[t] || (r[t] = []);
		return i[n] || (i[n] = { ready: {} });
	}, e;
}();
function sC(e, t, n, r) {
	var i = n.axis, a = t.ensureRecord(n), o = [], s, c = jC(e.axisName) && Sx(e.nameLocation);
	z(r, function(e) {
		var t = US(e);
		if (!(!t || t.label.ignore)) {
			o.push(t);
			var n = a.transGroup;
			c && (n.transform ? qn(cC, n.transform) : Vn(cC), t.transform && Un(cC, cC, t.transform), X.copy(lC, t.localRect), lC.applyTransform(cC), s ? s.union(lC) : X.copy(s = new X(0, 0, 0, 0), lC));
		}
	});
	var l = Math.abs(a.dirVec.x) > .1 ? "x" : "y", u = a.transGroup[l];
	if (o.sort(function(e, t) {
		return Math.abs(e.label[l] - u) - Math.abs(t.label[l] - u);
	}), c && s) {
		var d = i.getExtent(), f = Math.min(d[0], d[1]), p = Math.max(d[0], d[1]) - f;
		s.union(new X(f, 0, p, 1));
	}
	a.stOccupiedRect = s, a.labelInfoList = o;
}
var cC = Bn(), lC = new X(0, 0, 0, 0), uC = function(e, t, n, r, i, a) {
	if (Sx(e.nameLocation)) {
		var o = a.stOccupiedRect;
		o && dC(KS({}, o, a.transGroup.transform), r, i);
	} else fC(a.labelInfoList, a.dirVec, r, i);
};
function dC(e, t, n) {
	var r = new ur();
	ZS(e, t, r, {
		direction: Math.atan2(n.y, n.x),
		bidirectional: !1,
		touchThreshold: .05
	}) && qS(t, r);
}
function fC(e, t, n, r) {
	for (var i = ur.dot(r, t) >= 0, a = 0, o = e.length; a < o; a++) {
		var s = e[i ? a : o - 1 - a];
		s.label.ignore || dC(s, n, r);
	}
}
var pC = function() {
	function e(e, t, n, r) {
		this.group = new cf(), this._axisModel = e, this._api = t, this._local = {}, this._shared = r || new oC(uC), this._resetCfgDetermined(n);
	}
	return e.prototype.updateCfg = function(e) {
		if (process.env.NODE_ENV !== "production") {
			var t = this._shared.ensureRecord(this._axisModel).ready;
			q(!t.axisLine && !t.axisTickLabelDetermine), t.axisName = t.axisTickLabelEstimate = !1;
		}
		var n = this._cfg.raw;
		n.position = e.position, n.labelOffset = e.labelOffset, this._resetCfgDetermined(n);
	}, e.prototype.__getRawCfg = function() {
		return this._cfg.raw;
	}, e.prototype._resetCfgDetermined = function(e) {
		var t = this._axisModel, n = t.getDefaultOption ? t.getDefaultOption() : {}, r = K(e.axisName, t.get("name")), i = t.get("nameMoveOverlap");
		(i == null || i === "auto") && (i = K(e.defaultNameMoveOverlap, !0));
		var a = {
			raw: e,
			position: e.position,
			rotation: e.rotation,
			nameDirection: K(e.nameDirection, 1),
			tickDirection: K(e.tickDirection, 1),
			labelDirection: K(e.labelDirection, 1),
			labelOffset: K(e.labelOffset, 0),
			silent: K(e.silent, !0),
			axisName: r,
			nameLocation: Xt(t.get("nameLocation"), n.nameLocation, "end"),
			shouldNameMoveOverlap: jC(r) && i,
			optionHideOverlap: t.get(["axisLabel", "hideOverlap"]),
			showMinorTicks: t.get(["minorTick", "show"])
		};
		process.env.NODE_ENV !== "production" && (q(a.position != null), q(a.rotation != null)), this._cfg = a;
		var o = new cf({
			x: a.position[0],
			y: a.position[1],
			rotation: a.rotation
		});
		o.updateTransform(), this._transformGroup = o;
		var s = this._shared.ensureRecord(t);
		s.transGroup = this._transformGroup, s.dirVec = new ur(Math.cos(-a.rotation), Math.sin(-a.rotation));
	}, e.prototype.build = function(e, t) {
		var n = this;
		return e ||= {
			axisLine: !0,
			axisTickLabelEstimate: !1,
			axisTickLabelDetermine: !0,
			axisName: !0
		}, z(mC, function(r) {
			e[r] && hC[r](n._cfg, n._local, n._shared, n._axisModel, n.group, n._transformGroup, n._api, t || {});
		}), this;
	}, e.innerTextLayout = function(e, t, n) {
		var r = $c(t - e), i, a;
		return el(r) ? (a = n > 0 ? "top" : "bottom", i = "center") : el(r - tC) ? (a = n > 0 ? "bottom" : "top", i = "center") : (a = "middle", i = r > 0 && r < tC ? n > 0 ? "right" : "left" : n > 0 ? "left" : "right"), {
			rotation: r,
			textAlign: i,
			textVerticalAlign: a
		};
	}, e.makeAxisEventDataBase = function(e) {
		var t = {
			componentType: e.mainType,
			componentIndex: e.componentIndex
		};
		return t[e.mainType + "Index"] = e.componentIndex, t;
	}, e.isLabelSilent = function(e) {
		var t = e.get("tooltip");
		return e.get("silent") || !(e.get("triggerEvent") || t && t.show);
	}, e;
}(), mC = [
	"axisLine",
	"axisTickLabelEstimate",
	"axisTickLabelDetermine",
	"axisName"
], hC = {
	axisLine: function(e, t, n, r, i, a, o) {
		if (process.env.NODE_ENV !== "production") {
			var s = n.ensureRecord(r).ready;
			q(!s.axisLine), s.axisLine = !0;
		}
		var c = r.get(["axisLine", "show"]);
		if (c === "auto" && (c = !0, e.raw.axisLineAutoShow != null && (c = !!e.raw.axisLineAutoShow)), c) {
			var l = r.axis.getExtent(), u = a.transform, d = [l[0], 0], f = [l[1], 0], p = d[0] > f[0];
			u && (sr(d, d, u), sr(f, f, u));
			var m = R({ lineCap: "round" }, r.getModel(["axisLine", "lineStyle"]).getLineStyle()), h = {
				strokeContainThreshold: e.raw.strokeContainThreshold || 5,
				silent: !0,
				z2: 1,
				style: m
			};
			if (r.get(["axisLine", "breakLine"]) && S_(r.axis.scale)) $S().buildAxisBreakLine(r, i, a, h);
			else {
				var g = new Bf(R({ shape: {
					x1: d[0],
					y1: d[1],
					x2: f[0],
					y2: f[1]
				} }, h));
				Mp(g.shape, g.style.lineWidth), g.anid = "line", i.add(g);
			}
			var _ = r.get(["axisLine", "symbol"]);
			if (_ != null) {
				var v = r.get(["axisLine", "symbolSize"]);
				W(_) && (_ = [_, _]), (W(v) || Ht(v)) && (v = [v, v]);
				var y = qy(r.get(["axisLine", "symbolOffset"]) || 0, v), b = v[0], x = v[1];
				z([{
					rotate: e.rotation + Math.PI / 2,
					offset: y[0],
					r: 0
				}, {
					rotate: e.rotation - Math.PI / 2,
					offset: y[1],
					r: Math.sqrt((d[0] - f[0]) * (d[0] - f[0]) + (d[1] - f[1]) * (d[1] - f[1]))
				}], function(t, n) {
					if (_[n] !== "none" && _[n] != null) {
						var r = Ky(_[n], -b / 2, -x / 2, b, x, m.stroke, !0), a = t.r + t.offset, o = p ? f : d;
						r.attr({
							rotation: t.rotate,
							x: o[0] + a * Math.cos(e.rotation),
							y: o[1] - a * Math.sin(e.rotation),
							silent: !0,
							z2: 11
						}), i.add(r);
					}
				});
			}
		}
	},
	axisTickLabelEstimate: function(e, t, n, r, i, a, o, s) {
		if (process.env.NODE_ENV !== "production") {
			var c = n.ensureRecord(r).ready;
			q(!c.axisTickLabelDetermine), c.axisTickLabelEstimate = !0;
		}
		wC(t, i, s) && gC(e, t, n, r, i, a, o, Fx.estimate);
	},
	axisTickLabelDetermine: function(e, t, n, r, i, a, o, s) {
		if (process.env.NODE_ENV !== "production") {
			var c = n.ensureRecord(r).ready;
			c.axisTickLabelDetermine = !0;
		}
		wC(t, i, s) && gC(e, t, n, r, i, a, o, Fx.determine);
		var l = SC(e, i, a, r);
		yC(e, t.labelLayoutList, l), CC(e, i, a, r, e.tickDirection);
	},
	axisName: function(e, t, n, r, i, a, o, s) {
		var c = n.ensureRecord(r);
		if (process.env.NODE_ENV !== "production") {
			var l = c.ready;
			q(l.axisTickLabelEstimate || l.axisTickLabelDetermine), l.axisName = !0;
		}
		t.nameEl &&= (i.remove(t.nameEl), c.nameLayout = c.nameLocation = null);
		var u = e.axisName;
		if (jC(u)) {
			var d = e.nameLocation, f = e.nameDirection, p = r.getModel("nameTextStyle"), m = r.get("nameGap") || 0, h = r.axis.getExtent(), g = r.axis.inverse ? -1 : 1, _ = new ur(0, 0), v = new ur(0, 0);
			d === "start" ? (_.x = h[0] - g * m, v.x = -g) : d === "end" ? (_.x = h[1] + g * m, v.x = g) : (_.x = (h[0] + h[1]) / 2, _.y = e.labelOffset + f * m, v.y = f);
			var y = Bn();
			v.transform(Gn(y, y, e.rotation));
			var b = r.get("nameRotate");
			b != null && (b = b * tC / 180);
			var x, S;
			Sx(d) ? x = pC.innerTextLayout(e.rotation, b ?? e.rotation, f) : (x = _C(e.rotation, d, b || 0, h), S = e.raw.axisNameAvailableWidth, S != null && (S = Math.abs(S / Math.sin(x.rotation)), !isFinite(S) && (S = null)));
			var C = p.getFont(), w = r.get("nameTruncate", !0) || {}, T = w.ellipsis, E = Yt(e.raw.nameTruncateMaxWidth, w.maxWidth, S), D = s.nameMarginLevel || 0, O = new pc({
				x: _.x,
				y: _.y,
				rotation: x.rotation,
				silent: pC.isLabelSilent(r),
				style: _m(p, {
					text: u,
					font: C,
					overflow: "truncate",
					width: E,
					ellipsis: T,
					fill: p.getTextColor() || r.get([
						"axisLine",
						"lineStyle",
						"color"
					]),
					align: p.get("align") || x.textAlign,
					verticalAlign: p.get("verticalAlign") || x.textVerticalAlign
				}),
				z2: 1
			});
			if (Zp({
				el: O,
				componentModel: r,
				itemName: u
			}), O.__fullText = u, O.anid = "name", r.get("triggerEvent")) {
				var k = pC.makeAxisEventDataBase(r);
				k.targetType = "axisName", k.name = u, bu(O).eventData = k;
			}
			a.add(O), O.updateTransform(), t.nameEl = O;
			var A = c.nameLayout = US({
				label: O,
				priority: O.z2,
				defaultAttr: { ignore: O.ignore },
				marginDefault: Sx(d) ? nC[D] : rC[D]
			});
			if (c.nameLocation = d, i.add(O), O.decomposeTransform(), e.shouldNameMoveOverlap && A) {
				var j = n.ensureRecord(r);
				process.env.NODE_ENV !== "production" && q(j.labelInfoList), n.resolveAxisNameOverlap(e, n, r, A, v, j);
			}
		}
	}
};
function gC(e, t, n, r, i, a, o, s) {
	EC(t) || TC(e, t, i, s, r, o);
	var c = t.labelLayoutList;
	OC(e, r, c, a), NC(r, e.rotation, c);
	var l = e.optionHideOverlap;
	vC(r, c, l), l && XS(It(c, function(e) {
		return e && !e.label.ignore;
	})), sC(e, n, r, c);
}
function _C(e, t, n, r) {
	var i = $c(n - e), a, o, s = r[0] > r[1], c = t === "start" && !s || t !== "start" && s;
	return el(i - tC / 2) ? (o = c ? "bottom" : "top", a = "center") : el(i - tC * 1.5) ? (o = c ? "top" : "bottom", a = "center") : (o = "middle", a = i < tC * 1.5 && i > tC / 2 ? c ? "left" : "right" : c ? "right" : "left"), {
		rotation: i,
		textAlign: a,
		textVerticalAlign: o
	};
}
function vC(e, t, n) {
	var r = e.axis, i = e.get(["axisLabel", "customValues"]);
	if (bx(r)) return;
	function a(e, a, o) {
		var s = US(t[a]), c = US(t[o]), l = r.scale;
		if (!(!s || !c)) {
			if (e == null) {
				if (!n && i) return;
				var u = iC(s.label).labelInfo.tick;
				if (Ab(l) && u.notNice || Mb(l) && u.offInterval) {
					bC(s.label);
					return;
				}
			}
			if (e === !1 || s.suggestIgnore) {
				bC(s.label);
				return;
			}
			if (c.suggestIgnore) {
				bC(c.label);
				return;
			}
			var d = .1;
			if (!n) {
				var f = [
					0,
					0,
					0,
					0
				];
				s = JS({ marginForce: f }, s), c = JS({ marginForce: f }, c);
			}
			ZS(s, c, null, { touchThreshold: d }) && bC(e ? c.label : s.label);
		}
	}
	var o = e.get(["axisLabel", "showMinLabel"]), s = e.get(["axisLabel", "showMaxLabel"]), c = t.length;
	a(o, 0, 1), a(s, c - 1, c - 2);
}
function yC(e, t, n) {
	e.showMinorTicks || z(t, function(e) {
		if (e && e.label.ignore) for (var t = 0; t < n.length; t++) {
			var r = n[t], i = aC(r), a = iC(e.label);
			if (i.tickValue != null && !i.onBand && i.tickValue === a.labelInfo.tick.value) {
				bC(r);
				return;
			}
		}
	});
}
function bC(e) {
	e && (e.ignore = !0);
}
function xC(e, t, n, r, i) {
	for (var a = [], o = [], s = [], c = 0; c < e.length; c++) {
		var l = e[c].coord;
		o[0] = l, o[1] = 0, s[0] = l, s[1] = n, t && (sr(o, o, t), sr(s, s, t));
		var u = new Bf({
			shape: {
				x1: o[0],
				y1: o[1],
				x2: s[0],
				y2: s[1]
			},
			style: r,
			z2: 2,
			autoBatch: !0,
			silent: !0
		});
		Mp(u.shape, u.style.lineWidth), u.anid = i + "_" + e[c].tickValue, a.push(u);
		var d = aC(u);
		d.onBand = !!e[c].onBand, d.tickValue = e[c].tickValue;
	}
	return a;
}
function SC(e, t, n, r) {
	var i = r.axis, a = r.getModel("axisTick"), o = a.get("show");
	if (o === "auto" && (o = !0, e.raw.axisTickAutoShow != null && (o = !!e.raw.axisTickAutoShow)), !o || i.scale.isBlank()) return [];
	for (var s = a.getModel("lineStyle"), c = e.tickDirection * a.get("length"), l = xC(i.getTicksCoords(), n.transform, c, At(s.getLineStyle(), { stroke: r.get([
		"axisLine",
		"lineStyle",
		"color"
	]) }), "ticks"), u = 0; u < l.length; u++) t.add(l[u]);
	return l;
}
function CC(e, t, n, r, i) {
	var a = r.axis, o = r.getModel("minorTick");
	if (!(!e.showMinorTicks || a.scale.isBlank())) {
		var s = a.getMinorTicksCoords();
		if (s.length) for (var c = o.getModel("lineStyle"), l = i * o.get("length"), u = At(c.getLineStyle(), At(r.getModel("axisTick").getLineStyle(), { stroke: r.get([
			"axisLine",
			"lineStyle",
			"color"
		]) })), d = 0; d < s.length; d++) for (var f = xC(s[d], n.transform, l, u, "minorticks_" + d), p = 0; p < f.length; p++) t.add(f[p]);
	}
}
function wC(e, t, n) {
	if (EC(e)) {
		var r = e.axisLabelsCreationContext;
		process.env.NODE_ENV !== "production" && q(e.labelGroup && r);
		var i = r.out.noPxChangeTryDetermine;
		if (n.noPxChange) {
			for (var a = !0, o = 0; o < i.length; o++) a &&= i[o]();
			if (a) return !1;
		}
		i.length && (t.remove(e.labelGroup), DC(e, null, null, null));
	}
	return !0;
}
function TC(e, t, n, r, i, a) {
	var o = i.axis, s = Yt(e.raw.axisLabelShow, i.get(["axisLabel", "show"])), c = new cf();
	n.add(c);
	var l = Ix(r);
	if (!s || o.scale.isBlank()) {
		DC(t, [], c, l);
		return;
	}
	var u = i.getModel("axisLabel"), d = o.getViewLabels(l), f = (Yt(e.raw.labelRotate, u.get("rotate")) || 0) * tC / 180, p = pC.innerTextLayout(e.rotation, f, e.labelDirection), m = i.getCategories && i.getCategories(!0), h = [], g = i.get("triggerEvent"), _ = Infinity, v = -Infinity;
	z(d, function(e, t) {
		var n = e.tick, r = e.formattedLabel, s = e.rawLabel, l = u, f = Ox(o.scale, n);
		if (m && m[f]) {
			var y = m[f];
			G(y) && y.textStyle && (l = new zm(y.textStyle, u, i.ecModel));
		}
		var b = l.getTextColor() || i.get([
			"axisLine",
			"lineStyle",
			"color"
		]), x = l.getShallow("align", !0) || p.textAlign, S = K(l.getShallow("alignMinLabel", !0), x), C = K(l.getShallow("alignMaxLabel", !0), x), w = l.getShallow("verticalAlign", !0) || l.getShallow("baseline", !0) || p.textVerticalAlign, T = K(l.getShallow("verticalAlignMinLabel", !0), w), E = K(l.getShallow("verticalAlignMaxLabel", !0), w), D = 10 + (n.time?.level || 0);
		_ = Math.min(_, D), v = Math.max(v, D);
		var O = new pc({
			x: 0,
			y: 0,
			rotation: 0,
			silent: pC.isLabelSilent(i),
			z2: D,
			style: _m(l, {
				text: r,
				align: t === 0 ? S : t === d.length - 1 ? C : x,
				verticalAlign: t === 0 ? T : t === d.length - 1 ? E : w,
				fill: U(b) ? b(o.type === "category" ? s : o.type === "value" ? f + "" : f, t) : b
			})
		});
		O.anid = "label_" + f;
		var k = iC(O);
		if (k.labelInfo = e, k.layoutRotation = p.rotation, Zp({
			el: O,
			componentModel: i,
			itemName: r,
			formatterParamsExtra: {
				isTruncated: function() {
					return O.isTruncated;
				},
				value: s,
				tickIndex: t
			}
		}), g) {
			var A = pC.makeAxisEventDataBase(i);
			A.targetType = "axisLabel", A.value = s, A.tickIndex = t;
			var j = e.tick.break;
			if (j) {
				var ee = j.parsedBreak;
				A.break = {
					start: ee.vmin,
					end: ee.vmax
				};
			}
			o.type === "category" && (A.dataIndex = f), bu(O).eventData = A, j && MC(i, a, O, j);
		}
		h.push(O), c.add(O);
	}), DC(t, B(h, function(e) {
		return {
			label: e,
			priority: iC(e).labelInfo.tick.break ? e.z2 + (v - _ + 1) : e.z2,
			defaultAttr: { ignore: e.ignore }
		};
	}), c, l);
}
function EC(e) {
	return !!e.labelLayoutList;
}
function DC(e, t, n, r) {
	e.labelLayoutList = t, e.labelGroup = n, e.axisLabelsCreationContext = r;
}
function OC(e, t, n, r) {
	var i = t.get(["axisLabel", "margin"]);
	z(n, function(n, a) {
		var o = US(n);
		if (o) {
			var s = o.label, c = iC(s);
			o.suggestIgnore = s.ignore, s.ignore = !1, wi(kC, AC);
			var l = t.axis;
			kC.x = l.dataToCoord(Ox(l.scale, c.labelInfo.tick)), kC.y = e.labelOffset + e.labelDirection * i, kC.rotation = c.layoutRotation, r.add(kC), kC.updateTransform(), r.remove(kC), kC.decomposeTransform(), wi(s, kC), s.markRedraw(), VS(o, !0), US(o);
		}
	});
}
var kC = new cc(), AC = new cc();
function jC(e) {
	return !!e;
}
function MC(e, t, n, r) {
	n.on("click", function(n) {
		var i = {
			type: eC,
			breaks: [{
				start: r.parsedBreak.breakOption.start,
				end: r.parsedBreak.breakOption.end
			}]
		};
		i[e.axis.dim + "AxisIndex"] = e.componentIndex, t.dispatchAction(i);
	});
}
function NC(e, t, n) {
	var r = y_();
	if (r) {
		var i = r.retrieveAxisBreakPairs(n, function(e) {
			return e && iC(e.label).labelInfo.tick.break;
		}, !0), a = e.get(["breakLabelLayout", "moveOverlap"], !0);
		(a === !0 || a === "auto") && z(i, function(r) {
			$S().adjustBreakLabelPair(e.axis.inverse, t, [US(n[r[0]]), US(n[r[1]])]);
		});
	}
}
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/cartesianAxisHelper.js
function PC(e, t, n) {
	n ||= {};
	var r = t.axis, i = {}, a = r.getAxesOnZeroOf()[0], o = r.position, s = a ? "onZero" : o, c = r.dim, l = [
		e.x,
		e.x + e.width,
		e.y,
		e.y + e.height
	], u = {
		left: 0,
		right: 1,
		top: 0,
		bottom: 1,
		onZero: 2
	}, d = t.get("offset") || 0, f = c === "x" ? [l[2] - d, l[3] + d] : [l[0] - d, l[1] + d];
	if (a) {
		var p = a.toGlobalCoord(a.dataToCoord(0));
		f[u.onZero] = Math.max(Math.min(p, f[1]), f[0]);
	}
	i.position = [c === "y" ? f[u[s]] : l[0], c === "x" ? f[u[s]] : l[3]], i.rotation = Math.PI / 2 * (c === "x" ? 0 : 1), i.labelDirection = i.tickDirection = i.nameDirection = {
		top: -1,
		bottom: 1,
		left: -1,
		right: 1
	}[o], i.labelOffset = a ? f[u[o]] - f[u.onZero] : 0, t.get(["axisTick", "inside"]) && (i.tickDirection = -i.tickDirection), Yt(n.labelInside, t.get(["axisLabel", "inside"])) && (i.labelDirection = -i.labelDirection);
	var m = t.get(["axisLabel", "rotate"]);
	return i.labelRotate = s === "top" ? -m : m, i.z2 = 1, i;
}
function FC(e) {
	return e.coordinateSystem && e.coordinateSystem.type === "cartesian2d";
}
function IC(e) {
	var t = {
		xAxisModel: null,
		yAxisModel: null
	};
	return z(t, function(n, r) {
		var i = r.replace(/Model$/, ""), a = e.getReferringComponents(i, Zl).models[0];
		if (process.env.NODE_ENV !== "production" && !a) throw Error(i + " \"" + Xt(e.get(i + "Index"), e.get(i + "Id"), 0) + "\" not found");
		t[r] = a;
	}), t;
}
function LC(e, t, n, r, i, a) {
	for (var o = PC(e, n), s = !1, c = !1, l = 0; l < t.length; l++) Ob(t[l].getOtherAxis(n.axis).scale) && (s = c = !0, n.axis.type === "category" && n.axis.onBand && (c = !1));
	return o.axisLineAutoShow = s, o.axisTickAutoShow = c, o.defaultNameMoveOverlap = a, new pC(n, r, o, i);
}
function RC(e, t, n) {
	var r = PC(t, n);
	if (process.env.NODE_ENV !== "production") {
		var i = e.__getRawCfg();
		z(V(r), function(e) {
			e !== "position" && e !== "labelOffset" && q(r[e] === i[e]);
		});
	}
	e.updateCfg(r);
}
//#endregion
//#region node_modules/echarts/lib/coord/scaleRawExtentInfo.js
var zC = ql(), BC = 3, VC = function() {
	function e(e, t, n, r, i) {
		var a = Mb(e), o = a ? t.getCategories().length : null, s;
		if (a) {
			var c = t.getCategories(!0);
			s = c && !c.length;
		}
		var l = n.slice();
		(kb(e) || jb(e) || Ab(e)) && (au(l, UC(e, t.get("dataMin", !0))), ou(l, UC(e, t.get("dataMax", !0)))), uu(l) || (l[0] = l[1] = NaN);
		var u = [], d = [!1, !1], f = t.get("min", !0);
		f === "dataMin" ? (u[0] = l[0], d[0] = !0) : (u[0] = UC(e, U(f) ? f({
			min: l[0],
			max: l[1]
		}) : f), d[0] = u[0] != null);
		var p = t.get("max", !0);
		p === "dataMax" ? (u[1] = l[1], d[1] = !0) : (u[1] = UC(e, U(p) ? p({
			min: l[0],
			max: l[1]
		}) : p), d[1] = u[1] != null);
		var m = WC(e, t), h = a ? null : l[1] - l[0] || Math.abs(l[0]);
		u[0] ??= a ? s ? l[0] : o ? 0 : NaN : l[0] - m[0] * h, u[1] ??= a ? s ? l[1] : o ? o - 1 : NaN : l[1] + m[1] * h, !cu(u[0]) && (u[0] = NaN), !cu(u[1]) && (u[1] = NaN);
		var g = s || Jt(u[0]) || Jt(u[1]) || a && !o, _ = kb(e), v = _ && t.needIncludeZero && t.needIncludeZero();
		v && (u[0] > 0 && u[1] > 0 && !d[0] && (u[0] = 0), u[0] < 0 && u[1] < 0 && !d[1] && (u[1] = 0));
		var y = !1;
		u[0] > u[1] && (u.reverse(), y = !0);
		var b = UC(e, t.get("startValue", !0)), x = b != null;
		!dl(b) && r && (b = e.getDefaultStartValue ? e.getDefaultStartValue() : 0), dl(b) && (x || !_ || v) && (b < u[0] && !d[0] ? (u[0] = b, d[0] = !0) : b > u[1] && !d[1] && (u[1] = b, d[1] = !0)), HC(this._i = {
			scale: e,
			dataMM: l,
			noZoomEffMM: u,
			zoomMM: [],
			fixMM: d,
			zoomFixMM: [!1, !1],
			startValue: b,
			isBlank: g,
			incl0: v,
			tggAxInv: y,
			ctnShp: i
		}, u);
	}
	return e.prototype.makeNoZoom = function() {
		return this._i.noZoomEffMM.slice();
	}, e.prototype.makeFinal = function() {
		var e = this._i, t = e.zoomMM, n = e.noZoomEffMM, r = e.zoomFixMM, i = e.fixMM, a = {
			fixMM: i,
			zoomFixMM: r,
			isBlank: e.isBlank,
			incl0: e.incl0,
			tggAxInv: e.tggAxInv,
			ctnShp: e.ctnShp,
			effMM: n.slice()
		}, o = a.effMM;
		return t[0] != null && (o[0] = t[0], i[0] = r[0] = !0), t[1] != null && (o[1] = t[1], i[1] = r[1] = !0), HC(e, o), a;
	}, e.prototype.makeRenderInfo = function() {
		return { startValue: this._i.startValue };
	}, e.prototype.setZoomMM = function(e, t) {
		this._i.zoomMM[e] = t;
	}, e;
}();
function HC(e, t) {
	var n = e.scale, r = e.dataMM;
	n.sanitize && (t[0] = n.sanitize(t[0], r), t[1] = n.sanitize(t[1], r), du(t));
}
function UC(e, t) {
	return t == null ? null : Jt(t) ? NaN : e.parse(t);
}
function WC(e, t) {
	var n;
	if (Mb(e)) n = [0, 0];
	else {
		var r = t.get("boundaryGap");
		typeof r == "boolean" && (process.env.NODE_ENV !== "production" && r === !0 && console.warn("Boolean type for boundaryGap is only allowed for ordinal axis. Please use string in percentage instead, e.g., \"20%\". Currently, boundaryGap is set to 0."), r = null), n = H(r) ? r : [r, r];
	}
	return [GC(n[0]), GC(n[1])];
}
function GC(e) {
	return Wr(typeof e == "boolean" ? 0 : e, 1) || 0;
}
function KC(e) {
	var t = zC(e.scale);
	return t.extent ||= ru(), t;
}
function qC(e, t) {
	KC(e).dimIdxInCoord = t.get(e.dim);
}
function JC(e, t) {
	var n = e.scale, r = e.model, i = e.dim;
	if (process.env.NODE_ENV !== "production" && q(n && r && i), n.rawExtentInfo) {
		process.env.NODE_ENV !== "production" && q(n.rawExtentInfo.from !== t || t === 2);
		return;
	}
	YC(n, e, i, r, t);
}
function YC(e, t, n, r, i) {
	var a = KC(t), o = a.extent, s = !1;
	hS(t, function(r) {
		if (r.boxCoordinateSystem) {
			var i = Tg(r).coord, c = a.dimIdxInCoord;
			if (!(c >= 0)) process.env.NODE_ENV !== "production" && vl("Property \"series.coord\" is not supported on axis " + r.boxCoordinateSystem.type + ".");
			else if (H(i)) {
				var l = i[c];
				l != null && !H(l) && iu(o, e.parse(l));
			}
		} else if (r.coordinateSystem) {
			var u = r.getData();
			if (u) {
				var d = e.getFilter ? e.getFilter() : null;
				z(xx(u, n), function(e) {
					su(o, u.getApproximateExtent(e, d));
				});
			}
			r.__requireStartValue && r.__requireStartValue(t) && (s = !0);
		}
	});
	var c = tw(e, t, r);
	ZC(e, new VC(e, r, o, s, c), i), a.extent = null;
}
function XC(e, t) {
	var n = e.scale;
	process.env.NODE_ENV !== "production" && q(!n.rawExtentInfo), ZC(n, new VC(n, e.model, t, !1, !1), BC);
}
function ZC(e, t, n) {
	e.rawExtentInfo = t, t.from = n;
}
function QC(e, t) {
	process.env.NODE_ENV !== "production" && q(!$C.get(e)), $C.set(e, t);
}
var $C = J();
function ew(e, t, n, r, i) {
	process.env.NODE_ENV !== "production" && q(!i || !e.rawExtentInfo), e.rawExtentInfo || XC({
		scale: e,
		model: t
	}, i || ru());
	var a = e.rawExtentInfo.makeFinal(), o = a.effMM;
	return e.setExtent(o[0], o[1]), e.setBlank(a.isBlank), r && a.tggAxInv && n && !n.get("legacyMinMaxDontInverseAxis") && (r.inverse = !r.inverse), a;
}
function tw(e, t, n) {
	var r = kx(e, n), i = n.get("containShape", !0);
	if (i == null && !r && (i = !0), !i) return !1;
	var a = !1;
	return yS(t, function(e) {
		a = !!$C.get(e) || a;
	}), a;
}
function nw(e, t, n, r) {
	if (n.ctnShp) {
		var i;
		if (yS(e, function(t) {
			var n = $C.get(t);
			if (n) {
				var a = n(e, r);
				a && (i ||= [0, 0], au(i, a[0]), ou(i, a[1]), hx(e));
			}
		}), i) {
			var a = t.getExtent();
			if (Mb(t)) e.onBand || t.setExtent2(1, Ac(a[0], a[0] + i[0]), jc(a[1], a[1] + i[1]));
			else {
				var o = a.slice();
				n.zoomFixMM[0] || (o[0] = Ac(o[0], t.transformOut(t.transformIn(o[0], null) + i[0], null))), n.zoomFixMM[1] || (o[1] = jc(o[1], t.transformOut(t.transformIn(o[1], null) + i[1], null))), (o[0] < a[0] || o[1] > a[1]) && t.setExtent2(1, o[0], o[1]);
			}
		}
	}
}
//#endregion
//#region node_modules/echarts/lib/coord/axisStatisticsMetricsImpl.js
function rw() {
	xS("liPosMinGap", iw);
}
function iw(e, t, n) {
	var r = J(), i = n.serUids, a = n.liPosMinGap, o, s = t.axis, c = s.scale, l = c.needTransform(), u = c.getFilter ? c.getFilter() : null, d = Lh(u);
	function f(n) {
		_S(e, t.sers, function(e) {
			var t = e.getRawData(), r = t.getDimensionIndex(t.mapDimension(s.dim));
			r >= 0 && n(r, e, t.getStore());
		});
	}
	var p = 0;
	if (f(function(e, t, n) {
		r.set(t.uid, 1), (!i || !i.hasKey(t.uid)) && (o = !0), p += n.count();
	}), (!i || i.keys().length !== r.keys().length) && (o = !0), !o && a != null) {
		t.liPosMinGap = a;
		return;
	}
	$y(aw, p);
	var m = 0;
	f(function(e, t, n) {
		for (var r = 0, i = n.count(); r < i; ++r) {
			var a = n.get(e, r);
			isFinite(a) && (!u || Rh(d, a)) && (l && (a = c.transformIn(a, null)), aw.arr[m++] = a);
		}
	});
	var h = aw.typed ? aw.arr.subarray(0, m) : (aw.arr.length = m, aw.arr);
	aw.typed ? h.sort() : qc(h);
	for (var g = Infinity, _ = 1; _ < m; ++_) {
		var v = h[_] - h[_ - 1];
		v > 0 && v < g && (g = v);
	}
	n.liPosMinGap = t.liPosMinGap = dl(g) ? g : m > 0 ? -2 : -1, n.serUids = r;
}
var aw = $y({ ctor: Zy }, 50);
//#endregion
//#region node_modules/echarts/lib/chart/helper/axisSnippets.js
function ow(e) {
	return function(t, n) {
		var r = kS(t, { fromStat: { key: e } });
		if (dl(r.w2)) return [-r.w2 / 2, r.w2 / 2];
	};
}
function sw(e, t) {
	return e + "|&" + t;
}
function cw(e) {
	return rw(), { liPosMinGap: !Mb(e.scale) };
}
//#endregion
//#region node_modules/echarts/lib/layout/barCommon.js
function lw(e, t, n, r) {
	TS(e, {
		key: t,
		seriesType: n,
		coordSysType: r,
		getMetrics: cw
	});
}
function uw(e) {
	var t = e.scale.rawExtentInfo.makeRenderInfo().startValue;
	return process.env.NODE_ENV !== "production" && q(dl(t)), t;
}
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/GridModel.js
var dw = {
	left: 0,
	right: 0,
	top: 0,
	bottom: 0
}, fw = ["25%", "25%"], pw = "cartesian2d", mw = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.mergeDefaultAndTheme = function(t, n) {
		var r = Tv(t.outerBounds);
		e.prototype.mergeDefaultAndTheme.apply(this, arguments), r && t.outerBounds && wv(t.outerBounds, r);
	}, t.prototype.mergeOption = function(t, n) {
		e.prototype.mergeOption.apply(this, arguments), this.option.outerBounds && t.outerBounds && wv(this.option.outerBounds, t.outerBounds);
	}, t.type = "grid", t.dependencies = ["xAxis", "yAxis"], t.layoutMode = "box", t.defaultOption = {
		show: !1,
		z: 0,
		left: "15%",
		top: 65,
		right: "10%",
		bottom: 80,
		containLabel: !1,
		outerBoundsMode: "auto",
		outerBounds: dw,
		outerBoundsContain: "all",
		outerBoundsClampWidth: fw[0],
		outerBoundsClampHeight: fw[1],
		backgroundColor: Z.color.transparent,
		borderWidth: 1,
		borderColor: Z.color.neutral30
	}, t;
}(Ov), hw = fu(), gw = "__ec_stack_";
function _w(e) {
	return e.get("stack") || gw + e.seriesIndex;
}
function vw(e, t) {
	var n = yw(e, t);
	return n.columnMap = bw(n), n;
}
function yw(e, t) {
	var n = sw(t, pw), r = [], i = kS(e, {
		fromStat: { key: n },
		min: 1
	});
	return gS(e, n, function(e) {
		r.push({
			barWidth: Hc(e.get("barWidth"), i.w),
			barMaxWidth: Hc(e.get("barMaxWidth"), i.w),
			barMinWidth: Hc(e.get("barMinWidth") || (Cw(e) ? .5 : 1), i.w),
			barGap: e.get("barGap"),
			barCategoryGap: e.get("barCategoryGap"),
			defaultBarGap: e.get("defaultBarGap"),
			stackId: _w(e)
		});
	}), {
		bandWidthResult: i,
		seriesInfo: r
	};
}
function bw(e) {
	var t = e.bandWidthResult.w, n = t, r = 0, i, a, o = [], s = {};
	z(e.seriesInfo, function(e, t) {
		t || (a = e.defaultBarGap || 0);
		var c = e.stackId;
		un(s, c) || r++;
		var l = s[c];
		l || (l = s[c] = {
			width: 0,
			maxWidth: 0
		}, o.push(c));
		var u = e.barWidth;
		u && !l.width && (l.width = u, u = Ac(n, u), n -= u);
		var d = e.barMaxWidth;
		d && (l.maxWidth = d);
		var f = e.barMinWidth;
		f && (l.minWidth = f);
		var p = e.barGap;
		p != null && (a = p);
		var m = e.barCategoryGap;
		m != null && (i = m);
	}), i ??= jc(35 - o.length * 4, 15) + "%";
	var c = Hc(i, t), l = Hc(a, 1), u = (n - c) / (r + (r - 1) * l);
	u = jc(u, 0), z(o, function(e) {
		var t = s[e], i = t.maxWidth, a = t.minWidth;
		if (t.width) {
			var o = t.width;
			i && (o = Ac(o, i)), a && (o = jc(o, a)), t.width = o, n -= o + l * o, r--;
		} else {
			var o = u;
			i && i < o && (o = Ac(i, n)), a && a > o && (o = a), o !== u && (t.width = o, n -= o + l * o, r--);
		}
	}), u = (n - c) / (r + (r - 1) * l), u = jc(u, 0);
	var d = 0, f;
	z(o, function(e) {
		var t = s[e];
		t.width ||= u, f = t, d += t.width * (1 + l);
	}), f && (d -= f.width * l);
	var p = {}, m = -d / 2;
	return z(o, function(e) {
		var n = s[e];
		p[e] = p[e] || {
			bandWidth: t,
			offset: m,
			width: n.width
		}, m += n.width * (1 + l);
	}), p;
}
function xw(e) {
	return {
		seriesType: e,
		overallReset: function(t) {
			var n = sw(e, pw);
			vS(t, n, function(t) {
				process.env.NODE_ENV !== "production" && q(t instanceof IS);
				var r = vw(t, e);
				gS(t, n, function(e) {
					var t = r.columnMap[_w(e)];
					e.getData().setLayout({
						bandWidth: t.bandWidth,
						offset: t.offset,
						size: t.width
					});
				});
			});
		}
	};
}
function Sw(e) {
	return {
		seriesType: e,
		plan: eb(),
		reset: function(e) {
			if (FC(e)) {
				var t = e.getData(), n = e.coordinateSystem, r = n.getBaseAxis(), i = n.getOtherAxis(r), a = t.getDimensionIndex(t.mapDimension(i.dim)), o = t.getDimensionIndex(t.mapDimension(r.dim)), s = e.get("showBackground", !0), c = t.mapDimension(i.dim), l = t.getCalculationInfo("stackResultDimension"), u = Pg(t, c) && !!t.getCalculationInfo("stackedOnSeries"), d = i.isHorizontal(), f = i.toGlobalCoord(i.dataToCoord(uw(i))), p = Cw(e), m = e.get("barMinHeight") || 0, h = l && t.getDimensionIndex(l), g = t.getLayout("size"), _ = t.getLayout("offset");
				return { progress: function(e, t) {
					for (var r = e.count, i = p && Qy(r * 3), c = p && s && Qy(r * 3), l = p && Qy(r), v = n.master.getRect(), y = d ? v.width : v.height, b, x = t.getStore(), S = 0; (b = e.next()) != null;) {
						var C = x.get(u ? h : a, b), w = x.get(o, b), T = f, E = void 0;
						u && (E = +C - x.get(a, b));
						var D = void 0, O = void 0, k = void 0, A = void 0;
						if (d) {
							var j = n.dataToPoint([C, w]);
							u && (T = n.dataToPoint([E, w])[0]), D = T, O = j[1] + _, k = j[0] - T, A = g, Mc(k) < m && (k = (k < 0 ? -1 : 1) * m);
						} else {
							var j = n.dataToPoint([w, C]);
							u && (T = n.dataToPoint([w, E])[1]), D = j[0] + _, O = T, k = g, A = j[1] - T, Mc(A) < m && (A = (A <= 0 ? -1 : 1) * m);
						}
						p ? (i[S] = D, i[S + 1] = O, i[S + 2] = d ? k : A, c && (c[S] = d ? v.x : D, c[S + 1] = d ? O : v.y, c[S + 2] = y), l[b] = b) : t.setItemLayout(b, {
							x: D,
							y: O,
							width: k,
							height: A
						}), S += 3;
					}
					p && t.setLayout({
						largePoints: i,
						largeDataIndices: l,
						largeBackgroundPoints: c,
						valueAxisHorizontal: d
					});
				} };
			}
		}
	};
}
function Cw(e) {
	return e.pipelineContext && e.pipelineContext.large;
}
function ww(e) {
	return ow(sw(e, pw));
}
function Tw(e) {
	hw(e, function() {
		function t(t) {
			var n = sw(t, pw);
			lw(e, n, t, pw), QC(n, ww(t));
		}
		t("bar"), t("pictorialBar");
	});
}
//#endregion
//#region node_modules/echarts/lib/chart/bar/BaseBarSeries.js
var Ew = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.getInitialData = function(e, t) {
		return Rg(null, this, { useEncodeDefaulter: !0 });
	}, t.prototype.getMarkerPosition = function(e, t, n) {
		var r = this.coordinateSystem;
		if (r && r.clampData) {
			var i = r.clampData(e), a = r.dataToPoint(i);
			if (n) z(r.getAxes(), function(e, n) {
				if (e.type === "category" && t != null) {
					var r = e.getTicksCoords(), o = e.getTickModel().get("alignWithLabel"), s = i[n], c = t[n] === "x1" || t[n] === "y1";
					if (c && !o && (s += 1), r.length < 2) return;
					if (r.length === 2) {
						a[n] = e.toGlobalCoord(e.getExtent()[+!!c]);
						return;
					}
					for (var l = void 0, u = void 0, d = 1, f = 0; f < r.length; f++) {
						var p = r[f].coord, m = f === r.length - 1 ? r[f - 1].tickValue + d : r[f].tickValue;
						if (m === s) {
							u = p;
							break;
						} else if (m < s) l = p;
						else if (l != null && m > s) {
							u = (p + l) / 2;
							break;
						}
						f === 1 && (d = m - r[0].tickValue);
					}
					u ?? (l ? l && (u = r[r.length - 1].coord) : u = r[0].coord), a[n] = e.toGlobalCoord(u);
				}
			});
			else {
				var o = this.getData(), s = o.getLayout("offset"), c = o.getLayout("size"), l = +!r.getBaseAxis().isHorizontal();
				a[l] += s + c / 2;
			}
			return a;
		}
		return [NaN, NaN];
	}, t.prototype.__requireStartValue = function(e) {
		return this.getBaseAxis() !== e;
	}, t.type = "series.__base_bar__", t.defaultOption = {
		z: 2,
		coordinateSystem: "cartesian2d",
		legendHoverLink: !0,
		barMinHeight: 0,
		barMinAngle: 0,
		large: !1,
		largeThreshold: 400,
		progressive: 3e3,
		progressiveChunkMode: "mod",
		defaultBarGap: "10%"
	}, t;
}(jy);
jy.registerClass(Ew);
//#endregion
//#region node_modules/echarts/lib/chart/bar/BarSeries.js
var Dw = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.getInitialData = function() {
		return Rg(null, this, {
			useEncodeDefaulter: !0,
			createInvertedIndices: !!this.get("realtimeSort", !0) || null
		});
	}, t.prototype.getProgressive = function() {
		return this.get("large") ? this.get("progressive") : !1;
	}, t.prototype.__preparePipelineContext = function(e, t) {
		var n = vu(this, e, t);
		return n.progressiveRender && (n.large = !0), n;
	}, t.prototype.brushSelector = function(e, t, n) {
		return n.rect(t.getItemLayout(e));
	}, t.type = "series.bar", t.dependencies = ["grid", "polar"], t.defaultOption = Gg(Ew.defaultOption, {
		clip: !0,
		roundCap: !1,
		showBackground: !1,
		backgroundStyle: {
			color: "rgba(180, 180, 180, 0.2)",
			borderColor: null,
			borderWidth: 0,
			borderType: "solid",
			borderRadius: 0,
			shadowBlur: 0,
			shadowColor: null,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			opacity: 1
		},
		select: { itemStyle: {
			borderColor: Z.color.primary,
			borderWidth: 2
		} },
		realtimeSort: !1
	}), t;
}(Ew), Ow = "\0__throttleOriginMethod", kw = "\0__throttleRate", Aw = "\0__throttleType";
function jw(e, t, n) {
	var r, i = 0, a = 0, o = null, s, c, l, u;
	t ||= 0;
	function d() {
		a = (/* @__PURE__ */ new Date()).getTime(), o = null, e.apply(c, l || []);
	}
	var f = function() {
		var e = [...arguments];
		r = (/* @__PURE__ */ new Date()).getTime(), c = this, l = e;
		var f = u || t, p = u || n;
		u = null, s = r - (p ? i : a) - f, clearTimeout(o), p ? o = setTimeout(d, f) : s >= 0 ? d() : o = setTimeout(d, -s), i = r;
	};
	return f.clear = function() {
		o &&= (clearTimeout(o), null);
	}, f.debounceNextCall = function(e) {
		u = e;
	}, f;
}
function Mw(e, t, n, r) {
	var i = e[t];
	if (i) {
		var a = i[Ow] || i, o = i[Aw];
		if (i[kw] !== n || o !== r) {
			if (n == null || !r) return e[t] = a;
			i = e[t] = jw(a, n, r === "debounce"), i[Ow] = a, i[Aw] = r, i[kw] = n;
		}
		return i;
	}
}
function Nw(e, t) {
	var n = e[t];
	n && n[Ow] && (n.clear && n.clear(), e[t] = n[Ow]);
}
//#endregion
//#region node_modules/echarts/lib/util/shape/sausage.js
var Pw = function() {
	function e() {
		this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
	}
	return e;
}(), Fw = function(e) {
	I(t, e);
	function t(t) {
		var n = e.call(this, t) || this;
		return n.type = "sausage", n;
	}
	return t.prototype.getDefaultShape = function() {
		return new Pw();
	}, t.prototype.buildPath = function(e, t) {
		var n = t.cx, r = t.cy, i = Math.max(t.r0 || 0, 0), a = Math.max(t.r, 0), o = (a - i) * .5, s = i + o, c = t.startAngle, l = t.endAngle, u = t.clockwise, d = Math.PI * 2, f = u ? l - c < d : c - l < d;
		f || (c = l - (u ? d : -d));
		var p = Math.cos(c), m = Math.sin(c), h = Math.cos(l), g = Math.sin(l);
		f ? (e.moveTo(p * i + n, m * i + r), e.arc(p * s + n, m * s + r, o, -Math.PI + c, c, !u)) : e.moveTo(p * a + n, m * a + r), e.arc(n, r, a, c, l, !u), e.arc(h * s + n, g * s + r, o, l - Math.PI * 2, l - Math.PI, !u), i !== 0 && e.arc(n, r, i, l, c, u);
	}, t;
}(Js);
//#endregion
//#region node_modules/echarts/lib/label/sectorLabel.js
function Iw(e, t) {
	t ||= {};
	var n = t.isRoundCap;
	return function(t, r, i) {
		var a = r.position;
		if (!a || a instanceof Array) return Gr(t, r, i);
		var o = e(a), s = r.distance == null ? 5 : r.distance, c = this.shape, l = c.cx, u = c.cy, d = c.r, f = c.r0, p = (d + f) / 2, m = c.startAngle, h = c.endAngle, g = (m + h) / 2, _ = n ? Math.abs(d - f) / 2 : 0, v = Math.cos, y = Math.sin, b = l + d * v(m), x = u + d * y(m), S = "left", C = "top";
		switch (o) {
			case "startArc":
				b = l + (f - s) * v(g), x = u + (f - s) * y(g), S = "center", C = "top";
				break;
			case "insideStartArc":
				b = l + (f + s) * v(g), x = u + (f + s) * y(g), S = "center", C = "bottom";
				break;
			case "startAngle":
				b = l + p * v(m) + Rw(m, s + _, !1), x = u + p * y(m) + zw(m, s + _, !1), S = "right", C = "middle";
				break;
			case "insideStartAngle":
				b = l + p * v(m) + Rw(m, -s + _, !1), x = u + p * y(m) + zw(m, -s + _, !1), S = "left", C = "middle";
				break;
			case "middle":
				b = l + p * v(g), x = u + p * y(g), S = "center", C = "middle";
				break;
			case "endArc":
				b = l + (d + s) * v(g), x = u + (d + s) * y(g), S = "center", C = "bottom";
				break;
			case "insideEndArc":
				b = l + (d - s) * v(g), x = u + (d - s) * y(g), S = "center", C = "top";
				break;
			case "endAngle":
				b = l + p * v(h) + Rw(h, s + _, !0), x = u + p * y(h) + zw(h, s + _, !0), S = "left", C = "middle";
				break;
			case "insideEndAngle":
				b = l + p * v(h) + Rw(h, -s + _, !0), x = u + p * y(h) + zw(h, -s + _, !0), S = "right", C = "middle";
				break;
			default: return Gr(t, r, i);
		}
		return t ||= {}, t.x = b, t.y = x, t.align = S, t.verticalAlign = C, t;
	};
}
function Lw(e, t, n, r) {
	if (Ht(r)) {
		e.setTextConfig({ rotation: r });
		return;
	} else if (H(t)) {
		e.setTextConfig({ rotation: 0 });
		return;
	}
	var i = e.shape, a = i.clockwise ? i.startAngle : i.endAngle, o = i.clockwise ? i.endAngle : i.startAngle, s = (a + o) / 2, c, l = n(t);
	switch (l) {
		case "startArc":
		case "insideStartArc":
		case "middle":
		case "insideEndArc":
		case "endArc":
			c = s;
			break;
		case "startAngle":
		case "insideStartAngle":
			c = a;
			break;
		case "endAngle":
		case "insideEndAngle":
			c = o;
			break;
		default:
			e.setTextConfig({ rotation: 0 });
			return;
	}
	var u = Math.PI * 1.5 - c;
	l === "middle" && u > Math.PI / 2 && u < Math.PI * 1.5 && (u -= Math.PI), e.setTextConfig({ rotation: u });
}
function Rw(e, t, n) {
	return t * Math.sin(e) * (n ? -1 : 1);
}
function zw(e, t, n) {
	return t * Math.cos(e) * (n ? 1 : -1);
}
//#endregion
//#region node_modules/echarts/lib/chart/helper/sectorHelper.js
function Bw(e, t, n) {
	var r = e.get("borderRadius");
	if (r == null) return n ? { cornerRadius: 0 } : null;
	H(r) || (r = [
		r,
		r,
		r,
		r
	]);
	var i = Math.abs(t.r || 0 - t.r0 || 0);
	return { cornerRadius: B(r, function(e) {
		return Wr(e, i);
	}) };
}
//#endregion
//#region node_modules/echarts/lib/chart/bar/BarView.js
var Vw = Math.max, Hw = Math.min, Uw = function(e) {
	I(t, e);
	function t() {
		var t = e.call(this) || this;
		return t.type = "bar", t._isFirstFrame = !0, t;
	}
	return t.prototype.render = function(e, t, n, r) {
		this._model = e, this._removeOnRenderedListener(n), this._updateDrawMode(e);
		var i = e.get("coordinateSystem");
		i === "cartesian2d" || i === "polar" ? (this._progressiveEls = null, this._isLargeDraw ? this._renderLarge(e, t, n) : this._renderNormal(e, t, n, r)) : process.env.NODE_ENV !== "production" && _l("Only cartesian2d and polar supported for bar.");
	}, t.prototype.incrementalPrepareRender = function(e) {
		this._clear(), this._updateDrawMode(e), this._updateLargeClip(e);
	}, t.prototype.incrementalRender = function(e, t) {
		this._progressiveEls = [], this._incrementalRenderLarge(e, t);
	}, t.prototype.eachRendered = function(e) {
		$p(this._progressiveEls || this.group, e);
	}, t.prototype._updateDrawMode = function(e) {
		var t = e.pipelineContext.large;
		(this._isLargeDraw == null || t !== this._isLargeDraw) && (this._isLargeDraw = t, this._clear());
	}, t.prototype._renderNormal = function(e, t, n, r) {
		var i = this.group, a = e.getData(), o = this._data, s = e.coordinateSystem, c = s.getBaseAxis(), l;
		s.type === "cartesian2d" ? l = c.isHorizontal() : s.type === "polar" && (l = c.dim === "angle");
		var u = e.isAnimationEnabled() ? e : null, d = Kw(e, s);
		d && this._enableRealtimeSort(d, a, n);
		var f = e.get("clip", !0) || d, p = s.getArea();
		i.removeClipPath();
		var m = e.get("roundCap", !0), h = e.get("showBackground", !0), g = e.getModel("backgroundStyle"), _ = g.get("borderRadius") || 0, v = [], y = this._backgroundEls, b = r && r.isInitSort, x = r && r.type === "changeAxisOrder";
		function S(e) {
			var t = Qw[s.type](a, e);
			if (!t) return null;
			var n = lT(s, l, t);
			return n.useStyle(g.getItemStyle()), s.type === "cartesian2d" ? n.setShape("r", _) : n.setShape("cornerRadius", _), v[e] = n, n;
		}
		a.diff(o).add(function(t) {
			var n = a.getItemModel(t), r = Qw[s.type](a, t, n);
			if (r && (h && S(t), !(!a.hasValue(t) || !Zw[s.type](r)))) {
				var o = !1;
				f && (o = Ww[s.type](p, r));
				var g = Gw[s.type](e, a, t, r, l, u, c.model, !1, m);
				d && (g.forceLabelAnimation = !0), tT(g, a, t, n, r, e, l, s.type === "polar"), b ? g.attr({ shape: r }) : d ? qw(d, u, g, r, t, l, !1, !1) : fp(g, { shape: r }, e, t), a.setItemGraphicEl(t, g), i.add(g), g.ignore = o;
			}
		}).update(function(t, n) {
			var r = a.getItemModel(t), C = Qw[s.type](a, t, r);
			if (C) {
				if (h) {
					var w = void 0;
					y.length === 0 ? w = S(n) : (w = y[n], w.useStyle(g.getItemStyle()), s.type === "cartesian2d" ? w.setShape("r", _) : w.setShape("cornerRadius", _), v[t] = w);
					var T = Qw[s.type](a, t), E = cT(l, T, s);
					dp(w, { shape: E }, u, t);
				}
				var D = o.getItemGraphicEl(n);
				if (!a.hasValue(t) || !Zw[s.type](C)) {
					i.remove(D);
					return;
				}
				var O = !1;
				if (f && (O = Ww[s.type](p, C), O && i.remove(D)), D && (D.type === "sector" && m || D.type === "sausage" && !m) && (D && gp(D, e, n), D = null), D ? _p(D) : D = Gw[s.type](e, a, t, C, l, u, c.model, !0, m), d && (D.forceLabelAnimation = !0), x) {
					var k = D.getTextContent();
					if (k) {
						var A = Em(k);
						A.prevValue != null && (A.prevValue = A.value);
					}
				} else tT(D, a, t, r, C, e, l, s.type === "polar");
				b ? D.attr({ shape: C }) : d ? qw(d, u, D, C, t, l, !0, x) : dp(D, { shape: C }, e, t, null), a.setItemGraphicEl(t, D), D.ignore = O, i.add(D);
			}
		}).remove(function(t) {
			var n = o.getItemGraphicEl(t);
			n && gp(n, e, t);
		}).execute();
		var C = this._backgroundGroup ||= new cf();
		C.removeAll();
		for (var w = 0; w < v.length; ++w) C.add(v[w]);
		i.add(C), this._backgroundEls = v, this._data = a;
	}, t.prototype._renderLarge = function(e, t, n) {
		this._clear(), aT(e, this.group), this._updateLargeClip(e);
	}, t.prototype._incrementalRenderLarge = function(e, t) {
		this._removeBackground(), aT(t, this.group, this._progressiveEls, !0);
	}, t.prototype._updateLargeClip = function(e) {
		var t = e.get("clip", !0) && db(e.coordinateSystem, !1, e), n = this.group;
		t ? n.setClipPath(t) : n.removeClipPath();
	}, t.prototype._enableRealtimeSort = function(e, t, n) {
		var r = this;
		if (t.count()) {
			var i = e.baseAxis;
			if (this._isFirstFrame) this._dispatchInitSort(t, e, n), this._isFirstFrame = !1;
			else {
				var a = function(e) {
					var n = t.getItemGraphicEl(e), r = n && n.shape;
					return r && Math.abs(i.isHorizontal() ? r.height : r.width) || 0;
				};
				this._onRendered = function() {
					r._updateSortWithinSameData(t, a, i, n);
				}, n.getZr().on("rendered", this._onRendered);
			}
		}
	}, t.prototype._dataSort = function(e, t, n) {
		var r = [];
		return e.each(e.mapDimension(t.dim), function(e, t) {
			var i = n(t);
			i ??= NaN, r.push({
				dataIndex: t,
				mappedValue: i,
				ordinalNumber: e
			});
		}), r.sort(function(e, t) {
			return t.mappedValue - e.mappedValue;
		}), { ordinalNumbers: B(r, function(e) {
			return e.ordinalNumber;
		}) };
	}, t.prototype._isOrderChangedWithinSameData = function(e, t, n) {
		for (var r = n.scale, i = e.mapDimension(n.dim), a = Number.MAX_VALUE, o = 0, s = r.getOrdinalMeta().categories.length; o < s; ++o) {
			var c = e.rawIndexOf(i, r.getRawOrdinalNumber(o)), l = c < 0 ? Number.MIN_VALUE : t(e.indexOfRawIndex(c));
			if (l > a) return !0;
			a = l;
		}
		return !1;
	}, t.prototype._isOrderDifferentInView = function(e, t) {
		for (var n = t.scale, r = n.getExtent(), i = Math.max(0, r[0]), a = Math.min(r[1], n.getOrdinalMeta().categories.length - 1); i <= a; ++i) if (e.ordinalNumbers[i] !== n.getRawOrdinalNumber(i)) return !0;
	}, t.prototype._updateSortWithinSameData = function(e, t, n, r) {
		if (this._isOrderChangedWithinSameData(e, t, n)) {
			var i = this._dataSort(e, n, t);
			this._isOrderDifferentInView(i, n) && (this._removeOnRenderedListener(r), r.dispatchAction({
				type: "changeAxisOrder",
				componentType: n.dim + "Axis",
				axisId: n.index,
				sortInfo: i
			}));
		}
	}, t.prototype._dispatchInitSort = function(e, t, n) {
		var r = t.baseAxis, i = this._dataSort(e, r, function(n) {
			return e.get(e.mapDimension(t.otherAxis.dim), n);
		});
		n.dispatchAction({
			type: "changeAxisOrder",
			componentType: r.dim + "Axis",
			isInitSort: !0,
			axisId: r.index,
			sortInfo: i
		});
	}, t.prototype.remove = function(e, t) {
		this._clear(this._model), this._removeOnRenderedListener(t);
	}, t.prototype.dispose = function(e, t) {
		this._removeOnRenderedListener(t);
	}, t.prototype._removeOnRenderedListener = function(e) {
		this._onRendered &&= (e.getZr().off("rendered", this._onRendered), null);
	}, t.prototype._clear = function(e) {
		var t = this.group, n = this._data;
		e && e.isAnimationEnabled() && n && !this._isLargeDraw ? (this._removeBackground(), this._backgroundEls = [], n.eachItemGraphicEl(function(t) {
			gp(t, e, bu(t).dataIndex);
		})) : t.removeAll(), this._data = null, this._isFirstFrame = !0;
	}, t.prototype._removeBackground = function() {
		this.group.remove(this._backgroundGroup), this._backgroundGroup = null;
	}, t.type = "bar", t;
}(rb), Ww = {
	cartesian2d: function(e, t) {
		var n = t.width < 0 ? -1 : 1, r = t.height < 0 ? -1 : 1;
		n < 0 && (t.x += t.width, t.width = -t.width), r < 0 && (t.y += t.height, t.height = -t.height);
		var i = e.x + e.width, a = e.y + e.height, o = Vw(t.x, e.x), s = Hw(t.x + t.width, i), c = Vw(t.y, e.y), l = Hw(t.y + t.height, a), u = s < o, d = l < c;
		return t.x = u && o > i ? s : o, t.y = d && c > a ? l : c, t.width = u ? 0 : s - o, t.height = d ? 0 : l - c, n < 0 && (t.x += t.width, t.width = -t.width), r < 0 && (t.y += t.height, t.height = -t.height), u || d;
	},
	polar: function(e, t) {
		var n = t.r0 <= t.r ? 1 : -1;
		if (n < 0) {
			var r = t.r;
			t.r = t.r0, t.r0 = r;
		}
		var i = Hw(t.r, e.r), a = Vw(t.r0, e.r0);
		t.r = i, t.r0 = a;
		var o = i - a < 0;
		if (n < 0) {
			var r = t.r;
			t.r = t.r0, t.r0 = r;
		}
		return o;
	}
}, Gw = {
	cartesian2d: function(e, t, n, r, i, a, o, s, c) {
		var l = new cc({
			shape: R({}, r),
			z2: 1
		});
		if (l.__dataIndex = n, l.name = "item", a) {
			var u = l.shape, d = i ? "height" : "width";
			u[d] = 0;
		}
		return l;
	},
	polar: function(e, t, n, r, i, a, o, s, c) {
		var l = !i && c ? Fw : kf, u = new l({
			shape: r,
			z2: 1
		});
		if (u.name = "item", u.calculateTextPosition = Iw(eT(i), { isRoundCap: l === Fw }), a) {
			var d = u.shape, f = i ? "r" : "endAngle", p = {};
			d[f] = i ? r.r0 : r.startAngle, p[f] = r[f], (s ? dp : fp)(u, { shape: p }, a);
		}
		return u;
	}
};
function Kw(e, t) {
	var n = e.get("realtimeSort", !0), r = t.getBaseAxis();
	if (process.env.NODE_ENV !== "production" && n && (r.type !== "category" && _l("`realtimeSort` will not work because this bar series is not based on a category axis."), t.type !== "cartesian2d" && _l("`realtimeSort` will not work because this bar series is not on cartesian2d.")), n && r.type === "category" && t.type === "cartesian2d") return {
		baseAxis: r,
		otherAxis: t.getOtherAxis(r)
	};
}
function qw(e, t, n, r, i, a, o, s) {
	var c, l;
	a ? (l = {
		x: r.x,
		width: r.width
	}, c = {
		y: r.y,
		height: r.height
	}) : (l = {
		y: r.y,
		height: r.height
	}, c = {
		x: r.x,
		width: r.width
	}), s || (o ? dp : fp)(n, { shape: c }, t, i, null);
	var u = t ? e.baseAxis.model : null;
	(o ? dp : fp)(n, { shape: l }, u, i);
}
function Jw(e, t) {
	for (var n = 0; n < t.length; n++) if (!isFinite(e[t[n]])) return !0;
	return !1;
}
var Yw = [
	"x",
	"y",
	"width",
	"height"
], Xw = [
	"cx",
	"cy",
	"r",
	"startAngle",
	"endAngle"
], Zw = {
	cartesian2d: function(e) {
		return !Jw(e, Yw);
	},
	polar: function(e) {
		return !Jw(e, Xw);
	}
}, Qw = {
	cartesian2d: function(e, t, n) {
		var r = e.getItemLayout(t);
		if (!r) return null;
		var i = n ? nT(n, r) : 0, a = r.width > 0 ? 1 : -1, o = r.height > 0 ? 1 : -1;
		return {
			x: r.x + a * i / 2,
			y: r.y + o * i / 2,
			width: r.width - a * i,
			height: r.height - o * i
		};
	},
	polar: function(e, t, n) {
		var r = e.getItemLayout(t);
		return {
			cx: r.cx,
			cy: r.cy,
			r0: r.r0,
			r: r.r,
			startAngle: r.startAngle,
			endAngle: r.endAngle,
			clockwise: r.clockwise
		};
	}
};
function $w(e) {
	return e.startAngle != null && e.endAngle != null && e.startAngle === e.endAngle;
}
function eT(e) {
	return function(e) {
		var t = e ? "Arc" : "Angle";
		return function(e) {
			switch (e) {
				case "start":
				case "insideStart":
				case "end":
				case "insideEnd": return e + t;
				default: return e;
			}
		};
	}(e);
}
function tT(e, t, n, r, i, a, o, s) {
	var c = t.getItemVisual(n, "style");
	if (!s) {
		var l = r.get(["itemStyle", "borderRadius"]) || 0;
		e.setShape("r", l);
	} else if (!a.get("roundCap")) {
		var u = e.shape;
		R(u, Bw(r.getModel("itemStyle"), u, !0)), e.setShape(u);
	}
	e.useStyle(c);
	var d = r.getShallow("cursor");
	d && e.attr("cursor", d);
	var f = s ? o ? i.r >= i.r0 ? "endArc" : "startArc" : i.endAngle >= i.startAngle ? "endAngle" : "startAngle" : o ? uT(i, a.coordinateSystem) : dT(i, a.coordinateSystem), p = gm(r);
	hm(e, p, {
		labelFetcher: a,
		labelDataIndex: n,
		defaultText: Jy(a.getData(), n),
		inheritColor: c.fill,
		defaultOpacity: c.opacity,
		defaultOutsidePosition: f
	});
	var m = e.getTextContent();
	if (s && m) {
		var h = r.get(["label", "position"]);
		e.textConfig.inside = h === "middle" || null, Lw(e, h === "outside" ? f : h, eT(o), r.get(["label", "rotate"]));
	}
	Dm(m, p, a.getRawValue(n), function(e) {
		return Yy(t, e);
	});
	var g = r.getModel(["emphasis"]);
	Od(e, g.get("focus"), g.get("blurScope"), g.get("disabled")), Md(e, r), $w(i) && (e.style.fill = "none", e.style.stroke = "none", z(e.states, function(e) {
		e.style && (e.style.fill = e.style.stroke = "none");
	}));
}
function nT(e, t) {
	var n = e.get(["itemStyle", "borderColor"]);
	if (!n || n === "none") return 0;
	var r = e.get(["itemStyle", "borderWidth"]) || 0, i = isNaN(t.width) ? Number.MAX_VALUE : Math.abs(t.width), a = isNaN(t.height) ? Number.MAX_VALUE : Math.abs(t.height);
	return Math.min(r, i, a);
}
var rT = function() {
	function e() {}
	return e;
}(), iT = function(e) {
	I(t, e);
	function t(t) {
		var n = e.call(this, t) || this;
		return n.type = "largeBar", n;
	}
	return t.prototype.getDefaultShape = function() {
		return new rT();
	}, t.prototype.buildPath = function(e, t) {
		for (var n = t.points, r = this.baseDimIdx, i = 1 - this.baseDimIdx, a = [], o = [], s = this.barWidth, c = 0; c < n.length; c += 3) o[r] = s, o[i] = n[c + 2], a[r] = n[c + r], a[i] = n[c + i], e.rect(a[0], a[1], o[0], o[1]);
	}, t;
}(Js);
function aT(e, t, n, r) {
	var i = e.getData(), a = +!!i.getLayout("valueAxisHorizontal"), o = i.getLayout("largeDataIndices"), s = i.getLayout("size"), c = e.getModel("backgroundStyle"), l = i.getLayout("largeBackgroundPoints"), u = r ? _u(e) : 0;
	if (l) {
		var d = new iT({
			shape: { points: l },
			incremental: u,
			silent: !0,
			z2: 0
		});
		d.baseDimIdx = a, d.largeDataIndices = o, d.barWidth = s, d.useStyle(c.getItemStyle()), t.add(d), n && n.push(d);
	}
	var f = new iT({
		shape: { points: i.getLayout("largePoints") },
		incremental: u,
		ignoreCoarsePointer: !0,
		z2: 1
	});
	f.baseDimIdx = a, f.largeDataIndices = o, f.barWidth = s, t.add(f), f.useStyle(i.getVisual("style")), f.style.stroke = null, bu(f).seriesIndex = e.seriesIndex, e.get("silent") || (f.on("mousedown", oT), f.on("mousemove", oT)), n && n.push(f);
}
var oT = jw(function(e) {
	var t = this, n = sT(t, e.offsetX, e.offsetY);
	bu(t).dataIndex = n >= 0 ? n : null;
}, 30, !1);
function sT(e, t, n) {
	for (var r = e.baseDimIdx, i = 1 - r, a = e.shape.points, o = e.largeDataIndices, s = [], c = [], l = e.barWidth, u = 0, d = a.length / 3; u < d; u++) {
		var f = u * 3;
		if (c[r] = l, c[i] = a[f + 2], s[r] = a[f + r], s[i] = a[f + i], c[i] < 0 && (s[i] += c[i], c[i] = -c[i]), t >= s[0] && t <= s[0] + c[0] && n >= s[1] && n <= s[1] + c[1]) return o[u];
	}
	return -1;
}
function cT(e, t, n) {
	if (fb(n, "cartesian2d")) {
		var r = t, i = n.getArea();
		return {
			x: e ? r.x : i.x,
			y: e ? i.y : r.y,
			width: e ? r.width : i.width,
			height: e ? i.height : r.height
		};
	} else {
		var i = n.getArea(), a = t;
		return {
			cx: i.cx,
			cy: i.cy,
			r0: e ? i.r0 : a.r0,
			r: e ? i.r : a.r,
			startAngle: e ? a.startAngle : 0,
			endAngle: e ? a.endAngle : Math.PI * 2
		};
	}
}
function lT(e, t, n) {
	return new (e.type === "polar" ? kf : cc)({
		shape: cT(t, n, e),
		silent: !0,
		z2: 0
	});
}
function uT(e, t) {
	return e.height === 0 ? t.getOtherAxis(t.getBaseAxis()).inverse ? "bottom" : "top" : e.height > 0 ? "bottom" : "top";
}
function dT(e, t) {
	return e.width === 0 ? t.getOtherAxis(t.getBaseAxis()).inverse ? "left" : "right" : e.width >= 0 ? "right" : "left";
}
//#endregion
//#region node_modules/echarts/lib/chart/bar/install.js
function fT(e) {
	e.registerChartView(Uw), e.registerSeriesModel(Dw), e.registerLayout(e.PRIORITY.VISUAL.LAYOUT, xw("bar")), e.registerLayout(e.PRIORITY.VISUAL.PROGRESSIVE_LAYOUT, Sw("bar")), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, Mx("bar")), e.registerAction({
		type: "changeAxisOrder",
		event: "changeAxisOrder",
		update: "update"
	}, function(e, t) {
		var n = e.componentType || "series";
		t.eachComponent({
			mainType: n,
			query: e
		}, function(t) {
			e.sortInfo && t.axis.setCategorySortInfo(e.sortInfo);
		});
	}), Tw(e);
}
//#endregion
//#region node_modules/echarts/lib/legacy/dataSelectAction.js
function pT(e, t, n, r, i) {
	var a = e + t;
	n.isSilent(a) || (process.env.NODE_ENV !== "production" && yl("event " + a + " is deprecated."), r.eachComponent({
		mainType: "series",
		subType: "pie"
	}, function(e) {
		for (var t = e.seriesIndex, r = e.option.selectedMap, o = i.selected, s = 0; s < o.length; s++) if (o[s].seriesIndex === t) {
			var c = e.getData(), l = Kl(c, i.fromActionPayload);
			n.trigger(a, {
				type: a,
				seriesId: e.id,
				name: H(l) ? c.getName(l[0]) : c.getName(l),
				selected: W(r) ? r : R({}, r)
			});
		}
	}));
}
function mT(e, t, n) {
	e.on("selectchanged", function(e) {
		var r = n.getModel();
		e.isFromClick ? (pT("map", "selectchanged", t, r, e), pT("pie", "selectchanged", t, r, e)) : e.fromAction === "select" ? (pT("map", "selected", t, r, e), pT("pie", "selected", t, r, e)) : e.fromAction === "unselect" && (pT("map", "unselected", t, r, e), pT("pie", "unselected", t, r, e));
	});
}
//#endregion
//#region node_modules/zrender/lib/mixin/Draggable.js
var hT = function() {
	function e(e, t) {
		this.target = e, this.topTarget = t && t.topTarget;
	}
	return e;
}(), gT = function() {
	function e(e) {
		this.handler = e, e.on("mousedown", this._dragStart, this), e.on("mousemove", this._drag, this), e.on("mouseup", this._dragEnd, this);
	}
	return e.prototype._dragStart = function(e) {
		for (var t = e.target; t && !t.draggable;) t = t.parent || t.__hostTarget;
		t && (this._draggingTarget = t, t.dragging = !0, this._x = e.offsetX, this._y = e.offsetY, this.handler.dispatchToElement(new hT(t, e), "dragstart", e.event));
	}, e.prototype._drag = function(e) {
		var t = this._draggingTarget;
		if (t) {
			var n = e.offsetX, r = e.offsetY, i = n - this._x, a = r - this._y;
			this._x = n, this._y = r, t.drift(i, a, e), this.handler.dispatchToElement(new hT(t, e), "drag", e.event);
			var o = this.handler.findHover(n, r, t).target, s = this._dropTarget;
			this._dropTarget = o, t !== o && (s && o !== s && this.handler.dispatchToElement(new hT(s, e), "dragleave", e.event), o && o !== s && this.handler.dispatchToElement(new hT(o, e), "dragenter", e.event));
		}
	}, e.prototype._dragEnd = function(e) {
		var t = this._draggingTarget;
		t && (t.dragging = !1), this.handler.dispatchToElement(new hT(t, e), "dragend", e.event), this._dropTarget && this.handler.dispatchToElement(new hT(this._dropTarget, e), "drop", e.event), this._draggingTarget = null, this._dropTarget = null;
	}, e;
}(), _T = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, vT = [], yT = Y.browser.firefox && +Y.browser.version.split(".")[0] < 39;
function bT(e, t, n, r) {
	return n ||= {}, r ? xT(e, t, n) : yT && t.layerX != null && t.layerX !== t.offsetX ? (n.zrX = t.layerX, n.zrY = t.layerY) : t.offsetX == null ? xT(e, t, n) : (n.zrX = t.offsetX, n.zrY = t.offsetY), n;
}
function xT(e, t, n) {
	if (Y.domSupported && e.getBoundingClientRect) {
		var r = t.clientX, i = t.clientY;
		if (n_(e)) {
			var a = e.getBoundingClientRect();
			n.zrX = r - a.left, n.zrY = i - a.top;
			return;
		} else if ($g(vT, e, r, i)) {
			n.zrX = vT[0], n.zrY = vT[1];
			return;
		}
	}
	n.zrX = n.zrY = 0;
}
function ST(e) {
	return e || window.event;
}
function CT(e, t, n) {
	if (t = ST(t), t.zrX != null) return t;
	var r = t.type;
	if (r && r.indexOf("touch") >= 0) {
		var i = r === "touchend" ? t.changedTouches[0] : t.targetTouches[0];
		i && bT(e, i, t, n);
	} else {
		bT(e, t, t, n);
		var a = wT(t);
		t.zrDelta = a ? a / 120 : -(t.detail || 0) / 3;
	}
	var o = t.button;
	return t.which == null && o !== void 0 && _T.test(t.type) && (t.which = o & 1 ? 1 : o & 2 ? 3 : o & 4 ? 2 : 0), t;
}
function wT(e) {
	var t = e.wheelDelta;
	if (t) return t;
	var n = e.deltaX, r = e.deltaY;
	if (n == null || r == null) return t;
	var i = Math.abs(r === 0 ? n : r), a = r > 0 ? -1 : r < 0 ? 1 : n > 0 ? -1 : 1;
	return 3 * i * a;
}
function TT(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function ET(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var DT = function(e) {
	e.preventDefault(), e.stopPropagation(), e.cancelBubble = !0;
}, OT = function() {
	function e() {
		this._track = [];
	}
	return e.prototype.recognize = function(e, t, n) {
		return this._doTrack(e, t, n), this._recognize(e);
	}, e.prototype.clear = function() {
		return this._track.length = 0, this;
	}, e.prototype._doTrack = function(e, t, n) {
		var r = e.touches;
		if (r) {
			for (var i = {
				points: [],
				touches: [],
				target: t,
				event: e
			}, a = 0, o = r.length; a < o; a++) {
				var s = r[a], c = bT(n, s, {});
				i.points.push([c.zrX, c.zrY]), i.touches.push(s);
			}
			this._track.push(i);
		}
	}, e.prototype._recognize = function(e) {
		for (var t in jT) if (jT.hasOwnProperty(t)) {
			var n = jT[t](this._track, e);
			if (n) return n;
		}
	}, e;
}();
function kT(e) {
	var t = e[1][0] - e[0][0], n = e[1][1] - e[0][1];
	return Math.sqrt(t * t + n * n);
}
function AT(e) {
	return [(e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2];
}
var jT = { pinch: function(e, t) {
	var n = e.length;
	if (n) {
		var r = (e[n - 1] || {}).points, i = (e[n - 2] || {}).points || r;
		if (i && i.length > 1 && r && r.length > 1) {
			var a = kT(r) / kT(i);
			!isFinite(a) && (a = 1), t.pinchScale = a;
			var o = AT(r);
			return t.pinchX = o[0], t.pinchY = o[1], {
				type: "pinch",
				target: e[0].target,
				event: t
			};
		}
	}
} }, MT = "silent";
function NT(e, t, n) {
	return {
		type: e,
		event: n,
		target: t.target,
		topTarget: t.topTarget,
		cancelBubble: !1,
		offsetX: n.zrX,
		offsetY: n.zrY,
		gestureEvent: n.gestureEvent,
		pinchX: n.pinchX,
		pinchY: n.pinchY,
		pinchScale: n.pinchScale,
		wheelDelta: n.zrDelta,
		zrByTouch: n.zrByTouch,
		which: n.which,
		stop: PT
	};
}
function PT() {
	DT(this.event);
}
var FT = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.handler = null, t;
	}
	return t.prototype.dispose = function() {}, t.prototype.setCursor = function() {}, t;
}(fo), IT = function() {
	function e(e, t) {
		this.x = e, this.y = t;
	}
	return e;
}(), LT = [
	"click",
	"dblclick",
	"mousewheel",
	"mouseout",
	"mouseup",
	"mousedown",
	"mousemove",
	"contextmenu"
], RT = new X(0, 0, 0, 0), zT = function(e) {
	I(t, e);
	function t(t, n, r, i, a) {
		var o = e.call(this) || this;
		return o._hovered = new IT(0, 0), o.storage = t, o.painter = n, o.painterRoot = i, o._pointerSize = a, r ||= new FT(), o.proxy = null, o.setHandlerProxy(r), o._draggingMgr = new gT(o), o;
	}
	return t.prototype.setHandlerProxy = function(e) {
		this.proxy && this.proxy.dispose(), e && (z(LT, function(t) {
			e.on && e.on(t, this[t], this);
		}, this), e.handler = this), this.proxy = e;
	}, t.prototype.mousemove = function(e) {
		var t = e.zrX, n = e.zrY, r = HT(this, t, n), i = this._hovered, a = i.target;
		a && !a.__zr && (i = this.findHover(i.x, i.y), a = i.target);
		var o = this._hovered = r ? new IT(t, n) : this.findHover(t, n), s = o.target, c = this.proxy;
		c.setCursor && c.setCursor(s ? s.cursor : "default"), a && s !== a && this.dispatchToElement(i, "mouseout", e), this.dispatchToElement(o, "mousemove", e), s && s !== a && this.dispatchToElement(o, "mouseover", e);
	}, t.prototype.mouseout = function(e) {
		var t = e.zrEventControl;
		t !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", e), t !== "no_globalout" && this.trigger("globalout", {
			type: "globalout",
			event: e
		});
	}, t.prototype.resize = function() {
		this._hovered = new IT(0, 0);
	}, t.prototype.dispatch = function(e, t) {
		var n = this[e];
		n && n.call(this, t);
	}, t.prototype.dispose = function() {
		this.proxy.dispose(), this.storage = null, this.proxy = null, this.painter = null;
	}, t.prototype.setCursorStyle = function(e) {
		var t = this.proxy;
		t.setCursor && t.setCursor(e);
	}, t.prototype.dispatchToElement = function(e, t, n) {
		e ||= {};
		var r = e.target;
		if (!(r && r.silent)) {
			for (var i = "on" + t, a = NT(t, e, n); r && (r[i] && (a.cancelBubble = !!r[i].call(r, a)), r.trigger(t, a), r = r.__hostTarget ? r.__hostTarget : r.parent, !a.cancelBubble););
			a.cancelBubble || (this.trigger(t, a), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(e) {
				typeof e[i] == "function" && e[i].call(e, a), e.trigger && e.trigger(t, a);
			}));
		}
	}, t.prototype.findHover = function(e, t, n) {
		var r = this.storage.getDisplayList(), i = new IT(e, t);
		if (VT(r, i, e, t, n), this._pointerSize && !i.target) {
			for (var a = [], o = this._pointerSize, s = o / 2, c = new X(e - s, t - s, o, o), l = r.length - 1; l >= 0; l--) {
				var u = r[l];
				u !== n && !u.ignore && !u.ignoreCoarsePointer && (!u.parent || !u.parent.ignoreCoarsePointer) && (RT.copy(u.getBoundingRect()), u.transform && RT.applyTransform(u.transform), RT.intersect(c) && a.push(u));
			}
			if (a.length) {
				for (var d = 4, f = Math.PI / 12, p = Math.PI * 2, m = 0; m < s; m += d) for (var h = 0; h < p; h += f) if (VT(a, i, e + m * Math.cos(h), t + m * Math.sin(h), n), i.target) return i;
			}
		}
		return i;
	}, t.prototype.processGesture = function(e, t) {
		this._gestureMgr ||= new OT();
		var n = this._gestureMgr;
		t === "start" && n.clear();
		var r = n.recognize(e, this.findHover(e.zrX, e.zrY, null).target, this.proxy.dom);
		if (t === "end" && n.clear(), r) {
			var i = r.type;
			e.gestureEvent = i;
			var a = new IT();
			a.target = r.target, this.dispatchToElement(a, i, r.event);
		}
	}, t;
}(fo);
z([
	"click",
	"mousedown",
	"mouseup",
	"mousewheel",
	"dblclick",
	"contextmenu"
], function(e) {
	zT.prototype[e] = function(t) {
		var n = t.zrX, r = t.zrY, i = HT(this, n, r), a, o;
		if ((e !== "mouseup" || !i) && (a = this.findHover(n, r), o = a.target), e === "mousedown") this._downEl = o, this._downPoint = [t.zrX, t.zrY], this._upEl = o;
		else if (e === "mouseup") this._upEl = o;
		else if (e === "click") {
			if (this._downEl !== this._upEl || !this._downPoint || ir(this._downPoint, [t.zrX, t.zrY]) > 4) return;
			this._downPoint = null;
		}
		this.dispatchToElement(a, e, t);
	};
});
function BT(e, t, n) {
	if (e[e.rectHover ? "rectContain" : "contain"](t, n)) {
		for (var r = e, i = void 0, a = !1; r;) {
			if (r.ignoreClip && (a = !0), !a) {
				var o = r.getClipPath();
				if (o && !o.contain(t, n)) return !1;
			}
			r.silent && (i = !0);
			var s = r.__hostTarget;
			r = s ? r.ignoreHostSilent ? null : s : r.parent;
		}
		return !i || MT;
	}
	return !1;
}
function VT(e, t, n, r, i) {
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a], s = void 0;
		if (o !== i && !o.ignore && (s = BT(o, n, r)) && (!t.topTarget && (t.topTarget = o), s !== MT)) {
			t.target = o;
			break;
		}
	}
}
function HT(e, t, n) {
	var r = e.painter;
	return t < 0 || t > r.getWidth() || n < 0 || n > r.getHeight();
}
//#endregion
//#region node_modules/zrender/lib/core/timsort.js
var UT = 32, WT = 7;
function GT(e) {
	for (var t = 0; e >= UT;) t |= e & 1, e >>= 1;
	return e + t;
}
function KT(e, t, n, r) {
	var i = t + 1;
	if (i === n) return 1;
	if (r(e[i++], e[t]) < 0) {
		for (; i < n && r(e[i], e[i - 1]) < 0;) i++;
		qT(e, t, i);
	} else for (; i < n && r(e[i], e[i - 1]) >= 0;) i++;
	return i - t;
}
function qT(e, t, n) {
	for (n--; t < n;) {
		var r = e[t];
		e[t++] = e[n], e[n--] = r;
	}
}
function JT(e, t, n, r, i) {
	for (r === t && r++; r < n; r++) {
		for (var a = e[r], o = t, s = r, c; o < s;) c = o + s >>> 1, i(a, e[c]) < 0 ? s = c : o = c + 1;
		var l = r - o;
		switch (l) {
			case 3: e[o + 3] = e[o + 2];
			case 2: e[o + 2] = e[o + 1];
			case 1:
				e[o + 1] = e[o];
				break;
			default: for (; l > 0;) e[o + l] = e[o + l - 1], l--;
		}
		e[o] = a;
	}
}
function YT(e, t, n, r, i, a) {
	var o = 0, s = 0, c = 1;
	if (a(e, t[n + i]) > 0) {
		for (s = r - i; c < s && a(e, t[n + i + c]) > 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s), o += i, c += i;
	} else {
		for (s = i + 1; c < s && a(e, t[n + i - c]) <= 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s);
		var l = o;
		o = i - c, c = i - l;
	}
	for (o++; o < c;) {
		var u = o + (c - o >>> 1);
		a(e, t[n + u]) > 0 ? o = u + 1 : c = u;
	}
	return c;
}
function XT(e, t, n, r, i, a) {
	var o = 0, s = 0, c = 1;
	if (a(e, t[n + i]) < 0) {
		for (s = i + 1; c < s && a(e, t[n + i - c]) < 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s);
		var l = o;
		o = i - c, c = i - l;
	} else {
		for (s = r - i; c < s && a(e, t[n + i + c]) >= 0;) o = c, c = (c << 1) + 1, c <= 0 && (c = s);
		c > s && (c = s), o += i, c += i;
	}
	for (o++; o < c;) {
		var u = o + (c - o >>> 1);
		a(e, t[n + u]) < 0 ? c = u : o = u + 1;
	}
	return c;
}
function ZT(e, t) {
	var n = WT, r, i, a = 0, o = [];
	r = [], i = [];
	function s(e, t) {
		r[a] = e, i[a] = t, a += 1;
	}
	function c() {
		for (; a > 1;) {
			var e = a - 2;
			if (e >= 1 && i[e - 1] <= i[e] + i[e + 1] || e >= 2 && i[e - 2] <= i[e] + i[e - 1]) i[e - 1] < i[e + 1] && e--;
			else if (i[e] > i[e + 1]) break;
			u(e);
		}
	}
	function l() {
		for (; a > 1;) {
			var e = a - 2;
			e > 0 && i[e - 1] < i[e + 1] && e--, u(e);
		}
	}
	function u(n) {
		var o = r[n], s = i[n], c = r[n + 1], l = i[n + 1];
		i[n] = s + l, n === a - 3 && (r[n + 1] = r[n + 2], i[n + 1] = i[n + 2]), a--;
		var u = XT(e[c], e, o, s, 0, t);
		o += u, s -= u, s !== 0 && (l = YT(e[o + s - 1], e, c, l, l - 1, t), l !== 0 && (s <= l ? d(o, s, c, l) : f(o, s, c, l)));
	}
	function d(r, i, a, s) {
		var c = 0;
		for (c = 0; c < i; c++) o[c] = e[r + c];
		var l = 0, u = a, d = r;
		if (e[d++] = e[u++], --s === 0) {
			for (c = 0; c < i; c++) e[d + c] = o[l + c];
			return;
		}
		if (i === 1) {
			for (c = 0; c < s; c++) e[d + c] = e[u + c];
			e[d + s] = o[l];
			return;
		}
		for (var f = n, p, m, h;;) {
			p = 0, m = 0, h = !1;
			do
				if (t(e[u], o[l]) < 0) {
					if (e[d++] = e[u++], m++, p = 0, --s === 0) {
						h = !0;
						break;
					}
				} else if (e[d++] = o[l++], p++, m = 0, --i === 1) {
					h = !0;
					break;
				}
			while ((p | m) < f);
			if (h) break;
			do {
				if (p = XT(e[u], o, l, i, 0, t), p !== 0) {
					for (c = 0; c < p; c++) e[d + c] = o[l + c];
					if (d += p, l += p, i -= p, i <= 1) {
						h = !0;
						break;
					}
				}
				if (e[d++] = e[u++], --s === 0) {
					h = !0;
					break;
				}
				if (m = YT(o[l], e, u, s, 0, t), m !== 0) {
					for (c = 0; c < m; c++) e[d + c] = e[u + c];
					if (d += m, u += m, s -= m, s === 0) {
						h = !0;
						break;
					}
				}
				if (e[d++] = o[l++], --i === 1) {
					h = !0;
					break;
				}
				f--;
			} while (p >= WT || m >= WT);
			if (h) break;
			f < 0 && (f = 0), f += 2;
		}
		if (n = f, n < 1 && (n = 1), i === 1) {
			for (c = 0; c < s; c++) e[d + c] = e[u + c];
			e[d + s] = o[l];
		} else if (i === 0) throw Error();
		else for (c = 0; c < i; c++) e[d + c] = o[l + c];
	}
	function f(r, i, a, s) {
		var c = 0;
		for (c = 0; c < s; c++) o[c] = e[a + c];
		var l = r + i - 1, u = s - 1, d = a + s - 1, f = 0, p = 0;
		if (e[d--] = e[l--], --i === 0) {
			for (f = d - (s - 1), c = 0; c < s; c++) e[f + c] = o[c];
			return;
		}
		if (s === 1) {
			for (d -= i, l -= i, p = d + 1, f = l + 1, c = i - 1; c >= 0; c--) e[p + c] = e[f + c];
			e[d] = o[u];
			return;
		}
		for (var m = n;;) {
			var h = 0, g = 0, _ = !1;
			do
				if (t(o[u], e[l]) < 0) {
					if (e[d--] = e[l--], h++, g = 0, --i === 0) {
						_ = !0;
						break;
					}
				} else if (e[d--] = o[u--], g++, h = 0, --s === 1) {
					_ = !0;
					break;
				}
			while ((h | g) < m);
			if (_) break;
			do {
				if (h = i - XT(o[u], e, r, i, i - 1, t), h !== 0) {
					for (d -= h, l -= h, i -= h, p = d + 1, f = l + 1, c = h - 1; c >= 0; c--) e[p + c] = e[f + c];
					if (i === 0) {
						_ = !0;
						break;
					}
				}
				if (e[d--] = o[u--], --s === 1) {
					_ = !0;
					break;
				}
				if (g = s - YT(e[l], o, 0, s, s - 1, t), g !== 0) {
					for (d -= g, u -= g, s -= g, p = d + 1, f = u + 1, c = 0; c < g; c++) e[p + c] = o[f + c];
					if (s <= 1) {
						_ = !0;
						break;
					}
				}
				if (e[d--] = e[l--], --i === 0) {
					_ = !0;
					break;
				}
				m--;
			} while (h >= WT || g >= WT);
			if (_) break;
			m < 0 && (m = 0), m += 2;
		}
		if (n = m, n < 1 && (n = 1), s === 1) {
			for (d -= i, l -= i, p = d + 1, f = l + 1, c = i - 1; c >= 0; c--) e[p + c] = e[f + c];
			e[d] = o[u];
		} else if (s === 0) throw Error();
		else for (f = d - (s - 1), c = 0; c < s; c++) e[f + c] = o[c];
	}
	return {
		mergeRuns: c,
		forceMergeRuns: l,
		pushRun: s
	};
}
function QT(e, t, n, r) {
	n ||= 0, r ||= e.length;
	var i = r - n;
	if (!(i < 2)) {
		var a = 0;
		if (i < UT) {
			a = KT(e, n, r, t), JT(e, n, r, n + a, t);
			return;
		}
		var o = ZT(e, t), s = GT(i);
		do {
			if (a = KT(e, n, r, t), a < s) {
				var c = i;
				c > s && (c = s), JT(e, n, n + c, n + a, t), a = c;
			}
			o.pushRun(n, a), o.mergeRuns(), i -= a, n += a;
		} while (i !== 0);
		o.forceMergeRuns();
	}
}
//#endregion
//#region node_modules/zrender/lib/Storage.js
var $T = !1;
function eE() {
	$T || ($T = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function tE(e, t) {
	return e.zlevel === t.zlevel ? e.z === t.z ? e.z2 - t.z2 : e.z - t.z : e.zlevel - t.zlevel;
}
var nE = function() {
	function e() {
		this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = tE;
	}
	return e.prototype.traverse = function(e, t) {
		for (var n = 0; n < this._roots.length; n++) this._roots[n].traverse(e, t);
	}, e.prototype.getDisplayList = function(e, t) {
		t ||= !1;
		var n = this._displayList;
		return (e || !n.length) && this.updateDisplayList(t), n;
	}, e.prototype.updateDisplayList = function(e) {
		this._displayListLen = 0;
		for (var t = this._roots, n = this._displayList, r = 0, i = t.length; r < i; r++) this._updateAndAddDisplayable(t[r], null, e);
		n.length = this._displayListLen, QT(n, tE);
	}, e.prototype._updateAndAddDisplayable = function(e, t, n) {
		if (!(e.ignore && !n)) {
			e.beforeUpdate(), e.update(), e.afterUpdate();
			var r = e.getClipPath(), i = t && t.length, a = 0, o = e.__clipPaths;
			if (!e.ignoreClip && (i || r)) {
				if (o ||= e.__clipPaths = [], i) for (var s = 0; s < t.length; s++) o[a++] = t[s];
				for (var c = r, l = e; c;) c.parent = l, c.updateTransform(), o[a++] = c, l = c, c = c.getClipPath();
			}
			if (o && (o.length = a), e.childrenRef) {
				for (var u = e.childrenRef(), d = 0; d < u.length; d++) {
					var f = u[d];
					e.__dirty && (f.__dirty |= 1), this._updateAndAddDisplayable(f, o, n);
				}
				e.__dirty = 0;
			} else {
				var p = e;
				isNaN(p.z) && (eE(), p.z = 0), isNaN(p.z2) && (eE(), p.z2 = 0), isNaN(p.zlevel) && (eE(), p.zlevel = 0), this._displayList[this._displayListLen++] = p;
			}
			var m = e.getDecalElement && e.getDecalElement();
			m && this._updateAndAddDisplayable(m, o, n);
			var h = e.getTextGuideLine();
			h && this._updateAndAddDisplayable(h, o, n);
			var g = e.getTextContent();
			g && this._updateAndAddDisplayable(g, o, n);
		}
	}, e.prototype.addRoot = function(e) {
		e.__zr && e.__zr.storage === this || this._roots.push(e);
	}, e.prototype.delRoot = function(e) {
		if (e instanceof Array) {
			for (var t = 0, n = e.length; t < n; t++) this.delRoot(e[t]);
			return;
		}
		var r = jt(this._roots, e);
		r >= 0 && this._roots.splice(r, 1);
	}, e.prototype.delAllRoots = function() {
		this._roots = [], this._displayList = [], this._displayListLen = 0;
	}, e.prototype.getRoots = function() {
		return this._roots;
	}, e.prototype.dispose = function() {
		this._displayList = null, this._roots = null;
	}, e;
}(), rE = Y.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(e) {
	return setTimeout(e, 16);
};
//#endregion
//#region node_modules/zrender/lib/animation/Animation.js
function iE() {
	return (/* @__PURE__ */ new Date()).getTime();
}
var aE = function(e) {
	I(t, e);
	function t(t) {
		var n = e.call(this) || this;
		return n._running = !1, n._time = 0, n._pausedTime = 0, n._pauseStart = 0, n._paused = !1, t ||= {}, n.stage = t.stage || {}, n;
	}
	return t.prototype.addClip = function(e) {
		e.animation && this.removeClip(e), this._head ? (this._tail.next = e, e.prev = this._tail, e.next = null, this._tail = e) : this._head = this._tail = e, e.animation = this;
	}, t.prototype.addAnimator = function(e) {
		e.animation = this;
		var t = e.getClip();
		t && this.addClip(t);
	}, t.prototype.removeClip = function(e) {
		if (e.animation) {
			var t = e.prev, n = e.next;
			t ? t.next = n : this._head = n, n ? n.prev = t : this._tail = t, e.next = e.prev = e.animation = null;
		}
	}, t.prototype.removeAnimator = function(e) {
		var t = e.getClip();
		t && this.removeClip(t), e.animation = null;
	}, t.prototype.update = function(e) {
		for (var t = iE() - this._pausedTime, n = t - this._time, r = this._head; r;) {
			var i = r.next;
			r.step(t, n) ? (r.ondestroy(), this.removeClip(r), r = i) : r = i;
		}
		this._time = t, e || (this.trigger("frame", n), this.stage.update && this.stage.update());
	}, t.prototype._startLoop = function() {
		var e = this;
		this._running = !0;
		function t() {
			e._running && (rE(t), !e._paused && e.update());
		}
		rE(t);
	}, t.prototype.start = function() {
		this._running || (this._time = iE(), this._pausedTime = 0, this._startLoop());
	}, t.prototype.stop = function() {
		this._running = !1;
	}, t.prototype.pause = function() {
		this._paused ||= (this._pauseStart = iE(), !0);
	}, t.prototype.resume = function() {
		this._paused &&= (this._pausedTime += iE() - this._pauseStart, !1);
	}, t.prototype.clear = function() {
		for (var e = this._head; e;) {
			var t = e.next;
			e.prev = e.next = e.animation = null, e = t;
		}
		this._head = this._tail = null;
	}, t.prototype.isFinished = function() {
		return this._head == null;
	}, t.prototype.animate = function(e, t) {
		t ||= {}, this.start();
		var n = new uo(e, t.loop);
		return this.addAnimator(n), n;
	}, t;
}(fo), oE = 300, sE = Y.domSupported, cE = (function() {
	var e = [
		"click",
		"dblclick",
		"mousewheel",
		"wheel",
		"mouseout",
		"mouseup",
		"mousedown",
		"mousemove",
		"contextmenu"
	], t = [
		"touchstart",
		"touchend",
		"touchmove"
	], n = {
		pointerdown: 1,
		pointerup: 1,
		pointermove: 1,
		pointerout: 1
	};
	return {
		mouse: e,
		touch: t,
		pointer: B(e, function(e) {
			var t = e.replace("mouse", "pointer");
			return n.hasOwnProperty(t) ? t : e;
		})
	};
})(), lE = {
	mouse: ["mousemove", "mouseup"],
	pointer: ["pointermove", "pointerup"]
}, uE = !1;
function dE(e) {
	var t = e.pointerType;
	return t === "pen" || t === "touch";
}
function fE(e) {
	e.touching = !0, e.touchTimer != null && (clearTimeout(e.touchTimer), e.touchTimer = null), e.touchTimer = setTimeout(function() {
		e.touching = !1, e.touchTimer = null;
	}, 700);
}
function pE(e) {
	e && (e.zrByTouch = !0);
}
function mE(e, t) {
	return CT(e.dom, new gE(e, t), !0);
}
function hE(e, t) {
	for (var n = t, r = !1; n && n.nodeType !== 9 && !(r = n.domBelongToZr || n !== t && n === e.painterRoot);) n = n.parentNode;
	return r;
}
var gE = function() {
	function e(e, t) {
		this.stopPropagation = dn, this.stopImmediatePropagation = dn, this.preventDefault = dn, this.type = t.type, this.target = this.currentTarget = e.dom, this.pointerType = t.pointerType, this.clientX = t.clientX, this.clientY = t.clientY;
	}
	return e;
}(), _E = {
	mousedown: function(e) {
		e = CT(this.dom, e), this.__mayPointerCapture = [e.zrX, e.zrY], this.trigger("mousedown", e);
	},
	mousemove: function(e) {
		e = CT(this.dom, e);
		var t = this.__mayPointerCapture;
		t && (e.zrX !== t[0] || e.zrY !== t[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", e);
	},
	mouseup: function(e) {
		e = CT(this.dom, e), this.__togglePointerCapture(!1), this.trigger("mouseup", e);
	},
	mouseout: function(e) {
		e = CT(this.dom, e);
		var t = e.toElement || e.relatedTarget;
		hE(this, t) || (this.__pointerCapturing && (e.zrEventControl = "no_globalout"), this.trigger("mouseout", e));
	},
	wheel: function(e) {
		uE = !0, e = CT(this.dom, e), this.trigger("mousewheel", e);
	},
	mousewheel: function(e) {
		uE || (e = CT(this.dom, e), this.trigger("mousewheel", e));
	},
	touchstart: function(e) {
		e = CT(this.dom, e), pE(e), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(e, "start"), _E.mousemove.call(this, e), _E.mousedown.call(this, e);
	},
	touchmove: function(e) {
		e = CT(this.dom, e), pE(e), this.handler.processGesture(e, "change"), _E.mousemove.call(this, e);
	},
	touchend: function(e) {
		e = CT(this.dom, e), pE(e), this.handler.processGesture(e, "end"), _E.mouseup.call(this, e), /* @__PURE__ */ new Date() - +this.__lastTouchMoment < oE && _E.click.call(this, e);
	},
	pointerdown: function(e) {
		_E.mousedown.call(this, e);
	},
	pointermove: function(e) {
		dE(e) || _E.mousemove.call(this, e);
	},
	pointerup: function(e) {
		_E.mouseup.call(this, e);
	},
	pointerout: function(e) {
		dE(e) || _E.mouseout.call(this, e);
	}
};
z([
	"click",
	"dblclick",
	"contextmenu"
], function(e) {
	_E[e] = function(t) {
		t = CT(this.dom, t), this.trigger(e, t);
	};
});
var vE = {
	pointermove: function(e) {
		dE(e) || vE.mousemove.call(this, e);
	},
	pointerup: function(e) {
		vE.mouseup.call(this, e);
	},
	mousemove: function(e) {
		this.trigger("mousemove", e);
	},
	mouseup: function(e) {
		var t = this.__pointerCapturing;
		this.__togglePointerCapture(!1), this.trigger("mouseup", e), t && (e.zrEventControl = "only_globalout", this.trigger("mouseout", e));
	}
};
function yE(e, t) {
	var n = t.domHandlers;
	Y.pointerEventsSupported ? z(cE.pointer, function(r) {
		xE(t, r, function(t) {
			n[r].call(e, t);
		});
	}) : (Y.touchEventsSupported && z(cE.touch, function(r) {
		xE(t, r, function(i) {
			n[r].call(e, i), fE(t);
		});
	}), z(cE.mouse, function(r) {
		xE(t, r, function(i) {
			i = ST(i), t.touching || n[r].call(e, i);
		});
	}));
}
function bE(e, t) {
	Y.pointerEventsSupported ? z(lE.pointer, n) : Y.touchEventsSupported || z(lE.mouse, n);
	function n(n) {
		function r(r) {
			r = ST(r), hE(e, r.target) || (r = mE(e, r), t.domHandlers[n].call(e, r));
		}
		xE(t, n, r, { capture: !0 });
	}
}
function xE(e, t, n, r) {
	e.mounted[t] = n, e.listenerOpts[t] = r, TT(e.domTarget, t, n, r);
}
function SE(e) {
	var t = e.mounted;
	for (var n in t) t.hasOwnProperty(n) && ET(e.domTarget, n, t[n], e.listenerOpts[n]);
	e.mounted = {};
}
var CE = function() {
	function e(e, t) {
		this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = e, this.domHandlers = t;
	}
	return e;
}(), wE = function(e) {
	I(t, e);
	function t(t, n) {
		var r = e.call(this) || this;
		return r.__pointerCapturing = !1, r.dom = t, r.painterRoot = n, r._localHandlerScope = new CE(t, _E), sE && (r._globalHandlerScope = new CE(document, vE)), yE(r, r._localHandlerScope), r;
	}
	return t.prototype.dispose = function() {
		SE(this._localHandlerScope), sE && SE(this._globalHandlerScope);
	}, t.prototype.setCursor = function(e) {
		this.dom.style && (this.dom.style.cursor = e || "default");
	}, t.prototype.__togglePointerCapture = function(e) {
		if (this.__mayPointerCapture = null, sE && this.__pointerCapturing ^ +e) {
			this.__pointerCapturing = e;
			var t = this._globalHandlerScope;
			e ? bE(this, t) : SE(t);
		}
	}, t;
}(fo), TE = {}, EE = {};
function DE(e) {
	delete EE[e];
}
function OE(e) {
	if (!e) return !1;
	if (typeof e == "string") return va(e, 1) < ho;
	if (e.colorStops) {
		for (var t = e.colorStops, n = 0, r = t.length, i = 0; i < r; i++) n += va(t[i].color, 1);
		return n /= r, n < ho;
	}
	return !1;
}
var kE = function() {
	function e(e, t, n) {
		var r = this;
		this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !1, this._darkMode = !1, n ||= {}, this.dom = t, this.id = e;
		var i = new nE(), a = n.renderer || "canvas";
		if (TE[a] || (a = V(TE)[0]), process.env.NODE_ENV !== "production" && !TE[a]) throw Error("Renderer '" + a + "' is not imported. Please import it first.");
		n.useDirtyRect = n.useDirtyRect != null && n.useDirtyRect;
		var o = new TE[a](t, i, n, e), s = n.ssr || o.ssrOnly;
		this.storage = i, this.painter = o;
		var c = !Y.node && !Y.worker && !s ? new wE(o.getViewportRoot(), o.root) : null, l = n.useCoarsePointer, u = l == null || l === "auto" ? Y.touchEventsSupported : !!l, d = 44, f;
		u && (f = K(n.pointerSize, d)), this.handler = new zT(i, o, c, o.root, f), this.animation = new aE({ stage: { update: s ? null : function() {
			return r._flush(!1);
		} } }), s || this.animation.start();
	}
	return e.prototype.add = function(e) {
		this._disposed || !e || (this.storage.addRoot(e), e.addSelfToZr(this), this.refresh());
	}, e.prototype.remove = function(e) {
		this._disposed || !e || (this.storage.delRoot(e), e.removeSelfFromZr(this), this.refresh());
	}, e.prototype.configLayer = function(e, t) {
		this._disposed || (this.painter.configLayer && this.painter.configLayer(e, t), this.refresh());
	}, e.prototype.setBackgroundColor = function(e) {
		this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(e), this.refresh(), this._backgroundColor = e, this._darkMode = OE(e));
	}, e.prototype.getBackgroundColor = function() {
		return this._backgroundColor;
	}, e.prototype.setDarkMode = function(e) {
		this._darkMode = e;
	}, e.prototype.isDarkMode = function() {
		return this._darkMode;
	}, e.prototype.refreshImmediately = function(e) {
		this._disposed || this._refresh({
			animUpdate: !e,
			refresh: !0,
			refreshHover: !1
		});
	}, e.prototype._refresh = function(e) {
		e.animUpdate && this.animation.update(!0), this._needsRefresh = this._needsRefreshHover = !1, this.painter.refresh({
			refresh: e.refresh,
			refreshHover: e.refreshHover
		}), this._needsRefresh = this._needsRefreshHover = !1;
	}, e.prototype.refresh = function() {
		this._disposed || (this._needsRefresh = !0, this.animation.start());
	}, e.prototype.flush = function() {
		this._disposed || this._flush(!0);
	}, e.prototype._flush = function(e) {
		var t, n = iE(), r = this._needsRefresh, i = this._needsRefreshHover;
		(r || i) && (t = !0, this._refresh({
			animUpdate: e,
			refresh: r,
			refreshHover: i
		}));
		var a = iE();
		t ? (this._stillFrameAccum = 0, this.trigger("rendered", { elapsedTime: a - n })) : this._sleepAfterStill > 0 && (this._stillFrameAccum++, this._stillFrameAccum > this._sleepAfterStill && this.animation.stop());
	}, e.prototype.setSleepAfterStill = function(e) {
		this._sleepAfterStill = e;
	}, e.prototype.wakeUp = function() {
		this._disposed || (this.animation.start(), this._stillFrameAccum = 0);
	}, e.prototype.refreshHover = function() {
		this._needsRefreshHover = !0;
	}, e.prototype.refreshHoverImmediately = function() {
		this._disposed || this._refresh({
			animUpdate: !1,
			refresh: !1,
			refreshHover: !0
		});
	}, e.prototype.resize = function(e) {
		this._disposed || (e ||= {}, this.painter.resize(e.width, e.height), this.handler.resize());
	}, e.prototype.clearAnimation = function() {
		this._disposed || this.animation.clear();
	}, e.prototype.getWidth = function() {
		if (!this._disposed) return this.painter.getWidth();
	}, e.prototype.getHeight = function() {
		if (!this._disposed) return this.painter.getHeight();
	}, e.prototype.setCursorStyle = function(e) {
		this._disposed || this.handler.setCursorStyle(e);
	}, e.prototype.findHover = function(e, t) {
		if (!this._disposed) return this.handler.findHover(e, t);
	}, e.prototype.on = function(e, t, n) {
		return this._disposed || this.handler.on(e, t, n), this;
	}, e.prototype.off = function(e, t) {
		this._disposed || this.handler.off(e, t);
	}, e.prototype.trigger = function(e, t) {
		this._disposed || this.handler.trigger(e, t);
	}, e.prototype.clear = function() {
		if (!this._disposed) {
			for (var e = this.storage.getRoots(), t = 0; t < e.length; t++) e[t] instanceof cf && e[t].removeSelfFromZr(this);
			this.storage.delAllRoots(), this.painter.clear();
		}
	}, e.prototype.dispose = function() {
		this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, DE(this.id));
	}, e;
}();
function AE(e, t) {
	var n = new kE(Et(), e, t);
	return EE[n.id] = n, n;
}
function jE(e, t) {
	TE[e] = t;
}
var ME;
function NE(e) {
	if (typeof ME == "function") return ME(e);
}
function PE(e) {
	ME = e;
}
//#endregion
//#region node_modules/echarts/lib/model/globalDefault.js
var FE = "";
typeof navigator < "u" && (FE = navigator.platform || "");
var IE = "rgba(0, 0, 0, 0.2)", LE = Z.color.theme[0], RE = ga(LE, null, null, .9), zE = {
	darkMode: "auto",
	colorBy: "series",
	color: Z.color.theme,
	gradientColor: [RE, LE],
	aria: { decal: { decals: [
		{
			color: IE,
			dashArrayX: [1, 0],
			dashArrayY: [2, 5],
			symbolSize: 1,
			rotation: Math.PI / 6
		},
		{
			color: IE,
			symbol: "circle",
			dashArrayX: [[8, 8], [
				0,
				8,
				8,
				0
			]],
			dashArrayY: [6, 0],
			symbolSize: .8
		},
		{
			color: IE,
			dashArrayX: [1, 0],
			dashArrayY: [4, 3],
			rotation: -Math.PI / 4
		},
		{
			color: IE,
			dashArrayX: [[6, 6], [
				0,
				6,
				6,
				0
			]],
			dashArrayY: [6, 0]
		},
		{
			color: IE,
			dashArrayX: [[1, 0], [1, 6]],
			dashArrayY: [
				1,
				0,
				6,
				0
			],
			rotation: Math.PI / 4
		},
		{
			color: IE,
			symbol: "triangle",
			dashArrayX: [[9, 9], [
				0,
				9,
				9,
				0
			]],
			dashArrayY: [7, 2],
			symbolSize: .75
		}
	] } },
	textStyle: {
		fontFamily: FE.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal"
	},
	blendMode: null,
	stateAnimation: {
		duration: 300,
		easing: "cubicOut"
	},
	animation: "auto",
	animationDuration: 1e3,
	animationDurationUpdate: 500,
	animationEasing: "cubicInOut",
	animationEasingUpdate: "cubicInOut",
	animationThreshold: 2e3,
	progressiveThreshold: 3e3,
	progressive: 400,
	hoverLayerThreshold: 3e3,
	useUTC: !1
}, BE = J();
function VE(e, t, n) {
	var r = BE.get(t);
	if (!r) return n;
	var i = r(e);
	if (!i) return n;
	if (process.env.NODE_ENV !== "production") for (var a = 0; a < i.length; a++) q(Ul(i[a]));
	return n.concat(i);
}
//#endregion
//#region node_modules/echarts/lib/model/Global.js
var HE, UE, WE, GE = "\0_ec_inner", KE = 1, qE = {
	grid: "GridComponent",
	polar: "PolarComponent",
	geo: "GeoComponent",
	singleAxis: "SingleAxisComponent",
	parallel: "ParallelComponent",
	calendar: "CalendarComponent",
	matrix: "MatrixComponent",
	graphic: "GraphicComponent",
	toolbox: "ToolboxComponent",
	tooltip: "TooltipComponent",
	axisPointer: "AxisPointerComponent",
	brush: "BrushComponent",
	title: "TitleComponent",
	timeline: "TimelineComponent",
	markPoint: "MarkPointComponent",
	markLine: "MarkLineComponent",
	markArea: "MarkAreaComponent",
	legend: "LegendComponent",
	dataZoom: "DataZoomComponent",
	visualMap: "VisualMapComponent",
	xAxis: "GridComponent",
	yAxis: "GridComponent",
	angleAxis: "PolarComponent",
	radiusAxis: "PolarComponent"
}, JE = {
	line: "LineChart",
	bar: "BarChart",
	pie: "PieChart",
	scatter: "ScatterChart",
	radar: "RadarChart",
	map: "MapChart",
	tree: "TreeChart",
	treemap: "TreemapChart",
	graph: "GraphChart",
	chord: "ChordChart",
	gauge: "GaugeChart",
	funnel: "FunnelChart",
	parallel: "ParallelChart",
	sankey: "SankeyChart",
	boxplot: "BoxplotChart",
	candlestick: "CandlestickChart",
	effectScatter: "EffectScatterChart",
	lines: "LinesChart",
	heatmap: "HeatmapChart",
	pictorialBar: "PictorialBarChart",
	themeRiver: "ThemeRiverChart",
	sunburst: "SunburstChart",
	custom: "CustomChart"
}, YE = {};
function XE(e) {
	z(e, function(e, t) {
		if (!Ov.hasClass(t)) {
			var n = qE[t];
			n && !YE[n] && (vl("Component " + t + " is used but not imported.\nimport { " + n + " } from 'echarts/components';\necharts.use([" + n + "]);"), YE[n] = !0);
		}
	});
}
var ZE = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.init = function(e, t, n, r, i, a) {
		r ||= {}, this.option = null, this._theme = new zm(r), this._locale = new zm(i), this._optionManager = a;
	}, t.prototype.setOption = function(e, t, n) {
		process.env.NODE_ENV !== "production" && (q(e != null, "option is null/undefined"), q(e[GE] !== KE, "please use chart.getOption()"));
		var r = nD(t);
		this._optionManager.setOption(e, n, r), this._resetOption(null, r);
	}, t.prototype.resetOption = function(e, t) {
		return this._resetOption(e, nD(t));
	}, t.prototype._resetOption = function(e, t) {
		var n = !1, r = this._optionManager;
		if (!e || e === "recreate") {
			var i = r.mountOption(e === "recreate");
			process.env.NODE_ENV !== "production" && XE(i), !this.option || e === "recreate" ? WE(this, i) : (this.restoreData(), this._mergeOption(i, t)), n = !0;
		}
		if ((e === "timeline" || e === "media") && this.restoreData(), !e || e === "recreate" || e === "timeline") {
			var a = r.getTimelineOption(this);
			a && (n = !0, this._mergeOption(a, t));
		}
		if (!e || e === "recreate" || e === "media") {
			var o = r.getMediaOption(this);
			o.length && z(o, function(e) {
				n = !0, this._mergeOption(e, t);
			}, this);
		}
		return n;
	}, t.prototype.mergeOption = function(e) {
		this._mergeOption(e, null);
	}, t.prototype._mergeOption = function(e, t) {
		var n = this.option, r = this._componentsMap, i = this._componentsCount, a = [], o = J(), s = t && t.replaceMergeMainTypeMap;
		Gm(this), z(e, function(e, t) {
			e != null && (Ov.hasClass(t) ? t && (a.push(t), o.set(t, !0)) : n[t] = n[t] == null ? L(e) : Ot(n[t], e, !0));
		}), s && s.each(function(e, t) {
			Ov.hasClass(t) && !o.get(t) && (a.push(t), o.set(t, !0));
		}), Ov.topologicalTravel(a, Ov.getAllClassMainTypes(), c, this);
		function c(t) {
			var a = VE(this, t, Tl(e[t])), o = r.get(t), c = Al(o, a, o ? s && s.get(t) ? "replaceMerge" : "normalMerge" : "replaceAll");
			Wl(c, t, Ov), n[t] = null, r.set(t, null), i.set(t, 0);
			var l = [], u = [], d = 0, f, p;
			z(c, function(e, n) {
				var r = e.existing, i = e.newOption;
				if (!i) r && (r.mergeOption({}, this), r.optionUpdated({}, !1));
				else {
					var a = t === "series", o = Ov.getClass(t, e.keyInfo.subType, !a);
					if (!o) {
						if (process.env.NODE_ENV !== "production") {
							var s = e.keyInfo.subType, c = JE[s];
							YE[s] || (YE[s] = !0, vl(c ? "Series " + s + " is used but not imported.\nimport { " + c + " } from 'echarts/charts';\necharts.use([" + c + "]);" : "Unknown series " + s));
						}
						return;
					}
					if (t === "tooltip") {
						if (f) {
							process.env.NODE_ENV !== "production" && (p ||= (_l("Currently only one tooltip component is allowed."), !0));
							return;
						}
						f = !0;
					}
					if (r && r.constructor === o) r.name = e.keyInfo.name, r.mergeOption(i, this), r.optionUpdated(i, !1);
					else {
						var m = R({ componentIndex: n }, e.keyInfo);
						r = new o(i, this, this, m), R(r, m), e.brandNew && (r.__requireNewView = !0), r.init(i, this, this), r.optionUpdated(null, !0);
					}
				}
				r ? (l.push(r.option), u.push(r), d++) : (l.push(void 0), u.push(void 0));
			}, this), n[t] = l, r.set(t, u), i.set(t, d), t === "series" && HE(this);
		}
		this._seriesIndices || HE(this);
	}, t.prototype.getOption = function() {
		var e = L(this.option);
		return z(e, function(t, n) {
			if (Ov.hasClass(n)) {
				for (var r = Tl(t), i = r.length, a = !1, o = i - 1; o >= 0; o--) r[o] && !Ul(r[o]) ? a = !0 : (r[o] = null, !a && i--);
				r.length = i, e[n] = r;
			}
		}), delete e[GE], e;
	}, t.prototype.setTheme = function(e) {
		this._theme = new zm(e), this._resetOption("recreate", null);
	}, t.prototype.getTheme = function() {
		return this._theme;
	}, t.prototype.getLocaleModel = function() {
		return this._locale;
	}, t.prototype.setUpdatePayload = function(e) {
		this._payload = e;
	}, t.prototype.getUpdatePayload = function() {
		return this._payload;
	}, t.prototype.getComponent = function(e, t) {
		var n = this._componentsMap.get(e);
		if (n) {
			var r = n[t || 0];
			if (r) return r;
			if (t == null) {
				for (var i = 0; i < n.length; i++) if (n[i]) return n[i];
			}
		}
	}, t.prototype.queryComponents = function(e) {
		var t = e.mainType;
		if (!t) return [];
		var n = e.index, r = e.id, i = e.name, a = this._componentsMap.get(t);
		if (!a || !a.length) return [];
		var o;
		return n == null ? o = r == null ? i == null ? It(a, function(e) {
			return !!e;
		}) : eD("name", i, a) : eD("id", r, a) : (o = [], z(Tl(n), function(e) {
			a[e] && o.push(a[e]);
		})), tD(o, e);
	}, t.prototype.findComponents = function(e) {
		var t = e.query, n = e.mainType, r = i(t);
		return a(tD(r ? this.queryComponents(r) : It(this._componentsMap.get(n), function(e) {
			return !!e;
		}), e));
		function i(e) {
			var t = n + "Index", r = n + "Id", i = n + "Name";
			return e && (e[t] != null || e[r] != null || e[i] != null) ? {
				mainType: n,
				index: e[t],
				id: e[r],
				name: e[i]
			} : null;
		}
		function a(t) {
			return e.filter ? It(t, e.filter) : t;
		}
	}, t.prototype.eachComponent = function(e, t, n) {
		var r = this._componentsMap;
		if (U(e)) {
			var i = t, a = e;
			r.each(function(e, t) {
				for (var n = 0; e && n < e.length; n++) {
					var r = e[n];
					r && a.call(i, t, r, r.componentIndex);
				}
			});
		} else for (var o = W(e) ? r.get(e) : G(e) ? this.findComponents(e) : null, s = 0; o && s < o.length; s++) {
			var c = o[s];
			c && t.call(n, c, c.componentIndex);
		}
	}, t.prototype.getSeriesByName = function(e) {
		var t = zl(e, null);
		return It(this._componentsMap.get("series"), function(e) {
			return !!e && t != null && e.name === t;
		});
	}, t.prototype.getSeriesByIndex = function(e) {
		return this._componentsMap.get("series")[e];
	}, t.prototype.getSeriesByType = function(e) {
		return It(this._componentsMap.get("series"), function(t) {
			return !!t && t.subType === e;
		});
	}, t.prototype.getSeries = function() {
		return It(this._componentsMap.get("series"), function(e) {
			return !!e;
		});
	}, t.prototype.getSeriesCount = function() {
		return this._componentsCount.get("series");
	}, t.prototype.eachSeries = function(e, t) {
		UE(this), z(this._seriesIndices, function(n) {
			var r = this._componentsMap.get("series")[n];
			e.call(t, r, n);
		}, this);
	}, t.prototype.eachRawSeries = function(e, t) {
		z(this._componentsMap.get("series"), function(n) {
			n && e.call(t, n, n.componentIndex);
		});
	}, t.prototype.eachSeriesByType = function(e, t, n) {
		UE(this), z(this._seriesIndices, function(r) {
			var i = this._componentsMap.get("series")[r];
			i.subType === e && t.call(n, i, r);
		}, this);
	}, t.prototype.eachRawSeriesByType = function(e, t, n) {
		return z(this.getSeriesByType(e), t, n);
	}, t.prototype.isSeriesFiltered = function(e) {
		return UE(this), this._seriesIndicesMap.get(e.componentIndex) == null;
	}, t.prototype.getCurrentSeriesIndices = function() {
		return (this._seriesIndices || []).slice();
	}, t.prototype.filterSeries = function(e, t) {
		UE(this);
		var n = [];
		z(this._seriesIndices, function(r) {
			var i = this._componentsMap.get("series")[r];
			e.call(t, i, r) && n.push(r);
		}, this), this._seriesIndices = n, this._seriesIndicesMap = J(n);
	}, t.prototype.restoreData = function(e) {
		HE(this);
		var t = this._componentsMap, n = [];
		t.each(function(e, t) {
			Ov.hasClass(t) && n.push(t);
		}), Ov.topologicalTravel(n, Ov.getAllClassMainTypes(), function(n) {
			z(t.get(n), function(t) {
				t && (n !== "series" || !QE(t, e)) && t.restoreData();
			});
		});
	}, t.internalField = function() {
		HE = function(e) {
			var t = e._seriesIndices = [];
			z(e._componentsMap.get("series"), function(e) {
				e && t.push(e.componentIndex);
			}), e._seriesIndicesMap = J(t);
		}, UE = function(e) {
			if (process.env.NODE_ENV !== "production" && !e._seriesIndices) throw Error("Option should contains series.");
		}, WE = function(e, t) {
			e.option = {}, e.option[GE] = KE, e._componentsMap = J({ series: [] }), e._componentsCount = J();
			var n = t.aria;
			G(n) && n.enabled == null && (n.enabled = !0), $E(t, e._theme.option), Ot(t, zE, !1), e._mergeOption(t, null);
		};
	}(), t;
}(zm);
function QE(e, t) {
	if (t) {
		var n = t.seriesIndex, r = t.seriesId, i = t.seriesName;
		return n != null && e.componentIndex !== n || r != null && e.id !== r || i != null && e.name !== i;
	}
}
function $E(e, t) {
	var n = e.color && !e.colorLayer;
	z(t, function(t, r) {
		r === "colorLayer" && n || r === "color" && e.color || Ov.hasClass(r) || (typeof t == "object" ? e[r] = e[r] ? Ot(e[r], t, !1) : L(t) : e[r] ?? (e[r] = t));
	});
}
function eD(e, t, n) {
	if (H(t)) {
		var r = J();
		return z(t, function(e) {
			e != null && zl(e, null) != null && r.set(e, !0);
		}), It(n, function(t) {
			return t && r.get(t[e]);
		});
	} else {
		var i = zl(t, null);
		return It(n, function(t) {
			return t && i != null && t[e] === i;
		});
	}
}
function tD(e, t) {
	return t.hasOwnProperty("subType") ? It(e, function(e) {
		return e && e.subType === t.subType;
	}) : e;
}
function nD(e) {
	var t = J();
	return e && z(Tl(e.replaceMerge), function(e) {
		process.env.NODE_ENV !== "production" && q(Ov.hasClass(e), "\"" + e + "\" is not valid component main type in \"replaceMerge\""), t.set(e, !0);
	}), { replaceMergeMainTypeMap: t };
}
Nt(ZE, Mv);
//#endregion
//#region node_modules/echarts/lib/model/OptionManager.js
var rD = /^(min|max)?(.+)$/, iD = function() {
	function e(e) {
		this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = e;
	}
	return e.prototype.setOption = function(e, t, n) {
		e && (z(Tl(e.series), function(e) {
			e && e.data && Wt(e.data) && tn(e.data);
		}), z(Tl(e.dataset), function(e) {
			e && e.source && Wt(e.source) && tn(e.source);
		})), e = L(e);
		var r = this._optionBackup, i = aD(e, t, !r);
		this._newBaseOption = i.baseOption, r ? (i.timelineOptions.length && (r.timelineOptions = i.timelineOptions), i.mediaList.length && (r.mediaList = i.mediaList), i.mediaDefault && (r.mediaDefault = i.mediaDefault)) : this._optionBackup = i;
	}, e.prototype.mountOption = function(e) {
		var t = this._optionBackup;
		return this._timelineOptions = t.timelineOptions, this._mediaList = t.mediaList, this._mediaDefault = t.mediaDefault, this._currentMediaIndices = [], L(e ? t.baseOption : this._newBaseOption);
	}, e.prototype.getTimelineOption = function(e) {
		var t, n = this._timelineOptions;
		if (n.length) {
			var r = e.getComponent("timeline");
			r && (t = L(n[r.getCurrentIndex()]));
		}
		return t;
	}, e.prototype.getMediaOption = function(e) {
		var t = this._api.getWidth(), n = this._api.getHeight(), r = this._mediaList, i = this._mediaDefault, a = [], o = [];
		if (!r.length && !i) return o;
		for (var s = 0, c = r.length; s < c; s++) oD(r[s].query, t, n) && a.push(s);
		return !a.length && i && (a = [-1]), a.length && !cD(a, this._currentMediaIndices) && (o = B(a, function(e) {
			return L(e === -1 ? i.option : r[e].option);
		})), this._currentMediaIndices = a, o;
	}, e;
}();
function aD(e, t, n) {
	var r = [], i, a, o = e.baseOption, s = e.timeline, c = e.options, l = e.media, u = !!e.media, d = !!(c || s || o && o.timeline);
	o ? (a = o, a.timeline ||= s) : ((d || u) && (e.options = e.media = null), a = e), u && (H(l) ? z(l, function(e) {
		process.env.NODE_ENV !== "production" && e && !e.option && G(e.query) && G(e.query.option) && vl("Illegal media option. Must be like { media: [ { query: {}, option: {} } ] }"), e && e.option && (e.query ? r.push(e) : i ||= e);
	}) : process.env.NODE_ENV !== "production" && vl("Illegal media option. Must be an array. Like { media: [ {...}, {...} ] }")), f(a), z(c, function(e) {
		return f(e);
	}), z(r, function(e) {
		return f(e.option);
	});
	function f(e) {
		z(t, function(t) {
			t(e, n);
		});
	}
	return {
		baseOption: a,
		timelineOptions: c || [],
		mediaDefault: i,
		mediaList: r
	};
}
function oD(e, t, n) {
	var r = {
		width: t,
		height: n,
		aspectratio: t / n
	}, i = !0;
	return z(e, function(e, t) {
		var n = t.match(rD);
		if (!(!n || !n[1] || !n[2])) {
			var a = n[1];
			sD(r[n[2].toLowerCase()], e, a) || (i = !1);
		}
	}), i;
}
function sD(e, t, n) {
	return n === "min" ? e >= t : n === "max" ? e <= t : e === t;
}
function cD(e, t) {
	return e.join(",") === t.join(",");
}
//#endregion
//#region node_modules/echarts/lib/preprocessor/helper/compatStyle.js
var lD = z, uD = G, dD = [
	"areaStyle",
	"lineStyle",
	"nodeStyle",
	"linkStyle",
	"chordStyle",
	"label",
	"labelLine"
];
function fD(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0, r = dD.length; n < r; n++) {
		var i = dD[n], a = t.normal, o = t.emphasis;
		a && a[i] && (process.env.NODE_ENV !== "production" && bl("itemStyle.normal." + i, i), e[i] = e[i] || {}, e[i].normal ? Ot(e[i].normal, a[i]) : e[i].normal = a[i], a[i] = null), o && o[i] && (process.env.NODE_ENV !== "production" && bl("itemStyle.emphasis." + i, "emphasis." + i), e[i] = e[i] || {}, e[i].emphasis ? Ot(e[i].emphasis, o[i]) : e[i].emphasis = o[i], o[i] = null);
	}
}
function pD(e, t, n) {
	if (e && e[t] && (e[t].normal || e[t].emphasis)) {
		var r = e[t].normal, i = e[t].emphasis;
		r && (process.env.NODE_ENV !== "production" && yl("'normal' hierarchy in " + t + " has been removed since 4.0. All style properties are configured in " + t + " directly now."), n ? (e[t].normal = e[t].emphasis = null, At(e[t], r)) : e[t] = r), i && (process.env.NODE_ENV !== "production" && yl(t + ".emphasis has been changed to emphasis." + t + " since 4.0"), e.emphasis = e.emphasis || {}, e.emphasis[t] = i, i.focus && (e.emphasis.focus = i.focus), i.blurScope && (e.emphasis.blurScope = i.blurScope));
	}
}
function mD(e) {
	pD(e, "itemStyle"), pD(e, "lineStyle"), pD(e, "areaStyle"), pD(e, "label"), pD(e, "labelLine"), pD(e, "upperLabel"), pD(e, "edgeLabel");
}
function hD(e, t) {
	var n = uD(e) && e[t], r = uD(n) && n.textStyle;
	if (r) {
		process.env.NODE_ENV !== "production" && yl("textStyle hierarchy in " + t + " has been removed since 4.0. All textStyle properties are configured in " + t + " directly now.");
		for (var i = 0, a = Dl.length; i < a; i++) {
			var o = Dl[i];
			r.hasOwnProperty(o) && (n[o] = r[o]);
		}
	}
}
function gD(e) {
	e && (mD(e), hD(e, "label"), e.emphasis && hD(e.emphasis, "label"));
}
function _D(e) {
	if (uD(e)) {
		fD(e), mD(e), hD(e, "label"), hD(e, "upperLabel"), hD(e, "edgeLabel"), e.emphasis && (hD(e.emphasis, "label"), hD(e.emphasis, "upperLabel"), hD(e.emphasis, "edgeLabel"));
		var t = e.markPoint;
		t && (fD(t), gD(t));
		var n = e.markLine;
		n && (fD(n), gD(n));
		var r = e.markArea;
		r && gD(r);
		var i = e.data;
		if (e.type === "graph") {
			i ||= e.nodes;
			var a = e.links || e.edges;
			if (a && !Wt(a)) for (var o = 0; o < a.length; o++) gD(a[o]);
			z(e.categories, function(e) {
				mD(e);
			});
		}
		if (i && !Wt(i)) for (var o = 0; o < i.length; o++) gD(i[o]);
		if (t = e.markPoint, t && t.data) for (var s = t.data, o = 0; o < s.length; o++) gD(s[o]);
		if (n = e.markLine, n && n.data) for (var c = n.data, o = 0; o < c.length; o++) H(c[o]) ? (gD(c[o][0]), gD(c[o][1])) : gD(c[o]);
		e.type === "gauge" ? (hD(e, "axisLabel"), hD(e, "title"), hD(e, "detail")) : e.type === "treemap" ? (pD(e.breadcrumb, "itemStyle"), z(e.levels, function(e) {
			mD(e);
		})) : e.type === "tree" && mD(e.leaves);
	}
}
function vD(e) {
	return H(e) ? e : e ? [e] : [];
}
function yD(e) {
	return (H(e) ? e[0] : e) || {};
}
function bD(e, t) {
	lD(vD(e.series), function(e) {
		uD(e) && _D(e);
	});
	var n = [
		"xAxis",
		"yAxis",
		"radiusAxis",
		"angleAxis",
		"singleAxis",
		"parallelAxis",
		"radar"
	];
	t && n.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), lD(n, function(t) {
		lD(vD(e[t]), function(e) {
			e && (hD(e, "axisLabel"), hD(e.axisPointer, "label"));
		});
	}), lD(vD(e.parallel), function(e) {
		var t = e && e.parallelAxisDefault;
		hD(t, "axisLabel"), hD(t && t.axisPointer, "label");
	}), lD(vD(e.calendar), function(e) {
		pD(e, "itemStyle"), hD(e, "dayLabel"), hD(e, "monthLabel"), hD(e, "yearLabel");
	}), lD(vD(e.radar), function(e) {
		hD(e, "name"), e.name && e.axisName == null && (e.axisName = e.name, delete e.name, process.env.NODE_ENV !== "production" && yl("name property in radar component has been changed to axisName")), e.nameGap != null && e.axisNameGap == null && (e.axisNameGap = e.nameGap, delete e.nameGap, process.env.NODE_ENV !== "production" && yl("nameGap property in radar component has been changed to axisNameGap")), process.env.NODE_ENV !== "production" && lD(e.indicator, function(e) {
			e.text && bl("text", "name", "radar.indicator");
		});
	}), lD(vD(e.geo), function(e) {
		uD(e) && (gD(e), lD(vD(e.regions), function(e) {
			gD(e);
		}));
	}), lD(vD(e.timeline), function(e) {
		gD(e), pD(e, "label"), pD(e, "itemStyle"), pD(e, "controlStyle", !0);
		var t = e.data;
		H(t) && z(t, function(e) {
			G(e) && (pD(e, "label"), pD(e, "itemStyle"));
		});
	}), lD(vD(e.toolbox), function(e) {
		pD(e, "iconStyle"), lD(e.feature, function(e) {
			pD(e, "iconStyle");
		});
	}), hD(yD(e.axisPointer), "label"), hD(yD(e.tooltip).axisPointer, "label");
}
//#endregion
//#region node_modules/echarts/lib/preprocessor/backwardCompat.js
function xD(e, t) {
	for (var n = t.split(","), r = e, i = 0; i < n.length && (r &&= r[n[i]], r != null); i++);
	return r;
}
function SD(e, t, n, r) {
	for (var i = t.split(","), a = e, o, s = 0; s < i.length - 1; s++) o = i[s], a[o] ?? (a[o] = {}), a = a[o];
	(r || a[i[s]] == null) && (a[i[s]] = n);
}
function CD(e) {
	e && z(wD, function(t) {
		t[0] in e && !(t[1] in e) && (e[t[1]] = e[t[0]]);
	});
}
var wD = [
	["x", "left"],
	["y", "top"],
	["x2", "right"],
	["y2", "bottom"]
], TD = [
	"grid",
	"geo",
	"parallel",
	"legend",
	"toolbox",
	"title",
	"visualMap",
	"dataZoom",
	"timeline"
], ED = [
	["borderRadius", "barBorderRadius"],
	["borderColor", "barBorderColor"],
	["borderWidth", "barBorderWidth"]
];
function DD(e) {
	var t = e && e.itemStyle;
	if (t) for (var n = 0; n < ED.length; n++) {
		var r = ED[n][1], i = ED[n][0];
		t[r] != null && (t[i] = t[r], process.env.NODE_ENV !== "production" && bl(r, i));
	}
}
function OD(e) {
	e && e.alignTo === "edge" && e.margin != null && e.edgeDistance == null && (process.env.NODE_ENV !== "production" && bl("label.margin", "label.edgeDistance", "pie"), e.edgeDistance = e.margin);
}
function kD(e) {
	e && e.downplay && !e.blur && (e.blur = e.downplay, process.env.NODE_ENV !== "production" && bl("downplay", "blur", "sunburst"));
}
function AD(e) {
	e && e.focusNodeAdjacency != null && (e.emphasis = e.emphasis || {}, e.emphasis.focus ?? (process.env.NODE_ENV !== "production" && bl("focusNodeAdjacency", "emphasis: { focus: 'adjacency'}", "graph/sankey"), e.emphasis.focus = "adjacency"));
}
function jD(e, t) {
	if (e) for (var n = 0; n < e.length; n++) t(e[n]), e[n] && jD(e[n].children, t);
}
function MD(e, t) {
	bD(e, t), e.series = Tl(e.series), z(e.series, function(e) {
		if (G(e)) {
			var t = e.type;
			if (t === "line") e.clipOverflow != null && (e.clip = e.clipOverflow, process.env.NODE_ENV !== "production" && bl("clipOverflow", "clip", "line"));
			else if (t === "pie" || t === "gauge") {
				e.clockWise != null && (e.clockwise = e.clockWise, process.env.NODE_ENV !== "production" && bl("clockWise", "clockwise")), OD(e.label);
				var n = e.data;
				if (n && !Wt(n)) for (var r = 0; r < n.length; r++) OD(n[r]);
				e.hoverOffset != null && (e.emphasis = e.emphasis || {}, (e.emphasis.scaleSize = null) && (process.env.NODE_ENV !== "production" && bl("hoverOffset", "emphasis.scaleSize"), e.emphasis.scaleSize = e.hoverOffset));
			} else if (t === "gauge") {
				var i = xD(e, "pointer.color");
				i != null && SD(e, "itemStyle.color", i);
			} else if (t === "bar") {
				DD(e), DD(e.backgroundStyle), DD(e.emphasis);
				var n = e.data;
				if (n && !Wt(n)) for (var r = 0; r < n.length; r++) typeof n[r] == "object" && (DD(n[r]), DD(n[r] && n[r].emphasis));
			} else if (t === "sunburst") {
				var a = e.highlightPolicy;
				a && (e.emphasis = e.emphasis || {}, e.emphasis.focus || (e.emphasis.focus = a, process.env.NODE_ENV !== "production" && bl("highlightPolicy", "emphasis.focus", "sunburst"))), kD(e), jD(e.data, kD);
			} else t === "graph" || t === "sankey" ? AD(e) : t === "map" && (e.mapType && !e.map && (process.env.NODE_ENV !== "production" && bl("mapType", "map", "map"), e.map = e.mapType), e.mapLocation && (process.env.NODE_ENV !== "production" && yl("`mapLocation` is not used anymore."), At(e, e.mapLocation)));
			e.hoverAnimation != null && (e.emphasis = e.emphasis || {}, e.emphasis && e.emphasis.scale == null && (process.env.NODE_ENV !== "production" && bl("hoverAnimation", "emphasis.scale"), e.emphasis.scale = e.hoverAnimation)), CD(e);
		}
	}), e.dataRange && (e.visualMap = e.dataRange), z(TD, function(t) {
		var n = e[t];
		n && (H(n) || (n = [n]), z(n, function(e) {
			CD(e);
		}));
	});
}
//#endregion
//#region node_modules/echarts/lib/processor/dataStack.js
var ND = yu(PD);
function PD(e) {
	var t = J();
	e.eachSeries(function(e) {
		var n = e.get("stack");
		if (n) {
			var r = t.get(n) || t.set(n, []), i = e.getData(), a = {
				stackResultDimension: i.getCalculationInfo("stackResultDimension"),
				stackedOverDimension: i.getCalculationInfo("stackedOverDimension"),
				stackedDimension: i.getCalculationInfo("stackedDimension"),
				stackedByDimension: i.getCalculationInfo("stackedByDimension"),
				isStackedByIndex: i.getCalculationInfo("isStackedByIndex"),
				data: i,
				seriesModel: e
			};
			if (!a.stackedDimension || !(a.isStackedByIndex || a.stackedByDimension)) return;
			r.push(a);
		}
	}), t.each(function(e) {
		e.length !== 0 && ((e[0].seriesModel.get("stackOrder") || "seriesAsc") === "seriesDesc" && e.reverse(), z(e, function(t, n) {
			t.data.setCalculationInfo("stackedOnSeries", n > 0 ? e[n - 1].seriesModel : null);
		}), FD(e));
	});
}
function FD(e) {
	z(e, function(t, n) {
		var r = [], i = [NaN, NaN], a = [t.stackResultDimension, t.stackedOverDimension], o = t.data, s = t.isStackedByIndex, c = t.seriesModel.get("stackStrategy") || "samesign";
		o.modify(a, function(a, l, u) {
			var d = o.get(t.stackedDimension, u);
			if (isNaN(d)) return i;
			var f, p;
			s ? p = o.getRawIndex(u) : f = o.get(t.stackedByDimension, u);
			for (var m = NaN, h = n - 1; h >= 0; h--) {
				var g = e[h];
				if (s || (p = g.data.rawIndexOf(g.stackedByDimension, f)), p >= 0) {
					var _ = g.data.getByRawIndex(g.stackResultDimension, p);
					if (c === "all" || c === "positive" && _ > 0 || c === "negative" && _ < 0 || c === "samesign" && d >= 0 && _ > 0 || c === "samesign" && d <= 0 && _ < 0) {
						d = Zc(d, _), m = _;
						break;
					}
				}
			}
			return r[0] = d, r[1] = m, r;
		});
	});
}
//#endregion
//#region node_modules/echarts/lib/view/Component.js
var ID = function() {
	function e() {
		this.group = new cf(), this.uid = Hg("viewComponent");
	}
	return e.prototype.init = function(e, t) {}, e.prototype.render = function(e, t, n, r) {}, e.prototype.dispose = function(e, t) {}, e.prototype.updateView = function(e, t, n, r) {}, e.prototype.updateLayout = function(e, t, n, r) {}, e.prototype.updateVisual = function(e, t, n, r) {}, e.prototype.toggleBlurSeries = function(e, t, n) {}, e.prototype.eachRendered = function(e) {
		var t = this.group;
		t && t.traverse(e);
	}, e;
}();
xn(ID), On(ID);
//#endregion
//#region node_modules/echarts/lib/visual/style.js
var LD = ql(), RD = {
	itemStyle: kn(Im, !0),
	lineStyle: kn(Nm, !0)
}, zD = {
	lineStyle: "stroke",
	itemStyle: "fill"
};
function BD(e, t) {
	return e.visualStyleMapper || RD[t] || (console.warn("Unknown style type '" + t + "'."), RD.itemStyle);
}
function VD(e, t) {
	return e.visualDrawType || zD[t] || (console.warn("Unknown style type '" + t + "'."), "fill");
}
var HD = {
	createOnAllSeries: !0,
	performRawSeries: !0,
	reset: function(e, t) {
		var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = e.getModel(r), a = BD(e, r)(i), o = i.getShallow("decal");
		o && (n.setVisual("decal", o), o.dirty = !0);
		var s = VD(e, r), c = a[s], l = U(c) ? c : null, u = a.fill === "auto" || a.stroke === "auto";
		if (!a[s] || l || u) {
			var d = e.getColorFromPalette(e.name, null, t.getSeriesCount());
			a[s] || (a[s] = d, n.setVisual("colorFromPalette", !0)), a.fill = a.fill === "auto" || U(a.fill) ? d : a.fill, a.stroke = a.stroke === "auto" || U(a.stroke) ? d : a.stroke;
		}
		if (n.setVisual("style", a), n.setVisual("drawType", s), !t.isSeriesFiltered(e) && l) return n.setVisual("colorFromPalette", !1), { dataEach: function(t, n) {
			var r = e.getDataParams(n), i = R({}, a);
			i[s] = l(r), t.setItemVisual(n, "style", i);
		} };
	}
}, UD = new zm(), WD = {
	createOnAllSeries: !0,
	reset: function(e, t) {
		if (!e.ignoreStyleOnData) {
			var n = e.getData(), r = e.visualStyleAccessPath || "itemStyle", i = BD(e, r), a = n.getVisual("drawType");
			return { dataEach: n.hasItemOption ? function(e, t) {
				var n = e.getRawDataItem(t);
				if (n && n[r]) {
					UD.option = n[r];
					var o = i(UD);
					R(e.ensureUniqueItemVisual(t, "style"), o), UD.option.decal && (e.setItemVisual(t, "decal", UD.option.decal), UD.option.decal.dirty = !0), a in o && e.setItemVisual(t, "colorFromPalette", !1);
				}
			} : null };
		}
	}
}, GD = {
	performRawSeries: !0,
	overallReset: function(e) {
		var t = J();
		e.eachSeries(function(e) {
			if (!e.isColorBySeries()) {
				var n = e.type + "-" + e.getColorBy();
				LD(e).scope = t.get(n) || t.set(n, {});
			}
		}), e.eachSeries(function(e) {
			if (!e.isColorBySeries()) {
				var t = e.getRawData(), n = {}, r = e.getData(), i = LD(e).scope, a = VD(e, e.visualStyleAccessPath || "itemStyle");
				r.each(function(e) {
					var t = r.getRawIndex(e);
					n[t] = e;
				}), t.each(function(o) {
					var s = n[o];
					if (r.getItemVisual(s, "colorFromPalette")) {
						var c = r.ensureUniqueItemVisual(s, "style"), l = t.getName(o) || o + "", u = t.count();
						c[a] = e.getColorFromPalette(l, i, u);
					}
				});
			}
		});
	}
}, KD = Math.PI;
function qD(e, t) {
	t ||= {}, At(t, {
		text: "loading",
		textColor: Z.color.primary,
		fontSize: 12,
		fontWeight: "normal",
		fontStyle: "normal",
		fontFamily: "sans-serif",
		maskColor: "rgba(255,255,255,0.8)",
		showSpinner: !0,
		color: Z.color.theme[0],
		spinnerRadius: 10,
		lineWidth: 5,
		zlevel: 0
	});
	var n = new cf(), r = new cc({
		style: { fill: t.maskColor },
		zlevel: t.zlevel,
		z: 1e4
	});
	n.add(r);
	var i = new pc({
		style: {
			text: t.text,
			fill: t.textColor,
			fontSize: t.fontSize,
			fontWeight: t.fontWeight,
			fontStyle: t.fontStyle,
			fontFamily: t.fontFamily
		},
		zlevel: t.zlevel,
		z: 10001
	}), a = new cc({
		style: { fill: "none" },
		textContent: i,
		textConfig: {
			position: "right",
			distance: 10
		},
		zlevel: t.zlevel,
		z: 10001
	});
	n.add(a);
	var o;
	return t.showSpinner && (o = new Kf({
		shape: {
			startAngle: -KD / 2,
			endAngle: -KD / 2 + .1,
			r: t.spinnerRadius
		},
		style: {
			stroke: t.color,
			lineCap: "round",
			lineWidth: t.lineWidth
		},
		zlevel: t.zlevel,
		z: 10001
	}), o.animateShape(!0).when(1e3, { endAngle: KD * 3 / 2 }).start("circularInOut"), o.animateShape(!0).when(1e3, { startAngle: KD * 3 / 2 }).delay(300).start("circularInOut"), n.add(o)), n.resize = function() {
		var n = i.getBoundingRect().width, s = t.showSpinner ? t.spinnerRadius : 0, c = (e.getWidth() - s * 2 - (t.showSpinner && n ? 10 : 0) - n) / 2 - (t.showSpinner && n ? 0 : 5 + n / 2) + (t.showSpinner ? 0 : n / 2) + (n ? 0 : s), l = e.getHeight() / 2;
		t.showSpinner && o.setShape({
			cx: c,
			cy: l
		}), a.setShape({
			x: c - s,
			y: l - s,
			width: s * 2,
			height: s * 2
		}), r.setShape({
			x: 0,
			y: 0,
			width: e.getWidth(),
			height: e.getHeight()
		});
	}, n.resize(), n;
}
//#endregion
//#region node_modules/echarts/lib/core/Scheduler.js
var JD = function() {
	function e(e, t, n, r) {
		this._stageTaskMap = J(), this.ecInstance = e, this.api = t, n = this._dataProcessorHandlers = n.slice(), r = this._visualHandlers = r.slice(), this._allHandlers = n.concat(r);
	}
	return e.prototype.restoreData = function(e, t) {
		e.restoreData(t), this._stageTaskMap.each(function(e) {
			var t = e.overallTask;
			t && t.dirty();
		});
	}, e.prototype.getPerformArgs = function(e, t) {
		if (e.__pipeline) {
			var n = this._pipelineMap.get(e.__pipeline.id), r = n.context, i = !t && n.progressiveEnabled && (!r || r.progressiveRender) && e.__idxInPipeline > n.blockIndex ? n.step : null, a = r && r.modDataCount;
			return {
				step: i,
				modBy: a == null ? null : Math.ceil(a / i),
				modDataCount: a
			};
		}
	}, e.prototype.getPipeline = function(e) {
		return this._pipelineMap.get(e);
	}, e.prototype.updateStreamModes = function(e, t) {
		var n = this._pipelineMap.get(e.uid);
		e.pipelineContext = n.context = e.__preparePipelineContext ? e.__preparePipelineContext(t, n) : vu(e, t, n);
	}, e.prototype.restorePipelines = function(e, t) {
		var n = this, r = n._pipelineMap = J();
		t.eachSeries(function(t) {
			var i = e.painter.type === "canvas" && t.getProgressive(), a = t.uid;
			r.set(a, {
				id: a,
				head: null,
				tail: null,
				threshold: t.getProgressiveThreshold(),
				progressiveEnabled: i && !(t.preventIncremental && t.preventIncremental()),
				blockIndex: -1,
				step: Math.round(i || 700),
				count: 0
			}), n._pipe(t, t.dataTask);
		});
	}, e.prototype.prepareStageTasks = function() {
		var e = this._stageTaskMap, t = this.api.getModel(), n = this.api;
		z(this._allHandlers, function(r) {
			var i = e.get(r.uid) || e.set(r.uid, {}), a = "";
			process.env.NODE_ENV !== "production" && (a = "\"reset\" and \"overallReset\" must not be both specified."), q(!(r.reset && r.overallReset), a), r.reset && this._createSeriesStageTask(r, i, t, n), r.overallReset && this._createOverallStageTask(r, i, t, n);
		}, this);
	}, e.prototype.prepareView = function(e, t, n, r) {
		var i = e.renderTask, a = i.context;
		a.model = t, a.ecModel = n, a.api = r, i.__block = !e.incrementalPrepareRender, this._pipe(t, i);
	}, e.prototype.performDataProcessorTasks = function(e, t) {
		this._performStageTasks(this._dataProcessorHandlers, e, t, { block: !0 });
	}, e.prototype.performVisualTasks = function(e, t, n) {
		this._performStageTasks(this._visualHandlers, e, t, n);
	}, e.prototype._performStageTasks = function(e, t, n, r) {
		r ||= {};
		var i = !1, a = this;
		z(e, function(e, s) {
			if (!(r.visualType && r.visualType !== e.visualType)) {
				var c = a._stageTaskMap.get(e.uid), l = c.seriesTaskMap, u = c.overallTask;
				if (u) {
					var d, f = u.agentStubMap;
					f.each(function(e) {
						o(r, e) && (e.dirty(), d = !0);
					}), d && u.dirty(), a.updatePayload(u, n);
					var p = a.getPerformArgs(u, r.block);
					f.each(function(e) {
						e.perform(p);
					}), u.perform(p) && (i = !0);
				} else l && l.each(function(s, c) {
					o(r, s) && s.dirty();
					var l = a.getPerformArgs(s, r.block);
					l.skip = !e.performRawSeries && t.isSeriesFiltered(s.context.model), a.updatePayload(s, n), s.perform(l) && (i = !0);
				});
			}
		});
		function o(e, t) {
			return e.setDirty && (!e.dirtyMap || e.dirtyMap.get(t.__pipeline.id));
		}
		this.unfinished = i || this.unfinished;
	}, e.prototype.performSeriesTasks = function(e) {
		var t;
		e.eachSeries(function(e) {
			t = e.dataTask.perform() || t;
		}), this.unfinished = t || this.unfinished;
	}, e.prototype.plan = function() {
		this._pipelineMap.each(function(e) {
			var t = e.tail;
			do {
				if (t.__block) {
					e.blockIndex = t.__idxInPipeline;
					break;
				}
				t = t.getUpstream();
			} while (t);
		});
	}, e.prototype.updatePayload = function(e, t) {
		t !== "remain" && (e.context.payload = t);
	}, e.prototype._createSeriesStageTask = function(e, t, n, r) {
		var i = this, a = t.seriesTaskMap, o = t.seriesTaskMap = J(), s = e.seriesType, c = e.getTargetSeries;
		e.createOnAllSeries ? n.eachRawSeries(l) : s ? n.eachRawSeriesByType(s, l) : c && c(n, r).each(l);
		function l(t) {
			var s = t.uid, c = o.set(s, a && a.get(s) || Bv({
				plan: $D,
				reset: eO,
				count: rO
			}));
			c.context = {
				model: t,
				ecModel: n,
				api: r,
				useClearVisual: e.isVisual && !e.isLayout,
				plan: e.plan,
				reset: e.reset,
				scheduler: i
			}, i._pipe(t, c);
		}
	}, e.prototype._createOverallStageTask = function(e, t, n, r) {
		var i = this, a = t.overallTask = t.overallTask || Bv({ reset: YD });
		a.context = {
			ecModel: n,
			api: r,
			overallReset: e.overallReset,
			scheduler: i
		};
		var o = a.agentStubMap, s = a.agentStubMap = J(), c = e.seriesType, l = e.getTargetSeries, u = e.dirtyOnOverallProgress, d = !1, f = "";
		process.env.NODE_ENV !== "production" && (f = "\"createOnAllSeries\" is not supported for \"overallReset\", because it will block all streams."), q(!e.createOnAllSeries, f), c ? n.eachRawSeriesByType(c, p) : l ? l(n, r).each(p) : z(n.getSeries(), p);
		function p(e) {
			var t = e.uid, n = s.set(t, o && o.get(t) || (d = !0, Bv({
				reset: XD,
				onDirty: QD
			})));
			n.context = {
				model: e,
				dirtyOnOverallProgress: u
			}, n.agent = a, n.__block = u, i._pipe(e, n);
		}
		d && a.dirty();
	}, e.prototype._pipe = function(e, t) {
		var n = e.uid, r = this._pipelineMap.get(n);
		!r.head && (r.head = t), r.tail && r.tail.pipe(t), r.tail = t, t.__idxInPipeline = r.count++, t.__pipeline = r;
	}, e.wrapStageHandler = function(e, t) {
		return U(e) && (e = {
			overallReset: e,
			seriesType: iO(e)
		}), e.uid = Hg("stageHandler"), t && (e.visualType = t), e;
	}, e;
}();
function YD(e) {
	e.overallReset(e.ecModel, e.api, e.payload);
}
function XD(e) {
	return e.dirtyOnOverallProgress && ZD;
}
function ZD() {
	this.agent.dirty(), this.getDownstream().dirty();
}
function QD() {
	this.agent && this.agent.dirty();
}
function $D(e) {
	return e.plan ? e.plan(e.model, e.ecModel, e.api, e.payload) : null;
}
function eO(e) {
	e.useClearVisual && e.data.clearAllVisual();
	var t = e.resetDefines = Tl(e.reset(e.model, e.ecModel, e.api, e.payload));
	return t.length > 1 ? B(t, function(e, t) {
		return nO(t);
	}) : tO;
}
var tO = nO(0);
function nO(e) {
	return function(t, n) {
		var r = n.data, i = n.resetDefines[e];
		if (i && i.dataEach) for (var a = t.start; a < t.end; a++) i.dataEach(r, a);
		else i && i.progress && i.progress(t, r);
	};
}
function rO(e) {
	return e.data.count();
}
function iO(e) {
	sO = null;
	try {
		e(aO, oO);
	} catch {}
	return sO;
}
var aO = {}, oO = {}, sO;
cO(aO, ZE), cO(oO, ju), aO.eachSeriesByType = aO.eachRawSeriesByType = function(e) {
	sO = e;
}, aO.eachComponent = function(e) {
	e.mainType === "series" && e.subType && (sO = e.subType);
};
function cO(e, t) {
	for (var n in t.prototype) e[n] = dn;
}
//#endregion
//#region node_modules/echarts/lib/theme/dark.js
var Q = Z.darkColor, lO = Q.background, uO = function() {
	return {
		axisLine: { lineStyle: { color: Q.axisLine } },
		splitLine: { lineStyle: { color: Q.axisSplitLine } },
		splitArea: { areaStyle: { color: [Q.backgroundTint, Q.backgroundTransparent] } },
		minorSplitLine: { lineStyle: { color: Q.axisMinorSplitLine } },
		axisLabel: { color: Q.axisLabel },
		axisName: {}
	};
}, dO = {
	label: { color: Q.secondary },
	itemStyle: { borderColor: Q.borderTint },
	dividerLineStyle: { color: Q.border }
}, fO = {
	darkMode: !0,
	color: Q.theme,
	backgroundColor: lO,
	axisPointer: {
		lineStyle: { color: Q.border },
		crossStyle: { color: Q.borderShade },
		label: { color: Q.tertiary }
	},
	legend: {
		textStyle: { color: Q.secondary },
		pageTextStyle: { color: Q.tertiary }
	},
	textStyle: { color: Q.secondary },
	title: {
		textStyle: { color: Q.primary },
		subtextStyle: { color: Q.quaternary }
	},
	toolbox: {
		iconStyle: { borderColor: Q.accent50 },
		feature: { dataView: {
			backgroundColor: lO,
			textColor: Q.primary,
			textareaColor: Q.background,
			textareaBorderColor: Q.border,
			buttonColor: Q.accent50,
			buttonTextColor: Q.neutral00
		} }
	},
	tooltip: {
		backgroundColor: Q.neutral20,
		defaultBorderColor: Q.border,
		textStyle: { color: Q.tertiary }
	},
	dataZoom: {
		borderColor: Q.accent10,
		textStyle: { color: Q.tertiary },
		brushStyle: { color: Q.backgroundTint },
		handleStyle: {
			color: Q.neutral00,
			borderColor: Q.accent20
		},
		moveHandleStyle: { color: Q.accent40 },
		emphasis: { handleStyle: { borderColor: Q.accent50 } },
		dataBackground: {
			lineStyle: { color: Q.accent30 },
			areaStyle: { color: Q.accent20 }
		},
		selectedDataBackground: {
			lineStyle: { color: Q.accent50 },
			areaStyle: { color: Q.accent30 }
		}
	},
	visualMap: {
		textStyle: { color: Q.secondary },
		handleStyle: { borderColor: Q.neutral30 }
	},
	timeline: {
		lineStyle: { color: Q.accent10 },
		label: { color: Q.tertiary },
		controlStyle: {
			color: Q.accent30,
			borderColor: Q.accent30
		}
	},
	calendar: {
		itemStyle: {
			color: Q.neutral00,
			borderColor: Q.neutral20
		},
		dayLabel: { color: Q.tertiary },
		monthLabel: { color: Q.secondary },
		yearLabel: { color: Q.secondary }
	},
	matrix: {
		x: dO,
		y: dO,
		backgroundColor: { borderColor: Q.axisLine },
		body: { itemStyle: { borderColor: Q.borderTint } }
	},
	timeAxis: uO(),
	logAxis: uO(),
	valueAxis: uO(),
	categoryAxis: uO(),
	line: { symbol: "circle" },
	graph: { color: Q.theme },
	gauge: {
		title: { color: Q.secondary },
		axisLine: { lineStyle: { color: [[1, Q.neutral05]] } },
		axisLabel: { color: Q.axisLabel },
		detail: { color: Q.primary }
	},
	candlestick: { itemStyle: {
		color: "#f64e56",
		color0: "#54ea92",
		borderColor: "#f64e56",
		borderColor0: "#54ea92"
	} },
	funnel: { itemStyle: { borderColor: Q.background } },
	radar: function() {
		var e = uO();
		return e.axisName = { color: Q.axisLabel }, e.axisLine.lineStyle.color = Q.neutral20, e;
	}(),
	treemap: { breadcrumb: {
		itemStyle: {
			color: Q.neutral20,
			textStyle: { color: Q.secondary }
		},
		emphasis: { itemStyle: { color: Q.neutral30 } }
	} },
	sunburst: { itemStyle: { borderColor: Q.background } },
	map: {
		itemStyle: {
			borderColor: Q.border,
			areaColor: Q.neutral10
		},
		label: { color: Q.tertiary },
		emphasis: {
			label: { color: Q.primary },
			itemStyle: { areaColor: Q.highlight }
		},
		select: {
			label: { color: Q.primary },
			itemStyle: { areaColor: Q.highlight }
		}
	},
	geo: {
		itemStyle: {
			borderColor: Q.border,
			areaColor: Q.neutral10
		},
		emphasis: {
			label: { color: Q.primary },
			itemStyle: { areaColor: Q.highlight }
		},
		select: {
			label: { color: Q.primary },
			itemStyle: { color: Q.highlight }
		}
	}
};
fO.categoryAxis.splitLine.show = !1;
//#endregion
//#region node_modules/echarts/lib/util/ECEventProcessor.js
var pO = function() {
	function e() {}
	return e.prototype.normalizeQuery = function(e) {
		var t = {}, n = {}, r = {};
		if (W(e)) {
			var i = vn(e);
			t.mainType = i.main || null, t.subType = i.sub || null;
		} else {
			var a = [
				"Index",
				"Name",
				"Id"
			], o = {
				name: 1,
				dataIndex: 1,
				dataType: 1
			};
			z(e, function(e, i) {
				for (var s = !1, c = 0; c < a.length; c++) {
					var l = a[c], u = i.lastIndexOf(l);
					if (u > 0 && u === i.length - l.length) {
						var d = i.slice(0, u);
						d !== "data" && (t.mainType = d, t[l.toLowerCase()] = e, s = !0);
					}
				}
				o.hasOwnProperty(i) && (n[i] = e, s = !0), s || (r[i] = e);
			});
		}
		return {
			cptQuery: t,
			dataQuery: n,
			otherQuery: r
		};
	}, e.prototype.filter = function(e, t) {
		var n = this.eventInfo;
		if (!n) return !0;
		var r = n.targetEl, i = n.packedEvent, a = n.model, o = n.view;
		if (!a || !o) return !0;
		var s = t.cptQuery, c = t.dataQuery;
		return l(s, a, "mainType") && l(s, a, "subType") && l(s, a, "index", "componentIndex") && l(s, a, "name") && l(s, a, "id") && l(c, i, "name") && l(c, i, "dataIndex") && l(c, i, "dataType") && (!o.filterForExposedEvent || o.filterForExposedEvent(e, t.otherQuery, r, i));
		function l(e, t, n, r) {
			return e[n] == null || t[r || n] === e[n];
		}
	}, e.prototype.afterTrigger = function() {
		this.eventInfo = null;
	}, e;
}(), mO = [
	"symbol",
	"symbolSize",
	"symbolRotate",
	"symbolOffset"
], hO = mO.concat(["symbolKeepAspect"]), gO = {
	createOnAllSeries: !0,
	performRawSeries: !0,
	reset: function(e, t) {
		var n = e.getData();
		if (e.legendIcon && n.setVisual("legendIcon", e.legendIcon), !e.hasSymbolVisual) return;
		for (var r = {}, i = {}, a = !1, o = 0; o < mO.length; o++) {
			var s = mO[o], c = e.get(s);
			U(c) ? (a = !0, i[s] = c) : r[s] = c;
		}
		if (r.symbol = r.symbol || e.defaultSymbol, n.setVisual(R({
			legendIcon: e.legendIcon || r.symbol,
			symbolKeepAspect: e.get("symbolKeepAspect")
		}, r)), t.isSeriesFiltered(e)) return;
		var l = V(i);
		function u(t, n) {
			for (var r = e.getRawValue(n), a = e.getDataParams(n), o = 0; o < l.length; o++) {
				var s = l[o];
				t.setItemVisual(n, s, i[s](r, a));
			}
		}
		return { dataEach: a ? u : null };
	}
}, _O = {
	createOnAllSeries: !0,
	performRawSeries: !0,
	reset: function(e, t) {
		if (!e.hasSymbolVisual || t.isSeriesFiltered(e)) return;
		var n = e.getData();
		function r(e, t) {
			for (var n = e.getItemModel(t), r = 0; r < hO.length; r++) {
				var i = hO[r], a = n.getShallow(i, !0);
				a != null && e.setItemVisual(t, i, a);
			}
		}
		return { dataEach: n.hasItemOption ? r : null };
	}
};
//#endregion
//#region node_modules/echarts/lib/visual/helper.js
function vO(e, t, n) {
	switch (n) {
		case "color": return e.getItemVisual(t, "style")[e.getVisual("drawType")];
		case "opacity": return e.getItemVisual(t, "style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getItemVisual(t, n);
		default: process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + n);
	}
}
function yO(e, t) {
	switch (t) {
		case "color": return e.getVisual("style")[e.getVisual("drawType")];
		case "opacity": return e.getVisual("style").opacity;
		case "symbol":
		case "symbolSize":
		case "liftZ": return e.getVisual(t);
		default: process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + t);
	}
}
//#endregion
//#region node_modules/echarts/lib/util/event.js
function bO(e, t, n) {
	for (var r; e && !(t(e) && (r = e, n));) e = e.__hostTarget || e.parent;
	return r;
}
//#endregion
//#region node_modules/echarts/lib/core/lifecycle.js
var xO = new fo(), SO = {};
function CO(e, t) {
	process.env.NODE_ENV !== "production" && SO[e] && vl("Already has an implementation of " + e + "."), SO[e] = t;
}
function wO(e) {
	return process.env.NODE_ENV !== "production" && (SO[e] || vl("Implementation of " + e + " doesn't exists.")), SO[e];
}
//#endregion
//#region node_modules/echarts/lib/chart/custom/customSeriesRegister.js
var TO = {};
function EO(e, t) {
	TO[e] = t;
}
//#endregion
//#region node_modules/zrender/lib/core/WeakMap.js
var DO = Math.round(Math.random() * 9), OO = typeof Object.defineProperty == "function", kO = function() {
	function e() {
		this._id = "__ec_inner_" + DO++;
	}
	return e.prototype.get = function(e) {
		return this._guard(e)[this._id];
	}, e.prototype.set = function(e, t) {
		var n = this._guard(e);
		return OO ? Object.defineProperty(n, this._id, {
			value: t,
			enumerable: !1,
			configurable: !0
		}) : n[this._id] = t, this;
	}, e.prototype.delete = function(e) {
		return this.has(e) ? (delete this._guard(e)[this._id], !0) : !1;
	}, e.prototype.has = function(e) {
		return !!this._guard(e)[this._id];
	}, e.prototype._guard = function(e) {
		if (e !== Object(e)) throw TypeError("Value of WeakMap is not a non-null object.");
		return e;
	}, e;
}();
//#endregion
//#region node_modules/zrender/lib/canvas/helper.js
function AO(e) {
	return isFinite(e);
}
function jO(e, t, n) {
	var r = t.x == null ? 0 : t.x, i = t.x2 == null ? 1 : t.x2, a = t.y == null ? 0 : t.y, o = t.y2 == null ? 0 : t.y2;
	return t.global || (r = r * n.width + n.x, i = i * n.width + n.x, a = a * n.height + n.y, o = o * n.height + n.y), r = AO(r) ? r : 0, i = AO(i) ? i : 1, a = AO(a) ? a : 0, o = AO(o) ? o : 0, e.createLinearGradient(r, a, i, o);
}
function MO(e, t, n) {
	var r = n.width, i = n.height, a = Math.min(r, i), o = t.x == null ? .5 : t.x, s = t.y == null ? .5 : t.y, c = t.r == null ? .5 : t.r;
	return t.global || (o = o * r + n.x, s = s * i + n.y, c *= a), o = AO(o) ? o : .5, s = AO(s) ? s : .5, c = c >= 0 && AO(c) ? c : .5, e.createRadialGradient(o, s, 0, o, s, c);
}
function NO(e, t, n) {
	for (var r = t.type === "radial" ? MO(e, t, n) : jO(e, t, n), i = t.colorStops, a = 0; a < i.length; a++) r.addColorStop(i[a].offset, i[a].color);
	return r;
}
function PO(e, t) {
	if (e === t || !e && !t) return !1;
	if (!e || !t || e.length !== t.length) return !0;
	for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !0;
	return !1;
}
function FO(e) {
	return parseInt(e, 10);
}
function IO(e, t, n) {
	var r = ["width", "height"][t], i = ["clientWidth", "clientHeight"][t], a = ["paddingLeft", "paddingTop"][t], o = ["paddingRight", "paddingBottom"][t];
	if (n[r] != null && n[r] !== "auto") return parseFloat(n[r]);
	var s = document.defaultView.getComputedStyle(e);
	return (e[i] || FO(s[r]) || FO(e.style[r])) - (FO(s[a]) || 0) - (FO(s[o]) || 0) || 0;
}
//#endregion
//#region node_modules/zrender/lib/canvas/dashStyle.js
function LO(e, t) {
	return !e || e === "solid" || !(t > 0) ? null : e === "dashed" ? [4 * t, 2 * t] : e === "dotted" ? [t] : Ht(e) ? [e] : H(e) ? e : null;
}
function RO(e) {
	var t = e.style, n = t.lineDash && t.lineWidth > 0 && LO(t.lineDash, t.lineWidth), r = t.lineDashOffset;
	if (n) {
		var i = t.strokeNoScale && e.getLineScale ? e.getLineScale() : 1;
		i && i !== 1 && (n = B(n, function(e) {
			return e / i;
		}), r /= i);
	}
	return [n, r];
}
//#endregion
//#region node_modules/zrender/lib/canvas/graphic.js
var zO = new Cs(!0);
function BO(e) {
	var t = e.stroke;
	return !(t == null || t === "none" || !(e.lineWidth > 0));
}
function VO(e) {
	return typeof e == "string" && e !== "none";
}
function HO(e) {
	var t = e.fill;
	return t != null && t !== "none";
}
function UO(e, t) {
	if (t.fillOpacity != null && t.fillOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.fillOpacity * t.opacity, e.fill(), e.globalAlpha = n;
	} else e.fill();
}
function WO(e, t) {
	if (t.strokeOpacity != null && t.strokeOpacity !== 1) {
		var n = e.globalAlpha;
		e.globalAlpha = t.strokeOpacity * t.opacity, e.stroke(), e.globalAlpha = n;
	} else e.stroke();
}
function GO(e, t, n) {
	var r = Ln(t.image, t.__image, n);
	if (zn(r)) {
		var i = e.createPattern(r, t.repeat || "repeat");
		if (typeof DOMMatrix == "function" && i && i.setTransform) {
			var a = new DOMMatrix();
			a.translateSelf(t.x || 0, t.y || 0), a.rotateSelf(0, 0, (t.rotation || 0) * fn), a.scaleSelf(t.scaleX || 1, t.scaleY || 1), i.setTransform(a);
		}
		return i;
	}
}
function KO(e, t, n, r, i) {
	var a, o = BO(n), s = HO(n), c = n.strokePercent, l = c < 1, u = !t.path;
	(!t.silent || l) && u && t.createPathProxy();
	var d = t.path || zO, f = t.__dirty;
	if (!r) {
		var p = n.fill, m = n.stroke, h = s && !!p.colorStops, g = o && !!m.colorStops, _ = s && !!p.image, v = o && !!m.image, y = void 0, b = void 0, x = void 0, S = void 0, C = void 0;
		(h || g) && (C = t.getBoundingRect()), h && (y = f ? NO(e, p, C) : t.__canvasFillGradient, t.__canvasFillGradient = y), g && (b = f ? NO(e, m, C) : t.__canvasStrokeGradient, t.__canvasStrokeGradient = b), _ && (x = f || !t.__canvasFillPattern ? GO(e, p, t) : t.__canvasFillPattern, t.__canvasFillPattern = x), v && (S = f || !t.__canvasStrokePattern ? GO(e, m, t) : t.__canvasStrokePattern, t.__canvasStrokePattern = S), h ? e.fillStyle = y : _ && (x ? e.fillStyle = x : s = !1), g ? e.strokeStyle = b : v && (S ? e.strokeStyle = S : o = !1);
	}
	var w = t.getGlobalScale();
	d.setScale(w[0], w[1], t.segmentIgnoreThreshold);
	var T, E;
	e.setLineDash && n.lineDash && (a = RO(t), T = a[0], E = a[1]);
	var D = !0;
	(u || f & 4) && (d.setDPR(e.dpr), l ? d.setContext(null) : (d.setContext(e), D = !1), d.reset(), t.buildPath(d, t.shape, r), d.toStatic(), t.pathUpdated()), D && d.rebuildPath(e, l ? c : 1), T && (e.setLineDash(T), e.lineDashOffset = E), r ? (i.batchFill = s, i.batchStroke = o) : n.strokeFirst ? (o && WO(e, n), s && UO(e, n)) : (s && UO(e, n), o && WO(e, n)), T && e.setLineDash([]);
}
function qO(e, t, n) {
	var r = t.__image = Ln(n.image, t.__image, t, t.onload);
	if (!(!r || !zn(r))) {
		var i = n.x || 0, a = n.y || 0, o = t.getWidth(), s = t.getHeight(), c = r.width / r.height;
		if (o == null && s != null ? o = s * c : s == null && o != null ? s = o / c : o == null && s == null && (o = r.width, s = r.height), n.sWidth && n.sHeight) {
			var l = n.sx || 0, u = n.sy || 0;
			e.drawImage(r, l, u, n.sWidth, n.sHeight, i, a, o, s);
		} else if (n.sx && n.sy) {
			var l = n.sx, u = n.sy, d = o - l, f = s - u;
			e.drawImage(r, l, u, d, f, i, a, o, s);
		} else e.drawImage(r, i, a, o, s);
	}
}
function JO(e, t, n) {
	var r, i = n.text;
	if (i != null && (i += ""), i) {
		e.font = n.font || "12px sans-serif", e.textAlign = n.textAlign, e.textBaseline = n.textBaseline;
		var a = void 0, o = void 0;
		e.setLineDash && n.lineDash && (r = RO(t), a = r[0], o = r[1]), a && (e.setLineDash(a), e.lineDashOffset = o), n.strokeFirst ? (BO(n) && e.strokeText(i, n.x, n.y), HO(n) && e.fillText(i, n.x, n.y)) : (HO(n) && e.fillText(i, n.x, n.y), BO(n) && e.strokeText(i, n.x, n.y)), a && e.setLineDash([]);
	}
}
var YO = [
	"shadowBlur",
	"shadowOffsetX",
	"shadowOffsetY"
], XO = [
	["lineCap", "butt"],
	["lineJoin", "miter"],
	["miterLimit", 10]
];
function ZO(e, t, n, r, i) {
	var a = !1;
	if (!r && (n ||= {}, t === n)) return !1;
	if (r || t.opacity !== n.opacity) {
		ck(e, i), a = !0;
		var o = Math.max(Math.min(t.opacity, 1), 0);
		e.globalAlpha = isNaN(o) ? Lo.opacity : o;
	}
	(r || t.blend !== n.blend) && (a ||= (ck(e, i), !0), e.globalCompositeOperation = t.blend || Lo.blend);
	for (var s = 0; s < YO.length; s++) {
		var c = YO[s];
		(r || t[c] !== n[c]) && (a ||= (ck(e, i), !0), e[c] = e.dpr * (t[c] || 0));
	}
	return (r || t.shadowColor !== n.shadowColor) && (a ||= (ck(e, i), !0), e.shadowColor = t.shadowColor || Lo.shadowColor), a;
}
function QO(e, t, n, r, i) {
	var a = t.style, o = r ? null : n && n.style || {};
	if (a === o) return !1;
	var s = ZO(e, a, o, r, i);
	if ((r || a.fill !== o.fill) && (s ||= (ck(e, i), !0), VO(a.fill) && (e.fillStyle = a.fill)), (r || a.stroke !== o.stroke) && (s ||= (ck(e, i), !0), VO(a.stroke) && (e.strokeStyle = a.stroke)), (r || a.opacity !== o.opacity) && (s ||= (ck(e, i), !0), e.globalAlpha = a.opacity == null ? 1 : a.opacity), t.hasStroke()) {
		var c = a.lineWidth / (a.strokeNoScale && t.getLineScale ? t.getLineScale() : 1);
		e.lineWidth !== c && (s ||= (ck(e, i), !0), e.lineWidth = c);
	}
	for (var l = 0; l < XO.length; l++) {
		var u = XO[l], d = u[0];
		(r || a[d] !== o[d]) && (s ||= (ck(e, i), !0), e[d] = a[d] || u[1]);
	}
	return s;
}
function $O(e, t, n, r, i) {
	return ZO(e, t.style, n && n.style, r, i);
}
function ek(e, t) {
	var n = t.transform, r = e.dpr || 1;
	n ? e.setTransform(r * n[0], r * n[1], r * n[2], r * n[3], r * n[4], r * n[5]) : e.setTransform(r, 0, 0, r, 0, 0);
}
function tk(e, t, n) {
	for (var r = !1, i = 0; i < e.length; i++) {
		var a = e[i];
		r ||= a.isZeroArea(), ek(t, a), t.beginPath(), a.buildPath(t, a.shape), t.clip();
	}
	n.allClipped = r;
}
function nk(e, t) {
	return e && t ? e[0] !== t[0] || e[1] !== t[1] || e[2] !== t[2] || e[3] !== t[3] || e[4] !== t[4] || e[5] !== t[5] : !(!e && !t);
}
var rk = 1, ik = 2, ak = 3, ok = 4;
function sk(e) {
	var t = HO(e), n = BO(e);
	return !(e.lineDash || !(t ^ +n) || t && typeof e.fill != "string" || n && typeof e.stroke != "string" || e.strokePercent < 1 || e.strokeOpacity < 1 || e.fillOpacity < 1);
}
function ck(e, t) {
	t.batchFill && (t.batchFill = !1, e.fill()), t.batchStroke && (t.batchStroke = !1, e.stroke());
}
function lk(e, t) {
	var n = {
		inHover: !1,
		viewWidth: 0,
		viewHeight: 0,
		beforeBrushParam: {}
	};
	uk(e, t, n), dk(e, n);
}
function uk(e, t, n) {
	var r = t.transform;
	if (!t.shouldBePainted(n.viewWidth, n.viewHeight, !1, !1)) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	var i = t.__clipPaths, a = n.prevElClipPaths, o = t.style, s = !1, c = !1;
	if ((!a || PO(i, a)) && (a && (ck(e, n), e.restore(), c = s = !0, n.prevElClipPaths = null, n.allClipped = !1, n.prevEl = null), i && i.length && (ck(e, n), e.save(), tk(i, e, n), s = !0, n.prevElClipPaths = i)), n.allClipped) {
		t.__dirty &= -2, t.__isRendered = !1;
		return;
	}
	t.beforeBrush && t.beforeBrush(n.beforeBrushParam), t.innerBeforeBrush();
	var l = n.prevEl;
	l || (c = s = !0);
	var u = t instanceof Js && t.autoBatch && sk(o);
	s || nk(r, l.transform) ? (ck(e, n), ek(e, t)) : u || ck(e, n), t instanceof Js ? (n.lastDrawType !== rk && (c = !0, n.lastDrawType = rk), QO(e, t, l, c, n), (!u || !n.batchFill && !n.batchStroke) && e.beginPath(), KO(e, t, o, u, n)) : t instanceof Xs ? (n.lastDrawType !== ak && (c = !0, n.lastDrawType = ak), QO(e, t, l, c, n), JO(e, t, o)) : t instanceof ec ? (n.lastDrawType !== ik && (c = !0, n.lastDrawType = ik), $O(e, t, l, c, n), qO(e, t, o)) : t.getTemporalDisplayables && (n.lastDrawType !== ok && (c = !0, n.lastDrawType = ok), fk(e, t, n)), t.innerAfterBrush(), t.afterBrush && (u && ck(e, n), t.afterBrush()), n.prevEl = t, t.__dirty = 0, t.__isRendered = !0;
}
function dk(e, t) {
	ck(e, t), t.prevElClipPaths && e.restore();
}
function fk(e, t, n) {
	var r = t.getDisplayables(), i = t.getTemporalDisplayables();
	e.save();
	var a = {
		prevElClipPaths: null,
		prevEl: null,
		allClipped: !1,
		viewWidth: n.viewWidth,
		viewHeight: n.viewHeight,
		inHover: n.inHover,
		beforeBrushParam: {}
	}, o, s;
	for (o = t.getCursor(), s = r.length; o < s; o++) {
		var c = r[o];
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), uk(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	dk(e, a);
	for (var l = 0, u = i.length; l < u; l++) {
		var c = i[l];
		c.beforeBrush && c.beforeBrush(n.beforeBrushParam), c.innerBeforeBrush(), uk(e, c, a), c.innerAfterBrush(), c.afterBrush && c.afterBrush(), a.prevEl = c;
	}
	dk(e, a), t.clearTemporalDisplayables(), t.notClear = !0, e.restore();
}
//#endregion
//#region node_modules/echarts/lib/util/decal.js
var pk = new kO(), mk = new Pn(100), hk = [
	"symbol",
	"symbolSize",
	"symbolKeepAspect",
	"color",
	"backgroundColor",
	"dashArrayX",
	"dashArrayY",
	"maxTileWidth",
	"maxTileHeight"
];
function gk(e, t) {
	if (e === "none") return null;
	var n = t.getDevicePixelRatio(), r = t.getZr(), i = r.painter.type === "svg";
	e.dirty && pk.delete(e);
	var a = pk.get(e);
	if (a) return a;
	var o = At(e, {
		symbol: "rect",
		symbolSize: 1,
		symbolKeepAspect: !0,
		color: "rgba(0, 0, 0, 0.2)",
		backgroundColor: null,
		dashArrayX: 5,
		dashArrayY: 5,
		rotation: 0,
		maxTileWidth: 512,
		maxTileHeight: 512
	});
	o.backgroundColor === "none" && (o.backgroundColor = null);
	var s = { repeat: "repeat" };
	return c(s), s.rotation = o.rotation, s.scaleX = s.scaleY = i ? 1 : 1 / n, pk.set(e, s), e.dirty = !1, s;
	function c(e) {
		for (var t = [n], a = !0, s = 0; s < hk.length; ++s) {
			var c = o[hk[s]];
			if (c != null && !H(c) && !W(c) && !Ht(c) && typeof c != "boolean") {
				a = !1;
				break;
			}
			t.push(c);
		}
		var l;
		if (a) {
			l = t.join(",") + (i ? "-svg" : "");
			var u = mk.get(l);
			u && (i ? e.svgElement = u : e.image = u);
		}
		var d = vk(o.dashArrayX), f = yk(o.dashArrayY), p = _k(o.symbol), m = bk(d), h = xk(f), g = !i && ft.createCanvas(), _ = i && {
			tag: "g",
			attrs: {},
			key: "dcl",
			children: []
		}, v = b(), y;
		g && (g.width = v.width * n, g.height = v.height * n, y = g.getContext("2d")), x(), a && mk.put(l, g || _), e.image = g, e.svgElement = _, e.svgWidth = v.width, e.svgHeight = v.height;
		function b() {
			for (var e = 1, t = 0, n = m.length; t < n; ++t) e = ul(e, m[t]);
			for (var r = 1, t = 0, n = p.length; t < n; ++t) r = ul(r, p[t].length);
			e *= r;
			var i = h * m.length * p.length;
			if (process.env.NODE_ENV !== "production") {
				var a = function(e) {
					console.warn("Calculated decal size is greater than " + e + " due to decal option settings so " + e + " is used for the decal size. Please consider changing the decal option to make a smaller decal or set " + e + " to be larger to avoid incontinuity.");
				};
				e > o.maxTileWidth && a("maxTileWidth"), i > o.maxTileHeight && a("maxTileHeight");
			}
			return {
				width: Math.max(1, Math.min(e, o.maxTileWidth)),
				height: Math.max(1, Math.min(i, o.maxTileHeight))
			};
		}
		function x() {
			y && (y.clearRect(0, 0, g.width, g.height), o.backgroundColor && (y.fillStyle = o.backgroundColor, y.fillRect(0, 0, g.width, g.height)));
			for (var e = 0, t = 0; t < f.length; ++t) e += f[t];
			if (e <= 0) return;
			for (var a = -h, s = 0, c = 0, l = 0; a < v.height;) {
				if (s % 2 == 0) {
					for (var u = c / 2 % p.length, m = 0, b = 0, x = 0; m < v.width * 2;) {
						for (var S = 0, t = 0; t < d[l].length; ++t) S += d[l][t];
						if (S <= 0) break;
						if (b % 2 == 0) {
							var C = (1 - o.symbolSize) * .5, w = m + d[l][b] * C, T = a + f[s] * C, E = d[l][b] * o.symbolSize, D = f[s] * o.symbolSize, O = x / 2 % p[u].length;
							k(w, T, E, D, p[u][O]);
						}
						m += d[l][b], ++x, ++b, b === d[l].length && (b = 0);
					}
					++l, l === d.length && (l = 0);
				}
				a += f[s], ++c, ++s, s === f.length && (s = 0);
			}
			function k(e, t, a, s, c) {
				var l = i ? 1 : n, u = Ky(c, e * l, t * l, a * l, s * l, o.color, o.symbolKeepAspect);
				if (i) {
					var d = r.painter.renderOneToVNode(u);
					d && _.children.push(d);
				} else lk(y, u);
			}
		}
	}
}
function _k(e) {
	if (!e || e.length === 0) return [["rect"]];
	if (W(e)) return [[e]];
	for (var t = !0, n = 0; n < e.length; ++n) if (!W(e[n])) {
		t = !1;
		break;
	}
	if (t) return _k([e]);
	for (var r = [], n = 0; n < e.length; ++n) W(e[n]) ? r.push([e[n]]) : r.push(e[n]);
	return r;
}
function vk(e) {
	if (!e || e.length === 0) return [[0, 0]];
	if (Ht(e)) {
		var t = Math.ceil(e);
		return [[t, t]];
	}
	for (var n = !0, r = 0; r < e.length; ++r) if (!Ht(e[r])) {
		n = !1;
		break;
	}
	if (n) return vk([e]);
	for (var i = [], r = 0; r < e.length; ++r) if (Ht(e[r])) {
		var t = Math.ceil(e[r]);
		i.push([t, t]);
	} else {
		var t = B(e[r], function(e) {
			return Math.ceil(e);
		});
		t.length % 2 == 1 ? i.push(t.concat(t)) : i.push(t);
	}
	return i;
}
function yk(e) {
	if (!e || typeof e == "object" && e.length === 0) return [0, 0];
	if (Ht(e)) {
		var t = Math.ceil(e);
		return [t, t];
	}
	var n = B(e, function(e) {
		return Math.ceil(e);
	});
	return e.length % 2 ? n.concat(n) : n;
}
function bk(e) {
	return B(e, function(e) {
		return xk(e);
	});
}
function xk(e) {
	for (var t = 0, n = 0; n < e.length; ++n) t += e[n];
	return e.length % 2 == 1 ? t * 2 : t;
}
//#endregion
//#region node_modules/echarts/lib/visual/decal.js
var Sk = yu(Ck);
function Ck(e, t) {
	e.eachRawSeries(function(n) {
		if (!e.isSeriesFiltered(n)) {
			var r = n.getData();
			r.hasItemVisual() && r.each(function(e) {
				var n = r.getItemVisual(e, "decal");
				if (n) {
					var i = r.ensureUniqueItemVisual(e, "style");
					i.decal = gk(n, t);
				}
			});
			var i = r.getVisual("decal");
			if (i) {
				var a = r.getVisual("style");
				a.decal = gk(i, t);
			}
		}
	});
}
//#endregion
//#region node_modules/echarts/lib/core/echarts.js
var wk = 1, Tk = 800, Ek = 900, Dk = 920, Ok = 1e3, kk = 2e3, Ak = 5e3, jk = 1e3, Mk = 1100, Nk = 2e3, Pk = 3e3, Fk = 4e3, Ik = 4500, Lk = 4600, Rk = 5e3, zk = 6e3, Bk = 7e3, Vk = {
	PROCESSOR: {
		SERIES_FILTER: Tk,
		AXIS_STATISTICS: Dk,
		FILTER: Ok,
		STATISTIC: Ak,
		STATISTICS: Ak
	},
	VISUAL: {
		LAYOUT: jk,
		PROGRESSIVE_LAYOUT: Mk,
		GLOBAL: Nk,
		CHART: Pk,
		POST_CHART_LAYOUT: Lk,
		COMPONENT: Fk,
		BRUSH: Rk,
		CHART_ITEM: Ik,
		ARIA: zk,
		DECAL: Bk
	}
}, Hk = "__flagInMainProcess", Uk = "__mainProcessVersion", Wk = "__pendingUpdate", Gk = "__needsUpdateStatus", Kk = /^[a-zA-Z0-9_]+$/, qk = "__connectUpdateStatus", Jk = 0, Yk = 1, Xk = 2;
function Zk(e) {
	return function() {
		var t = [...arguments];
		if (this.isDisposed()) {
			wA(this.id);
			return;
		}
		return $k(this, e, t);
	};
}
function Qk(e) {
	return function() {
		var t = [...arguments];
		return $k(this, e, t);
	};
}
function $k(e, t, n) {
	return n[0] = n[0] && n[0].toLowerCase(), fo.prototype[t].apply(e, n);
}
var eA = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t;
}(fo), tA = eA.prototype;
tA.on = Qk("on"), tA.off = Qk("off");
var nA, rA, iA, aA, oA, sA, cA, lA, uA, dA, fA, pA, mA, hA, gA, _A, vA, yA, bA, xA = function(e) {
	I(t, e);
	function t(t, n, r) {
		var i = e.call(this, new pO()) || this;
		i._chartsViews = [], i._chartsMap = {}, i._componentsViews = [], i._componentsMap = {}, i._pendingActions = [], r ||= {}, i.__v_skip = !0, i._dom = t;
		var a = "canvas", o = "auto", s = !1;
		if (i[Uk] = 1, process.env.NODE_ENV !== "production") {
			var c = Y.hasGlobalWindow ? window : global;
			c && (a = K(c.__ECHARTS__DEFAULT__RENDERER__, a), o = K(c.__ECHARTS__DEFAULT__COARSE_POINTER, o), s = K(c.__ECHARTS__DEFAULT__USE_DIRTY_RECT__, s));
		}
		r.ssr && PE(function(e) {
			var t = bu(e), n = t.dataIndex;
			if (n != null) {
				var r = J();
				return r.set("series_index", t.seriesIndex), r.set("data_index", n), t.ssrType && r.set("ssr_type", t.ssrType), r;
			}
		});
		var l = i._zr = AE(t, {
			renderer: r.renderer || a,
			devicePixelRatio: r.devicePixelRatio,
			width: r.width,
			height: r.height,
			ssr: r.ssr,
			useDirtyRect: K(r.useDirtyRect, s),
			useCoarsePointer: K(r.useCoarsePointer, o),
			pointerSize: r.pointerSize
		});
		i._ssr = r.ssr, i._throttledZrFlush = jw(zt(l.flush, l), 17), i._updateTheme(n), i._locale = h_(r.locale || p_), i._coordSysMgr = new Sg();
		var u = i._api = gA(i);
		function d(e, t) {
			return e.__prio - t.__prio;
		}
		return QT(AA, d), QT(OA, d), i._scheduler = new JD(i, u, OA, AA), i._messageCenter = new eA(), i._initEvents(), i.resize = zt(i.resize, i), l.animation.on("frame", i._onframe, i), dA(l, i), fA(l, i), tn(i), i;
	}
	return t.prototype._onframe = function() {
		if (!this._disposed) {
			var e = this._scheduler, t = this._model, n = this._api;
			if (yA(this), this[Wk]) {
				var r = this[Wk].silent;
				this[Hk] = !0, bA(this);
				try {
					nA(this), aA.update.call(this, null, this[Wk].updateParams);
				} catch (e) {
					throw this[Hk] = !1, this[Wk] = null, e;
				}
				this._zr.flush(), this[Hk] = !1, this[Wk] = null, lA.call(this, r), uA.call(this, r);
			} else if (e.unfinished) {
				var i = wk;
				do {
					e.unfinished = !1;
					var a = ft.getTime();
					e.performSeriesTasks(t), e.performDataProcessorTasks(t), sA(this, t), e.performVisualTasks(t), hA(this, this._model, n, "remain", {}), i -= ft.getTime() - a;
				} while (i > 0 && e.unfinished);
				e.unfinished || this._zr.flush();
			}
		}
	}, t.prototype.getDom = function() {
		return this._dom;
	}, t.prototype.getId = function() {
		return this.id;
	}, t.prototype.getZr = function() {
		return this._zr;
	}, t.prototype.isSSR = function() {
		return this._ssr;
	}, t.prototype.setOption = function(e, t, n) {
		if (this[Hk]) {
			process.env.NODE_ENV !== "production" && vl("`setOption` should not be called during main process.");
			return;
		}
		if (this._disposed) {
			wA(this.id);
			return;
		}
		var r, i, a;
		if (G(t) && (n = t.lazyUpdate, r = t.silent, i = t.replaceMerge, a = t.transition, t = t.notMerge), this[Hk] = !0, bA(this), !this._model || t) {
			var o = new iD(this._api), s = this._theme, c = this._model = new ZE();
			c.scheduler = this._scheduler, c.ssr = this._ssr, c.init(null, null, null, s, this._locale, o);
		}
		this._model.setOption(e, { replaceMerge: i }, kA);
		var l = {
			seriesTransition: a,
			optionChanged: !0
		};
		if (n) this[Wk] = {
			silent: r,
			updateParams: l
		}, this[Hk] = !1, this.getZr().wakeUp();
		else {
			try {
				nA(this), aA.update.call(this, null, l);
			} catch (e) {
				throw this[Wk] = null, this[Hk] = !1, e;
			}
			this._ssr || this._zr.flush(), this[Wk] = null, this[Hk] = !1, lA.call(this, r), uA.call(this, r);
		}
	}, t.prototype.setTheme = function(e, t) {
		if (this[Hk]) {
			process.env.NODE_ENV !== "production" && vl("`setTheme` should not be called during main process.");
			return;
		}
		if (this._disposed) {
			wA(this.id);
			return;
		}
		var n = this._model;
		if (n) {
			var r = t && t.silent, i = null;
			this[Wk] && (r ??= this[Wk].silent, i = this[Wk].updateParams, this[Wk] = null), this[Hk] = !0, bA(this);
			try {
				this._updateTheme(e), n.setTheme(this._theme), nA(this), aA.update.call(this, { type: "setTheme" }, i);
			} catch (e) {
				throw this[Hk] = !1, e;
			}
			this[Hk] = !1, lA.call(this, r), uA.call(this, r);
		}
	}, t.prototype._updateTheme = function(e) {
		W(e) && (e = jA[e]), e && (e = L(e), e && MD(e, !0), this._theme = e);
	}, t.prototype.getModel = function() {
		return this._model;
	}, t.prototype.getOption = function() {
		return this._model && this._model.getOption();
	}, t.prototype.getWidth = function() {
		return this._zr.getWidth();
	}, t.prototype.getHeight = function() {
		return this._zr.getHeight();
	}, t.prototype.getDevicePixelRatio = function() {
		return this._zr.painter.dpr || Y.hasGlobalWindow && window.devicePixelRatio || 1;
	}, t.prototype.getRenderedCanvas = function(e) {
		return process.env.NODE_ENV !== "production" && bl("getRenderedCanvas", "renderToCanvas"), this.renderToCanvas(e);
	}, t.prototype.renderToCanvas = function(e) {
		e ||= {};
		var t = this._zr.painter;
		if (process.env.NODE_ENV !== "production" && t.type !== "canvas") throw Error("renderToCanvas can only be used in the canvas renderer.");
		return t.getRenderedCanvas({
			backgroundColor: e.backgroundColor || this._model.get("backgroundColor"),
			pixelRatio: e.pixelRatio || this.getDevicePixelRatio()
		});
	}, t.prototype.renderToSVGString = function(e) {
		e ||= {};
		var t = this._zr.painter;
		if (process.env.NODE_ENV !== "production" && t.type !== "svg") throw Error("renderToSVGString can only be used in the svg renderer.");
		return t.renderToString({ useViewBox: e.useViewBox });
	}, t.prototype.getSvgDataURL = function() {
		var e = this._zr;
		return z(e.storage.getDisplayList(), function(e) {
			e.stopAnimation(null, !0);
		}), e.painter.toDataURL();
	}, t.prototype.getDataURL = function(e) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		e ||= {};
		var t = e.excludeComponents, n = this._model, r = [], i = this;
		z(t, function(e) {
			n.eachComponent({ mainType: e }, function(e) {
				var t = i._componentsMap[e.__viewId];
				t.group.ignore || (r.push(t), t.group.ignore = !0);
			});
		});
		var a = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(e).toDataURL("image/" + (e && e.type || "png"));
		return z(r, function(e) {
			e.group.ignore = !1;
		}), a;
	}, t.prototype.getConnectedDataURL = function(e) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		var t = e.type === "svg", n = this.group, r = Math.min, i = Math.max, a = Infinity;
		if (PA[n]) {
			var o = a, s = a, c = -a, l = -a, u = [], d = e && e.pixelRatio || this.getDevicePixelRatio();
			z(NA, function(a, d) {
				if (a.group === n) {
					var f = t ? a.getZr().painter.getSvgDom().innerHTML : a.renderToCanvas(L(e)), p = a.getDom().getBoundingClientRect();
					o = r(p.left, o), s = r(p.top, s), c = i(p.right, c), l = i(p.bottom, l), u.push({
						dom: f,
						left: p.left,
						top: p.top
					});
				}
			}), o *= d, s *= d, c *= d, l *= d;
			var f = c - o, p = l - s, m = ft.createCanvas(), h = AE(m, { renderer: t ? "svg" : "canvas" });
			if (h.resize({
				width: f,
				height: p
			}), t) {
				var g = "";
				return z(u, function(e) {
					var t = e.left - o, n = e.top - s;
					g += "<g transform=\"translate(" + t + "," + n + ")\">" + e.dom + "</g>";
				}), h.painter.getSvgRoot().innerHTML = g, e.connectedBackgroundColor && h.painter.setBackgroundColor(e.connectedBackgroundColor), h.refreshImmediately(), h.painter.toDataURL();
			} else return e.connectedBackgroundColor && h.add(new cc({
				shape: {
					x: 0,
					y: 0,
					width: f,
					height: p
				},
				style: { fill: e.connectedBackgroundColor }
			})), z(u, function(e) {
				var t = new ec({ style: {
					x: e.left * d - o,
					y: e.top * d - s,
					image: e.dom
				} });
				h.add(t);
			}), h.refreshImmediately(), m.toDataURL("image/" + (e && e.type || "png"));
		} else return this.getDataURL(e);
	}, t.prototype.convertToPixel = function(e, t, n) {
		return oA(this, "convertToPixel", e, t, n);
	}, t.prototype.convertToLayout = function(e, t, n) {
		return oA(this, "convertToLayout", e, t, n);
	}, t.prototype.convertFromPixel = function(e, t, n) {
		return oA(this, "convertFromPixel", e, t, n);
	}, t.prototype.containPixel = function(e, t) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		var n = this._model, r;
		return z(Yl(n, e), function(e, n) {
			n.indexOf("Models") >= 0 && z(e, function(e) {
				var i = e.coordinateSystem;
				if (i && i.containPoint) r ||= !!i.containPoint(t);
				else if (n === "seriesModels") {
					var a = this._chartsMap[e.__viewId];
					a && a.containPoint ? r ||= a.containPoint(t, e) : process.env.NODE_ENV !== "production" && _l(n + ": " + (a ? "The found component do not support containPoint." : "No view mapping to the found component."));
				} else process.env.NODE_ENV !== "production" && _l(n + ": containPoint is not supported");
			}, this);
		}, this), !!r;
	}, t.prototype.getVisual = function(e, t) {
		var n = this._model, r = Yl(n, e, { defaultMainType: "series" }), i = r.seriesModel;
		process.env.NODE_ENV !== "production" && (i || _l("There is no specified series model"));
		var a = i.getData(), o = r.hasOwnProperty("dataIndexInside") ? r.dataIndexInside : r.hasOwnProperty("dataIndex") ? a.indexOfRawIndex(r.dataIndex) : null;
		return o == null ? yO(a, t) : vO(a, o, t);
	}, t.prototype.getViewOfComponentModel = function(e) {
		return this._componentsMap[e.__viewId];
	}, t.prototype.getViewOfSeriesModel = function(e) {
		return this._chartsMap[e.__viewId];
	}, t.prototype._initEvents = function() {
		var e = this;
		z(CA, function(t) {
			var n = function(n) {
				var r = e.getModel(), i = n.target, a, o = t === "globalout";
				if (o ? a = {} : i && bO(i, function(e) {
					var t = bu(e);
					if (t && t.dataIndex != null) {
						var n = t.dataModel || r.getSeriesByIndex(t.seriesIndex);
						return a = n && n.getDataParams(t.dataIndex, t.dataType, i) || {}, !0;
					} else if (t.eventData) return a = R({}, t.eventData), !0;
				}, !0), a) {
					var s = a.componentType, c = a.componentIndex;
					(s === "markLine" || s === "markPoint" || s === "markArea") && (s = "series", c = a.seriesIndex);
					var l = s && c != null && r.getComponent(s, c), u = l && e[l.mainType === "series" ? "_chartsMap" : "_componentsMap"][l.__viewId];
					process.env.NODE_ENV !== "production" && !o && !(l && u) && _l("model or view can not be found by params"), a.event = n, a.type = t, e._$eventProcessor.eventInfo = {
						targetEl: i,
						packedEvent: a,
						model: l,
						view: u
					}, e.trigger(t, a);
				}
			};
			n.zrEventfulCallAtLast = !0, e._zr.on(t, n, e);
		});
		var t = this._messageCenter;
		z(DA, function(n, r) {
			t.on(r, function(t) {
				e.trigger(r, t);
			});
		}), mT(t, this, this._api);
	}, t.prototype.isDisposed = function() {
		return this._disposed;
	}, t.prototype.clear = function() {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		this.setOption({ series: [] }, !0);
	}, t.prototype.dispose = function() {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		this._disposed = !0, this.getDom() && eu(this.getDom(), IA, "");
		var e = this, t = e._api, n = e._model;
		z(e._componentsViews, function(e) {
			e.dispose(n, t);
		}), z(e._chartsViews, function(e) {
			e.dispose(n, t);
		}), e._zr.dispose(), e._dom = e._model = e._chartsMap = e._componentsMap = e._chartsViews = e._componentsViews = e._scheduler = e._api = e._zr = e._throttledZrFlush = e._theme = e._coordSysMgr = e._messageCenter = null, delete NA[e.id];
	}, t.prototype.resize = function(e) {
		if (this[Hk]) {
			process.env.NODE_ENV !== "production" && vl("`resize` should not be called during main process.");
			return;
		}
		if (this._disposed) {
			wA(this.id);
			return;
		}
		this._zr.resize(e);
		var t = this._model;
		if (this._loadingFX && this._loadingFX.resize(), t) {
			var n = t.resetOption("media"), r = e && e.silent;
			this[Wk] && (r ??= this[Wk].silent, n = !0, this[Wk] = null), this[Hk] = !0, bA(this);
			try {
				n && nA(this), aA.update.call(this, {
					type: "resize",
					animation: R({ duration: 0 }, e && e.animation)
				});
			} catch (e) {
				throw this[Hk] = !1, e;
			}
			this[Hk] = !1, lA.call(this, r), uA.call(this, r);
		}
	}, t.prototype.showLoading = function(e, t) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		if (G(e) && (t = e, e = ""), e ||= "default", this.hideLoading(), !MA[e]) {
			process.env.NODE_ENV !== "production" && _l("Loading effects " + e + " not exists.");
			return;
		}
		var n = MA[e](this._api, t), r = this._zr;
		this._loadingFX = n, r.add(n);
	}, t.prototype.hideLoading = function() {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;
	}, t.prototype.makeActionFromEvent = function(e) {
		var t = R({}, e);
		return t.type = EA[e.type], t;
	}, t.prototype.dispatchAction = function(e, t) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		if (G(t) || (t = { silent: !!t }), TA[e.type] && this._model) {
			if (this[Hk]) {
				this._pendingActions.push(e);
				return;
			}
			var n = t.silent;
			cA.call(this, e, n);
			var r = t.flush;
			r ? this._zr.flush() : r !== !1 && Y.browser.weChat && this._throttledZrFlush(), lA.call(this, n), uA.call(this, n);
		}
	}, t.prototype.updateLabelLayout = function() {
		xO.trigger("series:layoutlabels", this._model, this._api, { updatedSeries: [] });
	}, t.prototype.appendData = function(e) {
		if (this._disposed) {
			wA(this.id);
			return;
		}
		var t = e.seriesIndex, n = this.getModel().getSeriesByIndex(t);
		process.env.NODE_ENV !== "production" && q(e.data && n), n.appendData(e), this._scheduler.unfinished = !0, this.getZr().wakeUp();
	}, t.internalField = function() {
		nA = function(e) {
			nS(e._model);
			var t = e._scheduler;
			t.restorePipelines(e._zr, e._model), t.prepareStageTasks(), rA(e, !0), rA(e, !1), t.plan();
		}, rA = function(e, t) {
			for (var n = e._model, r = e._scheduler, i = t ? e._componentsViews : e._chartsViews, a = t ? e._componentsMap : e._chartsMap, o = e._zr, s = e._api, c = 0; c < i.length; c++) i[c].__alive = !1;
			t ? n.eachComponent(function(e, t) {
				e !== "series" && l(t);
			}) : n.eachSeries(l);
			function l(e) {
				var c = e.__requireNewView;
				e.__requireNewView = !1;
				var l = "_ec_" + e.id + "_" + e.type, u = !c && a[l];
				if (!u) {
					var d = vn(e.type), f = t ? ID.getClass(d.main, d.sub) : rb.getClass(d.sub);
					process.env.NODE_ENV !== "production" && q(f, d.sub + " does not exist."), u = new f(), u.init(n, s), a[l] = u, i.push(u), o.add(u.group);
				}
				e.__viewId = u.__id = l, u.__alive = !0, u.__model = e, u.group.__ecComponentInfo = {
					mainType: e.mainType,
					index: e.componentIndex
				}, !t && r.prepareView(u, e, n, s);
			}
			for (var c = 0; c < i.length;) {
				var u = i[c];
				u.__alive ? c++ : (!t && u.renderTask.dispose(), o.remove(u.group), u.dispose(n, s), i.splice(c, 1), a[u.__id] === u && delete a[u.__id], u.__id = u.group.__ecComponentInfo = null);
			}
		}, iA = function(e, t, n, r, i) {
			var a = e._model;
			if (a.setUpdatePayload(n), !r) {
				z([].concat(e._componentsViews, e._chartsViews), l);
				return;
			}
			var o = $l(n, r, i), s = n.excludeSeriesId, c;
			s != null && (c = J(), z(Tl(s), function(e) {
				var t = zl(e, null);
				t != null && c.set(t, !0);
			})), a && a.eachComponent(o, function(t) {
				if (!(c && c.get(t.id) != null)) if (Ld(n)) if (t instanceof jy) n.type === "highlight" && !n.notBlur && !t.get(["emphasis", "disabled"]) && yd(t, n, e._api);
				else {
					var r = bd(t.mainType, t.componentIndex, n.name, e._api), i = r.focusSelf, a = r.dispatchers;
					n.type === "highlight" && i && !n.notBlur && vd(t.mainType, t.componentIndex, e._api), a && z(a, function(e) {
						n.type === "highlight" ? ld(e) : ud(e);
					});
				}
				else Id(n) && t instanceof jy && (Cd(t, n, e._api), wd(t), vA(e));
			}, e), a && a.eachComponent(o, function(t) {
				c && c.get(t.id) != null || l(e[r === "series" ? "_chartsMap" : "_componentsMap"][t.__viewId]);
			}, e);
			function l(r) {
				r && r.__alive && r[t] && r[t](r.__model, a, e._api, n);
			}
		}, aA = {
			prepareAndUpdate: function(e) {
				nA(this), aA.update.call(this, e, e && { optionChanged: e.newOption != null });
			},
			update: function(e, n) {
				var r = this._model, i = this._api, a = this._zr, o = this._coordSysMgr, s = this._scheduler;
				if (r) {
					rS(r), r.setUpdatePayload(e), s.restoreData(r, e), s.performSeriesTasks(r), o.create(r, i), xO.trigger("coordsys:aftercreate", r, i), s.performDataProcessorTasks(r, e), sA(this, r), o.update(r, i), t(r), s.performVisualTasks(r, e);
					var c = r.get("backgroundColor") || "transparent";
					a.setBackgroundColor(c);
					var l = r.get("darkMode");
					l != null && l !== "auto" && a.setDarkMode(l), pA(this, r, i, e, n), xO.trigger("afterupdate", r, i);
				}
			},
			updateTransform: function(e) {
				var t = this, n = t._model, r = t._api;
				if (n) {
					n.setUpdatePayload(e);
					var i = [];
					n.eachComponent(function(a, o) {
						if (a !== "series") {
							var s = t.getViewOfComponentModel(o);
							if (s && s.__alive) if (s.updateTransform) {
								var c = s.updateTransform(o, n, r, e);
								c && c.update && i.push(s);
							} else i.push(s);
						}
					});
					var a = J();
					n.eachSeries(function(i) {
						var o = t._chartsMap[i.__viewId], s = i.pipelineContext;
						if (o.updateTransform && !s.progressiveRender) {
							var c = o.updateTransform(i, n, r, e);
							c && c.update && a.set(i.uid, 1);
						} else a.set(i.uid, 1);
					}), t._scheduler.performVisualTasks(n, e, {
						setDirty: !0,
						dirtyMap: a
					}), hA(t, n, r, e, {}, a), xO.trigger("afterupdate", n, r);
				}
			},
			updateView: function(e) {
				var n = this._model;
				n && (n.setUpdatePayload(e), rb.markUpdateMethod(e, "updateView"), t(n), this._scheduler.performVisualTasks(n, e, { setDirty: !0 }), pA(this, n, this._api, e, {}), xO.trigger("afterupdate", n, this._api));
			},
			updateVisual: function(e) {
				var n = this, r = this._model;
				r && (r.setUpdatePayload(e), r.eachSeries(function(e) {
					e.getData().clearAllVisual();
				}), rb.markUpdateMethod(e, "updateVisual"), t(r), this._scheduler.performVisualTasks(r, e, {
					visualType: "visual",
					setDirty: !0
				}), r.eachComponent(function(t, i) {
					if (t !== "series") {
						var a = n.getViewOfComponentModel(i);
						a && a.__alive && a.updateVisual(i, r, n._api, e);
					}
				}), r.eachSeries(function(t) {
					n._chartsMap[t.__viewId].updateVisual(t, r, n._api, e);
				}), xO.trigger("afterupdate", r, this._api));
			},
			updateLayout: function(e) {
				aA.update.call(this, e);
			}
		};
		function e(e, t, n, r, i) {
			if (e._disposed) {
				wA(e.id);
				return;
			}
			for (var a = e._model, o = e._coordSysMgr.getCoordinateSystems(), s, c = Yl(a, n), l = 0; l < o.length; l++) {
				var u = o[l];
				if (u[t] && (s = u[t](a, c, r, i)) != null) return s;
			}
			process.env.NODE_ENV !== "production" && _l("No coordinate system that supports " + t + " found by the given finder.");
		}
		oA = e, sA = function(e, t) {
			var n = e._chartsMap, r = e._scheduler;
			t.eachSeries(function(e) {
				r.updateStreamModes(e, n[e.__viewId]);
			});
		}, cA = function(e, t) {
			var n = this, r = this.getModel(), i = e.type, a = e.escapeConnect, o = TA[i], s = (o.update || "update").split(":"), c = s.pop(), l = s[0] != null && vn(s[0]);
			this[Hk] = !0, bA(this);
			var u = [e], d = !1;
			e.batch && (d = !0, u = B(e.batch, function(t) {
				return t = At(R({}, t), e), t.batch = null, t;
			}));
			var f = [], p, m = [], h = o.nonRefinedEventType, g = Id(e), _ = Ld(e);
			if (_ && gd(this._api), z(u, function(t) {
				var i = o.action(t, r, n._api);
				if (o.refineEvent ? m.push(i) : p = i, p ||= R({}, t), p.type = h, f.push(p), _) {
					var a = Xl(e), s = a.queryOptionMap, u = a.mainTypeSpecified ? s.keys()[0] : "series";
					iA(n, c, t, u), vA(n);
				} else g ? (iA(n, c, t, "series"), vA(n)) : l && iA(n, c, t, l.main, l.sub);
			}), c !== "none" && !_ && !g && !l) try {
				this[Wk] ? (nA(this), aA.update.call(this, e), this[Wk] = null) : aA[c].call(this, e);
			} catch (e) {
				throw this[Hk] = !1, e;
			}
			if (p = d ? {
				type: h,
				escapeConnect: a,
				batch: f
			} : f[0], this[Hk] = !1, !t) {
				var v = void 0;
				if (o.refineEvent) {
					var y = o.refineEvent(m, e, r, this._api).eventContent;
					q(G(y)), v = At({ type: o.refinedEventType }, y), v.fromAction = e.type, v.fromActionPayload = e, v.escapeConnect = !0;
				}
				var b = this._messageCenter;
				b.trigger(p.type, p), v && b.trigger(v.type, v);
			}
		}, lA = function(e) {
			for (var t = this._pendingActions; t.length;) {
				var n = t.shift();
				cA.call(this, n, e);
			}
		}, uA = function(e) {
			!e && this.trigger("updated");
		}, dA = function(e, t) {
			e.on("rendered", function(n) {
				t.trigger("rendered", n), e.animation.isFinished() && !t[Wk] && !t._scheduler.unfinished && !t._pendingActions.length ? t.trigger("finished") : e.refresh();
			});
		}, fA = function(e, t) {
			e.on("mouseover", function(e) {
				var n = e.target, r = bO(n, Pd);
				r && (xd(r, e, t._api), vA(t));
			}).on("mouseout", function(e) {
				var n = e.target, r = bO(n, Pd);
				r && (Sd(r, e, t._api), vA(t));
			}).on("click", function(e) {
				var n = e.target, r = bO(n, function(e) {
					return bu(e).dataIndex != null;
				}, !0);
				if (r) {
					var i = r.selected ? "unselect" : "select", a = bu(r);
					t._api.dispatchAction({
						type: i,
						dataType: a.dataType,
						dataIndexInside: a.dataIndex,
						seriesIndex: a.seriesIndex,
						isFromClick: !0
					});
				}
			});
		};
		function t(e) {
			e.clearColorPalette(), e.eachSeries(function(e) {
				e.clearColorPalette();
			});
		}
		function n(e) {
			var t = [], n = [], r = !1;
			if (e.eachComponent(function(e, i) {
				var a = i.get("zlevel") || 0, o = i.get("z") || 0, s = i.getZLevelKey();
				r ||= !!s, (e === "series" ? n : t).push({
					zlevel: a,
					z: o,
					idx: i.componentIndex,
					type: e,
					key: s
				});
			}), r) {
				var i = t.concat(n), a, o;
				QT(i, function(e, t) {
					return e.zlevel === t.zlevel ? e.z - t.z : e.zlevel - t.zlevel;
				}), z(i, function(t) {
					var n = e.getComponent(t.type, t.idx), r = t.zlevel, i = t.key;
					a != null && (r = Math.max(a, r)), i ? (r === a && i !== o && r++, o = i) : o &&= (r === a && r++, ""), a = r, n.setZLevel(r);
				});
			}
		}
		pA = function(e, t, r, i, a) {
			n(t), mA(e, t, r, i, a), z(e._chartsViews, function(e) {
				e.__alive = !1;
			}), hA(e, t, r, i, a), z(e._chartsViews, function(e) {
				e.__alive || e.remove(t, r);
			});
		}, mA = function(e, t, n, r, i, a) {
			z(a || e._componentsViews, function(e) {
				var i = e.__model;
				s(i, e), e.render(i, t, n, r), o(i, e), c(i, e);
			});
		}, hA = function(e, t, n, r, l, u) {
			var d = e._scheduler;
			l = R(l || {}, { updatedSeries: t.getSeries() }), xO.trigger("series:beforeupdate", t, n, l);
			var f = !1;
			t.eachSeries(function(t) {
				var n = e._chartsMap[t.__viewId];
				n.__alive = !0;
				var i = n.renderTask;
				d.updatePayload(i, r), s(t, n), u && u.get(t.uid) && i.dirty(), i.perform(d.getPerformArgs(i)) && (f = !0), n.group.silent = !!t.get("silent"), a(t, n), wd(t);
			}), d.unfinished = f || d.unfinished, xO.trigger("series:layoutlabels", t, n, l), xO.trigger("series:transition", t, n, l), t.eachSeries(function(t) {
				var n = e._chartsMap[t.__viewId];
				o(t, n), c(t, n);
			}), i(e, t), xO.trigger("series:afterupdate", t, n, l);
		}, vA = function(e) {
			e[Gk] = !0, e.getZr().wakeUp();
		}, bA = function(e) {
			e[Uk] = (e[Uk] + 1) % 1e6;
		}, yA = function(e) {
			e[Gk] && (e.getZr().storage.traverse(function(e) {
				pp(e) || r(e);
			}), e[Gk] = !1);
		};
		function r(e) {
			for (var t = [], n = e.currentStates, r = 0; r < n.length; r++) {
				var i = n[r];
				i === "emphasis" || i === "blur" || i === "select" || t.push(i);
			}
			e.selected && e.states.select && t.push("select"), e.hoverState === 2 && e.states.emphasis ? t.push("emphasis") : e.hoverState === 1 && e.states.blur && t.push("blur"), e.useStates(t);
		}
		function i(e, t) {
			var n = e._zr;
			if (n.painter.type === "canvas") {
				var r = n.storage, i = 0;
				r.traverse(function(e) {
					e.isGroup || i++;
				});
				var a = i > K(t.get("hoverLayerThreshold"), zE.hoverLayerThreshold) && !Y.node && !Y.worker;
				(e._usingTHL || a) && (t.eachSeries(function(t) {
					if (!t.preventUsingHoverLayer) {
						var n = e._chartsMap[t.__viewId];
						n.__alive && n.eachRendered(function(e) {
							var t = e.states.emphasis;
							t && t.hoverLayer !== 2 && (t.hoverLayer = +!!a);
						});
					}
				}), e._usingTHL = a);
			}
		}
		function a(e, t) {
			var n = e.get("blendMode") || null;
			t.eachRendered(function(e) {
				e.isGroup || (e.style.blend = n);
			});
		}
		function o(e, t) {
			if (!e.preventAutoZ) {
				var n = im(e);
				t.eachRendered(function(e) {
					return om(e, n.z, n.zlevel), !0;
				});
			}
		}
		function s(e, t) {
			t.eachRendered(function(e) {
				if (!pp(e)) {
					var t = e.getTextContent(), n = e.getTextGuideLine();
					e.stateTransition &&= null, t && t.stateTransition && (t.stateTransition = null), n && n.stateTransition && (n.stateTransition = null), e.hasState() ? (e.prevStates = e.currentStates, e.clearStates()) : e.prevStates &&= null;
				}
			});
		}
		function c(e, t) {
			var n = e.getModel("stateAnimation"), i = e.isAnimationEnabled(), a = n.get("duration"), o = a > 0 ? {
				duration: a,
				delay: n.get("delay"),
				easing: n.get("easing")
			} : null;
			t.eachRendered(function(e) {
				if (e.states && e.states.emphasis) {
					if (pp(e)) return;
					if (e instanceof Js && Rd(e), e.__dirty) {
						var t = e.prevStates;
						t && e.useStates(t);
					}
					if (i) {
						e.stateTransition = o;
						var n = e.getTextContent(), a = e.getTextGuideLine();
						n && (n.stateTransition = o), a && (a.stateTransition = o);
					}
					e.__dirty && r(e);
				}
			});
		}
		gA = function(e) {
			return new (function(t) {
				I(n, t);
				function n() {
					return t !== null && t.apply(this, arguments) || this;
				}
				return n.prototype.getCoordinateSystems = function() {
					return e._coordSysMgr.getCoordinateSystems();
				}, n.prototype.getComponentByElement = function(t) {
					for (; t;) {
						var n = t.__ecComponentInfo;
						if (n != null) return e._model.getComponent(n.mainType, n.index);
						t = t.parent;
					}
				}, n.prototype.enterEmphasis = function(t, n) {
					ld(t, n), vA(e);
				}, n.prototype.leaveEmphasis = function(t, n) {
					ud(t, n), vA(e);
				}, n.prototype.enterBlur = function(t) {
					dd(t), vA(e);
				}, n.prototype.leaveBlur = function(t) {
					fd(t), vA(e);
				}, n.prototype.enterSelect = function(t) {
					pd(t), vA(e);
				}, n.prototype.leaveSelect = function(t) {
					md(t), vA(e);
				}, n.prototype.getModel = function() {
					return e.getModel();
				}, n.prototype.getViewOfComponentModel = function(t) {
					return e.getViewOfComponentModel(t);
				}, n.prototype.getViewOfSeriesModel = function(t) {
					return e.getViewOfSeriesModel(t);
				}, n.prototype.getECUpdateCycleVersion = function() {
					return e[Uk];
				}, n.prototype.usingTHL = function() {
					return e._usingTHL;
				}, n;
			}(ju))(e);
		}, _A = function(e) {
			function t(e, t) {
				for (var n = 0; n < e.length; n++) {
					var r = e[n];
					r[qk] = t;
				}
			}
			z(EA, function(n, r) {
				e._messageCenter.on(r, function(n) {
					if (PA[e.group] && e[qk] !== Jk) {
						if (n && n.escapeConnect) return;
						var r = e.makeActionFromEvent(n), i = [];
						z(NA, function(t) {
							t !== e && t.group === e.group && i.push(t);
						}), t(i, Jk), z(i, function(e) {
							e[qk] !== Yk && e.dispatchAction(r);
						}), t(i, Xk);
					}
				});
			});
		};
	}(), t;
}(fo), SA = xA.prototype;
SA.on = Zk("on"), SA.off = Zk("off"), SA.one = function(e, t, n) {
	var r = this;
	yl("ECharts#one is deprecated.");
	function i() {
		var n = [...arguments];
		t && t.apply && t.apply(this, n), r.off(e, i);
	}
	this.on.call(this, e, i, n);
};
var CA = [
	"click",
	"dblclick",
	"mouseover",
	"mouseout",
	"mousemove",
	"mousedown",
	"mouseup",
	"globalout",
	"contextmenu"
];
function wA(e) {
	process.env.NODE_ENV !== "production" && _l("Instance " + e + " has been disposed");
}
var TA = {}, EA = {}, DA = {}, OA = [], kA = [], AA = [], jA = {}, MA = {}, NA = {}, PA = {}, FA = /* @__PURE__ */ new Date() - 0;
/* @__PURE__ */ new Date() - 0;
var IA = "_echarts_instance_";
function LA(e, t, n) {
	var r = !(n && n.ssr);
	if (r) {
		if (process.env.NODE_ENV !== "production" && !e) throw Error("Initialize failed: invalid dom.");
		var i = RA(e);
		if (i) return process.env.NODE_ENV !== "production" && _l("There is a chart instance already initialized on the dom."), i;
		process.env.NODE_ENV !== "production" && Gt(e) && e.nodeName.toUpperCase() !== "CANVAS" && (!e.clientWidth && (!n || n.width == null) || !e.clientHeight && (!n || n.height == null)) && _l("Can't get DOM width or height. Please check dom.clientWidth and dom.clientHeight. They should not be 0.For example, you may need to call this in the callback of window.onload.");
	}
	var a = new xA(e, t, n);
	return a.id = "ec_" + FA++, NA[a.id] = a, r && eu(e, IA, a.id), _A(a), xO.trigger("afterinit", a), a;
}
function RA(e) {
	return NA[tu(e, IA)];
}
function zA(e, t) {
	jA[e] = t;
}
function BA(e) {
	jt(kA, e) < 0 && kA.push(e);
}
function VA(e, t) {
	XA(OA, e, t, kk);
}
function HA(e) {
	WA("afterinit", e);
}
function UA(e) {
	WA("afterupdate", e);
}
function WA(e, t) {
	xO.on(e, t);
}
function GA(e, t, n) {
	var r, i, a, o, s;
	U(t) && (n = t, t = ""), G(e) ? (r = e.type, i = e.event, o = e.update, s = e.publishNonRefinedEvent, n ||= e.action, a = e.refineEvent) : (r = e, i = t);
	function c(e) {
		return e.toLowerCase();
	}
	i = c(i || r);
	var l = a ? c(r) : i;
	TA[r] || (q(Kk.test(r) && Kk.test(i)), a && q(i !== r), TA[r] = {
		actionType: r,
		refinedEventType: i,
		nonRefinedEventType: l,
		update: o,
		action: n,
		refineEvent: a
	}, DA[i] = 1, a && s && (DA[l] = 1), process.env.NODE_ENV !== "production" && EA[l] && vl(l + " must not be shared; use \"refineEvent\" if you intend to share an event name."), EA[l] = r);
}
function KA(e, t) {
	Sg.register(e, t);
}
function qA(e, t) {
	XA(AA, e, t, jk, "layout", !0);
}
function JA(e, t) {
	XA(AA, e, t, Pk, "visual", !0);
}
var YA = [];
function XA(e, t, n, r, i, a) {
	if ((U(t) || G(t)) && (n = t, t = r), process.env.NODE_ENV !== "production") {
		if (isNaN(t) || t == null) throw Error("Illegal priority");
		z(e, function(e) {
			q(e.__raw !== n);
		});
	}
	if (!(jt(YA, n) >= 0)) {
		YA.push(n);
		var o = JD.wrapStageHandler(n, i);
		o.__prio = t, o.__raw = n, e.push(o), process.env.NODE_ENV !== "production" && a && q(!o.dirtyOnOverallProgress, "dirtyOnOverallProgress is not allowed in " + i + " stage; otherwise progressive rendering is disabled on all series.");
	}
}
function ZA(e, t) {
	MA[e] = t;
}
function QA(e, t, n) {
	var r = wO("registerMap");
	r && r(e, t, n);
}
var $A = Xv;
JA(Nk, HD), JA(Ik, WD), JA(Ik, GD), JA(Nk, gO), JA(Ik, _O), JA(Bk, Sk), BA(MD), VA(Ek, ND), ZA("default", qD), GA({
	type: zu,
	event: zu,
	update: zu
}, dn), GA({
	type: Bu,
	event: Bu,
	update: Bu
}, dn), GA({
	type: Vu,
	event: Wu,
	update: Vu,
	action: dn,
	refineEvent: ej,
	publishNonRefinedEvent: !0
}), GA({
	type: Hu,
	event: Wu,
	update: Hu,
	action: dn,
	refineEvent: ej,
	publishNonRefinedEvent: !0
}), GA({
	type: Uu,
	event: Wu,
	update: Uu,
	action: dn,
	refineEvent: ej,
	publishNonRefinedEvent: !0
});
function ej(e, t, n, r) {
	return { eventContent: {
		selected: Td(n),
		isFromClick: t.isFromClick || !1
	} };
}
zA("default", {}), zA("dark", fO);
//#endregion
//#region node_modules/echarts/lib/extension.js
var tj = [], nj = {
	registerPreprocessor: BA,
	registerProcessor: VA,
	registerPostInit: HA,
	registerPostUpdate: UA,
	registerUpdateLifecycle: WA,
	registerAction: GA,
	registerCoordinateSystem: KA,
	registerLayout: qA,
	registerVisual: JA,
	registerTransform: $A,
	registerLoading: ZA,
	registerMap: QA,
	registerImpl: CO,
	PRIORITY: Vk,
	ComponentModel: Ov,
	ComponentView: ID,
	SeriesModel: jy,
	ChartView: rb,
	registerComponentModel: function(e) {
		Ov.registerClass(e);
	},
	registerComponentView: function(e) {
		ID.registerClass(e);
	},
	registerSeriesModel: function(e) {
		jy.registerClass(e);
	},
	registerChartView: function(e) {
		rb.registerClass(e);
	},
	registerCustomSeries: function(e, t) {
		EO(e, t);
	},
	registerSubTypeDefaulter: function(e, t) {
		Ov.registerSubTypeDefaulter(e, t);
	},
	registerPainter: function(e, t) {
		jE(e, t);
	}
};
function rj(e) {
	if (H(e)) {
		z(e, function(e) {
			rj(e);
		});
		return;
	}
	jt(tj, e) >= 0 || (tj.push(e), U(e) && (e = { install: e }), e.install(nj));
}
//#endregion
//#region node_modules/echarts/lib/coord/axisModelCommonMixin.js
var ij = function() {
	function e() {}
	return e.prototype.needIncludeZero = function() {
		return !this.option.scale;
	}, e.prototype.getCoordSysModel = function() {}, e;
}(), aj = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.getCoordSysModel = function() {
		return this.getReferringComponents("grid", Zl).models[0];
	}, t.type = "cartesian2dAxis", t;
}(Ov);
Nt(aj, ij);
//#endregion
//#region node_modules/echarts/lib/coord/axisDefault.js
var oj = {
	show: !0,
	z: 0,
	inverse: !1,
	name: "",
	nameLocation: "end",
	nameRotate: null,
	nameTruncate: {
		maxWidth: null,
		ellipsis: "...",
		placeholder: "."
	},
	nameTextStyle: {},
	nameGap: 15,
	silent: !1,
	triggerEvent: !1,
	tooltip: { show: !1 },
	axisPointer: {},
	axisLine: {
		show: !0,
		onZero: "auto",
		onZeroAxisIndex: null,
		lineStyle: {
			color: Z.color.axisLine,
			width: 1,
			type: "solid"
		},
		symbol: ["none", "none"],
		symbolSize: [10, 15],
		breakLine: !0
	},
	axisTick: {
		show: !0,
		inside: !1,
		length: 5,
		lineStyle: { width: 1 }
	},
	axisLabel: {
		show: !0,
		inside: !1,
		rotate: 0,
		showMinLabel: null,
		showMaxLabel: null,
		margin: 8,
		fontSize: 12,
		color: Z.color.axisLabel,
		textMargin: [0, 3]
	},
	splitLine: {
		show: !0,
		showMinLine: !0,
		showMaxLine: !0,
		lineStyle: {
			color: Z.color.axisSplitLine,
			width: 1,
			type: "solid"
		}
	},
	splitArea: {
		show: !1,
		areaStyle: { color: [Z.color.backgroundTint, Z.color.backgroundTransparent] }
	},
	breakArea: {
		show: !0,
		itemStyle: {
			color: Z.color.neutral00,
			borderColor: Z.color.border,
			borderWidth: 1,
			borderType: [3, 3],
			opacity: .6
		},
		zigzagAmplitude: 4,
		zigzagMinSpan: 4,
		zigzagMaxSpan: 20,
		zigzagZ: 100,
		expandOnClick: !0
	},
	breakLabelLayout: { moveOverlap: "auto" }
}, sj = Ot({
	boundaryGap: !0,
	deduplication: null,
	jitter: 0,
	jitterOverlap: !0,
	jitterMargin: 2,
	splitLine: { show: !1 },
	axisTick: {
		alignWithLabel: !1,
		interval: "auto",
		show: "auto"
	},
	axisLabel: { interval: "auto" }
}, oj), cj = Ot({
	boundaryGap: [0, 0],
	axisLine: { show: "auto" },
	axisTick: { show: "auto" },
	splitNumber: 5,
	minorTick: {
		show: !1,
		splitNumber: 5,
		length: 3,
		lineStyle: {}
	},
	minorSplitLine: {
		show: !1,
		lineStyle: {
			color: Z.color.axisMinorSplitLine,
			width: 1
		}
	}
}, oj), lj = {
	category: sj,
	value: cj,
	time: Ot({
		splitNumber: 6,
		axisLabel: { rich: { primary: { fontWeight: "bold" } } },
		splitLine: { show: !1 }
	}, cj),
	log: At({ logBase: 10 }, cj)
};
//#endregion
//#region node_modules/echarts/lib/coord/axisModelCreator.js
function uj(e, t, n, r) {
	z(ux, function(i, a) {
		var o = Ot(Ot({}, lj[a], !0), r, !0), s = function(e) {
			I(n, e);
			function n() {
				var n = e !== null && e.apply(this, arguments) || this;
				return n.type = t + "Axis." + a, n;
			}
			return n.prototype.mergeDefaultAndTheme = function(e, t) {
				var n = Cv(this), r = n ? Tv(e) : {};
				Ot(e, t.getTheme().get(a + "Axis")), Ot(e, this.getDefaultOption()), e.type = dj(e), n && wv(e, r, n);
			}, n.prototype.optionUpdated = function() {
				this.option.type === "category" && (this.__ordinalMeta = hb.createByAxisModel(this));
			}, n.prototype.getCategories = function(e) {
				var t = this.option;
				if (t.type === "category") return e ? t.data : this.__ordinalMeta.categories;
			}, n.prototype.getOrdinalMeta = function() {
				return this.__ordinalMeta;
			}, n.prototype.updateAxisBreaks = function(e) {
				var t = $S();
				return t ? t.updateModelAxisBreak(this, e) : { breaks: [] };
			}, n.type = t + "Axis." + a, n.defaultOption = o, n;
		}(n);
		e.registerComponentModel(s);
	}), e.registerSubTypeDefaulter(t + "Axis", dj);
}
function dj(e) {
	return e.type || (e.data ? "category" : "value");
}
//#endregion
//#region node_modules/echarts/lib/coord/cartesian/Cartesian.js
var fj = function() {
	function e(e) {
		this.type = "cartesian", this._dimList = [], this._axes = {}, this.name = e || "";
	}
	return e.prototype.getAxis = function(e) {
		return this._axes[e];
	}, e.prototype.getAxes = function() {
		return B(this._dimList, function(e) {
			return this._axes[e];
		}, this);
	}, e.prototype.getAxesByScale = function(e) {
		return e = e.toLowerCase(), It(this.getAxes(), function(t) {
			return t.scale.type === e;
		});
	}, e.prototype.addAxis = function(e) {
		var t = e.dim;
		this._axes[t] = e, this._dimList.push(t);
	}, e;
}(), pj = ["x", "y"];
function mj(e) {
	return (e.type === "interval" || e.type === "time") && !S_(e);
}
var hj = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.type = pw, t.dimensions = pj, t;
	}
	return t.prototype.calcAffineTransform = function() {
		this._transform = this._invTransform = null;
		var e = this.getAxis("x").scale, t = this.getAxis("y").scale;
		if (!(!mj(e) || !mj(t))) {
			var n = Sb(e, null), r = Sb(t, null), i = this.dataToPoint([n[0], r[0]]), a = this.dataToPoint([n[1], r[1]]), o = n[1] - n[0], s = r[1] - r[0];
			if (!(!o || !s)) {
				var c = (a[0] - i[0]) / o, l = (a[1] - i[1]) / s, u = i[0] - n[0] * c, d = i[1] - r[0] * l, f = this._transform = [
					c,
					0,
					0,
					l,
					u,
					d
				];
				this._invTransform = qn([], f);
			}
		}
	}, t.prototype.getBaseAxis = function() {
		return this.getAxesByScale("ordinal")[0] || this.getAxesByScale("time")[0] || this.getAxis("x");
	}, t.prototype.containPoint = function(e) {
		var t = this.getAxis("x"), n = this.getAxis("y");
		return t.contain(t.toLocalCoord(e[0])) && n.contain(n.toLocalCoord(e[1]));
	}, t.prototype.containData = function(e) {
		return this.getAxis("x").containData(e[0]) && this.getAxis("y").containData(e[1]);
	}, t.prototype.containZone = function(e, t) {
		var n = this.dataToPoint(e), r = this.dataToPoint(t), i = this.getArea(), a = new X(n[0], n[1], r[0] - n[0], r[1] - n[1]);
		return i.intersect(a);
	}, t.prototype.dataToPoint = function(e, t, n) {
		n ||= [];
		var r = e[0], i = e[1];
		if (this._transform && r != null && isFinite(r) && i != null && isFinite(i)) return sr(n, e, this._transform);
		var a = this.getAxis("x"), o = this.getAxis("y");
		return n[0] = a.toGlobalCoord(a.dataToCoord(r, t)), n[1] = o.toGlobalCoord(o.dataToCoord(i, t)), n;
	}, t.prototype.clampData = function(e, t) {
		var n = this.getAxis("x").scale, r = this.getAxis("y").scale, i = n.getExtent(), a = r.getExtent(), o = n.parse(e[0]), s = r.parse(e[1]);
		return t ||= [], t[0] = Math.min(Math.max(Math.min(i[0], i[1]), o), Math.max(i[0], i[1])), t[1] = Math.min(Math.max(Math.min(a[0], a[1]), s), Math.max(a[0], a[1])), t;
	}, t.prototype.pointToData = function(e, t, n) {
		if (n ||= [], this._invTransform) return sr(n, e, this._invTransform);
		var r = this.getAxis("x"), i = this.getAxis("y");
		return n[0] = r.coordToData(r.toLocalCoord(e[0]), t), n[1] = i.coordToData(i.toLocalCoord(e[1]), t), n;
	}, t.prototype.getOtherAxis = function(e) {
		return this.getAxis(e.dim === "x" ? "y" : "x");
	}, t.prototype.getArea = function(e) {
		e ||= 0;
		var t = this.getAxis("x").getGlobalExtent(), n = this.getAxis("y").getGlobalExtent(), r = Math.min(t[0], t[1]) - e, i = Math.min(n[0], n[1]) - e;
		return new X(r, i, Math.max(t[0], t[1]) - r + e, Math.max(n[0], n[1]) - i + e);
	}, t;
}(fj);
//#endregion
//#region node_modules/echarts/lib/coord/axisAlignTicks.js
function gj(e, t) {
	var n = e.scale, r = e.model;
	process.env.NODE_ENV !== "production" && q(n && r && (n instanceof Ub || n instanceof ox) && (t instanceof Ub || t instanceof ox));
	var i = ew(n, r, r.ecModel, e, null), a = jb(n), o = jb(t) ? t.intervalStub : t, s = a ? n.intervalStub : n, c = n.base, l = o.getTicks(), u = o.getTicks({ expandToNicedExtent: !0 }), d = l.length - 1;
	process.env.NODE_ENV !== "production" && (q(!S_(t) && !S_(n)), q(d > 0), q(u.length === l.length), q(l[0].value <= l[d].value), q(u[0].value <= l[0].value && l[d].value <= u[d].value), d >= 2 && (q(u[1].value === l[1].value), q(u[d - 1].value === l[d - 1].value)));
	var f, p, m;
	if (d === 1) f = p = 0, m = 1;
	else if (d === 2) {
		var h = Mc(l[0].value - l[1].value), g = Mc(l[1].value - l[2].value);
		f = p = 0, h === g ? m = 2 : (m = 1, h < g ? f = h / g : p = g / h);
	} else {
		var _ = o.getConfig().interval;
		f = (1 - (l[0].value - u[0].value) / _) % 1, p = (1 - (u[d].value - l[d].value) / _) % 1, m = d - +!!f - !!p;
	}
	process.env.NODE_ENV !== "production" && q(m >= 1);
	var v = i.zoomFixMM, y = v[0] || v[1], b = [i.fixMM[0] || y, i.fixMM[1] || y], x = n.getExtent(), S = s.getExtent(), C = Lb(S, b), w, T, E, D, O, k;
	function A(e) {
		for (var t = 50, n = 0; n < t && !e(); n++) E = a ? E * jc(c, 2) : Nb(E), D = Pb(E);
		process.env.NODE_ENV !== "production" && n >= t && _l("incorrect impl in `scaleCalcAlign`.");
	}
	function j() {
		w = Kc(k - E * f, D);
	}
	function ee() {
		T = Kc(O + E * p, D);
	}
	function te() {
		k = f ? Kc(w + E * f, D) : w;
	}
	function ne() {
		O = p ? Kc(T - E * p, D) : T;
	}
	if (b[0] && b[1]) {
		w = C[0], T = C[1], E = (T - w) / (m + f + p);
		var re = e.getExtent(), ie = Mc(re[1] - re[0]);
		D = Xc([T, w], ie, .5 / m), te(), ne(), dl(D) && (E = Kc(E, D));
	} else {
		var ae = C[1] - C[0];
		E = a ? jc(rl(ae), 1) : al(ae / m, 2), D = Pb(E), b[0] ? (w = C[0], A(function() {
			if (te(), O = Kc(k + E * m, D), ee(), T >= C[1]) return !0;
		})) : b[1] ? (T = C[1], A(function() {
			if (ne(), k = Kc(O - E * m, D), j(), w <= C[0]) return !0;
		})) : A(function() {
			k = Kc(Fc(C[0] / E) * E, D), O = Kc(Pc(C[1] / E) * E, D);
			var e = Nc((O - k) / E);
			if (e <= m) {
				var t = m - e, n = void 0, r = i.incl0 || a;
				if (r && C[0] === 0) n = [0, t];
				else if (r && C[1] === 0) n = [t, 0];
				else {
					var o = Pc(t / 2);
					n = t % 2 == 0 ? [o, o] : w + T < C[0] + C[1] ? [o, o + 1] : [o + 1, o];
				}
				if (k = Kc(k - E * n[0], D), O = Kc(O + E * n[1], D), j(), ee(), w <= C[0] && T >= C[1]) return !0;
			}
		});
	}
	Dx(n, b, S, [w, T], x, {
		interval: E,
		intervalCount: m,
		intervalPrecision: D,
		niceExtent: [k, O]
	}), process.env.NODE_ENV !== "production" && n.freeze();
}
//#endregion
//#region node_modules/echarts/lib/coord/axisNiceTicks.js
function _j(e, t) {
	var n = jb(e), r = n ? e.intervalStub : e, i = t.fixMinMax || [], a = n ? e.getExtent() : null, o = r.getExtent(), s = Lb(o, i, t.rawExtentResult);
	r.setExtent(s[0], s[1]), s = r.getExtent();
	var c = n ? yj(r, t) : vj(r, t), l = c.intervalPrecision, u = c.interval, d = t.userInterval;
	d != null && (c.interval = d, c.intervalPrecision = Pb(d)), i[0] || (s[0] = Kc(Pc(s[0] / u) * u, l)), i[1] || (s[1] = Kc(Fc(s[1] / u) * u, l)), d != null && (c.niceExtent = s.slice()), Dx(e, i, o, s, a, c);
}
function vj(e, t) {
	var n = zb(t.splitNumber, 5), r = wb(e);
	process.env.NODE_ENV !== "production" && q(isFinite(r) && r > 0);
	var i = t.minInterval, a = t.maxInterval, o = al(r / n, !0);
	i != null && o < i && (o = i), a != null && o > a && (o = a);
	var s = Pb(o), c = e.getExtent(), l = [Kc(Fc(c[0] / o) * o, s), Kc(Pc(c[1] / o) * o, s)];
	return {
		interval: o,
		intervalPrecision: s,
		niceExtent: l
	};
}
function yj(e, t) {
	var n = zb(t.splitNumber, 10), r = e.getExtent(), i = wb(e);
	process.env.NODE_ENV !== "production" && q(isFinite(i) && i > 0);
	var a = jc(rl(i), 1);
	n / i * a <= .5 && (a *= 10);
	var o = Pb(a), s = [Kc(Fc(r[0] / a) * a, o), Kc(Pc(r[1] / a) * a, o)];
	return {
		intervalPrecision: o,
		interval: a,
		niceExtent: s
	};
}
function bj(e) {
	var t = e.scale, n = e.model, r = n.axis, i = n.ecModel;
	process.env.NODE_ENV !== "production" && q(r && i), xj(t, n, r, i, null);
}
function xj(e, t, n, r, i) {
	var a = ew(e, t, r, n, i), o = kb(e) || Ab(e);
	Sj(e, {
		splitNumber: t.get("splitNumber"),
		fixMinMax: a.fixMM,
		userInterval: t.get("interval"),
		minInterval: o ? t.get("minInterval") : null,
		maxInterval: o ? t.get("maxInterval") : null,
		rawExtentResult: a
	}), n && r && nw(n, e, a, r), process.env.NODE_ENV !== "production" && e.freeze();
}
function Sj(e, t) {
	Cj[e.type](e, t);
}
var Cj = {
	interval: _j,
	log: _j,
	time: nx,
	ordinal: dn
}, wj = [[3, 1], [0, 2]], Tj = function() {
	function e(e, t, n) {
		this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = pj, this._initCartesian(e, t, n), this.model = e;
	}
	return e.prototype.getRect = function() {
		return this._rect;
	}, e.prototype.update = function(e, t) {
		var n = this._axesMap;
		z(this._axesList, function(e) {
			JC(e, 1);
			var t = e.scale;
			Mb(t) && t.setSortInfo(e.model.get("categorySortInfo"));
		});
		function r(e) {
			for (var t = V(e), n = [], r = t.length - 1; r >= 0; r--) {
				var i = e[+t[r]];
				i.__alignTo ? n.push(i) : bj(i);
			}
			z(n, function(e) {
				Aj(e, e.__alignTo) ? bj(e) : gj(e, e.__alignTo.scale);
			});
		}
		r(n.x), r(n.y);
		var i = {};
		z(n.x, function(e) {
			Dj(n, "y", e, i);
		}), z(n.y, function(e) {
			Dj(n, "x", e, i);
		}), this.resize(this.model, t);
	}, e.prototype.resize = function(e, t, n) {
		var r = Sv(e, t), i = this._rect = bv(e.getBoxLayoutParams(), r.refContainer), a = this._axesMap, o = this._coordsList, s = e.get("containLabel");
		if (Mj(a, i), !n) {
			var c = Ij(i, o, a, s, t), l = void 0;
			if (s) Pj ? (Pj(this._axesList, i), Mj(a, i)) : (process.env.NODE_ENV !== "production" && gl("Specified `grid.containLabel` but no `use(LegacyGridContainLabel)`;use `grid.outerBounds` instead.", !0), l = Fj(i.clone(), "axisLabel", null, i, a, c, r));
			else {
				var u = Rj(e, i, r), d = u.outerBoundsRect, f = u.parsedOuterBoundsContain, p = u.outerBoundsClamp;
				d && (l = Fj(d, f, p, i, a, c, r));
			}
			Lj(i, a, Fx.determine, null, l, r), z(this._coordsList, function(e) {
				e.calcAffineTransform();
			});
		}
	}, e.prototype.getAxis = function(e, t) {
		var n = this._axesMap[e];
		if (n != null) return n[t || 0];
	}, e.prototype.getAxes = function() {
		return this._axesList.slice();
	}, e.prototype.getCartesian = function(e, t) {
		if (e != null && t != null) {
			var n = "x" + e + "y" + t;
			return this._coordsMap[n];
		}
		G(e) && (t = e.yAxisIndex, e = e.xAxisIndex);
		for (var r = 0, i = this._coordsList; r < i.length; r++) if (i[r].getAxis("x").index === e || i[r].getAxis("y").index === t) return i[r];
	}, e.prototype.getCartesians = function() {
		return this._coordsList.slice();
	}, e.prototype.convertToPixel = function(e, t, n) {
		var r = this._findConvertTarget(t);
		return r.cartesian ? r.cartesian.dataToPoint(n) : r.axis ? r.axis.toGlobalCoord(r.axis.dataToCoord(n)) : null;
	}, e.prototype.convertFromPixel = function(e, t, n) {
		var r = this._findConvertTarget(t);
		return r.cartesian ? r.cartesian.pointToData(n) : r.axis ? r.axis.coordToData(r.axis.toLocalCoord(n)) : null;
	}, e.prototype._findConvertTarget = function(e) {
		var t = e.seriesModel, n = e.xAxisModel || t && t.getReferringComponents("xAxis", Zl).models[0], r = e.yAxisModel || t && t.getReferringComponents("yAxis", Zl).models[0], i = e.gridModel, a = this._coordsList, o, s;
		return t ? (o = t.coordinateSystem, jt(a, o) < 0 && (o = null)) : n && r ? o = this.getCartesian(n.componentIndex, r.componentIndex) : n ? s = this.getAxis("x", n.componentIndex) : r ? s = this.getAxis("y", r.componentIndex) : i && i.coordinateSystem === this && (o = this._coordsList[0]), {
			cartesian: o,
			axis: s
		};
	}, e.prototype.containPoint = function(e) {
		var t = this._coordsList[0];
		if (t) return t.containPoint(e);
	}, e.prototype._initCartesian = function(e, t, n) {
		var r = this, i = this, a = {
			left: !1,
			right: !1,
			top: !1,
			bottom: !1
		}, o = {
			x: {},
			y: {}
		}, s = {
			x: 0,
			y: 0
		};
		if (t.eachComponent("xAxis", c("x"), this), t.eachComponent("yAxis", c("y"), this), !s.x || !s.y) {
			this._axesMap = {}, this._axesList = [];
			return;
		}
		this._axesMap = o, z(o.x, function(t, n) {
			z(o.y, function(i, a) {
				var o = "x" + n + "y" + a, s = new hj(o);
				s.master = r, s.model = e, r._coordsMap[o] = s, r._coordsList.push(s), s.addAxis(t), s.addAxis(i);
			});
		}), kj(o.x), kj(o.y);
		function c(t) {
			return function(n, r) {
				if (Ej(n, e)) {
					var c = n.get("position");
					t === "x" ? c !== "top" && c !== "bottom" && (c = a.bottom ? "top" : "bottom") : c !== "left" && c !== "right" && (c = a.left ? "right" : "left"), a[c] = !0;
					var l = fx(n), u = new IS(t, px(n, l, !0), [0, 0], l, c);
					u.onBand = kx(u.scale, n), u.inverse = n.get("inverse"), n.axis = u, u.model = n, u.grid = i, u.index = r, i._axesList.push(u), o[t][r] = u, s[t]++;
				}
			};
		}
	}, e.prototype.getTooltipAxes = function(e) {
		var t = [], n = [];
		return z(this.getCartesians(), function(r) {
			var i = e != null && e !== "auto" ? r.getAxis(e) : r.getBaseAxis(), a = r.getOtherAxis(i);
			jt(t, i) < 0 && t.push(i), jt(n, a) < 0 && n.push(a);
		}), {
			baseAxes: t,
			otherAxes: n
		};
	}, e.create = function(t, n) {
		var r = [];
		return t.eachComponent("grid", function(i, a) {
			var o = new e(i, t, n);
			o.name = "grid_" + a, o.resize(i, n, !0), i.coordinateSystem = o, r.push(o), z(o._axesList, function(t) {
				qC(t, e.dimIdxMap);
			});
		}), t.eachSeries(function(e) {
			var t, n;
			Dg({
				targetModel: e,
				coordSysType: pw,
				coordSysProvider: r
			});
			function r() {
				var r = IC(e), i = r.xAxisModel, a = r.yAxisModel;
				t = i.axis, n = a.axis;
				var o = i.getCoordSysModel();
				if (process.env.NODE_ENV !== "production") {
					if (!o) throw Error("Grid \"" + Xt(i.get("gridIndex"), i.get("gridId"), 0) + "\" not found");
					if (i.getCoordSysModel() !== a.getCoordSysModel()) throw Error("xAxis and yAxis must use the same grid");
				}
				return o.coordinateSystem.getCartesian(i.componentIndex, a.componentIndex);
			}
			t && n && (CS(t, e, pw), CS(n, e, pw));
		}, this), r;
	}, e.dimensions = pj, e.dimIdxMap = $h(pj), e;
}();
function Ej(e, t) {
	return e.getCoordSysModel() === t;
}
function Dj(e, t, n, r) {
	n.getAxesOnZeroOf = function() {
		return a ? [a] : [];
	};
	var i = e[t], a, o = n.model, s = o.get(["axisLine", "onZero"]), c = o.get(["axisLine", "onZeroAxisIndex"]);
	if (!s) return;
	if (c != null) Oj(s, i[c]) && (a = i[c]);
	else for (var l in i) if (un(i, l) && Oj(s, i[l]) && !r[u(i[l])]) {
		a = i[l];
		break;
	}
	a && (r[u(a)] = !0);
	function u(e) {
		return e.dim + "_" + e.index;
	}
}
function Oj(e, t) {
	if (!t) return !1;
	var n = t.scale, r = mx(n, 0, !1), i = t && t.type !== "category" && t.type !== "time" && r !== 3;
	return i && e === "auto" && gx(t) && (i = !1), i;
}
function kj(e) {
	for (var t = V(e), n, r = [], i = t.length - 1; i >= 0; i--) {
		var a = e[+t[i]];
		Ob(a.scale) && Tx(a.model, a.type, !0) == null && (a.model.get("alignTicks") && a.model.get("interval") == null ? r.push(a) : n = a);
	}
	n ||= r.pop(), n && z(r, function(e) {
		e.__alignTo = n;
	});
}
function Aj(e, t) {
	return S_(e.scale) || S_(t.scale) || t.scale.getTicks().length < 2;
}
function jj(e, t) {
	var n = e.getExtent(), r = n[0] + n[1];
	e.toGlobalCoord = e.dim === "x" ? function(e) {
		return e + t;
	} : function(e) {
		return r - e + t;
	}, e.toLocalCoord = e.dim === "x" ? function(e) {
		return e - t;
	} : function(e) {
		return r - e + t;
	};
}
function Mj(e, t) {
	z(e.x, function(e) {
		return Nj(e, t.x, t.width);
	}), z(e.y, function(e) {
		return Nj(e, t.y, t.height);
	});
}
function Nj(e, t, n) {
	var r = [0, n], i = +!!e.inverse;
	e.setExtent(r[i], r[1 - i]), jj(e, t);
}
var Pj;
function Fj(e, t, n, r, i, a, o) {
	process.env.NODE_ENV !== "production" && q(t === "all" || t === "axisLabel"), Lj(r, i, Fx.estimate, t, !1, o);
	var s = [
		0,
		0,
		0,
		0
	];
	l(0), l(1), u(r, 0, NaN), u(r, 1, NaN);
	var c = Lt(s, function(e) {
		return e > 0;
	}) == null;
	return Jp(r, s, !0, !0, n), Mj(i, r), c;
	function l(e) {
		z(i[bp[e]], function(t) {
			if (Cx(t.model)) {
				var n = a.ensureRecord(t.model), r = n.labelInfoList;
				if (r) for (var i = 0; i < r.length; i++) {
					var o = r[i], s = t.scale.normalize(Ox(t.scale, iC(o.label).labelInfo.tick));
					s = e === 1 ? 1 - s : s, u(o.rect, e, s), u(o.rect, 1 - e, NaN);
				}
				var c = n.nameLayout;
				if (c) {
					var s = Sx(n.nameLocation) ? .5 : NaN;
					u(c.rect, e, s), u(c.rect, 1 - e, NaN);
				}
			}
		});
	}
	function u(t, n, r) {
		var i = e[bp[n]] - t[bp[n]], a = t[xp[n]] + t[bp[n]] - (e[xp[n]] + e[bp[n]]);
		i = d(i, 1 - r), a = d(a, r);
		var o = wj[n][0], c = wj[n][1];
		s[o] = jc(s[o], i), s[c] = jc(s[c], a);
	}
	function d(e, t) {
		return e > 0 && !Jt(t) && t > 1e-4 && (e /= t), e;
	}
}
function Ij(e, t, n, r, i) {
	var a = new oC(zj);
	return z(n, function(n) {
		return z(n, function(n) {
			if (Cx(n.model)) {
				var o = !r;
				n.axisBuilder = LC(e, t, n.model, i, a, o);
			}
		});
	}), a;
}
function Lj(e, t, n, r, i, a) {
	var o = n === Fx.determine;
	z(t, function(t) {
		return z(t, function(t) {
			Cx(t.model) && (RC(t.axisBuilder, e, t.model), t.axisBuilder.build(o ? { axisTickLabelDetermine: !0 } : { axisTickLabelEstimate: !0 }, { noPxChange: i }));
		});
	});
	var s = {
		x: 0,
		y: 0
	};
	c(0), c(1);
	function c(t) {
		s[bp[1 - t]] = e[xp[t]] <= a.refContainer[xp[t]] * .5 ? 0 : 1 - t == 1 ? 2 : 1;
	}
	z(t, function(e, t) {
		return z(e, function(e) {
			Cx(e.model) && ((r === "all" || o) && e.axisBuilder.build({ axisName: !0 }, { nameMarginLevel: s[t] }), o && e.axisBuilder.build({ axisLine: !0 }));
		});
	});
}
function Rj(e, t, n) {
	var r, i = e.get("outerBoundsMode", !0);
	i === "same" ? r = t.clone() : i == null || i === "auto" ? r = bv(e.get("outerBounds", !0) || dw, n.refContainer) : i !== "none" && process.env.NODE_ENV !== "production" && vl("Invalid grid[" + e.componentIndex + "].outerBoundsMode.");
	var a = e.get("outerBoundsContain", !0), o;
	a == null || a === "auto" ? o = "all" : jt(["all", "axisLabel"], a) < 0 ? (process.env.NODE_ENV !== "production" && vl("Invalid grid[" + e.componentIndex + "].outerBoundsContain."), o = "all") : o = a;
	var s = [Wc(K(e.get("outerBoundsClampWidth", !0), fw[0]), t.width), Wc(K(e.get("outerBoundsClampHeight", !0), fw[1]), t.height)];
	return {
		outerBoundsRect: r,
		parsedOuterBoundsContain: o,
		outerBoundsClamp: s
	};
}
var zj = function(e, t, n, r, i, a) {
	var o = n.axis.dim === "x" ? "y" : "x";
	uC(e, t, n, r, i, a), Sx(e.nameLocation) || z(t.recordMap[o], function(e) {
		e && e.labelInfoList && e.dirVec && fC(e.labelInfoList, e.dirVec, r, i);
	});
};
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/modelHelper.js
function Bj(e, t) {
	var n = {
		axesInfo: {},
		seriesInvolved: !1,
		coordSysAxesInfo: {},
		coordSysMap: {}
	};
	return Vj(n, e, t), n.seriesInvolved && Uj(n, e), n;
}
function Vj(e, t, n) {
	var r = t.getComponent("tooltip"), i = t.getComponent("axisPointer"), a = i.get("link", !0) || [], o = [];
	z(n.getCoordinateSystems(), function(n) {
		if (!n.axisPointerEnabled) return;
		var s = Xj(n.model), c = e.coordSysAxesInfo[s] = {};
		e.coordSysMap[s] = n;
		var l = n.model.getModel("tooltip", r);
		if (z(n.getAxes(), Bt(p, !1, null)), n.getTooltipAxes && r && l.get("show")) {
			var u = l.get("trigger") === "axis", d = l.get(["axisPointer", "type"]) === "cross", f = n.getTooltipAxes(l.get(["axisPointer", "axis"]));
			(u || d) && z(f.baseAxes, Bt(p, !d || "cross", u)), d && z(f.otherAxes, Bt(p, "cross", !1));
		}
		function p(r, s, u) {
			var d = u.model.getModel("axisPointer", i), f = d.get("show");
			if (!(!f || f === "auto" && !r && !Yj(d))) {
				s ??= d.get("triggerTooltip"), d = r ? Hj(u, l, i, t, r, s) : d;
				var p = d.get("snap"), m = d.get("triggerEmphasis"), h = Xj(u.model), g = s || p || u.type === "category", _ = e.axesInfo[h] = {
					key: h,
					axis: u,
					coordSys: n,
					axisPointerModel: d,
					triggerTooltip: s,
					triggerEmphasis: m,
					involveSeries: g,
					snap: p,
					useHandle: Yj(d),
					seriesModels: [],
					linkGroup: null
				};
				c[h] = _, e.seriesInvolved = e.seriesInvolved || g;
				var v = Wj(a, u);
				if (v != null) {
					var y = o[v] || (o[v] = { axesInfo: {} });
					y.axesInfo[h] = _, y.mapper = a[v].mapper, _.linkGroup = y;
				}
			}
		}
	});
}
function Hj(e, t, n, r, i, a) {
	var o = t.getModel("axisPointer"), s = [
		"type",
		"snap",
		"lineStyle",
		"shadowStyle",
		"label",
		"animation",
		"animationDurationUpdate",
		"animationEasingUpdate",
		"z"
	], c = {};
	z(s, function(e) {
		c[e] = L(o.get(e));
	}), c.snap = e.type !== "category" && !!a, o.get("type") === "cross" && (c.type = "line");
	var l = c.label ||= {};
	if (l.show ??= !1, i === "cross" && (l.show = o.get(["label", "show"]) ?? !0, !a)) {
		var u = c.lineStyle = o.get("crossStyle");
		u && At(l, u.textStyle);
	}
	return e.model.getModel("axisPointer", new zm(c, n, r));
}
function Uj(e, t) {
	t.eachSeries(function(t) {
		var n = t.coordinateSystem, r = t.get(["tooltip", "trigger"], !0), i = t.get(["tooltip", "show"], !0);
		!n || !n.model || r === "none" || r === !1 || r === "item" || i === !1 || t.get(["axisPointer", "show"], !0) === !1 || z(e.coordSysAxesInfo[Xj(n.model)], function(e) {
			var r = e.axis;
			n.getAxis(r.dim) === r && (e.seriesModels.push(t), e.seriesDataCount ??= 0, e.seriesDataCount += t.getData().count());
		});
	});
}
function Wj(e, t) {
	for (var n = t.model, r = t.dim, i = 0; i < e.length; i++) {
		var a = e[i] || {};
		if (Gj(a[r + "AxisId"], n.id) || Gj(a[r + "AxisIndex"], n.componentIndex) || Gj(a[r + "AxisName"], n.name)) return i;
	}
}
function Gj(e, t) {
	return e === "all" || H(e) && jt(e, t) >= 0 || e === t;
}
function Kj(e) {
	var t = qj(e);
	if (t) {
		var n = t.axisPointerModel, r = t.axis.scale, i = n.option, a = n.get("status"), o = n.get("value");
		o != null && (o = r.parse(o));
		var s = Yj(n);
		a ?? (i.status = s ? "show" : "hide");
		var c = r.getExtent();
		(o == null || o > c[1]) && (o = c[1]), o < c[0] && (o = c[0]), i.value = o, s && (i.status = t.axis.scale.isBlank() ? "hide" : "show");
	}
}
function qj(e) {
	var t = (e.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
	return t && t.axesInfo[Xj(e)];
}
function Jj(e) {
	var t = qj(e);
	return t && t.axisPointerModel;
}
function Yj(e) {
	return !!e.get(["handle", "show"]);
}
function Xj(e) {
	return e.type + "||" + e.id;
}
//#endregion
//#region node_modules/echarts/lib/component/axis/AxisView.js
var Zj = {}, Qj = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.render = function(t, n, r, i) {
		this.axisPointerClass && Kj(t), e.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(t, r, !0);
	}, t.prototype.updateAxisPointer = function(e, t, n, r) {
		this._doUpdateAxisPointerClass(e, n, !1);
	}, t.prototype.remove = function(e, t) {
		var n = this._axisPointer;
		n && n.remove(t);
	}, t.prototype.dispose = function(t, n) {
		this._disposeAxisPointer(n), e.prototype.dispose.apply(this, arguments);
	}, t.prototype._doUpdateAxisPointerClass = function(e, n, r) {
		var i = t.getAxisPointerClass(this.axisPointerClass);
		if (i) {
			var a = Jj(e);
			a ? (this._axisPointer ||= new i()).render(e, a, n, r) : this._disposeAxisPointer(n);
		}
	}, t.prototype._disposeAxisPointer = function(e) {
		this._axisPointer && this._axisPointer.dispose(e), this._axisPointer = null;
	}, t.registerAxisPointerClass = function(e, t) {
		if (process.env.NODE_ENV !== "production" && Zj[e]) throw Error("axisPointer " + e + " exists");
		Zj[e] = t;
	}, t.getAxisPointerClass = function(e) {
		return e && Zj[e];
	}, t.type = "axis", t;
}(ID), $j = ql();
function eM(e, t, n, r) {
	var i = n.axis;
	if (!i.scale.isBlank()) {
		var a = n.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), c = r.coordinateSystem.getRect(), l = i.getTicksCoords({
			tickModel: a,
			breakTicks: "none",
			pruneByBreak: "preserve_extent_bound"
		});
		if (l.length) {
			var u = s.length, d = $j(e).splitAreaColors, f = J(), p = 0;
			if (d) for (var m = 0; m < l.length; m++) {
				var h = d.get(l[m].tickValue);
				if (h != null) {
					p = (h + (u - 1) * m) % u;
					break;
				}
			}
			var g = i.toGlobalCoord(l[0].coord), _ = o.getAreaStyle();
			s = H(s) ? s : [s];
			for (var m = 1; m < l.length; m++) {
				var v = i.toGlobalCoord(l[m].coord), y = void 0, b = void 0, x = void 0, S = void 0;
				i.isHorizontal() ? (y = g, b = c.y, x = v - y, S = c.height, g = y + x) : (y = c.x, b = g, x = c.width, S = v - b, g = b + S);
				var C = l[m - 1].tickValue;
				C != null && f.set(C, p), t.add(new cc({
					anid: C == null ? null : "area_" + C,
					shape: {
						x: y,
						y: b,
						width: x,
						height: S
					},
					style: At({ fill: s[p] }, _),
					autoBatch: !0,
					silent: !0
				})), p = (p + 1) % u;
			}
			$j(e).splitAreaColors = f;
		}
	}
}
function tM(e) {
	$j(e).splitAreaColors = null;
}
//#endregion
//#region node_modules/echarts/lib/component/axis/CartesianAxisView.js
var nM = [
	"splitArea",
	"splitLine",
	"minorSplitLine",
	"breakArea"
], rM = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n.axisPointerClass = "CartesianAxisPointer", n;
	}
	return t.prototype.render = function(t, n, r, i) {
		this.group.removeAll();
		var a = this._axisGroup;
		this._axisGroup = new cf(), this.group.add(this._axisGroup), Cx(t) && (this._axisGroup.add(t.axis.axisBuilder.group), z(nM, function(e) {
			t.get([e, "show"]) && iM[e](this, this._axisGroup, t, t.getCoordSysModel(), r);
		}, this), i && i.type === "changeAxisOrder" && i.isInitSort || Bp(a, this._axisGroup, t), e.prototype.render.call(this, t, n, r, i));
	}, t.prototype.remove = function() {
		tM(this);
	}, t.type = "cartesianAxis", t;
}(Qj), iM = {
	splitLine: function(e, t, n, r, i) {
		var a = n.axis;
		if (!a.scale.isBlank()) {
			var o = n.getModel("splitLine"), s = o.getModel("lineStyle"), c = s.get("color"), l = o.get("showMinLine") !== !1, u = o.get("showMaxLine") !== !1;
			c = H(c) ? c : [c];
			for (var d = r.coordinateSystem.getRect(), f = a.isHorizontal(), p = 0, m = a.getTicksCoords({
				tickModel: o,
				breakTicks: "none",
				pruneByBreak: "preserve_extent_bound"
			}), h = [], g = [], _ = s.getLineStyle(), v = 0; v < m.length; v++) {
				var y = a.toGlobalCoord(m[v].coord);
				if (!(v === 0 && !l || v === m.length - 1 && !u)) {
					var b = m[v].tickValue;
					f ? (h[0] = y, h[1] = d.y, g[0] = y, g[1] = d.y + d.height) : (h[0] = d.x, h[1] = y, g[0] = d.x + d.width, g[1] = y);
					var x = p++ % c.length, S = new Bf({
						anid: b == null ? null : "line_" + b,
						autoBatch: !0,
						shape: {
							x1: h[0],
							y1: h[1],
							x2: g[0],
							y2: g[1]
						},
						style: At({ stroke: c[x] }, _),
						silent: !0
					});
					Mp(S.shape, _.lineWidth), t.add(S);
				}
			}
		}
	},
	minorSplitLine: function(e, t, n, r, i) {
		var a = n.axis, o = n.getModel("minorSplitLine").getModel("lineStyle"), s = r.coordinateSystem.getRect(), c = a.isHorizontal(), l = a.getMinorTicksCoords();
		if (l.length) for (var u = [], d = [], f = o.getLineStyle(), p = 0; p < l.length; p++) for (var m = 0; m < l[p].length; m++) {
			var h = a.toGlobalCoord(l[p][m].coord);
			c ? (u[0] = h, u[1] = s.y, d[0] = h, d[1] = s.y + s.height) : (u[0] = s.x, u[1] = h, d[0] = s.x + s.width, d[1] = h);
			var g = new Bf({
				anid: "minor_line_" + l[p][m].tickValue,
				autoBatch: !0,
				shape: {
					x1: u[0],
					y1: u[1],
					x2: d[0],
					y2: d[1]
				},
				style: f,
				silent: !0
			});
			Mp(g.shape, f.lineWidth), t.add(g);
		}
	},
	splitArea: function(e, t, n, r, i) {
		eM(e, t, n, r);
	},
	breakArea: function(e, t, n, r, i) {
		var a = $S(), o = n.axis.scale;
		a && o.type !== "ordinal" && a.rectCoordBuildBreakAxis(t, e, n, r.coordinateSystem.getRect(), i);
	}
}, aM = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.type = "xAxis", t;
}(rM), oM = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.type = aM.type, t;
	}
	return t.type = "yAxis", t;
}(rM), sM = function(e) {
	I(t, e);
	function t() {
		var t = e !== null && e.apply(this, arguments) || this;
		return t.type = "grid", t;
	}
	return t.prototype.render = function(e, t) {
		this.group.removeAll(), e.get("show") && this.group.add(new cc({
			shape: e.coordinateSystem.getRect(),
			style: At({ fill: e.get("backgroundColor") }, e.getItemStyle()),
			silent: !0,
			z2: -1
		}));
	}, t.type = "grid", t;
}(ID), cM = { offset: 0 };
function lM(e) {
	e.registerComponentView(sM), e.registerComponentModel(mw), e.registerCoordinateSystem("cartesian2d", Tj), uj(e, "x", aj, cM), uj(e, "y", aj, cM), e.registerComponentView(aM), e.registerComponentView(oM), e.registerPreprocessor(function(e) {
		e.xAxis && e.yAxis && !e.grid && (e.grid = {});
	});
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/BaseAxisPointer.js
var uM = ql(), dM = L, fM = zt, pM = function() {
	function e() {
		this._dragging = !1, this.animationThreshold = 15;
	}
	return e.prototype.render = function(e, t, n, r) {
		var i = t.get("value"), a = t.get("status");
		if (this._axisModel = e, this._axisPointerModel = t, this._api = n, !(!r && this._lastValue === i && this._lastStatus === a)) {
			this._lastValue = i, this._lastStatus = a;
			var o = this._group, s = this._handle;
			if (!a || a === "hide") {
				o && o.hide(), s && s.hide();
				return;
			}
			o && o.show(), s && s.show();
			var c = {};
			this.makeElOption(c, i, e, t, n);
			var l = c.graphicKey;
			l !== this._lastGraphicKey && this.clear(n), this._lastGraphicKey = l;
			var u = this._moveAnimation = this.determineAnimation(e, t);
			if (!o) o = this._group = new cf(), this.createPointerEl(o, c, e, t), this.createLabelEl(o, c, e, t), n.getZr().add(o);
			else {
				var d = Bt(mM, t, u);
				this.updatePointerEl(o, c, d), this.updateLabelEl(o, c, d, t);
			}
			vM(o, t, !0), this._renderHandle(i);
		}
	}, e.prototype.remove = function(e) {
		this.clear(e);
	}, e.prototype.dispose = function(e) {
		this.clear(e);
	}, e.prototype.determineAnimation = function(e, t) {
		var n = t.get("animation"), r = e.axis, i = r.type === "category", a = t.get("snap");
		if (!a && !i) return !1;
		if (n === "auto" || n == null) {
			var o = this.animationThreshold;
			if (i && kS(r).w > o) return !0;
			if (a) {
				var s = qj(e).seriesDataCount, c = r.getExtent();
				return Math.abs(c[0] - c[1]) / s > o;
			}
			return !1;
		}
		return n === !0;
	}, e.prototype.makeElOption = function(e, t, n, r, i) {}, e.prototype.createPointerEl = function(e, t, n, r) {
		var i = t.pointer;
		if (i) {
			var a = uM(e).pointerEl = new vp[i.type](dM(t.pointer));
			e.add(a);
		}
	}, e.prototype.createLabelEl = function(e, t, n, r) {
		if (t.label) {
			var i = uM(e).labelEl = new pc(dM(t.label));
			e.add(i), gM(i, r);
		}
	}, e.prototype.updatePointerEl = function(e, t, n) {
		var r = uM(e).pointerEl;
		r && t.pointer && (r.setStyle(t.pointer.style), n(r, { shape: t.pointer.shape }));
	}, e.prototype.updateLabelEl = function(e, t, n, r) {
		var i = uM(e).labelEl;
		i && (i.setStyle(t.label.style), n(i, {
			x: t.label.x,
			y: t.label.y
		}), gM(i, r));
	}, e.prototype._renderHandle = function(e) {
		if (!(this._dragging || !this.updateHandleTransform)) {
			var t = this._axisPointerModel, n = this._api.getZr(), r = this._handle, i = t.getModel("handle"), a = t.get("status");
			if (!i.get("show") || !a || a === "hide") {
				r && n.remove(r), this._handle = null;
				return;
			}
			var o;
			this._handle || (o = !0, r = this._handle = Up(i.get("icon"), {
				cursor: "move",
				draggable: !0,
				onmousemove: function(e) {
					DT(e.event);
				},
				onmousedown: fM(this._onHandleDragMove, this, 0, 0),
				drift: fM(this._onHandleDragMove, this),
				ondragend: fM(this._onHandleDragEnd, this)
			}), n.add(r)), vM(r, t, !1), r.setStyle(i.getItemStyle(null, [
				"color",
				"borderColor",
				"borderWidth",
				"opacity",
				"shadowColor",
				"shadowBlur",
				"shadowOffsetX",
				"shadowOffsetY"
			]));
			var s = i.get("size");
			H(s) || (s = [s, s]), r.scaleX = s[0] / 2, r.scaleY = s[1] / 2, Mw(this, "_doDispatchAxisPointer", i.get("throttle") || 0, "fixRate"), this._moveHandleToValue(e, o);
		}
	}, e.prototype._moveHandleToValue = function(e, t) {
		mM(this._axisPointerModel, !t && this._moveAnimation, this._handle, _M(this.getHandleTransform(e, this._axisModel, this._axisPointerModel)));
	}, e.prototype._onHandleDragMove = function(e, t) {
		var n = this._handle;
		if (n) {
			this._dragging = !0;
			var r = this.updateHandleTransform(_M(n), [e, t], this._axisModel, this._axisPointerModel);
			this._payloadInfo = r, n.stopAnimation(), n.attr(_M(r)), uM(n).lastProp = null, this._doDispatchAxisPointer();
		}
	}, e.prototype._doDispatchAxisPointer = function() {
		if (this._handle) {
			var e = this._payloadInfo, t = this._axisModel;
			this._api.dispatchAction({
				type: "updateAxisPointer",
				x: e.cursorPoint[0],
				y: e.cursorPoint[1],
				tooltipOption: e.tooltipOption,
				axesInfo: [{
					axisDim: t.axis.dim,
					axisIndex: t.componentIndex
				}]
			});
		}
	}, e.prototype._onHandleDragEnd = function() {
		if (this._dragging = !1, this._handle) {
			var e = this._axisPointerModel.get("value");
			this._moveHandleToValue(e), this._api.dispatchAction({ type: "hideTip" });
		}
	}, e.prototype.clear = function(e) {
		this._lastValue = null, this._lastStatus = null;
		var t = e.getZr(), n = this._group, r = this._handle;
		t && n && (this._lastGraphicKey = null, n && t.remove(n), r && t.remove(r), this._group = null, this._handle = null, this._payloadInfo = null), Nw(this, "_doDispatchAxisPointer");
	}, e.prototype.doClear = function() {}, e.prototype.buildLabel = function(e, t, n) {
		return n ||= 0, {
			x: e[n],
			y: e[1 - n],
			width: t[n],
			height: t[1 - n]
		};
	}, e;
}();
function mM(e, t, n, r) {
	hM(uM(n).lastProp, r) || (uM(n).lastProp = r, t ? dp(n, r, e) : (n.stopAnimation(), n.attr(r)));
}
function hM(e, t) {
	if (G(e) && G(t)) {
		var n = !0;
		return z(t, function(t, r) {
			n &&= hM(e[r], t);
		}), !!n;
	} else return e === t;
}
function gM(e, t) {
	e[t.get(["label", "show"]) ? "show" : "hide"]();
}
function _M(e) {
	return {
		x: e.x || 0,
		y: e.y || 0,
		rotation: e.rotation || 0
	};
}
function vM(e, t, n) {
	var r = t.get("z"), i = t.get("zlevel");
	e && e.traverse(function(e) {
		e.type !== "group" && (r != null && (e.z = r), i != null && (e.zlevel = i), e.silent = n);
	});
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/viewHelper.js
function yM(e) {
	var t = e.get("type"), n = e.getModel(t + "Style"), r;
	return t === "line" ? (r = n.getLineStyle(), r.fill = null) : t === "shadow" && (r = n.getAreaStyle(), r.stroke = null), r;
}
function bM(e, t, n, r, i) {
	var a = SM(n.get("value"), t.axis, t.ecModel, n.get("seriesDataIndices"), {
		precision: n.get(["label", "precision"]),
		formatter: n.get(["label", "formatter"])
	}), o = n.getModel("label"), s = sv(o.get("padding") || 0), c = o.getFont(), l = Br(a, c), u = i.position, d = l.width + s[1] + s[3], f = l.height + s[0] + s[2], p = i.align;
	p === "right" && (u[0] -= d), p === "center" && (u[0] -= d / 2);
	var m = i.verticalAlign;
	m === "bottom" && (u[1] -= f), m === "middle" && (u[1] -= f / 2), xM(u, d, f, r);
	var h = o.get("backgroundColor");
	(!h || h === "auto") && (h = t.get([
		"axisLine",
		"lineStyle",
		"color"
	])), e.label = {
		x: u[0],
		y: u[1],
		style: _m(o, {
			text: a,
			font: c,
			fill: o.getTextColor(),
			padding: s,
			backgroundColor: h
		}),
		z2: 10
	};
}
function xM(e, t, n, r) {
	var i = r.getWidth(), a = r.getHeight();
	e[0] = Math.min(e[0] + t, i) - t, e[1] = Math.min(e[1] + n, a) - n, e[0] = Math.max(e[0], 0), e[1] = Math.max(e[1], 0);
}
function SM(e, t, n, r, i) {
	e = t.scale.parse(e);
	var a = t.scale.getLabel({ value: e }, { precision: i.precision }), o = i.formatter;
	if (o) {
		var s = {
			value: vx(t, { value: e }),
			axisDimension: t.dim,
			axisIndex: t.index,
			seriesData: []
		};
		z(r, function(e) {
			var t = n.getSeriesByIndex(e.seriesIndex), r = e.dataIndexInside, i = t && t.getDataParams(r);
			i && s.seriesData.push(i);
		}), W(o) ? a = o.replace("{value}", a) : U(o) && (a = o(s));
	}
	return a;
}
function CM(e, t, n) {
	var r = Bn();
	return Gn(r, r, n.rotation), Wn(r, r, n.position), Ip([e.dataToCoord(t), (n.labelOffset || 0) + (n.labelDirection || 1) * (n.labelMargin || 0)], r);
}
function wM(e, t, n, r, i, a) {
	var o = pC.innerTextLayout(n.rotation, 0, n.labelDirection);
	n.labelMargin = i.get(["label", "margin"]), bM(t, r, i, a, {
		position: CM(r.axis, e, n),
		align: o.textAlign,
		verticalAlign: o.textVerticalAlign
	});
}
function TM(e, t, n) {
	return n ||= 0, {
		x1: e[n],
		y1: e[1 - n],
		x2: t[n],
		y2: t[1 - n]
	};
}
function EM(e, t, n) {
	return n ||= 0, {
		x: e[n],
		y: e[1 - n],
		width: t[n],
		height: t[1 - n]
	};
}
function DM(e, t, n) {
	return kS(e, {
		fromStat: { sers: B(t, function(e) {
			return n.getSeriesByIndex(e.seriesIndex);
		}) },
		min: 1
	}).w;
}
function OM(e, t, n) {
	return [jc(Ac(t[0], t[1]), e - n / 2), Ac(e + n / 2, jc(t[0], t[1]))];
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/CartesianAxisPointer.js
var kM = function(e) {
	I(t, e);
	function t() {
		return e !== null && e.apply(this, arguments) || this;
	}
	return t.prototype.makeElOption = function(e, t, n, r, i) {
		var a = n.axis, o = a.grid, s = r.get("type"), c = a.getGlobalExtent(), l = AM(o, a).getOtherAxis(a).getGlobalExtent(), u = a.toGlobalCoord(a.dataToCoord(t, !0));
		if (s && s !== "none") {
			var d = yM(r), f = jM[s](a, u, c, l, r.get("seriesDataIndices"), r.ecModel);
			f.style = d, e.graphicKey = f.type, e.pointer = f;
		}
		wM(t, e, PC(o.getRect(), n), n, r, i);
	}, t.prototype.getHandleTransform = function(e, t, n) {
		var r = PC(t.axis.grid.getRect(), t, { labelInside: !1 });
		r.labelMargin = n.get(["handle", "margin"]);
		var i = CM(t.axis, e, r);
		return {
			x: i[0],
			y: i[1],
			rotation: r.rotation + (r.labelDirection < 0 ? Math.PI : 0)
		};
	}, t.prototype.updateHandleTransform = function(e, t, n, r) {
		var i = n.axis, a = i.grid, o = i.getGlobalExtent(!0), s = AM(a, i).getOtherAxis(i).getGlobalExtent(), c = i.dim === "x" ? 0 : 1, l = [e.x, e.y];
		l[c] += t[c], l[c] = Ac(o[1], l[c]), l[c] = jc(o[0], l[c]);
		var u = (s[1] + s[0]) / 2, d = [u, u];
		return d[c] = l[c], {
			x: l[0],
			y: l[1],
			rotation: e.rotation,
			cursorPoint: d,
			tooltipOption: [{ verticalAlign: "middle" }, { align: "center" }][c]
		};
	}, t;
}(pM);
function AM(e, t) {
	var n = {};
	return n[t.dim + "AxisIndex"] = t.index, e.getCartesian(n);
}
var jM = {
	line: function(e, t, n, r) {
		return {
			type: "Line",
			subPixelOptimize: !0,
			shape: TM([t, r[0]], [t, r[1]], MM(e))
		};
	},
	shadow: function(e, t, n, r, i, a) {
		var o = DM(e, i, a), s = r[1] - r[0], c = OM(t, n, o), l = c[0], u = c[1];
		return {
			type: "Rect",
			shape: EM([l, r[0]], [u - l, s], MM(e))
		};
	}
};
function MM(e) {
	return e.dim === "x" ? 0 : 1;
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/AxisPointerModel.js
var NM = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.type = "axisPointer", t.defaultOption = {
		show: "auto",
		z: 50,
		type: "line",
		snap: !1,
		triggerTooltip: !0,
		triggerEmphasis: !0,
		value: null,
		status: null,
		link: [],
		animation: null,
		animationDurationUpdate: 200,
		lineStyle: {
			color: Z.color.border,
			width: 1,
			type: "dashed"
		},
		shadowStyle: { color: Z.color.shadowTint },
		label: {
			show: !0,
			formatter: null,
			precision: "auto",
			margin: 3,
			color: Z.color.neutral00,
			padding: [
				5,
				7,
				5,
				7
			],
			backgroundColor: Z.color.accent60,
			borderColor: null,
			borderWidth: 0,
			borderRadius: 3
		},
		handle: {
			show: !1,
			icon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
			size: 45,
			margin: 50,
			color: Z.color.accent40,
			throttle: 40
		}
	}, t;
}(Ov), PM = ql(), FM = z;
function IM(e, t, n) {
	if (!Y.node) {
		var r = t.getZr();
		PM(r).records || (PM(r).records = {}), LM(r, t);
		var i = PM(r).records[e] || (PM(r).records[e] = {});
		i.handler = n;
	}
}
function LM(e, t) {
	if (PM(e).initialized) return;
	PM(e).initialized = !0, n("click", Bt(BM, "click")), n("mousemove", Bt(BM, "mousemove")), n("mousewheel", Bt(BM, "mousewheel")), n("globalout", zM);
	function n(n, r) {
		e.on(n, function(n) {
			var i = VM(t);
			FM(PM(e).records, function(e) {
				e && r(e, n, i.dispatchAction);
			}), RM(i.pendings, t);
		});
	}
}
function RM(e, t) {
	var n = e.showTip.length, r = e.hideTip.length, i;
	n ? i = e.showTip[n - 1] : r && (i = e.hideTip[r - 1]), i && (i.dispatchAction = null, t.dispatchAction(i));
}
function zM(e, t, n) {
	e.handler("leave", null, n);
}
function BM(e, t, n, r) {
	t.handler(e, n, r);
}
function VM(e) {
	var t = {
		showTip: [],
		hideTip: []
	}, n = function(r) {
		var i = t[r.type];
		i ? i.push(r) : (r.dispatchAction = n, e.dispatchAction(r));
	};
	return {
		dispatchAction: n,
		pendings: t
	};
}
function HM(e, t) {
	if (!Y.node) {
		var n = t.getZr();
		(PM(n).records || {})[e] && (PM(n).records[e] = null);
	}
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/AxisPointerView.js
var UM = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.render = function(e, t, n) {
		var r = t.getComponent("tooltip"), i = e.get("triggerOn") || r && r.get("triggerOn") || "mousemove|click|mousewheel";
		IM("axisPointer", n, function(e, t, n) {
			i !== "none" && (e === "leave" || i.indexOf(e) >= 0) && n({
				type: "updateAxisPointer",
				currTrigger: e,
				x: t && t.offsetX,
				y: t && t.offsetY
			});
		});
	}, t.prototype.remove = function(e, t) {
		HM("axisPointer", t);
	}, t.prototype.dispose = function(e, t) {
		HM("axisPointer", t);
	}, t.type = "axisPointer", t;
}(ID);
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/findPointFromSeries.js
function WM(e, t) {
	var n = [], r = e.seriesIndex, i;
	if (r == null || !(i = t.getSeriesByIndex(r))) return { point: [] };
	var a = i.getData(), o = Kl(a, e);
	if (o == null || o < 0 || H(o)) return { point: [] };
	var s = a.getItemGraphicEl(o), c = i.coordinateSystem;
	if (i.getTooltipPosition) n = i.getTooltipPosition(o) || [];
	else if (c && c.dataToPoint) if (e.isStacked) {
		var l = c.getBaseAxis(), u = c.getOtherAxis(l).dim, d = l.dim, f = +(u === "x" || u === "radius"), p = a.mapDimension(d), m = [];
		m[f] = a.get(p, o), m[1 - f] = a.get(a.getCalculationInfo("stackResultDimension"), o), n = c.dataToPoint(m) || [];
	} else n = c.dataToPoint(a.getValues(B(c.dimensions, function(e) {
		return a.mapDimension(e);
	}), o)) || [];
	else if (s) {
		var h = s.getBoundingRect().clone();
		h.applyTransform(s.transform), n = [h.x + h.width / 2, h.y + h.height / 2];
	}
	return {
		point: n,
		el: s
	};
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/axisTrigger.js
var GM = ql();
function KM(e, t, n) {
	var r = e.currTrigger, i = [e.x, e.y], a = e, o = e.dispatchAction || zt(n.dispatchAction, n), s = t.getComponent("axisPointer").coordSysAxesInfo;
	if (s) {
		nN(i) && (i = WM({
			seriesIndex: a.seriesIndex,
			dataIndex: a.dataIndex
		}, t).point);
		var c = nN(i), l = a.axesInfo, u = s.axesInfo, d = r === "leave" || nN(i), f = {}, p = {}, m = {
			list: [],
			map: {}
		}, h = {
			showPointer: Bt(YM, p),
			showTooltip: Bt(XM, m)
		};
		z(s.coordSysMap, function(e, t) {
			var n = c || e.containPoint(i);
			z(s.coordSysAxesInfo[t], function(e, t) {
				var r = e.axis, a = eN(l, e);
				if (!d && n && (!l || a)) {
					var o = a && a.value;
					o == null && !c && (o = r.pointToData(i)), o != null && qM(e, o, h, !1, f);
				}
			});
		});
		var g = {};
		return z(u, function(e, t) {
			var n = e.linkGroup;
			n && !p[t] && z(n.axesInfo, function(t, r) {
				var i = p[r];
				if (t !== e && i) {
					var a = i.value;
					n.mapper && (a = e.axis.scale.parse(n.mapper(a, tN(t), tN(e)))), g[e.key] = a;
				}
			});
		}), z(g, function(e, t) {
			qM(u[t], e, h, !0, f);
		}), ZM(p, u, f), QM(m, i, e, o), $M(u, o, n), f;
	}
}
function qM(e, t, n, r, i) {
	var a = e.axis;
	if (!(a.scale.isBlank() || !a.containData(t))) {
		if (!e.involveSeries) {
			n.showPointer(e, t);
			return;
		}
		var o = JM(t, e), s = o.payloadBatch, c = o.snapToValue;
		s[0] && i.seriesIndex == null && R(i, s[0]), !r && e.snap && a.containData(c) && c != null && (t = c), n.showPointer(e, t, s), n.showTooltip(e, o, c);
	}
}
function JM(e, t) {
	var n = t.axis, r = n.dim, i = e, a = [], o = Number.MAX_VALUE, s = -1;
	return z(t.seriesModels, function(t, c) {
		var l = t.getData().mapDimensionsAll(r), u, d;
		if (t.getAxisTooltipData) {
			var f = t.getAxisTooltipData(l, e, n);
			d = f.dataIndices, u = f.nestestValue;
		} else {
			if (d = t.indicesOfNearest(r, l[0], e, n.type === "category" ? .5 : null), !d.length) return;
			u = t.getData().get(l[0], d[0]);
		}
		if (dl(u)) {
			var p = e - u, m = Math.abs(p);
			m <= o && ((m < o || p >= 0 && s < 0) && (o = m, s = p, i = u, a.length = 0), z(d, function(e) {
				a.push({
					seriesIndex: t.seriesIndex,
					dataIndexInside: e,
					dataIndex: t.getData().getRawIndex(e)
				});
			}));
		}
	}), {
		payloadBatch: a,
		snapToValue: i
	};
}
function YM(e, t, n, r) {
	e[t.key] = {
		value: n,
		payloadBatch: r
	};
}
function XM(e, t, n, r) {
	var i = n.payloadBatch, a = t.axis, o = a.model, s = t.axisPointerModel;
	if (!(!t.triggerTooltip || !i.length)) {
		var c = t.coordSys.model, l = Xj(c), u = e.map[l];
		u || (u = e.map[l] = {
			coordSysId: c.id,
			coordSysIndex: c.componentIndex,
			coordSysType: c.type,
			coordSysMainType: c.mainType,
			dataByAxis: []
		}, e.list.push(u)), u.dataByAxis.push({
			axisDim: a.dim,
			axisIndex: o.componentIndex,
			axisType: o.type,
			axisId: o.id,
			value: r,
			valueLabelOpt: {
				precision: s.get(["label", "precision"]),
				formatter: s.get(["label", "formatter"])
			},
			seriesDataIndices: i.slice()
		});
	}
}
function ZM(e, t, n) {
	var r = n.axesInfo = [];
	z(t, function(t, n) {
		var i = t.axisPointerModel.option, a = e[n];
		a ? (!t.useHandle && (i.status = "show"), i.value = a.value, i.seriesDataIndices = (a.payloadBatch || []).slice()) : !t.useHandle && (i.status = "hide"), i.status === "show" && r.push({
			axisDim: t.axis.dim,
			axisIndex: t.axis.model.componentIndex,
			value: i.value
		});
	});
}
function QM(e, t, n, r) {
	if (nN(t) || !e.list.length) {
		r({ type: "hideTip" });
		return;
	}
	var i = ((e.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};
	r({
		type: "showTip",
		escapeConnect: !0,
		x: t[0],
		y: t[1],
		tooltipOption: n.tooltipOption,
		position: n.position,
		dataIndexInside: i.dataIndexInside,
		dataIndex: i.dataIndex,
		seriesIndex: i.seriesIndex,
		dataByCoordSys: e.list
	});
}
function $M(e, t, n) {
	var r = n.getZr(), i = "axisPointerLastHighlights", a = GM(r)[i] || {}, o = GM(r)[i] = {};
	z(e, function(e, t) {
		var n = e.axisPointerModel.option;
		n.status === "show" && e.triggerEmphasis && z(n.seriesDataIndices, function(e) {
			o[e.seriesIndex + "|" + e.dataIndex] = e;
		});
	});
	var s = [], c = [];
	function l(e) {
		return {
			seriesIndex: e.seriesIndex,
			dataIndex: e.dataIndex
		};
	}
	z(a, function(e, t) {
		!o[t] && c.push(l(e));
	}), z(o, function(e, t) {
		!a[t] && s.push(l(e));
	}), c.length && n.dispatchAction({
		type: "downplay",
		escapeConnect: !0,
		notBlur: !0,
		batch: c
	}), s.length && n.dispatchAction({
		type: "highlight",
		escapeConnect: !0,
		notBlur: !0,
		batch: s
	});
}
function eN(e, t) {
	for (var n = 0; n < (e || []).length; n++) {
		var r = e[n];
		if (t.axis.dim === r.axisDim && t.axis.model.componentIndex === r.axisIndex) return r;
	}
}
function tN(e) {
	var t = e.axis.model, n = {}, r = n.axisDim = e.axis.dim;
	return n.axisIndex = n[r + "AxisIndex"] = t.componentIndex, n.axisName = n[r + "AxisName"] = t.name, n.axisId = n[r + "AxisId"] = t.id, n;
}
function nN(e) {
	return !e || e[0] == null || isNaN(e[0]) || e[1] == null || isNaN(e[1]);
}
//#endregion
//#region node_modules/echarts/lib/component/axisPointer/install.js
function rN(e) {
	Qj.registerAxisPointerClass("CartesianAxisPointer", kM), e.registerComponentModel(NM), e.registerComponentView(UM), e.registerPreprocessor(function(e) {
		if (e) {
			(!e.axisPointer || e.axisPointer.length === 0) && (e.axisPointer = {});
			var t = e.axisPointer.link;
			t && !H(t) && (e.axisPointer.link = [t]);
		}
	}), e.registerProcessor(e.PRIORITY.PROCESSOR.STATISTIC, { overallReset: function(e, t) {
		e.getComponent("axisPointer").coordSysAxesInfo = Bj(e, t);
	} }), e.registerAction({
		type: "updateAxisPointer",
		event: "updateAxisPointer",
		update: ":updateAxisPointer"
	}, KM);
}
//#endregion
//#region node_modules/echarts/lib/component/grid/install.js
function iN(e) {
	rj(lM), rj(rN);
}
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipModel.js
var aN = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.type = "tooltip", t.dependencies = ["axisPointer"], t.defaultOption = {
		z: 60,
		show: !0,
		showContent: !0,
		trigger: "item",
		triggerOn: "mousemove|click|mousewheel",
		alwaysShowContent: !1,
		renderMode: "auto",
		confine: null,
		showDelay: 0,
		hideDelay: 100,
		transitionDuration: .4,
		displayTransition: !0,
		enterable: !1,
		backgroundColor: Z.color.neutral00,
		shadowBlur: 10,
		shadowColor: "rgba(0, 0, 0, .2)",
		shadowOffsetX: 1,
		shadowOffsetY: 2,
		borderRadius: 4,
		borderWidth: 1,
		defaultBorderColor: Z.color.border,
		padding: null,
		extraCssText: "",
		axisPointer: {
			type: "line",
			axis: "auto",
			animation: "auto",
			animationDurationUpdate: 200,
			animationEasingUpdate: "exponentialOut",
			crossStyle: {
				color: Z.color.borderShade,
				width: 1,
				type: "dashed",
				textStyle: {}
			}
		},
		textStyle: {
			color: Z.color.tertiary,
			fontSize: 14
		}
	}, t;
}(Ov);
//#endregion
//#region node_modules/echarts/lib/component/tooltip/helper.js
function oN(e) {
	var t = e.get("confine");
	return t == null ? e.get("renderMode") === "richText" : !!t;
}
function sN(e) {
	if (Y.domSupported) {
		for (var t = document.documentElement.style, n = 0, r = e.length; n < r; n++) if (e[n] in t) return e[n];
	}
}
var cN = sN([
	"transform",
	"webkitTransform",
	"OTransform",
	"MozTransform",
	"msTransform"
]), lN = sN([
	"webkitTransition",
	"transition",
	"OTransition",
	"MozTransition",
	"msTransition"
]);
function uN(e, t) {
	if (!e) return t;
	t = ov(t, !0);
	var n = e.indexOf(t);
	return e = n === -1 ? t : "-" + e.slice(0, n) + "-" + t, e.toLowerCase();
}
function dN(e, t) {
	var n = e.currentStyle || document.defaultView && document.defaultView.getComputedStyle(e);
	return n ? t ? n[t] : n : null;
}
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipHTMLContent.js
var fN = uN(lN, "transition"), pN = uN(cN, "transform"), mN = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (Y.transform3dSupported ? "will-change:transform;" : "");
function hN(e) {
	return e = e === "left" ? "right" : e === "right" ? "left" : e === "top" ? "bottom" : "top", e;
}
function gN(e, t, n) {
	if (!W(n) || n === "inside") return "";
	var r = e.get("backgroundColor"), i = e.get("borderWidth");
	t = pv(t);
	var a = hN(n), o = Math.max(Math.round(i) * 1.5, 6), s = "", c = pN + ":", l;
	jt(["left", "right"], a) > -1 ? (s += "top:50%", c += "translateY(-50%) rotate(" + (l = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", c += "translateX(-50%) rotate(" + (l = a === "top" ? 225 : 45) + "deg)");
	var u = l * Math.PI / 180, d = o + i, f = d * Math.abs(Math.cos(u)) + d * Math.abs(Math.sin(u)), p = Math.round(((f - Math.SQRT2 * i) / 2 + Math.SQRT2 * i - (f - d) / 2) * 100) / 100;
	s += ";" + a + ":-" + p + "px";
	var m = t + " solid " + i + "px;";
	return "<div style=\"" + [
		"position:absolute;width:" + o + "px;height:" + o + "px;z-index:-1;",
		s + ";" + c + ";",
		"border-bottom:" + m,
		"border-right:" + m,
		"background-color:" + r + ";"
	].join("") + "\"></div>";
}
function _N(e, t, n) {
	var r = "cubic-bezier(0.23,1,0.32,1)", i = "", a = "";
	return n && (i = " " + e / 2 + "s " + r, a = "opacity" + i + ",visibility" + i), t || (i = " " + e + "s " + r, a += (a.length ? "," : "") + (Y.transformSupported ? "" + pN + i : ",left" + i + ",top" + i)), fN + ":" + a;
}
function vN(e, t, n) {
	var r = e.toFixed(0) + "px", i = t.toFixed(0) + "px";
	if (!Y.transformSupported) return n ? "top:" + i + ";left:" + r + ";" : [["top", i], ["left", r]];
	var a = Y.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + r + "," + i + (a ? ",0" : "") + ")";
	return n ? "top:0;left:0;" + pN + ":" + o + ";" : [
		["top", 0],
		["left", 0],
		[cN, o]
	];
}
function yN(e) {
	var t = [], n = e.get("fontSize"), r = e.getTextColor();
	r && t.push("color:" + r), t.push("font:" + e.getFont());
	var i = K(e.get("lineHeight"), Math.round(n * 3 / 2));
	n && t.push("line-height:" + i + "px");
	var a = e.get("textShadowColor"), o = e.get("textShadowBlur") || 0, s = e.get("textShadowOffsetX") || 0, c = e.get("textShadowOffsetY") || 0;
	return a && o && t.push("text-shadow:" + s + "px " + c + "px " + o + "px " + a), z(["decoration", "align"], function(n) {
		var r = e.get(n);
		r && t.push("text-" + n + ":" + r);
	}), t.join(";");
}
function bN(e, t, n, r) {
	var i = [], a = e.get("transitionDuration"), o = e.get("backgroundColor"), s = e.get("shadowBlur"), c = e.get("shadowColor"), l = e.get("shadowOffsetX"), u = e.get("shadowOffsetY"), d = e.getModel("textStyle"), f = Ty(e, "html"), p = l + "px " + u + "px " + s + "px " + c;
	return i.push("box-shadow:" + p), t && a > 0 && i.push(_N(a, n, r)), o && i.push("background-color:" + o), z([
		"width",
		"color",
		"radius"
	], function(t) {
		var n = "border-" + t, r = ov(n), a = e.get(r);
		a != null && i.push(n + ":" + a + (t === "color" ? "" : "px"));
	}), i.push(yN(d)), f != null && i.push("padding:" + sv(f).join("px ") + "px"), i.join(";") + ";";
}
function xN(e, t, n, r, i) {
	var a = t && t.painter;
	if (n) {
		var o = a && a.getViewportRoot();
		o && Zg(e, o, n, r, i);
	} else {
		e[0] = r, e[1] = i;
		var s = a && a.getViewportRootOffset();
		s && (e[0] += s.offsetLeft, e[1] += s.offsetTop);
	}
	e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
var SN = function() {
	function e(e, t) {
		if (this._show = !1, this._styleCoord = [
			0,
			0,
			0,
			0
		], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, Y.wxa) return null;
		var n = document.createElement("div");
		n.domBelongToZr = !0, this.el = n;
		var r = this._zr = e.getZr(), i = t.appendTo, a = i && (W(i) ? document.querySelector(i) : Gt(i) ? i : U(i) && i(e.getDom()));
		xN(this._styleCoord, r, a, e.getWidth() / 2, e.getHeight() / 2), (a || e.getDom()).appendChild(n), this._api = e, this._container = a;
		var o = this;
		n.onmouseenter = function() {
			o._enterable && (clearTimeout(o._hideTimeout), o._show = !0), o._inContent = !0;
		}, n.onmousemove = function(e) {
			if (e ||= window.event, !o._enterable) {
				var t = r.handler;
				CT(r.painter.getViewportRoot(), e, !0), t.dispatch("mousemove", e);
			}
		}, n.onmouseleave = function() {
			o._inContent = !1, o._enterable && o._show && o.hideLater(o._hideDelay);
		};
	}
	return e.prototype.update = function(e) {
		if (!this._container) {
			var t = this._api.getDom(), n = dN(t, "position"), r = t.style;
			r.position !== "absolute" && n !== "absolute" && (r.position = "relative");
		}
		var i = e.get("alwaysShowContent");
		i && this._moveIfResized(), this._alwaysShowContent = i, this._enableDisplayTransition = e.get("displayTransition") && e.get("transitionDuration") > 0, this.el.className = e.get("className") || "";
	}, e.prototype.show = function(e, t) {
		clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
		var n = this.el, r = n.style, i = this._styleCoord;
		n.innerHTML ? r.cssText = mN + bN(e, !this._firstShow, this._longHide, this._enableDisplayTransition) + vN(i[0], i[1], !0) + ("border-color:" + pv(t) + ";") + (e.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : r.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
	}, e.prototype.setContent = function(e, t, n, r, i) {
		var a = this.el;
		if (e == null) {
			a.innerHTML = "";
			return;
		}
		var o = "";
		if (W(i) && n.get("trigger") === "item" && !oN(n) && (o = gN(n, r, i)), W(e)) a.innerHTML = e + o;
		else if (e) {
			a.innerHTML = "", H(e) || (e = [e]);
			for (var s = 0; s < e.length; s++) Gt(e[s]) && e[s].parentNode !== a && a.appendChild(e[s]);
			if (o && a.childNodes.length) {
				var c = document.createElement("div");
				c.innerHTML = o, a.appendChild(c);
			}
		}
	}, e.prototype.setEnterable = function(e) {
		this._enterable = e;
	}, e.prototype.getSize = function() {
		var e = this.el;
		return e ? [e.offsetWidth, e.offsetHeight] : [0, 0];
	}, e.prototype.moveTo = function(e, t) {
		if (this.el) {
			var n = this._styleCoord;
			if (xN(n, this._zr, this._container, e, t), n[0] != null && n[1] != null) {
				var r = this.el.style;
				z(vN(n[0], n[1]), function(e) {
					r[e[0]] = e[1];
				});
			}
		}
	}, e.prototype._moveIfResized = function() {
		var e = this._styleCoord[2], t = this._styleCoord[3];
		this.moveTo(e * this._zr.getWidth(), t * this._zr.getHeight());
	}, e.prototype.hide = function() {
		var e = this, t = this.el.style;
		this._enableDisplayTransition ? (t.visibility = "hidden", t.opacity = "0") : t.display = "none", Y.transform3dSupported && (t.willChange = ""), this._show = !1, this._longHideTimeout = setTimeout(function() {
			return e._longHide = !0;
		}, 500);
	}, e.prototype.hideLater = function(e) {
		this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(zt(this.hide, this), e)) : this.hide());
	}, e.prototype.isShow = function() {
		return this._show;
	}, e.prototype.dispose = function() {
		clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
		var e = this._zr;
		Qg(e && e.painter && e.painter.getViewportRoot(), this._container);
		var t = this.el;
		if (t) {
			t.onmouseenter = t.onmousemove = t.onmouseleave = null;
			var n = t.parentNode;
			n && n.removeChild(t);
		}
		this.el = this._container = null;
	}, e;
}(), CN = function() {
	function e(e) {
		this._show = !1, this._styleCoord = [
			0,
			0,
			0,
			0
		], this._alwaysShowContent = !1, this._enterable = !0, this._zr = e.getZr(), EN(this._styleCoord, this._zr, e.getWidth() / 2, e.getHeight() / 2);
	}
	return e.prototype.update = function(e) {
		var t = e.get("alwaysShowContent");
		t && this._moveIfResized(), this._alwaysShowContent = t;
	}, e.prototype.show = function() {
		this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
	}, e.prototype.setContent = function(e, t, n, r, i) {
		var a = this;
		G(e) && Sl(process.env.NODE_ENV === "production" ? "" : "Passing DOM nodes as content is not supported in richText tooltip!"), this.el && this._zr.remove(this.el);
		var o = n.getModel("textStyle");
		this.el = new pc({
			style: {
				rich: t.richTextStyles,
				text: e,
				lineHeight: 22,
				borderWidth: 1,
				borderColor: r,
				textShadowColor: o.get("textShadowColor"),
				fill: n.get(["textStyle", "color"]),
				padding: Ty(n, "richText"),
				verticalAlign: "top",
				align: "left"
			},
			z: n.get("z")
		}), z([
			"backgroundColor",
			"borderRadius",
			"shadowColor",
			"shadowBlur",
			"shadowOffsetX",
			"shadowOffsetY"
		], function(e) {
			a.el.style[e] = n.get(e);
		}), z([
			"textShadowBlur",
			"textShadowOffsetX",
			"textShadowOffsetY"
		], function(e) {
			a.el.style[e] = o.get(e) || 0;
		}), this._zr.add(this.el);
		var s = this;
		this.el.on("mouseover", function() {
			s._enterable && (clearTimeout(s._hideTimeout), s._show = !0), s._inContent = !0;
		}), this.el.on("mouseout", function() {
			s._enterable && s._show && s.hideLater(s._hideDelay), s._inContent = !1;
		});
	}, e.prototype.setEnterable = function(e) {
		this._enterable = e;
	}, e.prototype.getSize = function() {
		var e = this.el, t = this.el.getBoundingRect(), n = TN(e.style);
		return [t.width + n.left + n.right, t.height + n.top + n.bottom];
	}, e.prototype.moveTo = function(e, t) {
		var n = this.el;
		if (n) {
			var r = this._styleCoord;
			EN(r, this._zr, e, t), e = r[0], t = r[1];
			var i = n.style, a = wN(i.borderWidth || 0), o = TN(i);
			n.x = e + a + o.left, n.y = t + a + o.top, n.markRedraw();
		}
	}, e.prototype._moveIfResized = function() {
		var e = this._styleCoord[2], t = this._styleCoord[3];
		this.moveTo(e * this._zr.getWidth(), t * this._zr.getHeight());
	}, e.prototype.hide = function() {
		this.el && this.el.hide(), this._show = !1;
	}, e.prototype.hideLater = function(e) {
		this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(zt(this.hide, this), e)) : this.hide());
	}, e.prototype.isShow = function() {
		return this._show;
	}, e.prototype.dispose = function() {
		this._zr.remove(this.el);
	}, e;
}();
function wN(e) {
	return Math.max(0, e);
}
function TN(e) {
	var t = wN(e.shadowBlur || 0), n = wN(e.shadowOffsetX || 0), r = wN(e.shadowOffsetY || 0);
	return {
		left: wN(t - n),
		right: wN(t + n),
		top: wN(t - r),
		bottom: wN(t + r)
	};
}
function EN(e, t, n, r) {
	e[0] = n, e[1] = r, e[2] = e[0] / t.getWidth(), e[3] = e[1] / t.getHeight();
}
//#endregion
//#region node_modules/echarts/lib/component/tooltip/TooltipView.js
var DN = new cc({ shape: {
	x: -1,
	y: -1,
	width: 2,
	height: 2
} }), ON = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.init = function(e, t) {
		if (!(Y.node || !t.getDom())) {
			var n = e.getComponent("tooltip"), r = this._renderMode = nu(n.get("renderMode"));
			this._tooltipContent = r === "richText" ? new CN(t) : new SN(t, { appendTo: n.get("appendToBody", !0) ? "body" : n.get("appendTo", !0) });
		}
	}, t.prototype.render = function(e, t, n) {
		if (!(Y.node || !n.getDom())) {
			this.group.removeAll(), this._tooltipModel = e, this._ecModel = t, this._api = n;
			var r = this._tooltipContent;
			r.update(e), r.setEnterable(e.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && e.get("transitionDuration") ? Mw(this, "_updatePosition", 50, "fixRate") : Nw(this, "_updatePosition");
		}
	}, t.prototype._initGlobalListener = function() {
		var e = this._tooltipModel.get("triggerOn");
		IM("itemTooltip", this._api, zt(function(t, n, r) {
			e !== "none" && (e.indexOf(t) >= 0 ? this._tryShow(n, r) : t === "leave" && this._hide(r));
		}, this));
	}, t.prototype._keepShow = function() {
		var e = this._tooltipModel, t = this._ecModel, n = this._api, r = e.get("triggerOn");
		if (e.get("trigger") !== "axis" && (this._lastDataByCoordSys = null, this._cbParamsList = null), this._lastX != null && this._lastY != null && r !== "none" && r !== "click") {
			var i = this;
			clearTimeout(this._refreshUpdateTimeout), this._refreshUpdateTimeout = setTimeout(function() {
				!n.isDisposed() && i.manuallyShowTip(e, t, n, {
					x: i._lastX,
					y: i._lastY,
					dataByCoordSys: i._lastDataByCoordSys
				});
			});
		}
	}, t.prototype.manuallyShowTip = function(e, t, n, r) {
		if (!(r.from === this.uid || Y.node || !n.getDom())) {
			var i = AN(r, n);
			this._ticket = "";
			var a = r.dataByCoordSys, o = FN(r, t, n);
			if (o) {
				var s = o.el.getBoundingRect().clone();
				s.applyTransform(o.el.transform), this._tryShow({
					offsetX: s.x + s.width / 2,
					offsetY: s.y + s.height / 2,
					target: o.el,
					position: r.position,
					positionDefault: "bottom"
				}, i);
			} else if (r.tooltip && r.x != null && r.y != null) {
				var c = DN;
				c.x = r.x, c.y = r.y, c.update(), bu(c).tooltipConfig = {
					name: null,
					option: r.tooltip
				}, this._tryShow({
					offsetX: r.x,
					offsetY: r.y,
					target: c
				}, i);
			} else if (a) this._tryShow({
				offsetX: r.x,
				offsetY: r.y,
				position: r.position,
				dataByCoordSys: a,
				tooltipOption: r.tooltipOption
			}, i);
			else if (r.seriesIndex != null) {
				if (this._manuallyAxisShowTip(e, t, n, r)) return;
				var l = WM(r, t), u = l.point[0], d = l.point[1];
				u != null && d != null && this._tryShow({
					offsetX: u,
					offsetY: d,
					target: l.el,
					position: r.position,
					positionDefault: "bottom"
				}, i);
			} else r.x != null && r.y != null && (n.dispatchAction({
				type: "updateAxisPointer",
				x: r.x,
				y: r.y
			}), this._tryShow({
				offsetX: r.x,
				offsetY: r.y,
				position: r.position,
				target: n.getZr().findHover(r.x, r.y).target
			}, i));
		}
	}, t.prototype.manuallyHideTip = function(e, t, n, r) {
		var i = this._tooltipContent;
		this._tooltipModel && i.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, this._cbParamsList = null, r.from !== this.uid && this._hide(AN(r, n));
	}, t.prototype._manuallyAxisShowTip = function(e, t, n, r) {
		var i = r.seriesIndex, a = r.dataIndex, o = t.getComponent("axisPointer").coordSysAxesInfo;
		if (!(i == null || a == null || o == null)) {
			var s = t.getSeriesByIndex(i);
			if (s && kN([
				s.getData().getItemModel(a),
				s,
				(s.coordinateSystem || {}).model
			], this._tooltipModel).get("trigger") === "axis") return n.dispatchAction({
				type: "updateAxisPointer",
				seriesIndex: i,
				dataIndex: a,
				position: r.position
			}), !0;
		}
	}, t.prototype._tryShow = function(e, t) {
		var n = e.target;
		if (this._tooltipModel) {
			this._lastX = e.offsetX, this._lastY = e.offsetY;
			var r = e.dataByCoordSys;
			if (r && r.length) this._showAxisTooltip(r, e);
			else if (n) {
				if (bu(n).ssrType === "legend") return;
				this._lastDataByCoordSys = null, this._cbParamsList = null;
				var i, a;
				bO(n, function(e) {
					if (e.tooltipDisabled) return i = a = null, !0;
					i || a || (bu(e).dataIndex == null ? bu(e).tooltipConfig != null && (a = e) : i = e);
				}, !0), i ? this._showSeriesItemTooltip(e, i, t) : a ? this._showComponentItemTooltip(e, a, t) : this._hide(t);
			} else this._lastDataByCoordSys = null, this._cbParamsList = null, this._hide(t);
		}
	}, t.prototype._showOrMove = function(e, t) {
		var n = e.get("showDelay");
		t = zt(t, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(t, n) : t();
	}, t.prototype._showAxisTooltip = function(e, t) {
		var n = this._ecModel, r = this._tooltipModel, i = [t.offsetX, t.offsetY], a = kN([t.tooltipOption], r), o = this._renderMode, s = [], c = dy("section", {
			blocks: [],
			noHeader: !0
		}), l = [], u = new Ey();
		z(e, function(e) {
			z(e.dataByAxis, function(e) {
				var t = n.getComponent(e.axisDim + "Axis", e.axisIndex), i = e.value, a = t.axis, d = a.scale.parse(i);
				if (!(!t || i == null)) {
					var f = SM(i, a, n, e.seriesDataIndices, e.valueLabelOpt), p = dy("section", {
						header: f,
						noHeader: !$t(f),
						sortBlocks: !0,
						blocks: []
					});
					c.blocks.push(p), z(e.seriesDataIndices, function(i) {
						var a = n.getSeriesByIndex(i.seriesIndex), c = i.dataIndexInside, m = a.getDataParams(c);
						if (!(m.dataIndex < 0)) {
							m.axisDim = e.axisDim, m.axisIndex = e.axisIndex, m.axisType = e.axisType, m.axisId = e.axisId, m.axisValue = vx(t.axis, { value: d }), m.axisValueLabel = f, m.marker = u.makeTooltipMarker("item", pv(m.color), o);
							var h = zv(a.formatTooltip(c, !0, null)), g = h.frag;
							if (g) {
								var _ = kN([a], r).get("valueFormatter");
								p.blocks.push(_ ? R({ valueFormatter: _ }, g) : g);
							}
							h.text && l.push(h.text), s.push(m);
						}
					});
				}
			});
		}), c.blocks.reverse(), l.reverse();
		var d = t.position, f = _y(c, u, o, a.get("order"), n.get("useUTC"), a.get("textStyle"));
		f && l.unshift(f);
		var p = o === "richText" ? "\n\n" : "<br/>", m = l.join(p);
		this._showOrMove(a, function() {
			this._updateContentNotChangedOnAxis(e, s) ? this._updatePosition(a, d, i[0], i[1], this._tooltipContent, s) : this._showTooltipContent(a, m, s, Math.random() + "", i[0], i[1], d, null, u);
		});
	}, t.prototype._showSeriesItemTooltip = function(e, t, n) {
		var r = this._ecModel, i = bu(t), a = i.seriesIndex, o = r.getSeriesByIndex(a), s = i.dataModel || o, c = i.dataIndex, l = i.dataType, u = s.getData(l), d = this._renderMode, f = e.positionDefault, p = kN([
			u.getItemModel(c),
			s,
			o && (o.coordinateSystem || {}).model
		], this._tooltipModel, f ? { position: f } : null), m = p.get("trigger");
		if (!(m != null && m !== "item")) {
			var h = s.getDataParams(c, l), g = new Ey();
			h.marker = g.makeTooltipMarker("item", pv(h.color), d);
			var _ = zv(s.formatTooltip(c, !1, l)), v = p.get("order"), y = p.get("valueFormatter"), b = _.frag, x = b ? _y(y ? R({ valueFormatter: y }, b) : b, g, d, v, r.get("useUTC"), p.get("textStyle")) : _.text, S = "item_" + s.name + "_" + c;
			this._showOrMove(p, function() {
				this._showTooltipContent(p, x, h, S, e.offsetX, e.offsetY, e.position, e.target, g);
			}), n({
				type: "showTip",
				dataIndexInside: c,
				dataIndex: u.getRawIndex(c),
				seriesIndex: a,
				from: this.uid
			});
		}
	}, t.prototype._showComponentItemTooltip = function(e, t, n) {
		var r = this._renderMode === "html", i = bu(t), a = i.tooltipConfig.option || {}, o = a.encodeHTMLContent;
		if (W(a)) {
			var s = a;
			a = {
				content: s,
				formatter: s
			}, o = !0;
		}
		o && r && a.content && (a = L(a), a.content = a_(a.content));
		var c = [a], l = this._ecModel.getComponent(i.componentMainType, i.componentIndex);
		l && c.push(l), c.push({ formatter: a.content });
		var u = e.positionDefault, d = kN(c, this._tooltipModel, u ? { position: u } : null), f = d.get("content"), p = Math.random() + "", m = new Ey();
		this._showOrMove(d, function() {
			var n = L(d.get("formatterParams") || {});
			this._showTooltipContent(d, f, n, p, e.offsetX, e.offsetY, e.position, t, m);
		}), n({
			type: "showTip",
			from: this.uid
		});
	}, t.prototype._showTooltipContent = function(e, t, n, r, i, a, o, s, c) {
		if (this._ticket = "", !(!e.get("showContent") || !e.get("show"))) {
			var l = this._tooltipContent;
			l.setEnterable(e.get("enterable"));
			var u = e.get("formatter");
			o ||= e.get("position");
			var d = t, f = this._getNearestPoint([i, a], n, e.get("trigger"), e.get("borderColor"), e.get("defaultBorderColor", !0)).color;
			if (u) if (W(u)) {
				var p = e.ecModel.get("useUTC"), m = H(n) ? n[0] : n, h = m && m.axisType && m.axisType.indexOf("time") >= 0;
				d = u, h && (d = V_(m.axisValue, d, p)), d = dv(d, n, !0);
			} else if (U(u)) {
				var g = zt(function(t, r) {
					t === this._ticket && (l.setContent(r, c, e, f, o), this._updatePosition(e, o, i, a, l, n, s));
				}, this);
				this._ticket = r, d = u(n, r, g);
			} else d = u;
			l.setContent(d, c, e, f, o), l.show(e, f), this._updatePosition(e, o, i, a, l, n, s);
		}
	}, t.prototype._getNearestPoint = function(e, t, n, r, i) {
		if (n === "axis" || H(t)) return { color: r || i };
		if (!H(t)) return { color: r || t.color || t.borderColor };
	}, t.prototype._updatePosition = function(e, t, n, r, i, a, o) {
		var s = this._api.getWidth(), c = this._api.getHeight();
		t ||= e.get("position");
		var l = i.getSize(), u = e.get("align"), d = e.get("verticalAlign"), f = o && o.getBoundingRect().clone();
		if (o && f.applyTransform(o.transform), U(t) && (t = t([n, r], a, i.el, f, {
			viewSize: [s, c],
			contentSize: l.slice()
		})), H(t)) n = Hc(t[0], s), r = Hc(t[1], c);
		else if (G(t)) {
			var p = t;
			p.width = l[0], p.height = l[1];
			var m = bv(p, {
				width: s,
				height: c
			});
			n = m.x, r = m.y, u = null, d = null;
		} else if (W(t) && o) {
			var h = NN(t, f, l, e.get("borderWidth"));
			n = h[0], r = h[1];
		} else {
			var h = jN(n, r, i, s, c, u ? null : 20, d ? null : 20);
			n = h[0], r = h[1];
		}
		if (u && (n -= PN(u) ? l[0] / 2 : u === "right" ? l[0] : 0), d && (r -= PN(d) ? l[1] / 2 : d === "bottom" ? l[1] : 0), oN(e)) {
			var h = MN(n, r, i, s, c);
			n = h[0], r = h[1];
		}
		i.moveTo(n, r);
	}, t.prototype._updateContentNotChangedOnAxis = function(e, t) {
		var n = this._lastDataByCoordSys, r = this._cbParamsList, i = !!n && n.length === e.length;
		return i && z(n, function(n, a) {
			var o = n.dataByAxis || [], s = (e[a] || {}).dataByAxis || [];
			i &&= o.length === s.length, i && z(o, function(e, n) {
				var a = s[n] || {}, o = e.seriesDataIndices || [], c = a.seriesDataIndices || [];
				i = i && e.value === a.value && e.axisType === a.axisType && e.axisId === a.axisId && o.length === c.length, i && z(o, function(e, t) {
					var n = c[t];
					i = i && e.seriesIndex === n.seriesIndex && e.dataIndex === n.dataIndex;
				}), r && z(e.seriesDataIndices, function(e) {
					var n = e.seriesIndex, a = t[n], o = r[n];
					a && o && o.data !== a.data && (i = !1);
				});
			});
		}), this._lastDataByCoordSys = e, this._cbParamsList = t, !!i;
	}, t.prototype._hide = function(e) {
		this._lastDataByCoordSys = null, this._cbParamsList = null, e({
			type: "hideTip",
			from: this.uid
		});
	}, t.prototype.dispose = function(e, t) {
		Y.node || !t.getDom() || (Nw(this, "_updatePosition"), this._tooltipContent.dispose(), HM("itemTooltip", t), this._tooltipContent = null, this._tooltipModel = null, this._lastDataByCoordSys = null, this._cbParamsList = null);
	}, t.type = "tooltip", t;
}(ID);
function kN(e, t, n) {
	var r = t.ecModel, i;
	n ? (i = new zm(n, r, r), i = new zm(t.option, i, r)) : i = t;
	for (var a = e.length - 1; a >= 0; a--) {
		var o = e[a];
		o && (o instanceof zm && (o = o.get("tooltip", !0)), W(o) && (o = { formatter: o }), o && (i = new zm(o, i, r)));
	}
	return i;
}
function AN(e, t) {
	return e.dispatchAction || zt(t.dispatchAction, t);
}
function jN(e, t, n, r, i, a, o) {
	var s = n.getSize(), c = s[0], l = s[1];
	return a != null && (e + c + a + 2 > r ? e -= c + a : e += a), o != null && (t + l + o > i ? t -= l + o : t += o), [e, t];
}
function MN(e, t, n, r, i) {
	var a = n.getSize(), o = a[0], s = a[1];
	return e = Math.min(e + o, r) - o, t = Math.min(t + s, i) - s, e = Math.max(e, 0), t = Math.max(t, 0), [e, t];
}
function NN(e, t, n, r) {
	var i = n[0], a = n[1], o = Math.ceil(Math.SQRT2 * r) + 8, s = 0, c = 0, l = t.width, u = t.height;
	switch (e) {
		case "inside":
			s = t.x + l / 2 - i / 2, c = t.y + u / 2 - a / 2;
			break;
		case "top":
			s = t.x + l / 2 - i / 2, c = t.y - a - o;
			break;
		case "bottom":
			s = t.x + l / 2 - i / 2, c = t.y + u + o;
			break;
		case "left":
			s = t.x - i - o, c = t.y + u / 2 - a / 2;
			break;
		case "right": s = t.x + l + o, c = t.y + u / 2 - a / 2;
	}
	return [s, c];
}
function PN(e) {
	return e === "center" || e === "middle";
}
function FN(e, t, n) {
	var r = Xl(e).queryOptionMap, i = r.keys()[0];
	if (!(!i || i === "series")) {
		var a = Ql(t, i, r.get(i), {
			useDefault: !1,
			enableAll: !1,
			enableNone: !1
		}).models[0];
		if (a) {
			var o = n.getViewOfComponentModel(a), s;
			if (o.group.traverse(function(t) {
				var n = bu(t).tooltipConfig;
				if (n && n.name === e.name) return s = t, !0;
			}), s) return {
				componentMainType: i,
				componentIndex: a.componentIndex,
				el: s
			};
		}
	}
}
//#endregion
//#region node_modules/echarts/lib/component/tooltip/install.js
function IN(e) {
	rj(rN), e.registerComponentModel(aN), e.registerComponentView(ON), e.registerAction({
		type: "showTip",
		event: "showTip",
		update: "tooltip:manuallyShowTip"
	}, dn), e.registerAction({
		type: "hideTip",
		event: "hideTip",
		update: "tooltip:manuallyHideTip"
	}, dn);
}
//#endregion
//#region node_modules/echarts/lib/component/title/install.js
var LN = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n.layoutMode = {
			type: "box",
			ignoreSize: !0
		}, n;
	}
	return t.type = "title", t.defaultOption = {
		z: 6,
		show: !0,
		text: "",
		target: "blank",
		subtext: "",
		subtarget: "blank",
		left: "center",
		top: Z.size.m,
		backgroundColor: Z.color.transparent,
		borderColor: Z.color.primary,
		borderWidth: 0,
		padding: 5,
		itemGap: 10,
		textStyle: {
			fontSize: 18,
			fontWeight: "bold",
			color: Z.color.primary
		},
		subtextStyle: {
			fontSize: 12,
			color: Z.color.quaternary
		}
	}, t;
}(Ov), RN = function(e) {
	I(t, e);
	function t() {
		var n = e !== null && e.apply(this, arguments) || this;
		return n.type = t.type, n;
	}
	return t.prototype.render = function(e, t, n) {
		if (this.group.removeAll(), e.get("show")) {
			var r = this.group, i = e.getModel("textStyle"), a = e.getModel("subtextStyle"), o = e.get("textAlign"), s = K(e.get("textBaseline"), e.get("textVerticalAlign")), c = new pc({
				style: _m(i, {
					text: e.get("text"),
					fill: i.getTextColor()
				}, { disableBox: !0 }),
				z2: 10
			}), l = c.getBoundingRect(), u = e.get("subtext"), d = new pc({
				style: _m(a, {
					text: u,
					fill: a.getTextColor(),
					y: l.height + e.get("itemGap"),
					verticalAlign: "top"
				}, { disableBox: !0 }),
				z2: 10
			}), f = e.get("link"), p = e.get("sublink"), m = e.get("triggerEvent", !0);
			c.silent = !f && !m, d.silent = !p && !m, f && c.on("click", function() {
				mv(f, "_" + e.get("target"));
			}), p && d.on("click", function() {
				mv(p, "_" + e.get("subtarget"));
			}), bu(c).eventData = bu(d).eventData = m ? {
				componentType: "title",
				componentIndex: e.componentIndex
			} : null, r.add(c), u && r.add(d);
			var h = r.getBoundingRect(), g = e.getBoxLayoutParams();
			g.width = h.width, g.height = h.height;
			var _ = bv(g, Sv(e, n).refContainer, e.get("padding"));
			o || (o = e.get("left") || e.get("right"), o === "middle" && (o = "center"), o === "right" ? _.x += _.width : o === "center" && (_.x += _.width / 2)), s || (s = e.get("top") || e.get("bottom"), s === "center" && (s = "middle"), s === "bottom" ? _.y += _.height : s === "middle" && (_.y += _.height / 2), s ||= "top"), r.x = _.x, r.y = _.y, r.markRedraw();
			var v = {
				align: o,
				verticalAlign: s
			};
			c.setStyle(v), d.setStyle(v), h = r.getBoundingRect();
			var y = _.margin, b = e.getItemStyle(["color", "opacity"]);
			b.fill = e.get("backgroundColor");
			var x = new cc({
				shape: {
					x: h.x - y[3],
					y: h.y - y[0],
					width: h.width + y[1] + y[3],
					height: h.height + y[0] + y[2],
					r: e.get("borderRadius")
				},
				style: b,
				subPixelOptimize: !0,
				silent: !0
			});
			r.add(x);
		}
	}, t.type = "title", t;
}(ID);
function zN(e) {
	e.registerComponentModel(LN), e.registerComponentView(RN);
}
//#endregion
//#region node_modules/echarts/lib/visual/aria.js
var BN = {
	label: { enabled: !0 },
	decal: { show: !1 }
}, VN = ql(), HN = ql(), UN = yu(WN);
function WN(e, t) {
	var n = e.getModel("aria");
	if (!n.get("enabled")) return;
	var r = HN(e).scope || (HN(e).scope = {}), i = L(BN);
	Ot(i.label, e.getLocaleModel().get("aria"), !1), Ot(n.option, i, !1), a(), o();
	function a() {
		if (n.getModel("decal").get("show")) {
			var t = J();
			e.eachSeries(function(e) {
				e.isColorBySeries() || (VN(e).scope = t.get(e.type) || t.set(e.type, {}));
			}), e.eachSeries(function(t) {
				if (U(t.enableAriaDecal)) {
					t.enableAriaDecal();
					return;
				}
				var n = t.getData();
				if (t.isColorBySeries()) {
					var i = Nv(t.ecModel, t.name, r, e.getSeriesCount()), a = n.getVisual("decal");
					n.setVisual("decal", u(a, i));
				} else {
					var o = t.getRawData(), s = {}, c = VN(t).scope;
					n.each(function(e) {
						var t = n.getRawIndex(e);
						s[t] = e;
					});
					var l = o.count();
					o.each(function(e) {
						var r = s[e], i = o.getName(e) || e + "", a = Nv(t.ecModel, i, c, l), d = n.getItemVisual(r, "decal");
						n.setItemVisual(r, "decal", u(d, a));
					});
				}
				function u(e, t) {
					var n = e ? R(R({}, t), e) : t;
					return n.dirty = !0, n;
				}
			});
		}
	}
	function o() {
		var r = t.getZr().dom;
		if (r) {
			var i = e.getLocaleModel().get("aria"), a = n.getModel("label");
			if (a.option = At(a.option, i), a.get("enabled")) {
				if (r.setAttribute("role", "img"), a.get("description")) {
					r.setAttribute("aria-label", a.get("description"));
					return;
				}
				var o = e.getSeriesCount(), u = a.get(["data", "maxCount"]) || 10, d = a.get(["series", "maxCount"]) || 10, f = Math.min(o, d), p;
				if (!(o < 1)) {
					var m = c();
					p = m ? s(a.get(["general", "withTitle"]), { title: m }) : a.get(["general", "withoutTitle"]);
					var h = [], g = o > 1 ? a.get([
						"series",
						"multiple",
						"prefix"
					]) : a.get([
						"series",
						"single",
						"prefix"
					]);
					p += s(g, { seriesCount: o }), e.eachSeries(function(e, t) {
						if (t < f) {
							var n = void 0, r = e.get("name") ? "withName" : "withoutName";
							n = o > 1 ? a.get([
								"series",
								"multiple",
								r
							]) : a.get([
								"series",
								"single",
								r
							]), n = s(n, {
								seriesId: e.seriesIndex,
								seriesName: e.get("name"),
								seriesType: l(e.subType)
							});
							var i = e.getData();
							if (i.count() > u) {
								var c = a.get(["data", "partialData"]);
								n += s(c, { displayCnt: u });
							} else n += a.get(["data", "allData"]);
							for (var d = a.get([
								"data",
								"separator",
								"middle"
							]), p = a.get([
								"data",
								"separator",
								"end"
							]), m = a.get(["data", "excludeDimensionId"]), g = [], _ = 0; _ < i.count(); _++) if (_ < u) {
								var v = i.getName(_), y = m ? It(i.getValues(_), function(e, t) {
									return jt(m, t) === -1;
								}) : i.getValues(_), b = a.get(["data", v ? "withName" : "withoutName"]);
								g.push(s(b, {
									name: v,
									value: y.join(d)
								}));
							}
							n += g.join(d) + p, h.push(n);
						}
					});
					var _ = a.getModel([
						"series",
						"multiple",
						"separator"
					]), v = _.get("middle"), y = _.get("end");
					p += h.join(v) + y, r.setAttribute("aria-label", p);
				}
			}
		}
	}
	function s(e, t) {
		if (!W(e)) return e;
		var n = e;
		return z(t, function(e, t) {
			n = n.replace(RegExp("\\{\\s*" + t + "\\s*\\}", "g"), e);
		}), n;
	}
	function c() {
		var t = e.get("title");
		return t && t.length && (t = t[0]), t && t.text;
	}
	function l(t) {
		var n = e.getLocaleModel().get(["series", "typeNames"]);
		return n[t] || n.chart;
	}
}
//#endregion
//#region node_modules/echarts/lib/component/aria/preprocessor.js
function GN(e) {
	if (!(!e || !e.aria)) {
		var t = e.aria;
		t.show != null && (t.enabled = t.show), t.label = t.label || {}, z([
			"description",
			"general",
			"series",
			"data"
		], function(e) {
			t[e] != null && (t.label[e] = t[e]);
		});
	}
}
//#endregion
//#region node_modules/echarts/lib/component/aria/install.js
function KN(e) {
	e.registerPreprocessor(GN), e.registerVisual(e.PRIORITY.VISUAL.ARIA, UN);
}
//#endregion
//#region node_modules/zrender/lib/svg/SVGPathRebuilder.js
var qN = Math.sin, JN = Math.cos, YN = Math.PI, XN = Math.PI * 2, ZN = 180 / YN, QN = function() {
	function e() {}
	return e.prototype.reset = function(e) {
		this._start = !0, this._d = [], this._str = "", this._p = 10 ** (e || 4);
	}, e.prototype.moveTo = function(e, t) {
		this._add("M", e, t);
	}, e.prototype.lineTo = function(e, t) {
		this._add("L", e, t);
	}, e.prototype.bezierCurveTo = function(e, t, n, r, i, a) {
		this._add("C", e, t, n, r, i, a);
	}, e.prototype.quadraticCurveTo = function(e, t, n, r) {
		this._add("Q", e, t, n, r);
	}, e.prototype.arc = function(e, t, n, r, i, a) {
		this.ellipse(e, t, n, n, 0, r, i, a);
	}, e.prototype.ellipse = function(e, t, n, r, i, a, o, s) {
		var c = o - a, l = !s, u = Math.abs(c), d = wa(u - XN) || (l ? c >= XN : -c >= XN), f = c > 0 ? c % XN : c % XN + XN, p = !1;
		p = d ? !0 : !wa(u) && f >= YN == !!l;
		var m = e + n * JN(a), h = t + r * qN(a);
		this._start && this._add("M", m, h);
		var g = Math.round(i * ZN);
		if (d) {
			var _ = 1 / this._p, v = (l ? 1 : -1) * (XN - _);
			this._add("A", n, r, g, 1, +l, e + n * JN(a + v), t + r * qN(a + v)), _ > .01 && this._add("A", n, r, g, 0, +l, m, h);
		} else {
			var y = e + n * JN(o), b = t + r * qN(o);
			this._add("A", n, r, g, +p, +l, y, b);
		}
	}, e.prototype.rect = function(e, t, n, r) {
		this._add("M", e, t), this._add("l", n, 0), this._add("l", 0, r), this._add("l", -n, 0), this._add("Z");
	}, e.prototype.closePath = function() {
		this._d.length > 0 && this._add("Z");
	}, e.prototype._add = function(e, t, n, r, i, a, o, s, c) {
		for (var l = [], u = this._p, d = 1; d < arguments.length; d++) {
			var f = arguments[d];
			if (isNaN(f)) {
				this._invalid = !0;
				return;
			}
			l.push(Math.round(f * u) / u);
		}
		this._d.push(e + l.join(" ")), this._start = e === "Z";
	}, e.prototype.generateStr = function() {
		this._str = this._invalid ? "" : this._d.join(""), this._d = [];
	}, e.prototype.getStr = function() {
		return this._str;
	}, e;
}(), $N = "none", eP = Math.round;
function tP(e) {
	var t = e.fill;
	return t != null && t !== $N;
}
function nP(e) {
	var t = e.stroke;
	return t != null && t !== $N;
}
var rP = [
	"lineCap",
	"miterLimit",
	"lineJoin"
], iP = B(rP, function(e) {
	return "stroke-" + e.toLowerCase();
});
function aP(e, t, n, r) {
	var i = t.opacity == null ? 1 : t.opacity;
	if (n instanceof ec) {
		e("opacity", i);
		return;
	}
	if (tP(t)) {
		var a = Sa(t.fill);
		e("fill", a.color);
		var o = t.fillOpacity == null ? a.opacity * i : t.fillOpacity * a.opacity * i;
		(r || o < 1) && e("fill-opacity", o);
	} else e("fill", $N);
	if (nP(t)) {
		var s = Sa(t.stroke);
		e("stroke", s.color);
		var c = t.strokeNoScale ? n.getLineScale() : 1, l = c ? (t.lineWidth || 0) / c : 0, u = t.strokeOpacity == null ? s.opacity * i : t.strokeOpacity * s.opacity * i, d = t.strokeFirst;
		if ((r || l !== 1) && e("stroke-width", l), (r || d) && e("paint-order", d ? "stroke" : "fill"), (r || u < 1) && e("stroke-opacity", u), t.lineDash) {
			var f = RO(n), p = f[0], m = f[1];
			p && (m = eP(m || 0), e("stroke-dasharray", p.join(",")), (m || r) && e("stroke-dashoffset", m));
		} else r && e("stroke-dasharray", $N);
		for (var h = 0; h < rP.length; h++) {
			var g = rP[h];
			if (r || t[g] !== Gs[g]) {
				var _ = t[g] || Gs[g];
				_ && e(iP[h], _);
			}
		}
	} else r && e("stroke", $N);
}
//#endregion
//#region node_modules/zrender/lib/svg/core.js
var oP = "http://www.w3.org/2000/svg", sP = "http://www.w3.org/1999/xlink", cP = "http://www.w3.org/2000/xmlns/", lP = "http://www.w3.org/XML/1998/namespace", uP = "ecmeta_";
function dP(e) {
	return document.createElementNS(oP, e);
}
function fP(e, t, n, r, i) {
	return {
		tag: e,
		attrs: n || {},
		children: r,
		text: i,
		key: t
	};
}
function pP(e, t) {
	var n = [];
	if (t) for (var r in t) {
		var i = t[r], a = r;
		i !== !1 && (i !== !0 && i != null && (a += "=\"" + i + "\""), n.push(a));
	}
	return "<" + e + " " + n.join(" ") + ">";
}
function mP(e) {
	return "</" + e + ">";
}
function hP(e, t) {
	t ||= {};
	var n = t.newline ? "\n" : "";
	function r(e) {
		var t = e.children, i = e.tag, a = e.attrs, o = e.text;
		return pP(i, a) + (i === "style" ? o || "" : a_(o)) + (t ? "" + n + B(t, function(e) {
			return r(e);
		}).join(n) + n : "") + mP(i);
	}
	return r(e);
}
function gP(e, t, n) {
	n ||= {};
	var r = n.newline ? "\n" : "", i = " {" + r, a = r + "}", o = B(V(e), function(t) {
		return t + i + B(V(e[t]), function(n) {
			return n + ":" + e[t][n] + ";";
		}).join(r) + a;
	}).join(r), s = B(V(t), function(e) {
		return "@keyframes " + e + i + B(V(t[e]), function(n) {
			return n + i + B(V(t[e][n]), function(r) {
				var i = t[e][n][r];
				return r === "d" && (i = "path(\"" + i + "\")"), r + ":" + i + ";";
			}).join(r) + a;
		}).join(r) + a;
	}).join(r);
	return !o && !s ? "" : [
		"<![CDATA[",
		o,
		s,
		"]]>"
	].join(r);
}
function _P(e) {
	return {
		zrId: e,
		shadowCache: {},
		patternCache: {},
		gradientCache: {},
		clipPathCache: {},
		defs: {},
		cssNodes: {},
		cssAnims: {},
		cssStyleCache: {},
		cssAnimIdx: 0,
		shadowIdx: 0,
		gradientIdx: 0,
		patternIdx: 0,
		clipPathIdx: 0
	};
}
function vP(e, t, n, r) {
	return fP("svg", "root", {
		width: e,
		height: t,
		xmlns: oP,
		"xmlns:xlink": sP,
		version: "1.1",
		baseProfile: "full",
		viewBox: r ? "0 0 " + e + " " + t : !1
	}, n);
}
//#endregion
//#region node_modules/zrender/lib/svg/cssClassId.js
var yP = 0;
function bP() {
	return yP++;
}
//#endregion
//#region node_modules/zrender/lib/svg/cssAnimation.js
var xP = {
	cubicIn: "0.32,0,0.67,0",
	cubicOut: "0.33,1,0.68,1",
	cubicInOut: "0.65,0,0.35,1",
	quadraticIn: "0.11,0,0.5,0",
	quadraticOut: "0.5,1,0.89,1",
	quadraticInOut: "0.45,0,0.55,1",
	quarticIn: "0.5,0,0.75,0",
	quarticOut: "0.25,1,0.5,1",
	quarticInOut: "0.76,0,0.24,1",
	quinticIn: "0.64,0,0.78,0",
	quinticOut: "0.22,1,0.36,1",
	quinticInOut: "0.83,0,0.17,1",
	sinusoidalIn: "0.12,0,0.39,0",
	sinusoidalOut: "0.61,1,0.88,1",
	sinusoidalInOut: "0.37,0,0.63,1",
	exponentialIn: "0.7,0,0.84,0",
	exponentialOut: "0.16,1,0.3,1",
	exponentialInOut: "0.87,0,0.13,1",
	circularIn: "0.55,0,1,0.45",
	circularOut: "0,0.55,0.45,1",
	circularInOut: "0.85,0,0.15,1"
}, SP = "transform-origin";
function CP(e, t, n) {
	var r = R({}, e.shape);
	R(r, t), e.buildPath(n, r);
	var i = new QN();
	return i.reset(za(e)), n.rebuildPath(i, 1), i.generateStr(), i.getStr();
}
function wP(e, t) {
	var n = t.originX, r = t.originY;
	(n || r) && (e[SP] = n + "px " + r + "px");
}
var TP = {
	fill: "fill",
	opacity: "opacity",
	lineWidth: "stroke-width",
	lineDashOffset: "stroke-dashoffset"
};
function EP(e, t) {
	var n = t.zrId + "-ani-" + t.cssAnimIdx++;
	return t.cssAnims[n] = e, n;
}
function DP(e, t, n) {
	var r = e.shape.paths, i = {}, a, o;
	if (z(r, function(e) {
		var t = _P(n.zrId);
		t.animation = !0, kP(e, {}, t, !0);
		var r = t.cssAnims, s = t.cssNodes, c = V(r), l = c.length;
		if (l) {
			o = c[l - 1];
			var u = r[o];
			for (var d in u) {
				var f = u[d];
				i[d] = i[d] || { d: "" }, i[d].d += f.d || "";
			}
			for (var p in s) {
				var m = s[p].animation;
				m.indexOf(o) >= 0 && (a = m);
			}
		}
	}), a) {
		t.d = !1;
		var s = EP(i, n);
		return a.replace(o, s);
	}
}
function OP(e) {
	return W(e) ? xP[e] ? "cubic-bezier(" + xP[e] + ")" : Qi(e) ? e : "" : "";
}
function kP(e, t, n, r) {
	var i = e.animators, a = i.length, o = [];
	if (e instanceof qf) {
		var s = DP(e, t, n);
		if (s) o.push(s);
		else if (!a) return;
	} else if (!a) return;
	for (var c = {}, l = 0; l < a; l++) {
		var u = i[l], d = [u.getMaxTime() / 1e3 + "s"], f = OP(u.getClip().easing), p = u.getDelay();
		f ? d.push(f) : d.push("linear"), p && d.push(p / 1e3 + "s"), u.getLoop() && d.push("infinite");
		var m = d.join(" ");
		c[m] = c[m] || [m, []], c[m][1].push(u);
	}
	function h(i) {
		var a = i[1], o = a.length, s = {}, c = {}, l = {}, u = "animation-timing-function";
		function d(e, t, n) {
			for (var r = e.getTracks(), i = e.getMaxTime(), a = 0; a < r.length; a++) {
				var o = r[a];
				if (o.needsAnimate()) {
					var s = o.keyframes, c = o.propName;
					if (n && (c = n(c)), c) for (var l = 0; l < s.length; l++) {
						var d = s[l], f = Math.round(d.time / i * 100) + "%", p = OP(d.easing), m = d.rawValue;
						(W(m) || Ht(m)) && (t[f] = t[f] || {}, t[f][c] = d.rawValue, p && (t[f][u] = p));
					}
				}
			}
		}
		for (var f = 0; f < o; f++) {
			var p = a[f], m = p.targetName;
			m ? m === "shape" && d(p, c) : !r && d(p, s);
		}
		for (var h in s) {
			var g = {};
			wi(g, e), R(g, s[h]);
			var _ = Ba(g), v = s[h][u];
			l[h] = _ ? { transform: _ } : {}, wP(l[h], g), v && (l[h][u] = v);
		}
		var y, b = !0;
		for (var h in c) {
			l[h] = l[h] || {};
			var x = !y, v = c[h][u];
			x && (y = new Cs());
			var S = y.len();
			y.reset(), l[h].d = CP(e, c[h], y);
			var C = y.len();
			if (!x && S !== C) {
				b = !1;
				break;
			}
			v && (l[h][u] = v);
		}
		if (!b) for (var h in l) delete l[h].d;
		if (!r) for (var f = 0; f < o; f++) {
			var p = a[f], m = p.targetName;
			m === "style" && d(p, l, function(e) {
				return TP[e];
			});
		}
		for (var w = V(l), T = !0, E, f = 1; f < w.length; f++) {
			var D = w[f - 1], O = w[f];
			if (l[D][SP] !== l[O][SP]) {
				T = !1;
				break;
			}
			E = l[D][SP];
		}
		if (T && E) {
			for (var h in l) l[h][SP] && delete l[h][SP];
			t[SP] = E;
		}
		if (It(w, function(e) {
			return V(l[e]).length > 0;
		}).length) return EP(l, n) + " " + i[0] + " both";
	}
	for (var g in c) {
		var s = h(c[g]);
		s && o.push(s);
	}
	if (o.length) {
		var _ = n.zrId + "-cls-" + bP();
		n.cssNodes["." + _] = { animation: o.join(",") }, t.class = _;
	}
}
//#endregion
//#region node_modules/zrender/lib/svg/cssEmphasis.js
function AP(e, t, n) {
	if (!e.ignore) if (e.isSilent()) {
		var r = { "pointer-events": "none" };
		jP(r, t, n, !0);
	} else {
		var i = e.states.emphasis && e.states.emphasis.style ? e.states.emphasis.style : {}, a = i.fill;
		if (!a) {
			var o = e.style && e.style.fill, s = e.states.select && e.states.select.style && e.states.select.style.fill, c = e.currentStates.indexOf("select") >= 0 && s || o;
			c && (a = ba(c));
		}
		var l = i.lineWidth;
		if (l) {
			var u = !i.strokeNoScale && e.transform ? e.transform[0] : 1;
			l /= u;
		}
		var r = { cursor: "pointer" };
		a && (r.fill = a), i.stroke && (r.stroke = i.stroke), l && (r["stroke-width"] = l), jP(r, t, n, !0);
	}
}
function jP(e, t, n, r) {
	var i = JSON.stringify(e), a = n.cssStyleCache[i];
	a || (a = n.zrId + "-cls-" + bP(), n.cssStyleCache[i] = a, n.cssNodes["." + a + (r ? ":hover" : "")] = e), t.class = t.class ? t.class + " " + a : a;
}
//#endregion
//#region node_modules/zrender/lib/svg/graphic.js
var MP = Math.round;
function NP(e) {
	return e && W(e.src);
}
function PP(e) {
	return e && U(e.toDataURL);
}
function FP(e, t, n, r) {
	aP(function(i, a) {
		var o = i === "fill" || i === "stroke";
		o && La(a) ? XP(t, e, i, r) : o && Pa(a) ? ZP(n, e, i, r) : e[i] = a, o && r.ssr && a === "none" && (e["pointer-events"] = "visible");
	}, t, n, !1), YP(n, e, r);
}
function IP(e, t) {
	var n = NE(t);
	n && (n.each(function(t, n) {
		t != null && (e[("ecmeta_" + n).toLowerCase()] = t + "");
	}), t.isSilent() && (e[uP + "silent"] = "true"));
}
function LP(e) {
	return wa(e[0] - 1) && wa(e[1]) && wa(e[2]) && wa(e[3] - 1);
}
function RP(e) {
	return wa(e[4]) && wa(e[5]);
}
function zP(e, t, n) {
	if (t && !(RP(t) && LP(t))) {
		var r = n ? 10 : 1e4;
		e.transform = LP(t) ? "translate(" + MP(t[4] * r) / r + " " + MP(t[5] * r) / r + ")" : Da(t);
	}
}
function BP(e, t, n) {
	for (var r = e.points, i = [], a = 0; a < r.length; a++) i.push(MP(r[a][0] * n) / n), i.push(MP(r[a][1] * n) / n);
	t.points = i.join(" ");
}
function VP(e) {
	return !e.smooth;
}
function HP(e) {
	var t = B(e, function(e) {
		return typeof e == "string" ? [e, e] : e;
	});
	return function(e, n, r) {
		for (var i = 0; i < t.length; i++) {
			var a = t[i], o = e[a[0]];
			o != null && (n[a[1]] = MP(o * r) / r);
		}
	};
}
var UP = {
	circle: [HP([
		"cx",
		"cy",
		"r"
	])],
	polyline: [BP, VP],
	polygon: [BP, VP]
};
function WP(e) {
	for (var t = e.animators, n = 0; n < t.length; n++) if (t[n].targetName === "shape") return !0;
	return !1;
}
function GP(e, t) {
	var n = e.style, r = e.shape, i = UP[e.type], a = {}, o = t.animation, s = "path", c = e.style.strokePercent, l = t.compress && za(e) || 4;
	if (i && !t.willUpdate && !(i[1] && !i[1](r)) && !(o && WP(e)) && !(c < 1)) {
		s = e.type;
		var u = 10 ** l;
		i[0](r, a, u);
	} else {
		var d = !e.path || e.shapeChanged();
		e.path || e.createPathProxy();
		var f = e.path;
		d && (f.beginPath(), e.buildPath(f, e.shape), e.pathUpdated());
		var p = f.getVersion(), m = e, h = m.__svgPathBuilder;
		(m.__svgPathVersion !== p || !h || c !== m.__svgPathStrokePercent) && (h ||= m.__svgPathBuilder = new QN(), h.reset(l), f.rebuildPath(h, c), h.generateStr(), m.__svgPathVersion = p, m.__svgPathStrokePercent = c), a.d = h.getStr();
	}
	return zP(a, e.transform), FP(a, n, e, t), IP(a, e), t.animation && kP(e, a, t), t.emphasis && AP(e, a, t), fP(s, e.id + "", a);
}
function KP(e, t) {
	var n = e.style, r = n.image;
	if (r && !W(r) && (NP(r) ? r = r.src : PP(r) && (r = r.toDataURL())), r) {
		var i = n.x || 0, a = n.y || 0, o = n.width, s = n.height, c = {
			href: r,
			width: o,
			height: s
		};
		return i && (c.x = i), a && (c.y = a), zP(c, e.transform), FP(c, n, e, t), IP(c, e), t.animation && kP(e, c, t), fP("image", e.id + "", c);
	}
}
function qP(e, t) {
	var n = e.style, r = n.text;
	if (r != null && (r += ""), !(!r || isNaN(n.x) || isNaN(n.y))) {
		var i = n.font || "12px sans-serif", a = n.x || 0, o = ka(n.y || 0, Ur(i), n.textBaseline), s = {
			"dominant-baseline": "central",
			"text-anchor": Oa[n.textAlign] || n.textAlign
		};
		if (yc(n)) {
			var c = "", l = n.fontStyle, u = _c(n.fontSize);
			if (!parseFloat(u)) return;
			var d = n.fontFamily || "sans-serif", f = n.fontWeight;
			c += "font-size:" + u + ";font-family:" + d + ";", l && l !== "normal" && (c += "font-style:" + l + ";"), f && f !== "normal" && (c += "font-weight:" + f + ";"), s.style = c;
		} else s.style = "font: " + i;
		return r.match(/\s/) && (s["xml:space"] = "preserve"), a && (s.x = a), o && (s.y = o), zP(s, e.transform), FP(s, n, e, t), IP(s, e), t.animation && kP(e, s, t), fP("text", e.id + "", s, void 0, r);
	}
}
function JP(e, t) {
	if (e instanceof Js) return GP(e, t);
	if (e instanceof ec) return KP(e, t);
	if (e instanceof Xs) return qP(e, t);
}
function YP(e, t, n) {
	var r = e.style;
	if (Aa(r)) {
		var i = ja(e), a = n.shadowCache, o = a[i];
		if (!o) {
			var s = e.getGlobalScale(), c = s[0], l = s[1];
			if (!c || !l) return;
			var u = r.shadowOffsetX || 0, d = r.shadowOffsetY || 0, f = r.shadowBlur, p = Sa(r.shadowColor), m = p.opacity, h = p.color, g = f / 2 / c, _ = f / 2 / l, v = g + " " + _;
			o = n.zrId + "-s" + n.shadowIdx++, n.defs[o] = fP("filter", o, {
				id: o,
				x: "-100%",
				y: "-100%",
				width: "300%",
				height: "300%"
			}, [fP("feDropShadow", "", {
				dx: u / c,
				dy: d / l,
				stdDeviation: v,
				"flood-color": h,
				"flood-opacity": m
			})]), a[i] = o;
		}
		t.filter = Ra(o);
	}
}
function XP(e, t, n, r) {
	var i = e[n], a, o = { gradientUnits: i.global ? "userSpaceOnUse" : "objectBoundingBox" };
	if (Fa(i)) a = "linearGradient", o.x1 = i.x, o.y1 = i.y, o.x2 = i.x2, o.y2 = i.y2;
	else if (Ia(i)) a = "radialGradient", o.cx = K(i.x, .5), o.cy = K(i.y, .5), o.r = K(i.r, .5);
	else {
		process.env.NODE_ENV !== "production" && Dt("Illegal gradient type.");
		return;
	}
	for (var s = i.colorStops, c = [], l = 0, u = s.length; l < u; ++l) {
		var d = Ea(s[l].offset) * 100 + "%", f = s[l].color, p = Sa(f), m = p.color, h = p.opacity, g = { offset: d };
		g["stop-color"] = m, h < 1 && (g["stop-opacity"] = h), c.push(fP("stop", l + "", g));
	}
	var _ = hP(fP(a, "", o, c)), v = r.gradientCache, y = v[_];
	y || (y = r.zrId + "-g" + r.gradientIdx++, v[_] = y, o.id = y, r.defs[y] = fP(a, y, o, c)), t[n] = Ra(y);
}
function ZP(e, t, n, r) {
	var i = e.style[n], a = e.getBoundingRect(), o = {}, s = i.repeat, c = s === "no-repeat", l = s === "repeat-x", u = s === "repeat-y", d;
	if (Ma(i)) {
		var f = i.imageWidth, p = i.imageHeight, m = void 0, h = i.image;
		if (W(h) ? m = h : NP(h) ? m = h.src : PP(h) && (m = h.toDataURL()), typeof Image > "u") {
			var g = "Image width/height must been given explictly in svg-ssr renderer.";
			q(f, g), q(p, g);
		} else if (f == null || p == null) {
			var _ = function(e, t) {
				if (e) {
					var n = e.elm, r = f || t.width, i = p || t.height;
					e.tag === "pattern" && (l ? (i = 1, r /= a.width) : u && (r = 1, i /= a.height)), e.attrs.width = r, e.attrs.height = i, n && (n.setAttribute("width", r), n.setAttribute("height", i));
				}
			}, v = Ln(m, null, e, function(e) {
				c || _(S, e), _(d, e);
			});
			v && v.width && v.height && (f ||= v.width, p ||= v.height);
		}
		d = fP("image", "img", {
			href: m,
			width: f,
			height: p
		}), o.width = f, o.height = p;
	} else i.svgElement && (d = L(i.svgElement), o.width = i.svgWidth, o.height = i.svgHeight);
	if (d) {
		var y, b;
		c ? y = b = 1 : l ? (b = 1, y = o.width / a.width) : u ? (y = 1, b = o.height / a.height) : o.patternUnits = "userSpaceOnUse", y != null && !isNaN(y) && (o.width = y), b != null && !isNaN(b) && (o.height = b);
		var x = Ba(i);
		x && (o.patternTransform = x);
		var S = fP("pattern", "", o, [d]), C = hP(S), w = r.patternCache, T = w[C];
		T || (T = r.zrId + "-p" + r.patternIdx++, w[C] = T, o.id = T, S = r.defs[T] = fP("pattern", T, o, [d])), t[n] = Ra(T);
	}
}
function QP(e, t, n) {
	var r = n.clipPathCache, i = n.defs, a = r[e.id];
	if (!a) {
		a = n.zrId + "-c" + n.clipPathIdx++;
		var o = { id: a };
		r[e.id] = a, i[a] = fP("clipPath", a, o, [GP(e, n)]);
	}
	t["clip-path"] = Ra(a);
}
//#endregion
//#region node_modules/zrender/lib/svg/domapi.js
function $P(e) {
	return document.createTextNode(e);
}
function eF(e, t, n) {
	e.insertBefore(t, n);
}
function tF(e, t) {
	e.removeChild(t);
}
function nF(e, t) {
	e.appendChild(t);
}
function rF(e) {
	return e.parentNode;
}
function iF(e) {
	return e.nextSibling;
}
function aF(e, t) {
	e.textContent = t;
}
//#endregion
//#region node_modules/zrender/lib/svg/patch.js
var oF = 58, sF = 120, cF = fP("", "");
function lF(e) {
	return e === void 0;
}
function uF(e) {
	return e !== void 0;
}
function dF(e, t, n) {
	for (var r = {}, i = t; i <= n; ++i) {
		var a = e[i].key;
		a !== void 0 && (process.env.NODE_ENV !== "production" && r[a] != null && console.error("Duplicate key " + a), r[a] = i);
	}
	return r;
}
function fF(e, t) {
	var n = e.key === t.key;
	return e.tag === t.tag && n;
}
function pF(e) {
	var t, n = e.children, r = e.tag;
	if (uF(r)) {
		var i = e.elm = dP(r);
		if (gF(cF, e), H(n)) for (t = 0; t < n.length; ++t) {
			var a = n[t];
			a != null && nF(i, pF(a));
		}
		else uF(e.text) && !G(e.text) && nF(i, $P(e.text));
	} else e.elm = $P(e.text);
	return e.elm;
}
function mF(e, t, n, r, i) {
	for (; r <= i; ++r) {
		var a = n[r];
		a != null && eF(e, pF(a), t);
	}
}
function hF(e, t, n, r) {
	for (; n <= r; ++n) {
		var i = t[n];
		i != null && (uF(i.tag) ? tF(rF(i.elm), i.elm) : tF(e, i.elm));
	}
}
function gF(e, t) {
	var n, r = t.elm, i = e && e.attrs || {}, a = t.attrs || {};
	if (i !== a) {
		for (n in a) {
			var o = a[n];
			i[n] !== o && (o === !0 ? r.setAttribute(n, "") : o === !1 ? r.removeAttribute(n) : n === "style" ? r.style.cssText = o : n.charCodeAt(0) === sF ? n === "xmlns:xlink" || n === "xmlns" ? r.setAttributeNS(cP, n, o) : n.charCodeAt(3) === oF ? r.setAttributeNS(lP, n, o) : n.charCodeAt(5) === oF ? r.setAttributeNS(sP, n, o) : r.setAttribute(n, o) : r.setAttribute(n, o));
		}
		for (n in i) n in a || r.removeAttribute(n);
	}
}
function _F(e, t, n) {
	for (var r = 0, i = 0, a = t.length - 1, o = t[0], s = t[a], c = n.length - 1, l = n[0], u = n[c], d, f, p, m; r <= a && i <= c;) o == null ? o = t[++r] : s == null ? s = t[--a] : l == null ? l = n[++i] : u == null ? u = n[--c] : fF(o, l) ? (vF(o, l), o = t[++r], l = n[++i]) : fF(s, u) ? (vF(s, u), s = t[--a], u = n[--c]) : fF(o, u) ? (vF(o, u), eF(e, o.elm, iF(s.elm)), o = t[++r], u = n[--c]) : fF(s, l) ? (vF(s, l), eF(e, s.elm, o.elm), s = t[--a], l = n[++i]) : (lF(d) && (d = dF(t, r, a)), f = d[l.key], lF(f) ? eF(e, pF(l), o.elm) : (p = t[f], p.tag === l.tag ? (vF(p, l), t[f] = void 0, eF(e, p.elm, o.elm)) : eF(e, pF(l), o.elm)), l = n[++i]);
	(r <= a || i <= c) && (r > a ? (m = n[c + 1] == null ? null : n[c + 1].elm, mF(e, m, n, i, c)) : hF(e, t, r, a));
}
function vF(e, t) {
	var n = t.elm = e.elm, r = e.children, i = t.children;
	e !== t && (gF(e, t), lF(t.text) ? uF(r) && uF(i) ? r !== i && _F(n, r, i) : uF(i) ? (uF(e.text) && aF(n, ""), mF(n, null, i, 0, i.length - 1)) : uF(r) ? hF(n, r, 0, r.length - 1) : uF(e.text) && aF(n, "") : e.text !== t.text && (uF(r) && hF(n, r, 0, r.length - 1), aF(n, t.text)));
}
function yF(e, t) {
	if (fF(e, t)) vF(e, t);
	else {
		var n = e.elm, r = rF(n);
		pF(t), r !== null && (eF(r, t.elm, iF(n)), hF(r, [e], 0, 0));
	}
	return t;
}
//#endregion
//#region node_modules/zrender/lib/svg/Painter.js
var bF = 0, xF = function() {
	function e(e, t, n) {
		if (this.type = "svg", this.configLayer = SF("configLayer"), this.storage = t, this._opts = n = R({}, n), this.root = e, this._id = "zr" + bF++, this._oldVNode = vP(n.width, n.height), e && !n.ssr) {
			var r = this._viewport = document.createElement("div");
			r.style.cssText = "position:relative;overflow:hidden";
			var i = this._svgDom = this._oldVNode.elm = dP("svg");
			gF(null, this._oldVNode), r.appendChild(i), e.appendChild(r);
		}
		this.resize(n.width, n.height);
	}
	return e.prototype.getType = function() {
		return this.type;
	}, e.prototype.getViewportRoot = function() {
		return this._viewport;
	}, e.prototype.getViewportRootOffset = function() {
		var e = this.getViewportRoot();
		if (e) return {
			offsetLeft: e.offsetLeft || 0,
			offsetTop: e.offsetTop || 0
		};
	}, e.prototype.getSvgDom = function() {
		return this._svgDom;
	}, e.prototype.refresh = function() {
		if (this.root) {
			var e = this.renderToVNode({ willUpdate: !0 });
			e.attrs.style = "position:absolute;left:0;top:0;user-select:none", yF(this._oldVNode, e), this._oldVNode = e;
		}
	}, e.prototype.renderOneToVNode = function(e) {
		return JP(e, _P(this._id));
	}, e.prototype.renderToVNode = function(e) {
		e ||= {};
		var t = this.storage.getDisplayList(!0), n = this._width, r = this._height, i = _P(this._id);
		i.animation = e.animation, i.willUpdate = e.willUpdate, i.compress = e.compress, i.emphasis = e.emphasis, i.ssr = this._opts.ssr;
		var a = [], o = this._bgVNode = CF(n, r, this._backgroundColor, i);
		o && a.push(o);
		var s = e.compress ? null : this._mainVNode = fP("g", "main", {}, []);
		this._paintList(t, i, s ? s.children : a), s && a.push(s);
		var c = B(V(i.defs), function(e) {
			return i.defs[e];
		});
		if (c.length && a.push(fP("defs", "defs", {}, c)), e.animation) {
			var l = gP(i.cssNodes, i.cssAnims, { newline: !0 });
			if (l) {
				var u = fP("style", "stl", {}, [], l);
				a.push(u);
			}
		}
		return vP(n, r, a, e.useViewBox);
	}, e.prototype.renderToString = function(e) {
		return e ||= {}, hP(this.renderToVNode({
			animation: K(e.cssAnimation, !0),
			emphasis: K(e.cssEmphasis, !0),
			willUpdate: !1,
			compress: !0,
			useViewBox: K(e.useViewBox, !0)
		}), { newline: !0 });
	}, e.prototype.setBackgroundColor = function(e) {
		this._backgroundColor = e;
	}, e.prototype.getSvgRoot = function() {
		return this._mainVNode && this._mainVNode.elm;
	}, e.prototype._paintList = function(e, t, n) {
		for (var r = e.length, i = [], a = 0, o, s, c = 0, l = 0; l < r; l++) {
			var u = e[l];
			if (!u.invisible) {
				var d = u.__clipPaths, f = d && d.length || 0, p = s && s.length || 0, m = void 0;
				for (m = Math.max(f - 1, p - 1); m >= 0 && !(d && s && d[m] === s[m]); m--);
				for (var h = p - 1; h > m; h--) a--, o = i[a - 1];
				for (var g = m + 1; g < f; g++) {
					var _ = {};
					QP(d[g], _, t);
					var v = fP("g", "clip-g-" + c++, _, []);
					(o ? o.children : n).push(v), i[a++] = v, o = v;
				}
				s = d;
				var y = JP(u, t);
				y && (o ? o.children : n).push(y);
			}
		}
	}, e.prototype.resize = function(e, t) {
		var n = this._opts, r = this.root, i = this._viewport;
		if (e != null && (n.width = e), t != null && (n.height = t), r && i && (i.style.display = "none", e = IO(r, 0, n), t = IO(r, 1, n), i.style.display = ""), this._width !== e || this._height !== t) {
			if (this._width = e, this._height = t, i) {
				var a = i.style;
				a.width = e + "px", a.height = t + "px";
			}
			if (Pa(this._backgroundColor)) this.refresh();
			else {
				var o = this._svgDom;
				o && (o.setAttribute("width", e), o.setAttribute("height", t));
				var s = this._bgVNode && this._bgVNode.elm;
				s && (s.setAttribute("width", e), s.setAttribute("height", t));
			}
		}
	}, e.prototype.getWidth = function() {
		return this._width;
	}, e.prototype.getHeight = function() {
		return this._height;
	}, e.prototype.dispose = function() {
		this.root && (this.root.innerHTML = ""), this._svgDom = this._viewport = this.storage = this._oldVNode = this._bgVNode = this._mainVNode = null;
	}, e.prototype.clear = function() {
		this._svgDom && (this._svgDom.innerHTML = null), this._oldVNode = null;
	}, e.prototype.toDataURL = function(e) {
		var t = this.renderToString(), n = "data:image/svg+xml;";
		return e ? (t = Va(t), t && n + "base64," + t) : n + "charset=UTF-8," + encodeURIComponent(t);
	}, e;
}();
function SF(e) {
	return function() {
		process.env.NODE_ENV !== "production" && Dt("In SVG mode painter not support method \"" + e + "\"");
	};
}
function CF(e, t, n, r) {
	var i;
	if (n && n !== "none") if (i = fP("rect", "bg", {
		width: e,
		height: t,
		x: "0",
		y: "0"
	}), La(n)) XP({ fill: n }, i.attrs, "fill", r);
	else if (Pa(n)) ZP({
		style: { fill: n },
		dirty: dn,
		getBoundingRect: function() {
			return {
				width: e,
				height: t
			};
		}
	}, i.attrs, "fill", r);
	else {
		var a = Sa(n), o = a.color, s = a.opacity;
		i.attrs.fill = o, s < 1 && (i.attrs["fill-opacity"] = s);
	}
	return i;
}
//#endregion
//#region node_modules/echarts/lib/renderer/installSVGRenderer.js
function wF(e) {
	e.registerPainter("svg", xF);
}
//#endregion
//#region \0@oxc-project+runtime@0.139.0/helpers/esm/decorate.js
function $(e, t, n, r) {
	var i = arguments.length, a = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, n) : r, o;
	if (typeof Reflect == "object" && typeof Reflect.decorate == "function") a = Reflect.decorate(e, t, n, r);
	else for (var s = e.length - 1; s >= 0; s--) (o = e[s]) && (a = (i < 3 ? o(a) : i > 3 ? o(t, n, a) : o(t, n)) || a);
	return i > 3 && a && Object.defineProperty(t, n, a), a;
}
//#endregion
//#region src/components/ilc-site-snapshot-chart.ts
rj([
	KN,
	fT,
	iN,
	wF,
	zN,
	IN
]);
var TF = class extends je {
	static {
		this.styles = c`
    :host {
      display: block;
      min-inline-size: 0;
    }

    #chart {
      block-size: 15rem;
      inline-size: 100%;
    }
  `;
	}
	firstUpdated() {
		this.createChart();
	}
	updated() {
		this.updateChart();
	}
	disconnectedCallback() {
		this.resizeObserver?.disconnect(), this.chart?.dispose(), this.chart = void 0, super.disconnectedCallback();
	}
	render() {
		return N`<div
      id="chart"
      role="img"
      aria-label=${F(this.hass, "site.snapshotDescription")}
    ></div>`;
	}
	createChart() {
		!this.chartElement || this.chart || (this.chart = LA(this.chartElement, void 0, { renderer: "svg" }), typeof ResizeObserver < "u" && (this.resizeObserver = new ResizeObserver(() => this.chart?.resize()), this.resizeObserver.observe(this.chartElement)));
	}
	updateChart() {
		if (this.createChart(), !this.chart || !this.site) return;
		let e = [
			F(this.hass, "site.import"),
			F(this.hass, "site.export"),
			F(this.hass, "site.solar"),
			F(this.hass, "site.controlled")
		], t = [
			this.site.grid_import?.value ?? 0,
			this.site.grid_export?.value ?? 0,
			this.site.solar_production?.value ?? 0,
			this.site.controlled_power?.value ?? 0
		];
		this.chart.setOption({
			animation: !1,
			aria: {
				enabled: !0,
				description: F(this.hass, "site.snapshotDescription")
			},
			grid: {
				top: 28,
				right: 12,
				bottom: 30,
				left: 48
			},
			textStyle: { color: "var(--primary-text-color)" },
			tooltip: { trigger: "axis" },
			xAxis: {
				type: "category",
				data: e,
				axisLabel: { color: "var(--secondary-text-color)" },
				axisLine: { lineStyle: { color: "var(--divider-color)" } }
			},
			yAxis: {
				type: "value",
				axisLabel: { color: "var(--secondary-text-color)" },
				splitLine: { lineStyle: { color: "var(--divider-color)" } }
			},
			series: [{
				name: F(this.hass, "site.snapshot"),
				type: "bar",
				data: t,
				itemStyle: { color: "var(--primary-color)" }
			}]
		});
	}
};
$([Ie({ attribute: !1 })], TF.prototype, "hass", void 0), $([Ie({ attribute: !1 })], TF.prototype, "site", void 0), $([ze("#chart")], TF.prototype, "chartElement", void 0), TF = $([Ne("ilc-site-snapshot-chart")], TF);
//#endregion
//#region src/components/intelligent-load-controller-panel.ts
var EF = class extends je {
	constructor(...e) {
		super(...e), this.viewState = "loading", this.refreshing = !1, this.availableSites = [], this.workspaceView = "dashboard", this.configurationIssues = [], this.overrideDurationMinutes = 30, this.requestSequence = 0, this.hasLoaded = !1, this.wasConnected = !1, this.subscriptionGeneration = 0, this.subscriptionRefreshPending = !1, this.onNetworkChange = () => {
			this.isWebsocketConnected() ? this.refresh() : (this.unsubscribeUpdates(), this.viewState = "reconnecting");
		}, this.startAddingLoad = () => {
			this.editingLoadId = void 0, this.loadDraft = {
				display_name: F(this.hass, "load.defaultName"),
				load_type: "generic_binary",
				expected_power_w: 0,
				optimisation_mode: "cost_optimised_hybrid",
				automatic_control: !0,
				priority: 50,
				phase_assignment: "unknown",
				phase_count: 1
			}, this.configurationIssues = [], this.configurationPreview = void 0;
		}, this.cancelLoadEditor = () => {
			this.loadDraft = void 0, this.editingLoadId = void 0, this.configurationIssues = [], this.configurationPreview = void 0;
		}, this.cancelDeleteLoad = () => {
			this.closeDeleteConfirmation();
		}, this.updateSiteDraft = (e) => {
			this.siteDraft && (this.siteDraft = this.updatedDraft(this.siteDraft, e), this.configurationIssues = [], this.configurationPreview = void 0);
		}, this.updateLoadDraft = (e) => {
			this.loadDraft && (this.loadDraft = this.updatedDraft(this.loadDraft, e), this.configurationIssues = [], this.configurationPreview = void 0);
		}, this.updateOverrideDuration = (e) => {
			let t = e.currentTarget, n = Number(t.value);
			this.overrideDurationMinutes = Number.isFinite(n) ? n : 0;
		}, this.handleDeleteDialogKeydown = (e) => {
			if (e.key === "Escape") {
				e.preventDefault(), this.closeDeleteConfirmation();
				return;
			}
			if (e.key !== "Tab") return;
			let t = Array.from(this.renderRoot.querySelectorAll(".dialog-card button:not([disabled])")), n = t[0], r = t.at(-1);
			if (!n || !r) return;
			let i = this.shadowRoot?.activeElement ?? document.activeElement;
			e.shiftKey && i === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && i === r && (e.preventDefault(), n.focus());
		};
	}
	static {
		this.styles = c`
    :host {
      box-sizing: border-box;
      color: var(--primary-text-color);
      display: block;
      min-block-size: 100%;
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    main {
      margin: 0 auto;
      max-inline-size: 100rem;
      padding: clamp(1rem, 3vw, 2rem);
    }

    .page-header,
    .section-header,
    .load-header,
    .status-banner,
    .metric {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      justify-content: space-between;
    }

    .page-header {
      align-items: flex-start;
      margin-block-end: 1.5rem;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      line-height: 1.2;
    }

    h2 {
      font-size: 1.125rem;
    }

    .secondary,
    .metric dt,
    .load-meta dt,
    .reason,
    .updated {
      color: var(--secondary-text-color);
    }

    .refresh-button,
    .retry-button {
      align-items: center;
      background: var(--primary-color);
      border: 0;
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--text-primary-color, var(--primary-text-color));
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      justify-content: center;
      min-block-size: 2.75rem;
      min-inline-size: 2.75rem;
      padding: 0.5rem 1rem;
    }

    .refresh-button[disabled],
    .retry-button[disabled] {
      cursor: not-allowed;
      opacity: 0.6;
    }

    button:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.1875rem;
    }

    .status-banner,
    .panel-card,
    .load-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
    }

    .status-banner {
      border-inline-start: 0.25rem solid var(--info-color, var(--primary-color));
      margin-block: 1rem;
      padding: 1rem;
    }

    .status-banner[data-state="error"] {
      border-inline-start-color: var(--error-color, var(--primary-color));
    }

    .status-banner[data-state="reconnecting"] {
      border-inline-start-color: var(--warning-color, var(--primary-color));
    }

    .skeleton-grid,
    .metric-grid,
    .load-grid {
      display: grid;
      gap: 0.875rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    }

    .skeleton {
      animation: pulse 1.6s ease-in-out infinite;
      background: var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      min-block-size: 7rem;
    }

    @keyframes pulse {
      50% {
        opacity: 0.45;
      }
    }

    .panel-card {
      margin-block: 1rem;
      padding: 1rem;
    }

    .metric {
      align-items: flex-start;
      flex-direction: column;
      min-block-size: 6.5rem;
      padding: 1rem;
    }

    .metric dd,
    .load-meta dd {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .metric dl,
    .load-meta {
      margin: 0;
    }

    .section-header {
      margin-block-end: 1rem;
    }

    .load-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    }

    .load-card {
      min-inline-size: 0;
      padding: 1rem;
    }

    .load-header {
      align-items: flex-start;
      margin-block-end: 0.75rem;
    }

    .load-header h3 {
      font-size: 1.125rem;
      overflow-wrap: anywhere;
    }

    .state-pill {
      background: var(--secondary-background-color);
      border-radius: 999px;
      color: var(--secondary-text-color);
      display: inline-flex;
      font-size: 0.8125rem;
      padding: 0.25rem 0.5rem;
      text-align: end;
    }

    .load-meta {
      display: grid;
      gap: 0.625rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-block-start: 1rem;
    }

    .load-meta > div {
      min-inline-size: 0;
    }

    .fault {
      color: var(--error-color, var(--primary-text-color));
      font-weight: 600;
    }

    .empty-state {
      display: grid;
      gap: 0.75rem;
      justify-items: start;
      min-block-size: 14rem;
      place-content: center start;
    }

    .site-selector {
      display: grid;
      gap: 1rem;
      max-inline-size: 34rem;
    }

    .site-selector label {
      display: grid;
      font-weight: 600;
      gap: 0.5rem;
    }

    .site-selector select {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--primary-text-color);
      font: inherit;
      min-block-size: 2.75rem;
      padding-inline: 0.75rem;
    }

    .site-selector select:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.1875rem;
    }

    .updated {
      font-size: 0.875rem;
      margin-block-start: 1rem;
    }

    .workspace-nav {
      display: flex;
      gap: 0.5rem;
      margin-block: 0 1rem;
      overflow-x: auto;
      padding-block-end: 0.25rem;
    }

    .nav-button,
    .secondary-button,
    .danger-button,
    .primary-button,
    .text-button {
      align-items: center;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--primary-text-color);
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      justify-content: center;
      min-block-size: 2.75rem;
      padding: 0.5rem 0.875rem;
      text-align: center;
    }

    .nav-button {
      flex: 0 0 auto;
    }

    .nav-button[aria-current="page"],
    .primary-button {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, var(--primary-text-color));
    }

    .danger-button {
      border-color: var(--error-color, var(--primary-color));
      color: var(--error-color, var(--primary-text-color));
    }

    .text-button {
      background: transparent;
      border-color: transparent;
      color: var(--primary-color);
      padding-inline: 0.25rem;
    }

    .nav-button[disabled],
    .secondary-button[disabled],
    .danger-button[disabled],
    .primary-button[disabled],
    .text-button[disabled] {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .card-actions,
    .form-actions,
    .inline-actions,
    .override-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.625rem;
    }

    .card-actions {
      margin-block-start: 1rem;
    }

    .form-grid {
      display: grid;
      gap: 0.875rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    }

    .form-field {
      display: grid;
      font-weight: 600;
      gap: 0.375rem;
      min-inline-size: 0;
    }

    .form-field input,
    .form-field select {
      background: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.5rem);
      color: var(--primary-text-color);
      font: inherit;
      inline-size: 100%;
      min-block-size: 2.75rem;
      padding-inline: 0.75rem;
    }

    .form-field input[type="checkbox"] {
      accent-color: var(--primary-color);
      block-size: 1.25rem;
      inline-size: 1.25rem;
      min-block-size: auto;
      padding: 0;
    }

    .checkbox-field {
      align-items: center;
      display: flex;
      gap: 0.625rem;
      min-block-size: 2.75rem;
    }

    .form-field input:focus-visible,
    .form-field select:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.125rem;
    }

    .section-copy {
      margin-block-end: 1rem;
    }

    .action-status {
      margin-block: 0 1rem;
    }

    .issue-list {
      margin: 0.75rem 0 0;
      padding-inline-start: 1.25rem;
    }

    .issue-path {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
    }

    .table-wrap {
      max-inline-size: 100%;
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      inline-size: 100%;
      min-inline-size: 34rem;
    }

    th,
    td {
      border-block-end: 1px solid var(--divider-color);
      padding: 0.625rem;
      text-align: start;
      vertical-align: top;
    }

    th {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .plan-summary {
      display: grid;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    details summary {
      cursor: pointer;
      font-weight: 600;
    }

    details pre {
      background: var(--secondary-background-color);
      border-radius: var(--ha-card-border-radius, 0.5rem);
      max-block-size: 20rem;
      overflow: auto;
      padding: 0.75rem;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .dialog-backdrop {
      align-items: center;
      background: color-mix(in srgb, var(--primary-background-color) 45%, transparent);
      display: flex;
      inset: 0;
      justify-content: center;
      padding: 1rem;
      position: fixed;
      z-index: 10;
    }

    .dialog-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      box-shadow: var(--ha-card-box-shadow, 0 0.25rem 1rem rgb(0 0 0 / 0.25));
      max-inline-size: 32rem;
      padding: 1.25rem;
    }

    .dialog-card p {
      margin-block: 0.75rem 1rem;
    }

    @media (max-width: 37.5rem) {
      .page-header {
        flex-direction: column;
      }

      .refresh-button {
        inline-size: 100%;
      }

      .load-meta {
        grid-template-columns: 1fr;
      }

      .form-actions > *,
      .override-actions > * {
        flex: 1 1 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
      }
    }
  `;
	}
	connectedCallback() {
		super.connectedCallback(), window.addEventListener("online", this.onNetworkChange), window.addEventListener("offline", this.onNetworkChange);
	}
	disconnectedCallback() {
		this.unsubscribeUpdates(), window.removeEventListener("online", this.onNetworkChange), window.removeEventListener("offline", this.onNetworkChange), super.disconnectedCallback();
	}
	willUpdate(e) {
		let t = this.isWebsocketConnected(), n = e.has("route");
		if (n && this.syncRoute(), !this.hass) {
			this.unsubscribeUpdates(), this.dashboard = void 0, this.errorMessage = void 0, this.availableSites = [], this.selectedEntryId = void 0, this.resetWorkspaceData(), this.viewState = "loading", this.hasLoaded = !1, this.wasConnected = !1;
			return;
		}
		if (!t) {
			this.unsubscribeUpdates(), this.viewState = "reconnecting", this.wasConnected = !1;
			return;
		}
		(!this.hasLoaded || !this.wasConnected || n) && !this.refreshing && queueMicrotask(() => void this.refresh()), this.wasConnected = !0;
	}
	async refresh() {
		let e = this.hass;
		if (!e) return;
		if (!this.isWebsocketConnected()) {
			this.unsubscribeUpdates(), this.viewState = "reconnecting";
			return;
		}
		let t = ++this.requestSequence;
		this.refreshing = !0, this.errorMessage = void 0, this.dashboard || (this.viewState = "loading");
		try {
			let n = new Ue(e), r = this.selectedEntryId;
			if (!r) {
				let e = await n.getSites();
				if (t !== this.requestSequence) return;
				if (this.availableSites = e.filter(DF), this.availableSites.length === 0) {
					this.unsubscribeUpdates(), this.dashboard = void 0, this.viewState = "no_sites", this.hasLoaded = !0;
					return;
				}
				if (this.availableSites.length > 1) {
					this.selectedEntryId = this.availableSites[0]?.entry_id, this.dashboard = void 0, this.viewState = "select_site", this.hasLoaded = !0;
					return;
				}
				r = this.availableSites[0]?.entry_id, this.selectedEntryId = r;
			}
			if (!r) {
				this.unsubscribeUpdates(), this.viewState = "no_sites", this.hasLoaded = !0;
				return;
			}
			let i = await n.getDashboard(r);
			if (t !== this.requestSequence) return;
			this.dashboard = i, this.viewState = i.loads.length === 0 ? "empty" : "ready", this.hasLoaded = !0, this.ensureUpdateSubscription(r), this.workspaceView !== "dashboard" && this.ensureWorkspaceData(this.workspaceView);
		} catch (e) {
			if (t !== this.requestSequence) return;
			this.errorMessage = e instanceof Error ? e.message : void 0, this.viewState = "error", this.hasLoaded = !0;
		} finally {
			t === this.requestSequence && (this.refreshing = !1, this.subscriptionRefreshPending && this.flushSubscriptionRefresh());
		}
	}
	render() {
		return N`
      <main aria-busy=${String(this.refreshing || this.viewState === "loading")}>
        ${this.renderHeader()} ${this.renderBody()}
      </main>
    `;
	}
	renderHeader() {
		return N`
      <header class="page-header">
        <div>
          <h1>${this.pageTitle()}</h1>
          <p class="secondary">${this.dashboard?.site.name ?? F(this.hass, "app.title")}</p>
        </div>
        <button
          class="refresh-button"
          type="button"
          ?disabled=${this.refreshing || !this.isWebsocketConnected()}
          @click=${() => void this.refresh()}
        >
          ${F(this.hass, "status.refresh")}
        </button>
      </header>
    `;
	}
	renderBody() {
		switch (this.viewState) {
			case "loading": return this.renderLoading();
			case "reconnecting": return this.renderReconnecting();
			case "error": return this.renderError();
			case "no_sites": return this.renderNoSites();
			case "select_site": return this.renderSiteSelector();
			case "empty":
			case "ready": return this.dashboard ? this.renderWorkspace(this.dashboard) : this.renderLoading();
		}
	}
	renderWorkspace(e) {
		return N`
      <nav class="workspace-nav" aria-label=${F(this.hass, "nav.label")}>
        ${this.renderNavigationButton("dashboard", "nav.dashboard")}
        ${this.renderNavigationButton("plan", "nav.plan")}
        ${this.renderNavigationButton("history", "nav.history")}
        ${this.renderNavigationButton("configure", "nav.configure")}
      </nav>
      ${this.renderActionStatus()}
      ${this.sectionLoading === this.workspaceView ? this.renderSectionLoading() : P}
      ${this.workspaceView === "dashboard" ? this.renderDashboard(e) : this.workspaceView === "plan" ? this.renderPlan() : this.workspaceView === "history" ? this.renderHistory() : this.workspaceView === "configure" ? this.renderConfiguration() : this.renderLoadControls(e)}
      ${this.renderDeleteConfirmation()}
    `;
	}
	renderNavigationButton(e, t) {
		return N`
      <button
        class="nav-button"
        type="button"
        aria-current=${this.workspaceView === e ? "page" : P}
        @click=${() => void this.selectWorkspaceView(e)}
      >
        ${F(this.hass, t)}
      </button>
    `;
	}
	renderActionStatus() {
		return !this.actionMessage && !this.actionError ? P : N`
      <section
        class="status-banner action-status"
        data-state=${this.actionError ? "error" : "success"}
        aria-live="polite"
      >
        <p>${this.actionError ?? this.actionMessage}</p>
        ${this.actionError && this.isConflictError() ? N`
              <button class="secondary-button" type="button" @click=${() => void this.reloadConfiguration()}>
                ${F(this.hass, "status.reloadLatest")}
              </button>
            ` : P}
      </section>
    `;
	}
	renderSectionLoading() {
		return N`
      <section class="status-banner" aria-live="polite">
        <p>${F(this.hass, "status.loadingSection")}</p>
      </section>
    `;
	}
	renderLoading() {
		return N`
      <section aria-live="polite" aria-label=${F(this.hass, "status.loading")}>
        <p class="secondary">${F(this.hass, "status.loading")}</p>
        <div class="skeleton-grid" aria-hidden="true">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </section>
    `;
	}
	renderReconnecting() {
		return N`
      <section class="status-banner" data-state="reconnecting" aria-live="assertive">
        <div>
          <h2>${F(this.hass, "status.reconnecting")}</h2>
          <p class="secondary">${F(this.hass, "status.connectionHint")}</p>
        </div>
      </section>
    `;
	}
	renderError() {
		return N`
      <section class="status-banner" data-state="error" aria-live="assertive">
        <div>
          <h2>${F(this.hass, "status.error")}</h2>
          ${this.errorMessage ? N`<p class="secondary">${this.errorMessage}</p>` : P}
        </div>
        <button class="retry-button" type="button" @click=${() => void this.refresh()}>
          ${F(this.hass, "status.retry")}
        </button>
      </section>
    `;
	}
	renderEmpty() {
		return N`
      <section class="panel-card empty-state" aria-live="polite">
        <h2>${F(this.hass, "status.empty")}</h2>
        <p class="secondary">${F(this.hass, "status.emptyHint")}</p>
      </section>
    `;
	}
	renderNoSites() {
		return N`
      <section class="panel-card empty-state" aria-live="polite">
        <h2>${F(this.hass, "status.noSites")}</h2>
        <p class="secondary">${F(this.hass, "status.noSitesHint")}</p>
      </section>
    `;
	}
	renderSiteSelector() {
		return N`
      <section class="panel-card empty-state" aria-live="polite">
        <div class="site-selector">
          <div>
            <h2>${F(this.hass, "status.selectSite")}</h2>
            <p class="secondary">${F(this.hass, "status.selectSiteHint")}</p>
          </div>
          <label>
            ${F(this.hass, "status.siteLabel")}
            <select .value=${this.selectedEntryId ?? ""} @change=${this.handleSiteChange}>
              ${this.availableSites.map((e) => N`<option value=${e.entry_id}>${e.name ?? e.entry_id}</option>`)}
            </select>
          </label>
          <button class="retry-button" type="button" @click=${() => void this.openSelectedSite()}>
            ${F(this.hass, "status.openSite")}
          </button>
        </div>
      </section>
    `;
	}
	renderDashboard(e) {
		return N`
      ${this.renderMetrics(e.site)}
      <section class="panel-card" aria-labelledby="snapshot-title">
        <div class="section-header">
          <div>
            <h2 id="snapshot-title">${F(this.hass, "site.snapshot")}</h2>
            <p class="secondary">${F(this.hass, "site.snapshotDescription")}</p>
          </div>
        </div>
        <ilc-site-snapshot-chart .hass=${this.hass} .site=${e.site}></ilc-site-snapshot-chart>
      </section>
      <section aria-labelledby="loads-title">
        <div class="section-header">
          <h2 id="loads-title">${F(this.hass, "load.list")}</h2>
          <span class="secondary">${e.loads.length}</span>
        </div>
        ${e.loads.length === 0 ? this.renderEmpty() : N`<div class="load-grid">
              ${e.loads.map((e) => this.renderLoadCard(e))}
            </div>`}
      </section>
      <p class="updated" aria-live="polite">
        ${F(this.hass, "status.updated", { time: it(this.hass, e.site.updated_at) })}
      </p>
    `;
	}
	renderMetrics(e) {
		let t = [
			[F(this.hass, "site.import"), nt(this.hass, e.grid_import)],
			[F(this.hass, "site.export"), nt(this.hass, e.grid_export)],
			[F(this.hass, "site.solar"), nt(this.hass, e.solar_production)],
			[F(this.hass, "site.controlled"), nt(this.hass, e.controlled_power)],
			[F(this.hass, "site.activeLoads"), String(e.active_load_count)],
			[F(this.hass, "site.waitingLoads"), String(e.waiting_load_count)],
			[F(this.hass, "site.price"), rt(this.hass, e.current_import_price)],
			[F(this.hass, "site.costToday"), rt(this.hass, e.controlled_cost_today)],
			[F(this.hass, "site.energyToday"), nt(this.hass, e.controlled_energy_today)],
			[F(this.hass, "site.nextDeadline"), it(this.hass, e.next_deadline)],
			[F(this.hass, "site.health"), this.localizeHealth(e.health)]
		];
		return N`
      <section aria-labelledby="metrics-title">
        <div class="section-header">
          <h2 id="metrics-title">${F(this.hass, "site.metrics")}</h2>
        </div>
        <div class="metric-grid">
          ${t.map(([e, t]) => N`
              <div class="panel-card metric">
                <dl>
                  <dt>${e}</dt>
                  <dd>${t}</dd>
                </dl>
              </div>
            `)}
        </div>
      </section>
    `;
	}
	renderLoadCard(e) {
		let t = this.formatProgress(e.progress);
		return N`
      <article class="load-card" aria-labelledby="load-${e.load_id}">
        <div class="load-header">
          <div>
            <h3 id="load-${e.load_id}">${e.name}</h3>
            <p class="secondary">${e.load_type}</p>
          </div>
          <span class="state-pill">${Qe(this.hass, e.controller_state)}</span>
        </div>
        <p class="reason">${$e(this.hass, e.reason_code)}</p>
        ${e.fault ? N`<p class="fault" role="alert">${F(this.hass, "load.fault")}</p>` : P}
        <dl class="load-meta">
          ${this.renderLoadMetric(F(this.hass, "load.automatic"), e.automatic_control ? F(this.hass, "value.enabled") : F(this.hass, "value.disabled"))}
          ${this.renderLoadMetric(F(this.hass, "load.optimisation"), e.optimisation_mode ?? F(this.hass, "value.unavailable"))}
          ${this.renderLoadMetric(F(this.hass, "load.power"), nt(this.hass, e.current_power))}
          ${this.renderLoadMetric(F(this.hass, "load.progress"), t)}
          ${this.renderLoadMetric(F(this.hass, "load.deadline"), it(this.hass, e.deadline))}
          ${this.renderLoadMetric(F(this.hass, "load.nextAction"), e.next_action ?? F(this.hass, "value.unavailable"))}
          ${this.renderLoadMetric(F(this.hass, "load.manual"), e.manual_override ?? F(this.hass, "value.no"))}
        </dl>
        <div class="card-actions">
          <button class="secondary-button" type="button" @click=${() => void this.openLoad(e.load_id)}>
            ${F(this.hass, "load.open")}
          </button>
          <button class="text-button" type="button" @click=${() => void this.editConfiguredLoad(e.load_id)}>
            ${F(this.hass, "load.edit")}
          </button>
        </div>
      </article>
    `;
	}
	renderPlan() {
		let e = this.currentPlan, t = this.dailyTimeline, n = e?.intervals ?? [], r = t?.intervals ?? [];
		return N`
      <section class="panel-card" aria-labelledby="current-plan-title">
        <div class="section-header">
          <div>
            <h2 id="current-plan-title">${F(this.hass, "plan.current")}</h2>
            ${e?.generated_at ? N`<p class="secondary">
                  ${F(this.hass, "plan.generated", { time: it(this.hass, e.generated_at) })}
                </p>` : P}
          </div>
          <button class="secondary-button" type="button" @click=${() => void this.replan()}>
            ${F(this.hass, "plan.replan")}
          </button>
        </div>
        ${e ? N`
              <div class="plan-summary">
                <p>
                  <strong>${F(this.hass, "plan.nextAction")}:</strong>
                  ${it(this.hass, e.next_action ?? void 0)}
                </p>
                ${e.warnings?.length ? N`<p class="secondary">${e.warnings.join(", ")}</p>` : P}
              </div>
              ${this.renderPlanIntervals(n)} ${this.renderPlanProposals(e)}
            ` : N`<p class="secondary">${F(this.hass, "status.noPlan")}</p>`}
      </section>
      <section class="panel-card" aria-labelledby="timeline-title">
        <div class="section-header">
          <div>
            <h2 id="timeline-title">${F(this.hass, "plan.timeline")}</h2>
            ${t?.generated_at ? N`<p class="secondary">
                  ${F(this.hass, "plan.generated", { time: it(this.hass, t.generated_at) })}
                </p>` : P}
          </div>
        </div>
        ${this.renderPlanIntervals(r)}
      </section>
    `;
	}
	renderPlanIntervals(e) {
		return e.length === 0 ? N`<p class="secondary">${F(this.hass, "plan.noIntervals")}</p>` : N`
      <div class="table-wrap">
        <table aria-label=${F(this.hass, "plan.intervals")}>
          <thead>
            <tr>
              <th>${F(this.hass, "plan.load")}</th>
              <th>${F(this.hass, "plan.start")}</th>
              <th>${F(this.hass, "plan.end")}</th>
              <th>${F(this.hass, "plan.power")}</th>
              <th>${F(this.hass, "plan.reason")}</th>
            </tr>
          </thead>
          <tbody>
            ${e.map((e) => N`
                <tr>
                  <td>${e.load_id ?? "—"}</td>
                  <td>${it(this.hass, e.start_at)}</td>
                  <td>${it(this.hass, e.end_at)}</td>
                  <td>${this.formatWatts(e.power_w)}</td>
                  <td>
                    ${e.reason_code ? $e(this.hass, e.reason_code) : "—"}
                  </td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `;
	}
	renderPlanProposals(e) {
		let t = e.proposals ?? [];
		return t.length === 0 ? P : N`
      <h3>${F(this.hass, "plan.proposals")}</h3>
      <div class="table-wrap">
        <table aria-label=${F(this.hass, "plan.proposals")}>
          <thead>
            <tr>
              <th>${F(this.hass, "plan.load")}</th>
              <th>${F(this.hass, "plan.authorised")}</th>
              <th>${F(this.hass, "plan.reason")}</th>
            </tr>
          </thead>
          <tbody>
            ${t.map((e) => N`
                <tr>
                  <td>${e.load_id ?? "—"}</td>
                  <td>
                    ${e.authorized ? F(this.hass, "value.yes") : F(this.hass, "value.no")}
                  </td>
                  <td>
                    ${e.reason_code ? $e(this.hass, e.reason_code) : e.message ?? "—"}
                  </td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `;
	}
	renderHistory() {
		let e = this.history, t = this.events ?? [];
		return N`
      <section class="panel-card" aria-labelledby="history-title">
        <div class="section-header">
          <div>
            <h2 id="history-title">${F(this.hass, "history.title")}</h2>
            ${e?.data_quality ? N`<p class="secondary">
                  ${F(this.hass, "history.quality", { quality: e.data_quality })}
                </p>` : P}
          </div>
        </div>
        ${this.renderHistoricalSummaries(e?.daily_summaries ?? [])}
      </section>
      <section class="panel-card" aria-labelledby="events-title">
        <div class="section-header">
          <h2 id="events-title">${F(this.hass, "events.title")}</h2>
          <span class="secondary">${t.length}</span>
        </div>
        ${this.renderEvents(t)}
      </section>
    `;
	}
	renderHistoricalSummaries(e) {
		return e.length === 0 ? N`<p class="secondary">${F(this.hass, "status.noHistory")}</p>` : N`
      <div class="table-wrap">
        <table aria-label=${F(this.hass, "history.title")}>
          <thead>
            <tr>
              <th>${F(this.hass, "events.time")}</th>
              <th>${F(this.hass, "events.message")}</th>
            </tr>
          </thead>
          <tbody>
            ${e.map((e) => N`
                <tr>
                  <td>${kF(e.date) ?? kF(e.day) ?? "—"}</td>
                  <td>${JSON.stringify(e)}</td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `;
	}
	renderEvents(e) {
		return e.length === 0 ? N`<p class="secondary">${F(this.hass, "status.noEvents")}</p>` : N`
      <div class="table-wrap">
        <table aria-label=${F(this.hass, "events.title")}>
          <thead>
            <tr>
              <th>${F(this.hass, "events.time")}</th>
              <th>${F(this.hass, "events.load")}</th>
              <th>${F(this.hass, "events.state")}</th>
              <th>${F(this.hass, "events.reason")}</th>
              <th>${F(this.hass, "events.message")}</th>
            </tr>
          </thead>
          <tbody>
            ${e.map((e) => N`
                <tr>
                  <td>${it(this.hass, e.timestamp)}</td>
                  <td>${e.load_id ?? "—"}</td>
                  <td>${e.state ? Qe(this.hass, e.state) : "—"}</td>
                  <td>
                    ${e.reason_code ? $e(this.hass, e.reason_code) : "—"}
                  </td>
                  <td>${e.message ?? "—"}</td>
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `;
	}
	renderConfiguration() {
		let e = this.configuration;
		if (!e) return N`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${F(this.hass, "app.configure")}</h2>
          <button class="secondary-button" type="button" @click=${() => void this.reloadConfiguration()}>
            ${F(this.hass, "status.retry")}
          </button>
        </section>
      `;
		let t = this.siteDraft ?? OF(e.site);
		return N`
      <section class="panel-card" aria-labelledby="site-configuration-title">
        <div class="section-header">
          <div>
            <h2 id="site-configuration-title">${F(this.hass, "site.configuration")}</h2>
            <p class="secondary">${F(this.hass, "status.previewOnly")}</p>
          </div>
        </div>
        <form @submit=${(e) => void this.saveSite(e)}>
          <div class="form-grid">
            ${this.renderTextField("site_name", F(this.hass, "site.name"), t, this.updateSiteDraft)}
            ${this.renderSelectField("grid_sign_convention", F(this.hass, "site.signConvention"), t, ["import_positive", "export_positive"], this.updateSiteDraft)}
            ${this.renderNumberField("planning_horizon_hours", F(this.hass, "site.planningHorizon"), t, this.updateSiteDraft, !1)}
            ${this.renderNumberField("planning_resolution_seconds", F(this.hass, "site.planningResolution"), t, this.updateSiteDraft, !1)}
            ${this.renderNumberField("soft_import_limit_w", F(this.hass, "site.softImportLimit"), t, this.updateSiteDraft, !0)}
            ${this.renderNumberField("hard_import_limit_w", F(this.hass, "site.hardImportLimit"), t, this.updateSiteDraft, !0)}
            ${this.renderNumberField("max_controlled_power_w", F(this.hass, "site.maxControlledPower"), t, this.updateSiteDraft, !0)}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${F(this.hass, "site.save")}</button>
            <button class="secondary-button" type="button" @click=${() => void this.validateDraft("site")}>
              ${F(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => void this.previewDraft("site")}>
              ${F(this.hass, "config.preview")}
            </button>
          </div>
        </form>
        ${this.renderConfigurationFeedback()}
        <details>
          <summary>${F(this.hass, "config.advanced")}</summary>
          <pre>${JSON.stringify(e.site, null, 2)}</pre>
        </details>
      </section>
      <section class="panel-card" aria-labelledby="load-configuration-title">
        <div class="section-header">
          <h2 id="load-configuration-title">${F(this.hass, "load.configuration")}</h2>
          <button class="secondary-button" type="button" @click=${this.startAddingLoad}>
            ${F(this.hass, "load.add")}
          </button>
        </div>
        ${this.renderConfiguredLoads(e.loads)}
        ${this.loadDraft ? this.renderLoadEditor() : P}
      </section>
    `;
	}
	renderConfiguredLoads(e) {
		return e.length === 0 ? N`<p class="secondary">${F(this.hass, "status.empty")}</p>` : N`
      <div class="load-grid">
        ${e.map((e) => {
			let t = kF(e.load_id), n = kF(e.display_name) ?? t ?? "—";
			return N`
            <article class="load-card">
              <h3>${n}</h3>
              <p class="secondary">${kF(e.load_type) ?? "—"}</p>
              <div class="card-actions">
                <button
                  class="secondary-button"
                  type="button"
                  ?disabled=${!t}
                  @click=${() => this.startEditingLoad(e)}
                >
                  ${F(this.hass, "load.edit")}
                </button>
                <button
                  class="text-button"
                  type="button"
                  ?disabled=${!t}
                  @click=${() => void this.duplicateConfiguredLoad(e)}
                >
                  ${F(this.hass, "load.duplicate")}
                </button>
                <button
                  class="danger-button"
                  type="button"
                  ?disabled=${!t}
                  @click=${(t) => this.requestDeleteLoad(e, n, t.currentTarget)}
                >
                  ${F(this.hass, "load.delete")}
                </button>
              </div>
            </article>
          `;
		})}
      </div>
    `;
	}
	renderLoadEditor() {
		let e = this.loadDraft;
		return e ? N`
      <section class="panel-card" aria-labelledby="load-editor-title">
        <div class="section-header">
          <h3 id="load-editor-title">${this.editingLoadId === void 0 ? F(this.hass, "load.add") : F(this.hass, "load.edit")}</h3>
          <button class="text-button" type="button" @click=${this.cancelLoadEditor}>
            ${F(this.hass, "load.cancelEdit")}
          </button>
        </div>
        <form @submit=${(e) => void this.saveLoad(e)}>
          <div class="form-grid">
            ${this.renderTextField("display_name", F(this.hass, "load.name"), e, this.updateLoadDraft)}
            ${this.renderSelectField("load_type", F(this.hass, "load.type"), e, this.loadTypeOptions(), this.updateLoadDraft)}
            ${this.renderSelectField("optimisation_mode", F(this.hass, "load.optimisation"), e, this.optimisationModeOptions(), this.updateLoadDraft)}
            ${this.renderNumberField("expected_power_w", F(this.hass, "load.expectedPower"), e, this.updateLoadDraft, !1)}
            ${this.renderNumberField("priority", F(this.hass, "load.priority"), e, this.updateLoadDraft, !1)}
            ${this.renderSelectField("phase_assignment", F(this.hass, "load.phase"), e, [
			"unknown",
			"a",
			"b",
			"c",
			"three_phase"
		], this.updateLoadDraft)}
            ${this.renderCheckboxField("automatic_control", F(this.hass, "load.automatic"), e, this.updateLoadDraft)}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${F(this.hass, "load.save")}</button>
            <button class="secondary-button" type="button" @click=${() => void this.validateDraft("load")}>
              ${F(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => void this.previewDraft("load")}>
              ${F(this.hass, "config.preview")}
            </button>
          </div>
        </form>
        ${this.renderConfigurationFeedback()}
      </section>
    ` : P;
	}
	renderTextField(e, t, n, r) {
		return N`
      <label class="form-field">
        <span>${t}</span>
        <input name=${e} .value=${kF(n[e]) ?? ""} @input=${r} />
      </label>
    `;
	}
	renderNumberField(e, t, n, r, i) {
		return N`
      <label class="form-field">
        <span>${t}</span>
        <input
          name=${e}
          type="number"
          inputmode="decimal"
          .value=${jF(n[e])}
          data-nullable=${String(i)}
          @input=${r}
        />
      </label>
    `;
	}
	renderSelectField(e, t, n, r, i) {
		return N`
      <label class="form-field">
        <span>${t}</span>
        <select name=${e} .value=${kF(n[e]) ?? r[0] ?? ""} @change=${i}>
          ${r.map((e) => N`<option value=${e}>${e}</option>`)}
        </select>
      </label>
    `;
	}
	renderCheckboxField(e, t, n, r) {
		return N`
      <label class="checkbox-field">
        <input name=${e} type="checkbox" ?checked=${AF(n[e], !0)} @change=${r} />
        <span>${t}</span>
      </label>
    `;
	}
	renderConfigurationFeedback() {
		let e = this.configurationPreview;
		return this.configurationIssues.length === 0 && !e ? P : N`
      ${this.configurationIssues.length > 0 ? N`
            <section class="status-banner" data-state="error" aria-live="polite">
              <h3>${F(this.hass, "config.issues")}</h3>
              <ul class="issue-list">
                ${this.configurationIssues.map((e) => N`
                    <li>
                      <span>${e.message}</span>
                      <span class="issue-path">${e.path}</span>
                    </li>
                  `)}
              </ul>
            </section>
          ` : P}
      ${e ? N`
            <section class="panel-card" aria-labelledby="preview-result-title">
              <h3 id="preview-result-title">${F(this.hass, "config.previewResult")}</h3>
              <p class="secondary">${F(this.hass, "status.previewOnly")}</p>
              ${e.plan ? this.renderPlanIntervals(e.plan.intervals ?? []) : P}
            </section>
          ` : P}
    `;
	}
	renderLoadControls(e) {
		let t = e.loads.find((e) => e.load_id === this.selectedLoadId);
		return t ? N`
      <section class="panel-card" aria-labelledby="load-controls-title">
        <div class="section-header">
          <div>
            <h2 id="load-controls-title">${t.name}</h2>
            <p class="secondary">${F(this.hass, "load.details")}</p>
          </div>
          <button class="text-button" type="button" @click=${() => void this.selectWorkspaceView("dashboard")}>
            ${F(this.hass, "nav.dashboard")}
          </button>
        </div>
        <p class="reason">${$e(this.hass, t.reason_code)}</p>
        <label class="form-field">
          <span>${F(this.hass, "load.duration")}</span>
          <input
            type="number"
            min="1"
            inputmode="numeric"
            .value=${String(this.overrideDurationMinutes)}
            @input=${this.updateOverrideDuration}
          />
        </label>
        <div class="override-actions">
          <button
            class="secondary-button"
            type="button"
            @click=${() => void this.setAutomaticControl(t, !t.automatic_control)}
          >
            ${F(this.hass, t.automatic_control ? "load.disableAutomatic" : "load.enableAutomatic")}
          </button>
          <button class="primary-button" type="button" @click=${() => void this.applyOverride(t.load_id, "on", !1)}>
            ${F(this.hass, "load.timedOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(t.load_id, "off", !1)}>
            ${F(this.hass, "load.timedOff")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(t.load_id, "on", !0)}>
            ${F(this.hass, "load.indefiniteOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(t.load_id, "off", !0)}>
            ${F(this.hass, "load.indefiniteOff")}
          </button>
          <button class="danger-button" type="button" @click=${() => void this.clearLoadOverride(t.load_id)}>
            ${F(this.hass, "load.clearOverride")}
          </button>
        </div>
        ${this.loadDetail ? N`
              <details>
                <summary>${F(this.hass, "config.advanced")}</summary>
                <pre>${JSON.stringify(this.loadDetail, null, 2)}</pre>
              </details>
            ` : P}
      </section>
    ` : N`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${F(this.hass, "load.details")}</h2>
          <p class="secondary">${F(this.hass, "value.unavailable")}</p>
          <button class="secondary-button" type="button" @click=${() => void this.selectWorkspaceView("dashboard")}>
            ${F(this.hass, "nav.dashboard")}
          </button>
        </section>
      `;
	}
	renderDeleteConfirmation() {
		let e = this.deleteConfirmation;
		return e ? N`
      <div class="dialog-backdrop" @keydown=${this.handleDeleteDialogKeydown}>
        <section
          class="dialog-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-load-title"
          aria-describedby="delete-load-description"
        >
          <h2 id="delete-load-title">${F(this.hass, "dialog.deleteTitle")}</h2>
          <p id="delete-load-description">
            ${F(this.hass, "dialog.deleteBody", { name: e.displayName })}
          </p>
          <div class="form-actions">
            <button class="danger-button" type="button" @click=${() => void this.confirmDeleteLoad()}>
              ${F(this.hass, "dialog.confirmDelete")}
            </button>
            <button class="secondary-button" type="button" @click=${this.cancelDeleteLoad}>
              ${F(this.hass, "dialog.cancel")}
            </button>
          </div>
        </section>
      </div>
    ` : P;
	}
	renderLoadMetric(e, t) {
		return N`<div><dt>${e}</dt><dd>${t}</dd></div>`;
	}
	async selectWorkspaceView(e) {
		this.workspaceView = e, this.actionMessage = void 0, this.actionError = void 0, this.actionErrorCode = void 0, await this.ensureWorkspaceData(e);
	}
	async ensureWorkspaceData(e, t = !1) {
		let n = this.selectedEntryId, r = this.hass;
		if (!(!n || !r || e === "dashboard") && !(!t && this.hasWorkspaceData(e)) && this.sectionLoading !== e) {
			this.sectionLoading = e;
			try {
				let t = new Ue(r);
				if (e === "configure") {
					let e = await t.getConfiguration(n);
					this.configuration = e, this.siteDraft = OF(e.site), this.loadDraft = void 0, this.editingLoadId = void 0, this.configurationIssues = [], this.configurationPreview = void 0;
				} else if (e === "plan") {
					let [e, r] = await Promise.all([t.getCurrentPlan(n), t.getDailyTimeline(n)]);
					this.currentPlan = e, this.dailyTimeline = r;
				} else if (e === "history") {
					let [e, r] = await Promise.all([t.getHistoricalSummary(n), t.getEventJournal(n)]);
					this.history = e, this.events = r.events;
				} else e === "load" && this.selectedLoadId && (this.loadDetail = await t.getLoadDetail(n, this.selectedLoadId));
			} catch (e) {
				this.setActionFailure(e);
			} finally {
				this.sectionLoading === e && (this.sectionLoading = void 0);
			}
		}
	}
	hasWorkspaceData(e) {
		switch (e) {
			case "dashboard": return !0;
			case "configure": return this.configuration !== void 0;
			case "plan": return this.currentPlan !== void 0 || this.dailyTimeline !== void 0;
			case "history": return this.history !== void 0 || this.events !== void 0;
			case "load": return this.loadDetail !== void 0;
		}
	}
	async reloadConfiguration() {
		let e = this.isConflictError();
		this.configuration = void 0, this.siteDraft = void 0, this.loadDraft = void 0, this.editingLoadId = void 0, this.configurationIssues = [], this.configurationPreview = void 0, await this.ensureWorkspaceData("configure", !0), e && this.configuration && (this.actionError = void 0, this.actionErrorCode = void 0, this.actionMessage = void 0);
	}
	async validateDraft(e) {
		let t = this.selectedEntryId, n = e === "site" ? this.siteDraft : this.loadDraft;
		if (!t || !n || !this.hass) return !1;
		try {
			let r = await new Ue(this.hass).validateConfiguration(t, {
				kind: e,
				config: n
			});
			return this.configurationIssues = r.issues ?? [], this.configurationPreview = void 0, this.actionError = void 0, this.actionErrorCode = void 0, this.actionMessage = F(this.hass, r.valid ? "status.valid" : "status.invalid"), r.valid;
		} catch (e) {
			return this.setActionFailure(e), !1;
		}
	}
	async previewDraft(e) {
		let t = this.selectedEntryId, n = e === "site" ? this.siteDraft : this.loadDraft;
		if (!(!t || !n || !this.hass)) try {
			let r = await new Ue(this.hass).previewConfiguration(t, {
				kind: e,
				config: n
			});
			this.configurationIssues = r.issues ?? [], this.configurationPreview = r, this.actionError = void 0, this.actionErrorCode = void 0, this.actionMessage = F(this.hass, r.valid ? "status.previewOnly" : "status.invalid");
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	async saveSite(e) {
		e.preventDefault();
		let t = this.selectedEntryId, n = this.siteDraft, r = this.configuration?.site;
		if (!(!t || !n || !r || !this.hass || !await this.validateDraft("site"))) try {
			await new Ue(this.hass).updateSite(t, n, MF(r)), this.setActionSuccess("status.saved"), await this.refresh(), await this.reloadConfiguration();
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	startEditingLoad(e) {
		let t = kF(e.load_id);
		t && (this.editingLoadId = t, this.loadDraft = OF(e), this.configurationIssues = [], this.configurationPreview = void 0);
	}
	async saveLoad(e) {
		e.preventDefault();
		let t = this.selectedEntryId, n = this.loadDraft, r = this.editingLoadId;
		if (!(!t || !n || !this.hass || !await this.validateDraft("load"))) try {
			let e = new Ue(this.hass);
			if (r) {
				let i = this.configuration?.loads.find((e) => kF(e.load_id) === r);
				if (!i) throw new Ve("The load configuration is no longer available. Refresh before saving.", "config_conflict");
				await e.updateLoad(t, r, n, MF(i)), this.setActionSuccess("load.updated");
			} else await e.addLoad(t, n), this.setActionSuccess("load.added");
			await this.refresh(), await this.reloadConfiguration();
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	async duplicateConfiguredLoad(e) {
		let t = kF(e.load_id);
		if (!(!t || !this.selectedEntryId || !this.hass)) try {
			await new Ue(this.hass).duplicateLoad(this.selectedEntryId, t, MF(e)), this.setActionSuccess("load.duplicated"), await this.refresh(), await this.reloadConfiguration();
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	requestDeleteLoad(e, t, n) {
		let r = kF(e.load_id);
		if (r) try {
			this.deleteDialogTrigger = n instanceof HTMLElement ? n : void 0, this.deleteConfirmation = {
				loadId: r,
				displayName: t,
				ifRevision: MF(e)
			}, this.updateComplete.then(() => this.deleteConfirmationButton?.focus());
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	async confirmDeleteLoad() {
		let e = this.deleteConfirmation;
		if (!(!e || !this.selectedEntryId || !this.hass)) try {
			await new Ue(this.hass).deleteLoad(this.selectedEntryId, e.loadId, e.ifRevision), this.closeDeleteConfirmation(), this.setActionSuccess("load.deleted"), await this.refresh(), await this.reloadConfiguration();
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	updatedDraft(e, t) {
		let n = t.currentTarget;
		if (!(n instanceof HTMLInputElement) && !(n instanceof HTMLSelectElement)) return e;
		let r;
		if (n instanceof HTMLInputElement && n.type === "checkbox") r = n.checked;
		else if (n instanceof HTMLInputElement && n.type === "number") if (n.value === "") r = n.dataset.nullable === "true" ? null : "";
		else {
			let e = Number(n.value);
			r = Number.isFinite(e) ? e : n.value;
		}
		else r = n.value;
		return {
			...e,
			[n.name]: r
		};
	}
	async openLoad(e) {
		this.selectedLoadId = e, this.workspaceView = "load", this.loadDetail = void 0, await this.ensureWorkspaceData("load", !0);
	}
	async editConfiguredLoad(e) {
		await this.selectWorkspaceView("configure");
		let t = this.configuration?.loads.find((t) => kF(t.load_id) === e);
		t && this.startEditingLoad(t);
	}
	async applyOverride(e, t, n) {
		if (!this.selectedEntryId || !this.hass) return;
		let r = Math.round(this.overrideDurationMinutes * 60);
		if (!n && r <= 0) {
			this.actionMessage = void 0, this.actionError = F(this.hass, "status.invalid"), this.actionErrorCode = "invalid_request";
			return;
		}
		try {
			await new Ue(this.hass).startOverride(this.selectedEntryId, e, t, { ...n ? { indefinite: !0 } : { duration_seconds: r } }), this.setActionSuccess("load.overrideUpdated"), this.loadDetail = void 0, await this.refresh(), await this.ensureWorkspaceData("load", !0);
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	async clearLoadOverride(e) {
		if (!(!this.selectedEntryId || !this.hass)) try {
			await new Ue(this.hass).clearOverride(this.selectedEntryId, e), this.setActionSuccess("load.overrideCleared"), this.loadDetail = void 0, await this.refresh(), await this.ensureWorkspaceData("load", !0);
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	async setAutomaticControl(e, t) {
		if (!(!this.selectedEntryId || !this.hass)) {
			if (e.config_revision === void 0 || !Number.isInteger(e.config_revision)) {
				this.setActionFailure(new Ve("The load configuration revision is unavailable. Refresh before changing Automatic control.", "config_conflict"));
				return;
			}
			try {
				await new Ue(this.hass).setAutomaticControl(this.selectedEntryId, e.load_id, t, e.config_revision), this.setActionSuccess("load.automaticUpdated"), this.loadDetail = void 0, await this.refresh(), await this.ensureWorkspaceData("load", !0);
			} catch (e) {
				this.setActionFailure(e);
			}
		}
	}
	async replan() {
		if (!(!this.selectedEntryId || !this.hass)) try {
			await new Ue(this.hass).replan(this.selectedEntryId), this.currentPlan = void 0, this.dailyTimeline = void 0, this.setActionSuccess("status.updatedPlan"), await this.refresh(), await this.ensureWorkspaceData("plan", !0);
		} catch (e) {
			this.setActionFailure(e);
		}
	}
	handleSiteChange(e) {
		this.selectedEntryId = e.currentTarget.value;
	}
	async openSelectedSite() {
		this.selectedEntryId && (this.unsubscribeUpdates(), this.dashboard = void 0, this.resetWorkspaceData(), this.viewState = "loading", await this.refresh());
	}
	resetWorkspaceData() {
		this.workspaceView = "dashboard", this.selectedLoadId = void 0, this.configuration = void 0, this.siteDraft = void 0, this.loadDraft = void 0, this.editingLoadId = void 0, this.currentPlan = void 0, this.dailyTimeline = void 0, this.history = void 0, this.events = void 0, this.loadDetail = void 0, this.sectionLoading = void 0, this.actionMessage = void 0, this.actionError = void 0, this.actionErrorCode = void 0, this.configurationIssues = [], this.configurationPreview = void 0, this.deleteConfirmation = void 0, this.deleteDialogTrigger = void 0;
	}
	async ensureUpdateSubscription(e) {
		let t = this.hass;
		if (!t || !this.isWebsocketConnected() || this.subscribedEntryId === e && this.updateUnsubscribe) return;
		this.unsubscribeUpdates();
		let n = this.subscriptionGeneration;
		try {
			let r = await new Ue(t).subscribeUpdates(e, () => {
				n !== this.subscriptionGeneration || e !== this.selectedEntryId || e !== this.subscribedEntryId || !this.isWebsocketConnected() || this.requestSubscriptionRefresh();
			});
			if (!r || n !== this.subscriptionGeneration || e !== this.selectedEntryId || !this.isWebsocketConnected()) {
				r?.();
				return;
			}
			this.subscribedEntryId = e, this.updateUnsubscribe = r;
		} catch {}
	}
	unsubscribeUpdates() {
		let e = this.updateUnsubscribe;
		this.updateUnsubscribe = void 0, this.subscribedEntryId = void 0, this.subscriptionGeneration += 1, this.subscriptionRefreshPending = !1, e?.();
	}
	requestSubscriptionRefresh() {
		this.subscriptionRefreshPending = !0, this.refreshing || this.flushSubscriptionRefresh();
	}
	async flushSubscriptionRefresh() {
		!this.subscriptionRefreshPending || this.refreshing || (this.subscriptionRefreshPending = !1, await this.refresh());
	}
	closeDeleteConfirmation() {
		let e = this.deleteDialogTrigger;
		this.deleteConfirmation = void 0, this.deleteDialogTrigger = void 0, queueMicrotask(() => {
			if (e?.isConnected) {
				e.focus();
				return;
			}
			this.renderRoot.querySelector(".refresh-button, .nav-button")?.focus();
		});
	}
	syncRoute() {
		let e = this.route?.path ?? "", t = /\/load\/([^/?#]+)/u.exec(e);
		if (t?.[1]) {
			this.workspaceView = "load";
			try {
				this.selectedLoadId = decodeURIComponent(t[1]);
			} catch {
				this.selectedLoadId = t[1];
			}
		} else e.includes("/configure") ? this.workspaceView = "configure" : e.includes("/history") ? this.workspaceView = "history" : e.includes("/plan") ? this.workspaceView = "plan" : e.includes("/dashboard") && (this.workspaceView = "dashboard");
		this.hasLoaded && this.workspaceView !== "dashboard" && queueMicrotask(() => void this.ensureWorkspaceData(this.workspaceView));
	}
	setActionSuccess(e) {
		this.actionMessage = F(this.hass, e), this.actionError = void 0, this.actionErrorCode = void 0;
	}
	setActionFailure(e) {
		let t = e instanceof Ve ? e : void 0;
		this.actionMessage = void 0, this.actionErrorCode = t?.code, this.actionError = t?.code === "config_conflict" ? F(this.hass, "status.conflict") : e instanceof Error ? e.message : F(this.hass, "status.error");
	}
	isConflictError() {
		return this.actionErrorCode === "config_conflict";
	}
	loadTypeOptions() {
		return this.schemaOptions("load", "load_type", [
			"action_pair",
			"battery_charger",
			"battery_load",
			"binary_ev",
			"generic_binary",
			"hot_water",
			"variable_ev"
		]);
	}
	optimisationModeOptions() {
		return this.schemaOptions("load", "optimisation_mode", [
			"cheapest_tariff",
			"cost_optimised_hybrid",
			"custom_priority",
			"disabled",
			"free_energy_only",
			"manual",
			"schedule_only",
			"solar_preferred_guarantee",
			"solar_surplus_only"
		]);
	}
	schemaOptions(e, t, n) {
		let r = NF(this.configuration?.schema[e]), i = r ? NF(r.fields) : void 0, a = (i ? NF(i[t]) : void 0)?.options;
		return Array.isArray(a) && a.every((e) => typeof e == "string") ? a : n;
	}
	formatWatts(e) {
		return e === void 0 ? "—" : nt(this.hass, {
			value: e,
			unit: "W"
		});
	}
	formatProgress(e) {
		if (!e) return "—";
		if (e.percent !== void 0) return `${new Intl.NumberFormat(this.locale, { maximumFractionDigits: 0 }).format(e.percent)}%`;
		if (e.current !== void 0 && e.target !== void 0) {
			let t = e.unit ? ` ${e.unit}` : "";
			return `${e.current}/${e.target}${t}`;
		}
		return "—";
	}
	get locale() {
		return this.hass?.locale?.language ?? this.hass?.language ?? navigator.language;
	}
	pageTitle() {
		switch (this.workspaceView) {
			case "load": return F(this.hass, "app.loadRoute");
			case "plan": return F(this.hass, "app.plan");
			case "history": return F(this.hass, "app.history");
			case "configure": return F(this.hass, "app.configure");
			case "dashboard": return F(this.hass, "app.siteDashboard");
		}
	}
	localizeHealth(e) {
		return F(this.hass, `health.${e}`);
	}
	isWebsocketConnected() {
		return this.hass?.connection?.connected !== !1;
	}
};
$([Ie({ attribute: !1 })], EF.prototype, "hass", void 0), $([Ie({ attribute: !1 })], EF.prototype, "narrow", void 0), $([Ie({ attribute: !1 })], EF.prototype, "panel", void 0), $([Ie({ attribute: !1 })], EF.prototype, "route", void 0), $([Le()], EF.prototype, "viewState", void 0), $([Le()], EF.prototype, "dashboard", void 0), $([Le()], EF.prototype, "errorMessage", void 0), $([Le()], EF.prototype, "refreshing", void 0), $([Le()], EF.prototype, "availableSites", void 0), $([Le()], EF.prototype, "selectedEntryId", void 0), $([Le()], EF.prototype, "workspaceView", void 0), $([Le()], EF.prototype, "selectedLoadId", void 0), $([Le()], EF.prototype, "configuration", void 0), $([Le()], EF.prototype, "siteDraft", void 0), $([Le()], EF.prototype, "loadDraft", void 0), $([Le()], EF.prototype, "editingLoadId", void 0), $([Le()], EF.prototype, "currentPlan", void 0), $([Le()], EF.prototype, "dailyTimeline", void 0), $([Le()], EF.prototype, "history", void 0), $([Le()], EF.prototype, "events", void 0), $([Le()], EF.prototype, "loadDetail", void 0), $([Le()], EF.prototype, "sectionLoading", void 0), $([Le()], EF.prototype, "actionMessage", void 0), $([Le()], EF.prototype, "actionError", void 0), $([Le()], EF.prototype, "actionErrorCode", void 0), $([Le()], EF.prototype, "configurationIssues", void 0), $([Le()], EF.prototype, "configurationPreview", void 0), $([Le()], EF.prototype, "deleteConfirmation", void 0), $([Le()], EF.prototype, "overrideDurationMinutes", void 0), $([ze(".dialog-card .danger-button")], EF.prototype, "deleteConfirmationButton", void 0), EF = $([Ne("intelligent-load-controller-panel")], EF);
function DF(e) {
	return typeof e.entry_id == "string" && e.entry_id.length > 0;
}
function OF(e) {
	return { ...e };
}
function kF(e) {
	return typeof e == "string" ? e : void 0;
}
function AF(e, t) {
	return typeof e == "boolean" ? e : t;
}
function jF(e) {
	return typeof e == "number" && Number.isFinite(e) ? String(e) : "";
}
function MF(e) {
	let t = e.config_revision;
	if (typeof t == "number" && Number.isInteger(t)) return t;
	throw new Ve("The configuration revision is unavailable. Refresh before saving.", "config_conflict");
}
function NF(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : void 0;
}
//#endregion
export { Ue as LoadControlApi, Ve as LoadControlApiError };
