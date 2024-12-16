ALTER TABLE "config" DROP CONSTRAINT "config_installation_id_slack_installations_id_fk";
--> statement-breakpoint
ALTER TABLE "user_installations" DROP CONSTRAINT "user_installations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_installations" DROP CONSTRAINT "user_installations_installation_id_slack_installations_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "config" ADD CONSTRAINT "config_installation_id_slack_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."slack_installations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_installations" ADD CONSTRAINT "user_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_installations" ADD CONSTRAINT "user_installations_installation_id_slack_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."slack_installations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
