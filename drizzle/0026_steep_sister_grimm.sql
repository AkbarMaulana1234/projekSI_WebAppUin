ALTER TABLE `tagihan_pencairan` MODIFY COLUMN `status_tagihan` enum('WAITING_PEMBAYARAN','TERVERIFIKASI','DIKEMBALIKAN','SELESAI','DITOLAK') DEFAULT 'WAITING_PEMBAYARAN';--> statement-breakpoint
ALTER TABLE `kegiatan` ADD `isi_catatan` text NOT NULL;--> statement-breakpoint
ALTER TABLE `kegiatan` ADD `tipe` enum('kelengkapan','revisi','informasi') DEFAULT 'informasi';