import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import users table first for foreign key references
import { users, sessions } from "./models/auth";

// Re-export auth models
export { users, sessions };
export type { UpsertUser, User } from "./models/auth";

// Learning profile for user preferences
export const learnerProfiles = pgTable("learner_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  level: varchar("level").notNull().default("beginner"),
  learningStyle: varchar("learning_style").notNull().default("visual"),
  goals: text("goals").array(),
  weeklyHours: integer("weekly_hours").default(5),
  preferredTopics: text("preferred_topics").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses generated from prompts
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  curriculum: jsonb("curriculum"),
  coverImage: text("cover_image"),
  totalModules: integer("total_modules").default(0),
  estimatedHours: integer("estimated_hours").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course modules (chapters/sections)
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  content: jsonb("content"),
  simulationCode: text("simulation_code"),
  estimatedMinutes: integer("estimated_minutes").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

// User progress tracking
export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  moduleId: varchar("module_id").references(() => modules.id),
  completed: boolean("completed").default(false),
  score: integer("score"),
  timeSpent: integer("time_spent").default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("progress_user_course_idx").on(table.userId, table.courseId),
]);

// Quiz questions
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: varchar("correct_answer").notNull(),
  explanation: text("explanation"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning resources (papers, lectures, books)
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  moduleId: varchar("module_id").references(() => modules.id),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  author: varchar("author"),
  url: text("url"),
  summary: text("summary"),
  annotations: jsonb("annotations"),
  isOpenSource: boolean("is_open_source").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User uploads (documents for AI processing)
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  filename: varchar("filename").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  storagePath: text("storage_path").notNull(),
  summary: text("summary"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User streaks for gamification
export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(learnerProfiles, {
    fields: [users.id],
    references: [learnerProfiles.userId],
  }),
  courses: many(courses),
  progress: many(progress),
  uploads: many(uploads),
  streak: one(streaks, {
    fields: [users.id],
    references: [streaks.userId],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
  modules: many(modules),
  resources: many(resources),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  quizzes: many(quizzes),
  resources: many(resources),
}));

// Insert schemas
export const insertLearnerProfileSchema = createInsertSchema(learnerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true, createdAt: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, createdAt: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });

// Types
export type LearnerProfile = typeof learnerProfiles.$inferSelect;
export type InsertLearnerProfile = z.infer<typeof insertLearnerProfileSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
