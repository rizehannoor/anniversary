
/* Sinkronisasi Firebase. Memerlukan firebase-config.js dan SDK compat. */

var fbApp = null;
var fbAuth = null;
var fbDb = null;
var fbUser = null;
var fbReady = false;
var fbUnsub = null;

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

function showAuth() {
  if ($("#firebaseAuth")) return;

  var m = el("div", "modal");
  m.id = "firebaseAuth";

  var f = el("div", "card");
  var h = el("h3", "script", "Ruang kita 💗");
  var p = el("p", "mlabel", "Login untuk mengedit website bersama.");

  var email = el("input");
  var pass = el("input");
  var msg = el("p", "mlabel", "");

  email.type = "email";
  email.placeholder = "Email";
  email.autocomplete = "email";

  pass.type = "password";
  pass.placeholder = "Kata sandi";
  pass.autocomplete = "current-password";

  var row = el("div", "row");
  var login = el("button", "pri", "Masuk");
  var reg = el("button", null, "Daftar akun");
  var resend = el("button", null, "Kirim ulang verifikasi");

  [h, p, email, pass, msg].forEach(function (x) {
    f.appendChild(x);
  });

  row.appendChild(login);
  row.appendChild(reg);
  f.appendChild(row);
  f.appendChild(resend);
  m.appendChild(f);
  document.body.appendChild(m);

  async function run(create) {
    var mail = email.value.trim();
    var password = pass.value;

    if (!mail || !password) {
      msg.textContent = "Masukkan email dan kata sandi terlebih dahulu.";
      return;
    }

    msg.textContent = "Memproses...";

    try {
      if (create) {
        var newResult = await fbAuth.createUserWithEmailAndPassword(
          mail,
          password
        );

        await newResult.user.sendEmailVerification();

        msg.textContent =
          "Email verifikasi telah dikirim. Periksa kotak masuk dan Spam.";

        await fbAuth.signOut();
        return;
      }

      var result = await fbAuth.signInWithEmailAndPassword(
        mail,
        password
      );

      await result.user.reload();

      var user = fbAuth.currentUser;

      if (!user) {
        msg.textContent = "Sesi login berakhir. Silakan coba lagi.";
        return;
      }

      if (!user.emailVerified) {
        msg.textContent =
          "Email belum terverifikasi. Gunakan tombol Kirim ulang verifikasi.";

        await fbAuth.signOut();
        return;
      }

      var allowed = (window.EDITORS || []).map(function (x) {
        return String(x).trim().toLowerCase();
      });

      if (
        allowed.indexOf(
          String(user.email || "").trim().toLowerCase()
        ) === -1
      ) {
        msg.textContent =
          "Email sudah terverifikasi, tetapi akun ini tidak diizinkan mengedit.";

        await fbAuth.signOut();
        return;
      }

      msg.textContent = "Login berhasil. Memuat data...";
    } catch (e) {
      console.error("Firebase login error:", e.code, e.message);
      msg.textContent = authError(e);
    }
  }

  login.onclick = function () {
    run(false);
  };

  reg.onclick = function () {
    run(true);
  };

  resend.onclick = async function () {
    var mail = email.value.trim();
    var password = pass.value;

    if (!mail || !password) {
      msg.textContent =
        "Masukkan email dan kata sandi untuk mengirim ulang verifikasi.";
      return;
    }

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

      if (user.emailVerified) {
        msg.textContent =
          "Email sudah terverifikasi. Silakan masuk kembali.";

        await fbAuth.signOut();
        return;
      }

      await user.sendEmailVerification();

      msg.textContent =
        "Email verifikasi dikirim ulang. Periksa kotak masuk dan folder Spam.";

      await fbAuth.signOut();
    } catch (e) {
      console.error("Firebase verification error:", e.code, e.message);
      msg.textContent = authError(e);
    }
  };
}

function authError(e) {
  if (
    e.code === "auth/invalid-credential" ||
    e.code === "auth/wrong-password" ||
    e.code === "auth/user-not-found"
  ) {
    return "Email atau kata sandi salah.";
  }

  if (e.code === "auth/email-already-in-use") {
    return "Email sudah terdaftar. Silakan masuk.";
  }

  if (e.code === "auth/weak-password") {
    return "Kata sandi minimal 6 karakter.";
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

  return "Gagal: " + (e.message || e.code || "Kesalahan tidak diketahui.");
}

function bootCloud() {
  if (!firebaseConfigured()) {
    if (!isLocal()) {
      document.body.classList.remove("adm");
      toast("Firebase belum dikonfigurasi. Ikuti README.");
    } else {
      initAdmin();
    }

    return;
  }

  try {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(window.FIREBASE_CONFIG);
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

    var allowed = (window.EDITORS || []).map(function (x) {
      return String(x).trim().toLowerCase();
    });

    var emailAllowed = !!(
      user &&
      allowed.indexOf(
        String(user.email || "").trim().toLowerCase()
      ) !== -1
    );

    if (user && user.emailVerified && emailAllowed) {
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
    } else {
      if (user) {
        if (!user.emailVerified) {
          console.warn("Login ditolak: email belum terverifikasi.");
        } else if (!emailAllowed) {
          console.warn("Login ditolak: email tidak diizinkan.");
        }

        await fbAuth.signOut();
      }

      showAuth();

      var message = $("#firebaseAuth .mlabel:last-of-type");

      if (message) {
        if (user && !user.emailVerified) {
          message.textContent =
            "Email belum terverifikasi. Periksa kotak masuk dan Spam.";
        } else if (user && !emailAllowed) {
          message.textContent =
            "Email terverifikasi, tetapi akun tidak diizinkan mengedit.";
        } else {
          message.textContent =
            "Login dengan salah satu dari dua email yang diizinkan.";
        }
      }
    }
  });
}

async function saveCloud(d) {
  if (!fbDb || !fbUser || !fbUser.emailVerified) {
    throw new Error("Login terverifikasi diperlukan.");
  }

  var allowed = (window.EDITORS || []).map(function (x) {
    return String(x).trim().toLowerCase();
  });

  if (
    allowed.indexOf(
      String(fbUser.email || "").trim().toLowerCase()
    ) === -1
  ) {
    throw new Error("Akun ini tidak diizinkan mengedit.");
  }

  await fbDb.doc("anniversary/shared").set({
    content: d,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: fbUser.email
  });
}
