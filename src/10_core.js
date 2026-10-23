(function(){
"use strict";
/* ==== 10 · core ==========================================================
   App-wide names, physics constants, number formatting (HTML and LaTeX),
   random helpers and the sprint generator registry.
   Everything in src/ shares this one function scope (opened here, closed in
   95_boot.js), so module order matters only for code that RUNS at load time.
   ======================================================================== */

/* ---- app identity: names that must never drift between modules ---- */
const APP={
  ns:'energy-sprint',          /* localStorage prefix. Changing it orphans every saved key. */
  schema:2,                    /* store.v. v1 = runs+exams(slots); v2 adds drills and exam.q (additive). */
  cookie:'es_save',            /* progress cookie (see 50_store.js). Changing it orphans every saved cookie. */
  cookieMax:3800,              /* characters; one cookie stays under the 4 KB every browser accepts */
  cookieDays:400               /* the longest lifetime current browsers allow */
};
const LS=name=>APP.ns+':'+name;               /* LS('progress'), LS('exam'), LS('bonus'), LS('points:…') */
const lsGet=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
const lsSet=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
const lsDel=k=>{ try{ localStorage.removeItem(k); }catch(e){} };

/* ---- cookies: scoped to the folder the page is served from (e.g. /energy-sprint/ on GitHub Pages),
   so other sites on the same host never see them. Never sent anywhere but back to that folder. ---- */
const cookiePath=()=>{ const p=location.pathname; return p.slice(0,p.lastIndexOf('/')+1)||'/'; };
function cookieGet(name){
  try{
    const hit=document.cookie.split('; ').find(c=>c.slice(0,name.length+1)===name+'=');
    return hit?hit.slice(name.length+1):null;
  }catch(e){ return null; }
}
function cookieSet(name,value,days){
  try{
    document.cookie=`${name}=${value}; Max-Age=${Math.round(days*86400)}; Path=${cookiePath()}; SameSite=Lax`+
      (location.protocol==='https:'?'; Secure':'');
    return cookieGet(name)===value;
  }catch(e){ return false; }
}

/* ---- physics constants: the sprint uses these values and the constants band shows them ---- */
const K={g:9.8, G:6.67e-11, ke:9e9, e:1.6e-19, c:3e8, eV:1.6e-19, mp:1.67e-27, me:9.11e-31};
const D2R=Math.PI/180;

/* ---- small helpers ---- */
const $=id=>document.getElementById(id);
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const nz=(a,b)=>{let v=0;while(v===0)v=ri(a,b);return v;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rf=(a,b,d)=>+(a+Math.random()*(b-a)).toFixed(d);
const rd=(x,d)=>+x.toFixed(d);

/* number -> display HTML (true minus sign, ×10ⁿ for very large/small) */
function sci(x,n){
  if(!Number.isFinite(x))return'–';
  if(x===0)return'0';
  const a=Math.abs(x);
  if(a>=1e5||a<1e-3){
    const parts=x.toExponential(Math.max(0,n-1)).split('e');
    const m=String(+parts[0]).replace('-','−'), e=String(+parts[1]).replace('-','−');
    return `${m}×10<sup>${e}</sup>`;
  }
  return String(+x.toPrecision(n)).replace('-','−');
}
const fm=x=>typeof x==='number'?sci(x,6):String(x);
const vec=(a,b,c)=>`<span class="v">⟨${fm(a)}, ${fm(b)}, ${fm(c)}⟩</span>`;

/* ---- LaTeX helpers for worked solutions. Use these ONLY inside sol LaTeX, never in question HTML. ---- */
const X=String.raw;
function tn(x,n){                                   /* number -> LaTeX, n significant figures */
  n=n||4;
  if(!Number.isFinite(x))return'?';
  if(x===0)return'0';          /* real quantities go as small as 9.11e-31; never round them away */
  const a=Math.abs(x);
  if(a>=1e5||a<1e-3){const p=x.toExponential(n-1).split('e');return `${+p[0]}\\times10^{${+p[1]}}`;}
  return String(+x.toPrecision(n));
}
const tp=(x,n)=>{const s=tn(x,n);return(x<0||s.indexOf('times')>=0)?`(${s})`:s;};   /* wrapped for products */
const tv=(a,b,c,n)=>`\\langle ${tn(a,n)},\\ ${tn(b,n)},\\ ${tn(c,n)}\\rangle`;
function U(u){                                      /* unit -> LaTeX, with a leading thin space */
  if(!u)return'';
  const s=u.replace(/²/g,'}^2\\text{').replace(/³/g,'}^3\\text{').replace(/·/g,'}\\cdot\\text{');
  return(`\\ \\text{${s}}`).replace(/\\text\{\}/g,'');
}
const gammaOf=f=>1/Math.sqrt(1-f*f);                 /* Lorentz factor, f = v/c */

/* ---- sprint generator registry ----
   add(id, topic, hw, fn): fn() returns {q, ans, unit, lv, how, sol, chk, fig?, zero?} or null.
     q    question HTML (use sci/fm/vec for numbers, never tn)
     ans  the graded number; unit its unit text ('' for a ratio)
     lv   1 easy, 2 medium, 3 hard (points ×1/×2/×3, time budget 2/4/6 min)
     how  one-line key idea, shown with the solution and on the progress page
     sol  [[step text HTML, LaTeX], ...]; the last LaTeX should show the graded answer (tests check it)
     chk  {k:kind, ...inputs} so an independent solver can re-derive ans
     zero true when 0 is a legitimate answer
   Returning null means "these random numbers were unusable"; the caller simply rolls again.
   ids are stored in saved progress: never rename or reuse one. */
const GEN=[];
const add=(id,cat,hw,fn)=>GEN.push({id,cat,hw,fn});
