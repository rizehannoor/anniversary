
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

    window.location.replace(
      window.location.pathname + "?edit"
    );
  } catch (e) {
    console.error("Logout gagal:", e);
    toast("Gagal keluar: " + e.message);
  }
}

/* =====================================================
   PROFIL EDITOR
   Nama dan foto disimpan berdasarkan email di browser.
   Email akun Firebase tidak dapat diedit dari menu ini.
   ===================================================== */

/* Email akun Firebase */
function editorProfileEmail() {
  if (
    typeof fbAuth !== "undefined" &&
    fbAuth &&
    fbAuth.currentUser
  ) {
    return fbAuth.currentUser.email || "";
  }

  if (typeof fbUser !== "undefined" && fbUser) {
    return fbUser.email || "";
  }

  return "";
}

/* Kunci penyimpanan unik per email */
function editorProfileKey() {
  return "anniversaryEditorProfileV1:" +
    editorProfileEmail().toLowerCase();
}

/* Nama bawaan */
function editorProfileDefaultName(email) {
  return (email || "Editor").split("@")[0];
}

/* Avatar bawaan berbentuk ilustrasi manusia */
function editorProfileDefaultAvatar() {
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#7a1590"/>' +
    '<stop offset="1" stop-color="#ff7fdc"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="128" height="128" rx="64" fill="url(#bg)"/>' +
    '<circle cx="64" cy="46" r="25" fill="#f7d9ff"/>' +
    '<path d="M18 124c3-29 20-44 46-44s43 15 46 44" fill="#f7d9ff"/>' +
    '</svg>';

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}

/* Membaca profil dari localStorage */
function editorProfileRead() {
  var email = editorProfileEmail();

  var profile = {
    name: editorProfileDefaultName(email),
    photo: ""
  };

  try {
    var raw = localStorage.getItem(editorProfileKey());

    if (raw) {
      var saved = JSON.parse(raw);

      if (saved && typeof saved === "object") {
        if (
          typeof saved.name === "string" &&
          saved.name.trim()
        ) {
          profile.name = saved.name.trim();
        }

        if (typeof saved.photo === "string") {
          profile.photo = saved.photo;
        }
      }
    }
  } catch (e) {
    console.warn("Profil editor tidak dapat dibaca:", e);
  }

  return profile;
}

/* Menyimpan profil */
function editorProfileWrite(profile) {
  try {
    localStorage.setItem(
      editorProfileKey(),
      JSON.stringify(profile)
    );

    return true;
  } catch (e) {
    console.error("Profil editor gagal disimpan:", e);
    toast("Profil gagal disimpan di browser");
    return false;
  }
}

/* Membuat ikon SVG */
function editorProfileIcon(path) {
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  var p = document.createElementNS(ns, "path");

  svg.setAttribute("class", "ic");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  p.setAttribute("d", path);
  svg.appendChild(p);

  return svg;
}

