ALTER TABLE `pengajuanRab_table` DROP FOREIGN KEY `pengajuanRab_table_ormawa_users_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `pengajuanRab_table` ADD CONSTRAINT `pengajuanRab_table_ormawa_users_users_id_fk` FOREIGN KEY (`ormawa`) REFERENCES `users`(`users_id`) ON DELETE no action ON UPDATE no action;