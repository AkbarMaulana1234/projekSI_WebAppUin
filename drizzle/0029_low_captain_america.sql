ALTER TABLE `lpg` ADD `uploaded_by` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `lpg` ADD `last_revised_by` bigint;--> statement-breakpoint
ALTER TABLE `lpg` ADD `approved_by` bigint;--> statement-breakpoint
ALTER TABLE `lpg` ADD `approved_at` timestamp;--> statement-breakpoint
ALTER TABLE `lpg` ADD CONSTRAINT `lpg_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lpg` ADD CONSTRAINT `lpg_last_revised_by_users_id_fk` FOREIGN KEY (`last_revised_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lpg` ADD CONSTRAINT `lpg_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lpg` DROP COLUMN `ormawa_notes`;