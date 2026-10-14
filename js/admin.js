
/* Mode edit: tambah, ubah, hapus foto dan lagu */
var admin = false;
var dirty = false;
var mgr = null;

/* Memastikan editor sudah login dengan akun yang diizinkan */
function editorAuthenticated() {
  if (
    typeof fbAuth === "undefined" ||
    !fbAuth ||
    !fbAuth.currentUser
  ) {
    return false;
  }

  var user = fbAuth.currentUser;

  return !!(
    user.emailVerified &&
    typeof isAllowedEditor === "function" &&
    isAllowedEditor(user)
  );
}

/* Kompres foto */
function compress(f) {
  return new Promise(function (ok, no) {
    var i = new Image();
    var u = URL.createObjectURL(f);

    i.onload = function () {
      var k = Math.min(
        1,
        800 / Math.max(i.width, i.height)
      );

      var c = document.createElement("canvas");
      c.width = Math.round(i.width * k);
      c.height = Math.round(i.height * k);

      var ctx = c.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(u);
        no(new Error("Canvas tidak tersedia"));
        return;
      }

      ctx.drawImage(i, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);

      ok(c.toDataURL("image/jpeg", 0.72));
    };

    i.onerror = function () {
      URL.revokeObjectURL(u);
      no(new Error("Foto gagal dibaca"));
    };

    i.src = u;
  });
}

/* Memilih foto */
function pick(multi, cb) {
  var i = document.createElement("input");

  i.type = "file";
  i.accept = "image/*";
  i.multiple = !!multi;

  i.onchange = function () {
    Promise.all([].map.call(i.files || [], compress))
      .then(cb)
      .catch(function (e) {
        console.error(e);
        toast("Foto gagal dibaca");
      });
  };

  i.click();
}

/* Form umum */
function form(title, fs, o, ok) {
  var m = el("div", "modal");
  var f = el("div", "card");
  var ins = {};

  f.appendChild(el("h3", "script", title));

  fs.forEach(function (x) {
    var l = el("label", null, x.l);
    var i = el(x.big ? "textarea" : "input");

    if (x.big) {
      i.rows = 5;
    } else {
      i.type = x.type || "text";
    }

    i.value = o[x.k] || "";
    l.appendChild(i);
    f.appendChild(l);
    ins[x.k] = i;
  });

  var b = el("div", "row");
  var c = el("button", null, "Batal");
  var s = el("button", "pri", "OK");

  c.type = s.type = "button";

  c.onclick = function () {
    m.remove();
  };

  s.onclick = function () {
    var v = {};

    Object.keys(ins).forEach(function (k) {
      v[k] = ins[k].value.trim();
    });

    m.remove();
    ok(v);
  };

  b.appendChild(c);
  b.appendChild(s);
  f.appendChild(b);
  m.appendChild(f);

  (document.querySelector("#adminUI") || document.body)
    .appendChild(m);
}

/* Menandai perubahan */
function chg() {
  dirty = true;

  var saveButton = document.querySelector("#save");
  if (saveButton) saveButton.disabled = false;

  render();

  /* render() mungkin membangun ulang tombol Simpan */
  saveButton = document.querySelector("#save");
  if (saveButton) saveButton.disabled = false;
}

/* Logout Firebase */
async function logoutAdmin() {
  try {
    if (typeof fbAuth !== "undefined" && fbAuth) {
      await fbAuth.signOut();
    } else if (
      typeof firebase !== "undefined" &&
      firebase.auth
    ) {
      await firebase.auth().signOut();
    }

    admin = false;
    dirty = false;

    document.body.classList.remove("adm");

    var u = document.querySelector("#adminUI");
    if (u) {
      u.querySelectorAll(".menu2").forEach(function (x) {
        x.remove();
      });
    }

    /* Kembali ke halaman login editor */
    window.location.replace(
      window.location.pathname + "?edit"
    );
  } catch (e) {
    console.error("Logout gagal:", e);
    toast("Gagal keluar: " + e.message);
  }
}

