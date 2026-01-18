import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isAuthenticated } from "./replit_integrations/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getGeminiModel(useProModel = false) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const modelName = useProModel ? "gemini-2.5-pro" : "gemini-2.5-flash";
  return genAI.getGenerativeModel({ model: modelName });
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
      "simulationCode": "// p5.js instance mode code for interactive visualization (use 'p' as instance)",
      "quizzes": [
        { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why A is correct" }
      ],
      "resources": [
        { "type": "article|paper|video|book", "title": "Resource title", "author": "Author name", "url": "URL if available", "summary": "Brief summary" }
      ]
    }
  ]
}

Rules:
1. Create 4-6 modules with progressive difficulty
2. Each module should have 1-2 quizzes and 2-3 resources
3. Simulation code must be valid p5.js instance mode (use 'p' as variable)
4. Resources should be real, educational content when possible
5. Make simulations interactive and visually engaging
6. Canvas size: p.createCanvas(Math.min(600, p.windowWidth - 40), 400)`;

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

const MODULE_CONTENT_PROMPT = `You are an expert educator. Generate COMPLETE content for a single module.

Output Format: Valid JSON only, no markdown code blocks.
{
  "content": { "overview": "Detailed module overview (2-3 paragraphs)", "keyPoints": ["point1", "point2", "point3"] },
  "estimatedMinutes": 30,
  "simulationCode": "// p5.js instance mode code (use 'p' as variable)",
  "quizzes": [
    { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Why A is correct" }
  ],
  "resources": [
    { "type": "article|paper|video|book", "title": "Resource title", "author": "Author name", "url": "URL if available", "summary": "Brief summary" }
  ]
}

Rules:
1. Create 1-2 quizzes that test understanding
2. Include 2-3 relevant educational resources
3. Simulation must be valid p5.js instance mode (use 'p' as variable)
4. Make simulation interactive and visually engaging
5. Canvas: p.createCanvas(Math.min(600, p.windowWidth - 40), 400)`;

const SIMULATION_PROMPT = `You are an expert p5.js Creative Coder and Science Educator.
Generate an interactive educational simulation.

Output Format: Valid JSON only, no markdown code blocks.
{
  "sketch": "// p5.js instance mode code here",
  "questions": [
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" },
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "B" },
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "C" }
  ]
}

Sketch Rules:
1. Use 'p' as the p5 instance variable (Instance Mode).
2. Do NOT use global variables. Use closure variables within the sketch.
3. Make it INTERACTIVE - respond to mouse movement, clicks, or have automated motion.
4. Keep it visual, beautiful, and educational.
5. Canvas size: p.createCanvas(Math.min(600, p.windowWidth - 40), 400)
6. Include visual labels or annotations where helpful.
7. Use vibrant colors that work on dark backgrounds.`;

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
      const courses = await storage.getCoursesByUser(user.claims.sub);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
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
      
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      
      const model = getGeminiModel(true);
      
      const result = await model.generateContent([
        CURRICULUM_PROMPT,
        `Create a complete curriculum for the topic: "${prompt}". 
        
Make it engaging, progressive, and include interactive p5.js simulations.
Return ONLY valid JSON, no markdown.`
      ]);

      const content = result.response.text();
      if (!content) {
        return res.status(500).json({ error: "No content generated" });
      }
      
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
            simulationCode: moduleData.simulationCode || null,
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

  // Streaming course generation - creates outline first, then streams modules
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

    if (!GEMINI_API_KEY) {
      sendEvent('error', { message: 'AI service not configured' });
      res.end();
      return;
    }

    try {
      // Step 1: Generate course outline quickly
      sendEvent('progress', { step: 'outline', message: 'Creating course outline...' });

      const outlineModel = getGeminiModel(false); // Use flash for speed
      const outlineResult = await outlineModel.generateContent([
        COURSE_OUTLINE_PROMPT,
        `Create a course outline for: "${prompt}". Return ONLY valid JSON.`
      ]);

      const outlineContent = outlineResult.response.text();
      if (!outlineContent) {
        sendEvent('error', { message: 'Failed to generate outline' });
        res.end();
        return;
      }

      let outlineJson = outlineContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      let outline;
      try {
        outline = JSON.parse(outlineJson);
      } catch (e) {
        sendEvent('error', { message: 'Failed to parse outline' });
        res.end();
        return;
      }

      // Step 2: Create course in database
      const course = await storage.createCourse({
        userId: user.claims.sub,
        title: outline.title || prompt,
        description: outline.description || "",
        prompt: prompt,
        curriculum: outline,
        totalModules: outline.modules?.length || 0,
        estimatedHours: outline.estimatedHours || 0,
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
          simulationCode: null,
          estimatedMinutes: 30,
        });
        moduleRecords.push(moduleRecord);
      }

      // Send course created event - frontend navigates to course page now
      sendEvent('course_created', { 
        course, 
        modules: moduleRecords.map(m => ({ 
          id: m.id, 
          title: m.title, 
          description: m.description, 
          order: m.order,
          loading: true 
        }))
      });

      // Step 3: Generate full content for each module
      const contentModel = getGeminiModel(true); // Use pro for quality

      for (let i = 0; i < moduleRecords.length; i++) {
        const moduleRecord = moduleRecords[i];
        const moduleOutline = outline.modules[i];

        sendEvent('module_generating', { 
          moduleId: moduleRecord.id, 
          moduleIndex: i,
          message: `Generating "${moduleOutline.title}"...`
        });

        try {
          const contentResult = await contentModel.generateContent([
            MODULE_CONTENT_PROMPT,
            `Generate complete content for this module:
