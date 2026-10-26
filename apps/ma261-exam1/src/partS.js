/* =====================================================================
   SESSIONS: every finished run is saved in full (misses with solutions) in
   this browser, so its misses can be reopened from the progress page.
   ===================================================================== */
const SESS_LOCAL='ma261-sprint:sess:', SESS_CAP_LOCAL=30;
let OPEN=null;                      /* the session on screen: {ts, doc, where} */

/* compact, serializable record of one attempt */
function itemOf(r,k){
  const base={k,id:r.id,cat:r.cat,sec:r.sec,lv:r.lv,ok:!!r.ok,skipped:!!r.skipped,spent:Math.round(r.spent)}; if(r.exam) base.exam=1; if(r.diag) base.diag=1; if(r.conf) base.conf=r.conf; if(r.exp) base.exp=Math.round(r.exp);
  if(r.ok) return base;
  return {...base,q:r.q,kind:r.kind,ui:r.ui,ans:r.ans,ansTex:r.ui==='mcq'?'':tex(r.ans),
    opts:r.ui==='mcq'?r.opts.map(o=>({h:o.h,ok:!!o.ok,why:o.why||''})):null,picked:r.picked,
    given:r.given,givenTex:r.givenTex||'',trap:r.trap||'',how:r.how,sol:r.sol,fig:r.fig||''};
}
function sessDoc(run,rs){
  const doc={v:1,ts:run.ts,dur:run.dur,mode:run.mode,real:run.real?1:0,att:run.att,right:run.right,pts:run.pts,time:run.time,bonus:run.bonus,
    topics:[...new Set(rs.map(r=>r.cat))],items:rs.map(itemOf)};
  let s=JSON.stringify(doc);
  for(let i=doc.items.length-1;s.length>230000&&i>=0;i--){ if(doc.items[i].fig){ doc.items[i].fig=''; s=JSON.stringify(doc); } }
  for(let i=doc.items.length-1;s.length>230000&&i>=0;i--){ if(doc.items[i].sol){ doc.items[i].sol=[['(solution trimmed to fit)','']]; s=JSON.stringify(doc); } }
  return doc;
}
const sessSummary=d=>({ts:d.ts,mode:d.mode,real:d.real||0,dur:d.dur,att:d.att,right:d.right,pts:d.pts,miss:d.items.filter(i=>!i.ok).length});

function writeLocalSess(doc){
  try{
    localStorage.setItem(SESS_LOCAL+doc.ts,JSON.stringify(doc));
    const keys=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.indexOf(SESS_LOCAL)===0) keys.push(k); }
    keys.sort(); while(keys.length>SESS_CAP_LOCAL) localStorage.removeItem(keys.shift());
  }catch(e){}
}
function readLocalSess(ts){ try{ const s=localStorage.getItem(SESS_LOCAL+ts); return s?JSON.parse(s):null; }catch(e){ return null; } }
function putSession(doc){
  writeLocalSess(doc);
  store.sess=mergeRuns(store.sess,[sessSummary(doc)]); persist();
}
function saveSession(run,rs){
  mlogAdd(run,rs);                                    /* mistake-pattern log */
  const doc=sessDoc(run,rs);
  if(OPEN&&OPEN.ts===doc.ts) OPEN.doc=doc;
  putSession(doc);
}
async function loadSession(ts){ await ensureStore(); return readLocalSess(ts); }
function openSessionUI(ts,rs,where){ OPEN={ts,where,doc:(OPEN&&OPEN.ts===ts&&OPEN.doc)||{ts,items:rs.map(itemOf)}}; }
const sessLabel=s=>s.real?REAL_NAME:s.mode==='exam'?'Mock exam':s.mode==='diag'?'Diagnostic':s.mode==='mcq'?'Choice':'Typed';

function renderSessList(){
  const tb=$('sesslist').querySelector('tbody'); tb.innerHTML='';
  const list=(store.sess||[]).slice().reverse();
  if(!list.length){ tb.innerHTML='<tr><td colspan="5">No saved sessions yet.</td></tr>'; return; }
  list.forEach(s=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${whenStr(s.ts)}</td><td>${sessLabel(s)}</td><td class="num">${s.right}/${s.att}</td>`+
      `<td class="num">${s.miss}</td><td class="num"><button class="link dl" data-open="${s.ts}">Open</button></td>`;
    tb.appendChild(tr);
  });
  tb.querySelectorAll('button[data-open]').forEach(b=>b.onclick=()=>openSessionPage(+b.dataset.open));
}
async function openSessionPage(ts){
  show('sess'); window.scrollTo(0,0);
  $('sesshead').textContent='Loading…'; $('sessline').textContent=''; $('sessmissed').innerHTML='';
  const doc=await loadSession(ts);
  if(!doc){ $('sesshead').textContent='Session not found'; $('sessline').textContent='Only the last 30 sessions are kept in this browser.'; $('sessnone').hidden=true; return; }
  OPEN={ts,where:'sess',doc};
  $('sesshead').textContent=doc.mode==='exam'||doc.mode==='diag'?`${sessLabel(doc)}: ${doc.pts} / 100`:`${doc.right} of ${doc.att} right`;
  $('sessline').textContent=`${whenStr(doc.ts)} · ${doc.mode==='exam'?`${doc.right} of ${doc.att} correct`:doc.mode==='mcq'?'multiple choice':'typed answers'} · ${doc.pts} points`;
  const ol=$('sessmissed'); try{ if(window.MathJax&&MathJax.typesetClear) MathJax.typesetClear([ol]); }catch(e){}
  const miss=doc.items.filter(i=>!i.ok);
  $('sessnone').hidden=!!miss.length; $('sessmissedwrap').hidden=!miss.length;
  miss.forEach(it=>{
    const r={...it,given:it.given,opts:it.opts,ui:it.ui||'type'};
    const li=document.createElement('li'); li.value=it.k+1; li.innerHTML=missHTML(r,it.k); ol.appendChild(li);
  });
  typeset(ol);
}
$('sessback').onclick=openProg;
