/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis, be = ne.ShadowRoot && (ne.ShadyCSS === void 0 || ne.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $e = Symbol(), De = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(e, n, s) {
    if (this._$cssResult$ = !0, s !== $e) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (be && e === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (e = De.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && De.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Nt = (t) => new pt(typeof t == "string" ? t : t + "", void 0, $e), mt = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new pt(n, t, $e);
}, Dt = (t, e) => {
  if (be) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const s = document.createElement("style"), i = ne.litNonce;
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
const { is: jt, defineProperty: Ut, getOwnPropertyDescriptor: Ht, getOwnPropertyNames: Lt, getOwnPropertySymbols: Wt, getPrototypeOf: Bt } = Object, ae = globalThis, Ue = ae.trustedTypes, Vt = Ue ? Ue.emptyScript : "", Gt = ae.reactiveElementPolyfillSupport, F = (t, e) => t, ie = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Vt : null;
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
} }, xe = (t, e) => !jt(t, e), He = { attribute: !0, type: String, converter: ie, reflect: !1, useDefault: !1, hasChanged: xe };
Symbol.metadata ??= Symbol("metadata"), ae.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
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
    const { get: i, set: r } = Ht(this.prototype, e) ?? { get() {
      return this[n];
    }, set(o) {
      this[n] = o;
    } };
    return { get: i, set(o) {
      const a = i?.call(this);
      r?.call(this, o), this.requestUpdate(e, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? He;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = Bt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(F("properties"))) {
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
    return Dt(e, this.constructor.elementStyles), e;
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
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : ie).toAttribute(n, s.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, n) {
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ie;
      this._$Em = i;
      const a = o.fromAttribute(n, r.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, n, s, i = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? xe)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, n, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: s, reflect: i, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? n ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: o } = r, a = this[i];
        o !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, r, a);
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
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[F("elementProperties")] = /* @__PURE__ */ new Map(), H[F("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: H }), (ae.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, Le = (t) => t, re = ke.trustedTypes, We = re ? re.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, ft = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, gt = "?" + M, Kt = `<${gt}>`, z = document, Y = () => z.createComment(""), q = (t) => t === null || typeof t != "object" && typeof t != "function", Se = Array.isArray, Ft = (t) => Se(t) || typeof t?.[Symbol.iterator] == "function", pe = `[ 	
\f\r]`, K = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, Ve = />/g, O = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ge = /'/g, Ke = /"/g, _t = /^(?:script|style|textarea|title)$/i, Yt = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), g = Yt(1), T = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), Fe = /* @__PURE__ */ new WeakMap(), R = z.createTreeWalker(z, 129);
function vt(t, e) {
  if (!Se(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return We !== void 0 ? We.createHTML(e) : e;
}
const qt = (t, e) => {
  const n = t.length - 1, s = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = K;
  for (let a = 0; a < n; a++) {
    const c = t[a];
    let u, l, p = -1, m = 0;
    for (; m < c.length && (o.lastIndex = m, l = o.exec(c), l !== null); ) m = o.lastIndex, o === K ? l[1] === "!--" ? o = Be : l[1] !== void 0 ? o = Ve : l[2] !== void 0 ? (_t.test(l[2]) && (i = RegExp("</" + l[2], "g")), o = O) : l[3] !== void 0 && (o = O) : o === O ? l[0] === ">" ? (o = i ?? K, p = -1) : l[1] === void 0 ? p = -2 : (p = o.lastIndex - l[2].length, u = l[1], o = l[3] === void 0 ? O : l[3] === '"' ? Ke : Ge) : o === Ke || o === Ge ? o = O : o === Be || o === Ve ? o = K : (o = O, i = void 0);
    const d = o === O && t[a + 1].startsWith("/>") ? " " : "";
    r += o === K ? c + Kt : p >= 0 ? (s.push(u), c.slice(0, p) + ft + c.slice(p) + M + d) : c + M + (p === -2 ? a : d);
  }
  return [vt(t, r + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class Z {
  constructor({ strings: e, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, c = this.parts, [u, l] = qt(e, n);
    if (this.el = Z.createElement(u, s), R.currentNode = this.el.content, n === 2 || n === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = R.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(ft)) {
          const m = l[o++], d = i.getAttribute(p).split(M), f = /([.?@])?(.*)/.exec(m);
          c.push({ type: 1, index: r, name: f[2], strings: d, ctor: f[1] === "." ? Jt : f[1] === "?" ? Xt : f[1] === "@" ? Qt : ce }), i.removeAttribute(p);
        } else p.startsWith(M) && (c.push({ type: 6, index: r }), i.removeAttribute(p));
        if (_t.test(i.tagName)) {
          const p = i.textContent.split(M), m = p.length - 1;
          if (m > 0) {
            i.textContent = re ? re.emptyScript : "";
            for (let d = 0; d < m; d++) i.append(p[d], Y()), R.nextNode(), c.push({ type: 2, index: ++r });
            i.append(p[m], Y());
          }
        }
      } else if (i.nodeType === 8) if (i.data === gt) c.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(M, p + 1)) !== -1; ) c.push({ type: 7, index: r }), p += M.length - 1;
      }
      r++;
    }
  }
  static createElement(e, n) {
    const s = z.createElement("template");
    return s.innerHTML = e, s;
  }
}
function B(t, e, n = t, s) {
  if (e === T) return e;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = q(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (e = B(t, i._$AS(t, e.values), i, s)), e;
}
class Zt {
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
    const { el: { content: n }, parts: s } = this._$AD, i = (e?.creationScope ?? z).importNode(n, !0);
    R.currentNode = i;
    let r = R.nextNode(), o = 0, a = 0, c = s[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let u;
        c.type === 2 ? u = new X(r, r.nextSibling, this, e) : c.type === 1 ? u = new c.ctor(r, c.name, c.strings, this, e) : c.type === 6 && (u = new en(r, this, e)), this._$AV.push(u), c = s[++a];
      }
      o !== c?.index && (r = R.nextNode(), o++);
    }
    return R.currentNode = z, i;
  }
  p(e) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, n), n += s.strings.length - 2) : s._$AI(e[n])), n++;
  }
}
class X {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, n, s, i) {
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = B(this, e, n), q(e) ? e === _ || e == null || e === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : e !== this._$AH && e !== T && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ft(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== _ && q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(z.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: n, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = Z.createElement(vt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new Zt(i, this), o = r.u(this.options);
      r.p(n), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let n = Fe.get(e.strings);
    return n === void 0 && Fe.set(e.strings, n = new Z(e)), n;
  }
  k(e) {
    Se(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of e) i === n.length ? n.push(s = new X(this.O(Y()), this.O(Y()), this, this.options)) : s = n[i], s._$AI(r), i++;
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
class ce {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, s, i, r) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = _;
  }
  _$AI(e, n = this, s, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = B(this, e, n, 0), o = !q(e) || e !== this._$AH && e !== T, o && (this._$AH = e);
    else {
      const a = e;
      let c, u;
      for (e = r[0], c = 0; c < r.length - 1; c++) u = B(this, a[s + c], n, c), u === T && (u = this._$AH[c]), o ||= !q(u) || u !== this._$AH[c], u === _ ? e = _ : e !== _ && (e += (u ?? "") + r[c + 1]), this._$AH[c] = u;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Jt extends ce {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === _ ? void 0 : e;
  }
}
class Xt extends ce {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _);
  }
}
class Qt extends ce {
  constructor(e, n, s, i, r) {
    super(e, n, s, i, r), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = B(this, e, n, 0) ?? _) === T) return;
    const s = this._$AH, i = e === _ && s !== _ || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== _ && (s === _ || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
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
    B(this, e);
  }
}
const tn = ke.litHtmlPolyfillSupport;
tn?.(Z, X), (ke.litHtmlVersions ??= []).push("3.3.3");
const nn = (t, e, n) => {
  const s = n?.renderBefore ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new X(e.insertBefore(Y(), r), r, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ae = globalThis;
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
    return T;
  }
};
W._$litElement$ = !0, W.finalized = !0, Ae.litElementHydrateSupport?.({ LitElement: W });
const sn = Ae.litElementPolyfillSupport;
sn?.({ LitElement: W });
(Ae.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const wt = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const rn = { attribute: !0, type: String, converter: ie, reflect: !1, hasChanged: xe }, on = (t = rn, e, n) => {
  const { kind: s, metadata: i } = n;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(n.name, t), s === "accessor") {
    const { name: o } = n;
    return { set(a) {
      const c = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, c, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, t, a), a;
    } };
  }
  if (s === "setter") {
    const { name: o } = n;
    return function(a) {
      const c = this[o];
      e.call(this, a), this.requestUpdate(o, c, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function yt(t) {
  return (e, n) => typeof n == "object" ? on(t, e, n) : ((s, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function N(t) {
  return yt({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const bt = { ATTRIBUTE: 1 }, $t = (t) => (...e) => ({ _$litDirective$: t, values: e });
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
    if (super(t), t.type !== bt.ATTRIBUTE || t.name !== "class" || t.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
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
    return T;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const kt = "important", an = " !" + kt, te = $t(class extends xt {
  constructor(t) {
    if (super(t), t.type !== bt.ATTRIBUTE || t.name !== "style" || t.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
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
        const r = typeof i == "string" && i.endsWith(an);
        s.includes("-") || r ? n.setProperty(s, r ? i.slice(0, -11) : i, r ? kt : "") : n[s] = i;
      }
    }
    return T;
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
}, cn = {
  "was opened": "wurde geöffnet",
  "was closed": "wurde geschlossen",
  "was unlocked": "wurde entriegelt",
  "was locked": "wurde verriegelt",
  "detected motion": "Bewegung erkannt",
  "motion cleared": "Keine Bewegung erkannt",
  "started moving": "hat sich in Bewegung gesetzt",
  "stopped moving": "hat die Bewegung beendet",
  "detected occupancy": "Belegung erkannt",
  "occupancy cleared": "Frei",
  "detected presence": "Anwesenheit erkannt",
  "presence cleared": "Abwesend",
  "detected smoke": "Rauch erkannt",
  "smoke cleared": "Kein Rauch erkannt",
  "detected gas": "Gas erkannt",
  "gas cleared": "Kein Gas erkannt",
  "detected carbon monoxide": "Kohlenmonoxid erkannt",
  "carbon monoxide cleared": "Kein Kohlenmonoxid erkannt",
  "detected moisture": "Feuchtigkeit erkannt",
  "became dry": "Trocken",
  "reported a problem": "Problem erkannt",
  "problem resolved": "Problem behoben",
  "is unsafe": "ist unsicher",
  "is safe": "ist sicher",
  "detected tampering": "Manipulation erkannt",
  "tampering cleared": "Keine Manipulation erkannt",
  connected: "Verbunden",
  disconnected: "Getrennt",
  "was plugged in": "wurde eingesteckt",
  "was unplugged": "wurde ausgesteckt",
  "detected power": "Strom erkannt",
  "lost power": "Stromversorgung unterbrochen",
  "reported low battery": "Batterie niedrig",
  "battery is normal": "Batterie normal",
  "started charging": "Ladevorgang gestartet",
  "stopped charging": "Ladevorgang beendet",
  "got cold": "ist kalt geworden",
  "is no longer cold": "ist nicht mehr kalt",
  "got hot": "ist heiß geworden",
  "is no longer hot": "ist nicht mehr heiß",
  "detected light": "Licht erkannt",
  "no longer detects light": "Kein Licht mehr erkannt",
  "detected sound": "Geräusch erkannt",
  "no longer detects sound": "Kein Geräusch mehr erkannt",
  "detected vibration": "Vibration erkannt",
  "vibration cleared": "Keine Vibration erkannt",
  "started running": "hat den Betrieb aufgenommen",
  "stopped running": "hat den Betrieb beendet",
  "has an update available": "Update verfügbar",
  "is up to date": "ist aktuell",
  "is locking": "verriegelt",
  "is unlocking": "entriegelt",
  "is opening": "öffnet",
  "is jammed": "blockiert",
  "started opening": "begann sich zu öffnen",
  "started closing": "begann sich zu schließen",
  "was disarmed": "wurde deaktiviert",
  "was armed (home)": "wurde im Zuhause-Modus aktiviert",
  "was armed (away)": "wurde im Abwesenheitsmodus aktiviert",
  "was armed (night)": "wurde im Nachtmodus aktiviert",
  "was armed (vacation)": "wurde im Urlaubsmodus aktiviert",
  "was armed (custom bypass)": "wurde mit benutzerdefinierter Umgehung aktiviert",
  "is pending": "wartet",
  "is arming": "wird aktiviert",
  "is disarming": "wird deaktiviert",
  "was triggered": "wurde ausgelöst",
  "started playing": "Wiedergabe gestartet",
  paused: "pausiert",
  "is idle": "Leerlauf",
  "is buffering": "puffert",
  "went to standby": "in den Standby gewechselt",
  "started cleaning": "Reinigung gestartet",
  "returned to its dock": "zur Ladestation zurückgekehrt",
  "is returning to its dock": "kehrt zur Ladestation zurück",
  "reported an error": "Fehler gemeldet",
  "started mowing": "Mähen gestartet",
  started: "gestartet",
  finished: "abgeschlossen",
  rose: "ist gestiegen",
  set: "wurde gesetzt",
  rang: "hat geklingelt",
  "detected a person": "Person erkannt",
  "was pressed": "wurde gedrückt",
  "was double-pressed": "wurde doppelt gedrückt",
  "was triple-pressed": "wurde dreimal gedrückt",
  "was long-pressed": "wurde lange gedrückt",
  "reported {text}": "meldete {text}",
  "detected an event": "Ereignis erkannt",
  "arrived home": "ist nach Hause gekommen",
  "left home": "hat das Zuhause verlassen",
  "arrived at {zone}": "ist in {zone} angekommen",
  "became unavailable": "ist nicht verfügbar",
  "became unknown": "ist unbekannt",
  "was activated": "wurde aktiviert",
  "was turned on": "wurde eingeschaltet",
  "was turned off": "wurde ausgeschaltet",
  "changed to {value}": "wurde zu {value}",
  "was triggered {n} times": "wurde {n}-mal ausgelöst",
  "{verb} {n} times": "{verb} ({n}-mal)",
  "fired {n} times": "wurde {n}-mal ausgelöst",
  "changed {n} times": "{n}-mal geändert",
  "latest: {verb}": "zuletzt: {verb}",
  "{shown} and {more} more": "{shown} und {more} weitere",
  "just now": "gerade eben",
  "{count} changes in the last {minutes} min": "{count} Änderungen in den letzten {minutes} Min."
}, dn = { en: St, de: cn };
function ln(t) {
  return (t ?? "en").split("-")[0].toLowerCase();
}
function $(t, e, n) {
  let i = dn[ln(e)]?.[t] ?? St[t] ?? t;
  if (n)
    for (const [r, o] of Object.entries(n))
      i = i.split(`{${r}}`).join(String(o));
  return i;
}
function de(t) {
  return t?.locale?.language ?? "en-US";
}
function Ye(t) {
  const e = new Date(t);
  return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
function un(t) {
  const e = new Date(t), n = (s) => String(s).padStart(2, "0");
  return `${e.getFullYear()}-${n(e.getMonth() + 1)}-${n(e.getDate())}`;
}
function hn(t) {
  const e = t?.locale?.time_format;
  return e === "12" ? !0 : e === "24" ? !1 : new Intl.DateTimeFormat(void 0, { hour: "numeric" }).resolvedOptions().hour12 ?? !1;
}
function _e(t, e, n = !1) {
  const s = hn(e);
  return new Intl.DateTimeFormat(de(e), {
    hour: s ? "numeric" : "2-digit",
    minute: "2-digit",
    second: n ? "2-digit" : void 0,
    hourCycle: s ? "h12" : "h23"
  }).format(t);
}
function pn(t, e) {
  return `${new Intl.DateTimeFormat(de(e), {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(t)}, ${_e(t, e, !0)}`;
}
const qe = /* @__PURE__ */ new Map();
function se(t) {
  let e = qe.get(t);
  return e || (e = new Intl.RelativeTimeFormat(t, { numeric: "auto" }), qe.set(t, e)), e;
}
function mn(t, e, n) {
  const s = Math.max(0, Math.round((e - t) / 1e3)), i = de(n);
  if (s < 45) return $("just now", i);
  const r = Math.round(s / 60);
  if (r < 60) return se(i).format(-r, "minute");
  const o = Math.round(r / 60);
  if (o < 24) return se(i).format(-o, "hour");
  const a = Math.round(o / 24);
  return se(i).format(-a, "day");
}
function fn(t, e, n) {
  const s = Math.round((Ye(e) - Ye(t)) / 864e5), i = de(n);
  if (s === 0 || s === 1) {
    const o = se(i).format(-s, "day");
    return o.charAt(0).toUpperCase() + o.slice(1);
  }
  const r = new Date(t).getFullYear() === new Date(e).getFullYear();
  return new Intl.DateTimeFormat(i, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: r ? void 0 : "numeric"
  }).format(t);
}
function gn(t, e, n, s) {
  const i = {
    type: "logbook/event_stream",
    start_time: n.toISOString()
  };
  return s && s.length > 0 && (i.entity_ids = s), t.connection.subscribeMessage(
    (r) => e(r.events ?? []),
    i
  );
}
const _n = 10, vn = 10, wn = 1e4, yn = 3;
function Ee(t, e) {
  return t.length > e ? `${t.slice(0, e - 1).trimEnd()}…` : t;
}
function Ze(t) {
  return t.entityId ?? t.name;
}
function bn(t, e, n = /* @__PURE__ */ new Set(), s, i = vn, r = _n) {
  if (e === "show") return t;
  const o = i * 6e4, a = /* @__PURE__ */ new Map();
  for (const m of t) {
    if (m.rich || m.entityId && n.has(m.entityId)) continue;
    const d = Ze(m), f = a.get(d);
    f ? f.push(m) : a.set(d, [m]);
  }
  const c = /* @__PURE__ */ new Map();
  for (const m of a.values()) {
    let d = [];
    for (const f of m)
      d.length && d[d.length - 1].when - f.when > o && (u(d), d = []), d.push(f);
    u(d);
  }
  function u(m) {
    if (!(m.length < r || (m[0].when - m[m.length - 1].when) / 36e5 > m.length))
      for (const f of m) c.set(f, m);
  }
  if (c.size === 0) return t;
  const l = [], p = /* @__PURE__ */ new Set();
  for (const m of t) {
    const d = c.get(m);
    if (!d || m.entityId && n.has(m.entityId)) {
      l.push(m);
      continue;
    }
    if (p.has(d) || e === "hide") continue;
    p.add(d);
    const f = d.length, w = m.domain === "event", k = w && d.every((x) => x.verb === m.verb);
    l.push({
      ...m,
      key: `chatty|${Ze(m)}|${d[0].when}`,
      verb: m.isRun ? $("was triggered {n} times", s, { n: f }) : k ? $("{verb} {n} times", s, { n: f, verb: m.verb }) : w ? $("fired {n} times", s, { n: f }) : $("changed {n} times", s, { n: f }),
      details: m.isRun || k ? void 0 : [$("latest: {verb}", s, { verb: Ee(m.verb, 70) })],
      isRun: !1,
      count: 1,
      rich: !0
    });
  }
  return l;
}
const $n = {
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
function xn(t) {
  return $n[t] ?? `${t.replace(/_/g, " ")} entities`;
}
function kn(t) {
  return t.startsWith("was ") ? `were ${t.slice(4)}` : t.startsWith("is ") ? `are ${t.slice(3)}` : t;
}
function Sn(t, e) {
  return (t.cause?.actor?.name ?? "") === (e.cause?.actor?.name ?? "") && (t.cause?.trigger ?? "") === (e.cause?.trigger ?? "");
}
function An(t, e) {
  const n = /* @__PURE__ */ new Map(), s = [];
  for (const r of t) {
    if (r.rich || !r.entityId) continue;
    const o = `${r.domain}|${r.verb}|${r.tone}`, a = n.get(o);
    if (a && a.oldest - r.when <= wn)
      a.members.push(r), a.oldest = r.when;
    else {
      const c = { members: [r], oldest: r.when };
      n.set(o, c), s.push(c);
    }
  }
  const i = /* @__PURE__ */ new Map();
  for (const { members: r } of s) {
    const o = new Set(r.map((l) => l.entityId));
    if (o.size < yn) continue;
    const a = r[0], c = [...new Set(r.map((l) => l.name))], u = c.slice(0, 6).join(", ");
    i.set(a, {
      ...a,
      key: `burst|${a.key}`,
      entityId: void 0,
      name: `${o.size} ${xn(a.domain)}`,
      verb: kn(a.verb),
      details: [
        c.length > 6 ? $("{shown} and {more} more", e, { shown: u, more: c.length - 6 }) : u
      ],
      cause: r.every((l) => Sn(l, a)) ? a.cause : void 0,
      count: 1,
      stateValue: void 0,
      rich: !0
    });
    for (const l of r.slice(1)) i.set(l, null);
  }
  return i.size === 0 ? t : t.flatMap((r) => {
    if (!i.has(r)) return [r];
    const o = i.get(r);
    return o ? [o] : [];
  });
}
const En = 3e4;
function In(t, e, n = /* @__PURE__ */ new Set()) {
  const s = /* @__PURE__ */ new Set();
  for (const i of e) {
    if (i.rich || !i.entityId) continue;
    const r = t.states[i.entityId]?.attributes.entity_id;
    if (!Array.isArray(r) || r.length === 0) continue;
    const o = new Set(r.filter((a) => typeof a == "string"));
    for (const a of e)
      a !== i && !a.rich && a.entityId && !n.has(a.entityId) && o.has(a.entityId) && a.verb === i.verb && Math.abs(a.when - i.when) <= En && s.add(a);
  }
  return s.size ? e.filter((i) => !s.has(i)) : e;
}
const Cn = 200;
function me(t) {
  return typeof t == "string" ? t.split(",").map((e) => e.trim()) : Array.isArray(t) ? t.filter((e) => typeof e == "string") : [];
}
function Je(t) {
  return typeof t == "string" && t.trim() ? Ee(t.trim(), Cn) : void 0;
}
function Mn(t) {
  const e = [];
  for (const [n, s] of Object.entries(t.trace ?? {}))
    if (!(!n.startsWith("action/") && !n.startsWith("sequence/")))
      for (const i of s) {
        const r = i.result?.params;
        if (!r?.domain || !r.service) continue;
        const o = r.service_data ?? {}, a = Je(o.message);
        if (!a) continue;
        const c = `${r.domain}.${r.service}`;
        if (r.domain === "tts") {
          const u = [
            ...me(o.media_player_entity_id),
            ...me(o.entity_id),
            ...me(r.target?.entity_id)
          ].filter((l) => l.startsWith("media_player."));
          e.push({ kind: "say", text: a, speakers: [...new Set(u)], service: c });
        } else (r.domain === "notify" || r.domain === "persistent_notification") && e.push({
          kind: "notify",
          text: a,
          title: Je(o.title),
          speakers: [],
          service: c
        });
      }
  return e;
}
function fe(t, e, n, s = 5e3) {
  let i, r = 1 / 0;
  for (const o of t) {
    const a = Date.parse(o.timestamp.start);
    if (Number.isNaN(a) || a > e + s || e - a > n) continue;
    const c = Math.abs(e - a);
    c < r && (i = o, r = c);
  }
  return i;
}
const Tn = 45e3, On = 6e4;
class Rn {
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
    const i = this.item(e), r = i && this.lists.get(`${i.domain}|${i.itemId}`), o = r && fe(r.runs, n, s);
    return i && o ? this.details.get(`${i.domain}|${i.itemId}|${o.run_id}`) : void 0;
  }
  /** Load what `lookup` needs. Resolves when done; failures (no admin rights, no trace) are quiet. */
  ensure(e, n, s) {
    const i = this.item(e);
    if (!i) return;
    const r = `${i.domain}|${i.itemId}`, o = this.lists.get(r), a = o && fe(o.runs, n, s);
    if (a && this.details.has(`${r}|${a.run_id}`)) return;
    const c = `${r}|${a?.run_id ?? Math.floor(n / 6e4)}`, u = this.tried.get(c);
    if (u && Date.now() - u < On) return;
    const l = this.inflight.get(c);
    if (l) return l;
    const p = (async () => {
      this.tried.set(c, Date.now());
      try {
        let m = this.lists.get(r);
        if (!m || Date.now() - m.at > Tn) {
          const f = await this.hass.callWS({
            type: "trace/list",
            domain: i.domain,
            item_id: i.itemId
          });
          m = { at: Date.now(), runs: Array.isArray(f) ? f : [] }, this.lists.set(r, m);
        }
        const d = fe(m.runs, n, s);
        if (d && !this.details.has(`${r}|${d.run_id}`)) {
          const f = await this.hass.callWS({
            type: "trace/get",
            domain: i.domain,
            item_id: i.itemId,
            run_id: d.run_id
          });
          this.details.set(`${r}|${d.run_id}`, f);
        }
      } catch {
      } finally {
        this.inflight.delete(c);
      }
    })();
    return this.inflight.set(c, p), p;
  }
}
const Pn = "mdi:information-outline", Ie = {
  user: "mdi:account",
  automation: "mdi:robot",
  script: "mdi:script-text",
  scene: "mdi:palette",
  service: "mdi:cog-play",
  entity: "mdi:circle-medium",
  other: "mdi:information-outline"
};
function zn(t, e) {
  return e || (t === "homeassistant" ? "mdi:home-assistant" : Pn);
}
function P(t, e, n, s, i) {
  const r = "var(--state-icon-color, var(--primary-text-color))";
  if (i && t === "vacuum" && s !== "alert" && s !== "unavailable") {
    const o = "var(--state-vacuum-active-color, var(--teal-color, #009688))";
    return n ? `var(--state-vacuum-${n}-color, ${o})` : o;
  }
  if (!i) return s === "unavailable" ? "var(--state-unavailable-color)" : r;
  switch (s) {
    case "unavailable":
      return "var(--state-unavailable-color, var(--disabled-text-color))";
    case "alert":
      return "var(--error-color)";
    case "inactive":
      return `var(--state-${t}-inactive-color, var(--state-inactive-color, ${r}))`;
    case "active": {
      const o = `var(--state-${t}-active-color, var(--state-active-color, ${r}))`, a = n ? `var(--state-${t}-${n}-color, ${o})` : o;
      return e && n ? `var(--state-${t}-${e}-${n}-color, ${a})` : a;
    }
    default:
      return r;
  }
}
const Xe = "var(--error-color)", Nn = "tapo_rv30", Qe = {
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
}, jn = 10 * 60 * 1e3, Un = /* @__PURE__ */ new Set(["start", "done", "override", "return", "docked", "skip", "error"]), At = 300;
function Hn(t) {
  return Object.values(t.entities ?? {}).filter((e) => e.platform === Nn && e.entity_id.startsWith("vacuum.")).map((e) => e.entity_id);
}
function et(t) {
  const e = t.match(/^(You started|Started) cleaning (.+?)\.(?: (.+))?$/s);
  return e ? { byUser: e[1] === "You started", names: e[2], why: e[3]?.replace(/\.$/, "") } : { byUser: t.startsWith("You") };
}
function Ln(t, e, n) {
  let s;
  for (const i of t) {
    if (i.kind !== "start" || n.has(i)) continue;
    const r = Math.abs(i.ts - e);
    r <= At && (!s || r < Math.abs(s.ts - e)) && (s = i);
  }
  return s;
}
function Wn(t) {
  const e = t.match(/^(.+?) came home: (.*?)\.?$/s);
  return e ? { people: e[1], note: e[2] } : void 0;
}
function Bn(t, e) {
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
function Vn(t) {
  const e = [];
  return t.minutes != null && e.push(`${t.minutes} min`), t.area != null && e.push(`${t.area} m²`), t.emptied_bin && e.push("bin emptied"), e;
}
function Gn(t, e, n) {
  const i = t.states[e.entityId]?.attributes.friendly_name ?? e.entityId, r = n.state_color ?? !0, o = [], a = /* @__PURE__ */ new Set(), c = {
    entityId: e.entityId,
    domain: "vacuum",
    name: i,
    isPerson: !1,
    isRun: !1,
    count: 1,
    rich: !0,
    fixedIcon: !0
  };
  for (const d of e.runs) {
    const f = Ln(e.log, d.started, a);
    f && a.add(f);
    const w = f ? et(f.text) : void 0, k = !!d.error;
    let x;
    f && w ? x = { actor: w.byUser ? nt(t) : tt(), trigger: w.why } : d.start_type != null && Qe[d.start_type] && (x = {
      actor: { kind: "other", name: Qe[d.start_type], icon: "mdi:gesture-tap" }
    }), o.push({
      ...c,
      key: `vac|${e.entityId}|start|${d.started}`,
      when: d.started * 1e3,
      verb: w?.names ? `started cleaning ${w.names}` : "started cleaning",
      tone: "active",
      phase: "start",
      icon: "mdi:robot-vacuum",
      details: d.rule_name ? [`preset “${d.rule_name}”`] : void 0,
      cause: x,
      accent: P("vacuum", void 0, "cleaning", "active", r)
    });
    const E = (d.started + (d.minutes ?? 0) * 60) * 1e3;
    o.push({
      ...c,
      key: `vac|${e.entityId}|finish|${d.started}`,
      when: Math.max(E, d.started * 1e3 + 1e3),
      verb: k ? `stopped with error ${d.error}` : w?.names ? `finished cleaning ${w.names}` : "finished cleaning",
      tone: k ? "alert" : "inactive",
      phase: "finish",
      icon: k ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      details: Vn(d),
      accent: k ? Xe : P("vacuum", void 0, "docked", "inactive", r)
    });
  }
  const u = e.log.filter((d) => d.kind === "return"), l = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Set();
  for (const d of e.log.filter((f) => f.kind === "docked")) {
    const f = u.find(
      (w) => !p.has(w) && w.ts <= d.ts && d.ts - w.ts <= 1800
    );
    f && (l.set(d, f), p.add(f));
  }
  const m = new Set(e.runs.map((d) => d.started));
  for (const d of e.log) {
    if (!Un.has(d.kind) || a.has(d) || d.kind === "done" && e.runs.length > 0 || d.kind === "start" && [...m].some((E) => Math.abs(E - d.ts) <= At) || p.has(d)) continue;
    const f = d.kind === "start" ? et(d.text) : void 0, w = d.kind === "docked" ? l.get(d) : void 0, k = w ? Wn(w.text) : void 0;
    if (k) {
      o.push({
        ...c,
        key: `vac|${e.entityId}|log|${d.ts}|docked`,
        when: d.ts * 1e3,
        verb: "was sent home",
        tone: "neutral",
        icon: "mdi:robot-vacuum",
        details: [k.note.charAt(0).toUpperCase() + k.note.slice(1)],
        cause: { actor: Bn(t, k.people), trigger: "coming home" },
        accent: P("vacuum", void 0, "docked", "inactive", r)
      });
      continue;
    }
    const x = d.kind === "error" ? "alert" : d.kind === "start" ? "active" : "neutral";
    o.push({
      ...c,
      key: `vac|${e.entityId}|log|${d.ts}|${d.kind}`,
      when: d.ts * 1e3,
      verb: f?.names ? `started cleaning ${f.names}` : "",
      text: f?.names ? void 0 : d.text.replace(/\.$/, ""),
      tone: x,
      phase: d.kind === "start" ? "start" : d.kind === "done" ? "finish" : void 0,
      icon: d.kind === "error" ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      cause: { actor: f?.byUser ? nt(t) : tt(), trigger: f?.why },
      accent: x === "alert" ? Xe : P(
        "vacuum",
        void 0,
        "cleaning",
        x === "active" ? "active" : "neutral",
        r
      )
    });
  }
  return o;
}
const Kn = mt`
  :host {
    display: block;
    height: 100%;
  }
  ha-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    container-type: inline-size;
    container-name: wh;
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
    /* Leaves room for the grouped-node ring (see .node.grouped), which paints outside
       its 32px box and would otherwise sit under this header's background. */
    margin-bottom: var(--ha-space-1, 4px);
    background: var(--wh-surface);
    -webkit-backdrop-filter: var(--ha-card-backdrop-filter, none);
    backdrop-filter: var(--ha-card-backdrop-filter, none);
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
function Fn(t) {
  return t ? Object.values(t).some((e) => L(e).length > 0) : !1;
}
function Et(t, e) {
  const n = /* @__PURE__ */ new Set(), s = t.entities ?? {}, i = t.devices ?? {}, r = t.areas ?? {}, o = new Set(L(e.area_id));
  for (const u of L(e.floor_id))
    for (const l of Object.values(r))
      l.floor_id === u && o.add(l.area_id);
  const a = new Set(L(e.device_id)), c = new Set(L(e.label_id));
  for (const u of L(e.entity_id)) n.add(u);
  for (const u of Object.values(s)) {
    const l = u.device_id ? i[u.device_id] : void 0, p = u.area_id ?? l?.area_id ?? void 0;
    p && o.has(p) && n.add(u.entity_id), u.device_id && a.has(u.device_id) && n.add(u.entity_id), u.labels?.some((m) => c.has(m)) && n.add(u.entity_id), l?.labels?.some((m) => c.has(m)) && n.add(u.entity_id);
  }
  return n;
}
const Yn = /\b([a-z_]+)\.([a-z0-9_]+)\b/g;
function It(t, e) {
  return e.replace(Yn, (n) => t.states[n]?.attributes.friendly_name ?? n);
}
function qn(t, e) {
  for (const [n, s] of Object.entries(t.states))
    if (n.startsWith("person.") && s.attributes.user_id === e)
      return {
        entityId: n,
        name: s.attributes.friendly_name ?? n,
        picture: s.attributes.entity_picture
      };
}
function Ce(t) {
  if (t)
    return t.match(/\b[a-z_]+\.[a-z0-9_]+\b/)?.[0];
}
function Zn(t) {
  if (t.context_source) return t.context_source;
  if (t.context_message?.startsWith("triggered by "))
    return t.context_message.slice(13);
}
function Ct(t) {
  return t.replace(/event 'automation_triggered'/g, "another automation");
}
function Jn(t, e) {
  let n = e.context_source;
  return !n && e.context_message?.startsWith("triggered by ") && (n = e.context_message.slice(13)), n ? Ct(It(t, n)) : void 0;
}
function Xn(t, e) {
  const n = qn(t, e);
  return n ? { kind: "user", name: n.name, entityId: n.entityId, picture: n.picture } : t.user && t.user.id === e ? { kind: "user", name: t.user.name } : { kind: "user", name: "A user" };
}
function st(t, e, n) {
  return (e ? t.states[e]?.attributes.friendly_name : void 0) ?? n ?? e ?? "Unknown";
}
function Qn(t, e) {
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
      trigger: Jn(t, e),
      triggerEntityId: Ce(Zn(e))
    };
  if (e.context_user_id) {
    const s = Xn(t, e.context_user_id);
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
function es(t, e) {
  const n = e.source ?? (e.message?.startsWith("triggered by ") ? e.message.slice(13) : void 0);
  return n ? Ct(It(t, n)) : void 0;
}
const ts = 9e4;
function ns(t, e) {
  return e.map((n) => t.states[n]?.attributes.friendly_name ?? n).join(", ");
}
function ss(t, e, n, s, i, r, o) {
  const a = s.kind === "say";
  return {
    key: `action|${e.key}|${i}`,
    when: e.when,
    entityId: a ? s.speakers[0] : void 0,
    domain: a ? "media_player" : "notify",
    name: a ? s.speakers.length ? ns(t, s.speakers) : "Speaker" : "Notification",
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
      by: o,
      trigger: e.cause?.trigger,
      triggerEntityId: e.cause?.triggerEntityId
    },
    accent: P("media_player", void 0, "playing", "active", r)
  };
}
function is(t, e, n, s, i, r = /* @__PURE__ */ new Set()) {
  const o = /* @__PURE__ */ new Set(), a = [];
  for (const c of e) {
    if (!c.isRun || c.rich || (n !== "all" && !(c.entityId && r.has(c.entityId)) && o.add(c), n === "none" || !i)) continue;
    const u = i(c) ?? [], l = c.domain === "script" ? "script" : "automation", p = { kind: l, name: c.name, entityId: c.entityId, icon: Ie[l] }, m = c.cause?.actor?.kind === "user" ? c.cause.actor : void 0, d = m ? p : c.cause?.actor ?? p, f = /* @__PURE__ */ new Set([c.entityId, d.entityId]);
    u.forEach((w, k) => {
      a.push(ss(t, c, d, w, k, s, m));
      for (const x of e)
        x !== c && x.entityId && w.speakers.includes(x.entityId) && f.has(x.cause?.actor?.entityId) && Math.abs(x.when - c.when) <= ts && o.add(x);
    });
  }
  return [...e.filter((c) => !o.has(c)), ...a];
}
const rs = /* @__PURE__ */ new Set([
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
]), os = /* @__PURE__ */ new Set([
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
]), as = /* @__PURE__ */ new Set([
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
]), cs = /* @__PURE__ */ new Set(["person", "device_tracker", "homeassistant"]), it = /* @__PURE__ */ new WeakMap();
function D(t, e) {
  const n = it.get(t);
  if (n && n.entities === e?.entities && n.devices === e?.devices) return n.ids;
  const s = new Set([t.target?.entity_id ?? [], t.also_show_entities ?? []].flat());
  if (e && t.also_show_labels?.length)
    for (const i of Et(e, { label_id: t.also_show_labels }))
      s.add(i);
  return it.set(t, { entities: e?.entities, devices: e?.devices, ids: s }), s;
}
function ds(t, e, n) {
  if (!t.hide_devices?.length) return !1;
  const s = e?.entities?.[n]?.device_id;
  return !s || !t.hide_devices.includes(s) ? !1 : !D(t, e).has(n);
}
function Me(t) {
  const e = t.domain ?? t.entity_id?.split(".")[0];
  return (e === "automation" || e === "script") && t.state === void 0 && t.message !== void 0;
}
function Mt(t) {
  return !!(t.context_user_id || t.context_event_type || t.context_entity_id || t.context_name || t.context_service);
}
function ls(t, e, n) {
  const s = t.domain ?? t.entity_id?.split(".")[0] ?? "homeassistant";
  if (t.entity_id && D(e, n).has(t.entity_id) || e.also_show_domains?.includes(s) || e.include_domains?.length || Me(t)) return !0;
  if (os.has(s)) return !!t.context_user_id;
  if (s === "binary_sensor") {
    const i = t.entity_id && n?.states[t.entity_id]?.attributes.device_class;
    return i ? as.has(i) : Mt(t);
  }
  return rs.has(s);
}
const rt = {
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
function us(t) {
  const e = t.trim();
  return e in rt ? `var(--${e}-color, ${rt[e]})` : e === "primary" ? "var(--primary-color)" : e;
}
function ot(t, e, n) {
  if (!t?.length) return;
  let s, i;
  for (const o of t)
    !o?.match || !o.color || (o.match.includes(".") ? o.match === e && (i = o.color) : o.match === n && (s = o.color));
  const r = i ?? s;
  return r ? us(r) : void 0;
}
function hs(t, e) {
  const n = e.colors;
  if (!n?.length) return t;
  for (const s of t) {
    const i = ot(n, s.entityId, s.domain);
    i && (s.accent = i);
    for (const r of s.effects ?? []) {
      const o = ot(n, r.entityId, r.domain);
      o && (r.accent = o);
    }
  }
  return t;
}
const ps = 3e4, ms = 5e3, fs = 1e4, at = 3e4;
function gs(t) {
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
function _s(t) {
  const e = /* @__PURE__ */ new Set(), n = [];
  for (const s of t) {
    const i = s.cause?.actor, r = i?.entityId ?? i?.name;
    i && (i.kind === "automation" || i.kind === "script") && r && !e.has(r) && (e.add(r), n.push(i));
  }
  return n;
}
function ve(t) {
  return t.domain === "script" && !t.isRun && /^was turned (on|off)$/.test(t.verb);
}
function vs(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const s = n.entityId ?? n.name;
    e.has(s) || e.set(s, { ...n, verb: "ran", stateValue: void 0, tone: "active" });
  }
  return [...e.values()];
}
function ws(t) {
  const e = [];
  for (const n of t) {
    const s = e[e.length - 1];
    s && s.name === n.name && s.verb === n.verb && (s.details ?? []).join() === (n.details ?? []).join() ? s.count = (s.count ?? 1) + 1 : e.push({ ...n });
  }
  return e;
}
function ys(t) {
  const e = t.find((s) => s.cause?.by)?.cause?.by, n = bs(t);
  return e || n ? { actor: e, ...n } : void 0;
}
function bs(t) {
  const e = t.find((n) => n.cause?.trigger);
  return e ? {
    trigger: e.cause.trigger,
    triggerEntityId: e.cause.triggerEntityId
  } : void 0;
}
function $s(t, e) {
  const n = t.cause, s = n?.triggerEntityId ?? n?.source?.entityId;
  return s ? `entity|${s}` : e && n?.trigger ? `text|${n.trigger}` : void 0;
}
function xs(t) {
  return t.flatMap((e) => {
    const n = e.some((a) => a.cause?.triggerEntityId ?? a.cause?.source?.entityId), s = (a) => $s(a, !n), i = e.filter((a) => s(a)), r = new Set(i.map((a) => s(a)));
    if (r.size <= 1) return [e];
    const o = new Map([...r].map((a) => [a, []]));
    for (const a of e) {
      let c = s(a);
      if (!c) {
        let u = 1 / 0;
        for (const l of i) {
          const p = Math.abs(l.when - a.when);
          p < u && (u = p, c = s(l));
        }
      }
      o.get(c).push(a);
    }
    return [...o.values()];
  });
}
function ks(t, e) {
  const n = /* @__PURE__ */ new Map();
  for (const a of e) {
    const u = a.cause?.actor;
    if (!u?.entityId || u.kind !== "automation" && u.kind !== "script" || a.effects) continue;
    const l = u.entityId, p = n.get(l);
    p ? p.push(a) : n.set(l, [a]);
  }
  const s = /* @__PURE__ */ new Set(), i = [], r = e.filter((a) => !a.rich && a.cause?.actor?.kind === "service");
  for (const [, a] of n) {
    const c = [...a].sort((l, p) => l.when - p.when), u = [];
    for (const l of c) {
      const p = u[u.length - 1];
      p && l.when - p[p.length - 1].when <= ps ? p.push(l) : u.push([l]);
    }
    for (const l of xs(u)) {
      l.sort((y, I) => y.when - I.when);
      const p = l.find((y) => y.cause?.source)?.cause?.source, m = l.filter(ve), d = l.filter((y) => !m.includes(y));
      if (d.length === 0) continue;
      const f = d.some((y) => y.cause?.by);
      if (d.length < 2 && p?.cause?.actor?.kind !== "user" && !p?.soft && !f)
        continue;
      l.splice(0, l.length, ...d);
      for (const y of r)
        !s.has(y) && !l.includes(y) && y.when >= l[0].when - ms && y.when <= l[l.length - 1].when + fs && l.push(y);
      l.sort((y, I) => y.when - I.when);
      const w = l[0], k = _s(l), x = ws(
        [...l, ...vs(m)].sort((y, I) => y.when - I.when).map(gs)
      );
      let E;
      if (p)
        E = {
          ...p,
          soft: void 0,
          key: `group|${p.key}|${w.key}`,
          effects: x,
          via: k,
          count: 1,
          rich: !0
        };
      else {
        const y = k[0], I = y.kind === "script" ? "script" : "automation";
        E = {
          key: `group|${w.key}`,
          when: w.when,
          entityId: y.entityId,
          domain: I,
          name: y.name,
          verb: "ran",
          tone: "active",
          icon: Ie[I],
          isPerson: !1,
          isRun: !1,
          count: 1,
          rich: !0,
          cause: ys(l),
          effects: x,
          accent: P(I, void 0, "on", "active", !0)
        };
      }
      for (const y of [...l, ...m]) s.add(y);
      if (!p)
        for (const y of e)
          ve(y) && y.entityId === E.entityId && y.when >= w.when - at && y.when <= l[l.length - 1].when + at && s.add(y);
      i.push(E);
    }
  }
  const o = s.size ? [...e.filter((a) => !s.has(a)), ...i] : e;
  return Ss(o);
}
function Ss(t) {
  const e = t.filter(ve);
  if (!e.length) return t;
  const n = e.filter((r) => r.verb === "was turned on"), s = /* @__PURE__ */ new Set();
  return t.map((r) => {
    if (!e.includes(r)) return r;
    const o = r.entityId ?? r.name;
    return r.verb === "was turned on" ? { ...r, verb: "ran", stateValue: void 0, tone: "active" } : (n.some((c) => (c.entityId ?? c.name) === o && c.when <= r.when) && s.add(r), r);
  }).filter((r) => !s.has(r));
}
const As = 6e4;
function oe(t) {
  return (t.activity ?? "meaningful") === "meaningful" && !t.include_domains?.length;
}
function Es(t, e, n) {
  if (!oe(n)) return e;
  const s = D(n, t);
  for (const i of e) {
    if (i.domain !== "person" || !i.entityId) continue;
    const r = t.states[i.entityId]?.attributes.device_trackers;
    if (!Array.isArray(r)) continue;
    const o = e.find(
      (a) => a.domain === "device_tracker" && a.entityId && r.includes(a.entityId) && a.verb === i.verb && Math.abs(a.when - i.when) <= As
    );
    !o || i.cause?.actor || (i.cause = { trigger: `device ${o.name}`, triggerEntityId: o.entityId });
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
}, Is = {
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
}, Cs = /* @__PURE__ */ new Set([
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
]), Ms = /* @__PURE__ */ new Set(["person", "device_tracker"]), Ts = /* @__PURE__ */ new Set(["button", "input_button", "doorbell"]), Os = {
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
}, Rs = {
  doorbell: "rang",
  motion: "detected motion",
  button: "was pressed"
};
function Ps(t, e, n) {
  if (e) {
    const i = Os[e];
    if (i) return { verb: $(i[0], n), tone: i[1] };
    const r = e.replace(/_/g, " ");
    return {
      verb: $("reported {text}", n, { text: r }),
      tone: /(error|fail)/i.test(r) ? "alert" : "active"
    };
  }
  const s = t ? Rs[t] : void 0;
  return { verb: $(s ?? "detected an event", n), tone: "active" };
}
function Te(t) {
  const e = t.replace(/_/g, " ");
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function zs(t, e, n) {
  const s = t.states[e];
  if (s && t.formatEntityState)
    try {
      const o = t.formatEntityState({ ...s, state: n }, n);
      if (o) return o;
    } catch {
    }
  const i = s?.attributes.unit_of_measurement;
  return n !== "" && !Number.isNaN(Number(n)) ? i ? `${n} ${i}` : n : Te(n);
}
function Ns(t, e) {
  return Object.values(t.states).find(
    (s) => s.entity_id.startsWith("zone.") && (s.attributes.friendly_name ?? "").toLowerCase() === e.toLowerCase()
  )?.attributes.friendly_name ?? Te(e);
}
function Ds(t, e, n, s, i) {
  const r = t.locale?.language;
  if (s === "unavailable") return { verb: $("became unavailable", r), tone: "unavailable" };
  if (s === "unknown") return { verb: $("became unknown", r), tone: "neutral" };
  const a = (n ? t.states[n] : void 0)?.attributes.device_class;
  if (e === "event") return Ps(a, i, r);
  if (Ms.has(e))
    return s === "home" ? { verb: $("arrived home", r), tone: "active" } : s === "not_home" ? { verb: $("left home", r), tone: "inactive" } : { verb: $("arrived at {zone}", r, { zone: Ns(t, s) }), tone: "active" };
  if (e === "binary_sensor" && a && ct[a]) {
    const [l, p, m, d] = ct[a];
    if (s === "on") return { verb: $(l, r), tone: m ?? "active" };
    if (s === "off")
      return { verb: $(p, r), tone: d ?? "inactive" };
  }
  const c = Is[e]?.[s];
  if (c) return { verb: $(c[0], r), tone: c[1] };
  if (Ts.has(e)) return { verb: $("was pressed", r), tone: "active" };
  if (e === "scene") return { verb: $("was activated", r), tone: "active" };
  if (e === "climate" && s === "off")
    return { verb: $("was turned off", r), tone: "inactive" };
  if (Cs.has(e) || s === "on" || s === "off") {
    if (s === "on") return { verb: $("was turned on", r), tone: "active" };
    if (s === "off") return { verb: $("was turned off", r), tone: "inactive" };
  }
  const u = n ? zs(t, n, s) : Te(s);
  return { verb: $("changed to {value}", r, { value: Ee(u, 80) }), tone: "neutral" };
}
const b = {
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
  chatty_min_events: 10,
  // As long as the pace of one per hour or faster that qualifies a burst as chatty in the first
  // place: a quiet stretch shorter than that is just the entity's normal rhythm, not a break.
  chatty_gap_minutes: 60,
  show_diagnostic: !1,
  collapse_repeats: !0,
  group_device_actions: !0,
  group_window_minutes: 3
}, S = {
  hours: [1, 720],
  entries: [1, 500],
  groupWindow: [1, 60],
  chattyMinEvents: [2, 100],
  chattyGap: [1, 180]
}, dt = 60 * 1e3, js = 10 * 60 * 1e3, lt = 5 * 60 * 1e3;
function J(t) {
  return [t.when, t.entity_id ?? t.name, t.state ?? t.message, t.context_id].map((e) => e ?? "").join("|");
}
function Q(t, [e, n], s) {
  const i = typeof t == "number" ? t : Number(t);
  return Number.isFinite(i) ? Math.min(n, Math.max(e, Math.round(i))) : s;
}
function we(t) {
  return Q(t.hours_to_show, S.hours, b.hours_to_show);
}
function Us(t) {
  return Q(t.max_entries, S.entries, b.max_entries);
}
function Hs(t) {
  return Q(t.group_window_minutes, S.groupWindow, b.group_window_minutes);
}
function Ls(t) {
  return Q(t.chatty_min_events, S.chattyMinEvents, b.chatty_min_events);
}
function Ws(t) {
  return Q(t.chatty_gap_minutes, S.chattyGap, b.chatty_gap_minutes);
}
function Oe(t) {
  return t.domain ?? t.entity_id?.split(".")[0] ?? "homeassistant";
}
const Tt = /* @__PURE__ */ new Set(["unavailable", "unknown"]);
function ye(t, e, n, s, i = !1, r = !1) {
  const o = Oe(t);
  if (!i && s && t.entity_id && !(e.show_diagnostic ?? b.show_diagnostic)) {
    const c = s.entities?.[t.entity_id], u = D(e, s).has(t.entity_id);
    if (c && (c.entity_category || c.hidden) && !u) return !1;
  }
  return !(n && (!t.entity_id || !n.has(t.entity_id)) || t.entity_id && e.exclude_entities?.includes(t.entity_id) || e.include_domains?.length && !e.include_domains.includes(o) || e.exclude_domains?.includes(o) || t.entity_id && ds(e, s, t.entity_id) || !i && (e.activity ?? b.activity) === "meaningful" && !ls(t, e, s) || (e.hide_unavailable ?? b.hide_unavailable) && !r && Tt.has(t.state ?? ""));
}
function Bs(t) {
  return !!(t.context_user_id || t.context_service || t.context_event_type);
}
function Vs(t) {
  const e = /* @__PURE__ */ new Map();
  for (const s of t) {
    if (!s.entity_id || s.state === void 0 || s.message !== void 0) continue;
    const i = e.get(s.entity_id);
    i ? i.push(s) : e.set(s.entity_id, [s]);
  }
  const n = /* @__PURE__ */ new Set();
  for (const s of e.values()) {
    s.sort((o, a) => o.when - a.when);
    let i, r = !1;
    for (const o of s) {
      if (Tt.has(o.state)) {
        r = !0;
        continue;
      }
      r && i === o.state && !Bs(o) && n.add(J(o)), i = o.state, r = !1;
    }
  }
  return n;
}
function Gs(t, e, n) {
  const s = Oe(e), i = e.entity_id ? t.states[e.entity_id] : void 0, r = e.name ?? i?.attributes.friendly_name ?? e.entity_id ?? "Home Assistant";
  let o, a = "neutral", c = Qn(t, e);
  if (e.state !== void 0 && e.message === void 0)
    ({ verb: o, tone: a } = Ds(
      t,
      s,
      e.entity_id,
      e.state,
      e.attributes?.event_type
    ));
  else {
    const d = e.message ?? "did something";
    if (d.match(/^triggered(?: by (.+))?$/)) {
      o = "was triggered", a = "active";
      const w = es(t, e);
      if (w) {
        const k = e.source ?? d.replace(/^triggered by /, "");
        c = { ...c, trigger: w, triggerEntityId: Ce(k) };
      }
    } else
      o = d, a = /(error|fail)/i.test(d) ? "alert" : "neutral";
  }
  const u = c?.actor;
  u && !u.icon && (u.icon = Ie[u.kind]);
  const l = s === "person", p = l ? i?.attributes.entity_picture : void 0, m = n.state_color ?? b.state_color;
  return {
    key: J(e),
    when: e.when * 1e3,
    entityId: e.entity_id,
    domain: s,
    name: r,
    verb: o,
    tone: a,
    icon: zn(s, e.icon),
    stateValue: e.state,
    picture: p,
    isPerson: l,
    isRun: Me(e),
    cause: c,
    count: 1,
    accent: P(s, i?.attributes.device_class, e.state, a, m)
  };
}
function ut(t) {
  const e = t.cause;
  return `${e?.actor?.kind ?? ""}:${e?.actor?.name ?? ""}:${e?.trigger ?? ""}`;
}
function Ks(t, e) {
  if (!e || !t.entity_id || !e.vacuums.has(t.entity_id)) return !1;
  const n = Dn[t.state ?? ""];
  return n ? e.items.some(
    (s) => s.entityId === t.entity_id && s.phase === n && Math.abs(s.when - t.when * 1e3) <= jn
  ) : !1;
}
function Fs(t, e = !0, n = /* @__PURE__ */ new Set()) {
  const s = /* @__PURE__ */ new Set();
  for (const i of t) {
    const r = i.cause?.actor;
    if (!r?.entityId || r.kind !== "automation" && r.kind !== "script") continue;
    for (const c of t)
      e && c.isRun && !(c.entityId && n.has(c.entityId)) && c.entityId === r.entityId && Math.abs(c.when - i.when) <= dt && s.add(c);
    const o = i.cause?.triggerEntityId;
    if (!o) continue;
    const a = t.find(
      (c) => c !== i && !c.isRun && c.entityId === o && c.when <= i.when + 5e3 && i.when - c.when <= dt
    );
    a && (s.add(a), i.cause = { ...i.cause, trigger: `${a.name} ${a.verb}`, source: a });
  }
  return t.filter((i) => !s.has(i));
}
function Ys(t, e, n) {
  return oe(n) ? In(t, e, D(n, t)) : e;
}
const qs = /* @__PURE__ */ new Set(["motion", "occupancy", "presence", "moving"]);
function Zs(t, e) {
  if (t.domain === "light") return 4;
  if (t.domain === "binary_sensor") {
    const n = t.entityId && e.states[t.entityId]?.attributes.device_class;
    if (n && qs.has(n)) return 4;
  }
  return 2;
}
function Js(t, e, n) {
  if (!(n.group_device_actions ?? b.group_device_actions)) return e;
  const s = Hs(n) * 6e4, i = D(n, t);
  function r(u) {
    if (u.rich || !u.entityId || i.has(u.entityId)) return;
    const l = t.entities?.[u.entityId];
    if (l)
      return l.device_id ? `device|${l.device_id}` : l.device_id === null ? `entity|${u.entityId}` : void 0;
  }
  const o = /* @__PURE__ */ new Map(), a = [];
  for (const u of e) {
    const l = r(u);
    if (!l) continue;
    const p = o.get(l);
    if (p && p.oldest - u.when <= s)
      p.members.push(u), p.oldest = u.when;
    else {
      const m = { members: [u], oldest: u.when };
      o.set(l, m), a.push(m);
    }
  }
  const c = /* @__PURE__ */ new Map();
  for (const { members: u } of a) {
    const l = Math.max(...u.map((d) => Zs(d, t)));
    if (u.length < l) continue;
    const [p, ...m] = u;
    c.set(p, {
      ...p,
      key: `devgroup|${p.key}`,
      group: [...m].reverse(),
      // oldest first
      groupCount: u.length
    });
    for (const d of m) c.set(d, null);
  }
  return c.size === 0 ? e : e.flatMap((u) => {
    if (!c.has(u)) return [u];
    const l = c.get(u);
    return l ? [l] : [];
  });
}
function Xs(t, e, n, s, i, r, o) {
  const a = s - we(n) * 36e5, c = Us(n), u = n.collapse_repeats ?? b.collapse_repeats, l = t.locale?.language, p = (r?.items ?? []).filter(
    (h) => h.when >= a && h.when <= s + lt
  ), m = r ? { items: p, vacuums: r.vacuums } : void 0, d = [...e], f = d.filter((h) => h.domain === "homeassistant" && h.message === "started").map((h) => h.when), w = D(n, t), k = n.hide_unavailable ?? b.hide_unavailable ? Vs(d) : /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Map();
  for (const h of d) {
    const v = Me(h) ? h.source ?? h.message?.replace(/^triggered by /, "") : h.context_event_type === "automation_triggered" || h.context_event_type === "script_started" ? h.context_source ?? h.context_message?.replace(/^triggered by /, "") : void 0, A = Ce(v);
    A && x.set(A, [...x.get(A) ?? [], h.when]);
  }
  const E = (h) => !!h.entity_id && (x.get(h.entity_id) ?? []).some((v) => h.when <= v + 5 && v - h.when <= 60), y = /* @__PURE__ */ new Set(), I = (h) => (n.activity ?? b.activity) !== "meaningful" ? !1 : h.domain === "homeassistant" ? h.message === "stopped" && f.some((v) => v >= h.when && v - h.when <= 900) : Mt(h) || E(h) || h.entity_id && w.has(h.entity_id) || cs.has(h.domain ?? h.entity_id?.split(".")[0] ?? "") ? !1 : f.some((v) => h.when >= v - 30 && h.when <= v + 180), le = /* @__PURE__ */ new Set(), ue = /* @__PURE__ */ new Map();
  for (const h of d) {
    if (Oe(h) !== "event" || !h.entity_id || h.state === void 0 || h.state === "unavailable" || h.state === "unknown")
      continue;
    const v = `${h.entity_id}|${h.state}`, A = ue.get(v);
    A ? h.when < A.when ? (le.add(A), ue.set(v, h)) : le.add(h) : ue.set(v, h);
  }
  const Ot = d.filter((h) => !le.has(h)).filter((h) => {
    const v = h.when * 1e3;
    return v >= a && v <= s + lt;
  }).filter((h) => ye(h, n, i, t) ? !0 : oe(n) && E(h) && ye(h, n, i, t, !0) ? (y.add(J(h)), !0) : !1).filter((h) => !k.has(J(h))).filter((h) => !I(h)).filter((h) => !Ks(h, m)).sort((h, v) => v.when - h.when), Pe = n.automation_runs ?? b.automation_runs, Rt = is(
    t,
    [
      ...Ot.map((h) => {
        const v = Gs(t, h, n);
        return y.has(v.key) && (v.soft = !0), v;
      }),
      ...p
    ],
    Pe,
    n.state_color ?? b.state_color,
    n.show_actions === !1 ? void 0 : o,
    w
  ).sort((h, v) => v.when - h.when), Pt = Fs(Rt, Pe !== "all", w).filter((h) => !h.soft), ze = An(
    bn(
      Ys(t, Es(t, Pt, n), n),
      n.chatty ?? b.chatty,
      w,
      l,
      Ws(n),
      Ls(n)
    ),
    l
  ), zt = hs(
    (oe(n) ? ks(t, ze) : ze).sort(
      (h, v) => v.when - h.when
    ),
    n
  ), G = [];
  let he = 0;
  for (const h of zt) {
    const v = G[G.length - 1];
    if (u && v && !h.rich && !v.rich && h.entityId && v.entityId === h.entityId && v.verb === h.verb && ut(v) === ut(h) && he - h.when <= js) {
      v.count += 1, he = h.when;
      continue;
    }
    if (G.push(h), he = h.when, G.length > c) break;
  }
  const Ne = Js(t, G, n).slice(0, c);
  (n.order ?? b.order) === "oldest_first" && Ne.reverse();
  const ee = [];
  for (const h of Ne) {
    const v = un(h.when);
    let A = ee[ee.length - 1];
    (!A || A.key !== v) && (A = { key: v, label: fn(h.when, s, t), items: [] }, ee.push(A)), A.items.push(h);
  }
  return ee;
}
function Qs(t) {
  let e = t.text ?? `${t.name} ${t.verb}`;
  t.count > 1 && (e += ` ${t.count} times`);
  const n = t.cause;
  return n?.actor && (e += ` by ${n.actor.name}`), n?.trigger && (e += `, triggered by ${n.trigger}`), t.details?.length && (e += ` (${t.details.join(", ")})`), t.effects?.length && (e += `. ${t.effects.map((s) => `${s.name} ${s.verb}`).join(". ")}`), e;
}
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, j = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? ti(e, n) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (s ? o(e, n, i) : o(i)) || i);
  return s && i && ei(e, n, i), i;
};
const ht = 3e3, ni = 6e4;
let C = class extends W {
  constructor() {
    super(...arguments), this._groups = [], this._loading = !0, this._now = Date.now(), this._expandedGroups = /* @__PURE__ */ new Set(), this._entries = /* @__PURE__ */ new Map(), this._subToken = 0, this._vacuums = /* @__PURE__ */ new Map(), this._vacUnsubs = [], this._vacToken = 0, this._traceBudget = 0, this._registryRefs = [], this._resolveRun = (t) => {
      const e = this._hass;
      if (!e || !t.entityId) return;
      const n = this._traces ??= new Rn(e), s = n.lookup(t.entityId, t.when, 15e3);
      if (s) return Mn(s);
      this._traceBudget-- > 0 && n.ensure(t.entityId, t.when, 15e3)?.then(() => this._scheduleRecompute());
    };
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => hi), document.createElement("what-happened-card-editor");
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
    const n = [t.entities, t.devices, t.areas], s = n.some((i, r) => i !== this._registryRefs[r]);
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
    }, ni), this._hass && this._config && (this._subKey = void 0, this._vacKey = void 0, this._ensureSubscription(), this._scheduleRecompute());
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
    const n = e.vacuum_details === !1 ? [] : Hn(t).filter((r) => this._vacuumVisible(r, e)), s = JSON.stringify([...n].sort());
    if (s === this._vacKey) return;
    this._vacKey = s, this._unsubscribeVacuums(), this._vacuums.clear();
    const i = this._vacToken;
    for (const r of n) {
      const o = { entityId: r, log: [], runs: [] };
      this._vacuums.set(r, o), t.connection.subscribeMessage(
        (a) => {
          i === this._vacToken && (o.log = a.log ?? [], this._refreshHistory(o), this._scheduleRecompute());
        },
        { type: "tapo_rv30/planner/subscribe", entity_id: r }
      ).then((a) => {
        i !== this._vacToken ? a() : this._vacUnsubs.push(a);
      }).catch(() => {
      }), this._refreshHistory(o);
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
    Fn(e.target) && (n = Et(t, e.target));
    const s = we(e), i = JSON.stringify([s, n ? [...n].sort() : null]);
    if (i === this._subKey) {
      this._allowed = n;
      return;
    }
    if (this._subKey = i, this._allowed = n, this._unsubscribe(), this._entries.clear(), this._error = void 0, n && n.size === 0) {
      this._loading = !1;
      return;
    }
    this._loading = !0;
    const r = this._subToken, o = new Date(Date.now() - s * 36e5);
    gn(
      t,
      (a) => {
        if (r !== this._subToken) return;
        const c = this._config;
        for (const u of a)
          c && !ye(u, c, this._allowed, this._hass, !1, !0) || this._entries.set(J(u), u);
        this._entries.size > ht && this._trimBuffer(), this._loading = !1, this._scheduleRecompute();
      },
      o,
      n ? [...n] : void 0
    ).then((a) => {
      r !== this._subToken ? a() : this._unsub = a;
    }).catch((a) => {
      r === this._subToken && (this._loading = !1, this._error = a instanceof Error ? a.message : "Could not load the logbook");
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
    const t = Xs(
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
        !i.log.length && !i.runs.length || (n.add(i.entityId), s.push(...Gn(t, i, e)));
    return { items: s, vacuums: n };
  }
  // ------------------------------------------------------------ interaction
  _moreInfo(t) {
    t && this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId: t }, bubbles: !0, composed: !0 })
    );
  }
  _onRowClick(t) {
    (this._config?.tap_action ?? b.tap_action) !== "none" && this._moreInfo(t.entityId);
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
    if (!t) return _;
    const e = this._groups.reduce((i, r) => i + r.items.length, 0), n = this._groups[this._groups.length - 1], s = n?.items[n.items.length - 1]?.key;
    return g`
      <ha-card
        class=${U({
      compact: t.compact ?? b.compact,
      "has-header": !!t.title
    })}
        style=${te({ "--wh-max-height": t.max_height ? `${t.max_height}px` : "" })}
      >
        ${t.title ? g`<h1 class="card-header">${t.title}</h1>` : _}
        <div class="scroll">
          ${this._error ? g`<ha-alert alert-type="error">${this._error}</ha-alert>` : this._loading && e === 0 ? g`<div class="state">Loading…</div>` : e === 0 ? this._renderEmpty(t) : g`<ol>
                      ${this._groups.map((i) => this._renderGroup(i, t, s))}
                    </ol>`}
        </div>
      </ha-card>
    `;
  }
  _renderEmpty(t) {
    const e = we(t), n = e % 24 === 0 && e > 24 ? `${e / 24} days` : e === 1 ? "hour" : `${e} hours`, s = e === 1 ? "No activity in the last hour" : `No activity in the last ${n}`;
    return g`<div class="state">
      <ha-icon icon="mdi:timeline-clock-outline"></ha-icon>${s}
    </div>`;
  }
  _renderGroup(t, e, n) {
    const s = e.show_day_headers ?? b.show_day_headers;
    return g`
      ${s ? g`<li class="day" role="presentation">${t.label}</li>` : _}
      ${t.items.map((i) => this._renderItem(i, e, i.key === n))}
    `;
  }
  _renderIcon(t) {
    const e = t.entityId && !t.fixedIcon ? this._hass?.states[t.entityId] : void 0;
    return g`<span class="glyph"
      >${e ? g`<ha-state-icon
              .hass=${this._hass}
              .stateObj=${e}
              .stateValue=${t.stateValue}
            ></ha-state-icon>` : g`<ha-icon .icon=${t.icon}></ha-icon>`}</span
    >`;
  }
  _renderItem(t, e, n) {
    const s = e.show_avatars ?? b.show_avatars, i = e.show_cause ?? b.show_cause, r = !!t.entityId && (e.tap_action ?? b.tap_action) !== "none", o = s && t.picture, a = !!t.groupCount && t.groupCount > 1;
    return g`
      <li class=${U({ item: !0, last: n })}>
        <div class="rail">
          <div
            class=${U({ node: !0, photo: !!o, grouped: a })}
            style=${te({ "--accent": t.accent })}
          >
            ${o ? g`<img class="photo-img" src=${t.picture} alt="" loading="lazy" />` : this._renderIcon(t)}
          </div>
          <div class="line"></div>
        </div>
        <div
          class=${U({ row: !0, clickable: r })}
          style=${te({ "--accent": t.accent })}
          role=${r ? "button" : "text"}
          tabindex=${r ? "0" : "-1"}
          aria-label=${Qs(t)}
          @click=${() => this._onRowClick(t)}
          @keydown=${(c) => this._onRowKey(c, t)}
        >
          <div class="body">
            <div class="primary">
              ${t.text ? t.text : g`<span class="subject">${t.name}</span> ${t.verb}`}
              ${t.count > 1 ? g`<span class="count">×${t.count}</span>` : _}
            </div>
            ${t.details?.length ? g`<div class="secondary">${t.details.join(" · ")}</div>` : _}
            ${i ? this._renderCause(t, s) : _}
            ${i ? this._renderVia(t) : _} ${this._renderEffects(t)}
            ${a ? this._renderGroupCaption(t, e) : _}
            ${a && this._expandedGroups.has(t.key) ? this._renderGroupMembers(t) : _}
          </div>
          ${this._renderTime(t, e)}
        </div>
      </li>
    `;
  }
  _renderAvatar(t) {
    return t.picture ? g`<img class="avatar" src=${t.picture} alt="" loading="lazy" />` : g`<span class="avatar initial">${t.name.charAt(0).toUpperCase()}</span>`;
  }
  _renderCause(t, e) {
    const n = t.cause;
    if (!n || !n.actor && !n.trigger) return _;
    const s = n.by ?? n.actor, i = n.by ? n.actor : void 0, r = !!s?.entityId && (this._config?.tap_action ?? b.tap_action) !== "none";
    return g`
      <div class="secondary">
        ${s ? g`by${e && s.kind === "user" ? this._renderAvatar(s) : _}
              ${r ? this._actorLink(s) : g`<span title=${s.detail ?? s.name}>${s.name}</span>`}` : _}${i ? g`, via ${this._actorLink(i)}` : _}${s && n.trigger ? ", " : _}${n.trigger ? g`${s ? "triggered by" : "by"} ${n.trigger}` : _}
      </div>
    `;
  }
  /** A name that opens its entity. A span, not a button, so long names wrap like text. */
  _actorLink(t) {
    const e = (n) => {
      n.stopPropagation(), this._moreInfo(t.entityId);
    };
    return g`<span
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
    if (!t.via?.length) return _;
    const e = (this._config?.tap_action ?? b.tap_action) !== "none";
    return g`<div class="secondary">
      via
      ${t.via.map(
      (n, s) => g`${s ? ", " : _}${n.entityId && e ? this._actorLink(n) : n.name}`
    )}
    </div>`;
  }
  /** What one action caused: a line per thing, under the entry that started it. */
  /** "5 changes in the last 2 min", with a chevron that reveals the earlier actions. */
  _renderGroupCaption(t, e) {
    const n = e.group_window_minutes ?? b.group_window_minutes, s = this._hass?.locale?.language, i = $("{count} changes in the last {minutes} min", s, {
      count: t.groupCount,
      minutes: n
    }), r = this._expandedGroups.has(t.key);
    return g`
      <div
        class="secondary group-caption"
        role="button"
        tabindex="0"
        aria-expanded=${r ? "true" : "false"}
        @click=${(o) => this._toggleGroup(o, t.key)}
        @keydown=${(o) => {
      (o.key === "Enter" || o.key === " ") && (o.preventDefault(), this._toggleGroup(o, t.key));
    }}
      >
        <ha-icon class="chevron" icon=${r ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        ${i}
      </div>
    `;
  }
  /** The earlier actions folded into a grouped entry, oldest first. */
  _renderGroupMembers(t) {
    const e = (this._config?.tap_action ?? b.tap_action) !== "none";
    return g`<ul class="group-members">
      ${t.group?.map((n) => {
      const s = n.entityId && !n.fixedIcon ? this._hass?.states[n.entityId] : void 0, i = e && !!n.entityId;
      return g`<li
          class=${U({ "group-member": !0, clickable: i })}
          role=${i ? "button" : "text"}
          tabindex=${i ? "0" : "-1"}
          @click=${(r) => {
        i && (r.stopPropagation(), this._moreInfo(n.entityId));
      }}
          @keydown=${(r) => {
        (r.key === "Enter" || r.key === " ") && i && (r.stopPropagation(), r.preventDefault(), this._moreInfo(n.entityId));
      }}
        >
          <span class="gm-icon"
            >${s ? g`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${s}
                    .stateValue=${n.stateValue}
                  ></ha-state-icon>` : g`<ha-icon .icon=${n.icon}></ha-icon>`}</span
          >
          <span class="gm-text"><span class="gm-name">${n.name}</span> ${n.verb}</span>
          <span class="gm-time">${_e(n.when, this._hass)}</span>
        </li>`;
    })}
    </ul>`;
  }
  _renderEffects(t) {
    if (!t.effects?.length) return _;
    const e = (this._config?.tap_action ?? b.tap_action) !== "none";
    return g`<ul class="effects">
      ${t.effects.map((n) => {
      const s = n.entityId && !n.fixedIcon ? this._hass?.states[n.entityId] : void 0, i = e && !!n.entityId;
      return g`<li
          class=${U({ effect: !0, clickable: i })}
          style=${te({ "--accent": n.accent })}
          role=${i ? "button" : "text"}
          tabindex=${i ? "0" : "-1"}
          @click=${(r) => {
        i && (r.stopPropagation(), this._moreInfo(n.entityId));
      }}
          @keydown=${(r) => {
        (r.key === "Enter" || r.key === " ") && (r.stopPropagation(), r.preventDefault(), i && this._moreInfo(n.entityId));
      }}
        >
          <span class="e-icon"
            >${s ? g`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${s}
                    .stateValue=${n.stateValue}
                  ></ha-state-icon>` : g`<ha-icon .icon=${n.icon}></ha-icon>`}</span
          >
          <span class="e-text"
            ><span class="e-name">${n.name}</span> ${n.verb}${n.count && n.count > 1 ? g`<span class="e-count"> ×${n.count}</span>` : _}${n.details?.length ? g`<span class="e-details"> · ${n.details.join(" · ")}</span>` : _}</span
          >
        </li>`;
    })}
    </ul>`;
  }
  _renderTime(t, e) {
    const n = e.time_display ?? b.time_display, s = _e(t.when, this._hass), i = mn(t.when, this._now, this._hass);
    return g`
      <div class="time" title=${pn(t.when, this._hass)}>
        ${n !== "relative" ? g`<span class="abs">${s}</span>` : _}
        ${n !== "absolute" ? g`<span class="rel">${i}</span>` : _}
      </div>
    `;
  }
};
C.styles = Kn;
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
  wt("what-happened-card")
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
var si = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, Re = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? ii(e, n) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (s ? o(e, n, i) : o(i)) || i);
  return s && i && si(e, n, i), i;
};
const ge = [
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
].map((t) => ({ value: t, label: t })), ri = {
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
  chatty_min_events: "Minimum entries",
  chatty_gap_minutes: "Quiet gap that starts a new group",
  show_diagnostic: "Include diagnostic, configuration and hidden entities",
  hide_unavailable: "Hide unavailable / unknown states",
  collapse_repeats: "Merge rapid repeats of the same event",
  group_device_actions: "Group a device's different actions together",
  group_window_minutes: "Grouping window"
}, oi = {
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
  chatty: "Entities with at least `chatty_min_events` entries at a pace of one per hour or faster, such as a clock sensor or an automation that runs every 15 minutes. A quiet stretch of `chatty_gap_minutes` starts a new group.",
  chatty_min_events: "How many entries, at least, before a burst counts as chatty.",
  chatty_gap_minutes: "How long a pause, in minutes, between entries ends a chatty burst and starts a new group.",
  max_height: "Pixels. Only needed in Masonry and Panel views. In Sections views, resize the card with its handles.",
  group_device_actions: "A chatty device (a laptop, a presence sensor with many sub-sensors) gets one expandable entry instead of one row per sensor.",
  group_window_minutes: "How close together, in minutes, actions of one device have to be."
}, ai = [
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
            min: S.hours[0],
            max: S.hours[1],
            step: 1,
            mode: "box",
            unit_of_measurement: "h"
          }
        }
      },
      {
        name: "max_entries",
        selector: {
          number: { min: S.entries[0], max: S.entries[1], step: 1, mode: "box" }
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
], ci = [
  { name: "target", selector: { target: {} } },
  { name: "exclude_entities", selector: { entity: { multiple: !0 } } },
  { name: "hide_devices", selector: { device: { multiple: !0 } } },
  { name: "also_show_entities", selector: { entity: { multiple: !0 } } },
  { name: "also_show_labels", selector: { label: { multiple: !0 } } },
  {
    name: "also_show_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: ge }
    }
  },
  {
    name: "include_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: ge }
    }
  },
  {
    name: "exclude_domains",
    selector: {
      select: { multiple: !0, custom_value: !0, mode: "dropdown", options: ge }
    }
  }
], di = [
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
], li = [
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
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "chatty_min_events",
        selector: {
          number: {
            min: S.chattyMinEvents[0],
            max: S.chattyMinEvents[1],
            step: 1,
            mode: "box"
          }
        }
      },
      {
        name: "chatty_gap_minutes",
        selector: {
          number: {
            min: S.chattyGap[0],
            max: S.chattyGap[1],
            step: 1,
            mode: "box",
            unit_of_measurement: "min"
          }
        }
      }
    ]
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
        min: S.groupWindow[0],
        max: S.groupWindow[1],
        step: 1,
        mode: "box",
        unit_of_measurement: "min"
      }
    }
  }
], ui = [
  { id: "source", header: "What to include", icon: "mdi:filter-variant", schema: ci },
  { id: "display", header: "Appearance", icon: "mdi:palette-outline", schema: di },
  { id: "rules", header: "Rules", icon: "mdi:tune-variant", schema: li }
];
let V = class extends W {
  constructor() {
    super(...arguments), this._computeLabel = (t) => ri[t.name] ?? t.name, this._computeHelper = (t) => oi[t.name];
  }
  setConfig(t) {
    this._config = t;
  }
  _data() {
    return { ...b, ...this._config };
  }
  _valueChanged(t) {
    if (t.stopPropagation(), !this._config) return;
    const e = t.detail.value, n = { type: this._config.type };
    for (const [s, i] of Object.entries(e))
      s === "type" || i === void 0 || i === "" || Array.isArray(i) && i.length === 0 || s === "target" && (!i || Object.keys(i).length === 0) || b[s] === i && !(s in this._config) || (n[s] = i);
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
    if (!t?.length || !this.hass) return _;
    const e = new Set(this._config?.also_show_entities ?? []);
    return g`
      <div class="device-exceptions">
        ${t.map((n) => {
      const s = this._deviceEntities(n);
      if (!s.length) return _;
      const i = this.hass?.devices?.[n]?.name ?? n;
      return g`
            <p class="device-exceptions-title">${i}: keep visible</p>
            <ul class="device-exceptions-list">
              ${s.map(
        (r) => g`
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        .checked=${e.has(r.entityId)}
                        @change=${(o) => this._toggleAlsoShow(r.entityId, o.target.checked)}
                      />
                      ${r.name}
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
    return g`<ha-form
      .hass=${this.hass}
      .data=${this._data()}
      .schema=${t}
      .computeLabel=${this._computeLabel}
      .computeHelper=${this._computeHelper}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
  }
  render() {
    return !this.hass || !this._config ? _ : g`
      ${this._form(ai)}
      ${ui.map(
      (t) => g`
          <ha-expansion-panel outlined .header=${t.header} .expanded=${t.id === "source"}>
            <ha-icon slot="leading-icon" .icon=${t.icon}></ha-icon>
            <div class="panel-content">
              ${this._form(t.schema)}
              ${t.id === "source" ? this._renderDeviceExceptions() : _}
            </div>
          </ha-expansion-panel>
        `
    )}
    `;
  }
};
V.styles = mt`
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
  yt({ attribute: !1 })
], V.prototype, "hass", 2);
Re([
  N()
], V.prototype, "_config", 2);
V = Re([
  wt("what-happened-card-editor")
], V);
const hi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get WhatHappenedCardEditor() {
    return V;
  }
}, Symbol.toStringTag, { value: "Module" }));
