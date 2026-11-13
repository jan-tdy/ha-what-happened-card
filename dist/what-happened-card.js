/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, be = te.ShadowRoot && (te.ShadyCSS === void 0 || te.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, we = Symbol(), ze = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(e, n, s) {
    if (this._$cssResult$ = !0, s !== we) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (be && e === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (e = ze.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ze.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Nt = (t) => new pt(typeof t == "string" ? t : t + "", void 0, we), ft = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((s, i, o) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[o + 1], t[0]);
  return new pt(n, t, we);
}, zt = (t, e) => {
  if (be) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const s = document.createElement("style"), i = te.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, t.appendChild(s);
  }
}, je = be ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const s of e.cssRules) n += s.cssText;
  return Nt(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: jt, defineProperty: Ut, getOwnPropertyDescriptor: Ht, getOwnPropertyNames: Lt, getOwnPropertySymbols: Wt, getPrototypeOf: Vt } = Object, re = globalThis, Ue = re.trustedTypes, Bt = Ue ? Ue.emptyScript : "", Gt = re.reactiveElementPolyfillSupport, K = (t, e) => t, se = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Bt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let n = t;
  switch (e) {
    case Boolean:
      n = t !== null;
      break;
    case Number:
      n = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(t);
      } catch {
        n = null;
      }
  }
  return n;
} }, $e = (t, e) => !jt(t, e), He = { attribute: !0, type: String, converter: se, reflect: !1, useDefault: !1, hasChanged: $e };
Symbol.metadata ??= Symbol("metadata"), re.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let H = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = He) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(e, s, n);
      i !== void 0 && Ut(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, s) {
    const { get: i, set: o } = Ht(this.prototype, e) ?? { get() {
      return this[n];
    }, set(r) {
      this[n] = r;
    } };
    return { get: i, set(r) {
      const a = i?.call(this);
      o?.call(this, r), this.requestUpdate(e, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? He;
  }
  static _$Ei() {
    if (this.hasOwnProperty(K("elementProperties"))) return;
    const e = Vt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(K("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(K("properties"))) {
      const n = this.properties, s = [...Lt(n), ...Wt(n)];
      for (const i of s) this.createProperty(i, n[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0) for (const [s, i] of n) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, s] of this.elementProperties) {
      const i = this._$Eu(n, s);
      i !== void 0 && this._$Eh.set(i, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const i of s) n.unshift(je(i));
    } else e !== void 0 && n.push(je(e));
    return n;
  }
  static _$Eu(e, n) {
    const s = n.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
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
    const e = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const s of n.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return zt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, n, s) {
    this._$AK(e, s);
  }
  _$ET(e, n) {
    const s = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, s);
    if (i !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : se).toAttribute(n, s.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, n) {
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), r = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : se;
      this._$Em = i;
      const a = r.fromAttribute(n, o.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, n, s, i = !1, o) {
    if (e !== void 0) {
      const r = this.constructor;
      if (i === !1 && (o = this[e]), s ??= r.getPropertyOptions(e), !((s.hasChanged ?? $e)(o, n) || s.useDefault && s.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, s)))) return;
      this.C(e, n, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: s, reflect: i, wrapped: o }, r) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, r ?? n ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, o] of s) {
        const { wrapped: r } = o, a = this[i];
        r !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, o, a);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[K("elementProperties")] = /* @__PURE__ */ new Map(), H[K("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: H }), (re.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xe = globalThis, Le = (t) => t, ie = xe.trustedTypes, We = ie ? ie.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, mt = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, _t = "?" + T, Ft = `<${_t}>`, D = document, Y = () => D.createComment(""), q = (t) => t === null || typeof t != "object" && typeof t != "function", ke = Array.isArray, Kt = (t) => ke(t) || typeof t?.[Symbol.iterator] == "function", he = `[ 	
\f\r]`, F = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ve = /-->/g, Be = />/g, O = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ge = /'/g, Fe = /"/g, gt = /^(?:script|style|textarea|title)$/i, Yt = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), f = Yt(1), M = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Ke = /* @__PURE__ */ new WeakMap(), R = D.createTreeWalker(D, 129);
function vt(t, e) {
  if (!ke(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return We !== void 0 ? We.createHTML(e) : e;
}
const qt = (t, e) => {
  const n = t.length - 1, s = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = F;
  for (let a = 0; a < n; a++) {
    const c = t[a];
    let d, l, p = -1, _ = 0;
    for (; _ < c.length && (r.lastIndex = _, l = r.exec(c), l !== null); ) _ = r.lastIndex, r === F ? l[1] === "!--" ? r = Ve : l[1] !== void 0 ? r = Be : l[2] !== void 0 ? (gt.test(l[2]) && (i = RegExp("</" + l[2], "g")), r = O) : l[3] !== void 0 && (r = O) : r === O ? l[0] === ">" ? (r = i ?? F, p = -1) : l[1] === void 0 ? p = -2 : (p = r.lastIndex - l[2].length, d = l[1], r = l[3] === void 0 ? O : l[3] === '"' ? Fe : Ge) : r === Fe || r === Ge ? r = O : r === Ve || r === Be ? r = F : (r = O, i = void 0);
    const u = r === O && t[a + 1].startsWith("/>") ? " " : "";
    o += r === F ? c + Ft : p >= 0 ? (s.push(d), c.slice(0, p) + mt + c.slice(p) + T + u) : c + T + (p === -2 ? a : u);
  }
  return [vt(t, o + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class J {
  constructor({ strings: e, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let o = 0, r = 0;
    const a = e.length - 1, c = this.parts, [d, l] = qt(e, n);
    if (this.el = J.createElement(d, s), R.currentNode = this.el.content, n === 2 || n === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = R.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(mt)) {
          const _ = l[r++], u = i.getAttribute(p).split(T), g = /([.?@])?(.*)/.exec(_);
          c.push({ type: 1, index: o, name: g[2], strings: u, ctor: g[1] === "." ? Xt : g[1] === "?" ? Zt : g[1] === "@" ? Qt : ae }), i.removeAttribute(p);
        } else p.startsWith(T) && (c.push({ type: 6, index: o }), i.removeAttribute(p));
        if (gt.test(i.tagName)) {
          const p = i.textContent.split(T), _ = p.length - 1;
          if (_ > 0) {
            i.textContent = ie ? ie.emptyScript : "";
            for (let u = 0; u < _; u++) i.append(p[u], Y()), R.nextNode(), c.push({ type: 2, index: ++o });
            i.append(p[_], Y());
          }
        }
      } else if (i.nodeType === 8) if (i.data === _t) c.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(T, p + 1)) !== -1; ) c.push({ type: 7, index: o }), p += T.length - 1;
      }
      o++;
    }
  }
  static createElement(e, n) {
    const s = D.createElement("template");
    return s.innerHTML = e, s;
  }
}
function V(t, e, n = t, s) {
  if (e === M) return e;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const o = q(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (e = V(t, i._$AS(t, e.values), i, s)), e;
}
class Jt {
  constructor(e, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: n }, parts: s } = this._$AD, i = (e?.creationScope ?? D).importNode(n, !0);
    R.currentNode = i;
    let o = R.nextNode(), r = 0, a = 0, c = s[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let d;
        c.type === 2 ? d = new Z(o, o.nextSibling, this, e) : c.type === 1 ? d = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (d = new en(o, this, e)), this._$AV.push(d), c = s[++a];
      }
      r !== c?.index && (o = R.nextNode(), r++);
    }
    return R.currentNode = D, i;
  }
  p(e) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, n), n += s.strings.length - 2) : s._$AI(e[n])), n++;
  }
}
class Z {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, n, s, i) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && e?.nodeType === 11 && (e = n.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    e = V(this, e, n), q(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Kt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: n, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = J.createElement(vt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const o = new Jt(i, this), r = o.u(this.options);
      o.p(n), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let n = Ke.get(e.strings);
    return n === void 0 && Ke.set(e.strings, n = new J(e)), n;
  }
  k(e) {
    ke(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const o of e) i === n.length ? n.push(s = new Z(this.O(Y()), this.O(Y()), this, this.options)) : s = n[i], s._$AI(o), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); e !== this._$AB; ) {
      const s = Le(e).nextSibling;
      Le(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ae {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, s, i, o) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = m;
  }
  _$AI(e, n = this, s, i) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = V(this, e, n, 0), r = !q(e) || e !== this._$AH && e !== M, r && (this._$AH = e);
    else {
      const a = e;
      let c, d;
      for (e = o[0], c = 0; c < o.length - 1; c++) d = V(this, a[s + c], n, c), d === M && (d = this._$AH[c]), r ||= !q(d) || d !== this._$AH[c], d === m ? e = m : e !== m && (e += (d ?? "") + o[c + 1]), this._$AH[c] = d;
    }
    r && !i && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Xt extends ae {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class Zt extends ae {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class Qt extends ae {
  constructor(e, n, s, i, o) {
    super(e, n, s, i, o), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = V(this, e, n, 0) ?? m) === M) return;
    const s = this._$AH, i = e === m && s !== m || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, o = e !== m && (s === m || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class en {
  constructor(e, n, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    V(this, e);
  }
}
const tn = xe.litHtmlPolyfillSupport;
tn?.(J, Z), (xe.litHtmlVersions ??= []).push("3.3.3");
const nn = (t, e, n) => {
  const s = n?.renderBefore ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = n?.renderBefore ?? null;
    s._$litPart$ = i = new Z(e.insertBefore(Y(), o), o, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = globalThis;
let W = class extends H {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = nn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
};
W._$litElement$ = !0, W.finalized = !0, Se.litElementHydrateSupport?.({ LitElement: W });
const sn = Se.litElementPolyfillSupport;
sn?.({ LitElement: W });
(Se.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yt = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const on = { attribute: !0, type: String, converter: se, reflect: !1, hasChanged: $e }, rn = (t = on, e, n) => {
  const { kind: s, metadata: i } = n;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(n.name, t), s === "accessor") {
    const { name: r } = n;
    return { set(a) {
      const c = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(r, c, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, t, a), a;
    } };
  }
  if (s === "setter") {
    const { name: r } = n;
    return function(a) {
      const c = this[r];
      e.call(this, a), this.requestUpdate(r, c, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function bt(t) {
  return (e, n) => typeof n == "object" ? rn(t, e, n) : ((s, i, o) => {
    const r = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, s), r ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function N(t) {
  return bt({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = { ATTRIBUTE: 1 }, $t = (t) => (...e) => ({ _$litDirective$: t, values: e });
let xt = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, n, s) {
    this._$Ct = e, this._$AM = n, this._$Ci = s;
  }
  _$AS(e, n) {
    return this.update(e, n);
  }
  update(e, n) {
    return this.render(...n);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = $t(class extends xt {
  constructor(t) {
    if (super(t), t.type !== wt.ATTRIBUTE || t.name !== "class" || t.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return " " + Object.keys(t).filter((e) => t[e]).join(" ") + " ";
  }
  update(t, [e]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), t.strings !== void 0 && (this.nt = new Set(t.strings.join(" ").split(/\s/).filter((s) => s !== "")));
      for (const s in e) e[s] && !this.nt?.has(s) && this.st.add(s);
      return this.render(e);
    }
    const n = t.element.classList;
    for (const s of this.st) s in e || (n.remove(s), this.st.delete(s));
    for (const s in e) {
      const i = !!e[s];
      i === this.st.has(s) || this.nt?.has(s) || (i ? (n.add(s), this.st.add(s)) : (n.remove(s), this.st.delete(s)));
    }
    return M;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = "important", an = " !" + kt, ee = $t(class extends xt {
  constructor(t) {
    if (super(t), t.type !== wt.ATTRIBUTE || t.name !== "style" || t.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return Object.keys(t).reduce((e, n) => {
      const s = t[n];
      return s == null ? e : e + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }, "");
  }
  update(t, [e]) {
    const { style: n } = t.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(e)), this.render(e);
    for (const s of this.ft) e[s] == null && (this.ft.delete(s), s.includes("-") ? n.removeProperty(s) : n[s] = null);
    for (const s in e) {
      const i = e[s];
      if (i != null) {
        this.ft.add(s);
        const o = typeof i == "string" && i.endsWith(an);
        s.includes("-") || o ? n.setProperty(s, o ? i.slice(0, -11) : i, o ? kt : "") : n[s] = i;
      }
    }
    return M;
  }
}), St = {
  // -- state-message.ts: binary sensor device classes -----------------------------------------
  "was opened": "was opened",
  "was closed": "was closed",
  "was unlocked": "was unlocked",
  "was locked": "was locked",
  "detected motion": "detected motion",
  "motion cleared": "motion cleared",
  "started moving": "started moving",
  "stopped moving": "stopped moving",
  "detected occupancy": "detected occupancy",
  "occupancy cleared": "occupancy cleared",
  "detected presence": "detected presence",
  "presence cleared": "presence cleared",
  "detected smoke": "detected smoke",
  "smoke cleared": "smoke cleared",
  "detected gas": "detected gas",
  "gas cleared": "gas cleared",
  "detected carbon monoxide": "detected carbon monoxide",
  "carbon monoxide cleared": "carbon monoxide cleared",
  "detected moisture": "detected moisture",
  "became dry": "became dry",
  "reported a problem": "reported a problem",
  "problem resolved": "problem resolved",
  "is unsafe": "is unsafe",
  "is safe": "is safe",
  "detected tampering": "detected tampering",
  "tampering cleared": "tampering cleared",
  connected: "connected",
  disconnected: "disconnected",
  "was plugged in": "was plugged in",
  "was unplugged": "was unplugged",
  "detected power": "detected power",
  "lost power": "lost power",
  "reported low battery": "reported low battery",
  "battery is normal": "battery is normal",
  "started charging": "started charging",
  "stopped charging": "stopped charging",
  "got cold": "got cold",
  "is no longer cold": "is no longer cold",
  "got hot": "got hot",
  "is no longer hot": "is no longer hot",
  "detected light": "detected light",
  "no longer detects light": "no longer detects light",
  "detected sound": "detected sound",
  "no longer detects sound": "no longer detects sound",
  "detected vibration": "detected vibration",
  "vibration cleared": "vibration cleared",
  "started running": "started running",
  "stopped running": "stopped running",
  "has an update available": "has an update available",
  "is up to date": "is up to date",
  // -- state-message.ts: per-domain states -----------------------------------------------------
  "is locking": "is locking",
  "is unlocking": "is unlocking",
  "is opening": "is opening",
  "is jammed": "is jammed",
  "started opening": "started opening",
  "started closing": "started closing",
  "was disarmed": "was disarmed",
  "was armed (home)": "was armed (home)",
  "was armed (away)": "was armed (away)",
  "was armed (night)": "was armed (night)",
  "was armed (vacation)": "was armed (vacation)",
  "was armed (custom bypass)": "was armed (custom bypass)",
  "is pending": "is pending",
  "is arming": "is arming",
  "is disarming": "is disarming",
  "was triggered": "was triggered",
  "started playing": "started playing",
  paused: "paused",
  "is idle": "is idle",
  "is buffering": "is buffering",
  "went to standby": "went to standby",
  "started cleaning": "started cleaning",
  "returned to its dock": "returned to its dock",
  "is returning to its dock": "is returning to its dock",
  "reported an error": "reported an error",
  "started mowing": "started mowing",
  started: "started",
  finished: "finished",
  rose: "rose",
  set: "set",
  // -- state-message.ts: event entities ---------------------------------------------------------
  rang: "rang",
  "detected a person": "detected a person",
  "was pressed": "was pressed",
  "was double-pressed": "was double-pressed",
  "was triple-pressed": "was triple-pressed",
  "was long-pressed": "was long-pressed",
  "reported {text}": "reported {text}",
  "detected an event": "detected an event",
  // -- state-message.ts: presence, generic on/off, fallback --------------------------------------
  "arrived home": "arrived home",
  "left home": "left home",
  "arrived at {zone}": "arrived at {zone}",
  "became unavailable": "became unavailable",
  "became unknown": "became unknown",
  "was activated": "was activated",
  "was turned on": "was turned on",
  "was turned off": "was turned off",
  "changed to {value}": "changed to {value}",
  // -- noise.ts: chatty entities and bursts -----------------------------------------------------
  "was triggered {n} times": "was triggered {n} times",
  "{verb} {n} times": "{verb} {n} times",
  "fired {n} times": "fired {n} times",
  "changed {n} times": "changed {n} times",
  "latest: {verb}": "latest: {verb}",
  "{shown} and {more} more": "{shown} and {more} more",
  // -- format.ts: relative time ------------------------------------------------------------------
  "just now": "just now",
  // -- timeline.ts: grouped device actions (feature) ----------------------------------------------
  "{count} changes in the last {minutes} min": "{count} changes in the last {minutes} min"
}, cn = { en: St };
function dn(t) {
  return (t ?? "en").split("-")[0].toLowerCase();
}
function $(t, e, n) {
  let i = cn[dn(e)]?.[t] ?? St[t] ?? t;
  if (n)
    for (const [o, r] of Object.entries(n))
      i = i.split(`{${o}}`).join(String(r));
  return i;
}
function ce(t) {
  return t?.locale?.language ?? "en-US";
}
function Ye(t) {
  const e = new Date(t);
  return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
function ln(t) {
  const e = new Date(t), n = (s) => String(s).padStart(2, "0");
  return `${e.getFullYear()}-${n(e.getMonth() + 1)}-${n(e.getDate())}`;
}
function un(t) {
  const e = t?.locale?.time_format;
  return e === "12" ? !0 : e === "24" ? !1 : new Intl.DateTimeFormat(void 0, { hour: "numeric" }).resolvedOptions().hour12 ?? !1;
}
function _e(t, e, n = !1) {
  const s = un(e);
  return new Intl.DateTimeFormat(ce(e), {
    hour: s ? "numeric" : "2-digit",
    minute: "2-digit",
    second: n ? "2-digit" : void 0,
    hourCycle: s ? "h12" : "h23"
  }).format(t);
}
function hn(t, e) {
  return `${new Intl.DateTimeFormat(ce(e), {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(t)}, ${_e(t, e, !0)}`;
}
const qe = /* @__PURE__ */ new Map();
function ne(t) {
  let e = qe.get(t);
  return e || (e = new Intl.RelativeTimeFormat(t, { numeric: "auto" }), qe.set(t, e)), e;
}
function pn(t, e, n) {
  const s = Math.max(0, Math.round((e - t) / 1e3)), i = ce(n);
  if (s < 45) return $("just now", i);
  const o = Math.round(s / 60);
  if (o < 60) return ne(i).format(-o, "minute");
  const r = Math.round(o / 60);
  if (r < 24) return ne(i).format(-r, "hour");
  const a = Math.round(r / 24);
  return ne(i).format(-a, "day");
}
function fn(t, e, n) {
  const s = Math.round((Ye(e) - Ye(t)) / 864e5), i = ce(n);
  if (s === 0 || s === 1) {
    const r = ne(i).format(-s, "day");
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  const o = new Date(t).getFullYear() === new Date(e).getFullYear();
  return new Intl.DateTimeFormat(i, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: o ? void 0 : "numeric"
  }).format(t);
}
function mn(t, e, n, s) {
  const i = {
    type: "logbook/event_stream",
    start_time: n.toISOString()
  };
  return s && s.length > 0 && (i.entity_ids = s), t.connection.subscribeMessage(
    (o) => e(o.events ?? []),
    i
  );
}
const _n = 10, gn = 1e4, vn = 3;
function Ae(t, e) {
  return t.length > e ? `${t.slice(0, e - 1).trimEnd()}…` : t;
}
function Je(t) {
  return t.entityId ?? t.name;
}
function yn(t, e, n = /* @__PURE__ */ new Set(), s) {
  if (e === "show") return t;
  const i = /* @__PURE__ */ new Map();
  for (const c of t) {
    if (c.rich || c.entityId && n.has(c.entityId)) continue;
    const d = Je(c), l = i.get(d);
    l ? l.push(c) : i.set(d, [c]);
  }
  const o = /* @__PURE__ */ new Set();
  for (const [c, d] of i) {
    if (d.length < _n) continue;
    (d[0].when - d[d.length - 1].when) / 36e5 <= d.length && o.add(c);
  }
  if (o.size === 0) return t;
  const r = [], a = /* @__PURE__ */ new Set();
  for (const c of t) {
    const d = Je(c);
    if (c.rich || !o.has(d) || c.entityId && n.has(c.entityId)) {
      r.push(c);
      continue;
    }
    if (a.has(d) || e === "hide") continue;
    a.add(d);
    const l = i.get(d), p = l.length, _ = c.domain === "event", u = _ && l.every((g) => g.verb === c.verb);
    r.push({
      ...c,
      key: `chatty|${d}`,
      verb: c.isRun ? $("was triggered {n} times", s, { n: p }) : u ? $("{verb} {n} times", s, { n: p, verb: c.verb }) : _ ? $("fired {n} times", s, { n: p }) : $("changed {n} times", s, { n: p }),
      details: c.isRun || u ? void 0 : [$("latest: {verb}", s, { verb: Ae(c.verb, 70) })],
      isRun: !1,
      count: 1,
      rich: !0
    });
  }
  return r;
}
const bn = {
  update: "updates",
  light: "lights",
  switch: "switches",
  binary_sensor: "sensors",
  sensor: "sensors",
  cover: "covers",
  fan: "fans",
  lock: "locks",
  climate: "thermostats",
  media_player: "media players",
  input_boolean: "toggles",
  automation: "automations",
  script: "scripts",
  button: "buttons",
  number: "numbers",
  select: "selects"
};
function wn(t) {
  return bn[t] ?? `${t.replace(/_/g, " ")} entities`;
}
function $n(t) {
  return t.startsWith("was ") ? `were ${t.slice(4)}` : t.startsWith("is ") ? `are ${t.slice(3)}` : t;
}
function xn(t, e) {
  return (t.cause?.actor?.name ?? "") === (e.cause?.actor?.name ?? "") && (t.cause?.trigger ?? "") === (e.cause?.trigger ?? "");
}
function kn(t, e) {
  const n = /* @__PURE__ */ new Map(), s = [];
  for (const o of t) {
    if (o.rich || !o.entityId) continue;
    const r = `${o.domain}|${o.verb}|${o.tone}`, a = n.get(r);
    if (a && a.oldest - o.when <= gn)
      a.members.push(o), a.oldest = o.when;
    else {
      const c = { members: [o], oldest: o.when };
      n.set(r, c), s.push(c);
    }
  }
  const i = /* @__PURE__ */ new Map();
  for (const { members: o } of s) {
    const r = new Set(o.map((l) => l.entityId));
    if (r.size < vn) continue;
    const a = o[0], c = [...new Set(o.map((l) => l.name))], d = c.slice(0, 6).join(", ");
    i.set(a, {
      ...a,
      key: `burst|${a.key}`,
      entityId: void 0,
      name: `${r.size} ${wn(a.domain)}`,
      verb: $n(a.verb),
      details: [
        c.length > 6 ? $("{shown} and {more} more", e, { shown: d, more: c.length - 6 }) : d
      ],
      cause: o.every((l) => xn(l, a)) ? a.cause : void 0,
      count: 1,
      stateValue: void 0,
      rich: !0
    });
    for (const l of o.slice(1)) i.set(l, null);
  }
  return i.size === 0 ? t : t.flatMap((o) => {
    if (!i.has(o)) return [o];
    const r = i.get(o);
    return r ? [r] : [];
  });
}
const Sn = 3e4;
function An(t, e, n = /* @__PURE__ */ new Set()) {
  const s = /* @__PURE__ */ new Set();
  for (const i of e) {
    if (i.rich || !i.entityId) continue;
    const o = t.states[i.entityId]?.attributes.entity_id;
    if (!Array.isArray(o) || o.length === 0) continue;
    const r = new Set(o.filter((a) => typeof a == "string"));
    for (const a of e)
      a !== i && !a.rich && a.entityId && !n.has(a.entityId) && r.has(a.entityId) && a.verb === i.verb && Math.abs(a.when - i.when) <= Sn && s.add(a);
  }
  return s.size ? e.filter((i) => !s.has(i)) : e;
}
const En = 200;
function pe(t) {
  return typeof t == "string" ? t.split(",").map((e) => e.trim()) : Array.isArray(t) ? t.filter((e) => typeof e == "string") : [];
}
function Xe(t) {
  return typeof t == "string" && t.trim() ? Ae(t.trim(), En) : void 0;
}
function In(t) {
  const e = [];
  for (const [n, s] of Object.entries(t.trace ?? {}))
    if (!(!n.startsWith("action/") && !n.startsWith("sequence/")))
      for (const i of s) {
        const o = i.result?.params;
        if (!o?.domain || !o.service) continue;
        const r = o.service_data ?? {}, a = Xe(r.message);
        if (!a) continue;
        const c = `${o.domain}.${o.service}`;
        if (o.domain === "tts") {
          const d = [
            ...pe(r.media_player_entity_id),
            ...pe(r.entity_id),
            ...pe(o.target?.entity_id)
          ].filter((l) => l.startsWith("media_player."));
          e.push({ kind: "say", text: a, speakers: [...new Set(d)], service: c });
        } else (o.domain === "notify" || o.domain === "persistent_notification") && e.push({
          kind: "notify",
          text: a,
          title: Xe(r.title),
          speakers: [],
          service: c
        });
      }
  return e;
}
function fe(t, e, n, s = 5e3) {
  let i, o = 1 / 0;
  for (const r of t) {
    const a = Date.parse(r.timestamp.start);
    if (Number.isNaN(a) || a > e + s || e - a > n) continue;
    const c = Math.abs(e - a);
    c < o && (i = r, o = c);
  }
  return i;
}
const Cn = 45e3, Tn = 6e4;
class Mn {
  constructor(e) {
    this.hass = e, this.lists = /* @__PURE__ */ new Map(), this.details = /* @__PURE__ */ new Map(), this.tried = /* @__PURE__ */ new Map(), this.inflight = /* @__PURE__ */ new Map();
  }
  setHass(e) {
    this.hass = e;
  }
  item(e) {
    const [n, s] = e.split(".");
    if (n === "script") return { domain: n, itemId: s };
    if (n === "automation") {
      const i = this.hass.states[e]?.attributes.id;
      return typeof i == "string" || typeof i == "number" ? { domain: n, itemId: String(i) } : void 0;
    }
  }
  /** The trace of the run behind something that happened at `whenMs`, if it is already loaded. */
  lookup(e, n, s) {
    const i = this.item(e), o = i && this.lists.get(`${i.domain}|${i.itemId}`), r = o && fe(o.runs, n, s);
    return i && r ? this.details.get(`${i.domain}|${i.itemId}|${r.run_id}`) : void 0;
  }
  /** Load what `lookup` needs. Resolves when done; failures (no admin rights, no trace) are quiet. */
  ensure(e, n, s) {
    const i = this.item(e);
    if (!i) return;
    const o = `${i.domain}|${i.itemId}`, r = this.lists.get(o), a = r && fe(r.runs, n, s);
    if (a && this.details.has(`${o}|${a.run_id}`)) return;
    const c = `${o}|${a?.run_id ?? Math.floor(n / 6e4)}`, d = this.tried.get(c);
    if (d && Date.now() - d < Tn) return;
    const l = this.inflight.get(c);
    if (l) return l;
    const p = (async () => {
      this.tried.set(c, Date.now());
      try {
        let _ = this.lists.get(o);
        if (!_ || Date.now() - _.at > Cn) {
          const g = await this.hass.callWS({
            type: "trace/list",
            domain: i.domain,
            item_id: i.itemId
          });
          _ = { at: Date.now(), runs: Array.isArray(g) ? g : [] }, this.lists.set(o, _);
        }
        const u = fe(_.runs, n, s);
        if (u && !this.details.has(`${o}|${u.run_id}`)) {
          const g = await this.hass.callWS({
            type: "trace/get",
            domain: i.domain,
            item_id: i.itemId,
            run_id: u.run_id
          });
          this.details.set(`${o}|${u.run_id}`, g);
        }
      } catch {
      } finally {
        this.inflight.delete(c);
      }
    })();
    return this.inflight.set(c, p), p;
  }
}
const On = "mdi:information-outline", Ee = {
  user: "mdi:account",
  automation: "mdi:robot",
  script: "mdi:script-text",
  scene: "mdi:palette",
  service: "mdi:cog-play",
  entity: "mdi:circle-medium",
  other: "mdi:information-outline"
};
function Rn(t, e) {
  return e || (t === "homeassistant" ? "mdi:home-assistant" : On);
}
function P(t, e, n, s, i) {
  const o = "var(--state-icon-color, var(--primary-text-color))";
  if (i && t === "vacuum" && s !== "alert" && s !== "unavailable") {
    const r = "var(--state-vacuum-active-color, var(--teal-color, #009688))";
    return n ? `var(--state-vacuum-${n}-color, ${r})` : r;
  }
  if (!i) return s === "unavailable" ? "var(--state-unavailable-color)" : o;
  switch (s) {
    case "unavailable":
      return "var(--state-unavailable-color, var(--disabled-text-color))";
    case "alert":
      return "var(--error-color)";
    case "inactive":
      return `var(--state-${t}-inactive-color, var(--state-inactive-color, ${o}))`;
    case "active": {
      const r = `var(--state-${t}-active-color, var(--state-active-color, ${o}))`, a = n ? `var(--state-${t}-${n}-color, ${r})` : r;
      return e && n ? `var(--state-${t}-${e}-${n}-color, ${a})` : a;
    }
    default:
      return o;
  }
}
const Ze = "var(--error-color)", Pn = "tapo_rv30", Qe = {
  0: "the robot button",
  1: "the Tapo app",
  2: "Alexa",
  3: "Google Assistant",
  4: "the robot's schedule",
  5: "an automation",
  6: "IFTTT",
  7: "Alice"
}, Dn = {
  cleaning: "start",
  docked: "finish"
}, Nn = 10 * 60 * 1e3, zn = /* @__PURE__ */ new Set(["start", "done", "override", "return", "docked", "skip", "error"]), At = 300;
function jn(t) {
  return Object.values(t.entities ?? {}).filter((e) => e.platform === Pn && e.entity_id.startsWith("vacuum.")).map((e) => e.entity_id);
}
function et(t) {
  const e = t.match(/^(You started|Started) cleaning (.+?)\.(?: (.+))?$/s);
  return e ? { byUser: e[1] === "You started", names: e[2], why: e[3]?.replace(/\.$/, "") } : { byUser: t.startsWith("You") };
}
function Un(t, e, n) {
  let s;
  for (const i of t) {
    if (i.kind !== "start" || n.has(i)) continue;
    const o = Math.abs(i.ts - e);
    o <= At && (!s || o < Math.abs(s.ts - e)) && (s = i);
  }
  return s;
}
function Hn(t) {
  const e = t.match(/^(.+?) came home: (.*?)\.?$/s);
  return e ? { people: e[1], note: e[2] } : void 0;
}
function Ln(t, e) {
  const n = e.split(/, | and /).map((i) => i.trim()), s = n.length === 1 ? Object.values(t.states).find(
    (i) => i.entity_id.startsWith("person.") && i.attributes.friendly_name === n[0]
  ) : void 0;
  return {
    kind: "user",
    name: e,
    entityId: s?.entity_id,
    picture: s?.attributes.entity_picture
  };
}
function tt() {
  return { kind: "other", name: "Cleaning planner", icon: "mdi:calendar-clock" };
}
function nt(t) {
  return { kind: "user", name: t.user?.name ?? "You" };
}
function Wn(t) {
  const e = [];
  return t.minutes != null && e.push(`${t.minutes} min`), t.area != null && e.push(`${t.area} m²`), t.emptied_bin && e.push("bin emptied"), e;
}
function Vn(t, e, n) {
  const i = t.states[e.entityId]?.attributes.friendly_name ?? e.entityId, o = n.state_color ?? !0, r = [], a = /* @__PURE__ */ new Set(), c = {
    entityId: e.entityId,
    domain: "vacuum",
    name: i,
    isPerson: !1,
    isRun: !1,
    count: 1,
    rich: !0,
    fixedIcon: !0
  };
  for (const u of e.runs) {
    const g = Un(e.log, u.started, a);
    g && a.add(g);
    const b = g ? et(g.text) : void 0, k = !!u.error;
    let x;
    g && b ? x = { actor: b.byUser ? nt(t) : tt(), trigger: b.why } : u.start_type != null && Qe[u.start_type] && (x = {
      actor: { kind: "other", name: Qe[u.start_type], icon: "mdi:gesture-tap" }
    }), r.push({
      ...c,
      key: `vac|${e.entityId}|start|${u.started}`,
      when: u.started * 1e3,
      verb: b?.names ? `started cleaning ${b.names}` : "started cleaning",
      tone: "active",
      phase: "start",
      icon: "mdi:robot-vacuum",
      details: u.rule_name ? [`preset “${u.rule_name}”`] : void 0,
      cause: x,
      accent: P("vacuum", void 0, "cleaning", "active", o)
    });
    const A = (u.started + (u.minutes ?? 0) * 60) * 1e3;
    r.push({
      ...c,
      key: `vac|${e.entityId}|finish|${u.started}`,
      when: Math.max(A, u.started * 1e3 + 1e3),
      verb: k ? `stopped with error ${u.error}` : b?.names ? `finished cleaning ${b.names}` : "finished cleaning",
      tone: k ? "alert" : "inactive",
      phase: "finish",
      icon: k ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      details: Wn(u),
      accent: k ? Ze : P("vacuum", void 0, "docked", "inactive", o)
    });
  }
  const d = e.log.filter((u) => u.kind === "return"), l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set();
  for (const u of e.log.filter((g) => g.kind === "docked")) {
    const g = d.find(
      (b) => !p.has(b) && b.ts <= u.ts && u.ts - b.ts <= 1800
    );
    g && (l.set(u, g), p.add(g));
  }
  const _ = new Set(e.runs.map((u) => u.started));
  for (const u of e.log) {
    if (!zn.has(u.kind) || a.has(u) || u.kind === "done" && e.runs.length > 0 || u.kind === "start" && [..._].some((A) => Math.abs(A - u.ts) <= At) || p.has(u)) continue;
    const g = u.kind === "start" ? et(u.text) : void 0, b = u.kind === "docked" ? l.get(u) : void 0, k = b ? Hn(b.text) : void 0;
    if (k) {
      r.push({
        ...c,
        key: `vac|${e.entityId}|log|${u.ts}|docked`,
        when: u.ts * 1e3,
        verb: "was sent home",
        tone: "neutral",
        icon: "mdi:robot-vacuum",
        details: [k.note.charAt(0).toUpperCase() + k.note.slice(1)],
        cause: { actor: Ln(t, k.people), trigger: "coming home" },
        accent: P("vacuum", void 0, "docked", "inactive", o)
      });
      continue;
    }
    const x = u.kind === "error" ? "alert" : u.kind === "start" ? "active" : "neutral";
    r.push({
      ...c,
      key: `vac|${e.entityId}|log|${u.ts}|${u.kind}`,
      when: u.ts * 1e3,
      verb: g?.names ? `started cleaning ${g.names}` : "",
      text: g?.names ? void 0 : u.text.replace(/\.$/, ""),
      tone: x,
      phase: u.kind === "start" ? "start" : u.kind === "done" ? "finish" : void 0,
      icon: u.kind === "error" ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      cause: { actor: g?.byUser ? nt(t) : tt(), trigger: g?.why },
      accent: x === "alert" ? Ze : P(
        "vacuum",
        void 0,
        "cleaning",
        x === "active" ? "active" : "neutral",
        o
      )
    });
  }
  return r;
}
const Bn = ft`
  :host {
    display: block;
    height: 100%;
    container-type: inline-size;
    container-name: wh;
  }
  ha-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    --wh-node: 32px;
    --wh-icon: 20px;
    --wh-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --wh-secondary: var(--secondary-text-color);
  }
  ha-card.compact {
    --wh-node: 24px;
    --wh-icon: 16px;
  }
  .card-header {
    flex: none;
  }
  .scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    max-height: var(--wh-max-height, none);
    padding: 0 var(--ha-space-4, 16px) var(--ha-space-2, 8px);
    overscroll-behavior: contain;
  }
  ha-card:not(.has-header) .scroll {
    padding-top: var(--ha-space-2, 8px);
  }
  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Day headings */
  .day {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: var(--ha-space-2, 8px) 0;
    background: var(--wh-surface);
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: var(--ha-line-height-condensed, 1.2);
  }

  /* Entries */
  .item {
    display: grid;
    grid-template-columns: var(--wh-node) minmax(0, 1fr);
    column-gap: var(--ha-space-3, 12px);
  }
  .rail {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .line {
    flex: 1;
    width: 2px;
    min-height: var(--ha-space-2, 8px);
    margin: var(--ha-space-1, 4px) 0;
    border-radius: 1px;
    background: var(--divider-color);
  }
  .item.last .line {
    visibility: hidden;
  }
  .node {
    position: relative;
    flex: none;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: var(--wh-node);
    height: var(--wh-node);
    border-radius: var(--ha-border-radius-circle, 50%);
    color: var(--accent);
    --mdc-icon-size: var(--wh-icon);
  }
  .node::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--accent);
    opacity: 0.2;
  }
  .node.photo::before {
    display: none;
  }
  /* A device/entity group's icon gets a ring, signalling several folded actions. */
  .node.grouped {
    box-shadow:
      0 0 0 2px var(--wh-surface),
      0 0 0 4px var(--accent);
  }
  .glyph {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    line-height: 0;
  }
  .glyph ha-state-icon,
  .glyph ha-icon {
    display: block;
    flex: none;
    width: var(--wh-icon);
    height: var(--wh-icon);
    margin: 0;
    padding: 0;
    --mdc-icon-size: var(--wh-icon);
  }
  .photo-img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
  .avatar {
    display: inline-grid;
    place-items: center;
    width: 16px;
    height: 16px;
    margin: 0 4px -3px 6px;
    border-radius: var(--ha-border-radius-circle, 50%);
    object-fit: cover;
  }
  .avatar.initial {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: var(--ha-space-3, 12px);
    min-width: 0;
    min-height: var(--wh-node);
    margin: 0 calc(-1 * var(--ha-space-2, 8px)) var(--ha-space-2, 8px);
    padding: 0 var(--ha-space-2, 8px) var(--ha-space-1, 4px);
    border-radius: var(--ha-border-radius-md, 8px);
    outline: none;
  }
  .row.clickable {
    cursor: pointer;
  }
  .row.clickable:hover {
    background: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
  }
  .row.clickable:active {
    background: color-mix(in srgb, var(--primary-text-color) 12%, transparent);
  }
  .row.clickable:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  .body {
    min-width: 0;
    flex: 1;
    /* Center the first line against the icon. */
    padding-top: var(--ha-space-1, 4px);
  }
  .primary {
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-normal, 400);
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
  .subject {
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .secondary {
    margin-top: 2px;
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    text-underline-offset: 2px;
    cursor: pointer;
  }
  .link:hover {
    color: var(--primary-text-color);
    text-decoration-color: currentColor;
  }
  .link:focus-visible {
    outline: 2px solid var(--primary-color);
    border-radius: 2px;
  }
  .effects {
    list-style: none;
    margin: var(--ha-space-2, 8px) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1, 4px);
  }
  .effect {
    display: flex;
    align-items: flex-start;
    gap: var(--ha-space-2, 8px);
    padding: 2px var(--ha-space-1, 4px);
    margin: 0 calc(-1 * var(--ha-space-1, 4px));
    border-radius: var(--ha-border-radius-sm, 4px);
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    line-height: 1.3;
    outline: none;
  }
  .effect.clickable {
    cursor: pointer;
  }
  .effect.clickable:hover {
    background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  }
  .effect.clickable:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  .e-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    color: var(--accent);
    --mdc-icon-size: 16px;
  }
  .e-icon ha-state-icon,
  .e-icon ha-icon {
    display: block;
    width: 16px;
    height: 16px;
  }
  .e-name {
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .e-count {
    color: var(--wh-secondary);
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .e-details {
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-s, 12px);
  }
  .group-caption {
    display: flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    outline: none;
    margin-left: calc(-1 * var(--ha-space-1, 4px));
    border-radius: var(--ha-border-radius-sm, 4px);
  }
  .group-caption:hover {
    color: var(--primary-text-color);
  }
  .group-caption:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  .group-caption .chevron {
    --mdc-icon-size: 16px;
    width: 16px;
    height: 16px;
  }
  .group-members {
    list-style: none;
    margin: var(--ha-space-1, 4px) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-1, 4px);
    border-left: 2px solid var(--divider-color);
    padding-left: var(--ha-space-2, 8px);
  }
  .group-member {
    display: flex;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    padding: 2px var(--ha-space-1, 4px);
    margin: 0 calc(-1 * var(--ha-space-1, 4px));
    border-radius: var(--ha-border-radius-sm, 4px);
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 1.3;
    outline: none;
  }
  .group-member.clickable {
    cursor: pointer;
  }
  .group-member.clickable:hover {
    background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  }
  .group-member.clickable:focus-visible {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
  .gm-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
    --mdc-icon-size: 14px;
  }
  .gm-icon ha-state-icon,
  .gm-icon ha-icon {
    display: block;
    width: 14px;
    height: 14px;
  }
  .gm-text {
    flex: 1;
    min-width: 0;
  }
  .gm-name {
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .gm-time {
    flex: none;
    font-variant-numeric: tabular-nums;
  }
  .count {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    height: 20px;
    margin-left: var(--ha-space-1, 4px);
    padding: 0 var(--ha-space-2, 8px);
    border: 1px solid var(--ha-card-border-color, var(--divider-color));
    border-radius: var(--ha-border-radius-pill, 9999px);
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1;
    vertical-align: 1px;
  }

  /* Trailing meta */
  .time {
    flex: none;
    padding-top: var(--ha-space-1, 4px);
    text-align: right;
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 1.3;
  }
  .time .abs {
    display: block;
    color: var(--primary-text-color);
    font-weight: var(--ha-font-weight-medium, 500);
    font-variant-numeric: tabular-nums;
  }

  .state {
    padding: var(--ha-space-8, 32px) var(--ha-space-2, 8px);
    text-align: center;
    color: var(--wh-secondary);
    font-size: var(--ha-font-size-m, 14px);
  }
  .state ha-icon {
    display: block;
    margin: 0 auto var(--ha-space-2, 8px);
    --mdc-icon-size: 36px;
    color: var(--disabled-text-color);
  }

  ha-card.compact .body,
  ha-card.compact .time {
    padding-top: 0;
  }
  ha-card.compact .row {
    margin-bottom: var(--ha-space-1, 4px);
  }

  @container wh (max-width: 340px) {
    .row {
      flex-direction: column;
      gap: 0;
    }
    .time {
      display: flex;
      gap: var(--ha-space-2, 8px);
      padding-top: 0;
      text-align: left;
    }
    .time .abs {
      display: inline;
    }
    .body {
      padding-top: var(--ha-space-1, 4px);
    }
    .item {
      column-gap: var(--ha-space-2, 8px);
    }
  }
`;
function L(t) {
  return t == null ? [] : Array.isArray(t) ? t : [t];
}
function Gn(t) {
  return t ? Object.values(t).some((e) => L(e).length > 0) : !1;
}
function Et(t, e) {
  const n = /* @__PURE__ */ new Set(), s = t.entities ?? {}, i = t.devices ?? {}, o = t.areas ?? {}, r = new Set(L(e.area_id));
  for (const d of L(e.floor_id))
    for (const l of Object.values(o))
      l.floor_id === d && r.add(l.area_id);
  const a = new Set(L(e.device_id)), c = new Set(L(e.label_id));
  for (const d of L(e.entity_id)) n.add(d);
  for (const d of Object.values(s)) {
    const l = d.device_id ? i[d.device_id] : void 0, p = d.area_id ?? l?.area_id ?? void 0;
    p && r.has(p) && n.add(d.entity_id), d.device_id && a.has(d.device_id) && n.add(d.entity_id), d.labels?.some((_) => c.has(_)) && n.add(d.entity_id), l?.labels?.some((_) => c.has(_)) && n.add(d.entity_id);
  }
  return n;
}
const Fn = /\b([a-z_]+)\.([a-z0-9_]+)\b/g;
function It(t, e) {
  return e.replace(Fn, (n) => t.states[n]?.attributes.friendly_name ?? n);
}
function Kn(t, e) {
  for (const [n, s] of Object.entries(t.states))
    if (n.startsWith("person.") && s.attributes.user_id === e)
      return {
        entityId: n,
        name: s.attributes.friendly_name ?? n,
        picture: s.attributes.entity_picture
      };
}
function Ie(t) {
  if (t)
    return t.match(/\b[a-z_]+\.[a-z0-9_]+\b/)?.[0];
}
function Yn(t) {
  if (t.context_source) return t.context_source;
  if (t.context_message?.startsWith("triggered by "))
    return t.context_message.slice(13);
}
function Ct(t) {
  return t.replace(/event 'automation_triggered'/g, "another automation");
}
function qn(t, e) {
  let n = e.context_source;
  return !n && e.context_message?.startsWith("triggered by ") && (n = e.context_message.slice(13)), n ? Ct(It(t, n)) : void 0;
}
function Jn(t, e) {
  const n = Kn(t, e);
  return n ? { kind: "user", name: n.name, entityId: n.entityId, picture: n.picture } : t.user && t.user.id === e ? { kind: "user", name: t.user.name } : { kind: "user", name: "A user" };
}
function st(t, e, n) {
  return (e ? t.states[e]?.attributes.friendly_name : void 0) ?? n ?? e ?? "Unknown";
}
function Xn(t, e) {
  const n = e.context_event_type;
  if (n === "automation_triggered" || n === "script_started")
    return {
      actor: {
        kind: n === "automation_triggered" ? "automation" : "script",
        name: st(
          t,
          e.context_entity_id,
          e.context_name ?? e.context_entity_id_name
        ),
        entityId: e.context_entity_id
      },
      trigger: qn(t, e),
      triggerEntityId: Ie(Yn(e))
    };
  if (e.context_user_id) {
    const s = Jn(t, e.context_user_id);
    return e.context_domain && e.context_service && (s.detail = `${e.context_domain}.${e.context_service}`), { actor: s };
  }
  if (n === "call_service" && e.context_domain && e.context_service) {
    const s = `${e.context_domain}.${e.context_service}`;
    return e.context_domain === "scene" ? { actor: { kind: "scene", name: "A scene", detail: s } } : { actor: { kind: "service", name: s, detail: s } };
  }
  if (n === "logbook_entry" && e.context_name)
    return { actor: { kind: "other", name: e.context_name } };
  if (e.context_entity_id)
    return { actor: {
      kind: "entity",
      name: st(t, e.context_entity_id, e.context_entity_id_name),
      entityId: e.context_entity_id,
      detail: e.context_message
    } };
  if (e.context_name)
    return { actor: { kind: "other", name: e.context_name } };
}
function Zn(t, e) {
  const n = e.source ?? (e.message?.startsWith("triggered by ") ? e.message.slice(13) : void 0);
  return n ? Ct(It(t, n)) : void 0;
}
const Qn = 9e4;
function es(t, e) {
  return e.map((n) => t.states[n]?.attributes.friendly_name ?? n).join(", ");
}
function ts(t, e, n, s, i, o, r) {
  const a = s.kind === "say";
  return {
    key: `action|${e.key}|${i}`,
    when: e.when,
    entityId: a ? s.speakers[0] : void 0,
    domain: a ? "media_player" : "notify",
    name: a ? s.speakers.length ? es(t, s.speakers) : "Speaker" : "Notification",
    verb: a ? `said “${s.text}”` : `sent “${s.title ? `${s.title}: ` : ""}${s.text}”`,
    tone: "active",
    icon: a ? "mdi:bullhorn" : "mdi:bell-ring",
    fixedIcon: !0,
    isPerson: !1,
    isRun: !1,
    count: 1,
    rich: !0,
    cause: {
      actor: n,
      by: r,
      trigger: e.cause?.trigger,
      triggerEntityId: e.cause?.triggerEntityId
    },
    accent: P("media_player", void 0, "playing", "active", o)
  };
}
function ns(t, e, n, s, i, o = /* @__PURE__ */ new Set()) {
  const r = /* @__PURE__ */ new Set(), a = [];
  for (const c of e) {
    if (!c.isRun || c.rich || (n !== "all" && !(c.entityId && o.has(c.entityId)) && r.add(c), n === "none" || !i)) continue;
    const d = i(c) ?? [], l = c.domain === "script" ? "script" : "automation", p = { kind: l, name: c.name, entityId: c.entityId, icon: Ee[l] }, _ = c.cause?.actor?.kind === "user" ? c.cause.actor : void 0, u = _ ? p : c.cause?.actor ?? p, g = /* @__PURE__ */ new Set([c.entityId, u.entityId]);
    d.forEach((b, k) => {
      a.push(ts(t, c, u, b, k, s, _));
      for (const x of e)
        x !== c && x.entityId && b.speakers.includes(x.entityId) && g.has(x.cause?.actor?.entityId) && Math.abs(x.when - c.when) <= Qn && r.add(x);
    });
  }
  return [...e.filter((c) => !r.has(c)), ...a];
}
const ss = /* @__PURE__ */ new Set([
  "light",
  "switch",
  "fan",
  "cover",
  "lock",
  "climate",
  "humidifier",
  "water_heater",
  "valve",
  "siren",
  "alarm_control_panel",
  "media_player",
  "vacuum",
  "lawn_mower",
  "person",
  "device_tracker",
  // folded into its person (see people.ts), never listed alone
  "scene",
  "event",
  "doorbell",
  "homeassistant"
]), is = /* @__PURE__ */ new Set([
  "input_boolean",
  "input_select",
  "input_number",
  "input_text",
  "input_datetime",
  "input_button",
  "button",
  "counter",
  "timer",
  "group",
  "remote",
  "automation",
  "script"
]), os = /* @__PURE__ */ new Set([
  "door",
  "garage_door",
  "opening",
  "window",
  "lock",
  "motion",
  "moving",
  "occupancy",
  "presence",
  "smoke",
  "gas",
  "carbon_monoxide",
  "moisture",
  "problem",
  "safety",
  "tamper",
  "vibration",
  "sound",
  "plug"
]), rs = /* @__PURE__ */ new Set(["person", "device_tracker", "homeassistant"]), it = /* @__PURE__ */ new WeakMap();
function z(t, e) {
  const n = it.get(t);
  if (n && n.entities === e?.entities && n.devices === e?.devices) return n.ids;
  const s = new Set([t.target?.entity_id ?? [], t.also_show_entities ?? []].flat());
  if (e && t.also_show_labels?.length)
    for (const i of Et(e, { label_id: t.also_show_labels }))
      s.add(i);
  return it.set(t, { entities: e?.entities, devices: e?.devices, ids: s }), s;
}
function as(t, e, n) {
  if (!t.hide_devices?.length) return !1;
  const s = e?.entities?.[n]?.device_id;
  return !s || !t.hide_devices.includes(s) ? !1 : !z(t, e).has(n);
}
function Ce(t) {
  const e = t.domain ?? t.entity_id?.split(".")[0];
  return (e === "automation" || e === "script") && t.state === void 0 && t.message !== void 0;
}
function Tt(t) {
  return !!(t.context_user_id || t.context_event_type || t.context_entity_id || t.context_name || t.context_service);
}
function cs(t, e, n) {
  const s = t.domain ?? t.entity_id?.split(".")[0] ?? "homeassistant";
  if (t.entity_id && z(e, n).has(t.entity_id) || e.also_show_domains?.includes(s) || e.include_domains?.length || Ce(t)) return !0;
  if (is.has(s)) return !!t.context_user_id;
  if (s === "binary_sensor") {
    const i = t.entity_id && n?.states[t.entity_id]?.attributes.device_class;
    return i ? os.has(i) : Tt(t);
  }
  return ss.has(s);
}
const ot = {
  red: "#f44336",
  pink: "#e91e63",
  purple: "#926bc7",
  "deep-purple": "#6e41ab",
  indigo: "#3f51b5",
  blue: "#2196f3",
  "light-blue": "#03a9f4",
  cyan: "#00bcd4",
  teal: "#009688",
  green: "#4caf50",
  "light-green": "#8bc34a",
  lime: "#cddc39",
  yellow: "#ffeb3b",
  amber: "#ffc107",
  orange: "#ff9800",
  "deep-orange": "#ff6f22",
  brown: "#795548",
  "light-grey": "#bdbdbd",
  grey: "#9e9e9e",
  "dark-grey": "#606060",
  "blue-grey": "#607d8b",
  black: "#000000",
  white: "#ffffff"
};
function ds(t) {
  const e = t.trim();
  return e in ot ? `var(--${e}-color, ${ot[e]})` : e === "primary" ? "var(--primary-color)" : e;
}
function rt(t, e, n) {
  if (!t?.length) return;
  let s, i;
  for (const r of t)
    !r?.match || !r.color || (r.match.includes(".") ? r.match === e && (i = r.color) : r.match === n && (s = r.color));
  const o = i ?? s;
  return o ? ds(o) : void 0;
}
function ls(t, e) {
  const n = e.colors;
  if (!n?.length) return t;
  for (const s of t) {
    const i = rt(n, s.entityId, s.domain);
    i && (s.accent = i);
    for (const o of s.effects ?? []) {
      const r = rt(n, o.entityId, o.domain);
      r && (o.accent = r);
    }
  }
  return t;
}
const us = 3e4, hs = 5e3, ps = 1e4, at = 3e4;
function fs(t) {
  return {
    key: t.key,
    domain: t.domain,
    name: t.name,
    verb: t.verb,
    entityId: t.entityId,
    icon: t.icon,
    fixedIcon: t.fixedIcon,
    stateValue: t.stateValue,
    accent: t.accent,
    details: t.details
  };
}
function ms(t) {
  const e = /* @__PURE__ */ new Set(), n = [];
  for (const s of t) {
    const i = s.cause?.actor, o = i?.entityId ?? i?.name;
    i && (i.kind === "automation" || i.kind === "script") && o && !e.has(o) && (e.add(o), n.push(i));
  }
  return n;
}
function ge(t) {
  return t.domain === "script" && !t.isRun && /^was turned (on|off)$/.test(t.verb);
}
function _s(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const s = n.entityId ?? n.name;
    e.has(s) || e.set(s, { ...n, verb: "ran", stateValue: void 0, tone: "active" });
  }
  return [...e.values()];
}
function gs(t) {
  const e = [];
  for (const n of t) {
    const s = e[e.length - 1];
    s && s.name === n.name && s.verb === n.verb && (s.details ?? []).join() === (n.details ?? []).join() ? s.count = (s.count ?? 1) + 1 : e.push({ ...n });
  }
  return e;
}
function vs(t) {
  const e = t.find((s) => s.cause?.by)?.cause?.by, n = ys(t);
  return e || n ? { actor: e, ...n } : void 0;
}
function ys(t) {
  const e = t.find((n) => n.cause?.trigger);
  return e ? {
    trigger: e.cause.trigger,
    triggerEntityId: e.cause.triggerEntityId
  } : void 0;
}
function bs(t, e) {
  const n = t.cause, s = n?.triggerEntityId ?? n?.source?.entityId;
  return s ? `entity|${s}` : e && n?.trigger ? `text|${n.trigger}` : void 0;
}
function ws(t) {
  return t.flatMap((e) => {
    const n = e.some((a) => a.cause?.triggerEntityId ?? a.cause?.source?.entityId), s = (a) => bs(a, !n), i = e.filter((a) => s(a)), o = new Set(i.map((a) => s(a)));
    if (o.size <= 1) return [e];
    const r = new Map([...o].map((a) => [a, []]));
    for (const a of e) {
      let c = s(a);
      if (!c) {
        let d = 1 / 0;
        for (const l of i) {
          const p = Math.abs(l.when - a.when);
          p < d && (d = p, c = s(l));
        }
      }
      r.get(c).push(a);
    }
    return [...r.values()];
  });
}
function $s(t, e) {
  const n = /* @__PURE__ */ new Map();
  for (const a of e) {
    const d = a.cause?.actor;
    if (!d?.entityId || d.kind !== "automation" && d.kind !== "script" || a.effects) continue;
    const l = d.entityId, p = n.get(l);
    p ? p.push(a) : n.set(l, [a]);
  }
  const s = /* @__PURE__ */ new Set(), i = [], o = e.filter((a) => !a.rich && a.cause?.actor?.kind === "service");
  for (const [, a] of n) {
    const c = [...a].sort((l, p) => l.when - p.when), d = [];
    for (const l of c) {
      const p = d[d.length - 1];
      p && l.when - p[p.length - 1].when <= us ? p.push(l) : d.push([l]);
    }
    for (const l of ws(d)) {
      l.sort((y, E) => y.when - E.when);
      const p = l.find((y) => y.cause?.source)?.cause?.source, _ = l.filter(ge), u = l.filter((y) => !_.includes(y));
      if (u.length === 0) continue;
      const g = u.some((y) => y.cause?.by);
      if (u.length < 2 && p?.cause?.actor?.kind !== "user" && !p?.soft && !g)
        continue;
      l.splice(0, l.length, ...u);
      for (const y of o)
        !s.has(y) && !l.includes(y) && y.when >= l[0].when - hs && y.when <= l[l.length - 1].when + ps && l.push(y);
      l.sort((y, E) => y.when - E.when);
      const b = l[0], k = ms(l), x = gs(
        [...l, ..._s(_)].sort((y, E) => y.when - E.when).map(fs)
      );
      let A;
      if (p)
        A = {
          ...p,
          soft: void 0,
          key: `group|${p.key}|${b.key}`,
          effects: x,
          via: k,
          count: 1,
          rich: !0
        };
      else {
        const y = k[0], E = y.kind === "script" ? "script" : "automation";
        A = {
          key: `group|${b.key}`,
          when: b.when,
          entityId: y.entityId,
          domain: E,
          name: y.name,
          verb: "ran",
          tone: "active",
          icon: Ee[E],
          isPerson: !1,
          isRun: !1,
          count: 1,
          rich: !0,
          cause: vs(l),
          effects: x,
          accent: P(E, void 0, "on", "active", !0)
        };
      }
      for (const y of [...l, ..._]) s.add(y);
      if (!p)
        for (const y of e)
          ge(y) && y.entityId === A.entityId && y.when >= b.when - at && y.when <= l[l.length - 1].when + at && s.add(y);
      i.push(A);
    }
  }
  const r = s.size ? [...e.filter((a) => !s.has(a)), ...i] : e;
  return xs(r);
}
function xs(t) {
  const e = t.filter(ge);
  if (!e.length) return t;
  const n = e.filter((o) => o.verb === "was turned on"), s = /* @__PURE__ */ new Set();
  return t.map((o) => {
    if (!e.includes(o)) return o;
    const r = o.entityId ?? o.name;
    return o.verb === "was turned on" ? { ...o, verb: "ran", stateValue: void 0, tone: "active" } : (n.some((c) => (c.entityId ?? c.name) === r && c.when <= o.when) && s.add(o), o);
  }).filter((o) => !s.has(o));
}
const ks = 6e4;
function oe(t) {
  return (t.activity ?? "meaningful") === "meaningful" && !t.include_domains?.length;
}
function Ss(t, e, n) {
  if (!oe(n)) return e;
  const s = z(n, t);
  for (const i of e) {
    if (i.domain !== "person" || !i.entityId) continue;
    const o = t.states[i.entityId]?.attributes.device_trackers;
    if (!Array.isArray(o)) continue;
    const r = e.find(
      (a) => a.domain === "device_tracker" && a.entityId && o.includes(a.entityId) && a.verb === i.verb && Math.abs(a.when - i.when) <= ks
    );
    !r || i.cause?.actor || (i.cause = { trigger: `device ${r.name}`, triggerEntityId: r.entityId });
  }
  return e.filter(
    (i) => !(i.domain === "device_tracker" && !(i.entityId && s.has(i.entityId)))
  );
}
const ct = {
  // [on verb, off verb, on tone override, off tone override]
  door: ["was opened", "was closed"],
  garage_door: ["was opened", "was closed"],
  opening: ["was opened", "was closed"],
  window: ["was opened", "was closed"],
  lock: ["was unlocked", "was locked"],
  motion: ["detected motion", "motion cleared"],
  moving: ["started moving", "stopped moving"],
  occupancy: ["detected occupancy", "occupancy cleared"],
  presence: ["detected presence", "presence cleared"],
  smoke: ["detected smoke", "smoke cleared", "alert"],
  gas: ["detected gas", "gas cleared", "alert"],
  carbon_monoxide: ["detected carbon monoxide", "carbon monoxide cleared", "alert"],
  moisture: ["detected moisture", "became dry", "alert"],
  problem: ["reported a problem", "problem resolved", "alert"],
  safety: ["is unsafe", "is safe", "alert"],
  tamper: ["detected tampering", "tampering cleared", "alert"],
  connectivity: ["connected", "disconnected"],
  plug: ["was plugged in", "was unplugged"],
  power: ["detected power", "lost power"],
  battery: ["reported low battery", "battery is normal", "alert"],
  battery_charging: ["started charging", "stopped charging"],
  cold: ["got cold", "is no longer cold"],
  heat: ["got hot", "is no longer hot"],
  light: ["detected light", "no longer detects light"],
  sound: ["detected sound", "no longer detects sound"],
  vibration: ["detected vibration", "vibration cleared"],
  running: ["started running", "stopped running"],
  update: ["has an update available", "is up to date"]
}, As = {
  lock: {
    locked: ["was locked", "active"],
    unlocked: ["was unlocked", "inactive"],
    locking: ["is locking", "neutral"],
    unlocking: ["is unlocking", "neutral"],
    open: ["was opened", "inactive"],
    opening: ["is opening", "neutral"],
    jammed: ["is jammed", "alert"]
  },
  cover: {
    open: ["was opened", "active"],
    closed: ["was closed", "inactive"],
    opening: ["started opening", "neutral"],
    closing: ["started closing", "neutral"]
  },
  alarm_control_panel: {
    disarmed: ["was disarmed", "inactive"],
    armed_home: ["was armed (home)", "active"],
    armed_away: ["was armed (away)", "active"],
    armed_night: ["was armed (night)", "active"],
    armed_vacation: ["was armed (vacation)", "active"],
    armed_custom_bypass: ["was armed (custom bypass)", "active"],
    pending: ["is pending", "neutral"],
    arming: ["is arming", "neutral"],
    disarming: ["is disarming", "neutral"],
    triggered: ["was triggered", "alert"]
  },
  media_player: {
    playing: ["started playing", "active"],
    paused: ["paused", "neutral"],
    idle: ["is idle", "inactive"],
    buffering: ["is buffering", "neutral"],
    standby: ["went to standby", "inactive"],
    off: ["was turned off", "inactive"],
    on: ["was turned on", "active"]
  },
  vacuum: {
    cleaning: ["started cleaning", "active"],
    docked: ["returned to its dock", "inactive"],
    returning: ["is returning to its dock", "neutral"],
    paused: ["paused", "neutral"],
    idle: ["is idle", "inactive"],
    error: ["reported an error", "alert"]
  },
  lawn_mower: {
    mowing: ["started mowing", "active"],
    docked: ["returned to its dock", "inactive"],
    paused: ["paused", "neutral"],
    returning: ["is returning to its dock", "neutral"],
    error: ["reported an error", "alert"]
  },
  timer: {
    active: ["started", "active"],
    paused: ["paused", "neutral"],
    idle: ["finished", "inactive"]
  },
  sun: {
    above_horizon: ["rose", "active"],
    below_horizon: ["set", "inactive"]
  }
}, Es = /* @__PURE__ */ new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "humidifier",
  "siren",
  "remote",
  "group",
  "schedule",
  "valve",
  "water_heater",
  "automation",
  "binary_sensor",
  "calendar",
  "update"
]), Is = /* @__PURE__ */ new Set(["person", "device_tracker"]), Cs = /* @__PURE__ */ new Set(["button", "input_button", "doorbell"]), Ts = {
  ring: ["rang", "active"],
  motion: ["detected motion", "active"],
  camera_motion: ["detected motion", "active"],
  person: ["detected a person", "active"],
  camera_person: ["detected a person", "active"],
  sound: ["detected sound", "active"],
  camera_sound: ["detected sound", "active"],
  press: ["was pressed", "active"],
  initial_press: ["was pressed", "active"],
  single_press: ["was pressed", "active"],
  short_press: ["was pressed", "active"],
  double_press: ["was double-pressed", "active"],
  triple_press: ["was triple-pressed", "active"],
  long_press: ["was long-pressed", "active"]
}, Ms = {
  doorbell: "rang",
  motion: "detected motion",
  button: "was pressed"
};
function Os(t, e, n) {
  if (e) {
    const i = Ts[e];
    if (i) return { verb: $(i[0], n), tone: i[1] };
    const o = e.replace(/_/g, " ");
    return {
      verb: $("reported {text}", n, { text: o }),
      tone: /(error|fail)/i.test(o) ? "alert" : "active"
    };
  }
  const s = t ? Ms[t] : void 0;
  return { verb: $(s ?? "detected an event", n), tone: "active" };
}
function Te(t) {
  const e = t.replace(/_/g, " ");
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function Rs(t, e, n) {
  const s = t.states[e];
  if (s && t.formatEntityState)
    try {
      const r = t.formatEntityState({ ...s, state: n }, n);
      if (r) return r;
    } catch {
    }
  const i = s?.attributes.unit_of_measurement;
  return n !== "" && !Number.isNaN(Number(n)) ? i ? `${n} ${i}` : n : Te(n);
}
function Ps(t, e) {
  return Object.values(t.states).find(
    (s) => s.entity_id.startsWith("zone.") && (s.attributes.friendly_name ?? "").toLowerCase() === e.toLowerCase()
  )?.attributes.friendly_name ?? Te(e);
}
function Ds(t, e, n, s, i) {
  const o = t.locale?.language;
  if (s === "unavailable") return { verb: $("became unavailable", o), tone: "unavailable" };
  if (s === "unknown") return { verb: $("became unknown", o), tone: "neutral" };
  const a = (n ? t.states[n] : void 0)?.attributes.device_class;
  if (e === "event") return Os(a, i, o);
  if (Is.has(e))
    return s === "home" ? { verb: $("arrived home", o), tone: "active" } : s === "not_home" ? { verb: $("left home", o), tone: "inactive" } : { verb: $("arrived at {zone}", o, { zone: Ps(t, s) }), tone: "active" };
  if (e === "binary_sensor" && a && ct[a]) {
    const [l, p, _, u] = ct[a];
    if (s === "on") return { verb: $(l, o), tone: _ ?? "active" };
    if (s === "off")
      return { verb: $(p, o), tone: u ?? "inactive" };
  }
  const c = As[e]?.[s];
  if (c) return { verb: $(c[0], o), tone: c[1] };
  if (Cs.has(e)) return { verb: $("was pressed", o), tone: "active" };
  if (e === "scene") return { verb: $("was activated", o), tone: "active" };
  if (e === "climate" && s === "off")
    return { verb: $("was turned off", o), tone: "inactive" };
  if (Es.has(e) || s === "on" || s === "off") {
    if (s === "on") return { verb: $("was turned on", o), tone: "active" };
    if (s === "off") return { verb: $("was turned off", o), tone: "inactive" };
  }
  const d = n ? Rs(t, n, s) : Te(s);
  return { verb: $("changed to {value}", o, { value: Ae(d, 80) }), tone: "neutral" };
}
const w = {
  hours_to_show: 24,
  max_entries: 50,
  order: "newest_first",
  show_cause: !0,
  show_avatars: !0,
  show_day_headers: !0,
  state_color: !0,
  compact: !1,
  time_display: "both",
  tap_action: "more-info",
  vacuum_details: !0,
  hide_unavailable: !0,
  activity: "meaningful",
  automation_runs: "actions",
  show_actions: !0,
  chatty: "summarize",
  show_diagnostic: !1,
  collapse_repeats: !0,
  group_device_actions: !0,
  group_window_minutes: 3
}, I = { hours: [1, 720], entries: [1, 500], groupWindow: [1, 60] }, dt = 60 * 1e3, Ns = 10 * 60 * 1e3, lt = 5 * 60 * 1e3;
function X(t) {
  return [t.when, t.entity_id ?? t.name, t.state ?? t.message, t.context_id].map((e) => e ?? "").join("|");
}
function Me(t, [e, n], s) {
  const i = typeof t == "number" ? t : Number(t);
  return Number.isFinite(i) ? Math.min(n, Math.max(e, Math.round(i))) : s;
}
function ve(t) {
  return Me(t.hours_to_show, I.hours, w.hours_to_show);
}
function zs(t) {
  return Me(t.max_entries, I.entries, w.max_entries);
}
function js(t) {
  return Me(t.group_window_minutes, I.groupWindow, w.group_window_minutes);
}
function Oe(t) {
  return t.domain ?? t.entity_id?.split(".")[0] ?? "homeassistant";
}
const Mt = /* @__PURE__ */ new Set(["unavailable", "unknown"]);
function ye(t, e, n, s, i = !1, o = !1) {
  const r = Oe(t);
  if (!i && s && t.entity_id && !(e.show_diagnostic ?? w.show_diagnostic)) {
    const c = s.entities?.[t.entity_id], d = z(e, s).has(t.entity_id);
    if (c && (c.entity_category || c.hidden) && !d) return !1;
  }
  return !(n && (!t.entity_id || !n.has(t.entity_id)) || t.entity_id && e.exclude_entities?.includes(t.entity_id) || e.include_domains?.length && !e.include_domains.includes(r) || e.exclude_domains?.includes(r) || t.entity_id && as(e, s, t.entity_id) || !i && (e.activity ?? w.activity) === "meaningful" && !cs(t, e, s) || (e.hide_unavailable ?? w.hide_unavailable) && !o && Mt.has(t.state ?? ""));
}
function Us(t) {
  return !!(t.context_user_id || t.context_service || t.context_event_type);
}
function Hs(t) {
  const e = /* @__PURE__ */ new Map();
  for (const s of t) {
    if (!s.entity_id || s.state === void 0 || s.message !== void 0) continue;
    const i = e.get(s.entity_id);
    i ? i.push(s) : e.set(s.entity_id, [s]);
  }
  const n = /* @__PURE__ */ new Set();
  for (const s of e.values()) {
    s.sort((r, a) => r.when - a.when);
    let i, o = !1;
    for (const r of s) {
      if (Mt.has(r.state)) {
        o = !0;
        continue;
      }
      o && i === r.state && !Us(r) && n.add(X(r)), i = r.state, o = !1;
    }
  }
  return n;
}
function Ls(t, e, n) {
  const s = Oe(e), i = e.entity_id ? t.states[e.entity_id] : void 0, o = e.name ?? i?.attributes.friendly_name ?? e.entity_id ?? "Home Assistant";
  let r, a = "neutral", c = Xn(t, e);
  if (e.state !== void 0 && e.message === void 0)
    ({ verb: r, tone: a } = Ds(
      t,
      s,
      e.entity_id,
      e.state,
      e.attributes?.event_type
    ));
  else {
    const u = e.message ?? "did something";
    if (u.match(/^triggered(?: by (.+))?$/)) {
      r = "was triggered", a = "active";
      const b = Zn(t, e);
      if (b) {
        const k = e.source ?? u.replace(/^triggered by /, "");
        c = { ...c, trigger: b, triggerEntityId: Ie(k) };
      }
    } else
      r = u, a = /(error|fail)/i.test(u) ? "alert" : "neutral";
  }
  const d = c?.actor;
  d && !d.icon && (d.icon = Ee[d.kind]);
  const l = s === "person", p = l ? i?.attributes.entity_picture : void 0, _ = n.state_color ?? w.state_color;
  return {
    key: X(e),
    when: e.when * 1e3,
    entityId: e.entity_id,
    domain: s,
    name: o,
    verb: r,
    tone: a,
    icon: Rn(s, e.icon),
    stateValue: e.state,
    picture: p,
    isPerson: l,
    isRun: Ce(e),
    cause: c,
    count: 1,
    accent: P(s, i?.attributes.device_class, e.state, a, _)
  };
}
function ut(t) {
  const e = t.cause;
  return `${e?.actor?.kind ?? ""}:${e?.actor?.name ?? ""}:${e?.trigger ?? ""}`;
}
function Ws(t, e) {
  if (!e || !t.entity_id || !e.vacuums.has(t.entity_id)) return !1;
  const n = Dn[t.state ?? ""];
  return n ? e.items.some(
    (s) => s.entityId === t.entity_id && s.phase === n && Math.abs(s.when - t.when * 1e3) <= Nn
  ) : !1;
}
function Vs(t, e = !0, n = /* @__PURE__ */ new Set()) {
  const s = /* @__PURE__ */ new Set();
  for (const i of t) {
    const o = i.cause?.actor;
    if (!o?.entityId || o.kind !== "automation" && o.kind !== "script") continue;
    for (const c of t)
      e && c.isRun && !(c.entityId && n.has(c.entityId)) && c.entityId === o.entityId && Math.abs(c.when - i.when) <= dt && s.add(c);
    const r = i.cause?.triggerEntityId;
    if (!r) continue;
    const a = t.find(
      (c) => c !== i && !c.isRun && c.entityId === r && c.when <= i.when + 5e3 && i.when - c.when <= dt
    );
    a && (s.add(a), i.cause = { ...i.cause, trigger: `${a.name} ${a.verb}`, source: a });
  }
  return t.filter((i) => !s.has(i));
}
function Bs(t, e, n) {
  return oe(n) ? An(t, e, z(n, t)) : e;
}
const Gs = /* @__PURE__ */ new Set(["motion", "occupancy", "presence", "moving"]);
function Fs(t, e) {
  if (t.domain === "light") return 4;
  if (t.domain === "binary_sensor") {
    const n = t.entityId && e.states[t.entityId]?.attributes.device_class;
    if (n && Gs.has(n)) return 4;
  }
  return 2;
}
function Ks(t, e, n) {
  if (!(n.group_device_actions ?? w.group_device_actions)) return e;
  const s = js(n) * 6e4, i = z(n, t);
  function o(d) {
    if (d.rich || !d.entityId || i.has(d.entityId)) return;
    const l = t.entities?.[d.entityId];
    if (l)
      return l.device_id ? `device|${l.device_id}` : l.device_id === null ? `entity|${d.entityId}` : void 0;
  }
  const r = /* @__PURE__ */ new Map(), a = [];
  for (const d of e) {
    const l = o(d);
    if (!l) continue;
    const p = r.get(l);
    if (p && p.oldest - d.when <= s)
      p.members.push(d), p.oldest = d.when;
    else {
      const _ = { members: [d], oldest: d.when };
      r.set(l, _), a.push(_);
    }
  }
  const c = /* @__PURE__ */ new Map();
  for (const { members: d } of a) {
    const l = Math.max(...d.map((u) => Fs(u, t)));
    if (d.length < l) continue;
    const [p, ..._] = d;
    c.set(p, {
      ...p,
      key: `devgroup|${p.key}`,
      group: [..._].reverse(),
      // oldest first
      groupCount: d.length
    });
    for (const u of _) c.set(u, null);
  }
  return c.size === 0 ? e : e.flatMap((d) => {
    if (!c.has(d)) return [d];
    const l = c.get(d);
    return l ? [l] : [];
  });
}
function Ys(t, e, n, s, i, o, r) {
  const a = s - ve(n) * 36e5, c = zs(n), d = n.collapse_repeats ?? w.collapse_repeats, l = t.locale?.language, p = (o?.items ?? []).filter(
    (h) => h.when >= a && h.when <= s + lt
  ), _ = o ? { items: p, vacuums: o.vacuums } : void 0, u = [...e], g = u.filter((h) => h.domain === "homeassistant" && h.message === "started").map((h) => h.when), b = z(n, t), k = n.hide_unavailable ?? w.hide_unavailable ? Hs(u) : /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Map();
  for (const h of u) {
    const v = Ce(h) ? h.source ?? h.message?.replace(/^triggered by /, "") : h.context_event_type === "automation_triggered" || h.context_event_type === "script_started" ? h.context_source ?? h.context_message?.replace(/^triggered by /, "") : void 0, S = Ie(v);
    S && x.set(S, [...x.get(S) ?? [], h.when]);
  }
  const A = (h) => !!h.entity_id && (x.get(h.entity_id) ?? []).some((v) => h.when <= v + 5 && v - h.when <= 60), y = /* @__PURE__ */ new Set(), E = (h) => (n.activity ?? w.activity) !== "meaningful" ? !1 : h.domain === "homeassistant" ? h.message === "stopped" && g.some((v) => v >= h.when && v - h.when <= 900) : Tt(h) || A(h) || h.entity_id && b.has(h.entity_id) || rs.has(h.domain ?? h.entity_id?.split(".")[0] ?? "") ? !1 : g.some((v) => h.when >= v - 30 && h.when <= v + 180), de = /* @__PURE__ */ new Set(), le = /* @__PURE__ */ new Map();
  for (const h of u) {
    if (Oe(h) !== "event" || !h.entity_id || h.state === void 0 || h.state === "unavailable" || h.state === "unknown")
      continue;
    const v = `${h.entity_id}|${h.state}`, S = le.get(v);
    S ? h.when < S.when ? (de.add(S), le.set(v, h)) : de.add(h) : le.set(v, h);
  }
  const Ot = u.filter((h) => !de.has(h)).filter((h) => {
    const v = h.when * 1e3;
    return v >= a && v <= s + lt;
  }).filter((h) => ye(h, n, i, t) ? !0 : oe(n) && A(h) && ye(h, n, i, t, !0) ? (y.add(X(h)), !0) : !1).filter((h) => !k.has(X(h))).filter((h) => !E(h)).filter((h) => !Ws(h, _)).sort((h, v) => v.when - h.when), Pe = n.automation_runs ?? w.automation_runs, Rt = ns(
    t,
    [
      ...Ot.map((h) => {
        const v = Ls(t, h, n);
        return y.has(v.key) && (v.soft = !0), v;
      }),
      ...p
    ],
    Pe,
    n.state_color ?? w.state_color,
    n.show_actions === !1 ? void 0 : r,
    b
  ).sort((h, v) => v.when - h.when), Pt = Vs(Rt, Pe !== "all", b).filter((h) => !h.soft), De = kn(
    yn(
      Bs(t, Ss(t, Pt, n), n),
      n.chatty ?? w.chatty,
      b,
      l
    ),
    l
  ), Dt = ls(
    (oe(n) ? $s(t, De) : De).sort(
      (h, v) => v.when - h.when
    ),
    n
  ), G = [];
  let ue = 0;
  for (const h of Dt) {
    const v = G[G.length - 1];
    if (d && v && !h.rich && !v.rich && h.entityId && v.entityId === h.entityId && v.verb === h.verb && ut(v) === ut(h) && ue - h.when <= Ns) {
      v.count += 1, ue = h.when;
      continue;
    }
    if (G.push(h), ue = h.when, G.length > c) break;
  }
  const Ne = Ks(t, G, n).slice(0, c);
  (n.order ?? w.order) === "oldest_first" && Ne.reverse();
  const Q = [];
  for (const h of Ne) {
    const v = ln(h.when);
    let S = Q[Q.length - 1];
    (!S || S.key !== v) && (S = { key: v, label: fn(h.when, s, t), items: [] }, Q.push(S)), S.items.push(h);
  }
  return Q;
}
function qs(t) {
  let e = t.text ?? `${t.name} ${t.verb}`;
  t.count > 1 && (e += ` ${t.count} times`);
  const n = t.cause;
  return n?.actor && (e += ` by ${n.actor.name}`), n?.trigger && (e += `, triggered by ${n.trigger}`), t.details?.length && (e += ` (${t.details.join(", ")})`), t.effects?.length && (e += `. ${t.effects.map((s) => `${s.name} ${s.verb}`).join(". ")}`), e;
}
var Js = Object.defineProperty, Xs = Object.getOwnPropertyDescriptor, j = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? Xs(e, n) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (i = (s ? r(e, n, i) : r(i)) || i);
  return s && i && Js(e, n, i), i;
};
const ht = 3e3, Zs = 6e4;
let C = class extends W {
  constructor() {
    super(...arguments), this._groups = [], this._loading = !0, this._now = Date.now(), this._expandedGroups = /* @__PURE__ */ new Set(), this._entries = /* @__PURE__ */ new Map(), this._subToken = 0, this._vacuums = /* @__PURE__ */ new Map(), this._vacUnsubs = [], this._vacToken = 0, this._traceBudget = 0, this._registryRefs = [], this._resolveRun = (t) => {
      const e = this._hass;
      if (!e || !t.entityId) return;
      const n = this._traces ??= new Mn(e), s = n.lookup(t.entityId, t.when, 15e3);
      if (s) return In(s);
      this._traceBudget-- > 0 && n.ensure(t.entityId, t.when, 15e3)?.then(() => this._scheduleRecompute());
    };
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => ci), document.createElement("what-happened-card-editor");
  }
  static getStubConfig() {
    return { title: "What happened", hours_to_show: 24, max_entries: 50 };
  }
  setConfig(t) {
    if (!t || typeof t != "object") throw new Error("Invalid configuration");
    if (t.target !== void 0 && (typeof t.target != "object" || t.target === null))
      throw new Error("`target` must be an object with entity_id, device_id, area_id or label_id");
    this._config = { ...t }, this._subKey = void 0, this._vacKey = void 0, this._ensureSubscription(), this._scheduleRecompute();
  }
  set hass(t) {
    const e = !this._hass;
    this._hass = t, this._traces?.setHass(t);
    const n = [t.entities, t.devices, t.areas], s = n.some((i, o) => i !== this._registryRefs[o]);
    this._registryRefs = n, (e || s) && (this._ensureSubscription(), this._scheduleRecompute());
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    const t = this._config;
    if (t?.max_height) return Math.max(3, Math.ceil(t.max_height / 50));
    const e = this._groups.reduce((n, s) => n + s.items.length, 0);
    return Math.min(12, Math.max(3, Math.ceil(e * 1.2) + 1));
  }
  /** Sections view: default size and resize limits (users resize with the handles). */
  getGridOptions() {
    return { columns: 12, rows: 6, min_columns: 3, min_rows: 2 };
  }
  connectedCallback() {
    super.connectedCallback(), this._tick = window.setInterval(() => {
      this._now = Date.now(), this._refreshHistories(), this._recompute();
    }, Zs), this._hass && this._config && (this._subKey = void 0, this._vacKey = void 0, this._ensureSubscription(), this._scheduleRecompute());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.clearInterval(this._tick), window.clearTimeout(this._recomputeTimer), this._unsubscribe(), this._unsubscribeVacuums(), this._subKey = void 0, this._vacKey = void 0;
  }
  // ---------------------------------------------------------------- data
  _unsubscribe() {
    this._subToken++, this._unsub?.(), this._unsub = void 0;
  }
  _ensureSubscription() {
    this._ensureLogbook(), this._ensureVacuums();
  }
  // ----------------------------------------------- TapoVac-ADV (tapo_rv30)
  _unsubscribeVacuums() {
    this._vacToken++;
    for (const t of this._vacUnsubs) t();
    this._vacUnsubs = [];
  }
  _vacuumVisible(t, e) {
    return this._allowed && !this._allowed.has(t) || e.exclude_entities?.includes(t) || e.include_domains?.length && !e.include_domains.includes("vacuum") ? !1 : !e.exclude_domains?.includes("vacuum");
  }
  _ensureVacuums() {
    const t = this._hass, e = this._config;
    if (!t || !e || !this.isConnected) return;
    const n = e.vacuum_details === !1 ? [] : jn(t).filter((o) => this._vacuumVisible(o, e)), s = JSON.stringify([...n].sort());
    if (s === this._vacKey) return;
    this._vacKey = s, this._unsubscribeVacuums(), this._vacuums.clear();
    const i = this._vacToken;
    for (const o of n) {
      const r = { entityId: o, log: [], runs: [] };
      this._vacuums.set(o, r), t.connection.subscribeMessage(
        (a) => {
          i === this._vacToken && (r.log = a.log ?? [], this._refreshHistory(r), this._scheduleRecompute());
        },
        { type: "tapo_rv30/planner/subscribe", entity_id: o }
      ).then((a) => {
        i !== this._vacToken ? a() : this._vacUnsubs.push(a);
      }).catch(() => {
      }), this._refreshHistory(r);
    }
  }
  _refreshHistory(t) {
    const e = this._hass;
    if (!e) return;
    const n = this._vacToken;
    e.callWS({ type: "tapo_rv30/history/list", entity_id: t.entityId }).then((s) => {
      n === this._vacToken && (t.runs = (s.runs ?? []).filter((i) => i.started), this._scheduleRecompute());
    }).catch(() => {
    });
  }
  _refreshHistories() {
    for (const t of this._vacuums.values()) this._refreshHistory(t);
  }
  _ensureLogbook() {
    const t = this._hass, e = this._config;
    if (!t || !e || !this.isConnected) return;
    let n;
    Gn(e.target) && (n = Et(t, e.target));
    const s = ve(e), i = JSON.stringify([s, n ? [...n].sort() : null]);
    if (i === this._subKey) {
      this._allowed = n;
      return;
    }
    if (this._subKey = i, this._allowed = n, this._unsubscribe(), this._entries.clear(), this._error = void 0, n && n.size === 0) {
      this._loading = !1;
      return;
    }
    this._loading = !0;
    const o = this._subToken, r = new Date(Date.now() - s * 36e5);
    mn(
      t,
      (a) => {
        if (o !== this._subToken) return;
        const c = this._config;
        for (const d of a)
          c && !ye(d, c, this._allowed, this._hass, !1, !0) || this._entries.set(X(d), d);
        this._entries.size > ht && this._trimBuffer(), this._loading = !1, this._scheduleRecompute();
      },
      r,
      n ? [...n] : void 0
    ).then((a) => {
      o !== this._subToken ? a() : this._unsub = a;
    }).catch((a) => {
      o === this._subToken && (this._loading = !1, this._error = a instanceof Error ? a.message : "Could not load the logbook");
    });
  }
  _trimBuffer() {
    const t = [...this._entries.entries()].sort((e, n) => n[1].when - e[1].when);
    this._entries = new Map(t.slice(0, ht));
  }
  _scheduleRecompute() {
    window.clearTimeout(this._recomputeTimer), this._recomputeTimer = window.setTimeout(() => this._recompute(), 50);
  }
  _recompute() {
    if (!this._hass || !this._config) return;
    this._now = Date.now(), this._traceBudget = 40;
    const t = Ys(
      this._hass,
      this._entries.values(),
      this._config,
      this._now,
      this._allowed,
      this._extraItems(),
      this._resolveRun
    );
    this._groups = t;
  }
  _extraItems() {
    const t = this._hass, e = this._config, n = /* @__PURE__ */ new Set(), s = [];
    if (t && e)
      for (const i of this._vacuums.values())
        !i.log.length && !i.runs.length || (n.add(i.entityId), s.push(...Vn(t, i, e)));
    return { items: s, vacuums: n };
  }
  // ------------------------------------------------------------ interaction
  _moreInfo(t) {
    t && this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId: t }, bubbles: !0, composed: !0 })
    );
  }
  _onRowClick(t) {
    (this._config?.tap_action ?? w.tap_action) !== "none" && this._moreInfo(t.entityId);
  }
  _onRowKey(t, e) {
    (t.key === "Enter" || t.key === " ") && (t.preventDefault(), this._onRowClick(e));
  }
  _toggleGroup(t, e) {
    t.stopPropagation();
    const n = new Set(this._expandedGroups);
    n.has(e) ? n.delete(e) : n.add(e), this._expandedGroups = n;
  }
  // ----------------------------------------------------------------- render
  render() {
    const t = this._config;
    if (!t) return m;
    const e = this._groups.reduce((i, o) => i + o.items.length, 0), n = this._groups[this._groups.length - 1], s = n?.items[n.items.length - 1]?.key;
    return f`
      <ha-card
        class=${U({
      compact: t.compact ?? w.compact,
      "has-header": !!t.title
    })}
        style=${ee({ "--wh-max-height": t.max_height ? `${t.max_height}px` : "" })}
      >
        ${t.title ? f`<h1 class="card-header">${t.title}</h1>` : m}
        <div class="scroll">
          ${this._error ? f`<ha-alert alert-type="error">${this._error}</ha-alert>` : this._loading && e === 0 ? f`<div class="state">Loading…</div>` : e === 0 ? this._renderEmpty(t) : f`<ol>
                      ${this._groups.map((i) => this._renderGroup(i, t, s))}
                    </ol>`}
        </div>
      </ha-card>
    `;
  }
  _renderEmpty(t) {
    const e = ve(t), n = e % 24 === 0 && e > 24 ? `${e / 24} days` : e === 1 ? "hour" : `${e} hours`, s = e === 1 ? "No activity in the last hour" : `No activity in the last ${n}`;
    return f`<div class="state">
      <ha-icon icon="mdi:timeline-clock-outline"></ha-icon>${s}
    </div>`;
  }
  _renderGroup(t, e, n) {
    const s = e.show_day_headers ?? w.show_day_headers;
    return f`
      ${s ? f`<li class="day" role="presentation">${t.label}</li>` : m}
      ${t.items.map((i) => this._renderItem(i, e, i.key === n))}
    `;
  }
  _renderIcon(t) {
    const e = t.entityId && !t.fixedIcon ? this._hass?.states[t.entityId] : void 0;
    return f`<span class="glyph"
      >${e ? f`<ha-state-icon
              .hass=${this._hass}
              .stateObj=${e}
              .stateValue=${t.stateValue}
            ></ha-state-icon>` : f`<ha-icon .icon=${t.icon}></ha-icon>`}</span
    >`;
  }
  _renderItem(t, e, n) {
    const s = e.show_avatars ?? w.show_avatars, i = e.show_cause ?? w.show_cause, o = !!t.entityId && (e.tap_action ?? w.tap_action) !== "none", r = s && t.picture, a = !!t.groupCount && t.groupCount > 1;
    return f`
      <li class=${U({ item: !0, last: n })}>
        <div class="rail">
          <div
            class=${U({ node: !0, photo: !!r, grouped: a })}
            style=${ee({ "--accent": t.accent })}
          >
            ${r ? f`<img class="photo-img" src=${t.picture} alt="" loading="lazy" />` : this._renderIcon(t)}
          </div>
          <div class="line"></div>
        </div>
        <div
          class=${U({ row: !0, clickable: o })}
          style=${ee({ "--accent": t.accent })}
          role=${o ? "button" : "text"}
          tabindex=${o ? "0" : "-1"}
          aria-label=${qs(t)}
          @click=${() => this._onRowClick(t)}
          @keydown=${(c) => this._onRowKey(c, t)}
        >
          <div class="body">
            <div class="primary">
              ${t.text ? t.text : f`<span class="subject">${t.name}</span> ${t.verb}`}
              ${t.count > 1 ? f`<span class="count">×${t.count}</span>` : m}
            </div>
            ${t.details?.length ? f`<div class="secondary">${t.details.join(" · ")}</div>` : m}
            ${i ? this._renderCause(t, s) : m}
            ${i ? this._renderVia(t) : m} ${this._renderEffects(t)}
            ${a ? this._renderGroupCaption(t, e) : m}
            ${a && this._expandedGroups.has(t.key) ? this._renderGroupMembers(t) : m}
          </div>
          ${this._renderTime(t, e)}
        </div>
      </li>
    `;
  }
  _renderAvatar(t) {
    return t.picture ? f`<img class="avatar" src=${t.picture} alt="" loading="lazy" />` : f`<span class="avatar initial">${t.name.charAt(0).toUpperCase()}</span>`;
  }
  _renderCause(t, e) {
    const n = t.cause;
    if (!n || !n.actor && !n.trigger) return m;
    const s = n.by ?? n.actor, i = n.by ? n.actor : void 0, o = !!s?.entityId && (this._config?.tap_action ?? w.tap_action) !== "none";
    return f`
      <div class="secondary">
        ${s ? f`by${e && s.kind === "user" ? this._renderAvatar(s) : m}
              ${o ? this._actorLink(s) : f`<span title=${s.detail ?? s.name}>${s.name}</span>`}` : m}${i ? f`, via ${this._actorLink(i)}` : m}${s && n.trigger ? ", " : m}${n.trigger ? f`${s ? "triggered by" : "by"} ${n.trigger}` : m}
      </div>
    `;
  }
  /** A name that opens its entity. A span, not a button, so long names wrap like text. */
  _actorLink(t) {
    const e = (n) => {
      n.stopPropagation(), this._moreInfo(t.entityId);
    };
    return f`<span
      class="link"
      role="button"
      tabindex="0"
      title=${t.detail ? `${t.name} – ${t.detail}` : t.name}
      @click=${e}
      @keydown=${(n) => {
      n.stopPropagation(), (n.key === "Enter" || n.key === " ") && (n.preventDefault(), this._moreInfo(t.entityId));
    }}
      >${t.name}</span
    >`;
  }
  _renderVia(t) {
    if (!t.via?.length) return m;
    const e = (this._config?.tap_action ?? w.tap_action) !== "none";
    return f`<div class="secondary">
      via
      ${t.via.map(
      (n, s) => f`${s ? ", " : m}${n.entityId && e ? this._actorLink(n) : n.name}`
    )}
    </div>`;
  }
  /** What one action caused: a line per thing, under the entry that started it. */
  /** "5 changes in the last 2 min", with a chevron that reveals the earlier actions. */
  _renderGroupCaption(t, e) {
    const n = e.group_window_minutes ?? w.group_window_minutes, s = this._hass?.locale?.language, i = $("{count} changes in the last {minutes} min", s, {
      count: t.groupCount,
      minutes: n
    }), o = this._expandedGroups.has(t.key);
    return f`
      <div
        class="secondary group-caption"
        role="button"
        tabindex="0"
        aria-expanded=${o ? "true" : "false"}
        @click=${(r) => this._toggleGroup(r, t.key)}
        @keydown=${(r) => {
      (r.key === "Enter" || r.key === " ") && (r.preventDefault(), this._toggleGroup(r, t.key));
    }}
      >
        <ha-icon class="chevron" icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        ${i}
      </div>
    `;
  }
  /** The earlier actions folded into a grouped entry, oldest first. */
  _renderGroupMembers(t) {
    const e = (this._config?.tap_action ?? w.tap_action) !== "none";
    return f`<ul class="group-members">
      ${t.group?.map((n) => {
      const s = n.entityId && !n.fixedIcon ? this._hass?.states[n.entityId] : void 0, i = e && !!n.entityId;
      return f`<li
          class=${U({ "group-member": !0, clickable: i })}
          role=${i ? "button" : "text"}
          tabindex=${i ? "0" : "-1"}
          @click=${(o) => {
        i && (o.stopPropagation(), this._moreInfo(n.entityId));
      }}
          @keydown=${(o) => {
        (o.key === "Enter" || o.key === " ") && i && (o.stopPropagation(), o.preventDefault(), this._moreInfo(n.entityId));
      }}
        >
          <span class="gm-icon"
            >${s ? f`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${s}
                    .stateValue=${n.stateValue}
                  ></ha-state-icon>` : f`<ha-icon .icon=${n.icon}></ha-icon>`}</span
          >
          <span class="gm-text"><span class="gm-name">${n.name}</span> ${n.verb}</span>
          <span class="gm-time">${_e(n.when, this._hass)}</span>
        </li>`;
    })}
    </ul>`;
  }
  _renderEffects(t) {
    if (!t.effects?.length) return m;
    const e = (this._config?.tap_action ?? w.tap_action) !== "none";
    return f`<ul class="effects">
      ${t.effects.map((n) => {
      const s = n.entityId && !n.fixedIcon ? this._hass?.states[n.entityId] : void 0, i = e && !!n.entityId;
      return f`<li
          class=${U({ effect: !0, clickable: i })}
          style=${ee({ "--accent": n.accent })}
          role=${i ? "button" : "text"}
          tabindex=${i ? "0" : "-1"}
          @click=${(o) => {
        i && (o.stopPropagation(), this._moreInfo(n.entityId));
      }}
          @keydown=${(o) => {
        (o.key === "Enter" || o.key === " ") && (o.stopPropagation(), o.preventDefault(), i && this._moreInfo(n.entityId));
      }}
        >
          <span class="e-icon"
            >${s ? f`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${s}
                    .stateValue=${n.stateValue}
                  ></ha-state-icon>` : f`<ha-icon .icon=${n.icon}></ha-icon>`}</span
          >
          <span class="e-text"
            ><span class="e-name">${n.name}</span> ${n.verb}${n.count && n.count > 1 ? f`<span class="e-count"> ×${n.count}</span>` : m}${n.details?.length ? f`<span class="e-details"> · ${n.details.join(" · ")}</span>` : m}</span
          >
        </li>`;
    })}
    </ul>`;
  }
  _renderTime(t, e) {
    const n = e.time_display ?? w.time_display, s = _e(t.when, this._hass), i = pn(t.when, this._now, this._hass);
    return f`
      <div class="time" title=${hn(t.when, this._hass)}>
        ${n !== "relative" ? f`<span class="abs">${s}</span>` : m}
        ${n !== "absolute" ? f`<span class="rel">${i}</span>` : m}
      </div>
    `;
  }
};
C.styles = Bn;
j([
  N()
], C.prototype, "_config", 2);
j([
  N()
], C.prototype, "_groups", 2);
j([
  N()
], C.prototype, "_loading", 2);
j([
  N()
], C.prototype, "_error", 2);
j([
  N()
], C.prototype, "_now", 2);
j([
  N()
], C.prototype, "_expandedGroups", 2);
C = j([
  yt("what-happened-card")
], C);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "what-happened-card",
  name: "What Happened",
  description: "A live timeline that explains what happened, when, why and who or what caused it.",
  preview: !0,
  documentationURL: "https://github.com/jan-tdy/ha-what-happened-card"
});
console.info(
  "%c WHAT-HAPPENED-CARD %c v0.1.0 ",
  "color:#fff;background:#03a9f4;font-weight:600;border-radius:3px 0 0 3px;padding:2px 4px",
  "color:#03a9f4;background:#fff;border:1px solid #03a9f4;border-radius:0 3px 3px 0;padding:1px 4px"
);
var Qs = Object.defineProperty, ei = Object.getOwnPropertyDescriptor, Re = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? ei(e, n) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (i = (s ? r(e, n, i) : r(i)) || i);
  return s && i && Qs(e, n, i), i;
};
const me = [
  "alarm_control_panel",
  "automation",
  "binary_sensor",
  "button",
  "climate",
  "cover",
  "device_tracker",
  "fan",
  "input_boolean",
  "light",
  "lock",
  "media_player",
  "person",
  "scene",
  "script",
  "sensor",
  "siren",
  "sun",
  "switch",
  "update",
  "vacuum"
].map((t) => ({ value: t, label: t })), ti = {
  title: "Title",
  show_day_headers: "Show day headings (Today, Yesterday)",
  hours_to_show: "Time window",
  max_entries: "Maximum number of entries",
  order: "Order",
  target: "Only show activity of",
  exclude_entities: "Hide these entities",
  hide_devices: "Hide these devices",
  also_show_entities: "Also show these entities",
  also_show_domains: "Also show these domains",
  also_show_labels: "Also show these labels",
  colors: "Icon colors",
  include_domains: "Only these domains",
  exclude_domains: "Hide these domains",
  show_cause: "Show why it happened (who / what / trigger)",
  show_avatars: "Show profile pictures",
  state_color: "Show state color",
  compact: "Compact layout",
  time_display: "Time",
  tap_action: "Tap action",
  max_height: "Maximum height",
  vacuum_details: "TapoVac-ADV: show cleaning runs with rooms, duration and reason",
  activity: "What to show",
  automation_runs: "Automation and script runs",
  show_actions: "Show what automations said or sent (needs an admin user)",
  chatty: "Very frequent entities",
  show_diagnostic: "Include diagnostic, configuration and hidden entities",
  hide_unavailable: "Hide unavailable / unknown states",
  collapse_repeats: "Merge rapid repeats of the same event",
  group_device_actions: "Group a device's different actions together",
  group_window_minutes: "Grouping window"
}, ni = {
  colors: "Pick a domain (light, input_boolean, …) or a single entity and the color of its icons. An entity beats its domain.",
  title: "Leave empty to show no title.",
  also_show_entities: "Shown even when the default view would hide them (helpers, buttons, diagnostic entities, restart noise, very frequent entities). Pick an automation or script to always list its runs. Also the way to keep one entity of a hidden device visible.",
  hide_devices: 'Every entity of these devices is hidden, handy for a device with many sensors (a presence sensor, a laptop). Add an entity to "Also show these entities" to keep just that one visible.',
  also_show_labels: 'Everything carrying one of these labels (entities and devices) is shown like an entity in the list above. Handy for a "watch this" label.',
  also_show_domains: "Added to the default view, e.g. sensor or update. Pick from the list or type your own.",
  hours_to_show: "How far back the timeline reaches, in hours (1 – 720).",
  max_entries: "Between 1 and 500. Rapid repeats count as one entry when merging is on.",
  target: "Leave empty to show everything. Choose areas, devices, entities or labels to narrow it.",
  include_domains: "Leave empty for all domains. Pick from the list or type your own.",
  activity: "Recommended hides clocks, text and number sensors and update entities.",
  automation_runs: "Most runs are plumbing. By default only what a run said on a speaker or sent as a notification is shown, as its own entry.",
  chatty: "Entities with at least 10 entries at a pace of one per hour or faster, such as a clock sensor or an automation that runs every 15 minutes.",
  max_height: "Pixels. Only needed in Masonry and Panel views. In Sections views, resize the card with its handles.",
  group_device_actions: "A chatty device (a laptop, a presence sensor with many sub-sensors) gets one expandable entry instead of one row per sensor.",
  group_window_minutes: "How close together, in minutes, actions of one device have to be."
}, si = [
  { name: "title", selector: { text: {} } },
  { name: "show_day_headers", selector: { boolean: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "hours_to_show",
        selector: {
          number: {
            min: I.hours[0],
            max: I.hours[1],
            step: 1,
            mode: "box",
            unit_of_measurement: "h"
          }
        }
      },
      {
        name: "max_entries",
        selector: {
          number: { min: I.entries[0], max: I.entries[1], step: 1, mode: "box" }
        }
      }
    ]
  },
  {
    name: "order",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "newest_first", label: "Newest first" },
          { value: "oldest_first", label: "Oldest first" }
        ]
      }
    }
  }
], ii = [
  { name: "target", selector: { target: {} } },
  { name: "exclude_entities", selector: { entity: { multiple: !0 } } },
  { name: "hide_devices", selector: { device: { multiple: !0 } } },
  { name: "also_show_entities", selector: { entity: { multiple: !0 } } },
  { name: "also_show_labels", selector: { label: { multiple: !0 } } },
  {
    name: "also_show_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: me }
    }
  },
  {
    name: "include_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: me }
    }
  },
  {
    name: "exclude_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: me }
    }
  }
], oi = [
  {
    name: "colors",
    selector: {
      object: {
        multiple: !0,
        label_field: "match",
        fields: {
          match: { label: "Domain or entity id", required: !0, selector: { text: {} } },
          color: { label: "Color", required: !0, selector: { ui_color: {} } }
        }
      }
    }
  },
  { name: "show_cause", selector: { boolean: {} } },
  { name: "show_avatars", selector: { boolean: {} } },
  { name: "state_color", selector: { boolean: {} } },
  { name: "compact", selector: { boolean: {} } },
  {
    name: "time_display",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "both", label: "Clock time and relative" },
          { value: "absolute", label: "Clock time only" },
          { value: "relative", label: "Relative only" }
        ]
      }
    }
  },
  {
    name: "tap_action",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "more-info", label: "Open more info" },
          { value: "none", label: "Do nothing" }
        ]
      }
    }
  },
  {
    name: "max_height",
    selector: { number: { min: 100, max: 2e3, step: 10, mode: "box", unit_of_measurement: "px" } }
  }
], ri = [
  {
    name: "activity",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "meaningful", label: "Things that happened (recommended)" },
          { value: "everything", label: "Everything, including sensors and clocks" }
        ]
      }
    }
  },
  {
    name: "automation_runs",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "actions", label: "Only what they said or sent (recommended)" },
          { value: "all", label: "Every run" },
          { value: "none", label: "Never" }
        ]
      }
    }
  },
  {
    name: "chatty",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "summarize", label: "Summarize in one entry" },
          { value: "hide", label: "Hide" },
          { value: "show", label: "Show every entry" }
        ]
      }
    }
  },
  { name: "show_actions", selector: { boolean: {} } },
  { name: "show_diagnostic", selector: { boolean: {} } },
  { name: "vacuum_details", selector: { boolean: {} } },
  { name: "hide_unavailable", selector: { boolean: {} } },
  { name: "collapse_repeats", selector: { boolean: {} } },
  { name: "group_device_actions", selector: { boolean: {} } },
  {
    name: "group_window_minutes",
    selector: {
      number: {
        min: I.groupWindow[0],
        max: I.groupWindow[1],
        step: 1,
        mode: "box",
        unit_of_measurement: "min"
      }
    }
  }
], ai = [
  { id: "source", header: "What to include", icon: "mdi:filter-variant", schema: ii },
  { id: "display", header: "Appearance", icon: "mdi:palette-outline", schema: oi },
  { id: "rules", header: "Rules", icon: "mdi:tune-variant", schema: ri }
];
let B = class extends W {
  constructor() {
    super(...arguments), this._computeLabel = (t) => ti[t.name] ?? t.name, this._computeHelper = (t) => ni[t.name];
  }
  setConfig(t) {
    this._config = t;
  }
  _data() {
    return { ...w, ...this._config };
  }
  _valueChanged(t) {
    if (t.stopPropagation(), !this._config) return;
    const e = t.detail.value, n = { type: this._config.type };
    for (const [s, i] of Object.entries(e))
      s === "type" || i === void 0 || i === "" || Array.isArray(i) && i.length === 0 || s === "target" && (!i || Object.keys(i).length === 0) || w[s] === i && !(s in this._config) || (n[s] = i);
    this._config = n, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      })
    );
  }
  /** Entities of a hidden device, so one of them can still be picked back in. Modest on
   * purpose: a plain checkbox list, not a full picker. */
  _deviceEntities(t) {
    const e = this.hass;
    return e?.entities ? Object.values(e.entities).filter((n) => n.device_id === t).map((n) => ({
      entityId: n.entity_id,
      name: e.states[n.entity_id]?.attributes.friendly_name ?? n.entity_id
    })).sort((n, s) => n.name.localeCompare(s.name)) : [];
  }
  _toggleAlsoShow(t, e) {
    if (!this._config) return;
    const n = this._config.also_show_entities ?? [], s = e ? [.../* @__PURE__ */ new Set([...n, t])] : n.filter((i) => i !== t);
    this._config = { ...this._config, also_show_entities: s }, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _renderDeviceExceptions() {
    const t = this._config?.hide_devices;
    if (!t?.length || !this.hass) return m;
    const e = new Set(this._config?.also_show_entities ?? []);
    return f`
      <div class="device-exceptions">
        ${t.map((n) => {
      const s = this._deviceEntities(n);
      if (!s.length) return m;
      const i = this.hass?.devices?.[n]?.name ?? n;
      return f`
            <p class="device-exceptions-title">${i}: keep visible</p>
            <ul class="device-exceptions-list">
              ${s.map(
        (o) => f`
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        .checked=${e.has(o.entityId)}
                        @change=${(r) => this._toggleAlsoShow(o.entityId, r.target.checked)}
                      />
                      ${o.name}
                    </label>
                  </li>
                `
      )}
            </ul>
          `;
    })}
      </div>
    `;
  }
  _form(t) {
    return f`<ha-form
      .hass=${this.hass}
      .data=${this._data()}
      .schema=${t}
      .computeLabel=${this._computeLabel}
      .computeHelper=${this._computeHelper}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
  }
  render() {
    return !this.hass || !this._config ? m : f`
      ${this._form(si)}
      ${ai.map(
      (t) => f`
          <ha-expansion-panel outlined .header=${t.header} .expanded=${t.id === "source"}>
            <ha-icon slot="leading-icon" .icon=${t.icon}></ha-icon>
            <div class="panel-content">
              ${this._form(t.schema)}
              ${t.id === "source" ? this._renderDeviceExceptions() : m}
            </div>
          </ha-expansion-panel>
        `
    )}
    `;
  }
};
B.styles = ft`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-card-border-radius, 12px);
    }
    ha-expansion-panel ha-icon {
      color: var(--secondary-text-color);
    }
    .panel-content {
      padding: 0 16px 16px;
    }
    .device-exceptions {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--divider-color);
    }
    .device-exceptions-title {
      margin: 8px 0 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .device-exceptions-list {
      list-style: none;
      margin: 0 0 8px;
      padding: 0;
    }
    .device-exceptions-list label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 0;
      font-size: 0.9em;
    }
  `;
Re([
  bt({ attribute: !1 })
], B.prototype, "hass", 2);
Re([
  N()
], B.prototype, "_config", 2);
B = Re([
  yt("what-happened-card-editor")
], B);
const ci = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get WhatHappenedCardEditor() {
    return B;
  }
}, Symbol.toStringTag, { value: "Module" }));
