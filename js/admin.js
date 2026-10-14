/* Mode edit: tambah, ubah, hapus foto dan lagu, ubah teks */
var admin=false,dirty=false;
function compress(f){return new Promise(function(ok,no){var i=new Image(),u=URL.createObjectURL(f);i.onload=function(){var k=Math.min(1,800/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",.72))};i.onerror=no;i.src=u})}
function pick(multi,cb){var i=document.createElement("input");i.type="file";i.accept="image/*";i.multiple=multi;i.onchange=function(){Promise.all([].map.call(i.files,compress)).then(cb).catch(function(){toast("Foto gagal dibaca")})};i.click()}
function form(title,fs,o,ok){var m=el("div","modal"),f=el("div","card");f.appendChild(el("h3","script",title));var ins={};
 fs.forEach(function(x){var l=el("label",null,x.l),i=el(x.big?"textarea":"input");if(x.big)i.rows=5;else i.type=x.type||"text";i.value=o[x.k]||"";l.appendChild(i);f.appendChild(l);ins[x.k]=i});
 var b=el("div","row"),c=el("button",null,"Batal"),s=el("button","pri","OK");c.onclick=function(){m.remove()};
 s.onclick=function(){var v={};for(var k in ins)v[k]=ins[k].value.trim();m.remove();ok(v)};
 b.appendChild(c);b.appendChild(s);f.appendChild(b);m.appendChild(f);$("#adminUI").appendChild(m)}
function chg(){dirty=true;render()}

function bar(){var u=$("#adminUI"),b=el("div","menu2"),h=el("button","burger","☰"),p=el("div","panel"),t=el("button"),s=el("button","pri");t.innerHTML='<svg class="ic" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg> Teks';s.innerHTML='<svg class="ic" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Simpan';
 h.setAttribute("aria-label","Menu edit");h.onclick=function(){p.classList.toggle("on")};
 s.id="save";s.disabled=true;
 t.onclick=function(){p.classList.remove("on");form("Pengaturan",[{k:"her",l:"Nama pacar"},{k:"him",l:"Namamu"},{k:"since",l:"Tanggal jadian",type:"datetime-local"},{k:"letter",l:"Isi surat",big:1},{k:"gift",l:"Isi kupon hadiah",big:1}],D,function(v){Object.assign(D,v);chg()})};
 s.onclick=function(){p.classList.remove("on");save()};
 var fb=el("button"),lb=el("button");
 fb.innerHTML='<svg class="ic" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg> Foto';
 lb.innerHTML='<svg class="ic" viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg> Lagu';
 fb.onclick=function(){p.classList.remove("on");photoManager()};
 var gb=el("button");gb.innerHTML='<svg class="ic" viewBox="0 0 24 24"><path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/></svg> Wishlist';
 gb.onclick=function(){p.classList.remove("on");dateManager()};
 var ub=el("button");ub.innerHTML='<svg class="ic" viewBox="0 0 24 24"><path d="M12 16V5M7 9l5-5 5 5M5 19h14"/></svg> Terbitkan';
 ub.onclick=function(){p.classList.remove("on");publish()};lb.onclick=function(){p.classList.remove("on");songManager()};
 p.appendChild(el("b",null,"Mode edit"));p.appendChild(t);p.appendChild(fb);p.appendChild(lb);p.appendChild(gb);p.appendChild(s);p.appendChild(ub);b.appendChild(h);b.appendChild(p);u.appendChild(b)}
/* ---- Pengelola foto dan lagu (jendela dari menu ☰) ---- */
var mgr=null;
function manager(title,build){
  var m=el("div","modal"),f=el("div","card"),body=el("div","mbody"),r=el("div","row"),c=el("button","pri","Selesai");
  f.appendChild(el("h3","script",title));f.appendChild(body);
  c.onclick=function(){m.remove();mgr=null};r.appendChild(c);f.appendChild(r);m.appendChild(f);$("#adminUI").appendChild(m);
  mgr={refresh:function(){body.innerHTML="";build(body)}};mgr.refresh();
}
function sure(btn,fn){ /* hapus butuh dua ketukan supaya tidak terhapus tidak sengaja */
  if(btn.dataset.s){fn();return}
  btn.dataset.s=1;var t=btn.textContent;btn.textContent="Yakin?";
  setTimeout(function(){delete btn.dataset.s;btn.textContent=t},2200);
}
function tile(src,set,del){
  var t=el("div","mt"),tb=el("div","tb"),e=el("button",null,src?"Ganti":"Pilih"),x;
  if(src)t.style.backgroundImage="url('"+src+"')";
  e.onclick=function(){pick(false,function(r){set(r[0]);chg()})};tb.appendChild(e);
  if(src){x=el("button",null,"Hapus");x.onclick=function(){sure(x,function(){del();chg()})};tb.appendChild(x)}
  t.appendChild(tb);return t;
}
function photoManager(){manager("Kelola foto",function(b){
  b.appendChild(el("p","mlabel","Foto di samping surat (halaman Moment)"));
  var g0=el("div","mgrid");g0.appendChild(tile(D.portrait,function(v){D.portrait=v},function(){D.portrait=""}));b.appendChild(g0);
  b.appendChild(el("p","mlabel","Polaroid (halaman Journey): "+D.photos.length+" dari 12"));
  var g=el("div","mgrid");
  D.photos.forEach(function(p,i){g.appendChild(tile(p.src,function(v){p.src=v},function(){D.photos.splice(i,1)}))});
  if(D.photos.length<12){var a=el("button","mt add","＋");a.setAttribute("aria-label","Tambah foto");
    a.onclick=function(){pick(true,function(r){r.forEach(function(x){if(D.photos.length<12)D.photos.push({id:uid(),src:x})});chg()})};g.appendChild(a)}
  b.appendChild(g);
})}
function songManager(){manager("Kelola lagu",function(b){
  var l=el("div","mlist");
  D.songs.forEach(function(s,i){
    var r=el("div","mrow"),t=el("span",null,s.t),e=el("button",null,"✎"),x=el("button",null,"✕");
    t.appendChild(document.createElement("br"));t.appendChild(el("small",null,s.a));
    e.setAttribute("aria-label","Edit lagu");x.setAttribute("aria-label","Hapus lagu");
    e.onclick=function(){songForm(s)};x.onclick=function(){sure(x,function(){D.songs.splice(i,1);chg()})};
    r.appendChild(t);r.appendChild(e);r.appendChild(x);l.appendChild(r);
  });
  if(!D.songs.length)l.appendChild(el("p","mlabel","Belum ada lagu."));
  b.appendChild(l);
  var a=el("button","pri","＋ Tambah lagu");a.onclick=function(){songForm()};b.appendChild(a);
})}
function dateForm(o){var n=!o;o=o||{id:uid(),e:"",t:"",d:""};
  form(n?"Tambah wishlist":"Edit wishlist",[{k:"e",l:"Emoji (satu saja)"},{k:"t",l:"Judul"},{k:"d",l:"Keterangan singkat (opsional)"}],o,function(v){
    if(!v.t){toast("Judul wajib diisi");return}
    Object.assign(o,v);if(!o.e)o.e="\uD83D\uDC95";if(n)D.dates.push(o);chg()})}
function dateManager(){manager("Wishlist minggu ini",function(b){
  if(!D.dates)D.dates=[];
  var l=el("div","mlist");
  D.dates.forEach(function(o,i){
    var r=el("div","mrow"),t=el("span",null,o.e+" "+o.t),e=el("button",null,"\u270E"),x=el("button",null,"\u2715");
    if(o.d){t.appendChild(document.createElement("br"));t.appendChild(el("small",null,o.d))}
    e.setAttribute("aria-label","Edit pilihan");x.setAttribute("aria-label","Hapus pilihan");
    e.onclick=function(){dateForm(o)};x.onclick=function(){sure(x,function(){D.dates.splice(i,1);chg()})};
    r.appendChild(t);r.appendChild(e);r.appendChild(x);l.appendChild(r);
  });
  if(!D.dates.length)l.appendChild(el("p","mlabel","Belum ada wishlist."));
  b.appendChild(l);
  if(D.dates.length<6){var a=el("button","pri","\uFF0B Tambah wishlist");a.onclick=function(){dateForm()};b.appendChild(a)}
  b.appendChild(el("p","mlabel","Kalimat pembuka di atas daftar diubah lewat menu Teks (Isi kupon hadiah)."));
})}
async function save(){
  $("#save").disabled=true;
  if(!saveData(D)){$("#save").disabled=false;toast("Terlalu besar, hapus beberapa foto");return}
  try{
    if(firebaseConfigured() && !isLocal()) await saveCloud(D);
    dirty=false;render();toast(firebaseConfigured()&&!isLocal()?"Tersimpan dan tersinkron untuk kalian berdua":"Tersimpan di perangkat ini");
  }catch(e){$("#save").disabled=false;toast("Gagal menyimpan ke cloud: "+e.message)}
}
/* Menu edit muncul otomatis saat dibuka di komputermu sendiri (file, localhost, atau jaringan Wi-Fi rumah),
   atau kapan saja dengan ?edit. Setelah online, pengunjung tidak melihatnya. Tambahkan ?view untuk menyembunyikan. */
function isLocal(){
  var h=location.hostname;
  return location.protocol==="file:"||h==="localhost"||h==="127.0.0.1"||h.slice(-6)===".local"||/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
}
function initAdmin(){
  var q=new URLSearchParams(location.search);
  if(q.has(ADMIN_PARAM)||(isLocal()&&!q.has(VIEW_PARAM))){admin=true;document.body.classList.add("adm");bar();render()}
}
