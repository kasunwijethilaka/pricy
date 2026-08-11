CREATE TYPE "public"."user_role" AS ENUM('user', 'owner', 'admin');--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;