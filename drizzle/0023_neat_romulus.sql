CREATE TABLE `log_dokumentasi_tagihan` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`dokumentasi_id` bigint,
	`tagihan_id` bigint,
	`action` enum('review','approve','reject','pay') NOT NULL,
	`komentar` text NOT NULL,
	`user_id` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `log_dokumentasi_tagihan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` MODIFY COLUMN `status` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `dokumentasi_kegiatan` MODIFY COLUMN `status` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `log_dokumentasi_tagihan` ADD CONSTRAINT `log_dokumentasi_tagihan_dokumentasi_id_dokumentasi_kegiatan_id_fk` FOREIGN KEY (`dokumentasi_id`) REFERENCES `dokumentasi_kegiatan`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `log_dokumentasi_tagihan` ADD CONSTRAINT `log_dokumentasi_tagihan_tagihan_id_tagihan_pencairan_id_fk` FOREIGN KEY (`tagihan_id`) REFERENCES `tagihan_pencairan`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `log_dokumentasi_tagihan` ADD CONSTRAINT `log_dokumentasi_tagihan_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;