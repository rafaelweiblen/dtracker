CREATE TABLE `weight_goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`target_kg` real NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
