CREATE TABLE `weights` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_weights_user_date` ON `weights` (`user_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_weights_user_date` ON `weights` (`user_id`,`date`);