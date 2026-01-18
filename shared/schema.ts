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
  archived: boolean("archived").default(false),
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
  estimatedMinutes: integer("estimated_minutes").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sources (documents, URLs, text) - NotebookLM style
export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  notebookId: varchar("notebook_id").references(() => courses.id),
  type: varchar("type").notNull(), // 'pdf', 'url', 'text', 'youtube'
  title: varchar("title").notNull(),
  content: text("content"), // extracted text content
  url: text("url"),
  filename: varchar("filename"),
  mimeType: varchar("mime_type"),
  size: integer("size"),
  metadata: jsonb("metadata"), // additional metadata
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages for AI conversations
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  notebookId: varchar("notebook_id").references(() => courses.id),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  citations: jsonb("citations"), // references to source content
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

// Study sessions for focus timer
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  moduleId: varchar("module_id").references(() => modules.id),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes").default(0),
  focusMode: boolean("focus_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// User notes on modules
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookmarks for quick access
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly learning goals
export const learningGoals = pgTable("learning_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weeklyModulesTarget: integer("weekly_modules_target").default(5),
  weeklyHoursTarget: integer("weekly_hours_target").default(5),
  weekStart: timestamp("week_start").notNull(),
  modulesCompleted: integer("modules_completed").default(0),
  hoursCompleted: integer("hours_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User achievements/badges
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'first_course', 'streak_7', 'modules_10', etc.
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon"), // emoji or icon name
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Flashcards for spaced repetition
export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  nextReviewAt: timestamp("next_review_at").defaultNow(),
  interval: integer("interval").default(1), // days until next review
  easeFactor: integer("ease_factor").default(250), // 2.5 * 100 for precision
  repetitions: integer("repetitions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course folders for organization
export const folders = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  color: varchar("color").default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Folder-course relationship
export const courseFolders = pgTable("course_folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  folderId: varchar("folder_id").notNull().references(() => folders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shareable course links
export const sharedCourses = pgTable("shared_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  shareCode: varchar("share_code").notNull().unique(),
  isPublic: boolean("is_public").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course completion certificates
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  certificateCode: varchar("certificate_code").notNull().unique(),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom user-created quiz questions
export const customQuizzes = pgTable("custom_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id").notNull().references(() => modules.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: varchar("correct_answer").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, createdAt: true });
export const insertSourceSchema = createInsertSchema(sources).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });
export const insertLearningGoalSchema = createInsertSchema(learningGoals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, unlockedAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true, createdAt: true });
export const insertFolderSchema = createInsertSchema(folders).omit({ id: true, createdAt: true });
export const insertCourseFolderSchema = createInsertSchema(courseFolders).omit({ id: true, createdAt: true });
export const insertSharedCourseSchema = createInsertSchema(sharedCourses).omit({ id: true, createdAt: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, createdAt: true, completedAt: true });
export const insertCustomQuizSchema = createInsertSchema(customQuizzes).omit({ id: true, createdAt: true });

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
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type LearningGoal = typeof learningGoals.$inferSelect;
export type InsertLearningGoal = z.infer<typeof insertLearningGoalSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type CourseFolder = typeof courseFolders.$inferSelect;
export type InsertCourseFolder = z.infer<typeof insertCourseFolderSchema>;
export type SharedCourse = typeof sharedCourses.$inferSelect;
export type InsertSharedCourse = z.infer<typeof insertSharedCourseSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type CustomQuiz = typeof customQuizzes.$inferSelect;
export type InsertCustomQuiz = z.infer<typeof insertCustomQuizSchema>;
