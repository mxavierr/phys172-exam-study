/* ==== 13 · tooltips ======================================================
   Hovering (mouse) or tabbing to anything with data-tip="…" (or a title="…", which is
   moved into data-tip so the browser's own slow tooltip does not also appear) shows one
   shared tooltip next to it. Text with formulas goes through mathText(). Touch screens
   have no hover, so tips there are a bonus, never the only place something is said.
   ======================================================================== */
const TIP=document.createElement('div');
TIP.id='tipbox'; TIP.className='tip'; TIP.setAttribute('role','tooltip'); TIP.hidden=true;
document.body.appendChild(TIP);
let tipEl=null, tipT=null;
function tipOf(el){
  const t=el.getAttribute('title');
  if(t!==null){ if(t) el.dataset.tip=t; el.removeAttribute('title'); }
  return el.dataset.tip||'';
}
function tipShow(el){
  const text=tipOf(el); if(!text) return;
  tipEl=el; el.setAttribute('aria-describedby','tipbox');
  TIP.innerHTML=/[_=²√½]/.test(text)?mathText(text):esc(text);
  TIP.hidden=false;
  const r=el.getBoundingClientRect(), w=TIP.offsetWidth, h=TIP.offsetHeight;
  const left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2));
  const below=r.bottom+8, top=below+h>window.innerHeight-8?Math.max(8,r.top-h-8):below;
  TIP.style.left=left+'px'; TIP.style.top=top+'px';
}
function tipHide(){
  clearTimeout(tipT);
  if(tipEl) tipEl.removeAttribute('aria-describedby');
  tipEl=null; TIP.hidden=true;
}
const tipTarget=n=>n&&n.closest?n.closest('[data-tip],[title]'):null;
document.addEventListener('pointerover',e=>{
  if(e.pointerType!=='mouse') return;
  const el=tipTarget(e.target);
  if(el===tipEl) return;
  tipHide();
  if(el){ tipOf(el); tipT=setTimeout(()=>tipShow(el),350); }
});
document.addEventListener('pointerout',e=>{
  const el=tipTarget(e.target);
  if(el&&!el.contains(e.relatedTarget)) tipHide();
});
document.addEventListener('focusin',e=>{
  const el=tipTarget(e.target);
  if(!el||el.tagName==='INPUT'||!el.matches(':focus-visible')) return;   /* the answer box is focused on every question */
  tipHide(); tipShow(el);
});
document.addEventListener('focusout',tipHide);
document.addEventListener('pointerdown',tipHide);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') tipHide(); });
window.addEventListener('scroll',tipHide,{passive:true,capture:true});
