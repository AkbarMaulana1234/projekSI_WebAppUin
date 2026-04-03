ALTER TABLE `users_table` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `name_lengkap` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `password` varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `jabatan` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `role` enum('kaprodi','ormawa') NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `age`;