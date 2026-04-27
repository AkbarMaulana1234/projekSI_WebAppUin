ALTER TABLE `approval_log` MODIFY COLUMN `catatan_revisi` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD `file_tor_url` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD `tanggal_mulai` date;--> statement-breakpoint
ALTER TABLE `pengajuan_rab` ADD `tanggal_selesai` date;