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
  notes,
  bookmarks,
  achievements,
  learningGoals,
  folders,
  courseFolders,
  flashcards,
  sharedCourses,
  certificates,
  customQuizzes,
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
  type Note,
  type InsertNote,
  type Bookmark,
  type InsertBookmark,
  type Achievement,
  type InsertAchievement,
  type LearningGoal,
  type InsertLearningGoal,
  type Folder,
  type InsertFolder,
  type CourseFolder,
  type InsertCourseFolder,
  type Flashcard,
  type InsertFlashcard,
  type SharedCourse,
  type InsertSharedCourse,
  type Certificate,
  type InsertCertificate,
  type CustomQuiz,
  type InsertCustomQuiz,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count, sql, isNotNull, inArray, lte } from "drizzle-orm";

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
  getRecentProgress(userId: string, limit?: number): Promise<Progress[]>;
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
  
  // Notes
  getNotesByModule(userId: string, moduleId: string): Promise<Note[]>;
  getNotesByUser(userId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, content: string): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  
  // Bookmarks
  getBookmarksByUser(userId: string): Promise<Bookmark[]>;
  isBookmarked(userId: string, moduleId: string): Promise<boolean>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: string, moduleId: string): Promise<void>;
  
  // Achievements
  getAchievementsByUser(userId: string): Promise<Achievement[]>;
  hasAchievement(userId: string, type: string): Promise<boolean>;
  unlockAchievement(achievement: InsertAchievement): Promise<Achievement>;
  checkAndUnlockAchievements(userId: string): Promise<Achievement[]>;
  
  // Learning goals
  getCurrentGoal(userId: string): Promise<LearningGoal | undefined>;
  updateGoal(userId: string, targets: { weeklyModulesTarget?: number; weeklyHoursTarget?: number }): Promise<LearningGoal>;
  incrementGoalProgress(userId: string, field: 'modulesCompleted' | 'hoursCompleted', amount: number): Promise<LearningGoal | undefined>;
  
  // Folders
  getFoldersByUser(userId: string): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, data: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
  addCourseToFolder(courseId: string, folderId: string): Promise<CourseFolder>;
  removeCourseFromFolder(courseId: string, folderId: string): Promise<void>;
  getCoursesByFolder(folderId: string): Promise<Course[]>;
  getFoldersByCourse(courseId: string): Promise<Folder[]>;
  getCourseFolderMappings(userId: string): Promise<Record<string, string[]>>;
  
  // User data management
  clearUserData(userId: string): Promise<void>;
  
  // Flashcards (spaced repetition)
  getFlashcardsByModule(userId: string, moduleId: string): Promise<Flashcard[]>;
  getFlashcardsDueForReview(userId: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcardAfterReview(id: string, quality: number): Promise<Flashcard>;
  deleteFlashcard(id: string): Promise<void>;
  
  // Shared courses
  getSharedCourse(shareCode: string): Promise<SharedCourse | undefined>;
  createSharedCourse(courseId: string, userId: string): Promise<SharedCourse>;
  deleteSharedCourse(id: string): Promise<void>;
  
  // Certificates
  getCertificate(userId: string, courseId: string): Promise<Certificate | undefined>;
  createCertificate(userId: string, courseId: string): Promise<Certificate>;
  
  // Custom quizzes
  getCustomQuizzesByModule(userId: string, moduleId: string): Promise<CustomQuiz[]>;
  createCustomQuiz(quiz: InsertCustomQuiz): Promise<CustomQuiz>;
  deleteCustomQuiz(id: string): Promise<void>;
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

  async getRecentProgress(userId: string, limit: number = 10): Promise<Progress[]> {
    return db.select().from(progress)
      .where(and(eq(progress.userId, userId), isNotNull(progress.moduleId)))
      .orderBy(desc(progress.lastAccessedAt))
      .limit(limit);
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

  // Notes
  async getNotesByModule(userId: string, moduleId: string): Promise<Note[]> {
    return db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.moduleId, moduleId)))
      .orderBy(desc(notes.createdAt));
  }

  async getNotesByUser(userId: string): Promise<Note[]> {
    return db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [result] = await db.insert(notes).values(note).returning();
    return result;
  }

  async updateNote(id: string, content: string): Promise<Note> {
    const [result] = await db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return result;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Bookmarks
  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    return db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async isBookmarked(userId: string, moduleId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.moduleId, moduleId)));
    return !!result;
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [result] = await db.insert(bookmarks).values(bookmark).returning();
    return result;
  }

  async deleteBookmark(userId: string, moduleId: string): Promise<void> {
    await db.delete(bookmarks).where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.moduleId, moduleId))
    );
  }

  // Achievements
  async getAchievementsByUser(userId: string): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
  }

  async hasAchievement(userId: string, type: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.userId, userId), eq(achievements.type, type)));
    return !!result;
  }

  async unlockAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [result] = await db.insert(achievements).values(achievement).returning();
    return result;
  }

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    
    const achievementDefinitions = [
      { type: 'first_course', title: 'First Steps', description: 'Created your first course', icon: '🎓' },
      { type: 'first_module', title: 'Module Master', description: 'Completed your first module', icon: '📚' },
      { type: 'streak_3', title: 'On a Roll', description: 'Maintained a 3-day streak', icon: '🔥' },
      { type: 'streak_7', title: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '⚡' },
      { type: 'modules_5', title: 'Quick Learner', description: 'Completed 5 modules', icon: '🌟' },
      { type: 'modules_10', title: 'Knowledge Seeker', description: 'Completed 10 modules', icon: '🏆' },
      { type: 'hours_5', title: 'Dedicated Student', description: 'Studied for 5 hours', icon: '⏰' },
      { type: 'courses_3', title: 'Course Collector', description: 'Created 3 courses', icon: '📖' },
    ];

    const stats = await this.getUserStats(userId);
    const streak = await this.getStreak(userId);
    const userCourses = await this.getCoursesByUser(userId);

    for (const def of achievementDefinitions) {
      const alreadyHas = await this.hasAchievement(userId, def.type);
      if (alreadyHas) continue;

      let shouldUnlock = false;
      switch (def.type) {
        case 'first_course':
          shouldUnlock = userCourses.length >= 1;
          break;
        case 'first_module':
          shouldUnlock = stats.modulesCompleted >= 1;
          break;
        case 'streak_3':
          shouldUnlock = (streak?.currentStreak || 0) >= 3;
          break;
        case 'streak_7':
          shouldUnlock = (streak?.currentStreak || 0) >= 7;
          break;
        case 'modules_5':
          shouldUnlock = stats.modulesCompleted >= 5;
          break;
        case 'modules_10':
          shouldUnlock = stats.modulesCompleted >= 10;
          break;
        case 'hours_5':
          shouldUnlock = stats.hoursLearned >= 5;
          break;
        case 'courses_3':
          shouldUnlock = userCourses.length >= 3;
          break;
      }

      if (shouldUnlock) {
        const achievement = await this.unlockAchievement({
          userId,
          type: def.type,
          title: def.title,
          description: def.description,
          icon: def.icon,
        });
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  // Learning goals
  async getCurrentGoal(userId: string): Promise<LearningGoal | undefined> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const [goal] = await db
      .select()
      .from(learningGoals)
      .where(and(
        eq(learningGoals.userId, userId),
        sql`${learningGoals.weekStart} >= ${weekStart}`
      ))
      .orderBy(desc(learningGoals.weekStart))
      .limit(1);

    if (!goal) {
      const [newGoal] = await db
        .insert(learningGoals)
        .values({
          userId,
          weekStart,
          weeklyModulesTarget: 5,
          weeklyHoursTarget: 5,
          modulesCompleted: 0,
          hoursCompleted: 0,
        })
        .returning();
      return newGoal;
    }

    return goal;
  }

  async updateGoal(userId: string, targets: { weeklyModulesTarget?: number; weeklyHoursTarget?: number }): Promise<LearningGoal> {
    const currentGoal = await this.getCurrentGoal(userId);
    
    const [result] = await db
      .update(learningGoals)
      .set({ ...targets, updatedAt: new Date() })
      .where(eq(learningGoals.id, currentGoal!.id))
      .returning();
    
    return result;
  }

  async incrementGoalProgress(userId: string, field: 'modulesCompleted' | 'hoursCompleted', amount: number): Promise<LearningGoal | undefined> {
    const currentGoal = await this.getCurrentGoal(userId);
    if (!currentGoal) return undefined;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    updateData[field] = (currentGoal[field] || 0) + amount;

    const [result] = await db
      .update(learningGoals)
      .set(updateData)
      .where(eq(learningGoals.id, currentGoal.id))
      .returning();

    return result;
  }

  // Folders
  async getFoldersByUser(userId: string): Promise<Folder[]> {
    return db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.createdAt);
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [result] = await db.insert(folders).values(folder).returning();
    return result;
  }

  async updateFolder(id: string, data: Partial<InsertFolder>): Promise<Folder> {
    const [result] = await db
      .update(folders)
      .set(data)
      .where(eq(folders.id, id))
      .returning();
    return result;
  }

  async deleteFolder(id: string): Promise<void> {
    await db.delete(courseFolders).where(eq(courseFolders.folderId, id));
    await db.delete(folders).where(eq(folders.id, id));
  }

  async addCourseToFolder(courseId: string, folderId: string): Promise<CourseFolder> {
    const existing = await db
      .select()
      .from(courseFolders)
      .where(and(eq(courseFolders.courseId, courseId), eq(courseFolders.folderId, folderId)));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [result] = await db.insert(courseFolders).values({ courseId, folderId }).returning();
    return result;
  }

  async removeCourseFromFolder(courseId: string, folderId: string): Promise<void> {
    await db.delete(courseFolders).where(
      and(eq(courseFolders.courseId, courseId), eq(courseFolders.folderId, folderId))
    );
  }

  async getCoursesByFolder(folderId: string): Promise<Course[]> {
    const result = await db
      .select({ course: courses })
      .from(courseFolders)
      .innerJoin(courses, eq(courseFolders.courseId, courses.id))
      .where(eq(courseFolders.folderId, folderId));
    
    return result.map(r => r.course);
  }

  async getFoldersByCourse(courseId: string): Promise<Folder[]> {
    const result = await db
      .select({ folder: folders })
      .from(courseFolders)
      .innerJoin(folders, eq(courseFolders.folderId, folders.id))
      .where(eq(courseFolders.courseId, courseId));
    
    return result.map(r => r.folder);
  }

  async getCourseFolderMappings(userId: string): Promise<Record<string, string[]>> {
    const userFolders = await db.select().from(folders).where(eq(folders.userId, userId));
    const folderIds = userFolders.map(f => f.id);
    
    if (folderIds.length === 0) return {};
    
    const mappings = await db
      .select()
      .from(courseFolders)
      .where(inArray(courseFolders.folderId, folderIds));
    
    const result: Record<string, string[]> = {};
    for (const mapping of mappings) {
      if (!result[mapping.courseId]) {
        result[mapping.courseId] = [];
      }
      result[mapping.courseId].push(mapping.folderId);
    }
    return result;
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

  // Flashcards (spaced repetition)
  async getFlashcardsByModule(userId: string, moduleId: string): Promise<Flashcard[]> {
    return db
      .select()
      .from(flashcards)
      .where(and(eq(flashcards.userId, userId), eq(flashcards.moduleId, moduleId)))
      .orderBy(flashcards.createdAt);
  }

  async getFlashcardsDueForReview(userId: string): Promise<Flashcard[]> {
    const now = new Date();
    return db
      .select()
      .from(flashcards)
      .where(and(eq(flashcards.userId, userId), lte(flashcards.nextReviewAt, now)))
      .orderBy(flashcards.nextReviewAt);
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [result] = await db.insert(flashcards).values(flashcard).returning();
    return result;
  }

  async updateFlashcardAfterReview(id: string, quality: number): Promise<Flashcard> {
    const [existing] = await db.select().from(flashcards).where(eq(flashcards.id, id));
    if (!existing) throw new Error("Flashcard not found");

    let { interval, easeFactor, repetitions } = existing;
    interval = interval || 1;
    easeFactor = easeFactor || 250;
    repetitions = repetitions || 0;

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * (easeFactor / 100));
      }
    }

    easeFactor = easeFactor + (8 - 9 * quality + quality * quality * 0.4);
    if (easeFactor < 130) easeFactor = 130;

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    const [result] = await db
      .update(flashcards)
      .set({ interval, easeFactor: Math.round(easeFactor), repetitions, nextReviewAt })
      .where(eq(flashcards.id, id))
      .returning();
    return result;
  }

  async deleteFlashcard(id: string): Promise<void> {
    await db.delete(flashcards).where(eq(flashcards.id, id));
  }

  // Shared courses
  async getSharedCourse(shareCode: string): Promise<SharedCourse | undefined> {
    const [result] = await db
      .select()
      .from(sharedCourses)
      .where(eq(sharedCourses.shareCode, shareCode));
    return result;
  }

  async createSharedCourse(courseId: string, userId: string): Promise<SharedCourse> {
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const [result] = await db
      .insert(sharedCourses)
      .values({ courseId, userId, shareCode })
      .returning();
    return result;
  }

  async deleteSharedCourse(id: string): Promise<void> {
    await db.delete(sharedCourses).where(eq(sharedCourses.id, id));
  }

  // Certificates
  async getCertificate(userId: string, courseId: string): Promise<Certificate | undefined> {
    const [result] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)));
    return result;
  }

  async createCertificate(userId: string, courseId: string): Promise<Certificate> {
    const existing = await this.getCertificate(userId, courseId);
    if (existing) return existing;

    const certificateCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const [result] = await db
      .insert(certificates)
      .values({ userId, courseId, certificateCode })
      .returning();
    return result;
  }

  // Custom quizzes
  async getCustomQuizzesByModule(userId: string, moduleId: string): Promise<CustomQuiz[]> {
    return db
      .select()
      .from(customQuizzes)
      .where(and(eq(customQuizzes.userId, userId), eq(customQuizzes.moduleId, moduleId)))
      .orderBy(customQuizzes.createdAt);
  }

  async createCustomQuiz(quiz: InsertCustomQuiz): Promise<CustomQuiz> {
    const [result] = await db.insert(customQuizzes).values(quiz).returning();
    return result;
  }

  async deleteCustomQuiz(id: string): Promise<void> {
    await db.delete(customQuizzes).where(eq(customQuizzes.id, id));
  }
}

export const storage = new DatabaseStorage();
