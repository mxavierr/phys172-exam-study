#!/usr/bin/env node
/* =====================================================================
   MA 261 Exam 2 · structural harness + sample dump for tests/check.py
   usage: node tests/dump.js [N=150 structural runs per id] [K=12 samples per id] [idPrefix]
   - loads only the Exam 2 content files from ../src (never edits them)
   - runs every sprint generator (GEN) and mock-exam template (XGEN) N times
   - prints structural problems per id, writes tests/samples.json (K per id)
   exit code 1 when any structural ERROR was found (warnings do not fail)
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'src');
const FILES = ['partB.js', 'partM.js', 'xcore.js', 'h2.js', 'c16a.js', 'c16b.js', 'c17.js', 'reg2.js'];
const N = +(process.argv[2] || 150), K = +(process.argv[3] || 12), ONLY = process.argv[4] || '';

let src = '';
for (const f of FILES) src += fs.readFileSync(path.join(SRC, f), 'utf8') + '\n';
src = src.replace('<script>', '').replace('(function(){', '') + ';module.exports={GEN,XGEN,mParse,mEval};';
const M = { exports: {} };
new Function('module', 'document', 'window', src)(M, { getElementById: () => null }, {});
const { GEN, XGEN, mParse, mEval } = M.exports;

/* ---------- helpers ---------- */
const stripTags = s => String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function numOf(s, vec) {
  try {
    const v = mEval(mParse(s), {});
    if (Array.isArray(v)) return v.every(Number.isFinite) ? v : null;
    return Number.isFinite(v) ? v : null;
  } catch (e) { return null; }
}
const parses = s => { try { mParse(s); return true; } catch (e) { return false; } };
const close = (a, b) => {
  if (a == null || b == null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    const L = Math.max(a.length, b.length);
    for (let i = 0; i < L; i++) if (!close(a[i] || 0, b[i] || 0)) return false;
    return true;
  }
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
};
/* every string inside a value (deep), with its path */
function strings(o, p, out) {
  out = out || [];
  if (typeof o === 'string') out.push([p, o]);
  else if (Array.isArray(o)) o.forEach((x, i) => strings(x, p + '[' + i + ']', out));
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) strings(o[k], p + '.' + k, out);
  return out;
}
/* LaTeX segments \( … \) and \[ … \]; returns list of problems */
function latexProblems(s) {
  const probs = [];
  const re = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
  let m;
  while ((m = re.exec(s))) {
    const seg = m[1] !== undefined ? m[1] : m[2];
    let d = 0, bad = false;
    for (let i = 0; i < seg.length; i++) {
      const c = seg[i];
      if (c === '\\') { i++; continue; }           /* skip escaped char (\{ \} \\ …) */
      if (c === '{') d++;
      else if (c === '}') { d--; if (d < 0) { bad = true; break; } }
    }
    if (bad || d !== 0) probs.push('unbalanced braces in \\(' + seg.slice(0, 80) + '\\)');
    const L = (seg.match(/\\left(?![a-zA-Z])/g) || []).length, R = (seg.match(/\\right(?![a-zA-Z])/g) || []).length;
    if (L !== R) probs.push('\\left/\\right mismatch in \\(' + seg.slice(0, 80) + '\\)');
    if (/\\\(|\\\[/.test(seg)) probs.push('nested math delimiters in \\(' + seg.slice(0, 80) + '\\)');
    if (/\\frac\s*$/.test(seg) || /\^\s*$/.test(seg) || /_\s*$/.test(seg)) probs.push('dangling operator at end of \\(' + seg.slice(-40) + '\\)');
  }
  /* unmatched delimiters outside */
  const o1 = (s.match(/\\\(/g) || []).length, c1 = (s.match(/\\\)/g) || []).length;
  const o2 = (s.match(/\\\[/g) || []).length, c2 = (s.match(/\\\]/g) || []).length;
  if (o1 !== c1) probs.push('unmatched \\( \\) delimiters (' + o1 + ' vs ' + c1 + ')');
  if (o2 !== c2) probs.push('unmatched \\[ \\] delimiters (' + o2 + ' vs ' + c2 + ')');
  return probs;
}
/* strings the student sees (text, options, solutions) */
function visible(o, exam) {
  const out = [];
  if (exam) { out.push(['stem', o.stem]); (o.opts || []).forEach((x, i) => { out.push(['opts[' + i + '].h', x.h]); out.push(['opts[' + i + '].why', x.why]); }); }
  else {
    out.push(['q', o.q]);
    (o.opts || []).forEach((x, i) => { out.push(['opts[' + i + '].h', x.h]); out.push(['opts[' + i + '].why', x.why]); });
    (o.dis || []).forEach((x, i) => { if (x.h !== undefined) out.push(['dis[' + i + '].h', x.h]); out.push(['dis[' + i + '].why', x.why]); });
  }
  out.push(['how', o.how]);
  (o.sol || []).forEach((r, i) => (Array.isArray(r) ? r : [r]).forEach((x, j) => out.push(['sol[' + i + '][' + j + ']', x])));
  return out;
}

/* ---------- structural check of one problem ---------- */
function structural(o, exam) {
  const E = [], W = [];
  const kind = o.kind;
  if (!o.how || !String(o.how).trim()) E.push('empty how');
  if (!Array.isArray(o.sol) || !o.sol.length) E.push('empty sol');
  if (!o.chk || typeof o.chk !== 'object' || !o.chk.op) E.push('missing chk');
  for (const [p, s] of strings(o, 'o')) {
    const s2 = s.replace(/\bis undefined\b|\bundefined (at|on|for|where|when|along|inside)\b/g, '');
    if (/undefined|NaN|\[object Object\]/.test(s2)) E.push(`${p} contains "${(s2.match(/undefined|NaN|\[object Object\]/) || [])[0]}": ${stripTags(s).slice(0, 90)}`);
  }
  for (const [p, s] of visible(o, exam)) {
    if (s === undefined || s === null) continue;
    if (typeof s !== 'string') { E.push(`${p} is a ${Array.isArray(s) ? 'array' : typeof s}, not text`); continue; }
    for (const lp of latexProblems(s)) E.push(`${p}: ${lp}`);
  }
  const whyOk = w => typeof w === 'string' && w.trim().length > 0;
  if (exam) {
    if (!o.stem || !String(o.stem).trim()) E.push('empty stem');
    const op = o.opts || [];
    if (op.length !== 6) E.push(`exam has ${op.length} options, want 6`);
    if (!op[0] || op[0].ok !== true) E.push('opts[0] is not the key');
    const nok = op.filter(x => x.ok).length; if (nok !== 1) E.push(`${nok} options marked ok`);
    if (new Set(op.map(x => x.h)).size !== op.length) E.push('duplicate option text');
    op.forEach((x, i) => { if (!x.ok && !whyOk(x.why)) E.push(`opts[${i}] (wrong) has no why${typeof x.why === 'object' ? ' (why is an object)' : ''}`); });
    if (kind === 'expr' || kind === 'vec') {
      const kv = numOf(o.ans);
      if (kv === null) E.push(`exam key "${o.ans}" does not evaluate`);
      const vals = op.map(x => x.a ? numOf(x.a) : null);
      for (let i = 1; i < op.length; i++) {
        if (op[i].a && vals[i] === null) E.push(`exam opts[${i}].a "${op[i].a}" does not evaluate`);
        if (vals[i] !== null && close(vals[i], kv)) E.push(`exam opts[${i}].a "${op[i].a}" equals the key numerically`);
      }
    }
  } else {
    if (!o.q || !String(o.q).trim()) E.push('empty q');
    if (kind === 'expr' || kind === 'vec') {
      const vars = o.vars || [];
      if (!parses(o.ans)) E.push(`ans "${o.ans}" does not parse`);
      else if (!vars.length) {
        const v = numOf(o.ans);
        if (v === null) E.push(`ans "${o.ans}" not finite`);
        else if (kind === 'vec' && !Array.isArray(v)) E.push(`vec ans "${o.ans}" is not a vector`);
        else if (kind === 'expr' && Array.isArray(v)) E.push(`expr ans "${o.ans}" is a vector`);
      }
      const kv = vars.length ? null : numOf(o.ans), seen = [];
      (o.dis || []).forEach((d, i) => {
        if (!whyOk(d.why)) E.push(`dis[${i}] has no why`);
        if (d.a === undefined) { if (!d.h) E.push(`dis[${i}] has neither a nor h`); return; }
        if (!parses(d.a)) { E.push(`dis[${i}].a "${d.a}" does not parse`); return; }
        if (vars.length) return;
        const v = numOf(d.a);
        if (v === null) { E.push(`dis[${i}].a "${d.a}" not finite`); return; }
        if (close(v, kv)) W.push(`dis[${i}].a "${d.a}" equals ans "${o.ans}" numerically`);
        if (seen.some(s => close(s, v))) W.push(`dis[${i}].a "${d.a}" duplicates another distractor's value`);
        seen.push(v);
      });
    } else if (kind === 'choice') {
      const op = o.opts || [];
      if (op.length < 3 || op.length > 6) E.push(`choice has ${op.length} options`);
      if (!op[0] || op[0].ok !== true) E.push('opts[0] is not the key');
      const nok = op.filter(x => x.ok).length; if (nok !== 1) E.push(`${nok} options marked ok`);
      if (new Set(op.map(x => x.h)).size !== op.length) E.push('duplicate option text');
      op.forEach((x, i) => { if (!x.ok && !whyOk(x.why)) E.push(`opts[${i}] (wrong) has no why${x.why && typeof x.why === 'object' ? ' (why is an object: arguments of NO() out of order?)' : ''}`); });
      if (op[0] && o.ans !== op[0].h) W.push('ans differs from opts[0].h');
    } else E.push(`unknown kind ${kind}`);
  }
  /* chk shape */
  if (o.chk && (o.chk.op === 'pick' || o.chk.op === 'pickdiff')) {
    (o.chk.opts || []).forEach((s, i) => { if (s !== null && (typeof s !== 'object' || !s.op)) E.push(`chk.opts[${i}] is not a spec (${typeof s}: ${String(s).slice(0, 50)})`); });
  }
  return { E, W };
}

/* ---------- sample record ---------- */
function sample(id, srcKind, o) {
  const exam = srcKind === 'exam';
  const r = { id, src: srcKind, kind: o.kind, ans: o.ans, chk: o.chk, lv: o.lv,
    text: stripTags(exam ? o.stem : o.q) };
  r.ansNum = (o.kind === 'expr' || o.kind === 'vec') && !(o.vars || []).length ? numOf(o.ans) : null;
  if (!exam) r.dis = (o.dis || []).map(d => ({ a: d.a === undefined ? null : d.a, num: d.a === undefined ? null : numOf(d.a), h: d.h === undefined ? null : stripTags(d.h) }));
  if (o.opts) r.opts = o.opts.map(x => ({ h: x.h, ok: !!x.ok, s: x.s === undefined ? null : x.s, a: x.a === undefined ? null : x.a, num: x.a ? numOf(x.a) : null, ht: stripTags(x.h) }));
  return r;
}

/* ---------- run ---------- */
/* group messages that differ only in quoted values, indices or trailing detail */
const keyOf = m => m.replace(/"[^"]*"/g, '"…"').replace(/\[\d+\]/g, '[#]').replace(/\(string:.*$/, '').replace(/: .*$/, '');
function tally(map, list) { for (const m of list) { const k = keyOf(m); if (!map.has(k)) map.set(k, { n: 0, ex: m }); map.get(k).n++; } }
const report = [], samples = [];
let nErr = 0, nWarn = 0;
function runAll(list, srcKind) {
  for (const g of list) {
    if (ONLY && !g.id.startsWith(ONLY)) continue;
    let nulls = 0, exc = 0, firstExc = '';
    const errs = new Map(), warns = new Map();
    let took = 0;
    for (let i = 0; i < N; i++) {
      let o;
      try { o = g.fn(); } catch (e) { exc++; if (!firstExc) firstExc = (e && e.stack || String(e)).split('\n').slice(0, 2).join(' | '); continue; }
      if (!o) { nulls++; continue; }
      const { E, W } = structural(o, srcKind === 'exam');
      tally(errs, E); tally(warns, W);
      if (took < K) { samples.push(sample(g.id, srcKind, o)); took++; }
    }
    /* make sure each id gets K samples even if N is small */
    for (let tries = 0; took < K && tries < 20 * K; tries++) {
      let o; try { o = g.fn(); } catch (e) { continue; }
      if (o) { samples.push(sample(g.id, srcKind, o)); took++; }
    }
    const rate = nulls / N;
    const row = { id: g.id, src: srcKind, nulls, exc, firstExc, errs: [...errs.values()], warns: [...warns.values()] };
    if (exc) row.errs.unshift({ n: exc, ex: 'exception: ' + firstExc });
    if (rate > 0.7) row.errs.unshift({ n: nulls, ex: `null rate ${(100 * rate).toFixed(0)}% (> 70%)` });
    if (took === 0) row.errs.unshift({ n: 1, ex: 'no non-null sample produced' });
    nErr += row.errs.length; nWarn += row.warns.length;
    report.push(row);
  }
}
runAll(GEN, 'sprint');
runAll(XGEN, 'exam');

fs.writeFileSync(path.join(__dirname, 'samples.json'), JSON.stringify(samples));
const bad = report.filter(r => r.errs.length || r.warns.length);
console.log(`structural: ${GEN.length} sprint + ${XGEN.length} exam ids, N=${N} runs each; ${samples.length} samples → tests/samples.json`);
for (const r of bad) {
  console.log(`\n[${r.src}] ${r.id}  (null ${(100 * r.nulls / N).toFixed(0)}%)`);
  for (const e of r.errs) console.log(`  ERROR x${e.n}: ${e.ex.slice(0, 220)}`);
  for (const w of r.warns) console.log(`  warn  x${w.n}: ${w.ex.slice(0, 220)}`);
}
console.log(`\n${report.length} ids, ${report.filter(r => r.errs.length).length} with errors, ${report.filter(r => !r.errs.length && r.warns.length).length} with warnings only`);
process.exit(report.some(r => r.errs.length) ? 1 : 0);
