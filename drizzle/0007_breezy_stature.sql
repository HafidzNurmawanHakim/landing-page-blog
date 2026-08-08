CREATE TABLE `transport_extra_charges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'SGD' NOT NULL,
	`unit` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `transport_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_transport_extra_product` ON `transport_extra_charges` (`product_id`);--> statement-breakpoint
CREATE TABLE `transport_pricing_packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`duration_hours` integer,
	`covered_areas` text DEFAULT '[]' NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'SGD' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `transport_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_transport_pricing_product` ON `transport_pricing_packages` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_transport_pricing_price` ON `transport_pricing_packages` (`product_id`,`price`);--> statement-breakpoint
CREATE TABLE `transport_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`capacity_unit` text DEFAULT 'Seaters' NOT NULL,
	`description` text,
	`featured_image` text,
	`images` text DEFAULT '[]' NOT NULL,
	`included_services` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transport_products_code_unique` ON `transport_products` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `transport_products_slug_unique` ON `transport_products` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_transport_products_active` ON `transport_products` (`is_active`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `item_type` text DEFAULT 'tour' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `booking_options` text;