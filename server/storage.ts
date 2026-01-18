import { 
  users, 
  learnerProfiles, 
  courses, 
  modules, 
  progress, 
  quizzes, 
  resources, 
  uploads, 
  streaks,
  studySessions,
  sources,
  chatMessages,
  type User,
  type LearnerProfile,
  type InsertLearnerProfile,
  type Course,
  type InsertCourse,
  type Module,
  type InsertModule,
  type Progress,
  type InsertProgress,
  type Quiz,
  type InsertQuiz,
  type Resource,
  type InsertResource,
  type Upload,
  type InsertUpload,
  type StudySession,
  type InsertStudySession,
  type Source,
  type InsertSource,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count, sql, isNotNull, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (handled by auth module)
  getUser(id: string): Promise<User | undefined>;
  
  // Learner profile
  getLearnerProfile(userId: string): Promise<LearnerProfile | undefined>;
  upsertLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
  
  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByUser(userId: string, includeArchived?: boolean): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  archiveCourse(id: string, archived: boolean): Promise<Course>;
  
  // Modules
  getModule(id: string): Promise<Module | undefined>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, data: Partial<InsertModule>): Promise<Module>;
  
  // Progress
  getProgress(userId: string, courseId: string): Promise<Progress[]>;
  updateProgress(data: InsertProgress): Promise<Progress>;
  
  // Quizzes
  getQuizzesByModule(moduleId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Resources
  getResourcesByCourse(courseId: string): Promise<Resource[]>;
  getResourcesByModule(moduleId: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Uploads
  getUploadsByUser(userId: string): Promise<Upload[]>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  updateUpload(id: string, data: Partial<InsertUpload>): Promise<Upload>;
  
  // Streaks
  getStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number } | undefined>;
  updateStreak(userId: string): Promise<void>;
  
  // User stats
  getUserStats(userId: string): Promise<{ modulesCompleted: number; hoursLearned: number }>;
  
  // Study sessions
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  endStudySession(sessionId: string, durationMinutes: number): Promise<StudySession>;
  getActiveStudySession(userId: string): Promise<StudySession | undefined>;
  
  // Sources (NotebookLM style)
  getSourcesByNotebook(notebookId: string): Promise<Source[]>;
  getSourcesByUser(userId: string): Promise<Source[]>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: string, data: Partial<InsertSource>): Promise<Source>;
  deleteSource(id: string): Promise<void>;
  
  // Chat messages
  getChatMessages(notebookId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(notebookId: string): Promise<void>;
  
  // User data management
  clearUserData(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getLearnerProfile(userId: string): Promise<LearnerProfile | undefined> {
    const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
    return profile;
  }

  async upsertLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile> {
    const [result] = await db
      .insert(learnerProfiles)
      .values(profile)
      .onConflictDoUpdate({
        target: learnerProfiles.userId,
        set: { ...profile, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByUser(userId: string, includeArchived: boolean = false): Promise<Course[]> {
    if (includeArchived) {
      return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.createdAt));
    }
    return db.select().from(courses).where(
      and(eq(courses.userId, userId), eq(courses.archived, false))
    ).orderBy(desc(courses.createdAt));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db.insert(courses).values(course).returning();
    return result;
  }

  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course> {
    const [result] = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return result;
  }

  async deleteCourse(id: string): Promise<void> {
    // Delete related data first (cascading delete)
    const moduleIds = await db.select({ id: modules.id }).from(modules).where(eq(modules.courseId, id));
    const moduleIdList = moduleIds.map(m => m.id);
    
    if (moduleIdList.length > 0) {
      // Delete progress records that reference these modules first
      await db.delete(progress).where(inArray(progress.moduleId, moduleIdList));
      await db.delete(quizzes).where(inArray(quizzes.moduleId, moduleIdList));
      await db.delete(resources).where(inArray(resources.moduleId, moduleIdList));
    }
    // Delete remaining progress by courseId (for records without moduleId)
    await db.delete(progress).where(eq(progress.courseId, id));
    await db.delete(resources).where(eq(resources.courseId, id));
    await db.delete(studySessions).where(eq(studySessions.courseId, id));
    await db.delete(sources).where(eq(sources.notebookId, id));
    await db.delete(chatMessages).where(eq(chatMessages.notebookId, id));
    await db.delete(modules).where(eq(modules.courseId, id));
    await db.delete(courses).where(eq(courses.id, id));
  }

  async archiveCourse(id: string, archived: boolean): Promise<Course> {
    const [result] = await db
      .update(courses)
      .set({ archived, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return result;
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.order);
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [result] = await db.insert(modules).values(module).returning();
    return result;
  }

  async updateModule(id: string, data: Partial<InsertModule>): Promise<Module> {
    const [result] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();
    return result;
  }

  async getProgress(userId: string, courseId: string): Promise<Progress[]> {
    return db.select().from(progress).where(
      and(eq(progress.userId, userId), eq(progress.courseId, courseId))
    );
  }

  async updateProgress(data: InsertProgress): Promise<Progress> {
    const existing = data.moduleId 
      ? await db.select().from(progress).where(
          and(
            eq(progress.userId, data.userId),
            eq(progress.courseId, data.courseId),
            eq(progress.moduleId, data.moduleId)
          )
        )
      : await db.select().from(progress).where(
          and(
            eq(progress.userId, data.userId),
            eq(progress.courseId, data.courseId),
            sql`${progress.moduleId} IS NULL`
          )
        );
    
    if (existing.length > 0) {
      const [result] = await db
        .update(progress)
        .set({ 
          ...data, 
          lastAccessedAt: new Date(),
          timeSpent: (existing[0].timeSpent || 0) + (data.timeSpent || 0)
        })
        .where(eq(progress.id, existing[0].id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(progress)
        .values({ ...data, lastAccessedAt: new Date() })
        .returning();
      return result;
    }
  }

  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.moduleId, moduleId)).orderBy(quizzes.order);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [result] = await db.insert(quizzes).values(quiz).returning();
    return result;
  }

  async getResourcesByCourse(courseId: string): Promise<Resource[]> {
    return db.select().from(resources).where(eq(resources.courseId, courseId));
  }

  async getResourcesByModule(moduleId: string): Promise<Resource[]> {
    return db.select().from(resources).where(eq(resources.moduleId, moduleId));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [result] = await db.insert(resources).values(resource).returning();
    return result;
  }

  async getUploadsByUser(userId: string): Promise<Upload[]> {
    return db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [result] = await db.insert(uploads).values(upload).returning();
    return result;
  }

  async updateUpload(id: string, data: Partial<InsertUpload>): Promise<Upload> {
    const [result] = await db
      .update(uploads)
      .set(data)
      .where(eq(uploads.id, id))
      .returning();
    return result;
  }

  async getStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number } | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    if (!streak) return undefined;
    return { currentStreak: streak.currentStreak || 0, longestStreak: streak.longestStreak || 0 };
  }

  async updateStreak(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [existing] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    
    if (!existing) {
      await db.insert(streaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      });
      return;
    }
    
    const lastActivity = existing.lastActivityDate ? new Date(existing.lastActivityDate) : null;
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = existing.currentStreak || 0;
    
    if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
      newStreak += 1;
    } else if (!lastActivity || lastActivity.getTime() < yesterday.getTime()) {
      newStreak = 1;
    }
    
    await db.update(streaks)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existing.longestStreak || 0),
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(streaks.userId, userId));
  }

  async getUserStats(userId: string): Promise<{ modulesCompleted: number; hoursLearned: number }> {
    const [completedResult] = await db
      .select({ count: count() })
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.completed, true)));
    
    const [hoursResult] = await db
      .select({ total: sum(studySessions.durationMinutes) })
      .from(studySessions)
      .where(eq(studySessions.userId, userId));
    
    return {
      modulesCompleted: completedResult?.count || 0,
      hoursLearned: Math.round((Number(hoursResult?.total) || 0) / 60 * 10) / 10,
    };
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [result] = await db.insert(studySessions).values(session).returning();
    return result;
  }

  async endStudySession(sessionId: string, durationMinutes: number): Promise<StudySession> {
    const [result] = await db
      .update(studySessions)
      .set({ 
        endedAt: new Date(), 
        durationMinutes 
      })
      .where(eq(studySessions.id, sessionId))
      .returning();
    return result;
  }

  async getActiveStudySession(userId: string): Promise<StudySession | undefined> {
    const [session] = await db
      .select()
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        sql`${studySessions.endedAt} IS NULL`
      ))
      .orderBy(desc(studySessions.startedAt))
      .limit(1);
    return session;
  }

  // Sources (NotebookLM style)
  async getSourcesByNotebook(notebookId: string): Promise<Source[]> {
    return db
      .select()
      .from(sources)
      .where(eq(sources.notebookId, notebookId))
      .orderBy(desc(sources.createdAt));
  }

  async getSourcesByUser(userId: string): Promise<Source[]> {
    return db
      .select()
      .from(sources)
      .where(eq(sources.userId, userId))
      .orderBy(desc(sources.createdAt));
  }

  async createSource(source: InsertSource): Promise<Source> {
    const [result] = await db.insert(sources).values(source).returning();
    return result;
  }

  async updateSource(id: string, data: Partial<InsertSource>): Promise<Source> {
    const [result] = await db
      .update(sources)
      .set(data)
      .where(eq(sources.id, id))
      .returning();
    return result;
  }

  async deleteSource(id: string): Promise<void> {
    await db.delete(sources).where(eq(sources.id, id));
  }

  // Chat messages
  async getChatMessages(notebookId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.notebookId, notebookId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(message).returning();
    return result;
  }

  async clearChatHistory(notebookId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.notebookId, notebookId));
  }

  async clearUserData(userId: string): Promise<void> {
    // Get all user's courses first
    const userCourses = await db.select().from(courses).where(eq(courses.userId, userId));
    const courseIds = userCourses.map(c => c.id);

    // Delete related data in order (respecting foreign keys)
    if (courseIds.length > 0) {
      // Delete quizzes for all modules of user's courses
      const userModules = await db.select().from(modules).where(inArray(modules.courseId, courseIds));
      const moduleIds = userModules.map(m => m.id);
      
      if (moduleIds.length > 0) {
        await db.delete(quizzes).where(inArray(quizzes.moduleId, moduleIds));
        await db.delete(resources).where(inArray(resources.moduleId, moduleIds));
      }
      
      // Delete modules
      await db.delete(modules).where(inArray(modules.courseId, courseIds));
      
      // Delete progress
      await db.delete(progress).where(eq(progress.userId, userId));
      
      // Delete courses
      await db.delete(courses).where(eq(courses.userId, userId));
    }

    // Delete chat messages and sources
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
    await db.delete(sources).where(eq(sources.userId, userId));
    
    // Delete study sessions
    await db.delete(studySessions).where(eq(studySessions.userId, userId));
    
    // Delete streaks
    await db.delete(streaks).where(eq(streaks.userId, userId));
    
    // Delete uploads
    await db.delete(uploads).where(eq(uploads.userId, userId));
    
    // Delete learner profile
    await db.delete(learnerProfiles).where(eq(learnerProfiles.userId, userId));
  }
}

export const storage = new DatabaseStorage();
