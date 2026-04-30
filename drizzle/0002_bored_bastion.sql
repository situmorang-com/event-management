PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`conference_id` text NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`company` text,
	`role` text,
	`whatsapp` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`ticket_code` text NOT NULL,
	`registered_at` integer DEFAULT (unixepoch()) NOT NULL,
	`checked_in_at` integer,
	`checked_in_by` text,
	FOREIGN KEY (`conference_id`) REFERENCES `conferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checked_in_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_attendees`("id", "conference_id", "email", "name", "company", "role", "whatsapp", "status", "ticket_code", "registered_at", "checked_in_at", "checked_in_by") SELECT "id", "conference_id", "email", "name", "company", "role", "whatsapp", "status", "ticket_code", "registered_at", "checked_in_at", "checked_in_by" FROM `attendees`;--> statement-breakpoint
DROP TABLE `attendees`;--> statement-breakpoint
ALTER TABLE `__new_attendees` RENAME TO `attendees`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_ticket_code_unique` ON `attendees` (`ticket_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `attendees_conf_email_idx` ON `attendees` (`conference_id`,`email`);--> statement-breakpoint
CREATE INDEX `attendees_conf_status_idx` ON `attendees` (`conference_id`,`status`);