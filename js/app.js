(function(){'use strict';
var $=function(i){return document.getElementById(i)};
/* ===== CONFIG — change the exam date here (Cairo local time) ===== */
var EXAM={year:2027,month:1,day:16,hour:0,minute:0};
function cairoTs(e){ // wall-clock time in Africa/Cairo -> UTC timestamp (handles daylight saving)
 var g=Date.UTC(e.year,e.month-1,e.day,e.hour,e.minute);
 try{var f=new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Cairo',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
  var off=function(ts){var p={};f.formatToParts(new Date(ts)).forEach(function(x){p[x.type]=+x.value});return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-Math.floor(ts/1000)*1000};
  var t=g-off(g);return g-off(t)}catch(err){return g-2*36e5}}
var TARGET=cairoTs(EXAM);
var DD=String(EXAM.day).padStart(2,'0'),DM=String(EXAM.month).padStart(2,'0'),DATE_TXT=DD+' · '+DM+' · '+EXAM.year;
$('dchip').textContent=DATE_TXT;document.querySelector('.dt').textContent=DATE_TXT;document.querySelector('.fin .d').textContent=DATE_TXT;
var low=matchMedia('(max-width:760px)').matches||(navigator.hardwareConcurrency||8)<=4;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(low)document.documentElement.classList.add('low');
var weak=low&&((navigator.deviceMemory||4)<=2||(navigator.hardwareConcurrency||4)<=2);

/* ---------- countdown (real time, never negative) ---------- */
function pad(n){return String(n).padStart(2,'0')}
function vals(){var ms=Math.max(0,TARGET-Date.now());return[Math.floor(ms/864e5),Math.floor(ms%864e5/36e5),Math.floor(ms%36e5/6e4),Math.floor(ms%6e4/1e3),ms]}
var timer;
function tick(){var v=vals();$('h-d').textContent=pad(v[0]);$('h-h').textContent=pad(v[1]);$('h-m').textContent=pad(v[2]);$('h-s').textContent=pad(v[3]);
 var cs=[$('cs')];capUpdate(v);
 if(v[4]===0){$('ttl').textContent='جه الميعاد، بالتوفيق!';clearInterval(timer)}}

/* ---------- scroll-driven UI ---------- */
var CH=[['الأيام','يوم على أول امتحان'],['الساعات','ساعة متبقية بعد الأيام'],['الدقايق','دقيقة متبقية بعد الساعات'],['الثواني','ثانية بتعدّ دلوقتي']];
var eBy=$('byfin'),eChip=$('dchip'),eHero=$('hero'),eHud=$('hud'),eChap=$('chap'),eFin=$('fin'),eCue=$('cue'),rail=$('rail').children,lab=[$('l0'),$('l1'),$('l2'),$('l3')],act=-1,lastV=[0,0,0,0];
function sst(a){a=a<0?0:a>1?1:a;return a*a*(3-2*a)}
function capUpdate(v){lastV=v;if(act>=0)$('cs').innerHTML='<b>'+v[act]+'</b> '+CH[act][1]}
function ui(p){
 var u=p*6,ci=Math.round(u),a=-1;if(ci>=1&&ci<=4&&Math.abs(u-ci)<.42)a=ci-1;
 var al=a<0?0:sst(1-Math.abs(u-ci)/.42);
 if(a!==act){act=a;if(a>=0){$('cn').textContent='0'+(a+1)+' / 04';$('ct').textContent=CH[a][0];capUpdate(lastV)}for(var i=0;i<4;i++)rail[i].className=i===a?'on':''}
 eChap.style.opacity=al.toFixed(3);
 eHero.style.opacity=(1-sst(p/.06)).toFixed(3);eCue.style.opacity=(1-sst(p/.03)).toFixed(3);
 eHud.style.opacity=(1-sst((p-.84)/.05)).toFixed(3);eChip.style.opacity=(sst((p-.06)/.04)*(1-sst((p-.86)/.05))*.85).toFixed(3);
 eFin.style.opacity=sst((p-.86)/.08).toFixed(3);eBy.style.opacity=sst((p-.9)/.07).toFixed(3);
}

/* ---------- 3D ---------- */
var mx=0,my=0,pulse=0;
addEventListener('pointermove',function(e){mx=e.clientX/innerWidth*2-1;my=-(e.clientY/innerHeight*2-1)},{passive:true});
addEventListener('pointerdown',function(){pulse=1});
function scene3d(){
 var T=THREE,gl=$('gl');
 var R=new T.WebGLRenderer({canvas:gl,antialias:!weak,powerPreference:'high-performance'});
 var pr=Math.min(devicePixelRatio,low?1.5:2);R.setPixelRatio(pr);R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.1;
 var scene=new T.Scene(),cam=new T.PerspectiveCamera(36,1,.1,200);
 scene.background=new T.Color(0x08080a);scene.fog=new T.FogExp2(0x08080a,.016);

 // studio environment (warm + white strips) for crisp bevel highlights
 var env=new T.Scene();env.background=new T.Color(0x0b0b0e);
 [[0xfff1e0,4,[0,6,7],[10,1.6]],[0xffffff,3,[-5,4,6],[1.4,8]],[0xff7a3c,3.5,[8,-1,3],[2.5,9]],[0xdfe7ff,1.6,[-9,0,-4],[10,9]],[0xff5a1f,2.5,[0,-6,4],[10,2]]].forEach(function(p){
  var m=new T.Mesh(new T.PlaneGeometry(p[3][0],p[3][1]),new T.MeshBasicMaterial({color:new T.Color(p[0]).multiplyScalar(p[1]),side:T.DoubleSide}));m.position.set(p[2][0],p[2][1],p[2][2]);m.lookAt(0,0,0);env.add(m)});
 var pm=new T.PMREMGenerator(R);scene.environment=pm.fromScene(env,.03).texture;pm.dispose();
 env.traverse(function(o){if(o.isMesh){o.geometry.dispose();o.material.dispose()}});

 var cv=document.createElement('canvas');cv.width=cv.height=128;var cx=cv.getContext('2d'),gr=cx.createRadialGradient(64,64,0,64,64,64);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=gr;cx.fillRect(0,0,128,128);
 var gtex=new T.CanvasTexture(cv);
 function halo(c,s,o){var sp=new T.Sprite(new T.SpriteMaterial({map:gtex,color:c,transparent:true,opacity:o,blending:T.AdditiveBlending,depthWrite:false,fog:false}));sp.scale.set(s,s,1);return sp}

 /* ===== seven-segment digit factory ===== */
 var SW=1.9,SH=3.6,ST=.38,SG=.05,hl=SW-ST-SG*2,vl=SH/2-ST-SG*2;
 function segGeo(len,vert){var h=ST/2,l=len/2,sh=new T.Shape();sh.moveTo(-l,0);sh.lineTo(-l+h,h);sh.lineTo(l-h,h);sh.lineTo(l,0);sh.lineTo(l-h,-h);sh.lineTo(-l+h,-h);sh.lineTo(-l,0);
  var g=new T.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:1,curveSegments:1});g.translate(0,0,-.15);if(vert)g.rotateZ(Math.PI/2);return g}
 var gH=segGeo(hl,false),gV=segGeo(vl,true);
 var SEG=[[gH,0,SH/2],[gV,SW/2,SH/4],[gV,SW/2,-SH/4],[gH,0,-SH/2],[gV,-SW/2,-SH/4],[gV,-SW/2,SH/4],[gH,0,0]]; // a b c d e f g
 var MASK=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
 var OFF=new T.Color(0x040405),BONE=new T.Color(0xf3ede3),EMB=new T.Color(0xff5a1f);
 function makeDigit(accent,on,gain){var g=new T.Group(),segs=[];
  for(var i=0;i<7;i++){var m=new T.MeshStandardMaterial({color:OFF,roughness:.32,metalness:.35,emissive:EMB,emissiveIntensity:0,envMapIntensity:.9,transparent:true,opacity:.04}),me=new T.Mesh(SEG[i][0],m);me.position.set(SEG[i][1],SEG[i][2],0);g.add(me);me.visible=false;segs.push({m:m,k:0,me:me})}
  var h=halo(accent?0xff5a1f:0xffb27a,7,0);h.position.z=-.6;g.add(h);
  return {g:g,segs:segs,halo:h,val:-1,flash:0,tgt:'0000000',delay:0,on:on||BONE,gain:gain||1}}
 function setDigitVal(d,v){if(v!==d.val){if(d.val!==-1)d.flash=1;d.val=v;d.tgt=v<0?'0000000':MASK[v]}}
 function updDigit(d,dt,lit){d.flash=Math.max(0,d.flash-dt*2.2);var kk=1-Math.exp(-dt*14);
  for(var i=0;i<7;i++){var s=d.segs[i],t=d.tgt.charCodeAt(i)===49?lit:0;s.k+=(t-s.k)*kk;s.m.color.copy(OFF).lerp(d.on,s.k);s.me.visible=s.k>.01;s.m.opacity=Math.min(1,.04+s.k*1.1);s.m.emissiveIntensity=s.k*(.9*d.gain+d.flash*1.6+pulse*.8);s.m.envMapIntensity=.03+.9*s.k}
  d.halo.material.opacity=Math.min(.5,(lit>0?.3:0)*Math.max(s0(d),0)+d.flash*.25+pulse*.1)}
 function s0(d){var n=0;for(var i=0;i<7;i++)n+=d.segs[i].k;return n/5}

 /* ===== the row: DAYS · HOURS · MINUTES · SECONDS ===== */
 var DX=1.75,units=[],roots=[],mirs=[],digs=[],floorY=-3.4;
 var ROOT=new T.Group();scene.add(ROOT);
 for(var u=0;u<4;u++){
  var root=new T.Group(),U=new T.Group(),acc=u===3,ds=[];
  for(var j=0;j<2;j++){var d=makeDigit(acc);d.g.position.x=(j?1:-1)*DX;U.add(d.g);ds.push(d);digs.push(d)}
  root.add(U);
  if(!low){var Um=U.clone();Um.traverse(function(o){if(o.isMesh)o.visible=true});Um.scale.y=-1;root.add(Um);mirs.push(Um)}else mirs.push(null);
  ROOT.add(root);roots.push(root);units.push(ds)}
 var cols=[];for(var ci2=0;ci2<3;ci2++){var cg=new T.Group();for(var cj=0;cj<2;cj++){var cm=new T.Mesh(new T.BoxGeometry(.4,.4,.32),new T.MeshStandardMaterial({color:0xf3ede3,emissive:0xff5a1f,emissiveIntensity:.8,roughness:.4,metalness:.4,envMapIntensity:.5}));cm.position.y=cj?-.8:.8;cg.add(cm)}ROOT.add(cg);cols.push(cg)}
 var DG=new T.Group(),DI=new T.Group(),ddig=[],ddot=[],EML=new T.Color(0xff6a2b),dseq=DD+'|'+DM+'|'+EXAM.year,ddx=0;DG.add(DI);ROOT.add(DG);
 for(var dq=0;dq<dseq.length;dq++){var dch=dseq.charAt(dq);
  if(dch==='|'){var dmm=new T.Mesh(new T.BoxGeometry(.5,.5,.34),new T.MeshStandardMaterial({color:0xff6a2b,emissive:0xff5a1f,emissiveIntensity:1.3,roughness:.4,metalness:.3,transparent:true,opacity:0}));dmm.position.set(ddx-.85,-SH/2+.25,0);dmm.visible=false;DI.add(dmm);ddot.push(dmm);ddx+=1.8;continue}
  var dd2=makeDigit(true,EML,1.7);dd2.g.position.x=ddx;DI.add(dd2.g);setDigitVal(dd2,+dch);ddig.push(dd2);ddx+=3.5}
 DI.position.x=-(ddx-3.5)/2;
 // floor + warm pool of light + grid (gives scroll its speed)
 var floor=new T.Mesh(new T.PlaneGeometry(500,500),new T.MeshBasicMaterial({color:0x08080a,transparent:true,opacity:.86,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.renderOrder=1;scene.add(floor);
 var grid=new T.GridHelper(300,100,0x8a3f1a,0x3a1c0e);grid.material.transparent=true;grid.material.opacity=.5;grid.renderOrder=2;scene.add(grid);
 var pool=new T.Mesh(new T.PlaneGeometry(70,26),new T.MeshBasicMaterial({map:gtex,color:0xff5a1f,transparent:true,opacity:.28,blending:T.AdditiveBlending,depthWrite:false,fog:false}));pool.rotation.x=-Math.PI/2;pool.renderOrder=3;scene.add(pool);
 // giant ghost digits far behind for depth
 // dust
 var dp=[],dc=[];for(var di=0;di<(low?220:700);di++){dp.push((Math.random()-.5)*90,floorY+.5+Math.random()*16,-60+Math.random()*100);dc.push(1,.55+Math.random()*.35,.25+Math.random()*.3)}
 var dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(dp,3));dg.setAttribute('color',new T.Float32BufferAttribute(dc,3));
 var dust=new T.Points(dg,new T.PointsMaterial({size:.1,map:gtex,vertexColors:true,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false}));dust.renderOrder=5;scene.add(dust);
 // lights
 scene.add(new T.HemisphereLight(0xaa8866,0x050505,.5));
 var key=new T.DirectionalLight(0xfff1e0,1.1);key.position.set(4,8,10);scene.add(key);
 var pl=new T.PointLight(0xff5a1f,70,40,2);pl.position.set(0,3,8);scene.add(pl);
 var rim=new T.PointLight(0xffffff,50,30,2);scene.add(rim);

 /* ===== layout + camera path ===== */
 var FT=[0,8],UX,UY,heroFov=34,dFit=30,camP,lookP,maxS=1,land=true,sp=0,tgt=0,tp=new T.Vector3(),tl=new T.Vector3(),proj=new T.Vector3();
 function V(x,y,z){return new T.Vector3(x,y,z)}
 function layout(){
  var w=innerWidth,h=innerHeight,a=w/h;land=a>1.1;R.setPixelRatio(pr);R.setSize(w,h,false);cam.aspect=a;
  UX=land?[-10.5,-3.5,3.5,10.5]:[-4.2,4.2,-4.2,4.2];UY=land?[0,0,0,0]:[3.7,3.7,-3.7,-3.7];
  floorY=land?-3.4:-6.4;heroFov=land?34:48;
  var th=Math.tan(heroFov*Math.PI/360),fw=land?27:14.2,fh=land?4.6:11.6;
  dFit=Math.max(fw*1.14/(2*th*a),fh*1.5/(2*th));var th2=Math.tan(heroFov*.8*Math.PI/360),cD=land?11.5:Math.max(15,5.9*1.3/(2*th2*a));
  for(var i=0;i<4;i++){roots[i].position.set(UX[i],UY[i],0);if(mirs[i]){mirs[i].position.y=2*(floorY-UY[i])}}
  cols[0].position.set((UX[0]+UX[1])/2,(UY[0]+UY[1])/2,0);cols[1].position.set((UX[1]+UX[2])/2,0,0);cols[1].visible=land;cols[2].position.set((UX[2]+UX[3])/2,(UY[2]+UY[3])/2,0);
  var DIs=function(d){return{g:d.g}},DDt=function(m){return{dot:true,m:m}};
  function arr(items,y){var x=0,ps=[];items.forEach(function(it){if(it.dot){ps.push(x-.85);x+=1.8}else{ps.push(x);x+=3.5}});var W=x-3.5;items.forEach(function(it,i){var o=it.dot?it.m:it.g;o.position.x=ps[i]-W/2;o.position.y=it.dot?y-SH/2+.25:y})}
  DI.position.x=0;
  if(land){arr([DIs(ddig[0]),DIs(ddig[1]),DDt(ddot[0]),DIs(ddig[2]),DIs(ddig[3]),DDt(ddot[1]),DIs(ddig[4]),DIs(ddig[5]),DIs(ddig[6]),DIs(ddig[7])],0);DG.scale.setScalar(.87);DG.position.y=6.2}
  else{arr([DIs(ddig[0]),DIs(ddig[1]),DDt(ddot[0]),DIs(ddig[2]),DIs(ddig[3])],2.6);arr([DIs(ddig[4]),DIs(ddig[5]),DIs(ddig[6]),DIs(ddig[7])],-2.6);DG.scale.setScalar(.8);DG.position.y=12.2}
  ddot[1].userData.hide=!land;
  floor.position.y=floorY;grid.position.y=floorY+.02;pool.position.y=floorY+.04;
  var P=[V(0,land?1.4:1.4,dFit)],L=[V(0,land?.3:1.4,0)],off=[-3.2,2.4,-2.4,3.2];
  for(var k=0;k<4;k++){P.push(V(UX[k]+(land?off[k]+1.8:0),land?UY[k]+(k%2?1.6:.2)+.5:UY[k]+.4,cD));L.push(V(UX[k]+(land?1.8:0),UY[k],0))}
  P.push(V(UX[3]+5,UY[3]+7,dFit*.65));L.push(V(0,0,0));
  var dtop,hx,yb;if(land){dtop=6.2+(SH/2+.3)*.87;hx=Math.max(13.6,15.2*.87+1.2);yb=-2.6}else{dtop=12.2+(2.6+SH/2+.3)*.8;hx=7.6;yb=-5.9}
  var yt=dtop+2.7;yb-=.2*(yt-yb);var cy=(yb+yt)/2,fd=Math.max(hx*1.06/(th*a),(yt-yb)/2*1.08/th);FT=[0,dtop+.9];
  P.push(V(0,cy,fd));L.push(V(0,cy,0));
  camP=new T.CatmullRomCurve3(P,false,'centripetal');lookP=new T.CatmullRomCurve3(L,false,'centripetal');
  maxS=Math.max(1,document.documentElement.scrollHeight-h)}
 layout();var rz=0;addEventListener('resize',function(){if(!rz)rz=requestAnimationFrame(function(){rz=0;layout()})});

 var clk=new T.Clock(),sx=0,sy=0,sm=reduce?.3:1,mf=reduce?.3:1,dead=false;
 var raf=0,fa=0,fc=0,adj=0;
 gl.addEventListener('webglcontextlost',function(e){e.preventDefault();dead=true;if(raf){cancelAnimationFrame(raf);raf=0}document.documentElement.classList.add('no-gl')});
 gl.addEventListener('webglcontextrestored',function(){dead=false;document.documentElement.classList.remove('no-gl');layout();start()});
 function start(){if(!raf&&!dead&&!document.hidden){clk.getDelta();raf=requestAnimationFrame(loop)}}
 document.addEventListener('visibilitychange',function(){if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0}}else start()});
 function labels(){for(var i=0;i<4;i++){proj.set(UX[i],UY[i]+SH/2+1.35,0).project(cam);var el=lab[i];
  if(proj.z>1||Math.abs(proj.x)>1.1||Math.abs(proj.y)>1.1){el.style.opacity=0;continue}
  el.style.left=((proj.x*.5+.5)*innerWidth).toFixed(1)+'px';el.style.top=((-proj.y*.5+.5)*innerHeight).toFixed(1)+'px';
  el.style.opacity=Math.min(1,(1-sst(sp/.06))+sst((sp-.88)/.06)).toFixed(3)}
  if(sp>.8){proj.set(FT[0],FT[1],0).project(cam);eFin.style.left=((proj.x*.5+.5)*innerWidth).toFixed(1)+'px';eFin.style.top=((-proj.y*.5+.5)*innerHeight).toFixed(1)+'px'}}
 function loop(){raf=0;if(dead||document.hidden)return;raf=requestAnimationFrame(loop);
  var dt=Math.min(clk.getDelta(),.1),t=clk.elapsedTime,k=1-Math.exp(-dt*3.5);
  pulse*=Math.exp(-dt*2.5);
  var ie=reduce?1:Math.min(1,t/2.4),e=1-Math.pow(1-ie,4),lit=reduce?1:sst((t-.5)/1.3);
  sx+=(mx*mf-sx)*k;sy+=(my*mf-sy)*k;
  tgt=Math.min(1,Math.max(0,(window.pageYOffset||0)/maxS));sp+=(tgt-sp)*(1-Math.exp(-dt*(reduce?12:4.5)));
  camP.getPoint(sp,tp);lookP.getPoint(sp,tl);
  var dist=tp.distanceTo(tl),pm2=1-.6*sp;
  cam.fov=heroFov*(.74+.26*Math.min(1,dist/dFit));cam.updateProjectionMatrix();
  cam.position.set(tp.x+sx*1.2*pm2,tp.y+sy*.7*pm2,tp.z+(1-e)*14);
  var roll=Math.sin(sp*18)*.035+sx*.02;cam.up.set(Math.sin(roll),Math.cos(roll),0);cam.lookAt(tl);
  var v=vals(),dv=[v[0],v[1],v[2],v[3]];
  for(var i=0;i<4;i++){var ds=units[i],n=dv[i];if(i===0&&n>99)n=99;setDigitVal(ds[0],Math.floor(n/10));setDigitVal(ds[1],n%10);
   roots[i].rotation.y=sx*.12+Math.sin(t*.5*sm+i)*.04*sm}
  for(i=0;i<digs.length;i++)updDigit(digs[i],dt,lit);
  var dl=lit*sst((sp-.84)/.1);for(i=0;i<ddig.length;i++)updDigit(ddig[i],dt,dl);for(i=0;i<ddot.length;i++){ddot[i].material.opacity=dl;ddot[i].visible=dl>.01&&!ddot[i].userData.hide}
  var bl=.35+.65*Math.max(0,Math.sin(Date.now()/1000*Math.PI*2));for(i=0;i<3;i++)for(var cq=0;cq<2;cq++)cols[i].children[cq].material.emissiveIntensity=bl*lit;
  rim.position.set(tp.x+sx*8,tp.y+3+sy*4,tp.z+4);pl.position.set(tp.x*.5,3,tp.z-4);
  dust.position.set(-sx*1.5,0,0);dust.rotation.y=t*.006*sm;
  cam.updateMatrixWorld();ui(sp);labels();
  R.render(scene,cam);
  if(t>2.6&&adj<3){fa+=dt;if(++fc===90){if(fa/90>.034&&pr>.75){pr=Math.max(.75,pr-.25);adj++;layout()}fa=0;fc=0}}}
 addEventListener('pagehide',function(){dead=true;if(raf)cancelAnimationFrame(raf);scene.traverse(function(o){if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){if(m.map)m.map.dispose();m.dispose()})});if(scene.environment)scene.environment.dispose();gtex.dispose();R.dispose()});
 addEventListener('pageshow',function(e){if(e.persisted)location.reload()});
 start();gl.classList.add('on');document.documentElement.classList.remove('ld');
}
tick();timer=setInterval(tick,100);
var SRC='https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js',SRI='sha384-aUS0jUAjhhBFNPifgxTHTNcsZDqkbegLd/JKEhJzK3Lyg9nFF1PZ2J++mzKwd8Kz',started=false;
function fallback(){document.documentElement.classList.add('no-gl');document.documentElement.classList.remove('ld')}
function boot(){if(started)return;started=true;document.documentElement.classList.remove('no-gl');try{scene3d()}catch(e){started=false;fallback()}}
function load(sri){var sc=document.createElement('script');sc.src=SRC;if(sri){sc.integrity=SRI;sc.crossOrigin='anonymous'}sc.onload=boot;sc.onerror=function(){sc.remove();if(sri)load(false);else fallback()};document.head.appendChild(sc)}
if(window.THREE)boot();else{load(true);setTimeout(function(){if(!started)fallback()},12000)}
})();
