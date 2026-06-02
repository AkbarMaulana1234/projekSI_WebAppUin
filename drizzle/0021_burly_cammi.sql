ALTER TABLE `ormawa` MODIFY COLUMN `prodi_id` bigint;--> statement-breakpoint
ALTER TABLE `ormawa` ADD `fakultas_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `ormawa` ADD CONSTRAINT `ormawa_fakultas_id_program_studi_id_fk` FOREIGN KEY (`fakultas_id`) REFERENCES `program_studi`(`id`) ON DELETE restrict ON UPDATE cascade;