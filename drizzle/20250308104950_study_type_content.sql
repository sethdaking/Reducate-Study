-- Drop existing table if it exists
DROP TABLE IF EXISTS "study_type_content";

-- Create new table with serial id
CREATE TABLE IF NOT EXISTS "study_type_content" (
    "id" serial PRIMARY KEY,
    "course_id" varchar NOT NULL,
    "type" varchar NOT NULL,
    "content" json,
    "status" varchar DEFAULT 'Pending',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "study_type_content_course_type_idx" 
ON "study_type_content" ("course_id", "type");