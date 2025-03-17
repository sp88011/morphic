CREATE TABLE "chat" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"chat_id" varchar(36) NOT NULL,
	"message" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_meta" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"email" varchar(256) NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"username" varchar(100),
	CONSTRAINT "user_meta_email_unique" UNIQUE("email"),
	CONSTRAINT "user_meta_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_id_user_meta_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_meta" ADD CONSTRAINT "user_meta_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;