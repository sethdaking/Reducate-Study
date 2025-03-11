// configs/schema.js
import { boolean } from "drizzle-orm/pg-core"; // Fix import from gel-core to pg-core
import { integer, json, pgTable, serial, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const USER_TABLE = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull(),
    isMember: boolean('is_member').default(false)
});

export const STUDY_MATERIAL_TABLE = pgTable('studyMaterial', {
    id: serial('id').primaryKey(),
    courseId: varchar('course_id').notNull(),
    courseType: varchar('course_type').notNull(),
    topic: varchar('topic').notNull(),
    difficultyLevel: varchar('difficulty_level').default('Easy'),
    courseLayout: json('course_layout'),
    createdBy: varchar('created_by').notNull(),
    status: varchar('status').default('Generating')
});

export const CHAPTER_NOTES_TABLE = pgTable('chapterNotes', {
    id: serial('id').primaryKey(),
    courseId: varchar('course_id').notNull(),
    chapterId: integer('chapter_id').notNull(),
    notes: text('notes')
});

export const STUDY_TYPE_CONTENT = pgTable('study_type_content', {
    id: serial('id').primaryKey(),
    courseId: varchar('course_id').notNull(),
    type: varchar('type').notNull(),
    content: json('content'),
    status: varchar('status').default('Pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        uniqueIdx: uniqueIndex('study_type_content_course_type_idx').on(table.courseId, table.type)
    }
});

// configs/schema.js
export const QUIZ_RESULTS_TABLE = pgTable('quiz_results', {
    id: serial('id').primaryKey(),
    courseId: varchar('course_id').notNull(),
    score: integer('score').notNull(),
    correctAnswers: integer('correct_answers').notNull(),
    incorrectAnswers: integer('incorrect_answers').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    timeStarted: timestamp('time_started').notNull(),
    timeCompleted: timestamp('time_completed').notNull(),
    answers: json('answers'),
    createdAt: timestamp('created_at').defaultNow(),
    createdBy: varchar('created_by').notNull()
});

