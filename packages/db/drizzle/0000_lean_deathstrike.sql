CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cuisine_type" text NOT NULL,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"price_range" smallint,
	"cover_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
