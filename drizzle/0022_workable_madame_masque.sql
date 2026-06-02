ALTER TABLE `ormawa` DROP FOREIGN KEY `ormawa_fakultas_id_program_studi_id_fk`;
--> statement-breakpoint
ALTER TABLE `ormawa` DROP FOREIGN KEY `ormawa_prodi_id_program_studi_id_fk`;
--> statement-breakpoint
ALTER TABLE `pengajuan_rab` MODIFY COLUMN `status` enum('draft','waiting_kaprodi','revisi_kaprodi','waiting_ppk','revisi_ppk','waiting_spi','ditolak_spi','revisi_spi','disetujui','lunas_ppk','selesai_spi') DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `ormawa` ADD CONSTRAINT `ormawa_fakultas_id_fakultas_id_fk` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ormawa` ADD CONSTRAINT `ormawa_prodi_id_program_studi_id_fk` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE set null ON UPDATE cascade;