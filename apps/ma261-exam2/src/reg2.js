
/* =====================================================================
   REGISTRY · every builder as a sprint generator (topic = textbook section)
   and as a mock-exam template (tag, weight w within the tag, archive sources).
   Ids are stored in saved progress: never rename one; retire by leaving it.
   ★ w = 3: a template that appears on most past Exam 2s.
   ===================================================================== */
const S_=(id,cat,sec,fn)=>add(id,cat,sec,fn);
/* 15.8 */
S_('lagr-ell','Lagrange multipliers','15.8',()=>P_lagrEll(false));
S_('lagr-sphere','Lagrange multipliers','15.8',P_lagrSphere);
S_('lagr-quad','Lagrange multipliers','15.8',P_lagrQuad);
S_('lagr-dist','Lagrange multipliers','15.8',P_lagrDist);
S_('lagr-box','Lagrange multipliers','15.8',P_lagrBox);
S_('lagr-lambda','Lagrange multipliers','15.8',P_lagrLambda);
/* 16.1–16.2 */
S_('dbl-iter','Double integrals','16.1',P_iter);
S_('dbl-itervar','Double integrals','16.2',P_iterVar);
S_('dbl-rect','Double integrals','16.1',P_dblRect);
S_('dbl-voltri','Double integrals','16.2',P_dblVolTri);
S_('dbl-avg','Double integrals','16.1',P_dblAvg);
S_('dbl-between','Double integrals','16.2',P_dblBetween);
S_('dbl-sinc','Double integrals','16.2',P_dblSinc);
S_('dbl-riemann','Double integrals','16.1',P_dblRiemann);
S_('dbl-volexp','Double integrals','16.1',P_dblVolExp);
S_('rev-eval','Order of integration','16.2',P_revEval);
S_('rev-setup','Order of integration','16.2',P_revSetup);
S_('rev-split','Order of integration','16.2',P_revSplit);
S_('rev-choose','Order of integration','16.2',P_revChoose);
/* 16.3 */
S_('pol-sector','Polar coordinates','16.3',P_polSector);
S_('pol-gauss','Polar coordinates','16.3',P_polGauss);
S_('pol-convert','Polar coordinates','16.3',()=>P_polConvert(false));
S_('pol-convert-set','Polar coordinates','16.3',()=>P_polConvert(true));
S_('pol-off','Polar coordinates','16.3',P_polOff);
S_('pol-vol','Polar coordinates','16.3',P_polVol);
S_('pol-area','Polar coordinates','16.3',P_polArea);
/* 16.4 */
S_('tri-box','Triple integrals','16.4',P_triBox);
S_('tri-plane','Triple integrals','16.4',P_triPlane);
S_('tri-reorder','Triple integrals','16.4',P_triReorder);
S_('tri-which','Triple integrals','16.4',P_triWhich);
S_('tri-eval','Triple integrals','16.4',P_triEval);
S_('tri-vol','Triple integrals','16.4',P_triVol);
S_('tri-avg','Triple integrals','16.4',P_triAvg);
/* 16.5 */
S_('cyl-convert','Cylindrical coordinates','16.5',P_cylConvert);
S_('cyl-eval','Cylindrical coordinates','16.5',P_cylEval);
S_('cyl-vol','Cylindrical coordinates','16.5',P_cylVol);
S_('cyl-xaxis','Cylindrical coordinates','16.5',P_cylXaxis);
S_('sph-setup','Spherical coordinates','16.5',P_sphSetup);
S_('sph-vol','Spherical coordinates','16.5',P_sphVol);
S_('sph-shell','Spherical coordinates','16.5',P_sphShell);
S_('sph-off','Spherical coordinates','16.5',P_sphOff);
S_('sph-planes','Spherical coordinates','16.5',P_sphPlanes);
S_('sph-convert','Spherical coordinates','16.5',P_sphConvert);
S_('sph-surf','Spherical coordinates','16.5',P_sphSurf);
/* 16.6 */
S_('mass-rect','Mass & center of mass','16.6',P_massRect);
S_('mass-lam','Mass & center of mass','16.6',P_massLam);
S_('mass-tet','Mass & center of mass','16.6',P_massTet);
S_('mass-cube','Mass & center of mass','16.6',P_massCube);
S_('mass-hemi','Mass & center of mass','16.6',P_massHemi);
S_('mass-polar','Mass & center of mass','16.6',P_massPolar);
/* 17.1 */
S_('vf-pic','Vector fields','17.1',P_vfPic);
S_('vf-normal','Vector fields','17.1',P_vfNormal);
S_('vf-equip','Vector fields','17.1',P_vfEquip);
S_('vf-grad','Vector fields','17.1',P_vfGrad);
/* 17.2 */
S_('ls-seg','Line integrals','17.2',P_lsSeg);
S_('ls-helix','Line integrals','17.2',P_lsHelix);
S_('ls-cancel','Line integrals','17.2',P_lsCancel);
S_('ls-arc','Line integrals','17.2',P_lsArc);
S_('ls-avg','Line integrals','17.2',P_lsAvg);
S_('w-seg','Line integrals','17.2',P_wSeg);
S_('w-rot','Line integrals','17.2',P_wRot);
S_('w-radial','Line integrals','17.2',P_wRadial);
S_('w-dxdy','Line integrals','17.2',P_wDxDy);
S_('w-flux','Line integrals','17.2',P_wFlux);
S_('w-concept','Line integrals','17.2',P_wConcept);
/* 17.3 */
S_('c-pot','Conservative fields','17.3',P_cPot);
S_('c-ftli','Conservative fields','17.3',P_cFTLI);
S_('c-spiral','Conservative fields','17.3',P_cSpiral);
S_('c-path','Conservative fields','17.3',P_cPath);
S_('c-vortex','Conservative fields','17.3',P_cVortex);
S_('c-const','Conservative fields','17.3',P_cConst);
S_('c-which','Conservative fields','17.3',P_cWhich);
/* 17.4 */
S_('g-poly','Green’s Theorem','17.4',P_gPoly);
S_('g-tri','Green’s Theorem','17.4',P_gTri);
S_('g-area','Green’s Theorem','17.4',P_gArea);
S_('g-circle','Green’s Theorem','17.4',P_gCircle);
S_('g-hole','Green’s Theorem','17.4',P_gHole);
S_('g-flux','Green’s Theorem','17.4',P_gFlux);
S_('g-open','Green’s Theorem','17.4',P_gOpen);
/* 17.5 */
S_('dc-curl','Divergence & curl','17.5',P_dcCurl);
S_('dc-lap','Divergence & curl','17.5',P_dcLap);
S_('dc-ident','Divergence & curl','17.5',P_dcIdent);
S_('dc-rot','Divergence & curl','17.5',P_dcRot);
S_('dc-radial','Divergence & curl','17.5',P_dcRadial);
S_('dc-div','Divergence & curl','17.5',P_dcDiv);
/* 17.6 */
S_('s-plane','Surface integrals','17.6',P_sPlane);
S_('s-parab','Surface integrals','17.6',P_sParab);
S_('s-cone','Surface integrals','17.6',P_sCone);
S_('s-sphere','Surface integrals','17.6',P_sSphere);
S_('s-graph','Surface integrals','17.6',P_sGraph);
S_('s-param','Surface integrals','17.6',P_sParam);
S_('s-flux','Surface integrals','17.6',P_sFlux);

