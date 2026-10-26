/* ==== 10p · Exam 2 pack: constants and course labels =====================
   Loaded right after src/10_core.js. Everything here is specific to this exam;
   the engine (src/) reads these names.
   ======================================================================== */
/* physics constants: the sprint uses these values and the constants band (pack.json) shows them */
const K={g:9.8, G:6.67e-11, ke:9e9, e:1.6e-19, c:3e8, eV:1.6e-19, mp:1.67e-27, me:9.11e-31};
/* numbers that count as "given" in a worked solution even if the question does not state them */
const CONST_TEX=['9.8','10','4186','6.67\\times10^{-11}','9\\times10^{9}','9\\times10^9','1.6\\times10^{-19}','3\\times10^{8}','3\\times10^8','1.67\\times10^{-27}','9.11\\times10^{-31}'];
/* the Exam 2 "what you should know" list leaves out rest energy, identity change and power */
const EXAM_OUT=['Particle energy','Identity change','Power'];
/* sprint topic groups on the start screen (TOPIC_HW is filled by src/40_sprint.js) */
const GROUPS=[
  {key:'a',name:'HW11–HW13',desc:'work, the Energy Principle, potential energy, energy diagrams',test:t=>TOPIC_HW[t][0]<=13},
  {key:'b',name:'HW14–HW15',desc:'thermal energy, dissipation, rotational energy',test:t=>TOPIC_HW[t][0]>=14}
];
