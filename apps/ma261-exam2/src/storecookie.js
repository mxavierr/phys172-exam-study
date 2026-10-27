/* =====================================================================
   COOKIE COPY OF THE PROGRESS (public site; the personal version synced to an account).
   localStorage holds the full store. One cookie holds a compressed copy of what
   matters most: mock exams, diagnostics, the quadric memory and sprint totals,
   trimmed step by step until it fits (CK_MAX). On load it is merged into the
   store by initStore() (partG.js), so clearing site storage alone loses nothing.
   Shared helpers below are the same as the PHYS pages (src/10_core.js, src/50_store.js).
   ===================================================================== */
const CK_NAME='m261e2_save', CK_MAX=3800, CK_DAYS=400;
let cookieOK=false;
/* ---- cookies: scoped to the folder the page is served from (e.g. /energy-sprint/ on GitHub Pages),
   so other sites on the same host never see them. Never sent anywhere but back to that folder. ---- */
const cookiePath=()=>{ const p=location.pathname; return p.slice(0,p.lastIndexOf('/')+1)||'/'; };
function cookieGet(name){
  try{
    const hit=document.cookie.split('; ').find(c=>c.slice(0,name.length+1)===name+'=');
    return hit?hit.slice(name.length+1):null;
  }catch(e){ return null; }
}
function cookieSet(name,value,days,path){
  try{
    document.cookie=`${name}=${value}; Max-Age=${Math.round(days*86400)}; Path=${path||cookiePath()}; SameSite=Lax`+
      (location.protocol==='https:'?'; Secure':'');
    return cookieGet(name)===value;
  }catch(e){ return false; }
}
/* ---- cookie codec: deflate + base64url where the browser has CompressionStream, plain JSON otherwise ---- */
const canZip=typeof CompressionStream==='function'&&typeof DecompressionStream==='function';
const b64u=bytes=>{ let s=''; for(let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
const unb64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const pipeBytes=async(bytes,stream)=>new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
async function packCookie(obj){
  const json=JSON.stringify(obj);
  if(canZip) return 'z'+b64u(await pipeBytes(new TextEncoder().encode(json),new CompressionStream('deflate-raw')));
  return 'j'+encodeURIComponent(json);
}
async function unpackCookie(v){
  if(!v) return null;
  try{
    if(v[0]==='z'&&canZip) return JSON.parse(new TextDecoder().decode(await pipeBytes(unb64u(v.slice(1)),new DecompressionStream('deflate-raw'))));
    if(v[0]==='j') return JSON.parse(decodeURIComponent(v.slice(1)));
  }catch(e){}
  return null;
}
const CK_STEPS=[
  c=>{ c.runs.forEach(r=>{ delete r.t; }); },                       /* sprint per-type detail */
  c=>{ c.diags.forEach(d=>{ delete d.g; }); c.dmis={}; },
  c=>{ c.runs=c.runs.slice(-15); },
  c=>{ c.exams.forEach((e,i,a)=>{ if(i<a.length-4){ delete e.g; delete e.t; } }); },
  c=>{ c.diags=c.diags.slice(-8); },
  c=>{ c.drills=c.drills.slice(-6).map(d=>({...d,q:(d.q||[]).slice(-20)})); },
  c=>{ c.drills=c.drills.slice(-2).map(d=>({ts:d.ts,tags:d.tags,cleared:d.cleared,end:d.end,reason:d.reason,q:[]})); },
  c=>{ c.runs=[]; },
  c=>{ c.diags=c.diags.slice(-3); c.exams=c.exams.slice(-12); },
  c=>{ c.exams=c.exams.slice(-4); c.diags=c.diags.slice(-1); }];
async function cookieValue(){
  const c=JSON.parse(JSON.stringify({v:1,updated:store.updated,exams:store.exams||[],diags:store.diags||[],
    drills:store.drills||[],runs:store.runs||[],dmis:store.dmis||{},mlbf:store.mlbf||0}));
  let v=await packCookie(c);
  for(let i=0;v.length>CK_MAX&&i<CK_STEPS.length;i++){ CK_STEPS[i](c); v=await packCookie(c); }
  return v.length<=CK_MAX?v:null;
}
let ckBusy=null, ckAgain=false;
function writeCookie(){                      /* coalesces bursts of saves into one cookie write */
  if(ckBusy){ ckAgain=true; return ckBusy; }
  ckBusy=(async()=>{
    do{ ckAgain=false; const v=await cookieValue(); cookieOK=!!v&&cookieSet(CK_NAME,v,CK_DAYS); }while(ckAgain);
  })().catch(()=>{ cookieOK=false; }).finally(()=>{ ckBusy=null; });
  return ckBusy;
}
async function readCookieStore(){
  const o=await unpackCookie(cookieGet(CK_NAME));
  return o&&typeof o==='object'&&Array.isArray(o.exams)?o:null;
}
