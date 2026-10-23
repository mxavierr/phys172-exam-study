/* ==== 71 · exam skills on screen =========================================
   The "Exam skills" section of the progress page (patterns, one expandable
   row per type with variants and trend, traits table, drill history) and the
   "By problem type" + "Patterns" part of the mock-exam results.
   ======================================================================== */
function skillTrend(c,evs){
  const l=evs.filter(e=>e.c===c), sids=[...new Set(l.map(e=>e.sid))].sort((a,b)=>a-b);
  return sids.map(sid=>{ const upto=l.filter(e=>e.sid<=sid), last=upto.reduce((m,e)=>Math.max(m,e.ts),0);
    return {sid,src:l.find(e=>e.sid===sid).src,v:Math.round(statOf(upto,last).score*100)}; });
}
function renderSkills(){
  const evs=events(), box=$('skills');
  box.hidden=!evs.length; if(!evs.length) return;
  const nEx=(store.exams||[]).length;
  const pats=findPatterns(evs);
  $('spat').innerHTML=patHTML(pats.slice(0,5),nEx===1);
  const rows=XSLOTS.map((s,c)=>({c,st:statOf(evs.filter(e=>e.c===c))})).sort((a,b)=>STO[a.st.status]-STO[b.st.status]||a.st.score-b.st.score||a.c-b.c);
  const list=$('slist'); list.innerHTML='';
  rows.forEach(({c,st})=>{
    const l=evs.filter(e=>e.c===c), d=document.createElement('details'); d.className='skill';
    const dots=l.slice(-14).map(e=>`<i class="${e.src} ${e.r===1?'ok':e.r===-1?'bl':'no'}" title="${e.src==='exam'?'Exam':'Drill'} ${whenStr(e.ts)}: ${e.r===1?'right':e.r===-1?'blank':'wrong'}"></i>`).join('');
    let inner='';
    const tr=skillTrend(c,evs);
    if(tr.length>1) inner+=`<div class="chartbox">${lineChart(tr.map(x=>x.v),{top:100,ticks:[0,25,50,75,100],fmt:v=>v+'%',
      aria:`Mastery of ${XSLOTS[c].name} after each exam or drill`,tip:(v,i)=>`${tr[i].src==='exam'?'Exam':'Drill'} ${whenStr(tr[i].sid)}: ${v}%`})}</div>`+
      `<div class="legend"><span><i class="ln"></i>mastery after each exam or drill</span></div>`;
    const by={}; l.forEach(e=>{ const k=e.s||'_'; (by[k]=by[k]||[]).push(e); });
    inner+=`<div class="tablebox"><table><thead><tr><th>Variant</th><th class="num">Exams</th><th class="num">Drills</th><th class="num">Avg</th></tr></thead><tbody>`+
      Object.keys(by).sort((a,b)=>(a==='_')-(b==='_')||a.localeCompare(b)).map(k=>{ const v=statOf(by[k]);
        return `<tr><td>${k==='_'?'Variant not recorded':esc(SUBL[k]||k)}</td><td class="num">${v.exN?`${v.exR} / ${v.exN}`:'–'}</td>`+
          `<td class="num">${v.drN?`${v.drR} / ${v.drN}`:'–'}</td><td class="num">${v.tAvg!=null?fmtClock(v.tAvg):'–'}</td></tr>`; }).join('')+
      `</tbody></table></div>`;
    const untried=CSUBS[c].filter(s=>!by[s]).map(s=>SUBL[s]);
    if(untried.length) inner+=`<p class="fine">Unseen: ${esc(untried.join(' · '))}</p>`;
    inner+=`<div class="btnrow"><button class="ghost" data-drill="${c}">Drill ▸</button></div>`;
    /* one line: name · standing · mastery bar · exam and drill record; details (answers, variants, trend) on tap */
    d.innerHTML=`<summary class="srow"><b>${esc(catName(c))}</b><span>${chipOf(st)}</span>`+
      `<div class="bar"><i class="${st.status}" style="width:${Math.max(4,Math.round(st.score*100))}%"></i></div>`+
      `<em title="Right / tried: mock exams · drills">${st.exR}/${st.exN} · ${st.drR}/${st.drN}</em></summary><div class="skillin"><span class="dots">${dots}</span>${inner}</div>`;
    list.appendChild(d);
  });
  list.querySelectorAll('[data-drill]').forEach(b=>{ b.onclick=()=>drOpen([+b.dataset.drill]); });
  const tb=$('stags').querySelector('tbody'); tb.innerHTML='';
  TAGS.map(t=>({t,v:evs.filter(e=>tagsOf(e.c,e.s).indexOf(t.id)>=0)})).filter(x=>x.v.length).forEach(({t,v})=>{
    const st=statOf(v), r=document.createElement('tr');
    r.innerHTML=`<td>${esc(t.name)}</td><td class="num">${st.exN?`${st.exR} / ${st.exN}`:'–'}</td><td class="num">${st.drN?`${st.drR} / ${st.drN}`:'–'}</td><td>${chipOf(st)}</td>`;
    tb.appendChild(r);
  });
  const dh=$('dhist').querySelector('tbody'); dh.innerHTML=''; const dr=store.drills||[];
  $('dhistfold').hidden=!dr.length;
  dr.slice().reverse().forEach(d=>{ const q=d.q||[], r=document.createElement('tr');
    r.innerHTML=`<td>${whenStr(d.ts)}</td><td>${esc((d.cats||[]).map(c=>XSLOTS[c]?XSLOTS[c].name:'').join(', '))}</td><td class="num">${q.filter(x=>x.r===1).length} / ${q.length}</td>`+
      `<td>${d.reason==='cleared'?'Cleared':(d.cleared||[]).length?`${d.cleared.length} of ${(d.cats||[]).length} cleared`:d.end?'Stopped':'Unfinished'}</td>`;
    dh.appendChild(r); });
}

/* ---- after an exam: how each problem type stands now ---- */
function renderXTypes(res){
  const evs=events(), E=res.E, tb=$('xttable').querySelector('tbody'); tb.innerHTML='';
  res.per.forEach(p=>{ const it=E.items[p.i], s=xSub(p.i,it), st=statOf(evs.filter(e=>e.c===p.i)), tr=document.createElement('tr');
    const now=p.ok?'<span class="okc">right</span>':p.pick<0?'<span class="noc">blank</span>':'<span class="noc">wrong</span>';
    const slow=p.t>XPACE[p.i]*1.5?` <span class="how">${fmtClock(p.t)}, slow</span>`:'';
    tr.innerHTML=`<td>${p.i+1}</td><td>${esc(it.slot.name)}${s?`<span class="how">${esc(SUBL[s])}</span>`:''}</td><td>${now}${slow}</td>`+
      `<td class="num">${st.exR} / ${st.exN}</td><td>${chipOf(st)}</td>`;
    tb.appendChild(tr); });
  const pats=findPatterns(evs), nEx=new Set(evs.filter(e=>e.src==='exam').map(e=>e.sid)).size;
  $('xpat').innerHTML=pats.length?patHTML(pats.slice(0,5),nEx===1):'';
  const rec=recommend(evs).top.map(r=>r.c); DREC=rec;
  $('xdrill').textContent=`Drill ${rec.map(c=>'Q'+(c+1)).join(' + ')} ▸`;
  $('xdrill').onclick=()=>drOpen(rec);
}
