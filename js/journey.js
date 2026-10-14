/* Halaman Journey */
var rot=[-4,3,-2,5,3,-5,2,-3];
function renderJourney(){
 var w=$("#wall");w.innerHTML="";
 D.photos.forEach(function(p,i){var d=el("div","pol"),im=el("div");d.style.setProperty("--r",rot[i%8]+"deg");im.style.backgroundImage="url('"+p.src+"')";d.appendChild(im);
  if(admin){d.onclick=function(){pick(false,function(r){p.src=r[0];chg()})};var x=el("button","x","✕");x.setAttribute("aria-label","Hapus foto");x.onclick=function(e){e.stopPropagation();D.photos.splice(i,1);chg()};d.appendChild(x)}
  w.appendChild(d)});
 if(!D.photos.length){var e=el("p","hint",admin?"Belum ada foto. Tekan Tambah foto.":"Foto-foto kita segera hadir 💕");e.style.gridColumn="1/-1";w.appendChild(e)}
}
$("#addPhoto").onclick=function(){pick(true,function(r){r.forEach(function(x){if(D.photos.length<12)D.photos.push({id:uid(),src:x})});if(D.photos.length>=12)toast("Maksimal 12 foto");chg()})};
