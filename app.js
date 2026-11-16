const $ = id => document.getElementById(id);
let latest = null;
const numericIds = ["height","angle","radius","middle","leadIn","leadOut","diameter"];
const fmt = n => Number(n).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1});

function readInput(){
  return {
    height:+$("height").value, angle:+$("angle").value, radius:+$("radius").value,
    middle:+$("middle").value, leadIn:+$("leadIn").value, leadOut:+$("leadOut").value,
    material:$("material").value, diameter:+$("diameter").value,
    bender:$("bender").value, jobName:$("jobName").value.trim()
  };
}
function calculate(){
  const x=readInput();
  const vals=[x.height,x.angle,x.radius,x.middle,x.leadIn,x.leadOut,x.diameter];
  const err=$("error"), results=$("results"), empty=$("emptyState");
  err.hidden=true; results.hidden=true; empty.hidden=true;
  if(vals.some(v=>!Number.isFinite(v)||v<0)||x.height<=0||x.radius<=0||x.angle<=0||x.angle>=90){
    err.textContent="Vérifie les valeurs : hauteur et rayon positifs, angle entre 0° et 90°, autres dimensions positives ou nulles.";
    err.hidden=false; latest=null; return;
  }
  const t=x.angle*Math.PI/180;
  const riseFromArcs=2*x.radius*(1-Math.cos(t));
  const remaining=x.height-riseFromArcs;
  if(remaining<=0){
    err.textContent="La hauteur est trop faible pour le rayon et l'angle choisis. Réduis le rayon ou l'angle.";
    err.hidden=false; latest=null; return;
  }
  const inclined=remaining/Math.sin(t);
  const arc=x.radius*t;
  const developed=x.leadIn+x.leadOut+x.middle+2*inclined+2*arc;
  const horizontal=2*x.radius*Math.sin(t)+2*inclined*Math.cos(t)+x.middle;
  latest={...x,inclined,arc,developed,horizontal,createdAt:new Date().toISOString()};
  $("inclined").textContent=fmt(inclined)+" mm";
  $("arc").textContent=fmt(arc)+" mm";
  $("horizontal").textContent=fmt(horizontal)+" mm";
  $("developed").textContent=fmt(developed);
  drawDiagram(x,t,inclined);
  results.hidden=false;
}
function drawDiagram(x,t,L){
  // Schematic only: not a fabrication template or to scale.
  const p=(x0,y0)=>`${x0.toFixed(1)},${y0.toFixed(1)}`;
  const s=2*x.radius*Math.sin(t)+2*L*Math.cos(t)+x.middle;
  const scale=Math.min(500/Math.max(s,1),150/Math.max(x.height,1));
  const baseY=188, x0=36, r=x.radius*scale, rise=x.height*scale;
  const dx=L*Math.cos(t)*scale, dy=L*Math.sin(t)*scale;
  const arcDx=x.radius*Math.sin(t)*scale, arcDy=x.radius*(1-Math.cos(t))*scale;
  const start=[x0,baseY], firstT=[x0+arcDx,baseY-arcDy];
  const midEnd=[firstT[0]+dx,firstT[1]-dy];
  const secondT=[midEnd[0]+arcDx,midEnd[1]+arcDy];
  const end=[secondT[0]+x.radius*Math.sin(t)*scale,secondT[1]+x.radius*(1-Math.cos(t))*scale];
  const d=`M ${p(...start)} L ${p(...firstT)} L ${p(...midEnd)} L ${p(...secondT)} L ${p(...end)}`;
  $("pipePath").setAttribute("d",d);
}
function projects(){try{return JSON.parse(localStorage.getItem("tracetube-projects")||"[]")}catch{return []}}
function save(){
  if(!latest){calculate();if(!latest)return}
  const list=projects();
  list.unshift(latest);
  localStorage.setItem("tracetube-projects",JSON.stringify(list.slice(0,100)));
  renderHistory();
  const b=$("saveProject"); b.textContent="Projet enregistré ✓"; setTimeout(()=>b.textContent="Enregistrer le projet",1500);
}
function renderHistory(){
  const list=projects(), host=$("historyList");
  host.innerHTML="";
  if(!list.length){host.innerHTML='<div class="panel empty">Aucun projet enregistré pour le moment.</div>';return}
  list.forEach((p,i)=>{
    const el=document.createElement("article");el.className="history-item";
    const date=new Date(p.createdAt).toLocaleString("fr-FR");
    const title=p.jobName||"Chapeau de gendarme";
    el.innerHTML=`<h3></h3><p></p><p></p><button type="button">Recharger ce projet</button>`;
    el.querySelector("h3").textContent=title;
    el.querySelectorAll("p")[0].textContent=`${date} · ${p.material} · Ø ${fmt(p.diameter)} mm`;
    el.querySelectorAll("p")[1].textContent=`Hauteur ${fmt(p.height)} mm · angle ${fmt(p.angle)}° · développé ${fmt(p.developed)} mm`;
    el.querySelector("button").addEventListener("click",()=>loadProject(p));
    host.appendChild(el);
  });
}
function loadProject(p){
  const map={height:"height",angle:"angle",radius:"radius",middle:"middle",leadIn:"leadIn",leadOut:"leadOut",material:"material",diameter:"diameter",bender:"bender",jobName:"jobName"};
  Object.entries(map).forEach(([k,id])=>$(id).value=p[k]??"");
  document.querySelector('[data-tab="calc"]').click(); calculate();
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab));
  if(b.dataset.tab==="history")renderHistory();
}));
$("calculate").addEventListener("click",calculate);
$("saveProject").addEventListener("click",save);
$("printSheet").addEventListener("click",()=>{if(!latest)calculate();if(latest)window.print()});
$("clearHistory").addEventListener("click",()=>{
  if(confirm("Effacer tous les projets enregistrés sur cet appareil ?")){localStorage.removeItem("tracetube-projects");renderHistory()}
});
numericIds.forEach(id=>$(id).addEventListener("change",()=>{if(latest)calculate()}));
window.addEventListener("online",()=>{$("networkState").textContent="Connecté"});
window.addEventListener("offline",()=>{$("networkState").textContent="Hors ligne"});
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
calculate();renderHistory();
