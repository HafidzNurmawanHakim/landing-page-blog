CREATE TABLE `blog_post_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`ip` text NOT NULL,
	`type` text DEFAULT 'like' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_blog_reactions_post_ip_type` ON `blog_post_reactions` (`post_id`,`ip`,`type`);--> statement-breakpoint
CREATE INDEX `idx_blog_reactions_post_type` ON `blog_post_reactions` (`post_id`,`type`);--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `like_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `share_count` integer DEFAULT 0 NOT NULL;