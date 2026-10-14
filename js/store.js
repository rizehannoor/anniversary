/* Memuat dan menyimpan data. Dasarnya data/content.js, perubahan dari mode edit disimpan di browser. */
function loadData(){
  var base=JSON.parse(JSON.stringify(window.CONTENT||{}));
  try{
    var q=new URLSearchParams(location.search);
    if(q.has(RESET_PARAM))localStorage.removeItem(STORAGE_KEY);
    var saved=localStorage.getItem(STORAGE_KEY);
    if(saved)return JSON.parse(saved);
  }catch(e){}
  return base;
}
function saveData(d){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));return true}catch(e){return false}
}
var D=loadData();