/* ---- mock-exam templates: the same builders at exam level, six choices ---- */
const X_=(id,tag,w,src,fn)=>addX(id,tag,w,src,()=>xFrom(fn()));
X_('x-lagr-ell','LAGR',3,['F2022-Q2','S2018-Q1','F2023-Q1','S2022-Q7'],()=>P_lagrEll(true));
X_('x-lagr-sphere','LAGR',3,['S2025-Q12','S2023-Q3','S2019-Q1','F2017-Q1'],P_lagrSphere);
X_('x-lagr-quad','LAGR',2,['S2024-Q7','F2024-Q7','F2016-Q3'],P_lagrQuad);
X_('x-lagr-dist','LAGR',1,['S2023-Q4','F2018-Q1'],P_lagrDist);
X_('x-lagr-box','LAGR',1,['15.8 #39–44'],P_lagrBox);
X_('x-lagr-lambda','LAGR',1,['S2017-Q1'],P_lagrLambda);
X_('x-drev-eval','DREV',3,['F2022-Q1','S2019-Q2','S2023-Q8','F2023-Q6','F2024-Q8','F2018-Q4','S2018-Q3','F2019-Q3','S2017-Q3','F2017-Q2'],P_revEval);
X_('x-drev-setup','DREV',2,['S2022-Q10'],P_revSetup);
X_('x-drev-split','DREV',2,['16.2 #69–70'],P_revSplit);
X_('x-drev-choose','DREV',2,['S2025-Q11','S2017-Q2'],P_revChoose);
X_('x-dbl-rect','DBL',2,['S2025-Q3','F2022-Q3','F2019-Q2','S2018-Q2'],P_dblRect);
X_('x-dbl-voltri','DBL',2,['F2024-Q4'],P_dblVolTri);
X_('x-dbl-avg','DBL',1,['S2023-Q5'],P_dblAvg);
X_('x-dbl-between','DBL',1,['16.2 #43–56'],P_dblBetween);
X_('x-dbl-sinc','DBL',1,['S2023-Q6'],P_dblSinc);
X_('x-dbl-riemann','DBL',1,['F2018-Q3'],P_dblRiemann);
X_('x-dbl-volexp','DBL',1,['F2023-Q11'],P_dblVolExp);
X_('x-pol-sector','POLAR',3,['S2025-Q8','S2018-Q4','S2017-Q5'],P_polSector);
X_('x-pol-gauss','POLAR',3,['F2024-Q9','S2024-Q5','F2022-Q4','S2022-Q9','F2017-Q3'],P_polGauss);
X_('x-pol-convert','POLAR',2,['S2019-Q3','F2023-Q3'],()=>P_polConvert(false));
X_('x-pol-convert-set','POLAR',1,['S2023-Q7'],()=>P_polConvert(true));
X_('x-pol-off','POLAR',2,['F2016-Q5'],P_polOff);
X_('x-pol-vol','POLAR',2,['S2024-Q3','F2018-Q5'],P_polVol);
X_('x-tri-plane','TRI',3,['F2023-Q8','S2024-Q6','S2019-Q5','F2019-Q4','F2022-Q5'],P_triPlane);
X_('x-tri-reorder','TRI',3,['S2025-Q6','F2018-Q7','S2018-Q5'],P_triReorder);
X_('x-tri-which','TRI',2,['S2022-Q3','F2017-Q5'],P_triWhich);
X_('x-tri-eval','TRI',2,['F2024-Q5','F2018-Q8'],P_triEval);
X_('x-tri-vol','TRI',2,['S2023-Q10','16.4 #15–29'],P_triVol);
X_('x-tri-avg','TRI',1,['16.4 #51–54'],P_triAvg);
X_('x-cyl-convert','CYL',3,['F2023-Q9','F2022-Q7','S2019-Q6','F2017-Q6','S2017-Q8'],P_cylConvert);
X_('x-cyl-eval','CYL',3,['S2023-Q9','S2022-Q8','S2025-Q5','F2019-Q5'],P_cylEval);
X_('x-cyl-vol','CYL',2,['F2018-Q9','F2022-Q6','16.5 #72'],P_cylVol);
X_('x-cyl-xaxis','CYL',1,['F2016-Q8'],P_cylXaxis);
X_('x-sph-setup','SPH',3,['F2024-Q6','F2023-Q5','F2016-Q9'],P_sphSetup);
X_('x-sph-vol','SPH',3,['S2025-Q1','F2017-Q4','F2016-Q10'],P_sphVol);
X_('x-sph-shell','SPH',2,['S2019-Q7','F2018-Q10','S2018-Q6','S2017-Q6'],P_sphShell);
X_('x-sph-off','SPH',2,['F2019-Q7','S2023-Q11'],P_sphOff);
X_('x-sph-planes','SPH',2,['S2022-Q6'],P_sphPlanes);
X_('x-sph-convert','SPH',2,['F2019-Q6'],P_sphConvert);
X_('x-sph-surf','SPH',1,['S2018-Q8'],P_sphSurf);
X_('x-mass-rect','MASS',2,['F2023-Q7'],P_massRect);
X_('x-mass-lam','MASS',2,['S2023-Q12','S2017-Q4'],P_massLam);
X_('x-mass-tet','MASS',2,['F2019-Q8'],P_massTet);
X_('x-mass-cube','MASS',1,['S2022-Q1'],P_massCube);
X_('x-mass-hemi','MASS',1,['16.6 #36–38'],P_massHemi);
X_('x-vf-pic','VF',3,['F2023-Q10','S2022-Q4','F2017-Q8','F2018-Q12','F2016-Q11'],P_vfPic);
X_('x-vf-normal','VF',2,['F2024-Q10'],P_vfNormal);
X_('x-vf-equip','VF',2,['S2025-Q7'],P_vfEquip);
X_('x-ls-seg','LINES',3,['F2023-Q4','F2017-Q9'],P_lsSeg);
X_('x-ls-helix','LINES',3,['S2022-Q2','F2019-Q10','S2018-Q10','S2017-Q9'],P_lsHelix);
X_('x-ls-cancel','LINES',2,['S2025-Q2','F2024-Q11','S2019-Q10'],P_lsCancel);
X_('x-ls-arc','LINES',2,['F2019-Q11'],P_lsArc);
X_('x-ls-avg','LINES',1,['17.2 #37–38'],P_lsAvg);
X_('x-w-seg','WORK',2,['S2022-Q11'],P_wSeg);
X_('x-w-rot','WORK',3,['F2023-Q12','S2018-Q9','S2025-Q10'],P_wRot);
X_('x-w-radial','WORK',2,['S2024-Q2'],P_wRadial);
X_('x-w-dxdy','WORK',2,['S2019-Q9','F2017-Q10','S2017-Q10','F2016-Q12'],P_wDxDy);
X_('x-w-flux','WORK',2,['F2024-Q12'],P_wFlux);
X_('x-w-concept','WORK',1,['F2016-Q4 format'],P_wConcept);
X_('x-c-pot','CONS',3,['F2024-Q1','F2019-Q9'],P_cPot);
X_('x-c-ftli','CONS',3,['F2023-Q2','S2022-Q5'],P_cFTLI);
X_('x-c-spiral','CONS',2,['S2024-Q9','S2018-Q11','S2017-Q12'],P_cSpiral);
X_('x-c-path','CONS',2,['S2025-Q9'],P_cPath);
X_('x-c-vortex','CONS',1,['17.3 #59–62'],P_cVortex);
X_('x-c-const','CONS',1,['17.3 #71–75'],P_cConst);
X_('x-c-which','CONS',1,['17.3 #9–16'],P_cWhich);
X_('x-g-poly','GREEN',3,['S2025-Q4','S2022-Q12'],P_gPoly);
X_('x-g-tri','GREEN',2,['F2024-Q2'],P_gTri);
X_('x-g-area','GREEN',2,['S2024-Q1'],P_gArea);
X_('x-g-circle','GREEN',2,['17.4 #31–40'],P_gCircle);
X_('x-g-hole','GREEN',1,['17.4 twist'],P_gHole);
X_('x-g-flux','GREEN',1,['17.4 #27–30'],P_gFlux);
X_('x-g-open','GREEN',1,['17.4 twist'],P_gOpen);
X_('x-dc-curl','DIVC',3,['F2024-Q3'],P_dcCurl);
X_('x-dc-lap','DIVC',2,['S2024-Q10'],P_dcLap);
X_('x-dc-ident','DIVC',2,['17.5 #35–41'],P_dcIdent);
X_('x-dc-rot','DIVC',1,['17.5 #42–45'],P_dcRot);
X_('x-dc-radial','DIVC',1,['17.5 #17–20'],P_dcRadial);
X_('x-s-plane','SURF',3,['S2024-Q11','S2019-Q4','S2017-Q7'],P_sPlane);
X_('x-s-parab','SURF',2,['S2018-Q7','F2017-Q7'],P_sParab);
X_('x-s-cone','SURF',1,['17.6 #58'],P_sCone);
X_('x-s-sphere','SURF',2,['17.6 #25–28'],P_sSphere);
X_('x-s-graph','SURF',1,['17.6 #35–38'],P_sGraph);
X_('x-s-param','SURF',1,['17.6 #9–18'],P_sParam);
