ALTER TABLE `dokumentasi_kegiatan` ADD `fakultas_Id` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` ADD `prodi_id` varchar(50);--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD `fakultas_Id` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD `prodi_id` varchar(50);--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `fakultas_Id` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD `prodi_id` varchar(50);--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` ADD CONSTRAINT `dokumentasi_kegiatan_fakultas_Id_fakultas_id_fk` FOREIGN KEY (`fakultas_Id`) REFERENCES `fakultas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` ADD CONSTRAINT `dokumentasi_kegiatan_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD CONSTRAINT `pengajuan_rab_fakultas_Id_fakultas_id_fk` FOREIGN KEY (`fakultas_Id`) REFERENCES `fakultas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD CONSTRAINT `pengajuan_rab_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD CONSTRAINT `tagihan_pencairan_fakultas_Id_fakultas_id_fk` FOREIGN KEY (`fakultas_Id`) REFERENCES `fakultas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tagihan_pencairan` ADD CONSTRAINT `tagihan_pencairan_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE no action ON UPDATE no action;