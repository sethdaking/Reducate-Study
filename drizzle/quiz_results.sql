CREATE TABLE IF NOT EXISTS "quiz_results" (
    "id" serial PRIMARY KEY,
    "course_id" varchar NOT NULL,
    "score" integer NOT NULL,
    "correct_answers" integer NOT NULL,
    "incorrect_answers" integer NOT NULL,
    "total_questions" integer NOT NULL,
    "completed_at" timestamp DEFAULT now(),
    "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "quiz_results_course_id_idx" ON "quiz_results" ("course_id");