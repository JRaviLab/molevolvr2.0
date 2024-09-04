-- Create enum type "status"
CREATE TYPE "status" AS ENUM ('submitted', 'analyzing', 'complete', 'error');
-- Create "analyses" table
CREATE TABLE "analyses" ("id" character varying NOT NULL DEFAULT "right"(((uuid_generate_v4())::character varying)::text, 6), "name" character varying NOT NULL, "type" character varying NOT NULL, "info" json NULL, "created" timestamptz NOT NULL DEFAULT now(), "started" timestamptz NULL, "completed" timestamptz NULL, "status" "status" NOT NULL DEFAULT 'submitted', PRIMARY KEY ("id"));
-- Create "users" table
CREATE TABLE "users" ("id" bigserial NOT NULL, "name" character varying NOT NULL, "created" timestamptz NOT NULL DEFAULT now());
-- Create "analysis_event" table
CREATE TABLE "analysis_event" ("id" bigserial NOT NULL, "analysis_id" character varying NOT NULL, "event" character varying NOT NULL, "info" text NULL, "created" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id"), CONSTRAINT "analysis_fk" FOREIGN KEY ("analysis_id") REFERENCES "analyses" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION);
