/* ==== 69 · Exam 2 taxonomy (pack) ========================================
   How each mock-exam answer is filed (see src/70_skills.js for the analytics):
     SUBL   variant id → label; ids are stored in saved progress, never rename one
     xSub   (slot, item) → variant id      CSUBS  the variants of each slot
     TAGS / tagsOf  traits shared across slots (multi-part, springs, …)
     catName, grpOf  display name; linked-set key ('c'+slot for a slot on its own)
   ======================================================================== */
const SUBL={
  'x1-circ':'Circular orbit or string','x1-ball':'Thrown ball, gravity','x1-ball-air':'Thrown ball, air resistance','x1-ellipse':'Elliptical orbit',
  'x2-3d':'3-D forces (dot product)','x2-push':'Pushes along a line',
  'x3-rod':'Ball on a rod','x3-seat':'Ferris-wheel seat',
  'x4-triple':'Read K and U at three points','x4-dK':'ΔK and ΔU between points','x4-unbind':'Energy to break the pair apart',
  'x5-sum':'Q + W with signs','x5-lost':'Heat that leaked out','x5-dT':'Temperature rise',
  'x6-eq':'Choose the equation','x6-ratio':'Ratio of specific heats','x6-same':'Same heat, different C','x6-Tf':'Final temperature',
  'x7-eq':'Choose the equation','x7-num':'Numeric final speed',
  'x8-bowl':'Bowl, sliding block','x8-roll':'Bowl, rolling ball','x8-top':'Loop, top','x8-side':'Loop, side',
  'x9-bowl':'Bowl, sliding block','x9-roll':'Bowl, rolling ball','x9-top':'Loop, top','x9-side':'Loop, side',
  'x10-push':'Push, frictionless floor','x10-fric':'Push with friction','x10-vwork':'Work by a vertical spring',
  'x11-compare':'Compare drag and gravity','x11-force':'Drag at terminal speed','x11-air':'Work by air, round trip',
  'x12-max':'Highest point, from equilibrium','x12-speed':'Speed at equilibrium','x12-relaxed':'From the relaxed length',
  'x13-cer':'Claim, evidence, reasoning','x13-vert':'Three students, vertical launch','x13-inc':'Three students, incline with friction',
  'x14-sym':'Symbolic','x14-vert':'Vertical launch, numeric','x14-inc':'Incline with friction',
  'x15-sym':'Symbolic','x15-vert':'Vertical launch, numeric','x15-inc':'Incline with friction'};
const subCat=s=>+s.slice(1,s.indexOf('-'))-1;
const CSUBS=XSLOTS.map((_,c)=>Object.keys(SUBL).filter(s=>subCat(s)===c));
function xSub(c,it){
  const ch=(it&&it.chk)||{}, k=ch.k||'';
  switch(c){
    case 0: return k==='x1-ball'&&ch.air?'x1-ball-air':k;
    case 2: return (ch.seat!=null?ch.seat:ch.m>=60)?'x3-seat':'x3-rod';
    case 7: case 8: { const p=c===7?'x8-':'x9-'; return /-sym$/.test(k)?p+(ch.roll?'roll':'bowl'):p+(ch.at==='C'?'top':'side'); }
    case 9: return k==='x10-vwork'?k:(ch.mu?'x10-fric':'x10-push');
    case 11: return 'x12-'+(ch.mode||'max');
    case 12: return k==='x13-cer'?k:(ch.incline?'x13-inc':'x13-vert');
    case 13: case 14: { const p=c===13?'x14-':'x15-'; return /-sym$/.test(k)?p+'sym':p+(ch.incline?'inc':'vert'); }
    default: return SUBL[k]?k:null;
  }
}
const TAGS=[
  {id:'multi',name:'Multi-part, shared setup'},{id:'spring',name:'Springs'},{id:'circle',name:'Circular motion'},
  {id:'sym',name:'Answer is an equation or symbols'},{id:'concept',name:'Conceptual, no numbers'},
  {id:'num',name:'Numeric calculation'},{id:'fric',name:'Friction, drag and heat loss'},
  {id:'graph',name:'Reading an energy graph'},{id:'thermal',name:'Thermal energy'},{id:'roll',name:'Rolling objects'}];
const TAGN={}; TAGS.forEach(t=>{TAGN[t.id]=t.name;});
const SYMS=new Set(['x6-eq','x7-eq','x8-bowl','x8-roll','x9-bowl','x9-roll','x12-max','x12-speed','x12-relaxed','x14-sym','x15-sym']);
const CONC=new Set(['x1-circ','x1-ball','x1-ball-air','x1-ellipse','x11-compare','x13-cer','x13-vert','x13-inc']);
const FRIC=new Set(['x1-ball-air','x5-lost','x10-fric','x11-compare','x11-force','x11-air','x13-inc','x14-inc','x15-inc']);
/* traits known from the category alone also apply to records saved before variants were tracked */
function tagsOf(c,s){
  const t=[];
  if(c===7||c===8||c>=12) t.push('multi');
  if(c===9||c>=11) t.push('spring');
  if(c===2||c===7||c===8||s==='x1-circ') t.push('circle');
  if(c===3) t.push('graph');
  if(c===4||c===5) t.push('thermal');
  if(c===0||c===12||(s&&CONC.has(s))) t.push('concept');
  if(c===11||(s&&SYMS.has(s))) t.push('sym');
  if(s){
    if(FRIC.has(s)) t.push('fric');
    if(/roll/.test(s)) t.push('roll');
    if(!SYMS.has(s)&&!CONC.has(s)&&c!==3) t.push('num');
  }
  return [...new Set(t)];
}
const catName=c=>`Q${c+1} ${XSLOTS[c].name}`;
const grpOf=c=>c===7||c===8?'T':c>=12?'L':'c'+c;