/* Mengedit nama dan foto profil */
function editorProfileEdit() {
  var current = editorProfileRead();
  var email = editorProfileEmail();

  var defaultAvatar = editorProfileDefaultAvatar();
  var draftPhoto = current.photo || "";

  var modal = el("div", "modal");
  var card = el("div", "card profile-modal-card");

  var title = el("h3", "script", "Edit profil");
  var previewWrap = el("div", "profile-preview-wrap");
  var preview = el("img", "profile-preview");
  var photoButton = el("button", "profile-photo-button");
  var removeButton = el(
    "button",
    "profile-photo-remove",
    "Hapus foto"
  );
  var photoActions = el("div", "profile-photo-actions");

  var help = el(
    "p",
    "profile-help",
    "Nama dan foto disimpan di browser ini."
  );

  var nameLabel = el("label", null, "Nama tampilan");
  var nameInput = el("input");

  var emailLabel = el("label", null, "Email akun");
  var emailInput = el("input");

  var row = el("div", "row");
  var cancel = el("button", null, "Batal");
  var saveProfile = el("button", "pri", "Simpan profil");

  preview.alt = "Pratinjau foto profil";
  preview.src = draftPhoto || defaultAvatar;

  photoButton.type = "button";
  removeButton.type = "button";

  /* Tombol hapus hanya aktif kalau ada foto buatan sendiri */
  function syncPhotoState() {
    removeButton.disabled = !draftPhoto;
  }

  syncPhotoState();

  photoButton.appendChild(
    editorProfileIcon(
      "M4 7h3l2-3h6l2 3h3v12H4z"
    )
  );
  photoButton.appendChild(
    document.createTextNode(" Ganti foto")
  );

  nameInput.type = "text";
  nameInput.maxLength = 60;
  nameInput.required = true;
  nameInput.value = current.name;

  emailInput.type = "email";
  emailInput.value = email;
  emailInput.readOnly = true;

  nameLabel.appendChild(nameInput);
  emailLabel.appendChild(emailInput);

  cancel.type = "button";
  saveProfile.type = "button";

  /* Memilih foto profil */
  photoButton.onclick = function () {
    var input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = function () {
      var file = input.files && input.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast("Pilih file gambar");
        return;
      }

      compress(file)
        .then(function (data) {
          draftPhoto = data;
          preview.src = data;
          syncPhotoState();
        })
        .catch(function (e) {
          console.error(e);
          toast("Foto gagal dibaca");
        });
    };

    input.click();
  };

  /* Kembali ke foto bawaan */
  removeButton.onclick = function () {
    draftPhoto = "";
    preview.src = defaultAvatar;
    syncPhotoState();
  };

  cancel.onclick = function () {
    modal.remove();
  };

  /* Simpan perubahan profil */
  saveProfile.onclick = function () {
    var name = nameInput.value.trim();

    if (!name) {
      toast("Nama tampilan tidak boleh kosong");
      nameInput.focus();
      return;
    }

    if (
      editorProfileWrite({
        name: name,
        photo: draftPhoto
      })
    ) {
      modal.remove();
      bar();
      toast("Profil berhasil disimpan");
    }
  };

  row.appendChild(cancel);
  row.appendChild(saveProfile);

  previewWrap.appendChild(preview);
  photoActions.appendChild(photoButton);
  photoActions.appendChild(removeButton);
  previewWrap.appendChild(photoActions);

  card.appendChild(title);
  card.appendChild(previewWrap);
  card.appendChild(nameLabel);
  card.appendChild(emailLabel);
  card.appendChild(help);
  card.appendChild(row);

  modal.appendChild(card);

  (document.querySelector("#adminUI") || document.body)
    .appendChild(modal);
}

