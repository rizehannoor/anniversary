
/* Sinkronisasi Firebase.
   Memerlukan firebase-config.js dan Firebase SDK compat. */

var fbApp = null;
var fbAuth = null;
var fbDb = null;
var fbUser = null;
var fbReady = false;
var fbUnsub = null;

/* Memeriksa konfigurasi Firebase */
function firebaseConfigured() {
  var c = window.FIREBASE_CONFIG || {};

  return !!(
    c.apiKey &&
    c.projectId &&
    c.appId &&
    !c.apiKey.startsWith("ISI_") &&
    !c.projectId.startsWith("ISI_")
  );
}

/* Email editor yang diizinkan */
function allowedEditors() {
  return (window.EDITORS || []).map(function (x) {
    return String(x).trim().toLowerCase();
  });
}

/* Memeriksa apakah akun boleh mengedit */
function isAllowedEditor(user) {
  return !!(
    user &&
    user.email &&
    allowedEditors().includes(
      String(user.email).trim().toLowerCase()
    )
  );
}

/* Memeriksa sesi editor */
function editorAuthenticated(user) {
  user = user || (fbAuth && fbAuth.currentUser);

  return !!(
    user &&
    user.emailVerified &&
    isAllowedEditor(user)
  );
}

/* Menyembunyikan menu admin */
function hideAdmin() {
  admin = false;

  document.body.classList.remove("adm");

  var menu = document.querySelector(".menu2");
  if (menu) menu.remove();
}

/* Menampilkan admin setelah autentikasi valid */
function refreshAdminAfterAuth(user) {
  if (!editorAuthenticated(user)) {
    hideAdmin();
    return;
  }

  var params = new URLSearchParams(location.search);

  /* Di website publik, menu hanya tampil pada mode edit */
  if (!isLocal() && !params.has(ADMIN_PARAM)) {
    hideAdmin();
    return;
  }

  initAdmin();
}

/* Membuat elemen dengan gaya terpusat */
function centerElement(element, marginTop) {
  element.style.display = "block";
  element.style.margin = (marginTop || 0) + "px auto 0";
}

/* Tampilan login tanpa pendaftaran akun */
function showAuth() {
  if ($("#firebaseAuth")) return;

  var m = el("div", "modal");
  m.id = "firebaseAuth";

  var f = el("div", "card");
  var h = el("h3", "script", "Ruang kita 💗");
  var p = el(
    "p",
    "mlabel",
    "Masuk menggunakan akun yang sudah dibuat."
  );

  var email = el("input");
  var pass = el("input");
  var msg = el("p", "mlabel", "");

  email.type = "email";
  email.placeholder = "Email";
  email.autocomplete = "username";
  email.required = true;

  pass.type = "password";
  pass.placeholder = "Kata sandi";
  pass.autocomplete = "current-password";
  pass.required = true;

  var row = el("div", "row");
  row.style.display = "flex";
  row.style.justifyContent = "center";
  row.style.alignItems = "center";
  row.style.width = "100%";

  var login = el("button", "pri", "Masuk");
  var resend = el("button", null, "Kirim ulang verifikasi");

  login.type = "button";
  resend.type = "button";

  login.style.display = "block";
  login.style.margin = "0 auto";
  login.style.minWidth = "140px";

  centerElement(resend, 12);

  [h, p, email, pass, msg].forEach(function (x) {
    f.appendChild(x);
  });

  row.appendChild(login);
  f.appendChild(row);
  f.appendChild(resend);

  m.appendChild(f);
  document.body.appendChild(m);

  async function runLogin() {
    var mail = email.value.trim();
    var password = pass.value;

    if (!mail || !password) {
      msg.textContent =
        "Masukkan email dan kata sandi terlebih dahulu.";
      return;
    }

    login.disabled = true;
    msg.textContent = "Memeriksa akun...";

    try {
      var result = await fbAuth.signInWithEmailAndPassword(
        mail,
        password
      );

      await result.user.reload();

      var user = fbAuth.currentUser;

      if (!user) {
        msg.textContent =
          "Sesi login berakhir. Silakan coba lagi.";
        return;
      }

      if (!user.emailVerified) {
        await fbAuth.signOut();

        msg.textContent =
          "Email belum terverifikasi. Gunakan tombol Kirim ulang verifikasi.";
        return;
      }

      if (!isAllowedEditor(user)) {
        await fbAuth.signOut();

        msg.textContent =
          "Akun ini tidak diizinkan mengedit website.";
        return;
      }

      /*
       * Pertahankan maksud masuk ke mode edit.
       * Jika login dimulai tanpa ?edit, tambahkan parameter.
       */
      var params = new URLSearchParams(location.search);

      if (!isLocal() && !params.has(ADMIN_PARAM)) {
        params.set(ADMIN_PARAM, "");
        var query = params.toString();

        history.replaceState(
          null,
          "",
          location.pathname +
            (query ? "?" + query : "") +
            location.hash
        );
      }

      msg.textContent = "Login berhasil. Memuat data...";
      /* Menu admin diaktifkan oleh onAuthStateChanged. */
    } catch (e) {
      console.error("Firebase login error:", e.code, e.message);
      msg.textContent = authError(e);
    } finally {
      login.disabled = false;
    }
  }

  login.onclick = runLogin;

  pass.addEventListener("keydown", function (e) {
    if (e.key === "Enter") runLogin();
  });

  email.addEventListener("keydown", function (e) {
    if (e.key === "Enter") pass.focus();
  });

  /* Mengirim ulang email verifikasi */
  resend.onclick = async function () {
    var mail = email.value.trim();
    var password = pass.value;

    if (!mail || !password) {
      msg.textContent =
        "Masukkan email dan kata sandi terlebih dahulu.";
      return;
    }

    resend.disabled = true;
    msg.textContent = "Memeriksa akun...";

    try {
      var result = await fbAuth.signInWithEmailAndPassword(
        mail,
        password
      );

      await result.user.reload();

      var user = fbAuth.currentUser;

      if (!user) {
        msg.textContent = "Login gagal. Silakan coba lagi.";
        return;
      }

      if (!isAllowedEditor(user)) {
        await fbAuth.signOut();

        msg.textContent =
          "Akun ini tidak diizinkan mengedit website.";
        return;
      }

      if (user.emailVerified) {
        await fbAuth.signOut();

        msg.textContent =
          "Email sudah terverifikasi. Silakan tekan Masuk.";
        return;
      }

      await user.sendEmailVerification();
      await fbAuth.signOut();

      msg.textContent =
        "Email verifikasi dikirim ulang. Periksa kotak masuk dan folder Spam.";
    } catch (e) {
      console.error(
        "Firebase verification error:",
        e.code,
        e.message
      );
      msg.textContent = authError(e);
    } finally {
      resend.disabled = false;
    }
  };
}

