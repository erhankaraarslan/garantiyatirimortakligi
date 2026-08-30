import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('content', 'documentArchive', 'bioAccordion', 'dataTable', 'faq', 'contact', 'gallery', 'sitemap', 'landing');
  CREATE TYPE "public"."enum_pages_bio_group" AS ENUM('board', 'executives');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_commission_scope" AS ENUM('none', 'all', 'single');
  CREATE TYPE "public"."enum_pages_translation_status" AS ENUM('complete', 'missing', 'review');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('content', 'documentArchive', 'bioAccordion', 'dataTable', 'faq', 'contact', 'gallery', 'sitemap', 'landing');
  CREATE TYPE "public"."enum__pages_v_version_bio_group" AS ENUM('board', 'executives');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum__pages_v_version_commission_scope" AS ENUM('none', 'all', 'single');
  CREATE TYPE "public"."enum__pages_v_version_translation_status" AS ENUM('complete', 'missing', 'review');
  CREATE TYPE "public"."enum_document_archive_items_language" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_people_group" AS ENUM('board', 'executives');
  CREATE TYPE "public"."enum_navigation_affiliate_bar_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_main_menu_columns_links_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_main_menu_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_header_utility_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_footer_columns_links_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_legal_links_type" AS ENUM('page', 'external');
  CREATE TYPE "public"."enum_navigation_social_links_platform" AS ENUM('linkedin', 'x', 'instagram', 'facebook', 'youtube');
  CREATE TYPE "public"."enum_navigation_header_cta_type" AS ENUM('page', 'external');
  CREATE TABLE "pages_hero_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"page_id" integer
  );
  
  CREATE TABLE "pages_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"page_id" integer
  );
  
  CREATE TABLE "pages_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer
  );
  
  CREATE TABLE "pages_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_legacy_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"template" "enum_pages_template" DEFAULT 'content',
  	"order" numeric DEFAULT 0,
  	"archive_category" varchar,
  	"bio_group" "enum_pages_bio_group",
  	"hero_cta_page_id" integer,
  	"hero_image_id" integer,
  	"external_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"commission_scope" "enum_pages_commission_scope" DEFAULT 'none',
  	"commission_year" numeric,
  	"hero_headline" varchar,
  	"hero_subline" varchar,
  	"hero_cta_label" varchar,
  	"content" jsonb,
  	"legacy_html" varchar,
  	"translation_status" "enum_pages_translation_status" DEFAULT 'complete',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_hero_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"page_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"image_id" integer,
  	"page_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_legacy_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_parent_id" integer,
  	"version_template" "enum__pages_v_version_template" DEFAULT 'content',
  	"version_order" numeric DEFAULT 0,
  	"version_archive_category" varchar,
  	"version_bio_group" "enum__pages_v_version_bio_group",
  	"version_hero_cta_page_id" integer,
  	"version_hero_image_id" integer,
  	"version_external_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_commission_scope" "enum__pages_v_version_commission_scope" DEFAULT 'none',
  	"version_commission_year" numeric,
  	"version_hero_headline" varchar,
  	"version_hero_subline" varchar,
  	"version_hero_cta_label" varchar,
  	"version_content" jsonb,
  	"version_legacy_html" varchar,
  	"version_translation_status" "enum__pages_v_version_translation_status" DEFAULT 'complete',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "document_archive_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar NOT NULL,
  	"language" "enum_document_archive_items_language" DEFAULT 'tr' NOT NULL,
  	"year" numeric NOT NULL,
  	"period" varchar,
  	"document_id" integer NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "document_archive_items_locales" (
  	"group_label" varchar,
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"group" "enum_people_group" NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people_locales" (
  	"role" varchar NOT NULL,
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "commission_years_periods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "commission_years_periods_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "commission_years_rows_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "commission_years_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "commission_years_rows_locales" (
  	"metric" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "commission_years" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "commission_years_locales" (
  	"heading" varchar DEFAULT 'Sermaye Piyasası Kurulu’nun 13.04.2006 tarih ve 18/452 sayılı kararı uyarınca yapılan bilgilendirme',
  	"intermediary" varchar,
  	"notes" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"awarded_at" timestamp(3) with time zone,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "awards_locales" (
  	"title" varchar NOT NULL,
  	"issuer" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"original_path" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "documents_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"original_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject_line" varchar,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"locale" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"priority" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"document_archive_items_id" integer,
  	"people_id" integer,
  	"commission_years_id" integer,
  	"faqs_id" integer,
  	"awards_id" integer,
  	"documents_id" integer,
  	"media_id" integer,
  	"contact_messages_id" integer,
  	"users_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_affiliate_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_affiliate_bar_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"is_active" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_affiliate_bar_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_main_menu_columns_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "navigation_main_menu_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu_columns_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_main_menu_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "navigation_main_menu_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header_utility" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_header_utility_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "navigation_header_utility_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_footer_columns_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "navigation_footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navigation_legal_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "navigation_legal_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_navigation_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_type" "enum_navigation_header_cta_type" DEFAULT 'page',
  	"header_cta_page_id" integer,
  	"header_cta_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"header_cta_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"default_seo_image_id" integer,
  	"analytics_ga4_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar DEFAULT 'Garanti Yatırım Ortaklığı A.Ş.' NOT NULL,
  	"default_seo_title" varchar,
  	"default_seo_description" varchar,
  	"cookie_notice_text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar DEFAULT '0212 335 30 95 - 97',
  	"fax" varchar DEFAULT '+90 212 335 32 30',
  	"email" varchar DEFAULT 'yo@gyo.com.tr',
  	"kep_address" varchar DEFAULT 'garantiyatirimas@hs01.kep.tr',
  	"coordinates_lat" numeric DEFAULT 41.113105,
  	"coordinates_lng" numeric DEFAULT 29.020057,
  	"coordinates_zoom" numeric DEFAULT 15,
  	"form_recipients" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_info_locales" (
  	"company_name" varchar DEFAULT 'Garanti Yatırım Ortaklığı A.Ş.',
  	"address" varchar DEFAULT 'Maslak Mah. Atatürk Oto Sanayi, 55. Sokak, 42 Maslak No:2 A Blok D:270 (A12/7) 34485 Sarıyer - İstanbul',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_hero_badges" ADD CONSTRAINT "pages_hero_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_shortcuts" ADD CONSTRAINT "pages_shortcuts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_shortcuts" ADD CONSTRAINT "pages_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_mosaic" ADD CONSTRAINT "pages_mosaic_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_mosaic" ADD CONSTRAINT "pages_mosaic_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_mosaic" ADD CONSTRAINT "pages_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_attachments" ADD CONSTRAINT "pages_attachments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_attachments" ADD CONSTRAINT "pages_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_attachments_locales" ADD CONSTRAINT "pages_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_legacy_paths" ADD CONSTRAINT "pages_legacy_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_cta_page_id_pages_id_fk" FOREIGN KEY ("hero_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_badges" ADD CONSTRAINT "_pages_v_version_hero_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_shortcuts" ADD CONSTRAINT "_pages_v_version_shortcuts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_shortcuts" ADD CONSTRAINT "_pages_v_version_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_mosaic" ADD CONSTRAINT "_pages_v_version_mosaic_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_mosaic" ADD CONSTRAINT "_pages_v_version_mosaic_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_mosaic" ADD CONSTRAINT "_pages_v_version_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_attachments" ADD CONSTRAINT "_pages_v_version_attachments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_attachments" ADD CONSTRAINT "_pages_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_attachments_locales" ADD CONSTRAINT "_pages_v_version_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_legacy_paths" ADD CONSTRAINT "_pages_v_version_legacy_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_cta_page_id_pages_id_fk" FOREIGN KEY ("version_hero_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "document_archive_items" ADD CONSTRAINT "document_archive_items_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_archive_items_locales" ADD CONSTRAINT "document_archive_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."document_archive_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_periods" ADD CONSTRAINT "commission_years_periods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_periods_locales" ADD CONSTRAINT "commission_years_periods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years_periods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_rows_values" ADD CONSTRAINT "commission_years_rows_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_rows" ADD CONSTRAINT "commission_years_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_rows_locales" ADD CONSTRAINT "commission_years_rows_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "commission_years_locales" ADD CONSTRAINT "commission_years_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."commission_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards_locales" ADD CONSTRAINT "awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_locales" ADD CONSTRAINT "documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_archive_items_fk" FOREIGN KEY ("document_archive_items_id") REFERENCES "public"."document_archive_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_commission_years_fk" FOREIGN KEY ("commission_years_id") REFERENCES "public"."commission_years"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_affiliate_bar" ADD CONSTRAINT "navigation_affiliate_bar_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_affiliate_bar" ADD CONSTRAINT "navigation_affiliate_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_affiliate_bar_locales" ADD CONSTRAINT "navigation_affiliate_bar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_affiliate_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_columns_links" ADD CONSTRAINT "navigation_main_menu_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_columns_links" ADD CONSTRAINT "navigation_main_menu_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_columns_links_locales" ADD CONSTRAINT "navigation_main_menu_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_columns" ADD CONSTRAINT "navigation_main_menu_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_columns_locales" ADD CONSTRAINT "navigation_main_menu_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_locales" ADD CONSTRAINT "navigation_main_menu_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_utility" ADD CONSTRAINT "navigation_header_utility_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_utility" ADD CONSTRAINT "navigation_header_utility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_utility_locales" ADD CONSTRAINT "navigation_header_utility_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_utility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links_locales" ADD CONSTRAINT "navigation_footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_locales" ADD CONSTRAINT "navigation_footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal_links" ADD CONSTRAINT "navigation_legal_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_legal_links" ADD CONSTRAINT "navigation_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal_links_locales" ADD CONSTRAINT "navigation_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_social_links" ADD CONSTRAINT "navigation_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation" ADD CONSTRAINT "navigation_header_cta_page_id_pages_id_fk" FOREIGN KEY ("header_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_seo_image_id_media_id_fk" FOREIGN KEY ("default_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_locales" ADD CONSTRAINT "contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_badges_order_idx" ON "pages_hero_badges" USING btree ("_order");
  CREATE INDEX "pages_hero_badges_parent_id_idx" ON "pages_hero_badges" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_badges_locale_idx" ON "pages_hero_badges" USING btree ("_locale");
  CREATE INDEX "pages_shortcuts_order_idx" ON "pages_shortcuts" USING btree ("_order");
  CREATE INDEX "pages_shortcuts_parent_id_idx" ON "pages_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "pages_shortcuts_locale_idx" ON "pages_shortcuts" USING btree ("_locale");
  CREATE INDEX "pages_shortcuts_page_idx" ON "pages_shortcuts" USING btree ("page_id");
  CREATE INDEX "pages_mosaic_order_idx" ON "pages_mosaic" USING btree ("_order");
  CREATE INDEX "pages_mosaic_parent_id_idx" ON "pages_mosaic" USING btree ("_parent_id");
  CREATE INDEX "pages_mosaic_locale_idx" ON "pages_mosaic" USING btree ("_locale");
  CREATE INDEX "pages_mosaic_image_idx" ON "pages_mosaic" USING btree ("image_id");
  CREATE INDEX "pages_mosaic_page_idx" ON "pages_mosaic" USING btree ("page_id");
  CREATE INDEX "pages_attachments_order_idx" ON "pages_attachments" USING btree ("_order");
  CREATE INDEX "pages_attachments_parent_id_idx" ON "pages_attachments" USING btree ("_parent_id");
  CREATE INDEX "pages_attachments_document_idx" ON "pages_attachments" USING btree ("document_id");
  CREATE UNIQUE INDEX "pages_attachments_locales_locale_parent_id_unique" ON "pages_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_legacy_paths_order_idx" ON "pages_legacy_paths" USING btree ("_order");
  CREATE INDEX "pages_legacy_paths_parent_id_idx" ON "pages_legacy_paths" USING btree ("_parent_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_hero_hero_cta_page_idx" ON "pages" USING btree ("hero_cta_page_id");
  CREATE INDEX "pages_hero_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_hero_badges_order_idx" ON "_pages_v_version_hero_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_badges_parent_id_idx" ON "_pages_v_version_hero_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_badges_locale_idx" ON "_pages_v_version_hero_badges" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_shortcuts_order_idx" ON "_pages_v_version_shortcuts" USING btree ("_order");
  CREATE INDEX "_pages_v_version_shortcuts_parent_id_idx" ON "_pages_v_version_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_shortcuts_locale_idx" ON "_pages_v_version_shortcuts" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_shortcuts_page_idx" ON "_pages_v_version_shortcuts" USING btree ("page_id");
  CREATE INDEX "_pages_v_version_mosaic_order_idx" ON "_pages_v_version_mosaic" USING btree ("_order");
  CREATE INDEX "_pages_v_version_mosaic_parent_id_idx" ON "_pages_v_version_mosaic" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_mosaic_locale_idx" ON "_pages_v_version_mosaic" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_mosaic_image_idx" ON "_pages_v_version_mosaic" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_mosaic_page_idx" ON "_pages_v_version_mosaic" USING btree ("page_id");
  CREATE INDEX "_pages_v_version_attachments_order_idx" ON "_pages_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_pages_v_version_attachments_parent_id_idx" ON "_pages_v_version_attachments" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_attachments_document_idx" ON "_pages_v_version_attachments" USING btree ("document_id");
  CREATE UNIQUE INDEX "_pages_v_version_attachments_locales_locale_parent_id_unique" ON "_pages_v_version_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_legacy_paths_order_idx" ON "_pages_v_version_legacy_paths" USING btree ("_order");
  CREATE INDEX "_pages_v_version_legacy_paths_parent_id_idx" ON "_pages_v_version_legacy_paths" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_cta_page_idx" ON "_pages_v" USING btree ("version_hero_cta_page_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "document_archive_items_category_idx" ON "document_archive_items" USING btree ("category");
  CREATE INDEX "document_archive_items_language_idx" ON "document_archive_items" USING btree ("language");
  CREATE INDEX "document_archive_items_year_idx" ON "document_archive_items" USING btree ("year");
  CREATE INDEX "document_archive_items_document_idx" ON "document_archive_items" USING btree ("document_id");
  CREATE INDEX "document_archive_items_updated_at_idx" ON "document_archive_items" USING btree ("updated_at");
  CREATE INDEX "document_archive_items_created_at_idx" ON "document_archive_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "document_archive_items_locales_locale_parent_id_unique" ON "document_archive_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "commission_years_periods_order_idx" ON "commission_years_periods" USING btree ("_order");
  CREATE INDEX "commission_years_periods_parent_id_idx" ON "commission_years_periods" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "commission_years_periods_locales_locale_parent_id_unique" ON "commission_years_periods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "commission_years_rows_values_order_idx" ON "commission_years_rows_values" USING btree ("_order");
  CREATE INDEX "commission_years_rows_values_parent_id_idx" ON "commission_years_rows_values" USING btree ("_parent_id");
  CREATE INDEX "commission_years_rows_order_idx" ON "commission_years_rows" USING btree ("_order");
  CREATE INDEX "commission_years_rows_parent_id_idx" ON "commission_years_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "commission_years_rows_locales_locale_parent_id_unique" ON "commission_years_rows_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "commission_years_year_idx" ON "commission_years" USING btree ("year");
  CREATE INDEX "commission_years_updated_at_idx" ON "commission_years" USING btree ("updated_at");
  CREATE INDEX "commission_years_created_at_idx" ON "commission_years" USING btree ("created_at");
  CREATE UNIQUE INDEX "commission_years_locales_locale_parent_id_unique" ON "commission_years_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "awards_image_idx" ON "awards" USING btree ("image_id");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE UNIQUE INDEX "awards_locales_locale_parent_id_unique" ON "awards_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "documents_original_path_idx" ON "documents" USING btree ("original_path");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE UNIQUE INDEX "documents_locales_locale_parent_id_unique" ON "documents_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "media_original_path_idx" ON "media" USING btree ("original_path");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE UNIQUE INDEX "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_document_archive_items_id_idx" ON "payload_locked_documents_rels" USING btree ("document_archive_items_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_commission_years_id_idx" ON "payload_locked_documents_rels" USING btree ("commission_years_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "navigation_affiliate_bar_order_idx" ON "navigation_affiliate_bar" USING btree ("_order");
  CREATE INDEX "navigation_affiliate_bar_parent_id_idx" ON "navigation_affiliate_bar" USING btree ("_parent_id");
  CREATE INDEX "navigation_affiliate_bar_page_idx" ON "navigation_affiliate_bar" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_affiliate_bar_locales_locale_parent_id_unique" ON "navigation_affiliate_bar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_main_menu_columns_links_order_idx" ON "navigation_main_menu_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_columns_links_parent_id_idx" ON "navigation_main_menu_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_columns_links_page_idx" ON "navigation_main_menu_columns_links" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_main_menu_columns_links_locales_locale_parent_id_" ON "navigation_main_menu_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_main_menu_columns_order_idx" ON "navigation_main_menu_columns" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_columns_parent_id_idx" ON "navigation_main_menu_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_main_menu_columns_locales_locale_parent_id_unique" ON "navigation_main_menu_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_main_menu_order_idx" ON "navigation_main_menu" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_parent_id_idx" ON "navigation_main_menu" USING btree ("_parent_id");
  CREATE INDEX "navigation_main_menu_page_idx" ON "navigation_main_menu" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_main_menu_locales_locale_parent_id_unique" ON "navigation_main_menu_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_utility_order_idx" ON "navigation_header_utility" USING btree ("_order");
  CREATE INDEX "navigation_header_utility_parent_id_idx" ON "navigation_header_utility" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_utility_page_idx" ON "navigation_header_utility" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_header_utility_locales_locale_parent_id_unique" ON "navigation_header_utility_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_page_idx" ON "navigation_footer_columns_links" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_links_locales_locale_parent_id_uni" ON "navigation_footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_locales_locale_parent_id_unique" ON "navigation_footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_legal_links_order_idx" ON "navigation_legal_links" USING btree ("_order");
  CREATE INDEX "navigation_legal_links_parent_id_idx" ON "navigation_legal_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_legal_links_page_idx" ON "navigation_legal_links" USING btree ("page_id");
  CREATE UNIQUE INDEX "navigation_legal_links_locales_locale_parent_id_unique" ON "navigation_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_social_links_order_idx" ON "navigation_social_links" USING btree ("_order");
  CREATE INDEX "navigation_social_links_parent_id_idx" ON "navigation_social_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_cta_header_cta_page_idx" ON "navigation" USING btree ("header_cta_page_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_default_seo_default_seo_image_idx" ON "site_settings" USING btree ("default_seo_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_info_locales_locale_parent_id_unique" ON "contact_info_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_badges" CASCADE;
  DROP TABLE "pages_shortcuts" CASCADE;
  DROP TABLE "pages_mosaic" CASCADE;
  DROP TABLE "pages_attachments" CASCADE;
  DROP TABLE "pages_attachments_locales" CASCADE;
  DROP TABLE "pages_legacy_paths" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_version_hero_badges" CASCADE;
  DROP TABLE "_pages_v_version_shortcuts" CASCADE;
  DROP TABLE "_pages_v_version_mosaic" CASCADE;
  DROP TABLE "_pages_v_version_attachments" CASCADE;
  DROP TABLE "_pages_v_version_attachments_locales" CASCADE;
  DROP TABLE "_pages_v_version_legacy_paths" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "document_archive_items" CASCADE;
  DROP TABLE "document_archive_items_locales" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "commission_years_periods" CASCADE;
  DROP TABLE "commission_years_periods_locales" CASCADE;
  DROP TABLE "commission_years_rows_values" CASCADE;
  DROP TABLE "commission_years_rows" CASCADE;
  DROP TABLE "commission_years_rows_locales" CASCADE;
  DROP TABLE "commission_years" CASCADE;
  DROP TABLE "commission_years_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "awards_locales" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_locales" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "navigation_affiliate_bar" CASCADE;
  DROP TABLE "navigation_affiliate_bar_locales" CASCADE;
  DROP TABLE "navigation_main_menu_columns_links" CASCADE;
  DROP TABLE "navigation_main_menu_columns_links_locales" CASCADE;
  DROP TABLE "navigation_main_menu_columns" CASCADE;
  DROP TABLE "navigation_main_menu_columns_locales" CASCADE;
  DROP TABLE "navigation_main_menu" CASCADE;
  DROP TABLE "navigation_main_menu_locales" CASCADE;
  DROP TABLE "navigation_header_utility" CASCADE;
  DROP TABLE "navigation_header_utility_locales" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns_links_locales" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation_footer_columns_locales" CASCADE;
  DROP TABLE "navigation_legal_links" CASCADE;
  DROP TABLE "navigation_legal_links_locales" CASCADE;
  DROP TABLE "navigation_social_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "contact_info" CASCADE;
  DROP TABLE "contact_info_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_pages_bio_group";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_pages_commission_scope";
  DROP TYPE "public"."enum_pages_translation_status";
  DROP TYPE "public"."enum__pages_v_version_template";
  DROP TYPE "public"."enum__pages_v_version_bio_group";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__pages_v_version_commission_scope";
  DROP TYPE "public"."enum__pages_v_version_translation_status";
  DROP TYPE "public"."enum_document_archive_items_language";
  DROP TYPE "public"."enum_people_group";
  DROP TYPE "public"."enum_navigation_affiliate_bar_type";
  DROP TYPE "public"."enum_navigation_main_menu_columns_links_type";
  DROP TYPE "public"."enum_navigation_main_menu_type";
  DROP TYPE "public"."enum_navigation_header_utility_type";
  DROP TYPE "public"."enum_navigation_footer_columns_links_type";
  DROP TYPE "public"."enum_navigation_legal_links_type";
  DROP TYPE "public"."enum_navigation_social_links_platform";
  DROP TYPE "public"."enum_navigation_header_cta_type";`)
}
