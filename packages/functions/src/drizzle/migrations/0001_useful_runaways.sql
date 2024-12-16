CREATE TABLE IF NOT EXISTS "user_installations" (
	"user_id" text NOT NULL,
	"installation_id" integer NOT NULL,
	CONSTRAINT "user_installations_user_id_installation_id_pk" PRIMARY KEY("user_id","installation_id")
);
--> statement-breakpoint
ALTER TABLE "config" ALTER COLUMN "installation_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_installations" ADD CONSTRAINT "user_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_installations" ADD CONSTRAINT "user_installations_installation_id_slack_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."slack_installations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "team_id";