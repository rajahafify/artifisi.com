const fs = require("fs");
const d = JSON.parse(fs.readFileSync("data.json", "utf8"));
const S = d.sections.slice().sort((a,b) => a.r25 - b.r25 || b.r10 - a.r10);
const nat = d.national;
const PAPER="#f6f2ea", INK="#332d26", MUT="#6e665a", RULE="#dcd3c2", ACC="#1e5b49", WARN="#a6442a", CTX="#b6ab96";
const L=90, W=900, X0=120, X1=960;
let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
function line(x1,y1,x2,y2,st,sw,dash){return '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+st+'" stroke-width="'+(sw||1.5)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';}
function rect(x,y,w,h,st,sw,fill,dash){return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+Math.max(0.1,w).toFixed(1)+'" height="'+Math.max(0.1,h).toFixed(1)+'" fill="'+(fill||"none")+'" stroke="'+(st||"none")+'" stroke-width="'+(sw||1.5)+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';}
function dot(x,y,r,f){return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r+'" fill="'+f+'"/>';}
function txt(x,y,s,size,fill,anchor,family,weight,ls){return '<text x="'+x+'" y="'+y+'" font-family="'+(family||"'IBM Plex Mono',monospace")+'" font-size="'+size+'" fill="'+fill+'" text-anchor="'+(anchor||"start")+'" font-weight="'+(weight||400)+'" letter-spacing="'+(ls||0)+'">'+esc(s)+'</text>';}
const MONO="'IBM Plex Mono',monospace", SANS="'IBM Plex Sans',sans-serif", DISP="Fraunces,serif";

/* 1 lift */
function s1(){
  const top=480, gnd=1420, sl=370, sr=710, px=(gnd-top)/5990, yOf=v=>gnd-v*px;
  let g="";
  for(let v=1000;v<=5000;v+=1000){
    g+=line(sl,yOf(v),sr,yOf(v),RULE,1);
    if(v!==3000) g+=txt(sl-16,yOf(v)+6,v.toLocaleString("en"),15,CTX,"end",MONO);
  }
  g+=line(sl,top,sl,gnd,INK,2)+line(sr,top,sr,gnd,INK,2);
  g+=line(sl-40,gnd,sr+40,gnd,INK,2.5);
  const ym=yOf(nat.med2025);
  g+=line(sl-70,ym,sr+70,ym,WARN,2)+dot(sl-70,ym,5,WARN);
  g+=txt(sr+86,ym+7,"2,940",26,INK,"start",MONO,500);
  g+=txt(sr+86,ym+38,"national median",19,MUT,"start",MONO);
  g+=line(sr+80,ym,sr+80,top+40,ACC,1.5,"6 7");
  g+='<path d="M'+(sr+80)+' '+(top+34)+' l-7 12 l14 0 z" fill="'+ACC+'"/>';
  g+=txt(sr+96,top+84,"2.04\u00d7",30,ACC,"start",MONO,500);
  g+=txt(sr+96,top+116,"the median",19,MUT,"start",MONO);
  g+=rect(sl+16,top+8,sr-sl-32,66,ACC,2.5,PAPER);
  g+=line(sl+16,top+41,sr-16,top+41,ACC,1.5);
  g+=txt(sl-16,top+18,"5,990",26,INK,"end",MONO,500);
  g+=txt(sl-16,top+48,"education",19,MUT,"end",MONO);
  g+=txt(sl-16,gnd-10,"0",15,CTX,"end",MONO);
  return g;
}

/* 2 fork */
function s2(){
  const fy0=620, fy1=700, bot=1300;
  const tot=S.reduce((t,s)=>t+s.share,0), k=(X1-X0)/tot;
  const below=S.filter(s=>s.r25<1), above=S.filter(s=>s.r25>=1);
  const wB=below.reduce((t,s)=>t+s.share,0)*k, wA=above.reduce((t,s)=>t+s.share,0)*k;
  const split=X0+wB, gap=26;
  let g="";
  g+=rect(X0,fy0,X1-X0,fy1-fy0,INK,2,PAPER);
  for(let i=0;i<64;i++) g+=dot(X0+14+ (i/64)*(X1-X0-28), fy0+22+((i%3)*18), 5, INK);
  // funnels
  g+=line(X0,fy1,X0,fy1+56,INK,2)+line(X1,fy1,X1,fy1+56,INK,2);
  g+=line(X0,fy1+56,X0,   bot,INK,2);
  g+=line(X1,fy1+56,X1,   bot,INK,2);
  // left chute (below median)
  g+=line(X0,fy1+56,split-gap/2,fy1+56,INK,2);
  g+=line(split-gap/2,fy1+56,split-gap/2,bot,INK,2.5);
  g+=line(split+gap/2,fy1+56,split+gap/2,bot,INK,2.5);
  g+=line(split+gap/2,fy1+56,X1,fy1+56,INK,2);
  // lanes
  let x=X0;
  below.forEach(s=>{ const w=s.share*k; x+=w; if(x<split-gap/2-4) g+=line(x,fy1+56,x,bot,RULE,1); });
  x=split+gap/2;
  above.forEach(s=>{ const w=s.share*k; x+=w; if(x<X1-4) g+=line(x,fy1+56,x,bot,RULE,1); });
  // falling workers
  for(let i=0;i<150;i++){
    const inB = i < 99;
    const lo = inB ? X0+10 : split+gap/2+10;
    const hi = inB ? split-gap/2-10 : X1-10;
    const px = lo + rnd()*(hi-lo);
    const py = fy1+70 + rnd()*(bot-fy1-90);
    g+=dot(px,py,4.5, inB?INK:CTX);
  }
  g+=line(split,fy1+30,split,bot-10,WARN,2.5);
  g+=txt(split-18,fy1+44,"median",19,WARN,"end",MONO,500);
  g+=line(X0,bot,X1,bot,INK,2.5);
  g+=txt(X0,bot+66,"65.8%",46,INK,"start",MONO,500);
  g+=txt(X0,bot+100,"of all employees",19,MUT,"start",MONO);
  g+=txt(X1,bot+66,"34.2%",46,MUT,"end",MONO,500);
  g+=txt(X1,bot+100,"above the median",19,MUT,"end",MONO);
  return g;
}

/* 3 corridor */
function s3(){
  const x0=132, x1=948, cy=975, wh=46;
  const yrs=d.series.years, sp=d.series.spread;
  const dx=(x1-x0)/(yrs.length-1);
  const hwOf=v=>72+(v-3.0)*165;
  const X=i=>x0+i*dx;
  const baseY=(i,sg)=>cy+sg*hwOf(sp[i]);
  function wall(sg,fill){
    let a="", b="";
    for(let i=0;i<yrs.length;i++) a+=X(i).toFixed(1)+","+baseY(i,sg).toFixed(1)+" ";
    for(let i=yrs.length-1;i>=0;i--) b+=X(i).toFixed(1)+","+(baseY(i,sg)-wh).toFixed(1)+" ";
    return '<polygon points="'+(a+b).trim()+'" fill="'+fill+'" stroke="'+INK+'" stroke-width="1.5"/>';
  }
  let g="";
  let fp="";
  for(let i=0;i<yrs.length;i++) fp+=X(i).toFixed(1)+","+(cy-hwOf(sp[i])).toFixed(1)+" ";
  for(let i=yrs.length-1;i>=0;i--) fp+=X(i).toFixed(1)+","+(cy+hwOf(sp[i])).toFixed(1)+" ";
  g+='<polygon points="'+fp.trim()+'" fill="#e8e0d0" stroke="none"/>';
  for(let i=0;i<yrs.length;i++){ const h=hwOf(sp[i]); g+=line(X(i),cy-h,X(i),cy+h,RULE,i%3===0?1.2:0.8); }
  const i19=9, i20=10;
  g+='<polygon points="'+X(i19).toFixed(1)+","+(cy-hwOf(sp[i19])).toFixed(1)+" "+X(i20).toFixed(1)+","+(cy-hwOf(sp[i20])).toFixed(1)+" "+X(i20).toFixed(1)+","+(cy+hwOf(sp[i20])).toFixed(1)+" "+X(i19).toFixed(1)+","+(cy+hwOf(sp[i19])).toFixed(1)+'" fill="'+WARN+'" fill-opacity="0.10" stroke="none"/>';
  g+=wall(-1,CTX);
  g+=wall(1,CTX);
  g+=line(x0,cy,x1,cy,CTX,0.9,"3 6");
  function call(i,px,py,anchor){
    const ay=cy-hwOf(sp[i])-wh;
    g+=line(X(i),ay,X(i),ay-10,INK,1.2);
    g+=line(X(i),ay-10,px,py,INK,1.1);
    g+=txt(px,py-40,String(yrs[i]),19,MUT,anchor,MONO);
    g+=txt(px,py-8,sp[i].toFixed(2),30,INK,anchor,MONO,500);
  }
  call(0,132,715,"start");
  call(9,556,762,"end");
  call(10,764,672,"start");
  call(15,948,760,"end");
  g+=line(x0,1262,x1,1262,RULE,1);
  for(let i=0;i<yrs.length;i+=3) g+=txt(X(i),1298,yrs[i],18,MUT,"middle",MONO);
  return g;
}

/* 4 section */
function s4(){
  const top=520, gnd=1420, k=(gnd-top)/2.50, sw=(X1-X0)/S.length;
  let g=rect(X0,top,X1-X0,gnd-top,INK,2.2,PAPER);
  for(let v=0.5;v<=2.0;v+=0.5){
    const y=gnd-v*k;
    g+=line(X0,y,X1,y,RULE,1);
    g+=txt(X0-18,y+6,v.toFixed(1)+"\u00d7",17,MUT,"end",MONO);
  }
  g+=line(X0-10,gnd,X1+10,gnd,INK,2.5);
  S.forEach((s,i)=>{
    const cx=X0+sw*i+sw/2;
    if(i>0) g+=line(X0+sw*i,top,X0+sw*i,gnd,RULE,1);
    const y10=gnd-s.r10*k, y25=gnd-s.r25*k;
    g+=rect(cx-sw*0.23,Math.min(y10,y25)-20,sw*0.46,Math.abs(y25-y10)+40,"none",1,"#efe9dd");
    g+=rect(cx-sw*0.30,y10-19,sw*0.60,38,CTX,1.2,PAPER,"4 4");
    g+=rect(cx-sw*0.30,y25-19,sw*0.60,38, s.r25>1.4?ACC:INK,1.6, s.r25>1.4?ACC:INK);
    g+=line(cx,y10,cx,y25,(y25<y10?ACC:WARN),2.2);
  });
  const idx=n=>S.findIndex(s=>s.name===n);
  const lab=[[idx("Health"),"+0.36",ACC],[idx("Public admin"),"+0.21",ACC],[idx("Real estate"),"-0.38",WARN],[idx("Mining"),"-0.30",WARN]];
  lab.sort(function(a,b){return a[0]-b[0];});
  lab.forEach(function(p,ii){
    const cx=X0+sw*p[0]+sw/2, s=S[p[0]], y=gnd-s.r25*k;
    const ly=1332+(ii%2)*46;
    g+=line(cx,y+22,cx,ly-24,p[2],1.1,"3 5");
    g+=txt(cx,ly,p[1],18,p[2],"middle",MONO,500);
  });
  g+=txt(X0,top-24,"2010 ghost, 2025 solid",18,MUT,"start",MONO);
  return g;
}

/* 5 city */
function s5(){
  const by=1330, kx=0.34, ky=0.17, kh=312;
  const tot=d.sections.reduce((t,s)=>t+s.share*s.r25,0);
  const items=S.map(s=>({s:s,w:Math.pow(s.share,0.7),h:s.r25,bill:s.share*s.r25/tot*100})).sort((a,b)=>a.bill-b.bill);
  const gap=10, x0=96, avail=888-gap*(items.length-1);
  const sumW=items.reduce((t,i)=>t+i.w,0);
  const kw=avail/sumW;
  let cx=x0; const pos=[];
  items.forEach(function(it){const w=it.w*kw; pos.push({s:it.s,x:cx,w:w,h:it.h,bill:it.bill}); cx+=w+gap;});
  let g="";
  pos.forEach(function(p){
    const w=p.w, h=p.h*kh, y=by-h, big=p.bill>=11;
    const d=w*0.9, sx=d*kx, sy=d*ky;
    const st=big?INK:CTX, sw=big?1.7:1.1;
    const body=big?(p.s.s==="P"?ACC:INK):"#e8e0d0";
    g+='<polygon points="'+(p.x+w).toFixed(1)+","+y.toFixed(1)+" "+(p.x+w+sx).toFixed(1)+","+(y-sy).toFixed(1)+" "+(p.x+w+sx).toFixed(1)+","+(by-sy).toFixed(1)+" "+(p.x+w).toFixed(1)+","+by.toFixed(1)+'" fill="'+(big?INK:"#ded4c0")+'" fill-opacity="'+(big?0.80:1)+'" stroke="'+st+'" stroke-width="'+sw+'"/>';
    g+=rect(p.x,y,w,h,st,sw,body);
    g+='<polygon points="'+p.x.toFixed(1)+","+y.toFixed(1)+" "+(p.x+w).toFixed(1)+","+y.toFixed(1)+" "+(p.x+w+sx).toFixed(1)+","+(y-sy).toFixed(1)+" "+(p.x+sx).toFixed(1)+","+(y-sy).toFixed(1)+'" fill="'+(big?INK:"#ded4c0")+'" fill-opacity="'+(big?0.90:1)+'" stroke="'+st+'" stroke-width="'+sw+'"/>';
    if(big){
      const cols=Math.max(2,Math.round(w/13)), rows=Math.max(3,Math.round(h/26));
      for(let i=1;i<cols;i++) g+=line(p.x+i*w/cols,y+8,p.x+i*w/cols,by-8,PAPER,1.3);
      for(let j=1;j<rows;j++) g+=line(p.x+5,y+j*h/rows,p.x+w-5,y+j*h/rows,PAPER,1.3);
    }
  });
  const four=pos.slice(-4);
  const bx0=four[0].x, bx1=four[3].x+four[3].w;
  const minY=Math.min.apply(null,four.map(function(p){return by-p.h*kh;}));
  const bY=minY-34, mid=(bx0+bx1)/2;
  g+=line(bx0,bY,bx1,bY,ACC,1.7);
  g+=line(bx0,bY,bx0,bY+13,ACC,1.7);
  g+=line(bx1,bY,bx1,bY+13,ACC,1.7);
  g+=txt(mid,bY-50,"four industries carry",18,MUT,"middle",MONO);
  g+=txt(mid,bY-12,"55.6%",46,ACC,"middle",MONO,500);
  g+=line(x0,by+2,pos[pos.length-1].x+pos[pos.length-1].w+30,by+2,INK,2.5);
  g+=txt(x0,by+46,"nineteen industries, smallest wage bill first",18,MUT,"start",MONO);
  return g;
}

function s6(){
  const gnd=1330, k=0.135;
  const pairs=[{n:"Agriculture",med:1813,mean:2575,x:170},{n:"Public admin",med:4625,mean:4838,x:600}];
  let g="";
  pairs.forEach(function(p){
    const w=230, x=p.x, yMed=gnd-p.med*k, yMean=gnd-p.mean*k, roof=Math.min(yMed,yMean);
    g+=rect(x,roof,w,gnd-roof,INK,2,PAPER);
    g+=line(x,yMed,x+w,yMed,INK,2.5);
    g+=txt(x+10,yMed+20,"median",15,MUT,"start",MONO);
    g+=line(x,yMean,x+w,yMean,ACC,2,"7 5");
    g+=txt(x+10,yMean+20,"mean",15,ACC,"start",MONO);
    g+=line(x+w+18,yMed,x+w+18,yMean,ACC,1.4);
    g+=line(x+w+13,yMed,x+w+23,yMed,ACC,1.4);
    g+=line(x+w+13,yMean,x+w+23,yMean,ACC,1.4);
    g+=txt(x+w+34,(yMed+yMean)/2+9,(p.mean/p.med).toFixed(2)+"\u00d7",24,ACC,"start",MONO,500);
    g+=txt(x,roof-44,p.n,25,INK,"start",MONO,500);
    g+=txt(x,gnd+40,"median "+p.med.toLocaleString("en"),17,MUT,"start",MONO);
    g+=txt(x,gnd+68,"mean "+p.mean.toLocaleString("en"),17,MUT,"start",MONO);
  });
  g+=line(150,gnd,960,gnd,INK,2.5);
  g+=txt(150,gnd+118,"the gap is how far the average sits above the typical wage",18,MUT,"start",MONO);
  return g;
}

const frames=[
 {n:"1",kicker:"Malaysia \u00b7 wages by industry \u00b7 2025",claim:"Education pays twice the national median.",svg:s1(),
  foot:"Median monthly wage, DOSM Salaries and Wages Survey. National median RM2,940.",cap:"The lift climbs from the national median to the education median."},
 {n:"2",kicker:"Nineteen industries \u00b7 2025",claim:"Two in three workers are in an industry that pays below the median.",svg:s2(),
  foot:"Share of employees by industry, DOSM 2025. 65.8% in industries below the national median.",cap:"The workforce forks at the median. Most of it goes left."},
 {n:"3",kicker:"The gap \u00b7 2010 to 2025",claim:"It narrowed for a decade, broke in 2020, and never got back to 2019.",svg:s3(),
  foot:"Ratio of the best-paid to the worst-paid industry median, each year.",cap:"The walls are the spread. In 2020 they slam apart."},
 {n:"4",kicker:"Who moved \u00b7 2010 to 2025",claim:"The public sector climbed. Resource and finance fell.",svg:s4(),
  foot:"Median wage against the national median, same year. Ghost 2010, solid 2025.",cap:"Nineteen lift cars, one year counter."},
 {n:"5",kicker:"The wage bill \u00b7 2025",claim:"Four industries carry more than half of it.",svg:s5(),
  foot:"Footprint is share of employees, height is pay, volume is the wage bill.",cap:"Lights fill in proportion to each industry's share of the bill."},
 {n:"6",kicker:"The average \u00b7 2025",claim:"Where pay is lowest, the average sits furthest above the typical wage.",svg:s6(),
  foot:"Mean and median monthly wage, DOSM 2025. Agriculture 1.42\u00d7, public administration 1.05\u00d7.",cap:"The lift stops at the median, then continues to the mean."}
];
const ONLY=process.env.ONLY;
let list = ONLY ? frames.filter(f=>f.n===ONLY) : frames;
let body="";
list.forEach(function(f){
  body+='<div class="frame"><p class="kick">'+f.kicker+'</p><div class="num">'+f.n+' / 6</div>';
  body+='<h2>'+f.claim+'</h2>';
  body+='<svg class="scene" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">'+f.svg+'</svg>';
  body+='<div class="foot">'+f.foot+'</div><div class="rule"></div>';
  body+='<div class="capzone">CAPTION BAND \u00b7 BURNED IN AT DELIVERY</div>';
  body+='<div class="cap">'+f.cap+'</div></div>';
});
const css='html,body{margin:0;padding:0;background:'+PAPER+';}'
 +'.frame{width:1080px;height:1920px;position:relative;overflow:hidden;background:'+PAPER+';page-break-after:always;}'
 +'.frame:last-child{page-break-after:auto}'
 +'.kick{position:absolute;left:'+L+'px;top:96px;font-family:'+MONO+';font-size:19px;letter-spacing:.22em;text-transform:uppercase;color:'+MUT+';margin:0}'
 +'.num{position:absolute;right:90px;top:96px;font-family:'+MONO+';font-size:19px;color:'+CTX+';letter-spacing:.1em}'
 +'h2{position:absolute;left:'+L+'px;top:150px;width:'+W+'px;margin:0;font-family:'+DISP+';font-weight:800;font-size:68px;line-height:1.06;letter-spacing:-.022em;color:'+INK+'}'
 +'.scene{position:absolute;left:0;top:0;width:1080px;height:1920px}'
 +'.foot{position:absolute;left:'+L+'px;top:1496px;width:'+W+'px;font-family:'+MONO+';font-size:18px;line-height:1.6;color:'+MUT+'}'
 +'.rule{position:absolute;left:'+L+'px;top:1613px;width:'+W+'px;height:1px;background:'+RULE+'}'
 +'.capzone{position:absolute;left:'+L+'px;top:1640px;width:'+W+'px;font-family:'+MONO+';font-size:16px;color:#c3b9a7;letter-spacing:.08em}'
 +'.cap{position:absolute;left:'+L+'px;top:1682px;width:'+W+'px;font-family:'+SANS+';font-weight:600;font-size:30px;line-height:1.35;color:'+INK+'}';
const head='<!doctype html><html><head><meta charset="utf-8"><title>Malaysia wages - section mocks</title>'
 +'<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">'
 +'<style>@page { size: 1080px 1920px; margin: 0; } *{box-sizing:border-box} '+css+'</style></head><body>';
fs.writeFileSync("mock2.html", head+body+"</body></html>");
console.log("ok", (head+body).length);
