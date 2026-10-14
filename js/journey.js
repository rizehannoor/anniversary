/* Halaman Journey: hanya bingkai foto. Tambah, ganti, hapus ada di menu ☰ > Foto (js/admin.js) */
var rot=[-4,3,-2,5,3,-5,2,-3];
function renderJourney(){
 var w=$("#wall");w.innerHTML="";
 D.photos.forEach(function(p,i){var d=el("div","pol"),im=el("div");d.style.setProperty("--r",rot[i%8]+"deg");im.style.backgroundImage="url('"+p.src+"')";d.appendChild(im);w.appendChild(d)});
 if(!D.photos.length){var e=el("p","hint",admin?"Belum ada foto. Tambah lewat menu ☰ di kiri atas.":"Foto-foto kita segera hadir 💕");e.style.gridColumn="1/-1";w.appendChild(e)}
}
