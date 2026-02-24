import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticated } from "./auth";

// Claude model - claude-sonnet-4-20250514 is the latest
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateWithClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  
  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  throw new Error("Unexpected response type");
}

async function searchVerifiedResources(topic: string, moduleTitle: string): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  
  try {
    const text = await generateWithClaude(
      "You are a research librarian. Return ONLY valid JSON, no markdown.",
      `Find 3 REAL educational resources for learning about "${moduleTitle}" in the context of "${topic}".

IMPORTANT: Only recommend resources that ACTUALLY EXIST with REAL URLs:
- MIT OpenCourseWare courses (ocw.mit.edu)
- Khan Academy videos (khanacademy.org)
- Coursera/edX courses
- YouTube educational channels (3Blue1Brown, Veritasium, etc.)
- Wikipedia articles
- Academic papers on arXiv

Return ONLY valid JSON array:
[
  { "type": "course|video|article|paper", "title": "Exact real title", "author": "Real author/creator", "url": "Real working URL", "summary": "Brief summary" }
]

If you're not certain a resource exists, DO NOT include it.`
    );
    
    const jsonMatch = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (e) {
    console.error('Resource search error:', e);
    return [];
  }
}

const CURRICULUM_PROMPT = `You are an expert curriculum designer and educator. Generate a complete course curriculum based on the user's topic.

Output Format: Valid JSON only, no markdown code blocks.
{
  "title": "Course title (concise, engaging)",
  "description": "2-3 sentence course description",
  "estimatedHours": number (total hours to complete),
  "modules": [
    {
      "title": "Module title",
      "description": "Brief module description",
      "order": 1,
      "estimatedMinutes": 30,
      "content": { "overview": "Module overview text" },
      "quizzes": [
        { "question": "...", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correctAnswer": "Option A text (MUST be the EXACT full text of correct option, NOT a letter)", "explanation": "Why this answer is correct" }
      ],
      "resources": [
        { "type": "article|paper|video|book", "title": "Resource title", "author": "Author name", "url": "URL if available", "summary": "Brief summary" }
      ]
    }
  ]
}

Rules:
1. Create 4-6 modules with progressive difficulty
2. Each module should have 2-3 quizzes and 3-4 resources
3. Resources should be real, educational content when possible
4. Content should be comprehensive and educational like a textbook`;

const COURSE_OUTLINE_PROMPT = `You are an expert curriculum designer. Generate a course OUTLINE only (no content yet).

Output Format: Valid JSON only, no markdown code blocks.
{
  "title": "Course title (concise, engaging)",
  "description": "2-3 sentence course description",
  "estimatedHours": number (total hours to complete),
  "modules": [
    { "title": "Module 1 title", "description": "Brief description", "order": 1 },
    { "title": "Module 2 title", "description": "Brief description", "order": 2 }
  ]
}

Rules:
1. Create 4-6 module outlines with progressive difficulty
2. Keep descriptions concise (1-2 sentences each)
3. Titles should be clear and engaging`;

