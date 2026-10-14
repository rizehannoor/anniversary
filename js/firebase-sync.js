/* Sinkronisasi Firebase. Memerlukan firebase-config.js dan SDK compat. */
var fbApp=null, fbAuth=null, fbDb=null, fbUser=null, fbReady=false, fbUnsub=null;
function firebaseConfigured(){
  var c=window.FIREBASE_CONFIG||{};
  return c.apiKey && c.projectId && c.appId && c.apiKey.indexOf("ISI_")!==0 && c.projectId.indexOf("ISI_")!==0;
}
function showAuth(){
  if($("#firebaseAuth")) return;
  var m=el("div","modal");m.id="firebaseAuth";
  var f=el("div","card"),h=el("h3","script","Ruang kita 💗"),p=el("p","mlabel","Login untuk mengedit website bersama.");
  var email=el("input"),pass=el("input"),msg=el("p","mlabel","");
  email.type="email";email.placeholder="Email";email.autocomplete="email";
  pass.type="password";pass.placeholder="Kata sandi";pass.autocomplete="current-password";
  var row=el("div","row"),login=el("button","pri","Masuk"),reg=el("button",null,"Daftar akun");
  [h,p,email,pass,msg].forEach(function(x){f.appendChild(x)});row.appendChild(login);row.appendChild(reg);f.appendChild(row);m.appendChild(f);document.body.appendChild(m);
  function run(create){
    msg.textContent="Memproses...";
    var task=create?fbAuth.createUserWithEmailAndPassword(email.value.trim(),pass.value):fbAuth.signInWithEmailAndPassword(email.value.trim(),pass.value);
    task.then(function(r){if(create)return r.user.sendEmailVerification()}).then(function(){msg.textContent=create?"Cek email untuk verifikasi, lalu masuk kembali.":"Berhasil masuk."}).catch(function(e){msg.textContent=authError(e)});
  }
  login.onclick=function(){run(false)};reg.onclick=function(){run(true)};
}
function authError(e){
  if(e.code==="auth/invalid-credential"||e.code==="auth/wrong-password")return "Email atau kata sandi salah.";
  if(e.code==="auth/email-already-in-use")return "Email sudah terdaftar. Silakan masuk.";
  if(e.code==="auth/weak-password")return "Kata sandi minimal 6 karakter.";
  if(e.code==="auth/invalid-email")return "Format email belum benar.";
  return "Gagal: "+(e.message||e.code);
}
function bootCloud(){
  if(!firebaseConfigured()){
    if(!isLocal()) { document.body.classList.remove("adm"); toast("Firebase belum dikonfigurasi. Ikuti README."); }
    else initAdmin();
    return;
  }
  try{fbApp=firebase.initializeApp(window.FIREBASE_CONFIG);fbAuth=firebase.auth();fbDb=firebase.firestore();}
  catch(e){toast("Firebase gagal dimulai: "+e.message);return}
  showAuth();
  fbAuth.onAuthStateChanged(async function(user){
    fbUser=user;fbReady=true;
    var modal=$("#firebaseAuth");
    if(user && user.emailVerified && (window.EDITORS||[]).map(function(x){return x.toLowerCase()}).indexOf((user.email||"").toLowerCase())>=0){
      if(modal)modal.remove();
      try{
        var snap=await fbDb.doc("anniversary/shared").get();
        if(snap.exists && snap.data().content){D=snap.data().content;saveData(D);render()}
        if(fbUnsub)fbUnsub();
        fbUnsub=fbDb.doc("anniversary/shared").onSnapshot(function(s){
          if(!s.exists||!s.data().content)return;
          if(dirty)return;
          D=s.data().content;saveData(D);render();
        });
        initAdmin();
      }catch(e){toast("Tidak bisa membaca data cloud: "+e.message)}
    }else{
      if(user)await fbAuth.signOut();
      showAuth();
      var p=$("#firebaseAuth .mlabel:last-of-type");
      if(p)p.textContent=user?"Email belum diverifikasi atau akun tidak diizinkan.":"Login dengan salah satu dari dua email yang diizinkan.";
    }
  });
}
async function saveCloud(d){
  if(!fbDb||!fbUser||!fbUser.emailVerified)throw new Error("Login terverifikasi diperlukan.");
  var allowed=(window.EDITORS||[]).map(function(x){return x.toLowerCase()});
  if(allowed.indexOf((fbUser.email||"").toLowerCase())<0)throw new Error("Akun ini tidak diizinkan mengedit.");
  await fbDb.doc("anniversary/shared").set({content:d,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:fbUser.email});
}