/* Membuat menu edit tanpa tombol Terbitkan */
function bar() {
  var u = document.querySelector("#adminUI");

  if (!u) {
    console.error("Elemen #adminUI tidak ditemukan.");
    return;
  }

  /* Cegah menu ganda */
  u.querySelectorAll(".menu2").forEach(function (x) {
    x.remove();
  });

  var b = el("div", "menu2");
  var h = el("button", "burger", "☰");
  var p = el("div", "panel");
  var t = el("button");
  var s = el("button", "pri");

  h.type = t.type = s.type = "button";

  h.setAttribute("aria-label", "Menu edit");
  h.setAttribute("aria-expanded", "false");

  t.innerHTML =
    '<svg class="ic" viewBox="0 0 24 24">' +
    '<path d="M4 20h4L19 9l-4-4L4 16z"/>' +
    "</svg> Teks";

  s.innerHTML =
    '<svg class="ic" viewBox="0 0 24 24">' +
    '<path d="M5 12.5l4.5 4.5L19 7.5"/>' +
    "</svg> Simpan";

  s.id = "save";
  s.disabled = !dirty;

  h.onclick = function () {
    var opened = p.classList.toggle("on");
    h.setAttribute("aria-expanded", String(opened));
  };

  t.onclick = function () {
    p.classList.remove("on");

    form(
      "Pengaturan",
      [
        { k: "her", l: "Nama pacar" },
        { k: "him", l: "Namamu" },
        {
          k: "since",
          l: "Tanggal jadian",
          type: "datetime-local"
        },
        { k: "letter", l: "Isi surat", big: 1 },
        { k: "gift", l: "Isi kupon hadiah", big: 1 }
      ],
      D,
      function (v) {
        Object.assign(D, v);
        chg();
      }
    );
  };

  s.onclick = function () {
    p.classList.remove("on");
    save();
  };

  var fb = el("button");
  var lb = el("button");
  var gb = el("button");
  var out = el("button");

  [fb, lb, gb, out].forEach(function (button) {
    button.type = "button";
  });

  fb.innerHTML =
    '<svg class="ic" viewBox="0 0 24 24">' +
    '<rect x="4" y="5" width="16" height="14" rx="2"/>' +
    '<circle cx="9" cy="10" r="1.5"/>' +
    '<path d="M4 17l5-4 4 3 3-2 4 3"/>' +
    "</svg> Foto";

  lb.innerHTML =
    '<svg class="ic" viewBox="0 0 24 24">' +
    '<path d="M9 18V6l10-2v12"/>' +
    '<circle cx="7" cy="18" r="2"/>' +
    '<circle cx="17" cy="16" r="2"/>' +
    "</svg> Lagu";

  gb.innerHTML =
    '<svg class="ic" viewBox="0 0 24 24">' +
    '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>' +
    "</svg> Wishlist";

  fb.onclick = function () {
    p.classList.remove("on");
    photoManager();
  };

  lb.onclick = function () {
    p.classList.remove("on");
    songManager();
  };

  gb.onclick = function () {
    p.classList.remove("on");
    dateManager();
  };

  out.textContent = "Keluar";

  out.onclick = function () {
    p.classList.remove("on");

    if (confirm("Yakin ingin keluar dari akun edit?")) {
      logoutAdmin();
    }
  };

  /* Informasi akun */
  p.appendChild(el("b", null, "Mode edit"));

  var email = "";

  if (
    typeof fbAuth !== "undefined" &&
    fbAuth &&
    fbAuth.currentUser
  ) {
    email = fbAuth.currentUser.email || "";
  } else if (
    typeof fbUser !== "undefined" &&
    fbUser
  ) {
    email = fbUser.email || "";
  }

  var accountLabel = el(
    "div",
    "mlabel",
    email ? "Akun: " + email : "Akun editor"
  );

  accountLabel.style.overflowWrap = "anywhere";
  accountLabel.style.marginBottom = "12px";

  p.appendChild(accountLabel);
  p.appendChild(t);
  p.appendChild(fb);
  p.appendChild(lb);
  p.appendChild(gb);
  p.appendChild(s);
  p.appendChild(out);

  b.appendChild(h);
  b.appendChild(p);
  u.appendChild(b);
}

/* Pengelola foto dan lagu */
function manager(title, build) {
  var m = el("div", "modal");
  var f = el("div", "card");
  var body = el("div", "mbody");
  var r = el("div", "row");
  var c = el("button", "pri", "Selesai");

  f.appendChild(el("h3", "script", title));
  f.appendChild(body);

  c.type = "button";
  c.onclick = function () {
    m.remove();
    mgr = null;
  };

  r.appendChild(c);
  f.appendChild(r);
  m.appendChild(f);

  (document.querySelector("#adminUI") || document.body)
    .appendChild(m);

  mgr = {
    refresh: function () {
      body.innerHTML = "";
      build(body);
    }
  };

  mgr.refresh();
}

