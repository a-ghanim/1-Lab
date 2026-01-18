import OpenAI from 'openai';
import { BLACK_HOLE_SKETCH, PHOTOSYNTHESIS_SKETCH, PENDULUM_SKETCH, GENERIC_SKETCH } from './p5-examples';

export interface GeneratedContent {
  sketch: string;
  questions: {
    question: string;
    options: string[];
    answer: string; // The correct option
  }[];
}

const SYSTEM_PROMPT = `
You are an expert p5.js Creative Coder and Science Educator.
Your goal is to generate interactive educational simulations.

Output Format: JSON only.
{
  "sketch": "p.setup = function() { ... }; p.draw = function() { ... };",
  "questions": [
    { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" },
    ... 3 questions ...
  ]
}

Sketch Rules:
1. Use 'p' as the p5 instance variable (Instance Mode).
2. Do NOT use global variables. Attach variables to 'p' if needed, or use closure variables within the wrapper I will add.
3. Make it INTERACTIVE (mouse, automated movement, or visual feedback).
4. Keep it visual and beautiful.
5. Canvas size should be responsive or fixed 600x400.
6. Handle window resize if possible.
`;

export async function generateSimulation(concept: string, apiKey: string | null): Promise<GeneratedContent> {
  // 1. Check for Hardcoded Examples first (fast & reliable for demo)
  const lowerConcept = concept.toLowerCase();
  
  if (lowerConcept.includes('black hole') || lowerConcept.includes('gravity')) {
    return {
      sketch: BLACK_HOLE_SKETCH,
      questions: [
        {
          question: "What is the point of no return around a black hole called?",
          options: ["Singularity", "Event Horizon", "Accretion Disk", "Photon Sphere"],
          answer: "Event Horizon"
        },
        {
          question: "What happens to time as you approach the Event Horizon?",
          options: ["It speeds up", "It stops", "It slows down (Time Dilation)", "It reverses"],
          answer: "It slows down (Time Dilation)"
        },
        {
          question: "What is the glowing ring of matter around a black hole?",
          options: ["Nebula", "Star Cluster", "Accretion Disk", "Asteroid Belt"],
          answer: "Accretion Disk"
        }
      ]
    };
  }
  
  if (lowerConcept.includes('photosynthesis') || lowerConcept.includes('plant')) {
    return {
      sketch: PHOTOSYNTHESIS_SKETCH,
      questions: [
        {
          question: "What input energy drives photosynthesis?",
          options: ["Heat", "Sound", "Light (Photons)", "Kinetic Energy"],
          answer: "Light (Photons)"
        },
        {
          question: "What gas do plants release as a byproduct?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Methane"],
          answer: "Oxygen"
        },
        {
          question: "Which molecule provides the electrons in the light-dependent reactions?",
          options: ["CO2", "H2O (Water)", "Glucose", "Chlorophyll"],
          answer: "H2O (Water)"
        }
      ]
    };
  }

  if (lowerConcept.includes('pendulum') || lowerConcept.includes('harmonic')) {
    return {
      sketch: PENDULUM_SKETCH,
      questions: [
        {
          question: "What primarily determines the period of a simple pendulum?",
          options: ["Mass of the bob", "Length of the string", "Initial angle", "Air resistance"],
          answer: "Length of the string"
        },
        {
          question: "At which point is the kinetic energy highest?",
          options: ["At the highest point", "At the lowest point (equilibrium)", "Halfway down", "It is constant"],
          answer: "At the lowest point (equilibrium)"
        },
        {
          question: "What force restores the pendulum to the center?",
          options: ["Tension", "Gravity (component)", "Friction", "Centripetal force"],
          answer: "Gravity (component)"
        }
      ]
    };
  }

  // 2. If valid API Key provided, use Real AI
  if (apiKey) {
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Client-side demo only
      });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Create a simulation for: ${concept}` }
        ],
        model: "gpt-3.5-turbo",
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content generated");
      
      // Parse JSON from potential markdown blocks
      const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
      
    } catch (err) {
      console.error("AI Generation Failed:", err);
      // Fallback to generic if AI fails
    }
  }

  // 3. Fallback Generic
  return {
    sketch: GENERIC_SKETCH,
    questions: [
      {
        question: "Why are you seeing this generic simulation?",
        options: ["The concept was too abstract", "No API Key provided", "AI is sleeping", "This is a feature"],
        answer: "No API Key provided"
      },
      {
        question: "How can you get a specific simulation for '" + concept + "'?",
        options: ["Try 'Black Hole'", "Try 'Photosynthesis'", "Add an OpenAI Key in settings", "All of the above"],
        answer: "All of the above"
      },
      {
        question: "What library powers these graphics?",
        options: ["Three.js", "p5.js", "D3.js", "Pixi.js"],
        answer: "p5.js"
      }
    ]
  };
}
