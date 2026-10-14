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
 p.appendChild(el("b",null,"Mode edit"));p.appendChild(t);p.appendChild(s);b.appendChild(h);b.appendChild(p);u.appendChild(b)}
function save(){
  $("#save").disabled=true;
  if(!saveData(D)){$("#save").disabled=false;toast("Terlalu besar, hapus beberapa foto");return}
  dirty=false;render();toast("Tersimpan di perangkat ini");
}
function initAdmin(){
  if(new URLSearchParams(location.search).has(ADMIN_PARAM)){admin=true;document.body.classList.add("adm");bar();render()}
}