/* Konfirmasi hapus dua ketukan */
function sure(btn, fn) {
  if (btn.dataset.s) {
    fn();
    return;
  }

  btn.dataset.s = "1";

  var oldText = btn.textContent;
  btn.textContent = "Yakin?";

  setTimeout(function () {
    delete btn.dataset.s;
    btn.textContent = oldText;
  }, 2200);
}

/* Kartu foto */
function tile(src, set, del) {
  var t = el("div", "mt");
  var tb = el("div", "tb");
  var e = el("button", null, src ? "Ganti" : "Pilih");

  e.type = "button";

  if (src) {
    t.style.backgroundImage = "url('" + src + "')";
  }

  e.onclick = function () {
    pick(false, function (r) {
      if (r.length) {
        set(r[0]);
        chg();

        if (mgr) mgr.refresh();
      }
    });
  };

  tb.appendChild(e);

  if (src) {
    var x = el("button", null, "Hapus");
    x.type = "button";

    x.onclick = function () {
      sure(x, function () {
        del();
        chg();

        if (mgr) mgr.refresh();
      });
    };

    tb.appendChild(x);
  }

  t.appendChild(tb);
  return t;
}

/* Pengelola foto */
function photoManager() {
  manager("Kelola foto", function (b) {
    b.appendChild(
      el(
        "p",
        "mlabel",
        "Foto di samping surat (halaman Moment)"
      )
    );

    var g0 = el("div", "mgrid");

    g0.appendChild(
      tile(
        D.portrait,
        function (v) { D.portrait = v; },
        function () { D.portrait = ""; }
      )
    );

    b.appendChild(g0);

    b.appendChild(
      el(
        "p",
        "mlabel",
        "Polaroid (halaman Journey): " +
          D.photos.length + " dari 12"
      )
    );

    var g = el("div", "mgrid");

    D.photos.forEach(function (photo, i) {
      g.appendChild(
        tile(
          photo.src,
          function (v) { photo.src = v; },
          function () { D.photos.splice(i, 1); }
        )
      );
    });

    if (D.photos.length < 12) {
      var a = el("button", "mt add", "＋");
      a.type = "button";
      a.setAttribute("aria-label", "Tambah foto");

      a.onclick = function () {
        pick(true, function (r) {
          r.forEach(function (x) {
            if (D.photos.length < 12) {
              D.photos.push({ id: uid(), src: x });
            }
          });

          chg();
          if (mgr) mgr.refresh();
        });
      };

      g.appendChild(a);
    }

    b.appendChild(g);
  });
}

/* Pengelola lagu */
function songManager() {
  manager("Kelola lagu", function (b) {
    var l = el("div", "mlist");

    D.songs.forEach(function (song, i) {
      var r = el("div", "mrow");
      var t = el("span", null, song.t);
      var e = el("button", null, "✎");
      var x = el("button", null, "✕");

      e.type = x.type = "button";

      t.appendChild(document.createElement("br"));
      t.appendChild(el("small", null, song.a));

      e.setAttribute("aria-label", "Edit lagu");
      x.setAttribute("aria-label", "Hapus lagu");

      e.onclick = function () {
        songForm(song);
      };

      x.onclick = function () {
        sure(x, function () {
          D.songs.splice(i, 1);
          chg();
          if (mgr) mgr.refresh();
        });
      };

      r.appendChild(t);
      r.appendChild(e);
      r.appendChild(x);
      l.appendChild(r);
    });

    if (!D.songs.length) {
      l.appendChild(el("p", "mlabel", "Belum ada lagu."));
    }

    b.appendChild(l);

    var a = el("button", "pri", "＋ Tambah lagu");
    a.type = "button";
    a.onclick = function () { songForm(); };

    b.appendChild(a);
  });
}

