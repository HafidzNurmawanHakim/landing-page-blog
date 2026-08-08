CREATE TABLE `gallery_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gallery_id` integer NOT NULL,
	`ip` text NOT NULL,
	`type` text DEFAULT 'like' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_gallery_reactions_gallery_ip_type` ON `gallery_reactions` (`gallery_id`,`ip`,`type`);--> statement-breakpoint
CREATE INDEX `idx_gallery_reactions_gallery_type` ON `gallery_reactions` (`gallery_id`,`type`);--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `like_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `share_count` integer DEFAULT 0 NOT NULL;