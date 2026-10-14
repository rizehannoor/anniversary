/* Terbitkan: kirim perubahan dari menu edit ke repository GitHub supaya web online ikut berubah */
function ghToken(){try{return localStorage.getItem(GH.tokenKey)||""}catch(e){return""}}
function ghSetToken(t){try{if(t)localStorage.setItem(GH.tokenKey,t);else localStorage.removeItem(GH.tokenKey)}catch(e){}}
function ghApi(method,path,body){
  var url="https://api.github.com/repos/"+GH.owner+"/"+GH.repo+"/contents/"+path+(method==="GET"?"?ref="+GH.branch:"");
  return fetch(url,{method:method,headers:{"Authorization":"Bearer "+ghToken(),"Accept":"application/vnd.github+json","Content-Type":"application/json"},body:body?JSON.stringify(body):undefined})
    .then(function(r){
      if(r.status===404&&method==="GET")return null;
      if(!r.ok){var e=new Error("HTTP "+r.status);e.status=r.status;throw e}
      return r.json();
    });
}
function b64Text(s){var b=new TextEncoder().encode(s),bin="";b.forEach(function(x){bin+=String.fromCharCode(x)});return btoa(bin)}
function isData(s){return typeof s==="string"&&s.indexOf("data:image")===0}
function statusModal(){
  var m=el("div","modal"),f=el("div","card"),p=el("p","mlabel","Menyiapkan..."),r=el("div","row"),k=el("button",null,"Ganti token"),c=el("button","pri","Tutup");
  c.disabled=true;c.onclick=function(){m.remove()};
  k.onclick=function(){ghSetToken("");m.remove();toast("Token dihapus dari browser ini")};
  f.appendChild(el("h3","script","Menerbitkan"));f.appendChild(p);r.appendChild(k);r.appendChild(c);f.appendChild(r);m.appendChild(f);$("#adminUI").appendChild(m);
  return{set:function(t){p.textContent=t},end:function(t){p.textContent=t;c.disabled=false}};
}
function tokenForm(next){
  form("Token GitHub",[{k:"t",l:"Token (diawali github_pat_)",type:"password"}],{},function(v){
    if(!v.t){toast("Token masih kosong");return}
    ghSetToken(v.t);next();
  });
  var m=$("#adminUI").lastChild;
  m.querySelector("h3").after(el("p","mlabel","Token dibuat sekali di GitHub (lihat README), disimpan hanya di browser ini, dan hanya dipakai untuk mengirim isi web ke "+GH.owner+"/"+GH.repo+"."));
}
async function publish(){
  if(!ghToken()){tokenForm(publish);return}
  var st=statusModal();
  try{
    var data=JSON.parse(JSON.stringify(D)),jobs=[];
    data.photos.forEach(function(p){if(isData(p.src))jobs.push([p,"src",p.id])});
    if(isData(data.portrait))jobs.push([data,"portrait","portrait"]);
    for(var i=0;i<jobs.length;i++){
      st.set("Mengunggah foto "+(i+1)+" dari "+jobs.length+"...");
      var j=jobs[i],name="assets/photos/"+j[2]+"-"+Date.now().toString(36)+".jpg";
      await ghApi("PUT",name,{message:"Tambah foto",content:j[0][j[1]].split(",")[1],branch:GH.branch});
      j[0][j[1]]=name;
    }
    st.set("Menyimpan isi web...");
    var cur=await ghApi("GET","data/content.js");
    var txt="/* Isi website. Dibuat dari menu edit. */\nwindow.CONTENT = "+JSON.stringify(data,null,2)+";\n";
    await ghApi("PUT","data/content.js",{message:"Update isi web",content:b64Text(txt),sha:cur?cur.sha:undefined,branch:GH.branch});
    st.end("Selesai! Perubahan sudah dikirim ke GitHub. Web online ikut berubah dalam 1 sampai 10 menit. Sebelum mengedit atau git push dari komputer lagi, jalankan git pull dulu.");
  }catch(e){
    if(e.status===401){ghSetToken("");st.end("Token ditolak atau sudah kedaluwarsa. Token dihapus, coba Terbitkan lagi dan masukkan token baru.")}
    else if(e.status===403||e.status===404)st.end("Token tidak punya izin ke repository "+GH.owner+"/"+GH.repo+". Buat token dengan izin Contents: Read and write, lalu pakai Ganti token.");
    else st.end("Gagal menerbitkan ("+e.message+"). Cek koneksi internet lalu coba lagi.");
  }
}