/* Pesan kesalahan login */
function authError(e) {
  if (
    e.code === "auth/invalid-credential" ||
    e.code === "auth/wrong-password" ||
    e.code === "auth/user-not-found"
  ) {
    return "Email atau kata sandi salah.";
  }

  if (e.code === "auth/invalid-email") {
    return "Format email belum benar.";
  }

  if (e.code === "auth/too-many-requests") {
    return "Terlalu banyak percobaan. Coba lagi nanti.";
  }

  if (e.code === "auth/network-request-failed") {
    return "Koneksi bermasalah. Periksa internet kamu.";
  }

  if (e.code === "auth/user-disabled") {
    return "Akun ini sedang dinonaktifkan.";
  }

  return "Gagal: " + (
    e.message || e.code || "Kesalahan tidak diketahui."
  );
}

/* Memulai Firebase */
function bootCloud() {
  if (!firebaseConfigured()) {
    if (!isLocal()) {
      hideAdmin();
      toast("Firebase belum dikonfigurasi. Periksa README.");
    } else {
      initAdmin();
    }

    return;
  }

  try {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(
        window.FIREBASE_CONFIG
      );
    } else {
      fbApp = firebase.app();
    }

    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
  } catch (e) {
    toast("Firebase gagal dimulai: " + e.message);
    console.error("Firebase initialization error:", e);
    return;
  }

  showAuth();

  fbAuth.onAuthStateChanged(async function (user) {
    fbUser = user;
    fbReady = true;

    if (user && (!user.emailVerified || !isAllowedEditor(user))) {
      var reason = !user.emailVerified
        ? "Email belum terverifikasi. Periksa kotak masuk dan Spam."
        : "Email ini tidak diizinkan mengedit website.";

      hideAdmin();

      try {
        await fbAuth.signOut();
      } catch (e) {
        console.error("Firebase sign-out error:", e);
      }

      showAuth();

      var msg = $("#firebaseAuth .mlabel:last-of-type");
      if (msg) msg.textContent = reason;

      return;
    }

    if (!user) {
      if (fbUnsub) {
        fbUnsub();
        fbUnsub = null;
      }

      hideAdmin();
      showAuth();
      return;
    }

    var modal = $("#firebaseAuth");
    if (modal) modal.remove();

    try {
      var docRef = fbDb.doc("anniversary/shared");
      var snap = await docRef.get();

      if (snap.exists && snap.data().content) {
        D = snap.data().content;
        saveData(D);
        render();
      }

      if (fbUnsub) fbUnsub();

      fbUnsub = docRef.onSnapshot(
        function (s) {
          if (!s.exists || !s.data().content) return;
          if (dirty) return;

          D = s.data().content;
          saveData(D);
          render();
        },
        function (e) {
          console.error("Firestore listener error:", e);
          toast("Sinkronisasi cloud gagal: " + e.message);
        }
      );

      /* Penting: periksa autentikasi dan mode edit */
      refreshAdminAfterAuth(user);
    } catch (e) {
      console.error("Firestore read error:", e);
      toast("Tidak bisa membaca data cloud: " + e.message);
    }
  });
}

/* Menyimpan perubahan ke Firebase */
async function saveCloud(d) {
  if (!fbDb || !editorAuthenticated(fbUser)) {
    throw new Error("Login editor terverifikasi diperlukan.");
  }

  await fbDb.doc("anniversary/shared").set({
    content: d,
    updatedAt:
      firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: fbUser.email
  });
}
