
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
    c.apiKey.indexOf("ISI_") !== 0 &&
    c.projectId.indexOf("ISI_") !== 0
  );
}

/* Daftar email yang diizinkan */
function allowedEditors() {
  return (window.EDITORS || []).map(function (x) {
    return String(x).trim().toLowerCase();
  });
}

function isAllowedEditor(user) {
  return !!(
    user &&
    user.email &&
    allowedEditors().indexOf(
      String(user.email).trim().toLowerCase()
    ) !== -1
  );
}

/* Tampilan login: tidak menyediakan pendaftaran akun */
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
  var login = el("button", "pri", "Masuk");
  var resend = el("button", null, "Kirim ulang verifikasi");

  login.type = "button";
  resend.type = "button";

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

      msg.textContent = "Login berhasil. Memuat data...";
      /* onAuthStateChanged akan melanjutkan proses sinkronisasi. */
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

  /* Kirim ulang verifikasi untuk akun yang sudah dibuat */
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
        msg.textContent =
          "Login gagal. Silakan coba lagi.";
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
      document.body.classList.remove("adm");
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

    var modal = $("#firebaseAuth");

    if (user && !user.emailVerified) {
      try {
        await fbAuth.signOut();
      } catch (e) {
        console.error("Firebase sign-out error:", e);
      }

      showAuth();

      var unverifiedMsg = $(
        "#firebaseAuth .mlabel:last-of-type"
      );

      if (unverifiedMsg) {
        unverifiedMsg.textContent =
          "Email belum terverifikasi. Periksa kotak masuk dan Spam.";
      }

      return;
    }

    if (user && !isAllowedEditor(user)) {
      try {
        await fbAuth.signOut();
      } catch (e) {
        console.error("Firebase sign-out error:", e);
      }

      showAuth();

      var deniedMsg = $(
        "#firebaseAuth .mlabel:last-of-type"
      );

      if (deniedMsg) {
        deniedMsg.textContent =
          "Email ini tidak diizinkan mengedit website.";
      }

      return;
    }

    if (!user) {
      if (fbUnsub) {
        fbUnsub();
        fbUnsub = null;
      }

      showAuth();
      return;
    }

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

      initAdmin();
    } catch (e) {
      console.error("Firestore read error:", e);
      toast("Tidak bisa membaca data cloud: " + e.message);
    }
  });
}

/* Menyimpan perubahan ke Firebase */
async function saveCloud(d) {
  if (!fbDb || !fbUser || !fbUser.emailVerified) {
    throw new Error("Login terverifikasi diperlukan.");
  }

  if (!isAllowedEditor(fbUser)) {
    throw new Error("Akun ini tidak diizinkan mengedit.");
  }

  await fbDb.doc("anniversary/shared").set({
    content: d,
    updatedAt:
      firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: fbUser.email
  });
}
