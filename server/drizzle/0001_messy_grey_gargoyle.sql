CREATE TABLE `npc_knowledge` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`npc_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_npc_settings` (
	`user_id` text NOT NULL,
	`npc_id` text NOT NULL,
	`voice_id` text,
	`role_override` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
