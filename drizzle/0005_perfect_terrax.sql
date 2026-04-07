CREATE TABLE `kaprodi_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama_prodi` varchar(100) NOT NULL,
	`kode_prodi` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `kaprodi_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pengajuanRab_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomor_pengajuan` varchar(100) NOT NULL,
	`ormawa` int NOT NULL,
	`judul_kegiatan` varchar(500) NOT NULL,
	`deskripsi` text,
	`file_rab` text NOT NULL,
	`total_anggaran` varchar(50) NOT NULL,
	`status` varchar(50) DEFAULT 'draft',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `pengajuanRab_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users_table` ADD `prodi_id` int;--> statement-breakpoint
ALTER TABLE `users_table` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users_table` ADD `updated_at` timestamp DEFAULT (now());