/* Halaman Gift */
$("#gift").onclick=function(){var g=this;g.classList.add("shake");setTimeout(function(){g.textContent="🎉";$("#coupon").textContent=D.gift;$("#coupon").classList.add("on");$("#giftHint").textContent="dari "+D.him+", dengan sayang"},900)};
