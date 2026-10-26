<script>
(function(){
"use strict";

/* ============ small helpers ============ */
const $=id=>document.getElementById(id);
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const nz=(a,b)=>{let v=0;while(v===0)v=ri(a,b);return v;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const coin=p=>Math.random()<(p===undefined?0.5:p);
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const X=String.raw;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* inline math for question stems: m`...` is raw LaTeX, mk(key) prints a key string */
const m=(s,...v)=>'\\('+String.raw(s,...v)+'\\)';
const im=s=>'\\('+s+'\\)';
const AX=['x','y','z'];

/* ============ generator registry ============
   add(id, topic, section, fn): fn returns
   {q, kind, ans, alts?, vars?, dis:[{a,why}], lv, how, sol:[[text, LaTeX]], chk, fig?}
   kind ∈ expr · vec · point · points · eq · line · curve · choice (choice: opts:[{h,ok?,why}]) */
const GEN=[];
const add=(id,cat,sec,fn)=>GEN.push({id,cat,sec,fn});
