/* Fungsi bantu */
var $=function(s){return document.querySelector(s)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function uid(){return Math.random().toString(36).slice(2,9)}
function toast(t){var b=$("#toast");b.textContent=t;b.style.opacity=1;setTimeout(function(){b.style.opacity=0},2600)}
function go(id){document.querySelectorAll(".screen").forEach(function(s){s.classList.toggle("on",s.id===id)})}
