CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`comment` text NOT NULL,
	`rating` real DEFAULT 5 NOT NULL,
	`avatar_url` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `idx_testimonials_active_sort` ON `testimonials` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_testimonials_created_at` ON `testimonials` (`created_at`);