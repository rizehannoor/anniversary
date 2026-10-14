/* Halaman Playlist */
var cur=0,plOn=false,shown="";
function yid(u){var m=(u||"").match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);return m?m[1]:""}
/* YouTube menolak diputar di dalam halaman yang dibuka lewat file:// (Error 153), jadi tampilkan kartu cadangan */
function fileNote(b,id){
  var a=el("a","vid yt-thumb");a.href="https://www.youtube.com/watch?v="+id;a.target="_blank";a.rel="noopener";
  a.style.backgroundImage="url('https://i.ytimg.com/vi/"+id+"/hqdefault.jpg')";a.appendChild(el("span",null,"\u25B6 Putar di YouTube"));
  b.appendChild(a);
  b.appendChild(el("p","hint","Video hanya bisa diputar di sini kalau web dijalankan lewat localhost atau sudah online, bukan klik dua kali file."));
}
function player(auto){
 var b=$("#pl");b.innerHTML="";if(!plOn)return;var s=D.songs[cur];
 if(!s){shown="";b.appendChild(el("p","hint","Belum ada lagu. Tambah lewat menu ☰ di kiri atas."));return}
 shown=cur+":"+s.u;var id=yid(s.u);
 if(id&&location.protocol==="file:"){fileNote(b,id)}
 else if(id){var f=document.createElement("iframe");f.className="vid";f.src="https://www.youtube.com/embed/"+id+"?rel=0&playsinline=1&enablejsapi=1&origin="+encodeURIComponent(location.origin)+(auto?"&autoplay=1":"");f.title=s.t;f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";b.appendChild(f)}
 else b.appendChild(el("div","vid novid","Lagu ini belum punya link YouTube"));
 var nb=el("div","nowbox"),t=el("div"),c=el("div","ctl"),pv=el("button",null,"\u2039"),nx=el("button",null,"\u203A"),n=D.songs.length;
 pv.setAttribute("aria-label","Lagu sebelumnya");nx.setAttribute("aria-label","Lagu berikutnya");
 pv.onclick=function(){cur=(cur-1+n)%n;player(true);render()};nx.onclick=function(){cur=(cur+1)%n;player(true);render()};
 t.appendChild(el("b",null,s.t));t.appendChild(el("small",null,s.a));c.appendChild(pv);c.appendChild(nx);nb.appendChild(t);nb.appendChild(c);b.appendChild(nb);
 var a=el("a","yt","Buka di YouTube \u2197");a.href=id?"https://www.youtube.com/watch?v="+id:"https://www.youtube.com/results?search_query="+encodeURIComponent(s.t+" "+s.a);a.target="_blank";a.rel="noopener";b.appendChild(a)}
function renderPlaylist(){
 var ul=$("#songs");ul.innerHTML="";if(cur>=D.songs.length)cur=0;
 D.songs.forEach(function(s,i){var li=el("li","song"),id=yid(s.u),t=el("span",null,s.t),r;
  t.appendChild(document.createElement("br"));t.appendChild(el("small",null,s.a));
  if(id){r=el("button","sg");r.onclick=function(){cur=i;player(true);render()}}
  else{r=el("a","sg");r.href="https://www.youtube.com/results?search_query="+encodeURIComponent(s.t+" "+s.a);r.target="_blank";r.rel="noopener"}
  r.appendChild(el("em",null,i===cur&&id?"♪":"▶"));r.appendChild(t);if(i===cur)r.classList.add("now");li.appendChild(r);
  ul.appendChild(li)});
 if(plOn){var k=D.songs[cur]?cur+":"+D.songs[cur].u:"";if(k!==shown||!$("#pl").firstChild)player(false)}
}
function songForm(s){var n=!s;s=s||{id:uid(),t:"",a:"",u:""};
 form(n?"Tambah lagu":"Edit lagu",[{k:"t",l:"Judul"},{k:"a",l:"Artis"},{k:"u",l:"Link YouTube (opsional)",type:"url"}],s,function(v){if(!v.t){toast("Judul wajib diisi");return}if(v.u&&!yid(v.u)){toast("Link YouTube tidak valid");return}Object.assign(s,v);if(n){D.songs.push(s);cur=D.songs.length-1}chg()})}
