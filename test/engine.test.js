// node test/engine.test.js — vérifie le moteur sur des milliers de questions générées
const E = require("../engine.js");
let fails = 0, total = 0;
const fail = (msg, q) => { fails++; if (fails <= 30) console.log("FAIL", msg, JSON.stringify(q).slice(0, 300)); };

// évalue indépendamment une expression affichée (sans HTML) : −3 + (−4) ; 2,5 × (−4) ; −8 ÷ (−2)
function evalExpr(txt) {
  let s = txt.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  s = s.replace(/[−–]/g, "-").replace(/×/g, "*").replace(/÷/g, "/").replace(/(\d),(\d)/g, "$1.$2").replace(/=\s*\?/, "").trim();
  s = s.replace(/^.*?:/, "").trim(); // retire "Calcule astucieusement :"
  if (!/^[\d\s().+\-*/]+$/.test(s)) return null;
  try { return Function("return (" + s + ")")(); } catch (e) { return null; }
}
const hasOneOk = opts => opts.filter(o => o.ok).length === 1;
const uniq = arr => new Set(arr).size === arr.length;
const clean = s => typeof s === "string" && s.length > 0 && !/NaN|undefined|null|\[object/.test(s);

for (const sk of E.SKILLS) {
  for (let lvl = 0; lvl <= 4; lvl++) {
    for (let i = 0; i < 400; i++) {
      total++;
      let q;
      try { q = E.generate(sk.id, lvl); } catch (e) { fail("exception " + sk.id + " lvl" + lvl + " " + e.message); continue; }
      if (!clean(q.prompt)) fail("prompt sale " + sk.id, q);
      if (!clean(q.explain)) fail("explain sale " + sk.id, q);
      if (q.type === "num") {
        if (typeof q.answer !== "number" || !isFinite(q.answer)) fail("answer non numérique", q);
        if (Math.round(q.answer * 100) / 100 !== q.answer) fail("answer > 2 décimales", q);
        if (!E.checkAnswer(q, E.fmt(q.answer))) fail("checkAnswer rejette la bonne réponse formatée", q);
        if (!E.checkAnswer(q, String(q.answer).replace(".", ","))) fail("checkAnswer rejette virgule", q);
        if (q.answer > 0 && !E.checkAnswer(q, "+" + String(q.answer))) fail("checkAnswer rejette +x", q);
        if (E.checkAnswer(q, String(q.answer + 1))) fail("checkAnswer accepte faux", q);
        if (E.checkAnswer(q, "")) fail("checkAnswer accepte vide", q);
        if (!/frac|opposé|−1 ×/.test(q.prompt)) {
          const v = evalExpr(q.prompt);
          if (v === null) fail("expression inévaluable", q);
          else if (Math.abs(v - q.answer) > 1e-6) fail("réponse ≠ évaluation indépendante (" + v + ")", q);
        }
        if (/\(\(/.test(q.prompt) || /\+ -|- -|\+ \+/.test(q.prompt.replace(/−/g, "-"))) fail("écriture invalide", q);
      } else if (q.type === "mcq") {
        if (!Array.isArray(q.options) || q.options.length < 2) fail("options manquantes", q);
        else {
          if (!hasOneOk(q.options)) fail("pas exactement une bonne option", q);
          if (!uniq(q.options.map(o => o.t))) fail("options en double", q);
          const ok = q.options.findIndex(o => o.ok), ko = q.options.findIndex(o => !o.ok);
          if (!E.checkAnswer(q, ok)) fail("mcq bonne réponse refusée", q);
          if (E.checkAnswer(q, ko)) fail("mcq mauvaise réponse acceptée", q);
          if (E.checkAnswer(q, 99)) fail("mcq index hors limites accepté", q);
        }
      } else if (q.type === "signs") {
        if (q.terms.length !== q.answer.length + 1) fail("signs: terms/answer incohérents", q);
        if (!q.answer.every(s => s === "+" || s === "−")) fail("signs: signe invalide", q);
        if (!E.checkAnswer(q, q.answer.slice())) fail("signs: bonne réponse refusée", q);
        const bad = q.answer.slice(); bad[0] = bad[0] === "+" ? "−" : "+";
        if (E.checkAnswer(q, bad)) fail("signs: mauvaise réponse acceptée", q);
        // cohérence avec évaluation : expression avec parenthèses = expression simplifiée
        const v = evalExpr(q.prompt.replace(/^.*?:/, ""));
        const simp = E.correctText(q);
        const v2 = evalExpr(simp);
        if (v === null || v2 === null || Math.abs(v - v2) > 1e-6) fail("signs: simplification ≠ expression (" + v + " vs " + v2 + ")", q);
      } else if (q.type === "blank") {
        const nb = (q.prompt.match(/class="blank"/g) || []).length;
        if (nb !== q.answer.length) fail("blank: nb de trous ≠ réponses", q);
        if (!q.answer.every(w => q.words.includes(w))) fail("blank: mot attendu absent de la banque", q);
        if (!uniq(q.words)) fail("blank: banque en double", q);
        if (q.words.length < q.answer.length + 1) fail("blank: pas de distracteur", q);
        if (!E.checkAnswer(q, q.answer.slice())) fail("blank: bonne réponse refusée", q);
        if (E.checkAnswer(q, q.answer.slice().reverse()) && q.answer[0] !== q.answer[q.answer.length - 1]) fail("blank: ordre inversé accepté", q);
      } else if (q.type === "order") {
        if (q.lines.slice().sort().join("|") !== q.answer.slice().sort().join("|")) fail("order: lignes ≠ réponse", q);
        if (q.lines.every((l, i) => l === q.answer[i])) fail("order: déjà dans l'ordre", q);
        if (!/^On sait que/.test(q.answer[0]) || !/^Si /.test(q.answer[1]) || !/^Donc/.test(q.answer[2])) fail("order: structure", q);
        if (!E.checkAnswer(q, q.answer.slice())) fail("order: bonne réponse refusée", q);
        if (E.checkAnswer(q, q.lines.slice())) fail("order: mauvais ordre accepté", q);
      } else if (q.type === "build") {
        if (q.steps.length !== 2) fail("build: 2 étapes attendues", q);
        q.steps.forEach(st => { if (!hasOneOk(st.options)) fail("build: étape sans unique bonne option", q); if (!uniq(st.options.map(o => o.t))) fail("build: options en double", q); });
        const good = q.steps.map(st => st.options.findIndex(o => o.ok));
        if (!E.checkAnswer(q, good)) fail("build: bonne réponse refusée", q);
        const bad = good.slice(); bad[1] = q.steps[1].options.findIndex(o => !o.ok);
        if (E.checkAnswer(q, bad)) fail("build: mauvaise conclusion acceptée", q);
      } else fail("type inconnu " + q.type, q);
      if (!clean(E.correctText(q))) fail("correctText sale", q);
    }
  }
}

// parseNum
const pn = [["-3,5", -3.5], ["−3,5", -3.5], ["+12", 12], [" 7 ", 7], ["3.25", 3.25], ["abc", null], ["", null], ["--3", null], ["3,", null]];
for (const [s, v] of pn) { total++; const got = E.parseNum(s); if (got !== v) fail("parseNum(" + s + ") = " + got); }
// fmt
const fm = [[-3.5, "−3,5"], [12, "12"], [0.25, "0,25"], [-120, "−120"], [0, "0"]];
for (const [n, s] of fm) { total++; if (E.fmt(n) !== s) fail("fmt(" + n + ") = " + E.fmt(n)); }
// contrôle blanc
for (let i = 0; i < 50; i++) {
  total++;
  const t = E.buildTest();
  if (t.length !== 20) fail("test: 20 questions attendues");
  const p1 = t.filter(q => q.part === 1).reduce((s, q) => s + q.pts, 0), p2 = t.filter(q => q.part === 2).reduce((s, q) => s + q.pts, 0);
  if (p1 !== 10 || p2 !== 10) fail("test: barème " + p1 + "/" + p2);
}
// couverture des propriétés par ITEMS
const covered = new Set(E.ITEMS.map(i => i.prop));
for (const id of Object.keys(E.PROPS)) { if (!E.PROPS[id].def && !covered.has(id)) { total++; fail("propriété sans situation : " + id); } }

console.log(`${total} vérifications, ${fails} échec(s)`);
process.exit(fails ? 1 : 0);
