CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`timestamps` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `locale` text DEFAULT 'id' NOT NULL;