const MODULE_CONTENT_PROMPT = `You are an expert educator creating comprehensive online course content. Generate COMPLETE, SUBSTANTIAL content for a single module.

Output Format: Valid JSON only, no markdown code blocks.
{
  "content": {
    "overview": "Comprehensive 3-4 paragraph introduction explaining the topic, its importance, and what the student will learn. Write like a textbook introduction.",
    "keyPoints": ["Key concept 1 with detailed explanation", "Key concept 2 with detailed explanation", "Key concept 3 with explanation", "Key concept 4 with explanation", "Key concept 5 with explanation"],
    "detailedExplanation": "In-depth 5-8 paragraph explanation of the core concepts. Include formulas, definitions, historical context, and real-world applications. This should be the main educational content - thorough and informative like a textbook chapter.",
    "examples": [
      { "title": "Example 1 title", "content": "Detailed worked example with step-by-step explanation" },
      { "title": "Example 2 title", "content": "Another practical example showing application" },
      { "title": "Example 3 title", "content": "Real-world case study or application" }
    ]
  },
  "estimatedMinutes": 45,
  "quizzes": [
    { "question": "Thoughtful question testing understanding", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option A (MUST be EXACT full text)", "explanation": "Detailed explanation of why this is correct and why others are wrong" },
    { "question": "Second question on different aspect", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option B (MUST be EXACT full text)", "explanation": "Educational explanation" },
    { "question": "Third application question", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option C (MUST be EXACT full text)", "explanation": "Comprehensive explanation" }
  ],
  "resources": []
}

Rules:
1. Create 2-3 quizzes that test understanding
2. Include REAL educational resources with working URLs when possible
3. Content should be comprehensive like a university textbook
4. Include practical examples and real-world applications`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Profile endpoints
  app.get("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const profile = await storage.getLearnerProfile(user.claims.sub);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { level, learningStyle, goals, weeklyHours } = req.body;
      
      const profile = await storage.upsertLearnerProfile({
        userId: user.claims.sub,
        level: level || "beginner",
        learningStyle: learningStyle || "visual",
        goals: goals || [],
        weeklyHours: weeklyHours || 5,
      });
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  // Course endpoints
  app.get("/api/courses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const includeArchived = req.query.includeArchived === 'true';
      const courses = await storage.getCoursesByUser(user.claims.sub, includeArchived);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const course = await storage.getCourse(req.params.id as string);
      
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      if (course.userId !== user.claims.sub) {
        return res.status(403).json({ error: "Not authorized to delete this course" });
      }
      
      await storage.deleteCourse(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  app.post("/api/courses/:id/archive", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { archived } = req.body;
      const course = await storage.getCourse(req.params.id as string);
      
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      if (course.userId !== user.claims.sub) {
        return res.status(403).json({ error: "Not authorized to archive this course" });
      }
      
      const updatedCourse = await storage.archiveCourse(req.params.id as string, archived ?? true);
      res.json(updatedCourse);
    } catch (error) {
      console.error("Archive course error:", error);
      res.status(500).json({ error: "Failed to archive course" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const course = await storage.getCourse(req.params.id as string);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  app.get("/api/courses/:id/modules", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const modules = await storage.getModulesByCourse(req.params.id as string);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.post("/api/courses/generate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      
      const content = await generateWithClaude(
        CURRICULUM_PROMPT,
        `Create a complete curriculum for the topic: "${prompt}". Make it engaging and progressive. Return ONLY valid JSON, no markdown.`
      );
      
      let jsonStr = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      let curriculum;
      try {
        curriculum = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return res.status(500).json({ error: "Failed to parse AI response" });
      }
      
      // Create course
      const course = await storage.createCourse({
        userId: user.claims.sub,
        title: curriculum.title || prompt,
        description: curriculum.description || "",
        prompt: prompt,
        curriculum: curriculum,
        totalModules: curriculum.modules?.length || 0,
        estimatedHours: curriculum.estimatedHours || 0,
      });
      
      // Create modules
      if (curriculum.modules && Array.isArray(curriculum.modules)) {
        for (const moduleData of curriculum.modules) {
          const module = await storage.createModule({
            courseId: course.id,
            title: moduleData.title || "Untitled Module",
            description: moduleData.description || "",
            order: moduleData.order || 1,
            content: moduleData.content || {},
            estimatedMinutes: moduleData.estimatedMinutes || 30,
          });
          
          // Create quizzes for module
          if (moduleData.quizzes && Array.isArray(moduleData.quizzes)) {
            for (let i = 0; i < moduleData.quizzes.length; i++) {
              const quiz = moduleData.quizzes[i];
              await storage.createQuiz({
                moduleId: module.id,
                question: quiz.question || "",
                options: quiz.options || [],
                correctAnswer: quiz.correctAnswer || "",
                explanation: quiz.explanation || "",
                order: i + 1,
              });
            }
          }
          
          // Create resources for module
          if (moduleData.resources && Array.isArray(moduleData.resources)) {
            for (const resource of moduleData.resources) {
              await storage.createResource({
                courseId: course.id,
                moduleId: module.id,
                type: resource.type || "article",
                title: resource.title || "Untitled Resource",
                author: resource.author || null,
                url: resource.url || null,
                summary: resource.summary || null,
              });
            }
          }
        }
      }
      
      res.json(course);
      
    } catch (error: any) {
      console.error("Course generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate course" });
    }
  });

  // Fast course generation - creates course immediately, generates content in background
  app.post("/api/courses/generate-stream", isAuthenticated, async (req: Request, res: Response) => {
    const user = req.user as any;
    const { prompt } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    if (!prompt || typeof prompt !== "string") {
      sendEvent('error', { message: 'Prompt is required' });
      res.end();
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      sendEvent('error', { message: 'AI service not configured' });
      res.end();
      return;
    }

    try {
      // Step 1: Create course IMMEDIATELY with placeholder data - enables instant navigation
      sendEvent('progress', { step: 'creating', message: 'Setting up your course...' });

      const course = await storage.createCourse({
        userId: user.claims.sub,
        title: prompt.slice(0, 100),
        description: "Generating course content...",
        prompt: prompt,
        curriculum: { generating: true },
        totalModules: 0,
        estimatedHours: 0,
      });

      // Send course created event IMMEDIATELY - frontend navigates to course page
      sendEvent('course_created', { 
        course,
        modules: []
      });

      // Step 2: Generate course outline in background
      sendEvent('progress', { step: 'outline', message: 'Creating course outline...' });

      const outlineContent = await generateWithClaude(
        COURSE_OUTLINE_PROMPT,
        `Create a course outline for: "${prompt}". Return ONLY valid JSON.`
      );

      let outlineJson = outlineContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      let outline;
      try {
        outline = JSON.parse(outlineJson);
      } catch (e) {
        sendEvent('error', { message: 'Failed to parse outline' });
        res.end();
        return;
      }

      // Update course with real title and description
      await storage.updateCourse(course.id, {
        title: outline.title || prompt,
        description: outline.description || "",
        curriculum: outline,
        totalModules: outline.modules?.length || 0,
        estimatedHours: outline.estimatedHours || 0,
      });

      sendEvent('course_updated', {
        title: outline.title,
        description: outline.description,
        totalModules: outline.modules?.length || 0
      });

      // Create placeholder modules in database
      const moduleRecords: any[] = [];
      for (const mod of outline.modules || []) {
        const moduleRecord = await storage.createModule({
          courseId: course.id,
          title: mod.title || "Untitled",
          description: mod.description || "",
          order: mod.order || 1,
          content: { loading: true },
          estimatedMinutes: 30,
        });
        moduleRecords.push(moduleRecord);

        // Send module created event so frontend can show it immediately
        sendEvent('module_created', {
          module: {
            id: moduleRecord.id,
            title: moduleRecord.title,
            description: moduleRecord.description,
            order: moduleRecord.order,
            loading: true
          }
        });
      }

      // Step 3: Generate full content for each module
      for (let i = 0; i < moduleRecords.length; i++) {
        const moduleRecord = moduleRecords[i];
        const moduleOutline = outline.modules[i];

        sendEvent('module_generating', { 
          moduleId: moduleRecord.id, 
          moduleIndex: i,
          message: `Generating "${moduleOutline.title}"...`
        });

        try {
          const contentText = await generateWithClaude(
            MODULE_CONTENT_PROMPT,
            `Generate complete content for this module:
Course: "${outline.title}"
Module ${i + 1}: "${moduleOutline.title}"
Description: "${moduleOutline.description}"

Return ONLY valid JSON.`
          );

          let contentJson = contentText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim() || '{}';
          
          let content;
          try {
            content = JSON.parse(contentJson);
          } catch (e) {
            content = { content: { overview: "Content generation failed" }, simulationCode: null, quizzes: [], resources: [] };
          }

          // Update module with full content (set loading: false to indicate completion)
          await storage.updateModule(moduleRecord.id, {
            content: { ...(content.content || {}), loading: false },
            estimatedMinutes: content.estimatedMinutes || 30,
          });

          // Create quizzes
          if (content.quizzes && Array.isArray(content.quizzes)) {
            for (let q = 0; q < content.quizzes.length; q++) {
              const quiz = content.quizzes[q];
              await storage.createQuiz({
                moduleId: moduleRecord.id,
                question: quiz.question || "",
                options: quiz.options || [],
                correctAnswer: quiz.correctAnswer || "",
                explanation: quiz.explanation || "",
                order: q + 1,
              });
            }
          }

          // Create verified resources using Google Search grounding
          let verifiedResources: any[] = [];
          try {
            verifiedResources = await searchVerifiedResources(outline.title, moduleOutline.title);
          } catch (resourceError) {
            console.error('Resource search failed:', resourceError);
          }
          
          // Use verified resources if available, otherwise fallback to AI-generated
          const resourcesToCreate = verifiedResources.length > 0 
            ? verifiedResources 
            : (content.resources && Array.isArray(content.resources) ? content.resources : []);
          
          for (const resource of resourcesToCreate) {
            await storage.createResource({
              courseId: course.id,
              moduleId: moduleRecord.id,
              type: resource.type || "article",
              title: resource.title || "Resource",
              author: resource.author || null,
              url: resource.url || null,
              summary: resource.summary || null,
            });
          }

          // Send module completed event
          sendEvent('module_complete', {
            moduleId: moduleRecord.id,
            moduleIndex: i,
            content: content.content,
            simulationCode: content.simulationCode,
            quizCount: content.quizzes?.length || 0,
            resourceCount: content.resources?.length || 0,
          });

        } catch (moduleError: any) {
          console.error(`Module ${i} generation error:`, moduleError);
          sendEvent('module_error', { 
            moduleId: moduleRecord.id, 
            moduleIndex: i, 
            message: moduleError.message 
          });
        }
      }

      sendEvent('complete', { courseId: course.id });
      res.end();

    } catch (error: any) {
      console.error("Streaming course generation error:", error);
      sendEvent('error', { message: error.message || 'Generation failed' });
      res.end();
    }
  });

  // Module endpoints
  app.get("/api/modules/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const module = await storage.getModule(req.params.id as string);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch module" });
    }
  });

  app.get("/api/modules/:id/quizzes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const quizzes = await storage.getQuizzesByModule(req.params.id as string);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/modules/:id/resources", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const resources = await storage.getResourcesByModule(req.params.id as string);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Regenerate module content for stuck modules
  app.post("/api/modules/:id/regenerate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const moduleId = req.params.id as string;
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }

      // Get the course for context
      const course = await storage.getCourse(module.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Generate content
      const contentText = await generateWithClaude(
        MODULE_CONTENT_PROMPT,
        `Generate complete content for this module:
Course: "${course.title}"
Module: "${module.title}"
Description: "${module.description}"

Return ONLY valid JSON.`
      );

      let contentJson = contentText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim() || '{}';
      
      let content;
      try {
        content = JSON.parse(contentJson);
      } catch (e) {
        content = { content: { overview: "Content generation failed. Please try again." }, quizzes: [], resources: [] };
      }

      // Update module with full content
      await storage.updateModule(moduleId, {
        content: { ...(content.content || {}), loading: false },
        estimatedMinutes: content.estimatedMinutes || 30,
      });

      // Create quizzes if they don't exist
      const existingQuizzes = await storage.getQuizzesByModule(moduleId);
      if (existingQuizzes.length === 0 && content.quizzes && Array.isArray(content.quizzes)) {
        for (let q = 0; q < content.quizzes.length; q++) {
          const quiz = content.quizzes[q];
          await storage.createQuiz({
            moduleId: moduleId,
            question: quiz.question || "",
            options: quiz.options || [],
            correctAnswer: quiz.correctAnswer || "",
            explanation: quiz.explanation || "",
            order: q + 1,
          });
        }
      }

      // Create resources if they don't exist
      const existingResources = await storage.getResourcesByModule(moduleId);
      if (existingResources.length === 0) {
        let verifiedResources: any[] = [];
        try {
          verifiedResources = await searchVerifiedResources(course.title, module.title);
        } catch (resourceError) {
          console.error('Resource search failed:', resourceError);
        }
        
        const resourcesToCreate = verifiedResources.length > 0 
          ? verifiedResources 
          : (content.resources && Array.isArray(content.resources) ? content.resources : []);
        
        for (const resource of resourcesToCreate) {
          await storage.createResource({
            courseId: course.id,
            moduleId: moduleId,
            type: resource.type || "article",
            title: resource.title || "Resource",
            author: resource.author || null,
            url: resource.url || null,
            summary: resource.summary || null,
          });
        }
      }

      // Return updated module
      const updatedModule = await storage.getModule(moduleId);
      res.json(updatedModule);
    } catch (error: any) {
      console.error("Module regeneration error:", error);
      res.status(500).json({ error: error.message || "Failed to regenerate module" });
    }
  });

  // Streak endpoints
  app.get("/api/streak", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const streak = await storage.getStreak(user.claims.sub);
      res.json(streak || { currentStreak: 0, longestStreak: 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  app.post("/api/streak/update", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      await storage.updateStreak(user.claims.sub);
      const streak = await storage.getStreak(user.claims.sub);
      res.json(streak);
    } catch (error) {
      res.status(500).json({ error: "Failed to update streak" });
    }
  });

  // User stats endpoint
  app.get("/api/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const stats = await storage.getUserStats(user.claims.sub);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Progress endpoints
  app.post("/api/progress/update", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { courseId, moduleId, completed, score, timeSpent } = req.body;
      
      const progress = await storage.updateProgress({
        userId: user.claims.sub,
        courseId,
        moduleId,
        completed,
        score,
        timeSpent,
      });
      
      if (completed) {
        await storage.updateStreak(user.claims.sub);
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Progress update error:', error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.get("/api/progress/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const recentProgress = await storage.getRecentProgress(user.claims.sub, 10);
      res.json(recentProgress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent progress" });
    }
  });

  app.get("/api/progress/:courseId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const courseId = req.params.courseId as string;
      const progress = await storage.getProgress(user.claims.sub, courseId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Study session endpoints (focus timer)
  app.post("/api/study-session/start", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { courseId, moduleId, focusMode } = req.body;
      
      const existing = await storage.getActiveStudySession(user.claims.sub);
      if (existing) {
        const elapsed = Math.round((Date.now() - new Date(existing.startedAt!).getTime()) / 60000);
        await storage.endStudySession(existing.id, elapsed);
      }
      
      const session = await storage.createStudySession({
        userId: user.claims.sub,
        courseId,
        moduleId,
        focusMode: focusMode || false,
      });
      
      await storage.updateStreak(user.claims.sub);
      
      res.json(session);
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({ error: "Failed to start study session" });
    }
  });

  app.post("/api/study-session/end", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { sessionId, durationMinutes } = req.body;
      
      if (sessionId) {
        const session = await storage.endStudySession(sessionId, durationMinutes || 0);
        res.json(session);
      } else {
        const active = await storage.getActiveStudySession(user.claims.sub);
        if (active) {
          const elapsed = durationMinutes || Math.round((Date.now() - new Date(active.startedAt!).getTime()) / 60000);
          const session = await storage.endStudySession(active.id, elapsed);
          res.json(session);
        } else {
          res.json({ message: "No active session" });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to end study session" });
    }
  });

  app.get("/api/study-session/active", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const session = await storage.getActiveStudySession(user.claims.sub);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active session" });
    }
  });

  // Source endpoints (NotebookLM style)
  app.get("/api/sources/:notebookId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sources = await storage.getSourcesByNotebook(req.params.notebookId as string);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  app.post("/api/sources", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { notebookId, type, title, content, url } = req.body;
      
      const source = await storage.createSource({
        userId: user.claims.sub,
        notebookId,
        type,
        title,
        content,
        url,
        processed: true,
      });
      
      res.json(source);
    } catch (error) {
      console.error("Create source error:", error);
      res.status(500).json({ error: "Failed to create source" });
    }
  });

  app.delete("/api/sources/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteSource(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete source" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/:notebookId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getChatMessages(req.params.notebookId as string);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { notebookId, message } = req.body;
      
      // Save user message
      await storage.createChatMessage({
        userId: user.claims.sub,
        notebookId,
        role: "user",
        content: message,
      });
      
      // Get sources for context
      const sources = await storage.getSourcesByNotebook(notebookId);
      const sourceContext = sources
        .filter(s => s.content)
        .map(s => `Source: ${s.title}\n${s.content}`)
        .join("\n\n---\n\n");
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      
      const systemPrompt = sourceContext 
        ? `You are a helpful AI assistant. Answer the user's question based on the following sources. Cite specific sources when relevant. If the answer isn't in the sources, say so but still try to help.

SOURCES:
${sourceContext}`
        : `You are a helpful AI assistant. The user hasn't added any sources yet. Encourage them to add documents, URLs, or text to get more personalized answers. Still try to answer their question helpfully.`;
      
      const aiResponse = await generateWithClaude(systemPrompt, message);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId: user.claims.sub,
        notebookId,
        role: "assistant",
        content: aiResponse,
      });
      
      res.json(aiMessage);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  app.delete("/api/chat/:notebookId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.clearChatHistory(req.params.notebookId as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // Notes endpoints
  app.get("/api/notes/:moduleId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const notes = await storage.getNotesByModule(user.claims.sub, req.params.moduleId as string);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { moduleId, courseId, content } = req.body;
      
      if (!moduleId || !courseId || !content) {
        return res.status(400).json({ error: "moduleId, courseId, and content are required" });
      }
      
      const note = await storage.createNote({
        userId: user.claims.sub,
        moduleId,
        courseId,
        content,
      });
      
      res.json(note);
    } catch (error) {
      console.error("Create note error:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "content is required" });
      }
      
      const note = await storage.updateNote(req.params.id as string, content);
      res.json(note);
    } catch (error) {
      console.error("Update note error:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteNote(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Bookmarks endpoints
  app.get("/api/bookmarks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const bookmarks = await storage.getBookmarksByUser(user.claims.sub);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { moduleId, courseId } = req.body;
      
      if (!moduleId || !courseId) {
        return res.status(400).json({ error: "moduleId and courseId are required" });
      }
      
      const isAlreadyBookmarked = await storage.isBookmarked(user.claims.sub, moduleId);
      if (isAlreadyBookmarked) {
        return res.status(400).json({ error: "Module is already bookmarked" });
      }
      
      const bookmark = await storage.createBookmark({
        userId: user.claims.sub,
        moduleId,
        courseId,
      });
      
      res.json(bookmark);
    } catch (error) {
      console.error("Create bookmark error:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  app.delete("/api/bookmarks/:moduleId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      await storage.deleteBookmark(user.claims.sub, req.params.moduleId as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  // Achievements endpoints
  app.get("/api/achievements", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const achievements = await storage.getAchievementsByUser(user.claims.sub);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Learning goals endpoints
  app.get("/api/goals", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const goal = await storage.getCurrentGoal(user.claims.sub);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning goal" });
    }
  });

  app.put("/api/goals", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { weeklyModulesTarget, weeklyHoursTarget } = req.body;
      
      const goal = await storage.updateGoal(user.claims.sub, {
        weeklyModulesTarget,
        weeklyHoursTarget,
      });
      
      res.json(goal);
    } catch (error) {
      console.error("Update goal error:", error);
      res.status(500).json({ error: "Failed to update learning goal" });
    }
  });

  // Folders endpoints
  app.get("/api/folders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const folders = await storage.getFoldersByUser(user.claims.sub);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { name, color } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Folder name is required" });
      }
      
      const folder = await storage.createFolder({
        userId: user.claims.sub,
        name,
        color: color || "#6366f1",
      });
      
      res.json(folder);
    } catch (error) {
      console.error("Create folder error:", error);
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  app.put("/api/folders/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { name, color } = req.body;
      
      const folder = await storage.updateFolder(req.params.id as string, { name, color });
      res.json(folder);
    } catch (error) {
      console.error("Update folder error:", error);
      res.status(500).json({ error: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteFolder(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  app.post("/api/folders/:id/courses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }
      
      const courseFolder = await storage.addCourseToFolder(courseId, req.params.id as string);
      res.json(courseFolder);
    } catch (error) {
      console.error("Add course to folder error:", error);
      res.status(500).json({ error: "Failed to add course to folder" });
    }
  });

  app.delete("/api/folders/:id/courses/:courseId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.removeCourseFromFolder(req.params.courseId as string, req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove course from folder" });
    }
  });

  app.get("/api/folders/:id/courses", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const courses = await storage.getCoursesByFolder(req.params.id as string);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses in folder" });
    }
  });

  app.get("/api/course-folder-mappings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const mappings = await storage.getCourseFolderMappings(user.claims.sub);
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course folder mappings" });
    }
  });

  app.delete("/api/user/clear-data", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as { claims: { sub: string } };
      await storage.clearUserData(user.claims.sub);
      res.json({ success: true });
    } catch (error) {
      console.error("Clear data error:", error);
      res.status(500).json({ error: "Failed to clear user data" });
    }
  });

  // Flashcards - spaced repetition
  app.get("/api/flashcards/due", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const flashcards = await storage.getFlashcardsDueForReview(user.claims.sub);
      res.json(flashcards);
    } catch (error) {
      console.error("Get due flashcards error:", error);
      res.status(500).json({ error: "Failed to fetch due flashcards" });
    }
  });

  app.get("/api/flashcards/:moduleId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const flashcards = await storage.getFlashcardsByModule(user.claims.sub, req.params.moduleId as string);
      res.json(flashcards);
    } catch (error) {
      console.error("Get flashcards error:", error);
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  app.post("/api/flashcards/generate/:moduleId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const moduleId = req.params.moduleId as string;
      
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
      
      const course = await storage.getCourse(module.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      
      const content = module.content as any;
      const contentText = JSON.stringify({
        title: module.title,
        description: module.description,
        overview: content?.overview || "",
        keyPoints: content?.keyPoints || [],
        detailedExplanation: content?.detailedExplanation || "",
      });
      
      const prompt = `Generate 5-8 flashcards for studying this educational content. Return ONLY valid JSON:
[
  { "front": "Question or term", "back": "Answer or definition" }
]

Content:
${contentText}`;
      
      const response = await generateWithClaude(
        "You are an expert educator creating flashcards for spaced repetition learning. Create clear, concise question-answer pairs. Return ONLY valid JSON array.",
        prompt
      );
      
      let flashcardsData;
      try {
        const jsonStr = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        flashcardsData = JSON.parse(jsonStr);
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse AI response" });
      }
      
      const createdFlashcards = [];
      for (const card of flashcardsData) {
        const flashcard = await storage.createFlashcard({
          userId: user.claims.sub,
          moduleId: moduleId,
          courseId: module.courseId,
          front: card.front,
          back: card.back,
        });
        createdFlashcards.push(flashcard);
      }
      
      res.json(createdFlashcards);
    } catch (error) {
      console.error("Generate flashcards error:", error);
      res.status(500).json({ error: "Failed to generate flashcards" });
    }
  });

  app.post("/api/flashcards/:id/review", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { quality } = req.body;
      
      if (typeof quality !== 'number' || quality < 0 || quality > 5) {
        return res.status(400).json({ error: "Quality must be a number between 0 and 5" });
      }
      
      const flashcard = await storage.updateFlashcardAfterReview(req.params.id as string, quality);
      res.json(flashcard);
    } catch (error) {
      console.error("Review flashcard error:", error);
      res.status(500).json({ error: "Failed to update flashcard" });
    }
  });

  app.delete("/api/flashcards/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteFlashcard(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete flashcard error:", error);
      res.status(500).json({ error: "Failed to delete flashcard" });
    }
  });

  // Shared courses
  app.post("/api/courses/:id/share", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const courseId = req.params.id as string;
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      if (course.userId !== user.claims.sub) {
        return res.status(403).json({ error: "Not authorized to share this course" });
      }
      
      const sharedCourse = await storage.createSharedCourse(courseId, user.claims.sub);
      res.json(sharedCourse);
    } catch (error) {
      console.error("Share course error:", error);
      res.status(500).json({ error: "Failed to share course" });
    }
  });

  app.get("/api/shared/:shareCode", async (req: Request, res: Response) => {
    try {
      const sharedCourse = await storage.getSharedCourse(req.params.shareCode as string);
      if (!sharedCourse) {
        return res.status(404).json({ error: "Shared course not found" });
      }
      
      const course = await storage.getCourse(sharedCourse.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      const modules = await storage.getModulesByCourse(course.id);
      
      res.json({ sharedCourse, course, modules });
    } catch (error) {
      console.error("Get shared course error:", error);
      res.status(500).json({ error: "Failed to fetch shared course" });
    }
  });

  app.delete("/api/shared/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteSharedCourse(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete shared course error:", error);
      res.status(500).json({ error: "Failed to delete share link" });
    }
  });

  // Certificates
  app.get("/api/certificates/:courseId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const certificate = await storage.getCertificate(user.claims.sub, req.params.courseId as string);
      res.json(certificate || null);
    } catch (error) {
      console.error("Get certificate error:", error);
      res.status(500).json({ error: "Failed to fetch certificate" });
    }
  });

  app.post("/api/certificates/:courseId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const courseId = req.params.courseId as string;
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      const certificate = await storage.createCertificate(user.claims.sub, courseId);
      res.json(certificate);
    } catch (error) {
      console.error("Create certificate error:", error);
      res.status(500).json({ error: "Failed to create certificate" });
    }
  });

  // Custom quizzes
  app.get("/api/custom-quizzes/:moduleId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const quizzes = await storage.getCustomQuizzesByModule(user.claims.sub, req.params.moduleId as string);
      res.json(quizzes);
    } catch (error) {
      console.error("Get custom quizzes error:", error);
      res.status(500).json({ error: "Failed to fetch custom quizzes" });
    }
  });

  app.post("/api/custom-quizzes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { moduleId, question, options, correctAnswer, explanation } = req.body;
      
      if (!moduleId || !question || !options || !correctAnswer) {
        return res.status(400).json({ error: "moduleId, question, options, and correctAnswer are required" });
      }
      
      const quiz = await storage.createCustomQuiz({
        userId: user.claims.sub,
        moduleId,
        question,
        options,
        correctAnswer,
        explanation: explanation || null,
      });
      
      res.json(quiz);
    } catch (error) {
      console.error("Create custom quiz error:", error);
      res.status(500).json({ error: "Failed to create custom quiz" });
    }
  });

  app.delete("/api/custom-quizzes/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteCustomQuiz(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete custom quiz error:", error);
      res.status(500).json({ error: "Failed to delete custom quiz" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiConfigured: !!process.env.ANTHROPIC_API_KEY });
  });

  return httpServer;
}
