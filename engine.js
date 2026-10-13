/* engine.js — moteur d'exercices Maths 4e (pur : aucune dépendance au DOM, testable en node) */
(function (root) {
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const r2 = x => Math.round(x * 100) / 100;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- nombres ---------- */
  const fmt = n => { const s = r2(Math.abs(n)).toString().replace(".", ","); return (n < 0 ? "−" : "") + s; };
  const par = n => n < 0 ? "(" + fmt(n) + ")" : fmt(n);                 // après un opérateur : (−3) ou 5
  const sgn = n => n < 0 ? "(−" + fmt(-n) + ")" : "(+" + fmt(n) + ")";  // écriture avec parenthèses : (+9) / (−16)
  const abs = Math.abs;
  function parseNum(s) {
    if (s == null) return null;
    s = String(s).trim().replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/,/g, ".");
    if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
    return parseFloat(s);
  }
  function sameNum(a, b) { return Math.abs(a - b) < 1e-6; }
  function dec1(maxInt) { return r2(rnd(1, maxInt) + rnd(1, 9) / 10); }

  /* ---------- compétences ---------- */
  const SKILLS = [
    { id: "add_same", part: 1, theme: "relatifs", name: "Addition : même signe", short: "−3 + (−4)", lesson: "add" },
    { id: "add_diff", part: 1, theme: "relatifs", name: "Addition : signes contraires", short: "−8 + 5", lesson: "add" },
    { id: "sub", part: 1, theme: "relatifs", name: "Soustraction", short: "4 − (−6)", lesson: "add" },
    { id: "simplify", part: 1, theme: "relatifs", name: "Simplifier l'écriture", short: "12 − (+9) − (−16)", lesson: "simp" },
    { id: "algsum", part: 1, theme: "relatifs", name: "Somme algébrique", short: "12 − 9 + 16 − 17", lesson: "simp" },
    { id: "sign", part: 1, theme: "relatifs", name: "Signe d'un produit", short: "(−3) × 2 × (−4) : + ou − ?", lesson: "mul" },
    { id: "mul", part: 1, theme: "relatifs", name: "Multiplication", short: "−3 × (−4)", lesson: "mul" },
    { id: "mul_many", part: 1, theme: "relatifs", name: "Produit de plusieurs facteurs", short: "−5 × 2 × (−3) × (−4)", lesson: "mul" },
    { id: "div", part: 1, theme: "relatifs", name: "Division", short: "−8 ÷ (−2)", lesson: "mul" },
    { id: "opp", part: 1, theme: "relatifs", name: "Opposé et −1 × a", short: "−1 × (−5)", lesson: "mul" },
    { id: "notation", part: 2, theme: "geo", name: "Notations et vocabulaire", short: "[AB], (AB), AB, ⊥, //", lesson: "demo" },
    { id: "prop_blank", part: 2, theme: "geo", name: "Compléter une propriété", short: "Si … alors …", lesson: "props" },
    { id: "prop_conclude", part: 2, theme: "geo", name: "Que peut-on conclure ?", short: "On sait que… donc ?", lesson: "props" },
    { id: "prop_which", part: 2, theme: "geo", name: "Quelle propriété utiliser ?", short: "D1, M2, P4… ?", lesson: "props" },
    { id: "reciprocal", part: 2, theme: "geo", name: "Propriété et réciproque", short: "Si A alors B ⇄ Si B alors A", lesson: "recip" },
    { id: "demo_order", part: 2, theme: "geo", name: "Remettre une démonstration en ordre", short: "On sait que / Si… alors / Donc", lesson: "demo" },
    { id: "demo_build", part: 2, theme: "geo", name: "Construire une démonstration", short: "choisir la propriété puis conclure", lesson: "demo" },
  ];
  const skillById = id => SKILLS.find(s => s.id === id);

  /* ---------- PARTIE 1 : générateurs numériques ---------- */
  function addRuleExplain(a, b) {
    const s = r2(a + b);
    if (a === 0 || b === 0) return `Ajouter 0 ne change rien : <b>${fmt(s)}</b>.`;
    if ((a < 0) === (b < 0)) {
      return `Deux nombres de <b>même signe</b> (${a < 0 ? "−" : "+"}) : on garde ce signe et on <b>additionne</b> les distances à zéro.<br>${fmt(abs(a))} + ${fmt(abs(b))} = ${fmt(abs(s))}, donc le résultat est <b>${fmt(s)}</b>.`;
    }
    if (abs(a) === abs(b)) return `Deux nombres <b>opposés</b> : leur somme est <b>0</b>.`;
    const big = abs(a) >= abs(b) ? a : b, small = abs(a) >= abs(b) ? b : a;
    return `Signes <b>contraires</b> : la plus grande distance à zéro est ${fmt(abs(big))} (celle de ${fmt(big)}). On prend son signe (${big < 0 ? "−" : "+"}) et on <b>soustrait</b> les distances : ${fmt(abs(big))} − ${fmt(abs(small))} = ${fmt(abs(s))}.<br>Résultat : <b>${fmt(s)}</b>.`;
  }
  function gen_add_same(lvl) {
    const dec = lvl >= 3 || (lvl === 2 && Math.random() < 0.4);
    const max = lvl <= 1 ? 9 : lvl === 2 ? 25 : 9;
    let a = dec ? dec1(max) : rnd(1, max), b = dec ? dec1(max) : rnd(1, max);
    const s = pick([-1, 1]); a = r2(a * s); b = r2(b * s);
    const ans = r2(a + b);
    const bTxt = b > 0 && Math.random() < 0.5 ? sgn(b) : par(b);
    return { type: "num", prompt: `${fmt(a)} + ${bTxt} = ?`, answer: ans, explain: addRuleExplain(a, b) };
  }
  function gen_add_diff(lvl) {
    const dec = lvl >= 3 || (lvl === 2 && Math.random() < 0.4);
    const max = lvl <= 1 ? 9 : lvl === 2 ? 25 : 9;
    let a = dec ? dec1(max) : rnd(1, max), b = dec ? dec1(max) : rnd(1, max);
    if (a === b && Math.random() < 0.7) b = r2(b + 1);
    if (Math.random() < 0.5) a = -a; else b = -b;
    const ans = r2(a + b);
    return { type: "num", prompt: `${fmt(a)} + ${par(b)} = ?`, answer: ans, explain: addRuleExplain(a, b) };
  }
  function gen_sub(lvl) {
    const dec = lvl >= 3 || (lvl === 2 && Math.random() < 0.4);
    const max = lvl <= 1 ? 9 : lvl === 2 ? 20 : 9;
    let a = dec ? dec1(max) : rnd(1, max), b = dec ? dec1(max) : rnd(1, max);
    if (Math.random() < 0.5) a = -a; if (Math.random() < 0.6) b = -b;
    if (a > 0 && b > 0) { if (Math.random() < 0.5) a = -a; else b = -b; } // toujours au moins un relatif négatif
    const ans = r2(a - b);
    const ex = `<b>Soustraire, c'est ajouter l'opposé</b> : ${fmt(a)} − ${par(b)} = ${fmt(a)} + ${par(-b)}.<br>` + addRuleExplain(a, -b);
    return { type: "num", prompt: `${fmt(a)} − ${par(b)} = ?`, answer: ans, explain: ex };
  }
  function termsFor(lvl, withOpposites) {
    const n = lvl <= 1 ? rnd(3, 4) : lvl === 2 ? rnd(4, 5) : rnd(5, 7);
    const max = lvl <= 1 ? 10 : lvl === 2 ? 20 : 25;
    const vals = [];
    for (let i = 0; i < n; i++) vals.push(rnd(1, max) * pick([-1, 1]));
    if (withOpposites && n >= 4) { const k = rnd(1, n - 1); vals[k] = -vals[0]; }
    return vals;
  }
  function gen_simplify(lvl) {
    const vals = termsFor(lvl, false);
    // écriture avec parenthèses : premier terme nu, puis op ± et (±k)
    const parts = [fmt(vals[0])]; const signs = []; const rules = [];
    for (let i = 1; i < vals.length; i++) {
      const op = pick(["+", "−"]); const v = vals[i];
      parts.push(` ${op} ${sgn(v)}`);
      const res = (op === "+") === (v > 0) ? "+" : "−";
      signs.push(res);
      rules.push(`${op} suivi de ${v > 0 ? "+" : "−"} donne <b>${res}</b>`);
    }
    const simplified = fmt(vals[0]) + signs.map((s, i) => ` ${s} ${fmt(abs(vals[i + 1]))}`).join("");
    const terms = [fmt(vals[0])].concat(vals.slice(1).map(v => fmt(abs(v))));
    return { type: "signs", prompt: `Écris sans parenthèses :<br><span class="expr">${parts.join("")}</span>`, terms, answer: signs,
      explain: `Règle : + suivi de + donne + ; − suivi de − donne + ; + suivi de − donne − ; − suivi de + donne −.<br>${rules.join(" ; ")}.<br>Écriture simplifiée : <b>${simplified}</b>` };
  }
  function gen_algsum(lvl) {
    const vals = termsFor(lvl, true);
    const expr = fmt(vals[0]) + vals.slice(1).map(v => (v < 0 ? " − " : " + ") + fmt(abs(v))).join("");
    const ans = vals.reduce((s, v) => s + v, 0);
    const pos = vals.filter(v => v > 0), neg = vals.filter(v => v < 0);
    let trick = "";
    const seen = new Set(); const pairs = [];
    vals.forEach(v => { if (v > 0 && vals.includes(-v) && !seen.has(v)) { pairs.push(v); seen.add(v); } });
    if (pairs.length) trick = `Astuce : ${pairs.map(p => `${fmt(p)} et ${fmt(-p)} s'annulent`).join(", ")}.<br>`;
    const sp = pos.reduce((s, v) => s + v, 0), sn = neg.reduce((s, v) => s + v, 0);
    const ex = `${trick}On regroupe les positifs : ${pos.length ? pos.map(fmt).join(" + ") + " = " + fmt(sp) : "aucun"} ; les négatifs : ${neg.length ? neg.map(v => fmt(abs(v))).join(" + ") + " = " + fmt(abs(sn)) + " donc " + fmt(sn) : "aucun"}.<br>Puis ${fmt(sp)} + ${par(sn)} = <b>${fmt(ans)}</b>.`;
    return { type: "num", prompt: `Calcule astucieusement :<br><span class="expr">${expr}</span>`, answer: ans, explain: ex };
  }
  function factorsTxt(f) { return f.map((v, i) => i === 0 ? fmt(v) : par(v)).join(" × "); }
  function gen_sign(lvl) {
    const n = lvl <= 1 ? rnd(2, 3) : lvl === 2 ? rnd(3, 4) : rnd(4, 5);
    const f = []; for (let i = 0; i < n; i++) f.push(rnd(2, 9) * pick([-1, 1]));
    const neg = f.filter(v => v < 0).length;
    const isDiv = lvl >= 2 && n === 2 && Math.random() < 0.4;
    const txt = isDiv ? `${fmt(f[0])} ÷ ${par(f[1])}` : factorsTxt(f);
    const ans = neg % 2 === 0 ? "+" : "−";
    return { type: "mcq", prompt: `Sans calculer, quel est le signe de<br><span class="expr">${txt}</span> ?`,
      options: shuffle([{ t: "+ (positif)", ok: ans === "+" }, { t: "− (négatif)", ok: ans === "−" }]),
      explain: `On compte les facteurs <b>négatifs</b> : il y en a <b>${neg}</b> (${neg % 2 === 0 ? "pair" : "impair"}).<br>${neg % 2 === 0 ? "Nombre pair → le résultat est <b>positif</b>." : "Nombre impair → le résultat est <b>négatif</b>."}${n === 2 ? " (Deux nombres de " + (neg === 1 ? "signes contraires → négatif" : "même signe → positif") + ".)" : ""}` };
  }
  function gen_mul(lvl) {
    let a, b;
    if (lvl <= 1) { a = rnd(2, 9); b = rnd(2, 9); }
    else if (lvl === 2) { a = pick([rnd(2, 12), 10, 100, rnd(2, 9)]); b = rnd(2, 12); }
    else { a = pick([2.5, 1.5, 0.5, 0.2, 2.5, 1.2]); b = pick([2, 4, 6, 8, 9, 3]); if (Math.random() < 0.3) { const t = a; a = b; b = t; } }
    if (Math.random() < 0.5) a = -a; if (Math.random() < 0.5) b = -b;
    if (a > 0 && b > 0 && Math.random() < 0.8) { if (Math.random() < 0.5) a = -a; else b = -b; }
    const ans = r2(a * b);
    const same = (a < 0) === (b < 0);
    return { type: "num", prompt: `${fmt(a)} × ${par(b)} = ?`, answer: ans,
      explain: `Règle des signes : ${same ? "<b>même signe</b> → produit <b>positif</b>" : "<b>signes contraires</b> → produit <b>négatif</b>"}.<br>On multiplie les distances à zéro : ${fmt(abs(a))} × ${fmt(abs(b))} = ${fmt(abs(ans))}.<br>Résultat : <b>${fmt(ans)}</b>.` };
  }
  function gen_mul_many(lvl) {
    let f;
    if (lvl <= 1) { f = [rnd(2, 5), rnd(2, 5), rnd(2, 4)]; }
    else if (lvl === 2) { f = pick([[rnd(2, 5), 2, rnd(2, 5), 5], [rnd(2, 9), rnd(2, 5), rnd(2, 4)], [2.5, rnd(2, 9), 4]]); }
    else { f = pick([[2.5, rnd(2, 9), 4, rnd(2, 3)], [rnd(2, 9), 0.5, rnd(2, 9), 2], [1.5, 2, rnd(2, 9), rnd(2, 3)], [rnd(2, 5), 2, rnd(2, 9), 5]]); }
    f = shuffle(f).map(v => Math.random() < 0.5 ? -v : v);
    if (f.every(v => v > 0)) f[rnd(0, f.length - 1)] *= -1;
    const neg = f.filter(v => v < 0).length;
    const ans = r2(f.reduce((p, v) => p * v, 1));
    // regroupement astucieux
    const d = f.map(abs); let trick = "";
    const pairs = [[2.5, 4], [0.5, 2], [2, 5], [1.5, 2], [25, 4]];
    for (const [x, y] of pairs) { if (d.includes(x) && d.includes(y)) { trick = `Astuce : ${fmt(x)} × ${fmt(y)} = ${fmt(x * y)}. `; break; } }
    return { type: "num", prompt: `${factorsTxt(f)} = ?`, answer: ans,
      explain: `Il y a <b>${neg}</b> facteur${neg > 1 ? "s" : ""} négatif${neg > 1 ? "s" : ""} (${neg % 2 === 0 ? "pair → produit positif" : "impair → produit négatif"}).<br>Produit des distances à zéro : ${d.map(fmt).join(" × ")} = ${fmt(abs(ans))}. ${trick}<br>Résultat : <b>${fmt(ans)}</b>.` };
  }
  function gen_div(lvl) {
    let a, b, ans;
    if (lvl <= 1) { b = rnd(2, 9); ans = rnd(2, 9); a = b * ans; }
    else if (lvl === 2) { b = pick([2, 2, 4, 5, 3]); ans = b === 2 ? rnd(1, 9) + 0.5 : b === 4 ? pick([0.25, 0.75, 1.25, 2.5]) : b === 5 ? pick([0.2, 0.4, 1.2, 0.6]) : rnd(2, 9); a = r2(b * ans); }
    else { b = pick([2, 4, 5, 10, 3, 6]); ans = b === 10 ? rnd(1, 9) / 10 + rnd(0, 5) : b === 2 ? rnd(1, 15) + 0.5 : b === 4 ? pick([0.25, 0.75, 1.5, 2.25]) : b === 5 ? pick([0.4, 0.8, 1.4, 2.2]) : rnd(2, 12); a = r2(b * ans); }
    if (Math.random() < 0.5) a = -a; if (Math.random() < 0.5) b = -b;
    if (a > 0 && b > 0 && Math.random() < 0.8) { if (Math.random() < 0.5) a = -a; else b = -b; }
    ans = r2(a / b);
    const same = (a < 0) === (b < 0);
    const frac = lvl >= 2 && Math.random() < 0.5;
    const prompt = frac ? `<span class="frac"><span>${fmt(a)}</span><span>${b > 0 && Math.random() < 0.5 ? "+" : ""}${fmt(b)}</span></span> = ?` : `${fmt(a)} ÷ ${par(b)} = ?`;
    return { type: "num", prompt, answer: ans,
      explain: `Même règle des signes que la multiplication : ${same ? "<b>même signe</b> → quotient <b>positif</b>" : "<b>signes contraires</b> → quotient <b>négatif</b>"}.<br>On divise les distances à zéro : ${fmt(abs(a))} ÷ ${fmt(abs(b))} = ${fmt(abs(ans))}.<br>Résultat : <b>${fmt(ans)}</b>.` };
  }
  function gen_opp(lvl) {
    const v = lvl >= 2 && Math.random() < 0.5 ? dec1(9) * pick([-1, 1]) : rnd(1, 12) * pick([-1, 1]);
    const k = Math.random();
    if (k < 0.4) return { type: "num", prompt: `−1 × ${par(v)} = ?`, answer: -v, explain: `Multiplier par −1 donne l'<b>opposé</b> : −1 × a = −a.<br>Donc −1 × ${par(v)} = <b>${fmt(-v)}</b>.` };
    if (k < 0.7) return { type: "num", prompt: `Quel est l'opposé de ${fmt(v)} ?`, answer: -v, explain: `L'opposé d'un nombre a le même « éloignement » de zéro mais le signe contraire : l'opposé de ${fmt(v)} est <b>${fmt(-v)}</b>.` };
    return { type: "mcq", prompt: `Si <i>a</i> désigne un nombre relatif, que vaut −1 × <i>a</i> ?`,
      options: shuffle([{ t: "−a (l'opposé de a)", ok: true }, { t: "a", ok: false }, { t: "−1", ok: false }, { t: "a − 1", ok: false }]),
      explain: `En multipliant un nombre par −1, on trouve son <b>opposé</b> : −1 × a = <b>−a</b>. Exemple : −1 × 5 = −5 et −1 × (−5) = 5.` };
  }

  /* ---------- PARTIE 2 : géométrie ---------- */
  const PROPS = {
    D1: { fam: "D", text: "Si deux droites sont [perpendiculaires] à une même troisième alors elles sont [parallèles] entre elles.", fig: "D1" },
    D2: { fam: "D", text: "Si deux droites sont [parallèles] à une même troisième alors elles sont [parallèles] entre elles.", fig: "D2" },
    D3: { fam: "D", text: "Si deux droites sont [parallèles] et si une troisième est [perpendiculaire] à l'une alors elle est [perpendiculaire] à l'autre.", fig: "D3" },
    MD: { fam: "M", text: "La médiatrice d'un segment est la droite [perpendiculaire] à ce segment en son [milieu].", fig: "MD", def: true },
    M1: { fam: "M", text: "Si un point appartient à la [médiatrice] d'un segment alors il est [équidistant] des extrémités de ce segment.", fig: "M1" },
    M2: { fam: "M", text: "Si un point est [équidistant] des extrémités d'un segment alors il appartient à la [médiatrice] de ce segment.", fig: "M1" },
    PD: { fam: "P", text: "Un parallélogramme est un quadrilatère dont les côtés [opposés] sont [parallèles].", fig: "P1", def: true },
    P1: { fam: "P", text: "Si un quadrilatère est un [parallélogramme] alors ses côtés [opposés] sont parallèles.", fig: "P1" },
    P2: { fam: "P", text: "Si un quadrilatère a ses côtés opposés [parallèles] alors c'est un [parallélogramme].", fig: "P1" },
    P3: { fam: "P", text: "Si un quadrilatère est un parallélogramme alors ses [diagonales] ont le même [milieu].", fig: "P3" },
    P4: { fam: "P", text: "Si un quadrilatère a ses [diagonales] qui ont le même [milieu] alors c'est un [parallélogramme].", fig: "P3" },
    P5: { fam: "P", text: "Si un quadrilatère est un parallélogramme alors ses côtés [opposés] sont de même [longueur].", fig: "P5" },
    P6: { fam: "P", text: "Si un quadrilatère (non croisé) a ses côtés [opposés] de même [longueur] alors c'est un [parallélogramme].", fig: "P5" },
  };
  const WORDS = ["perpendiculaires", "parallèles", "sécantes", "perpendiculaire", "parallèle", "milieu", "médiatrice", "équidistant", "opposés", "consécutifs", "parallélogramme", "diagonales", "longueur", "rectangle", "losange", "extrémités", "centre", "symétrique"];
  const propPlain = p => p.text.replace(/\[([^\]]+)\]/g, "$1");
  const propBlanks = p => { const out = []; p.text.replace(/\[([^\]]+)\]/g, (m, w) => { out.push(w); return m; }); return out; };
  const propLabel = id => PROPS[id].def ? "Définition" : id;

  function gen_prop_blank(lvl) {
    const ids = Object.keys(PROPS);
    const id = pick(lvl <= 1 ? ids.filter(k => propBlanks(PROPS[k]).length <= 2) : ids);
    const p = PROPS[id]; const blanks = propBlanks(p);
    const nDistract = lvl <= 1 ? 2 : lvl === 2 ? 3 : 4;
    const distract = shuffle(WORDS.filter(w => !blanks.includes(w))).slice(0, nDistract);
    const words = shuffle([...new Set(blanks)].concat(distract));
    let i = 0;
    const html = esc(p.text).replace(/\[([^\]]+)\]/g, () => `<button class="blank" data-i="${i++}" type="button">…</button>`);
    return { type: "blank", prompt: `${p.def ? "Complète la définition" : "Complète la propriété <b>" + id + "</b>"} :<br><span class="sentence">${html}</span>`, words, answer: blanks, fig: p.fig,
      explain: `<b>${propLabel(id)}</b> : ${esc(propPlain(p))}` };
  }

  // situations : données → conclusion, avec la propriété qui le justifie
  const ITEMS = [
    { prop: "D1", fig: "D1", given: "(d₁) ⊥ (d) et (d₂) ⊥ (d)", concl: "(d₁) // (d₂)", wrong: ["(d₁) ⊥ (d₂)", "(d₁) et (d₂) sont sécantes", "(d₁) // (d)"] },
    { prop: "D1", fig: "D1", given: "(AB) ⊥ (AC) et (DE) ⊥ (AC)", concl: "(AB) // (DE)", wrong: ["(AB) ⊥ (DE)", "(AB) // (AC)", "(DE) ⊥ (AB)"] },
    { prop: "D2", fig: "D2", given: "(d₁) // (d) et (d₂) // (d)", concl: "(d₁) // (d₂)", wrong: ["(d₁) ⊥ (d₂)", "(d₁) et (d₂) sont sécantes", "(d₁) ⊥ (d)"] },
    { prop: "D3", fig: "D3", given: "(d) // (d′) et (Δ) ⊥ (d)", concl: "(Δ) ⊥ (d′)", wrong: ["(Δ) // (d′)", "(d) ⊥ (d′)", "(Δ) // (d)"] },
    { prop: "D3", fig: "D3", given: "(AB) // (DC) et d ⊥ (AB)", concl: "d ⊥ (DC)", wrong: ["d // (DC)", "(AB) ⊥ (DC)", "d // (AB)"] },
    { prop: "M1", fig: "M1", given: "M appartient à la médiatrice de [AB]", concl: "MA = MB", wrong: ["M est le milieu de [AB]", "MA = AB", "M ∈ [AB]"] },
    { prop: "M2", fig: "M1", given: "MA = MB", concl: "M appartient à la médiatrice de [AB]", wrong: ["M est le milieu de [AB]", "M ∈ (AB)", "(MA) ⊥ (MB)"] },
    { prop: "P1", fig: "P1", given: "ABCD est un parallélogramme", concl: "(AB) // (DC)", wrong: ["(AB) ⊥ (DC)", "(AB) // (BC)", "AB = BC"] },
    { prop: "P2", fig: "P1", given: "(EF) // (GH) et (EH) // (FG)", concl: "EFGH est un parallélogramme", wrong: ["EFGH est un rectangle", "(EF) ⊥ (EH)", "EF = EH"] },
    { prop: "P3", fig: "P3", given: "IJKL est un parallélogramme", concl: "[IK] et [JL] ont le même milieu", wrong: ["IK = JL", "(IK) ⊥ (JL)", "I est le milieu de [JL]"] },
    { prop: "P4", fig: "P3", given: "[AC] et [BD] ont le même milieu", concl: "ABCD est un parallélogramme", wrong: ["ABCD est un losange", "AC = BD", "(AC) ⊥ (BD)"] },
    { prop: "P5", fig: "P5", given: "ABCD est un parallélogramme", concl: "AB = DC", wrong: ["AB = BC", "AC = BD", "(AB) ⊥ (DC)"] },
    { prop: "P6", fig: "P5", given: "EFGH est un quadrilatère non croisé avec EF = HG et EH = FG", concl: "EFGH est un parallélogramme", wrong: ["EFGH est un carré", "(EF) ⊥ (FG)", "EG = FH"] },
  ];
  const NON_DEF = Object.keys(PROPS).filter(k => !PROPS[k].def);
  function propOptions(correctId, n = 4) {
    const fam = PROPS[correctId].fam;
    const same = shuffle(NON_DEF.filter(k => k !== correctId && PROPS[k].fam === fam));
    const others = shuffle(NON_DEF.filter(k => k !== correctId && PROPS[k].fam !== fam));
    const ids = [correctId].concat(same, others).slice(0, n);
    return shuffle(ids.map(id => ({ t: `<b>${id}</b> — ${esc(propPlain(PROPS[id]))}`, ok: id === correctId })));
  }
  function gen_prop_conclude(lvl) {
    const it = pick(ITEMS);
    return { type: "mcq", prompt: `On sait que : <b>${esc(it.given)}</b>.<br>Que peut-on en conclure ?`, fig: it.fig,
      options: shuffle([{ t: esc(it.concl), ok: true }].concat(it.wrong.map(w => ({ t: esc(w), ok: false })))),
      explain: `On utilise <b>${it.prop}</b> : ${esc(propPlain(PROPS[it.prop]))}<br>Donc <b>${esc(it.concl)}</b>.` };
  }
  function gen_prop_which(lvl) {
    const it = pick(ITEMS);
    return { type: "mcq", prompt: `On sait que <b>${esc(it.given)}</b>, et on veut démontrer que <b>${esc(it.concl)}</b>.<br>Quelle propriété permet de conclure ?`, fig: it.fig,
      options: propOptions(it.prop, lvl <= 1 ? 3 : 4),
      explain: `Les données sont « ${esc(it.given)} » et la conclusion « ${esc(it.concl)} » : c'est exactement la forme de <b>${it.prop}</b> : ${esc(propPlain(PROPS[it.prop]))}` };
  }

  // Réciproques : A → B ; nA / nB = négations pour fabriquer les distracteurs
  const RECIP = [
    { A: "Anne est majeure", B: "Anne a au moins 18 ans", nA: "Anne n'est pas majeure", nB: "Anne a moins de 18 ans", t: true, rt: true, why: "Être majeur, c'est exactement avoir au moins 18 ans : les deux sens sont vrais." },
    { A: "Franck est français", B: "Franck est européen", nA: "Franck n'est pas français", nB: "Franck n'est pas européen", t: true, rt: false, why: "Un Européen n'est pas forcément français : il peut être allemand ou italien. La réciproque est fausse." },
    { A: "M ∈ [AB]", B: "M ∈ (AB)", nA: "M ∉ [AB]", nB: "M ∉ (AB)", t: true, rt: false, why: "Un point de la droite (AB) peut être en dehors du segment [AB]. La réciproque est fausse." },
    { A: "M est le milieu de [AB]", B: "MA = MB", nA: "M n'est pas le milieu de [AB]", nB: "MA ≠ MB", t: true, rt: false, why: "Si MA = MB, M peut être n'importe où sur la médiatrice de [AB], pas seulement au milieu. La réciproque est fausse." },
    { A: "M est un point de la médiatrice de [AB]", B: "MA = MB", nA: "M n'est pas sur la médiatrice de [AB]", nB: "MA ≠ MB", t: true, rt: true, why: "C'est la propriété M1, et sa réciproque est M2 : les deux sont vraies." },
    { A: "F est le symétrique de C par rapport à I", B: "I est le milieu de [CF]", nA: "F n'est pas le symétrique de C par rapport à I", nB: "I n'est pas le milieu de [CF]", t: true, rt: true, why: "Symétrique par rapport à un point et milieu, c'est la même chose : les deux sens sont vrais." },
    { A: "𝒟 est la médiatrice de [EG]", B: "E et G sont symétriques par rapport à 𝒟", nA: "𝒟 n'est pas la médiatrice de [EG]", nB: "E et G ne sont pas symétriques par rapport à 𝒟", t: true, rt: true, why: "Deux points symétriques par rapport à une droite : cette droite est la médiatrice du segment. Les deux sens sont vrais." },
    { A: "ABCD est un parallélogramme", B: "les diagonales de ABCD se coupent en leur milieu", nA: "ABCD n'est pas un parallélogramme", nB: "les diagonales de ABCD ne se coupent pas en leur milieu", t: true, rt: true, why: "C'est P3, et sa réciproque est P4 : les deux sont vraies." },
    { A: "un quadrilatère est un carré", B: "c'est un rectangle", nA: "un quadrilatère n'est pas un carré", nB: "ce n'est pas un rectangle", t: true, rt: false, why: "Un rectangle n'est pas forcément un carré (ses côtés peuvent être de longueurs différentes). La réciproque est fausse." },
    { A: "un nombre est divisible par 10", B: "il est divisible par 5", nA: "un nombre n'est pas divisible par 10", nB: "il n'est pas divisible par 5", t: true, rt: false, why: "15 est divisible par 5 mais pas par 10. La réciproque est fausse." },
    { A: "il pleut", B: "le sol est mouillé", nA: "il ne pleut pas", nB: "le sol est sec", t: true, rt: false, why: "Le sol peut être mouillé parce qu'on l'a arrosé. La réciproque est fausse." },
    { A: "x = 3", B: "x² = 9", nA: "x ≠ 3", nB: "x² ≠ 9", t: true, rt: false, why: "(−3)² = 9 aussi : si x² = 9, x peut valoir −3. La réciproque est fausse." },
    { A: "un animal est un chat", B: "c'est un mammifère", nA: "un animal n'est pas un chat", nB: "ce n'est pas un mammifère", t: true, rt: false, why: "Un chien est un mammifère mais pas un chat. La réciproque est fausse." },
    { A: "un triangle est équilatéral", B: "ses trois côtés ont la même longueur", nA: "un triangle n'est pas équilatéral", nB: "ses côtés n'ont pas tous la même longueur", t: true, rt: true, why: "C'est la définition même d'un triangle équilatéral : les deux sens sont vrais." },
    { A: "un quadrilatère est un losange", B: "ses quatre côtés ont la même longueur", nA: "un quadrilatère n'est pas un losange", nB: "ses côtés n'ont pas tous la même longueur", t: true, rt: true, why: "C'est la définition du losange : les deux sens sont vrais." },
    { A: "ABCD est un rectangle", B: "ABCD est un parallélogramme", nA: "ABCD n'est pas un rectangle", nB: "ABCD n'est pas un parallélogramme", t: true, rt: false, why: "Un parallélogramme n'a pas forcément d'angle droit. La réciproque est fausse." },
  ];
  const stmt = (a, b) => `Si ${a} alors ${b}`;
  function gen_reciprocal(lvl) {
    const r = pick(RECIP);
    const k = Math.random();
    if (k < 0.45) {
      return { type: "mcq", prompt: `Quelle est la <b>réciproque</b> de l'énoncé :<br><span class="sentence">« ${esc(stmt(r.A, r.B))}. »</span>`,
        options: shuffle([{ t: esc(stmt(r.B, r.A)), ok: true }, { t: esc(stmt(r.nB, r.nA)), ok: false }, { t: esc(stmt(r.nA, r.nB)), ok: false }, { t: esc(stmt(r.A, r.B)), ok: false }]),
        explain: `La réciproque s'obtient en <b>échangeant la condition et la conclusion</b> (sans rien nier) : « ${esc(stmt(r.B, r.A))}. »` };
    }
    if (k < 0.7) {
      return { type: "mcq", prompt: `L'énoncé suivant est-il vrai ou faux ?<br><span class="sentence">« ${esc(stmt(r.A, r.B))}. »</span>`,
        options: [{ t: "Vrai", ok: r.t }, { t: "Faux", ok: !r.t }],
        explain: `Cet énoncé est <b>${r.t ? "vrai" : "faux"}</b>. ${esc(r.why)}` };
    }
    return { type: "mcq", prompt: `On sait que l'énoncé « ${esc(stmt(r.A, r.B))} » est vrai.<br>Sa <b>réciproque</b> « ${esc(stmt(r.B, r.A))} » est-elle vraie ?`,
      options: [{ t: "Vrai", ok: r.rt }, { t: "Faux", ok: !r.rt }],
      explain: `La réciproque est <b>${r.rt ? "vraie" : "fausse"}</b>. ${esc(r.why)}<br>Rappel : un énoncé vrai peut avoir une réciproque fausse !` };
  }

  const DEMOS = ITEMS.map(it => ({ lines: [`On sait que ${it.given}.`, `Si ${propPlain(PROPS[it.prop]).replace(/^Si /, "").replace(/\.$/, "")}.`, `Donc ${it.concl}.`], prop: it.prop, item: it }));
  const DEMO2 = [{ lines: ["On sait que ABCD est un parallélogramme.", "Si un quadrilatère est un parallélogramme alors ses côtés opposés sont parallèles.", "Donc (AB) // (DC).", "On sait que (AB) // (DC) et d ⊥ (AB).", "Si deux droites sont parallèles et si une troisième est perpendiculaire à l'une alors elle est perpendiculaire à l'autre.", "Donc d ⊥ (DC)."] },
    { lines: ["On sait que (d₁) ⊥ (d) et (d₂) ⊥ (d).", "Si deux droites sont perpendiculaires à une même troisième alors elles sont parallèles entre elles.", "Donc (d₁) // (d₂).", "On sait que (d₁) // (d₂) et (Δ) ⊥ (d₁).", "Si deux droites sont parallèles et si une troisième est perpendiculaire à l'une alors elle est perpendiculaire à l'autre.", "Donc (Δ) ⊥ (d₂)."] }];
  function gen_demo_order(lvl) {
    const two = lvl >= 3 && Math.random() < 0.5;
    const d = two ? pick(DEMO2) : pick(DEMOS);
    let lines = shuffle(d.lines); let guard = 0;
    while (lines.every((l, i) => l === d.lines[i]) && guard++ < 10) lines = shuffle(d.lines);
    return { type: "order", prompt: two ? "Remets cette démonstration <b>en deux étapes</b> dans l'ordre :" : "Remets la démonstration dans l'ordre :", lines, answer: d.lines,
      explain: `Une démonstration se rédige toujours dans cet ordre : <b>On sait que</b> (les données) → <b>Si… alors…</b> (la propriété) → <b>Donc</b> (la conclusion).${two ? " Avec deux étapes, la conclusion de la première sert de donnée à la seconde." : ""}<br>${d.lines.map(l => esc(l)).join("<br>")}` };
  }
  function gen_demo_build(lvl) {
    const it = pick(ITEMS);
    return { type: "build", prompt: `Complète la démonstration.<br><span class="sentence">On sait que <b>${esc(it.given)}</b>.</span>`, fig: it.fig,
      steps: [{ label: "Si … alors … : quelle propriété ?", options: propOptions(it.prop, 4) },
        { label: "Donc … : quelle conclusion ?", options: shuffle([{ t: esc(it.concl), ok: true }].concat(it.wrong.map(w => ({ t: esc(w), ok: false })))) }],
      explain: `On sait que ${esc(it.given)}.<br>Si ${esc(propPlain(PROPS[it.prop]).replace(/^Si /, ""))}<br>Donc <b>${esc(it.concl)}</b>.` };
  }

  const NOTA = [
    { q: "Que désigne <b>[AB]</b> ?", ok: "Le segment d'extrémités A et B", wrong: ["La droite passant par A et B", "La longueur AB", "La demi-droite d'origine A"] },
    { q: "Que désigne <b>(AB)</b> ?", ok: "La droite passant par A et B", wrong: ["Le segment d'extrémités A et B", "La longueur AB", "Le milieu de A et B"] },
    { q: "Que désigne <b>AB</b> (sans crochets ni parenthèses) ?", ok: "La longueur du segment [AB]", wrong: ["La droite passant par A et B", "Le segment d'extrémités A et B", "Le point au milieu de A et B"] },
    { q: "Que signifie <b>d ⊥ (AB)</b> ?", ok: "d est perpendiculaire à (AB)", wrong: ["d est parallèle à (AB)", "d passe par A et B", "d est la médiatrice de [AB]"] },
    { q: "Que signifie <b>(AB) // (CD)</b> ?", ok: "(AB) et (CD) sont parallèles", wrong: ["(AB) et (CD) sont perpendiculaires", "(AB) et (CD) sont sécantes", "AB = CD"] },
    { q: "Que signifie <b>M ∈ (AB)</b> ?", ok: "M appartient à la droite (AB)", wrong: ["M est entre A et B", "M est le milieu de [AB]", "MA = MB"] },
    { q: "Ce que l'on <b>devine</b> en regardant une figure s'appelle…", ok: "une conjecture", wrong: ["une démonstration", "une hypothèse", "une conclusion"] },
    { q: "Pour <b>prouver</b> qu'une conjecture est vraie, il faut faire…", ok: "une démonstration", wrong: ["une figure plus précise", "une mesure", "un codage"] },
    { q: "Les données de l'énoncé s'appellent aussi…", ok: "les hypothèses", wrong: ["les conclusions", "les conjectures", "les propriétés"] },
    { q: "Sur une figure codée, on ne code que…", ok: "les données (hypothèses)", wrong: ["la conclusion", "ce que l'on devine", "les longueurs"] },
    { q: "Les « outils » utilisés dans une démonstration sont…", ok: "les propriétés", wrong: ["les conjectures", "les mesures", "les figures"] },
    { q: "Une démonstration rédigée suit l'ordre…", ok: "On sait que → Si… alors… → Donc", wrong: ["Donc → On sait que → Si… alors…", "Si… alors… → Donc → On sait que", "On sait que → Donc → Si… alors…"] },
    { q: "Dans une propriété « Si A alors B », A est…", ok: "la condition (hypothèse)", wrong: ["la conclusion", "la réciproque", "la conjecture"] },
    { q: "Pour obtenir la réciproque d'une propriété, on…", ok: "échange la condition et la conclusion", wrong: ["nie la condition et la conclusion", "garde la condition et nie la conclusion", "remplace « si » par « donc »"] },
    { q: "Un énoncé vrai peut-il avoir une réciproque fausse ?", ok: "Oui", wrong: ["Non, jamais", "Seulement en géométrie", "Seulement si l'énoncé est une définition"] },
    { q: "La médiatrice d'un segment est…", ok: "la droite perpendiculaire au segment en son milieu", wrong: ["la droite qui passe par ses deux extrémités", "le point au milieu du segment", "une droite parallèle au segment"] },
    { q: "Un parallélogramme est un quadrilatère dont…", ok: "les côtés opposés sont parallèles", wrong: ["les quatre côtés ont la même longueur", "les quatre angles sont droits", "les diagonales sont perpendiculaires"] },
  ];
  function gen_notation(lvl) {
    const n = pick(NOTA);
    const nOpt = lvl <= 1 ? 3 : 4;
    return { type: "mcq", prompt: n.q, options: shuffle([{ t: n.ok, ok: true }].concat(shuffle(n.wrong).slice(0, nOpt - 1).map(w => ({ t: w, ok: false })))), explain: `Réponse : <b>${n.ok}</b>.` };
  }

  const GEN = { add_same: gen_add_same, add_diff: gen_add_diff, sub: gen_sub, simplify: gen_simplify, algsum: gen_algsum, sign: gen_sign, mul: gen_mul, mul_many: gen_mul_many, div: gen_div, opp: gen_opp,
    notation: gen_notation, prop_blank: gen_prop_blank, prop_conclude: gen_prop_conclude, prop_which: gen_prop_which, reciprocal: gen_reciprocal, demo_order: gen_demo_order, demo_build: gen_demo_build };

  function generate(skillId, lvl) { const q = GEN[skillId](Math.max(0, Math.min(4, lvl | 0))); q.skill = skillId; q.lvl = lvl; return q; }

  /* ---------- vérification ---------- */
  // réponse utilisateur : num → string ; mcq → index ; signs → array de "+"/"−" ; blank → array de mots ; order → array de lignes ; build → array d'index
  function checkAnswer(q, user) {
    switch (q.type) {
      case "num": { const v = parseNum(user); return v !== null && sameNum(v, q.answer); }
      case "mcq": return !!(q.options[user] && q.options[user].ok);
      case "signs": return Array.isArray(user) && user.length === q.answer.length && user.every((s, i) => s === q.answer[i]);
      case "blank": return Array.isArray(user) && user.length === q.answer.length && user.every((w, i) => w === q.answer[i]);
      case "order": return Array.isArray(user) && user.length === q.answer.length && user.every((l, i) => l === q.answer[i]);
      case "build": return Array.isArray(user) && q.steps.every((st, i) => st.options[user[i]] && st.options[user[i]].ok);
    }
    return false;
  }
  function correctText(q) {
    switch (q.type) {
      case "num": return fmt(q.answer);
      case "mcq": return q.options.find(o => o.ok).t;
      case "signs": return q.terms[0] + q.answer.map((s, i) => ` ${s} ${q.terms[i + 1]}`).join("");
      case "blank": return q.answer.join(", ");
      case "order": return q.answer.join(" ");
      case "build": return q.steps.map(st => st.options.find(o => o.ok).t).join(" → ");
    }
    return "";
  }

  /* ---------- contrôle blanc ---------- */
  // 20 points : partie 1 (relatifs) 10 pts, partie 2 (géométrie) 10 pts
  const TEST_PLAN = [
    { skill: "add_same", lvl: 2, pts: 1 }, { skill: "add_diff", lvl: 3, pts: 1 }, { skill: "sub", lvl: 2, pts: 1 }, { skill: "simplify", lvl: 2, pts: 1 }, { skill: "algsum", lvl: 2, pts: 1 },
    { skill: "sign", lvl: 3, pts: 1 }, { skill: "mul", lvl: 2, pts: 1 }, { skill: "mul_many", lvl: 2, pts: 1 }, { skill: "div", lvl: 2, pts: 1 }, { skill: "opp", lvl: 2, pts: 1 },
    { skill: "notation", lvl: 2, pts: 1 }, { skill: "prop_blank", lvl: 2, pts: 1 }, { skill: "prop_blank", lvl: 3, pts: 1 }, { skill: "prop_conclude", lvl: 2, pts: 1 }, { skill: "prop_which", lvl: 2, pts: 1 },
    { skill: "reciprocal", lvl: 2, pts: 1 }, { skill: "reciprocal", lvl: 2, pts: 1 }, { skill: "demo_order", lvl: 2, pts: 1 }, { skill: "demo_build", lvl: 2, pts: 1 }, { skill: "demo_order", lvl: 3, pts: 1 },
  ];
  function buildTest() { return TEST_PLAN.map((p, i) => { const q = generate(p.skill, p.lvl); q.pts = p.pts; q.n = i + 1; q.part = skillById(p.skill).part; return q; }); }

  const api = { SKILLS, skillById, PROPS, ITEMS, RECIP, NOTA, WORDS, generate, checkAnswer, correctText, parseNum, sameNum, fmt, par, sgn, propPlain, propBlanks, propLabel, buildTest, TEST_PLAN, shuffle, pick, rnd, r2, esc };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Engine = api;
})(typeof window !== "undefined" ? window : globalThis);
