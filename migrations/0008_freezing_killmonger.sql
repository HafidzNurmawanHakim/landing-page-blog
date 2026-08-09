CREATE TABLE `blog_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`content_type` text DEFAULT 'html' NOT NULL,
	`featured_image_url` text,
	`featured_image_alt` text,
	`category_id` integer,
	`tags` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`seo_title` text,
	`seo_description` text,
	`og_image_url` text,
	`canonical_url` text,
	`noindex` integer DEFAULT 0 NOT NULL,
	`author_id` integer,
	`reading_time` integer DEFAULT 1 NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_blog_posts_status_published` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_blog_posts_category` ON `blog_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_blog_posts_created_at` ON `blog_posts` (`created_at`);