/* ==== 69 · Exam 1 taxonomy (pack) ========================================
   How each mock-exam answer is filed (see src/70_skills.js for the analytics):
     SUBL   variant id → label; ids are stored in saved progress, never rename one
     xSub   (slot, item) → variant id      CSUBS  the variants of each slot
     TAGS / tagsOf  traits shared across slots
     catName, grpOf  display name; linked-set key ('c'+slot for a slot on its own)
   ======================================================================== */
const SUBL={
  'x1-speed':'Average speed','x1-velocity':'Average velocity',
  'x2-all':'Direction of Δp or the net force',
  'x3-car':'Car hits a barrier','x3-ball':'Ball bounces off a wall','x3-drop':'Object lands on concrete','x3-inverse':'Find the stopping distance',
  'x4-sym':'Two equal ropes','x4-asym':'Two unequal ropes','x4-wire':'Sagging wire','x4-pull':'Pulled sideways',
  'x5-net':'Two blocks: net force','x5-contact':'Two blocks: contact force','x5-2on3':'Three blocks: 2 on 3','x5-3on2':'Three blocks: 3 on 2',
  'x5-1on2':'Three blocks: 1 on 2','x5-net2':'Three blocks: net force on block 2',
  'x6-line':'Charges in a line','x6-sys3':'System of three charges','x6-oval':'Two charges as the system',
  'x7-dip':'Car in a dip','x7-crest':'Car over a crest','x7-tarzan':'Swinging on a vine','x7-bucket':'Bucket swung in a circle',
  'x7-baby':'Child on a swing','x7-plane':'Plane in a vertical loop',
  'x8-liq':'Density of the liquid','x8-obj':'Density of the floating object','x8-vol':'Volume below the surface',
  'x8-down':'Light object held under by a string','x8-up':'Dense object hung under water',
  'x9-all':'Young’s modulus','x10-all':'Oscillation period','x11-all':'Static vs kinetic friction',
  'x12-C':'Spot the claim','x12-E':'Spot the evidence','x12-R':'Spot the reasoning',
  'x13-all':'Net force on the ramp','x14-all':'Momentum after Δt','x15-all':'Position after Δt'};
const subCat=s=>+s.slice(1,s.indexOf('-'))-1;
const CSUBS=XSLOTS.map((_,c)=>Object.keys(SUBL).filter(s=>subCat(s)===c));
function xSub(c,it){ const k=it&&it.chk&&it.chk.k; return k&&SUBL[k]&&subCat(k)===c?k:null; }
const TAGS=[
  {id:'multi',name:'Multi-part, shared setup'},{id:'concept',name:'Conceptual, no numbers'},{id:'num',name:'Numeric calculation'},
  {id:'fbd',name:'Forces on one object (free-body)'},{id:'circle',name:'Circular motion'},{id:'update',name:'Momentum and position updates'},
  {id:'solid',name:'Springs, solids and oscillations'},{id:'fluid',name:'Buoyancy'}];
function tagsOf(c){
  const t=[];
  if(c>=11) t.push('multi');
  if(c===1||c===5||c===11) t.push('concept'); else t.push('num');
  if(c===3||c===4||c===10||c===12) t.push('fbd');
  if(c===6) t.push('circle');
  if(c===0||c===2||c===13||c===14) t.push('update');
  if(c===8||c===9) t.push('solid');
  if(c===7) t.push('fluid');
  return t;
}
const catName=c=>`Q${c+1} ${XSLOTS[c].name}`;
const grpOf=c=>c>=XGROUP_FROM?'R':'c'+c;
