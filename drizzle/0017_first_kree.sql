ALTER TABLE `tagihan_pencairan` MODIFY COLUMN `sk_nomor` varchar(255);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` MODIFY COLUMN `rekening_penerima` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `spmt_nomor` varchar(255);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `spmt_file_url` text;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `amprah_nomor` varchar(255);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `amprah_file_url` text;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `npwp_nomor` varchar(255);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `npwp_file_url` text;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `ktp_nomor` varchar(255);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `ktp_file_url` text;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `buku_rekening_file_url` text;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `foto_barang_url` text;