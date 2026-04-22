RENAME TABLE `pengajuanRab_table` TO `pengajuan_rab`;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` RENAME COLUMN `ormawa` TO `users_id`;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` RENAME COLUMN `file_rab` TO `file_rab_url`;--> statement-breakpoint
ALTER TABLE `approval_log` DROP FOREIGN KEY `approval_log_pengajuan_rab_id_pengajuanRab_table_id_fk`;
--> statement-breakpoint
ALTER TABLE `kegiatan` DROP FOREIGN KEY `kegiatan_pengajuan_rab_id_pengajuanRab_table_id_fk`;
--> statement-breakpoint
ALTER TABLE `pengajuan_rab` DROP FOREIGN KEY `pengajuanRab_table_ormawa_users_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `pengajuan_rab` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` MODIFY COLUMN `users_id` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` MODIFY COLUMN `total_anggaran` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` MODIFY COLUMN `status` enum('draft','waiting_kaprodi','revisi_kaprodi','waiting_ppk','revisi_ppk','waiting_spi','ditolak_spi','disetujui') DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD CONSTRAINT `pengajuan_rab_nomor_pengajuan_unique` UNIQUE(`nomor_pengajuan`);--> statement-breakpoint
ALTER TABLE `approval_log` ADD CONSTRAINT `approval_log_pengajuan_rab_id_pengajuan_rab_id_fk` FOREIGN KEY (`pengajuan_rab_id`) REFERENCES `pengajuan_rab`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_pengajuan_rab_id_pengajuan_rab_id_fk` FOREIGN KEY (`pengajuan_rab_id`) REFERENCES `pengajuan_rab`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD CONSTRAINT `pengajuan_rab_users_id_users_users_id_fk` FOREIGN KEY (`users_id`) REFERENCES `users`(`users_id`) ON DELETE no action ON UPDATE no action;