# 🏫 SiHadir SD - Presensi Siswa Real-Time & Laporan Bulanan Otomatis

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

Aplikasi web responsif yang dirancang khusus untuk guru sekolah dasar (SD) di Indonesia guna memantau kehadiran siswa secara *real-time*, memindai barcode/QR kartu pelajar melalui kamera gawai/laptop, membuat laporan bulanan otomatis siap cetak A4 ber-Kop Surat resmi, serta menyediakan portal khusus untuk wali murid memantau kedisiplinan dan mengajukan surat izin ananda.

---

## ✨ Fitur Utama

### 1. 📷 Pemindai Barcode / QR Kamera Real-Time
- Pemindaian instan dengan kamera depan atau belakang (didukung oleh `html5-qrcode`).
- Dilengkapi efek suara chime (*Web Audio API*) dan animasi konfeti saat presensi berhasil dicatat.
- Otomatis menghitung status **Hadir Tepat Waktu** vs **Terlambat** berdasarkan batas jam masuk sekolah (misal: 07:15 WIB).
- Dilengkapi simulator tombol 1-klik dan input NISN/barcode manual bagi sekolah yang menggunakan barcode scanner gun USB.

### 2. 👨‍🏫 Dashboard Guru Kelas
- **Statistik Harian**: Menampilkan jumlah siswa hadir, terlambat, sakit, izin, alpa, dan persentase kehadiran harian.
- **Tabel Presensi Harian**: Pengubahan status instan (H/T/S/I/A), pencatatan jam masuk, dan pengeditan catatan guru.
- **✏️ Edit Nama Siswa**: Kemudahan mengubah nama siswa langsung dari tabel harian, rekap bulanan, maupun master data siswa.
- **Notifikasi WhatsApp Wali**: Tombol 1-klik untuk mengirim pesan pemberitahuan kehadiran langsung ke nomor WhatsApp orang tua siswa.
- **Persetujuan Surat Izin**: Verifikasi permohonan izin/sakit yang diajukan wali murid secara daring yang langsung tersinkron ke daftar presensi.

### 3. 📄 Laporan Rekap Bulanan Otomatis Siap Cetak
- Matriks kehadiran 30/31 hari dengan kode warna dan legenda resmi.
- Rekapitulasi jumlah hadir, terlambat, sakit, izin, alpa, dan persentase kehadiran bulanan per siswa.
- Pratinjau cetak resmi A4 *Landscape* ber-Kop Surat Dinas Pendidikan/Sekolah lengkap dengan kolom tanda tangan Kepala Sekolah dan Guru Kelas.
- Ekspor data laporan ke format **CSV / Excel**.

### 4. 🪪 Cetak Kartu Pelajar Barcode (ID Card Siswa)
- Lembar cetak kartu identitas siswa dengan barcode/QR code individual.
- Siap digunting dan dimasukkan ke dalam plastik tali lanyard untuk dipakai siswa ke sekolah.

### 5. 👨‍👩‍👧 Portal Khusus Orang Tua / Wali Murid
- Mengetahui status kehadiran ananda secara *real-time* (apakah sudah tiba di sekolah dan jam berapa scan barcode dilakukan).
- Kalender riwayat kehadiran ananda selama sebulan penuh.
- Formulir pengajuan surat izin / sakit ananda langsung kepada guru kelas.
- Tombol konsultasi WhatsApp langsung ke Wali Kelas.

### 6. ⚙️ Manajemen Data Profil & Penyimpanan Lokal
- **Profil Sekolah**: Nama sekolah, NPSN, alamat, nama & NIP kepala sekolah, batas jam masuk.
- **Profil Guru**: Nama lengkap & gelar, NIP, NUPTK, kelas binaan, kontak WhatsApp & email belajar.id.
- **Data Siswa**: Tambah siswa baru, edit nama dan biodata, kelola NISN dan nomor kontak wali murid.
- Tersimpan aman di peramban pengguna (*browser LocalStorage*).

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm / yarn / pnpm

