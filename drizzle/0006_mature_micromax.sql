CREATE TABLE `approval_log` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`pengajuan_rab_id` bigint NOT NULL,
	`actor_id` bigint NOT NULL,
	`role_actor` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`catatan_revisi` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`table_name` varchar(100),
	`record_id` bigint,
	`action` varchar(20),
	`old_data` json,
	`new_data` json,
	`user_id` bigint,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dokumentasi_kegiatan` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`kegiatan_id` bigint NOT NULL,
	`tipe_dokumen` varchar(50) NOT NULL,
	`deskripsi` text,
	`file_url` text NOT NULL,
	`uploaded_by` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dokumentasi_kegiatan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fakultas` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`kode` varchar(50) NOT NULL,
	CONSTRAINT `fakultas_id` PRIMARY KEY(`id`),
	CONSTRAINT `fakultas_kode_unique` UNIQUE(`kode`)
);
--> statement-breakpoint
CREATE TABLE `kegiatan` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`pengajuan_rab_id` bigint NOT NULL,
	`status_kegiatan` varchar(50) DEFAULT 'BELUM_DILAKSANAKAN',
	`tanggal_mulai` date,
	`tanggal_selesai` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kegiatan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lpg` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`kegiatan_id` bigint NOT NULL,
	`file_lpg_url` text NOT NULL,
	`status_lpg` varchar(50) DEFAULT 'WAITING_SPI',
	`spi_notes` text,
	`ormawa_notes` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`archived_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lpg_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ormawa` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`kode` varchar(50) NOT NULL,
	`prodi_id` bigint NOT NULL,
	CONSTRAINT `ormawa_id` PRIMARY KEY(`id`),
	CONSTRAINT `ormawa_kode_unique` UNIQUE(`kode`)
);
--> statement-breakpoint
CREATE TABLE `pembayaran` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`tagihan_id` bigint NOT NULL,
	`ppk_id` bigint NOT NULL,
	`bukti_transfer_url` text NOT NULL,
	`tanggal_pembayaran` timestamp NOT NULL DEFAULT (now()),
	`catatan_pembayaran` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pembayaran_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program_studi` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`kode` varchar(50) NOT NULL,
	`fakultas_id` bigint NOT NULL,
	CONSTRAINT `program_studi_id` PRIMARY KEY(`id`),
	CONSTRAINT `program_studi_kode_unique` UNIQUE(`kode`)
);
--> statement-breakpoint
CREATE TABLE `revisi_lpg_log` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`lpg_id` bigint NOT NULL,
	`requester_id` bigint NOT NULL,
	`catatan_revisi` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revisi_lpg_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tagihan_pencairan` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`kegiatan_id` bigint NOT NULL,
	`tipe_tagihan` varchar(50) NOT NULL,
	`sk_nomor` varchar(100),
	`sk_file_url` text,
	`nama_penerima` varchar(255) NOT NULL,
	`rekening_penerima` varchar(100) NOT NULL,
	`bank_penerima` varchar(100),
	`nominal` decimal(15,2) NOT NULL,
	`toko_nama` varchar(255),
	`toko_alamat` text,
	`struk_file_url` text,
	`status_tagihan` varchar(50) DEFAULT 'WAITING_PEMBAYARAN',
	`created_by` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tagihan_pencairan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`users_id` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`role` enum('ormawa','kaprodi','ppk','spi'),
	`prodi_id` bigint,
	`ormawa_id` bigint,
	`fakultas_id` bigint,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_users_id_unique` UNIQUE(`users_id`)
);
--> statement-breakpoint
DROP TABLE `kaprodi_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `approval_log` ADD CONSTRAINT `approval_log_pengajuan_rab_id_pengajuanRab_table_id_fk` FOREIGN KEY (`pengajuan_rab_id`) REFERENCES `pengajuanRab_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_log` ADD CONSTRAINT `approval_log_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` ADD CONSTRAINT `dokumentasi_kegiatan_kegiatan_id_kegiatan_id_fk` FOREIGN KEY (`kegiatan_id`) REFERENCES `kegiatan`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` ADD CONSTRAINT `dokumentasi_kegiatan_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_pengajuan_rab_id_pengajuanRab_table_id_fk` FOREIGN KEY (`pengajuan_rab_id`) REFERENCES `pengajuanRab_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lpg` ADD CONSTRAINT `lpg_kegiatan_id_kegiatan_id_fk` FOREIGN KEY (`kegiatan_id`) REFERENCES `kegiatan`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ormawa` ADD CONSTRAINT `ormawa_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_tagihan_id_tagihan_pencairan_id_fk` FOREIGN KEY (`tagihan_id`) REFERENCES `tagihan_pencairan`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_ppk_id_users_id_fk` FOREIGN KEY (`ppk_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `program_studi` ADD CONSTRAINT `program_studi_fakultas_id_fakultas_id_fk` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `revisi_lpg_log` ADD CONSTRAINT `revisi_lpg_log_lpg_id_lpg_id_fk` FOREIGN KEY (`lpg_id`) REFERENCES `lpg`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revisi_lpg_log` ADD CONSTRAINT `revisi_lpg_log_requester_id_users_id_fk` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD CONSTRAINT `tagihan_pencairan_kegiatan_id_kegiatan_id_fk` FOREIGN KEY (`kegiatan_id`) REFERENCES `kegiatan`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD CONSTRAINT `tagihan_pencairan_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_ormawa_id_ormawa_id_fk` FOREIGN KEY (`ormawa_id`) REFERENCES `ormawa`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_fakultas_id_fakultas_id_fk` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengajuanRab_table` ADD CONSTRAINT `pengajuanRab_table_ormawa_users_users_id_fk` FOREIGN KEY (`ormawa`) REFERENCES `users`(`users_id`) ON DELETE set null ON UPDATE no action;