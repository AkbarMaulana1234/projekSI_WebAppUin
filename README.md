# projekSI_WebAppUin

**Sistem Informasi Pengelolaan Keuangan ORMAWA** berbasis **Nuxt.js + Vue + Drizzle ORM** dan **Supabase**.  
Aplikasi ini mengelola alur pengajuan proposal kegiatan ORMAWA mulai dari pembuatan proposal/TOR/RAB, persetujuan berjenjang (Kaprodi → PPK → SPI) dengan mekanisme revisi/penolakan (looping), pelaksanaan kegiatan, pencairan dana dengan verifikasi persyaratan oleh PPK, hingga pengumpulan LPJ sebagai arsip.

## 📌 Deskripsi
ORMAWA mengajukan proposal kegiatan beserta TOR dan RAB. Proposal melalui proses persetujuan:
1. **Kaprodi** – menyetujui/menolak/revisi
2. **PPK** – menyetujui/menolak/revisi
3. **SPI** – menyetujui/menolak/revisi

Jika salah satu pihak menolak atau meminta revisi, proposal dikembalikan (looping) ke ORMAWA untuk diperbaiki.  
Setelah proposal di-ACC oleh SPI, kegiatan boleh dilaksanakan.  
Kemudian ORMAWA mengajukan pencairan dana dengan melengkapi persyaratan. PPK mengecek kelengkapan persyaratan; jika lengkap, dana dicairkan.  
Setelah pencairan, ORMAWA wajib mengumpulkan **LPJ** (Laporan Pertanggungjawaban) sebagai arsip bukti kegiatan terlaksana dan dana telah cair.

## 🚀 Fitur
- **Multi-role authentication** (ORMawa, Kaprodi, PPK, SPI) menggunakan Supabase Auth
- **Dashboard role-based** dengan notifikasi status proposal/pencairan
- **Pengajuan proposal** (unggah file TOR, RAB, deskripsi kegiatan)
- **Alur persetujuan berjenjang** dengan status:  
  *Menunggu ACC Kaprodi → Revisi (looping) → Menunggu ACC PPK → Menunggu ACC SPI → ACC → Ditolak*
- **Manajemen revisi** – setiap penolakan disertai catatan revisi
- **Pencairan dana** – ORMAWA upload persyaratan (KTP, NPWP, dll.), PPK verifikasi kelengkapan
- **Pencatatan LPJ** – upload file LPJ setelah pencairan, tersimpan sebagai arsip
- **Riwayat lengkap** – proposal, pencairan, LPJ
- **Responsive UI** – Vue 3 + Tailwind CSS / Bootstrap

## 🛠 Teknologi
- **Frontend**: Nuxt.js 3 (Vue 3, Composition API, SSR/CSR)
- **Backend/API**: Nuxt Nitro server routes (server/api)
- **Database & ORM**: Supabase (MySQL) + **Drizzle ORM**
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS / Bootstrap 5
- **State Management**: Pinia (opsional)

## 👩‍💻 Developer
- Akbar Maulana
- Hafis Syaifullah
- Nindya Dwi Putri

## 📌 Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- Akun Supabase (buat project baru, dapatkan `URL` dan `anon key` / `service role key`)

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/username/projekSI_WebAppUin.git
   cd projekSI_WebAppUin