/* Form wishlist */
function dateForm(o) {
  var n = !o;
  o = o || { id: uid(), e: "", t: "", d: "" };

  form(
    n ? "Tambah wishlist" : "Edit wishlist",
    [
      { k: "e", l: "Emoji (satu saja)" },
      { k: "t", l: "Judul" },
      { k: "d", l: "Keterangan singkat (opsional)" }
    ],
    o,
    function (v) {
      if (!v.t) {
        toast("Judul wajib diisi");
        return;
      }

      Object.assign(o, v);

      if (!o.e) o.e = "💗";
      if (n) D.dates.push(o);

      chg();
      if (mgr) mgr.refresh();
    }
  );
}

/* Pengelola wishlist */
function dateManager() {
  manager("Wishlist minggu ini", function (b) {
    if (!D.dates) D.dates = [];

    var l = el("div", "mlist");

    D.dates.forEach(function (o, i) {
      var r = el("div", "mrow");
      var t = el("span", null, o.e + " " + o.t);
      var e = el("button", null, "✎");
      var x = el("button", null, "✕");

      e.type = x.type = "button";

      if (o.d) {
        t.appendChild(document.createElement("br"));
        t.appendChild(el("small", null, o.d));
      }

      e.setAttribute("aria-label", "Edit pilihan");
      x.setAttribute("aria-label", "Hapus pilihan");

      e.onclick = function () {
        dateForm(o);
      };

      x.onclick = function () {
        sure(x, function () {
          D.dates.splice(i, 1);
          chg();
          if (mgr) mgr.refresh();
        });
      };

      r.appendChild(t);
      r.appendChild(e);
      r.appendChild(x);
      l.appendChild(r);
    });

    if (!D.dates.length) {
      l.appendChild(el("p", "mlabel", "Belum ada wishlist."));
    }

    b.appendChild(l);

    if (D.dates.length < 6) {
      var a = el("button", "pri", "＋ Tambah wishlist");
      a.type = "button";
      a.onclick = function () { dateForm(); };
      b.appendChild(a);
    }

    b.appendChild(
      el(
        "p",
        "mlabel",
        "Kalimat pembuka di atas daftar diubah lewat menu Teks (Isi kupon hadiah)."
      )
    );
  });
}

/* Simpan data */
async function save() {
  var saveButton = document.querySelector("#save");

  if (!editorAuthenticated() && !isLocal()) {
    toast("Sesi editor tidak valid. Silakan login kembali.");

    if (saveButton) saveButton.disabled = false;
    return;
  }

  if (saveButton) saveButton.disabled = true;

  if (!saveData(D)) {
    if (saveButton) saveButton.disabled = false;
    toast("Data terlalu besar. Hapus beberapa foto lalu coba lagi.");
    return;
  }

  try {
    if (firebaseConfigured() && !isLocal()) {
      await saveCloud(D);
    }

    dirty = false;

    render();

    saveButton = document.querySelector("#save");
    if (saveButton) saveButton.disabled = true;

    toast(
      firebaseConfigured() && !isLocal()
        ? "Tersimpan dan tersinkron untuk kalian berdua"
        : "Tersimpan di perangkat ini"
    );
  } catch (e) {
    console.error("Gagal menyimpan:", e);

    if (saveButton) saveButton.disabled = false;

    toast("Gagal menyimpan ke cloud: " + e.message);
  }
}

/* Pemeriksaan lokal */
function isLocal() {
  var h = location.hostname;

  return location.protocol === "file:" ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.slice(-6) === ".local" ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
}

/* Memulai mode edit */
function initAdmin() {
  var q = new URLSearchParams(location.search);
  var wantsEdit = q.has(ADMIN_PARAM);
  var localEdit = isLocal() && !q.has(VIEW_PARAM);

  if (!wantsEdit && !localEdit) {
    admin = false;
    document.body.classList.remove("adm");
    return;
  }

  if (!isLocal() && !editorAuthenticated()) {
    admin = false;
    document.body.classList.remove("adm");
    return;
  }

  admin = true;
  document.body.classList.add("adm");

  bar();
  render();
}

/* Memperbarui mode admin setelah autentikasi berubah */
function refreshAdminAfterAuth(user) {
  if (!user || !user.emailVerified || !isAllowedEditor(user)) {
    admin = false;
    document.body.classList.remove("adm");

    var u = document.querySelector("#adminUI");
    if (u) {
      u.querySelectorAll(".menu2").forEach(function (x) {
        x.remove();
      });
    }

    return;
  }

  initAdmin();
}
