import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert p5.js Creative Coder and Science Educator.
Your goal is to generate interactive educational simulations.

Output Format: Valid JSON only, no markdown code blocks, no explanation.
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
7. Use vibrant colors that work on dark backgrounds.
8. The code must be a string that can be passed to new Function('p', code).`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/generate", async (req, res) => {
    try {
      const { concept, apiKey } = req.body;
      
      if (!concept || typeof concept !== "string") {
        return res.status(400).json({ error: "Concept is required" });
      }
      
      if (!apiKey || typeof apiKey !== "string") {
        return res.status(400).json({ error: "API key is required for custom generation" });
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        SYSTEM_PROMPT,
        `Create an interactive p5.js simulation for the concept: "${concept}". 
        
The simulation should visually demonstrate the key principles of ${concept}.
Include mouse interactivity or animation to make it engaging.
Generate 3 educational multiple-choice questions about ${concept}.

Return ONLY valid JSON, no markdown.`
      ]);

      const content = result.response.text();
      if (!content) {
        return res.status(500).json({ error: "No content generated from AI" });
      }
      
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Try to parse the JSON
      try {
        const parsed = JSON.parse(jsonStr);
        
        // Validate the response structure
        if (!parsed.sketch || !Array.isArray(parsed.questions)) {
          return res.status(500).json({ error: "Invalid response structure from AI" });
        }
        
        return res.json(parsed);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw content:", content);
        return res.status(500).json({ error: "Failed to parse AI response as JSON" });
      }
      
    } catch (error: any) {
      console.error("Generation error:", error);
      
      // Handle specific Gemini API errors
      if (error.message?.includes("API_KEY_INVALID")) {
        return res.status(401).json({ error: "Invalid Gemini API key" });
      }
      
      return res.status(500).json({ 
        error: error.message || "Failed to generate simulation" 
      });
    }
  });

  return httpServer;
}
