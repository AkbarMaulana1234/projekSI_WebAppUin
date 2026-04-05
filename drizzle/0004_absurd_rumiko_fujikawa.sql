ALTER TABLE `users_table` MODIFY COLUMN `id_users` varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` MODIFY COLUMN `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` MODIFY COLUMN `jabatan` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD CONSTRAINT `users_table_id_users_unique` UNIQUE(`id_users`);