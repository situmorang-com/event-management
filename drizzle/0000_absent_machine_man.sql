CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_team_id` text,
	`sponsor_id` text,
	`kind` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`storage_path` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`uploaded_by` text,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`owner_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`conference_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`role` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`ticket_code` text NOT NULL,
	`registered_at` integer DEFAULT (unixepoch()) NOT NULL,
	`checked_in_at` integer,
	`checked_in_by` text,
	FOREIGN KEY (`conference_id`) REFERENCES `conferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checked_in_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_ticket_code_unique` ON `attendees` (`ticket_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_conf_email_idx` ON `attendees` (`conference_id`,`email`);--> statement-breakpoint
CREATE INDEX `attendees_conf_status_idx` ON `attendees` (`conference_id`,`status`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text,
	`actor_user_id` text,
	`action` text NOT NULL,
	`target` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_team_created_idx` ON `audit_log` (`team_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`token_hash` text NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_tokens_hash_idx` ON `auth_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `auth_tokens_email_idx` ON `auth_tokens` (`email`);--> statement-breakpoint
CREATE TABLE `conferences` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`venue` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`capacity` integer,
	`registration_close_at` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`banner_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conferences_slug_unique` ON `conferences` (`slug`);--> statement-breakpoint
CREATE INDEX `conferences_team_idx` ON `conferences` (`team_id`);--> statement-breakpoint
CREATE TABLE `email_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`to_address` text NOT NULL,
	`template` text NOT NULL,
	`payload` text NOT NULL,
	`send_after` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `email_jobs_pending_idx` ON `email_jobs` (`sent_at`,`send_after`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sponsor_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`sponsor_id` text NOT NULL,
	`title` text NOT NULL,
	`due_date` integer,
	`done_at` integer,
	`notes` text,
	FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sponsor_tiers` (
	`id` text PRIMARY KEY NOT NULL,
	`conference_id` text NOT NULL,
	`name` text NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	`price` integer,
	`color` text,
	`benefits` text,
	FOREIGN KEY (`conference_id`) REFERENCES `conferences`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sponsor_tiers_conf_idx` ON `sponsor_tiers` (`conference_id`);--> statement-breakpoint
CREATE TABLE `sponsors` (
	`id` text PRIMARY KEY NOT NULL,
	`conference_id` text NOT NULL,
	`kind` text DEFAULT 'sponsor' NOT NULL,
	`tier_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo_asset_id` text,
	`website_url` text,
	`description` text,
	`contact_name` text,
	`contact_email` text,
	`contact_phone` text,
	`status` text DEFAULT 'prospect' NOT NULL,
	`contract_asset_id` text,
	`amount` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`notes` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`conference_id`) REFERENCES `conferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tier_id`) REFERENCES `sponsor_tiers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sponsors_conf_kind_idx` ON `sponsors` (`conference_id`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `sponsors_conf_slug_idx` ON `sponsors` (`conference_id`,`slug`);--> statement-breakpoint
CREATE TABLE `team_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`token_hash` text NOT NULL,
	`invited_by` text,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_token_idx` ON `team_invitations` (`token_hash`);--> statement-breakpoint
CREATE INDEX `team_invitations_team_email_idx` ON `team_invitations` (`team_id`,`email`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`invited_by` text,
	`joined_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_members_team_user_idx` ON `team_members` (`team_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_unique` ON `teams` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);