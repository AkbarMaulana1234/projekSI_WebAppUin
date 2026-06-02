ALTER TABLE `dokumentasi_kegiatan` MODIFY COLUMN `tipe_dokumen` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` MODIFY COLUMN `deskripsi` text;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nama_toko`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nomor_rekening_toko`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nama_pemilik_rekening_toko`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `foto_barang_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `struk_belanja_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nama_penyedia_jasa`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nomor_rekening_jasa`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `nama_pemilik_rekening_jasa`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `sk_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `spmt_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `amprah_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `npwp_url`;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` DROP COLUMN `ktp_url`;