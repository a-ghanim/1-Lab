import { BLACK_HOLE_SKETCH, PHOTOSYNTHESIS_SKETCH, PENDULUM_SKETCH, GENERIC_SKETCH } from './p5-examples';

export interface GeneratedContent {
  sketch: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface StreamProgress {
  step: number;
  total: number;
  message: string;
}

export async function generateSimulation(
  concept: string, 
  apiKey: string | null,
  onProgress?: (progress: StreamProgress) => void
): Promise<GeneratedContent> {
  const lowerConcept = concept.toLowerCase();
  
  // Check for hardcoded examples first (fast & reliable)
  if (lowerConcept.includes('black hole') || lowerConcept.includes('gravity well')) {
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

  if (lowerConcept.includes('pendulum') || lowerConcept.includes('harmonic') || lowerConcept.includes('oscillat')) {
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

  // Use streaming POST endpoint if key is provided
  if (apiKey && onProgress) {
    return new Promise((resolve, reject) => {
      // Use fetch with streaming for secure POST (API key in body, not URL)
      fetch('/api/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, apiKey }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to connect to generation service');
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream available');
        }
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Parse SSE messages from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'progress') {
                  onProgress({
                    step: data.step,
                    total: data.total,
                    message: data.message
                  });
                } else if (data.type === 'complete') {
                  resolve(data.data);
                  return;
                } else if (data.type === 'error') {
                  reject(new Error(data.message));
                  return;
                }
              } catch (err) {
                console.error('Error parsing SSE data:', err);
              }
            }
          }
        }
        
        reject(new Error('Stream ended without completion'));
      }).catch(reject);
    });
  }
  
  // Use server-side Gemini API if key is provided (fallback without streaming)
  if (apiKey) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, apiKey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }
      
      return await response.json();
      
    } catch (err) {
      console.error("Generation Failed:", err);
      throw err;
    }
  }

  // Fallback to generic simulation
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
        options: ["Try 'Black Hole'", "Try 'Photosynthesis'", "Add a Gemini API Key in settings", "All of the above"],
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
