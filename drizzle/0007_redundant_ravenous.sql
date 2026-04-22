ALTER TABLE `approval_log` MODIFY COLUMN `pengajuan_rab_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `ormawa` ADD `totalAnggaran` bigint DEFAULT 0 NOT NULL;