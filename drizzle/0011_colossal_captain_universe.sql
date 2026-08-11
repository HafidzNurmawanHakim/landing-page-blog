CREATE TABLE `site_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_phone` text,
	`contact_phone_display` text,
	`contact_email` text,
	`whatsapp_number` text,
	`admin_email` text,
	`address` text,
	`hours_weekday` text,
	`hours_time` text,
	`social` text,
	`updated_at` integer
);
