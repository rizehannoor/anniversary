/* Titik awal: navigasi layar, render, hati melayang */
function render(){
 renderMoment();renderJourney();renderPlaylist();renderGift();
 if($("#save"))$("#save").disabled=!dirty;if(mgr)mgr.refresh();if($(".burger"))$(".burger").classList.toggle("dirty",dirty);
}

document.addEventListener("click",function(e){var b=e.target.closest("[data-go]");if(b){plOn=b.dataset.go==="s-playlist";if(!plOn){$("#pl").innerHTML="";shown=""}go(b.dataset.go);if(plOn)render()}});
render();
bootCloud();

setInterval(function(){
  if(document.hidden)return;
  var h=el("div","heart",["💗","💖","🌸"][Math.floor(Math.random()*3)]);
  h.style.left=Math.random()*100+"vw";h.style.fontSize=(14+Math.random()*18)+"px";h.style.animationDuration=(6+Math.random()*5)+"s";
  document.body.appendChild(h);setTimeout(function(){h.remove()},11000);
},1100);
