const $=id=>document.getElementById(id);
const f=n=>Number(n).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1});
const mm=n=>f(n)+" mm";
function calc(){
 const H=+$("height").value,A=+$("angle").value,R=+$("radius").value,M=+$("middle").value,L=+$("lead").value,T=+$("tail").value,D=+$("diameter").value;
 const warnings=[];
 if(!(H>0&&A>0&&A<90&&R>0&&M>=0&&L>=0&&T>=0&&D>0)){
  $("results").innerHTML="";$("drawing").innerHTML="<p style='padding:20px'>Vérifie les valeurs saisies.</p>";$("warning").textContent="Les dimensions doivent être positives et l'angle compris entre 0° et 90°.";return;
 }
 const a=A*Math.PI/180;
 // Formula reproduced from the V1 result screen for the displayed test:
 // inclined tangent straight required to achieve the entered axis-to-axis height.
 const straight=(H-2*R*(1-Math.cos(a)))/Math.sin(a);
 const arc=R*a;
 const projection=2*straight*Math.cos(a)+2*R*Math.sin(a)+M;
 const developed=L+T+2*straight+2*arc+M;
 if(straight<0)warnings.push("Le rayon et l'angle seuls dépassent la hauteur demandée : paramètres géométriquement incompatibles.");
 if(straight>=0){
  $("results").innerHTML=[
   ["Longueur droite inclinée",mm(straight),"par côté"],
   ["Longueur d’arc",mm(arc),"par cintrage"],
   ["Projection horizontale calculée",mm(projection),"valeur du modèle V1"],
   ["Longueur développée théorique",mm(developed),"longueur totale"]
  ].map(x=>`<div class="metric"><span>${x[0]} · ${x[2]}</span><strong>${x[1]}</strong></div>`).join("");
 }else $("results").innerHTML="<div class='metric'><span>Longueur droite inclinée</span><strong>Impossible</strong></div>";
 const msg=`Entrées : hauteur ${mm(H)}, angle ${f(A)}°, rayon ${mm(R)}, droite intermédiaire ${mm(M)}. `;
 warnings.push(msg+"La définition géométrique exacte de la droite intermédiaire doit être confirmée : l'écran V1 et ses résultats ne suffisent pas à établir sans ambiguïté si cette cote est mesurée sur l'axe du tube ou en projection.");
 $("warning").textContent=warnings.join(" ");
 draw({H,A,R,M,L,T,D,straight,arc,projection,developed});
}
function draw(v){
 const {H,A,R,M,L,T,D,straight,arc,projection,developed}=v;
 const valid=straight>=0;
 // Fixed isometric-style schematic; dimensions are dynamically rebound to calculation values.
 const yTop=valid?Math.max(70,Math.min(135,170-H*0.55)):115;
 const midX=400, left=75, right=725, base=205;
 const peak=base-(base-yTop);
 const p=`M ${left} ${base} L 205 ${base} Q 235 ${base} 255 ${base-25} L 365 ${yTop+15} Q 400 ${yTop-15} 435 ${yTop+15} L 545 ${base-25} Q 565 ${base} 595 ${base} L ${right} ${base}`;
 $("drawing").innerHTML=`<svg viewBox="0 0 800 330" role="img" aria-label="Schéma coté du tube cintré">
 <defs><linearGradient id="cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0b2"/><stop offset=".28" stop-color="#c9783d"/><stop offset=".55" stop-color="#f4b477"/><stop offset="1" stop-color="#87451f"/></linearGradient><filter id="sh"><feGaussianBlur stdDeviation="4"/></filter></defs>
 <path d="${p}" fill="none" stroke="#000" stroke-width="31" opacity=".35" filter="url(#sh)" transform="translate(0 7)"/>
 <path d="${p}" fill="none" stroke="url(#cu)" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="${p}" fill="none" stroke="#fff0d8" stroke-width="2" opacity=".65" stroke-linecap="round"/>
 <path d="M 255 245 V 275 M 545 245 V 275" stroke="#9db4ca" stroke-dasharray="5 5"/>
 <path d="M 255 270 H 545 M 255 262 V 278 M 545 262 V 278" stroke="#f5d46e" stroke-width="2"/>
 <text x="400" y="293" text-anchor="middle" fill="#ffe17c" font-size="16" font-weight="bold">${mm(M)} · droite intermédiaire saisie</text>
 <path d="M 385 ${yTop} H 415 M 400 ${yTop} V ${base}" stroke="#f5d46e" stroke-width="2"/>
 <path d="M 392 ${yTop} L 400 ${yTop-7} L 408 ${yTop} M 392 ${base} L 400 ${base+7} L 408 ${base}" fill="none" stroke="#f5d46e" stroke-width="2"/>
 <text x="418" y="${(yTop+base)/2}" fill="#ffe17c" font-size="15" font-weight="bold">H ${mm(H)}</text>
 <text x="270" y="${yTop+45}" fill="#fff" font-size="14">R ${mm(R)} · ${f(A)}°</text>
 <text x="530" y="${yTop+45}" text-anchor="end" fill="#fff" font-size="14">R ${mm(R)} · ${f(A)}°</text>
 <path d="M ${left} 315 H ${right} M ${left} 307 V 323 M ${right} 307 V 323" stroke="#b7cbe0" stroke-width="1.5"/>
 <text x="400" y="311" text-anchor="middle" fill="#d9e8f7" font-size="13">Développé théorique : ${mm(developed)} · Ø ${mm(D)}</text>
 <text x="75" y="235" fill="#b9cee3" font-size="12">Avant ${mm(L)}</text><text x="725" y="235" text-anchor="end" fill="#b9cee3" font-size="12">Après ${mm(T)}</text>
 <text x="400" y="25" text-anchor="middle" fill="#8eddf5" font-size="15" font-weight="bold">Vue 3D schématique · ${$("material").value} · ${$("bender").value}</text>
 <text x="400" y="45" text-anchor="middle" fill="#9fb4c9" font-size="11">Droite inclinée calculée par côté : ${mm(straight)} · arc par cintrage : ${mm(arc)}</text>
 </svg>`;
}
["height","angle","radius","middle","lead","tail","diameter","material","bender","job"].forEach(id=>$(id).addEventListener("input",calc));
$("print").addEventListener("click",()=>window.print());
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
calc();