/* Halaman Moment */
function renderMoment(){
 $("#herName").textContent=D.her;$("#sinceTxt").textContent="Sejak "+new Date(D.since).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})+", dan masih terus bertambah";var L=$("#letter");L.innerHTML="";L.appendChild(el("div","to","Dear "+D.her+","));L.appendChild(el("div","body",D.letter));L.appendChild(el("div","from","with love, "+D.him));var sd=new Date(D.since);L.appendChild(el("div","stamp",sd.getDate()+"\n"+["JAN","FEB","MAR","APR","MEI","JUN","JUL","AGU","SEP","OKT","NOV","DES"][sd.getMonth()]));L.appendChild(el("div","wax","♥"));
 var f=$("#frame");f.style.backgroundImage=D.portrait?"url('"+D.portrait+"')":"";f.textContent=D.portrait?"":"🌹";
 f.onclick=admin?function(){pick(false,function(r){D.portrait=r[0];chg()})}:null;
}
function tick(){var s=Math.max(0,Math.floor((Date.now()-new Date(D.since))/1000)),v=[[Math.floor(s/86400),"hari"],[Math.floor(s%86400/3600),"jam"],[Math.floor(s%3600/60),"menit"],[s%60,"detik"]];
 $("#timer").innerHTML=v.map(function(x){return"<div><b>"+x[0]+"</b><small>"+x[1]+"</small></div>"}).join("")}
tick();setInterval(tick,1000);
