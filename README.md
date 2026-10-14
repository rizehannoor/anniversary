# our-anniversary 💌

Website kejutan hari jadian: amplop pembuka, pilihan kejutan (Journey, Moment, Playlist, Gift),
tema hitam, plum, dan magenta. HTML, CSS, dan JavaScript biasa, tanpa framework dan tanpa build.

## Cara menjalankan

**Paling mudah (VS Code):**
1. Buka folder `our-anniversary` di VS Code (File, Open Folder).
2. Pasang ekstensi **Live Server** (Ritwick Dey).
3. Klik kanan `index.html`, lalu pilih **Open with Live Server**.

Bisa juga langsung klik dua kali `index.html`, karena tidak butuh server.
Butuh internet untuk memuat font Google dan video YouTube.

## Struktur

```
our-anniversary/
├── index.html           kerangka halaman dan urutan file yang dimuat
├── data/content.js      ISI WEBSITE: nama, tanggal jadian, surat, kupon, foto, lagu
├── assets/
│   ├── photos/          foto-foto (photo-1.jpg ... photo-8.jpg)
│   └── icons/favicon.svg
├── css/
│   ├── base.css         warna, font, reset, layar, tombol BACK, hati melayang
│   ├── envelope.css     amplop dan segel
│   ├── menu.css         Choose the Surprise
│   ├── journey.css      polaroid
│   ├── moment.css       surat, perangko, bingkai foto, hitungan waktu
│   ├── playlist.css     pemutar YouTube dan daftar lagu
│   ├── gift.css         hadiah dan kupon
│   ├── admin.css        menu edit (☰), form, tombol tambah/hapus
│   └── responsive.css   aturan layar kecil
└── js/
    ├── config.js        kunci penyimpanan dan nama parameter URL
    ├── utils.js         fungsi bantu ($, el, toast, go)
    ├── store.js         memuat dan menyimpan data
    ├── envelope.js      membuka amplop
    ├── admin.js         mode edit (foto, lagu, teks)
    ├── journey.js       halaman Journey
    ├── moment.js        halaman Moment
    ├── playlist.js      halaman Playlist (pemutar YouTube)
    ├── gift.js          halaman Gift
    └── main.js          render, navigasi, hati melayang (dimuat paling akhir)
```

Urutan file di `index.html` penting, jadi jangan diubah-ubah.

## Mengganti isi

Cara paling aman dan terlihat oleh semua orang: edit **`data/content.js`**.

- **Nama, tanggal jadian, surat, kupon:** ubah `her`, `him`, `since`, `letter`, `gift`.
  Format tanggal: `"2026-09-28T00:00"`.
- **Foto:** taruh file di `assets/photos/`, lalu tulis di `photos`, misalnya
  `{ "id": "p9", "src": "assets/photos/foto-baru.jpg" }`. Maksimal 12 foto. Foto bingkai emas diatur di `portrait`.
- **Lagu:** tambah di `songs`: `{ "id": "s3", "t": "Judul", "a": "Artis", "u": "https://youtu.be/xxxxxxxxxxx" }`.
  `u` boleh dikosongkan, nanti hanya membuka pencarian YouTube.

## Mode edit di browser

Buka `index.html?edit` untuk memunculkan menu ☰ di kiri atas. Dari situ kamu bisa menambah, mengganti,
dan menghapus foto dan lagu, serta mengubah teks. Tekan **Simpan** setelah mengubah.

Catatan penting: perubahan dari mode edit **disimpan di browser perangkat itu saja** (localStorage),
jadi pacarmu tidak akan melihatnya di HP-nya. Supaya dilihat semua orang, pindahkan hasilnya ke `data/content.js`
lalu deploy ulang. Untuk menghapus perubahan lokal, buka `index.html?reset`.

## Responsif

Tata letak memakai ukuran fleksibel (`clamp`, `min`, `flex`, `grid`), area aman untuk notch HP,
dan satu aturan khusus layar kecil di `css/responsive.css`. Cek lewat DevTools di browser (Ctrl+Shift+M).

## Online (gratis)

- **Netlify:** drag-and-drop folder `our-anniversary` di app.netlify.com/drop.
- **GitHub Pages:** upload ke repo, lalu Settings, Pages, branch `main`.