Course: "${outline.title}"
Module ${i + 1}: "${moduleOutline.title}"
Description: "${moduleOutline.description}"

The simulation should visualize concepts from this specific module.
Return ONLY valid JSON.`
          ]);

          const contentText = contentResult.response.text();
          let contentJson = contentText?.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim() || '{}';
          
          let content;
          try {
            content = JSON.parse(contentJson);
          } catch (e) {
            content = { content: { overview: "Content generation failed" }, simulationCode: null, quizzes: [], resources: [] };
          }

          // Update module with full content
          await storage.updateModule(moduleRecord.id, {
            content: content.content || {},
            simulationCode: content.simulationCode || null,
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

          // Create resources
          if (content.resources && Array.isArray(content.resources)) {
            for (const resource of content.resources) {
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

  // Original simulation endpoints
  app.post("/api/generate-stream", async (req, res) => {
    const { concept } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };
    
    if (!concept) {
      sendEvent('error', { message: 'Concept is required' });
      res.end();
      return;
    }
    
    if (!GEMINI_API_KEY) {
      sendEvent('error', { message: 'AI service not configured' });
      res.end();
      return;
    }
    
    try {
      sendEvent('progress', { step: 1, total: 4, message: 'Connecting to AI...' });
      
      const model = getGeminiModel();
      
      sendEvent('progress', { step: 2, total: 4, message: `Generating ${concept} simulation...` });
      
      const result = await model.generateContent([
        SIMULATION_PROMPT,
        `Create an interactive p5.js simulation for: "${concept}". Return ONLY valid JSON.`
      ]);

      sendEvent('progress', { step: 3, total: 4, message: 'Processing response...' });
      
      const content = result.response.text();
      if (!content) {
        sendEvent('error', { message: 'No content generated' });
        res.end();
        return;
      }
      
      let jsonStr = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      sendEvent('progress', { step: 4, total: 4, message: 'Building simulation...' });
      
      try {
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.sketch || !Array.isArray(parsed.questions)) {
          sendEvent('error', { message: 'Invalid response structure' });
          res.end();
          return;
        }
        
        sendEvent('complete', { data: parsed });
        res.end();
        
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        sendEvent('error', { message: 'Failed to parse response' });
        res.end();
      }
      
    } catch (error: any) {
      console.error("Generation error:", error);
      sendEvent('error', { message: error.message || 'Generation failed' });
      res.end();
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { concept } = req.body;
      
      if (!concept || typeof concept !== "string") {
        return res.status(400).json({ error: "Concept is required" });
      }
      
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }
      
      const model = getGeminiModel();

      const result = await model.generateContent([
        SIMULATION_PROMPT,
        `Create an interactive p5.js simulation for: "${concept}". Return ONLY valid JSON.`
      ]);

      const content = result.response.text();
      if (!content) {
        return res.status(500).json({ error: "No content generated" });
      }
      
      let jsonStr = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      try {
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.sketch || !Array.isArray(parsed.questions)) {
          return res.status(500).json({ error: "Invalid response structure" });
        }
        
        return res.json(parsed);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return res.status(500).json({ error: "Failed to parse response" });
      }
      
    } catch (error: any) {
      console.error("Generation error:", error);
      return res.status(500).json({ error: error.message || "Generation failed" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiConfigured: !!GEMINI_API_KEY });
  });

  return httpServer;
}
