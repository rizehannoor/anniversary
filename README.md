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

Menu ☰ di kiri atas berisi **Teks**, **Foto**, **Lagu**, dan **Simpan**. Halaman Journey dan Playlist tetap bersih,
persis seperti yang dilihat pacarmu.

- **Foto:** jendela berisi foto di samping surat (bingkai emas, halaman Moment) dan semua polaroid. Tiap foto punya tombol **Ganti** dan **Hapus**
  (hapus perlu dua ketukan), plus kotak **＋** untuk menambah (maksimal 12).
- **Lagu:** daftar lagu dengan tombol ✎ (edit) dan ✕ (hapus, dua ketukan), plus **＋ Tambah lagu**.
- **Wishlist:** wishlist jalan minggu ini di halaman Gift (maksimal 6): emoji, judul, dan keterangan. Setelah bintang 🌠 diketuk, pacarmu memilih salah satu, menentukan tanggalnya, lalu bisa menyimpannya ke kalender dan menekan **Kabari** untuk membagikan pilihannya ke kamu.
- **Teks:** nama, tanggal jadian, isi surat, dan kupon.

Menu ini muncul otomatis saat web dibuka di komputermu sendiri: klik dua kali `index.html`, Live Server, `localhost`,
atau lewat Wi-Fi rumah. Setelah online (Netlify, GitHub Pages), pengunjung tidak melihatnya.

- `?edit` di ujung alamat memaksa menu edit muncul, di mana pun web dibuka.
- `?view` menyembunyikan menu edit, untuk melihat tampilan seperti yang dilihat pacarmu.
- `?reset` menghapus perubahan yang tersimpan di browser.

Tekan **Simpan** setelah mengubah. Catatan penting: perubahan dari mode edit **disimpan di browser perangkat itu saja**
(localStorage), jadi pacarmu tidak akan melihatnya di HP-nya. Supaya dilihat semua orang, pindahkan hasilnya ke
`data/content.js` lalu deploy ulang.

## Mengubah isi web yang sudah online (tombol Terbitkan)

Buka web online dengan `?edit` di ujung alamat, misalnya `https://rizehannoor.github.io/our-anniversary/?edit`.
Ubah foto, lagu, wishlist, atau teks lewat menu ☰, lalu pilih **Terbitkan**. Foto dan isi web dikirim ke repository GitHub,
dan web online ikut berubah dalam 1 sampai 10 menit. Pacarmu tidak melihat menu ☰ kalau tidak memakai `?edit`.

**Membuat token (sekali saja):**
1. Buka github.com, klik foto profil, **Settings**, **Developer settings**, **Personal access tokens**, **Fine-grained tokens**, lalu **Generate new token**.
2. Isi nama (misalnya `web-anniversary`) dan pilih masa berlaku.
3. **Repository access:** *Only select repositories*, lalu pilih `our-anniversary`.
4. **Permissions > Repository permissions > Contents:** pilih **Read and write**.
5. Klik **Generate token**, salin tulisan yang diawali `github_pat_`, lalu tempel saat tombol Terbitkan menanyakannya.

Token disimpan hanya di browser itu. Jangan dibagikan ke siapa pun. Kalau hilang atau bocor, hapus di GitHub lalu buat yang baru.

**Penting:** setelah Terbitkan, repository di GitHub lebih baru daripada folder di komputermu. Sebelum `git push` dari komputer, jalankan `git pull` dulu.
Foto yang dihapus dari web tidak otomatis terhapus dari folder `assets/photos` di GitHub (tidak berbahaya).

## Responsif

Tata letak memakai ukuran fleksibel (`clamp`, `min`, `flex`, `grid`), area aman untuk notch HP,
dan satu aturan khusus layar kecil di `css/responsive.css`. Cek lewat DevTools di browser (Ctrl+Shift+M).

## Online (gratis)

- **Netlify:** drag-and-drop folder `our-anniversary` di app.netlify.com/drop.
- **GitHub Pages:** upload ke repo, lalu Settings, Pages, branch `main`.

## Video YouTube tidak muncul (Error 153)?

YouTube hanya mau memutar video di dalam halaman yang punya alamat web sungguhan. Kalau `index.html` dibuka dengan
klik dua kali (alamatnya `file:///...`), pemutar menampilkan "Video player configuration error, Error 153".
Jalankan lewat server: `python -m http.server 8000`, lalu buka `http://localhost:8000`. Setelah online
(Netlify, GitHub Pages) juga otomatis berfungsi. Kalau web dibuka lewat `file://`, halaman Playlist menampilkan
kartu thumbnail yang membuka video di YouTube. Beberapa video juga melarang disematkan, dan itu tidak bisa diakali.


## Edit website berdua (Firebase)

Versi ini menyiapkan login dan sinkronisasi bersama menggunakan Firebase Authentication + Cloud Firestore. Sebelum dipublikasikan, konfigurasi Firebase wajib dilengkapi.

### Setup sekali saja

1. Buka https://console.firebase.google.com/ lalu buat project Firebase.
2. Di **Authentication > Sign-in method**, aktifkan **Email/Password**.
3. Di **Authentication > Settings > Authorized domains**, tambahkan domain GitHub Pages kamu (contoh `rizehannoor.github.io`).
4. Di **Project settings > Your apps**, buat aplikasi Web dan salin konfigurasi ke `js/firebase-config.js`. Ganti `ISI_API_KEY`, `ISI_PROJECT_ID`, dan `ISI_APP_ID` dengan nilai dari Firebase.
5. Di **Firestore Database**, buat database.
6. Buka `firestore.rules`, ganti `EMAIL_KAMU` dan `EMAIL_PACAR` dengan dua email yang benar. Terapkan rules itu melalui tab Rules di Firebase Console. Samakan dua email tersebut dengan daftar `EDITORS` di `js/firebase-config.js`.
7. Kedua orang mendaftar dari halaman login dengan email yang sama persis seperti daftar izin. Klik tautan verifikasi email yang Firebase kirim, lalu login lagi.
8. Commit dan push seluruh perubahan ke repository GitHub Pages.

### Penting untuk keamanan

- Jangan pernah menonaktifkan Firestore Security Rules atau memakai aturan `allow read, write: if true`.
- Hanya dua email yang ditulis di rules boleh membaca dan mengubah data bersama. Akun lain yang mendaftar tidak mendapat izin.
- `apiKey` pada konfigurasi web Firebase bukan password admin. Keamanan data bergantung pada Authentication dan Firestore Security Rules.
- Foto yang ditambahkan lewat editor disimpan sebagai data gambar di Firestore. Karena itu, jangan unggah foto terlalu banyak/besar; editor mengecilkan foto sebelum disimpan, tetapi batas ukuran dokumen Firestore tetap berlaku.
- GitHub Pages hanya menayangkan website; data yang kalian edit tersimpan di Firestore.
- Untuk proyek baru, uji dulu dengan dua akun dan dua perangkat sebelum mengandalkan website ini sebagai satu-satunya salinan data.

### Jika ingin edit lokal

Mode lokal tetap menyimpan perubahan di browser perangkat tersebut. Sinkronisasi bersama berlaku setelah Firebase dikonfigurasi dan website dibuka secara online.