/* =====================================================
   SIDEBAR EDITOR
   ===================================================== */

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

  h.type = "button";
  h.setAttribute("aria-label", "Menu edit");
  h.setAttribute("aria-expanded", "false");

  h.onclick = function () {
    var opened = p.classList.toggle("on");
    h.setAttribute("aria-expanded", String(opened));
  };

  /* Profil */
  var profile = editorProfileRead();
  var email = editorProfileEmail();

  var profileBox = el("div", "editor-profile");
  var avatar = el("img", "editor-avatar");
  var profileInfo = el("div", "editor-profile-info");

  var profileName = el(
    "div",
    "editor-profile-name",
    profile.name
  );

  var profileEmail = el(
    "div",
    "editor-profile-email",
    email || "Akun editor"
  );

  var editProfile = el(
    "button",
    "editor-profile-edit",
    "Edit profil"
  );

  avatar.alt = "Foto profil";
  avatar.src = profile.photo || editorProfileDefaultAvatar();

  editProfile.type = "button";
  editProfile.onclick = editorProfileEdit;

  profileInfo.appendChild(profileName);
  profileInfo.appendChild(profileEmail);
  profileInfo.appendChild(editProfile);

  profileBox.appendChild(avatar);
  profileBox.appendChild(profileInfo);

  /* Label menu */
  var heading = el("div", "menu-heading", "MENU UTAMA");
  var main = el("div", "editor-menu-main");

  /* Menu Teks */
  var t = el("button");
  t.type = "button";

  t.appendChild(
    editorProfileIcon("M4 20h4L19 9l-4-4L4 16z")
  );
  t.appendChild(document.createTextNode("Teks"));

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

  /* Menu Foto */
  var fb = el("button");
  fb.type = "button";

  fb.appendChild(
    editorProfileIcon(
      "M4 5h16v14H4z M4 16l5-5 4 4 3-3 4 4 M9 9h.01"
    )
  );
  fb.appendChild(document.createTextNode("Foto"));

  fb.onclick = function () {
    p.classList.remove("on");
    photoManager();
  };

  /* Menu Lagu */
  var lb = el("button");
  lb.type = "button";

  lb.appendChild(
    editorProfileIcon(
      "M9 18V6l10-2v12 M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
    )
  );
  lb.appendChild(document.createTextNode("Lagu"));

  lb.onclick = function () {
    p.classList.remove("on");
    songManager();
  };

  /* Menu Wishlist */
  var gb = el("button");
  gb.type = "button";

  gb.appendChild(
    editorProfileIcon(
      "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
    )
  );
  gb.appendChild(document.createTextNode("Wishlist"));

  gb.onclick = function () {
    p.classList.remove("on");
    dateManager();
  };

  /* Menu Simpan */
  var s = el("button", "pri");
  s.type = "button";
  s.id = "save";
  s.disabled = !dirty;

  s.appendChild(
    editorProfileIcon("M5 12.5l4.5 4.5L19 7.5")
  );
  s.appendChild(document.createTextNode("Simpan"));

  s.onclick = function () {
    p.classList.remove("on");
    save();
  };

  main.appendChild(t);
  main.appendChild(fb);
  main.appendChild(lb);
  main.appendChild(gb);
  main.appendChild(s);

  /* Keluar */
  var spacer = el("div", "editor-menu-spacer");
  var out = el("button", "editor-logout");

  out.type = "button";

  out.appendChild(
    editorProfileIcon(
      "M10 17l5-5-5-5 M15 12H3 M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
    )
  );
  out.appendChild(document.createTextNode("Keluar"));

  out.onclick = function () {
    p.classList.remove("on");

    if (confirm("Yakin ingin keluar dari akun edit?")) {
      logoutAdmin();
    }
  };

  /* Urutan sidebar */
  p.appendChild(profileBox);
  p.appendChild(heading);
  p.appendChild(main);
  p.appendChild(spacer);
  p.appendChild(out);

  b.appendChild(h);
  b.appendChild(p);
  u.appendChild(b);
}

/* =====================================================
   PENGELOLA FOTO DAN LAGU
   ===================================================== */

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
              D.photos.push({
                id: uid(),
                src: x
              });
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
      l.appendChild(
        el("p", "mlabel", "Belum ada lagu.")
      );
    }

    b.appendChild(l);

    var a = el("button", "pri", "＋ Tambah lagu");

    a.type = "button";
    a.onclick = function () {
      songForm();
    };

    b.appendChild(a);
  });
}

/* Form wishlist */
function dateForm(o) {
  var n = !o;

  o = o || {
    id: uid(),
    e: "",
    t: "",
    d: ""
  };

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
      l.appendChild(
        el("p", "mlabel", "Belum ada wishlist.")
      );
    }

    b.appendChild(l);

    if (D.dates.length < 6) {
      var a = el("button", "pri", "＋ Tambah wishlist");

      a.type = "button";
      a.onclick = function () {
        dateForm();
      };

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

    toast(
      "Data terlalu besar. Hapus beberapa foto lalu coba lagi."
    );

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
  if (
    !user ||
    !user.emailVerified ||
    !isAllowedEditor(user)
  ) {
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
