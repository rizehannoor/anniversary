/* Halaman Wishlist: ketuk bintang, pilih wishlist jalan minggu ini, tentukan tanggalnya */
var giftOpen=false,picked=-1,pickDate="";
$("#gift").onclick=function(){
  var g=this;if(giftOpen)return;g.classList.add("shake");
  setTimeout(function(){giftOpen=true;g.classList.add("done");g.textContent="\u2728";$("#coupon").textContent=D.gift;$("#coupon").classList.add("on");$("#giftHint").textContent="Pilih wishlist jalan kita minggu ini";renderGift()},900);
};
function pad(n){return("0"+n).slice(-2)}
function isoDate(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function niceDate(s){return new Date(s+"T00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function saveCalendar(o,date){
  var n=new Date(date+"T00:00");n.setDate(n.getDate()+1);
  var t=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//our-anniversary//ID","BEGIN:VEVENT","UID:"+uid()+"@our-anniversary",
    "DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z","DTSTART;VALUE=DATE:"+date.replace(/-/g,""),
    "DTEND;VALUE=DATE:"+isoDate(n).replace(/-/g,""),"SUMMARY:"+o.t+" "+o.e,"DESCRIPTION:Wishlist jalan kita","END:VEVENT","END:VCALENDAR"].join("\r\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/calendar"}));a.download="wishlist-"+date+".ics";
  document.body.appendChild(a);a.click();a.remove();
}
function renderGift(){
  if(!giftOpen)return;
  var w=$("#dates");w.innerHTML="";w.classList.add("on");
  (D.dates||[]).forEach(function(o,i){
    var b=el("button","dt"+(i===picked?" sel":""));
    b.appendChild(el("i",null,o.e));b.appendChild(el("b",null,o.t));if(o.d)b.appendChild(el("small",null,o.d));
    b.onclick=function(){picked=i;renderGift()};w.appendChild(b);
  });
  var r=$("#pickRes");r.innerHTML="";var o=(D.dates||[])[picked];
  if(!o){r.classList.remove("on");return}
  r.classList.add("on");
  r.appendChild(el("p","pt","Wishlist minggu ini: "+o.t+" "+o.e));
  var lab=el("label",null,"Kapan kita berangkat?"),di=el("input");di.type="date";di.min=isoDate(new Date());di.value=pickDate;
  di.onchange=function(){pickDate=di.value;renderGift()};lab.appendChild(di);r.appendChild(lab);
  if(pickDate)r.appendChild(el("p","ps","Rencananya: "+niceDate(pickDate)+" \uD83D\uDC95"));
  else r.appendChild(el("p","ps","Pilih tanggalnya, nanti kita sama-sama ingat."));
  if(pickDate){var k=el("button","dt-share alt","Simpan ke kalender");k.onclick=function(){saveCalendar(o,pickDate)};r.appendChild(k)}
  var s=el("button","dt-share","Kabari "+D.him);
  s.onclick=function(){
    var t="Wishlist jalan kita: "+o.t+" "+o.e+(pickDate?", "+niceDate(pickDate)+". Sampai ketemu ya":". Kapan kita berangkat?")+" \uD83D\uDC95";
    if(navigator.share)navigator.share({text:t}).catch(function(){});
    else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Pilihanmu disalin, kirim ke "+D.him)},function(){toast(t)});
    else toast(t);
  };
  r.appendChild(s);$("#giftHint").textContent="dengan sayang, "+D.him;
}
