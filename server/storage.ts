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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count, sql, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (handled by auth module)
  getUser(id: string): Promise<User | undefined>;
  
  // Learner profile
  getLearnerProfile(userId: string): Promise<LearnerProfile | undefined>;
  upsertLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
  
  // Courses
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByUser(userId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course>;
  
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

  async getCoursesByUser(userId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.createdAt));
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
}

export const storage = new DatabaseStorage();
