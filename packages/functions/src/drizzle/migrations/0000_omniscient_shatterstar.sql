CREATE TABLE IF NOT EXISTS "config" (
	"installation_id" integer,
	"product" text NOT NULL,
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "config_installation_id_product_pk" PRIMARY KEY("installation_id","product")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slack_installations" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"team_name" text NOT NULL,
	"bot_user_id" text NOT NULL,
	"bot_token" text NOT NULL,
	"bot_scopes" text NOT NULL,
	"incoming_webhook" jsonb NOT NULL,
	CONSTRAINT "slack_installations_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "status_messages" (
	"guid" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"pub_date" timestamp NOT NULL,
	"product" text NOT NULL,
	"affected_services" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"team_id" text NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "config" ADD CONSTRAINT "config_installation_id_slack_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."slack_installations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailUniqueIndex" ON "users" USING btree (lower("email"));