### Langkah Instalasi
1. Clone repositori ini atau unduh berkas ZIP:
   ```bash
   git clone https://github.com/USERNAME_ANDA/sihadir-sd.git
   cd sihadir-sd
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

4. Buka peramban pada alamat:
   ```
   http://localhost:3000
   ```

5. Untuk melakukan build produksi:
   ```bash
   npm run build
   ```

---

## 📤 Cara Mempublikasikan ke Akun GitHub Anda

Jika Anda ingin menyimpan kode ini di akun GitHub Anda:

1. Buat repositori baru di [GitHub](https://github.com/new):
   - Beri nama repositori, contoh: `sihadir-sd`
   - Pilih **Public** atau **Private**
   - Jangan centang "Initialize this repository with a README" (karena berkas README sudah ada)

2. Buka terminal di folder proyek ini dan jalankan perintah berikut:
   ```bash
   # 1. Inisialisasi git jika belum ada
   git init -b main

   # 2. Tambahkan semua berkas ke git
   git add .

   # 3. Lakukan commit pertama
   git commit -m "feat: inisialisasi aplikasi SiHadir SD"

   # 4. Hubungkan ke repositori GitHub Anda (ganti URL dengan URL GitHub Anda)
   git remote add origin https://github.com/USERNAME_ANDA/sihadir-sd.git

   # 5. Dorong kode ke GitHub
   git push -u origin main
   ```

---

## 🌐 Cara Deploy / Hosting Gratis

Aplikasi ini adalah Single Page Application (SPA) berbasis Vite + React, sehingga dapat di-hosting secara gratis di:
- **Vercel**: Cukup impor repositori GitHub Anda di [vercel.com](https://vercel.com) (otomatis mendeteksi Vite).
- **Netlify**: Impor repositori GitHub di [netlify.com](https://netlify.com) dengan build command `npm run build` dan publish directory `dist`.
- **GitHub Pages**: Dapat menggunakan workflow GitHub Actions yang sudah disediakan di repositori ini.

---

## 📂 Struktur Berkas Proyek

```
├── .github/workflows/       # Workflow deployment otomatis ke GitHub Pages
├── src/
│   ├── components/
│   │   ├── BarcodeScannerModal.tsx   # Pemindai barcode/QR kamera & simulator
│   │   ├── Navbar.tsx                # Navigasi atas, jam real-time & role switcher
│   │   ├── ParentDashboard.tsx       # Tampilan portal wali murid & kalender
│   │   ├── PrintReportModal.tsx      # Lembar cetak laporan bulanan resmi A4
│   │   ├── StudentCardsPrintModal.tsx# Lembar cetak kartu identitas barcode siswa
│   │   └── TeacherDashboard.tsx      # Dashboard guru, tabel presensi & edit nama
│   ├── types/
│   │   └── index.ts                  # Definisi TypeScript data sekolah, guru & siswa
│   ├── utils/
│   │   ├── attendance.ts             # Logika perhitungan presensi & format pesan WA
│   │   ├── attendance.test.ts        # Unit test logika presensi
│   │   ├── mockData.ts               # Data awal realistis SD Negeri
│   │   ├── sound.ts                  # Efek suara Web Audio API
│   │   └── storage.ts                # Penyimpanan lokal (LocalStorage)
│   ├── App.tsx                       # Komponen utama aplikasi
│   ├── index.css                     # Gaya Tailwind CSS & media print
│   └── main.tsx                      # Entry point React
├── index.html                        # Templat HTML
├── package.json
└── vite.config.ts
```

---

## 📜 Lisensi & Pengembang

Dibuat untuk memajukan digitalisasi pendidikan sekolah dasar di Indonesia.
Didistribusikan di bawah lisensi [Apache 2.0](LICENSE).
Dikembangkan untuk Guru SD Indonesia (@guru.sd.belajar.id).
