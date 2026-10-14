CREATE TABLE "cms_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"mime" text NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_node_images" (
	"node_id" bigint NOT NULL,
	"image_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "cms_node_images_node_id_position_pk" PRIMARY KEY("node_id","position")
);
--> statement-breakpoint
CREATE TABLE "cms_node_translations" (
	"node_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"subtitle" text,
	"body" text,
	"url" text,
	CONSTRAINT "cms_node_translations_node_id_locale_pk" PRIMARY KEY("node_id","locale"),
	CONSTRAINT "cms_node_translations_locale_check" CHECK ("cms_node_translations"."locale" IN ('de', 'en')),
	CONSTRAINT "cms_node_translations_subtitle_check" CHECK (char_length("cms_node_translations"."subtitle") <= 80)
);
--> statement-breakpoint
CREATE TABLE "cms_nodes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cms_nodes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"property_id" uuid NOT NULL,
	"parent_id" bigint,
	"position" integer NOT NULL,
	"type" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"url" text,
	"open_mode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_nodes_type_check" CHECK ("cms_nodes"."type" IN ('page', 'link')),
	CONSTRAINT "cms_nodes_open_mode_check" CHECK ("cms_nodes"."open_mode" IN ('in_app', 'system')),
	CONSTRAINT "cms_nodes_link_fields_check" CHECK (("cms_nodes"."type" = 'link') = ("cms_nodes"."url" IS NOT NULL AND "cms_nodes"."open_mode" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "cms_images" ADD CONSTRAINT "cms_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_node_images" ADD CONSTRAINT "cms_node_images_node_id_cms_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."cms_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_node_images" ADD CONSTRAINT "cms_node_images_image_id_cms_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_node_translations" ADD CONSTRAINT "cms_node_translations_node_id_cms_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."cms_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_nodes" ADD CONSTRAINT "cms_nodes_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_nodes" ADD CONSTRAINT "cms_nodes_parent_id_cms_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cms_images_property_id_idx" ON "cms_images" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "cms_node_images_image_id_idx" ON "cms_node_images" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "cms_nodes_property_id_parent_id_idx" ON "cms_nodes" USING btree ("property_id","parent_id");