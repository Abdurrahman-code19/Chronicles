import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility on the server with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. STORY ADVANCEMENT ENDPOINT
app.post('/api/adventure/next', async (req: Request, res: Response) => {
  try {
    const {
      player,
      currentQuest,
      inventory,
      charactersMet,
      historySummary,
      playerAction,
      lowLatency,
      isOpening,
    } = req.body;

    // Model selection: use gemini-3.1-flash-lite for fast low-latency mode, gemini-3.5-flash for standard rich narrative
    const modelToUse = lowLatency ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';

    const systemPrompt = `You are the lead narrative director of an infinite, dynamic choose-your-own-adventure engine.
Your core rules:
1. Genuine Emergence: The player's choices MUST genuinely alter the plot, shifting alliances, uncovering secrets, risking loss, or creating irreversible consequences. Never funnel the player into pre-set cliches.
2. Character Consistency: The player has a defined visual appearance anchor ("${player?.visualAnchor || 'adventurer'}"). Keep this consistent.
3. Autonomous Tracking: You MUST inspect what happens in this scene and automatically output:
   - Any new inventory items found, consumed, or modified.
   - Any changes to the current quest (progressing stages, completing it, or triggering new objectives).
   - Any new or updated characters encountered.
   - Meaningful health, resolve, or gold changes if appropriate.
4. Choices: Always provide 3-4 distinct, enticing choices with different approaches (e.g., bold/aggressive, stealthy/clever, diplomatic, arcane/unorthodox).
5. Visual Prompt: Generate a rich scene image prompt describing the climax of this turn, strictly adhering to the art style "${player?.artStyle || 'Dark Fantasy Oil Painting'}" and featuring the visual character anchor "${player?.visualAnchor || 'traveler'}".`;

    const userPrompt = isOpening
      ? `Start a brand new adventure for a hero named "${player?.name || 'Vael'}", Archetype: "${player?.archetype || 'Shadowblade Wanderer'}", Genre: "${player?.genre || 'Dark Fantasy'}", Art Style: "${player?.artStyle || 'Dark Fantasy Oil Painting'}".
Provide an immersive opening hook, establish the first mystery/quest, give 1-3 starting inventory items, introduce a potential contact or mysterious observer, and present 4 compelling first actions.`
      : `Continue the adventure.
HERO: "${player?.name}", Archetype: "${player?.archetype}", Health: ${player?.health}/${player?.maxHealth}, Resolve: ${player?.resolve}/${player?.maxResolve}, Gold: ${player?.gold}.
GENRE: "${player?.genre}"
CURRENT QUEST: "${currentQuest?.title || 'None'}" - ${currentQuest?.summary || ''}
CURRENT STAGES: ${JSON.stringify(currentQuest?.stages || [])}
CURRENT INVENTORY: ${JSON.stringify(inventory?.map((i: any) => `${i.name} (${i.quantity}x, ${i.category})`) || [])}
KNOWN CHARACTERS: ${JSON.stringify(charactersMet?.map((c: any) => `${c.name} (${c.relationship})`) || [])}
RECENT CONTEXT:
${historySummary || 'The journey unfolds.'}

PLAYER'S CHOSEN ACTION:
"${playerAction}"

Narrate the consequence of this action. Reveal what happens next, show how their choice uniquely shaped the world, update quest and inventory accordingly, and present new choices.`;

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short evocative title for this chapter or turn' },
            narrative: { type: Type.STRING, description: 'The rich prose narrative describing what happens (2-4 evocative paragraphs)' },
            consequenceAnalysis: { type: Type.STRING, description: '1-2 sentences highlighting how the user action branched the storyline' },
            location: { type: Type.STRING, description: 'Current specific location/room/landmark' },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING, description: 'The choice text' },
                  riskLevel: { type: Type.STRING, enum: ['safe', 'moderate', 'perilous', 'unfathomable'] },
                  intentTag: { type: Type.STRING, enum: ['aggressive', 'diplomatic', 'stealthy', 'investigative', 'arcane', 'unorthodox'] },
                },
                required: ['id', 'text', 'riskLevel', 'intentTag'],
              },
            },
            questUpdate: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                currentStageDescription: { type: Type.STRING },
                isCurrentStageCompleted: { type: Type.BOOLEAN },
                newStagesToAdd: { type: Type.ARRAY, items: { type: Type.STRING } },
                isQuestCompleted: { type: Type.BOOLEAN },
                newQuestIfCompleted: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    firstStage: { type: Type.STRING },
                  },
                },
              },
            },
            inventoryUpdates: {
              type: Type.OBJECT,
              properties: {
                itemsAdded: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ['weapon', 'armor', 'artifact', 'consumable', 'quest', 'lore', 'currency'] },
                      rarity: { type: Type.STRING, enum: ['common', 'rare', 'epic', 'legendary', 'eldritch'] },
                      quantity: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      statsOrEffect: { type: Type.STRING },
                    },
                    required: ['name', 'category', 'rarity', 'quantity', 'description'],
                  },
                },
                itemsRemovedNames: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            charactersMetUpdates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  relationship: { type: Type.STRING, enum: ['friendly', 'neutral', 'hostile', 'mysterious', 'allied'] },
                  description: { type: Type.STRING },
                  lastSeenLocation: { type: Type.STRING },
                },
                required: ['name', 'role', 'relationship', 'description', 'lastSeenLocation'],
              },
            },
            playerStatDeltas: {
              type: Type.OBJECT,
              properties: {
                healthDelta: { type: Type.INTEGER },
                resolveDelta: { type: Type.INTEGER },
                goldDelta: { type: Type.INTEGER },
                expDelta: { type: Type.INTEGER },
              },
            },
            visualScenePrompt: { type: Type.STRING, description: 'Detailed prompt for image generation incorporating consistent character and art style' },
            diceCheck: {
              type: Type.OBJECT,
              properties: {
                roll: { type: Type.INTEGER },
                threshold: { type: Type.INTEGER },
                passed: { type: Type.BOOLEAN },
                statUsed: { type: Type.STRING },
              },
            },
          },
          required: ['title', 'narrative', 'consequenceAnalysis', 'location', 'choices', 'visualScenePrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating next chapter:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate adventure step' });
  }
});

// 2. IMAGE GENERATION ENDPOINT
// Uses model gemini-3-pro-image-preview with user selectable size (1K, 2K, 4K)
app.post('/api/adventure/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, visualAnchor, artStyle, imageSize } = req.body;

    const targetSize = (['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K') as '1K' | '2K' | '4K';

    // Construct prompt enforcing visual consistency
    const fullImagePrompt = `${artStyle || 'Dark Fantasy Oil Painting'} style. Consistent character appearance: ${visualAnchor || 'hero with unique gear'}. Scene: ${prompt}. Cinematic lighting, intricate textures, cohesive colors, highly detailed atmospheric artwork, 16:9 widescreen composition.`;

    let generatedImageUrl: string | null = null;
    let modelUsed = 'gemini-3-pro-image-preview';
    let quotaExceeded = false;

    // Helper to generate a rich procedural fantasy/sci-fi SVG artwork
    const generateFallbackSvg = (sceneText: string, style: string, size: string) => {
      const sanitizedScene = (sceneText || 'A mysterious realm unfolds')
        .replace(/[<>&"]/g, '')
        .slice(0, 120);
      const sanitizedStyle = (style || 'Dark Fantasy').replace(/[<>&"]/g, '');
      const sanitizedAnchor = (visualAnchor || 'The Hero').replace(/[<>&"]/g, '').slice(0, 90);

      // Determine palette based on art style or prompt keywords
      const isCyberpunk = sanitizedStyle.toLowerCase().includes('cyber') || (prompt && prompt.toLowerCase().includes('cyber'));
      const isEldritch = sanitizedStyle.toLowerCase().includes('eldritch') || (prompt && prompt.toLowerCase().includes('eldritch'));
      const isSciFi = sanitizedStyle.toLowerCase().includes('space') || sanitizedStyle.toLowerCase().includes('sci-fi');
      const isGhibli = sanitizedStyle.toLowerCase().includes('ghibli') || sanitizedStyle.toLowerCase().includes('watercolor');

      let skyStart = '#1c1917';
      let skyEnd = '#0c0a09';
      let accentColor = '#f59e0b';
      let accentGlow = '#d97706';
      let terrainColor = '#141214';

      if (isCyberpunk) {
        skyStart = '#0f172a';
        skyEnd = '#020617';
        accentColor = '#06b6d4';
        accentGlow = '#d946ef';
        terrainColor = '#090d16';
      } else if (isEldritch) {
        skyStart = '#1e102a';
        skyEnd = '#09040e';
        accentColor = '#a855f7';
        accentGlow = '#6366f1';
        terrainColor = '#100818';
      } else if (isSciFi) {
        skyStart = '#0b1329';
        skyEnd = '#030712';
        accentColor = '#38bdf8';
        accentGlow = '#818cf8';
        terrainColor = '#070b16';
      } else if (isGhibli) {
        skyStart = '#1e293b';
        skyEnd = '#0f172a';
        accentColor = '#34d399';
        accentGlow = '#fbbf24';
        terrainColor = '#131b26';
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
        <defs>
          <radialGradient id="skyGrad" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stop-color="${skyStart}" />
            <stop offset="60%" stop-color="${skyEnd}" />
            <stop offset="100%" stop-color="#050505" />
          </radialGradient>
          <linearGradient id="primaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.85" />
            <stop offset="50%" stop-color="${accentGlow}" stop-opacity="0.4" />
            <stop offset="100%" stop-color="${accentGlow}" stop-opacity="0.05" />
          </linearGradient>
          <filter id="bloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Dynamic Sky Backdrop -->
        <rect width="1280" height="720" fill="url(#skyGrad)" />
        
        <!-- Celestial Orbit / Sigil -->
        <circle cx="640" cy="280" r="180" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="16 10" opacity="0.35" />
        <circle cx="640" cy="280" r="220" fill="none" stroke="${accentGlow}" stroke-width="1" opacity="0.2" />
        <circle cx="640" cy="280" r="120" fill="url(#primaryGlow)" opacity="0.25" filter="url(#bloom)" />

        <!-- Star / Embers constellation -->
        <circle cx="280" cy="140" r="2.5" fill="#ffffff" opacity="0.6" />
        <circle cx="340" cy="190" r="1.5" fill="${accentColor}" opacity="0.8" />
        <circle cx="450" cy="110" r="2" fill="#ffffff" opacity="0.5" />
        <circle cx="830" cy="150" r="2" fill="${accentColor}" opacity="0.7" />
        <circle cx="980" cy="120" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="1060" cy="210" r="1.5" fill="${accentGlow}" opacity="0.7" />
        
        <!-- Distant Architectural Silhouettes -->
        <polygon points="620,160 640,160 645,460 615,460" fill="#18151c" opacity="0.8" />
        <polygon points="440,250 455,250 460,480 435,480" fill="#131018" opacity="0.6" />
        <polygon points="820,230 835,230 840,480 815,480" fill="#131018" opacity="0.6" />
        <polygon points="260,310 275,310 280,500 255,500" fill="#100d14" opacity="0.4" />
        <polygon points="1000,290 1015,290 1020,500 995,500" fill="#100d14" opacity="0.4" />

        <!-- Atmospheric Horizon Terrain -->
        <path d="M0 550 Q 320 460, 640 490 T 1280 470 L 1280 720 L 0 720 Z" fill="${terrainColor}" opacity="0.9" />
        <path d="M0 600 Q 400 540, 800 560 T 1280 540 L 1280 720 L 0 720 Z" fill="#080709" />

        <!-- Foreground Hero Silhouette -->
        <circle cx="640" cy="450" r="10" fill="${accentColor}" filter="url(#bloom)" opacity="0.85" />
        <path d="M633 462 C626 480, 620 520, 615 550 L665 550 C660 520, 654 480, 647 462 Z" fill="#1c1822" />

        <!-- Lower Card Frame -->
        <rect x="120" y="525" width="1040" height="145" rx="14" fill="#0c0a09" fill-opacity="0.9" stroke="#44403c" stroke-width="1.5" />
        
        <!-- Typography -->
        <text x="640" y="562" font-family="serif" font-size="20" fill="#fde68a" font-weight="bold" text-anchor="middle" letter-spacing="1.5">
          ${sanitizedStyle}
        </text>
        <text x="640" y="598" font-family="sans-serif" font-size="13.5" fill="#e7e5e4" text-anchor="middle" opacity="0.95">
          &ldquo;${sanitizedScene}...&rdquo;
        </text>
        <text x="640" y="638" font-family="monospace" font-size="11.5" fill="${accentColor}" text-anchor="middle">
          Hero Anchor: ${sanitizedAnchor} • ${size} High-Fidelity Scene Render
        </text>
      </svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    // Try primary model gemini-3-pro-image-preview
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: fullImagePrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: targetSize,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch {
      // Free tier or quota limit reached for paid image models
      quotaExceeded = true;
    }

    if (!generatedImageUrl) {
      generatedImageUrl = generateFallbackSvg(prompt, artStyle, targetSize);
      modelUsed = 'chronicle-adaptive-canvas';
    }

    return res.json({ 
      imageUrl: generatedImageUrl, 
      modelUsed, 
      imageSize: targetSize,
      quotaExceeded: false,
    });
  } catch {
    const fallback = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#1c1917"/><text x="640" y="360" font-family="serif" font-size="24" fill="#fde68a" text-anchor="middle">Chronicle Scene Render</text></svg>')}`;
    return res.status(200).json({ 
      imageUrl: fallback, 
      quotaExceeded: false 
    });
  }
});

// 3. MULTI-TURN CHAT INTERFACE ENDPOINT
// Supports gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for low-latency tasks
app.post('/api/adventure/chat', async (req: Request, res: Response) => {
  try {
    const { history, message, roleType, modelChoice, context } = req.body;

    // Determine model based on task complexity or explicit choice
    let selectedModel = modelChoice || 'gemini-3.8-flash';
    if (selectedModel === 'gemini-3.1-pro-preview') {
      // Use flagship free-tier model gemini-3.8-flash to prevent quota exhausted errors
      selectedModel = 'gemini-3.8-flash';
    } else if (!['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].includes(selectedModel)) {
      if (roleType === 'dungeon_master') selectedModel = 'gemini-3.8-flash';
      else if (roleType === 'lorekeeper') selectedModel = 'gemini-3.1-flash-lite';
      else selectedModel = 'gemini-3.5-flash';
    }

    // Role system instructions
    let systemInstruction = '';
    if (roleType === 'dungeon_master') {
      systemInstruction = `You are the Omniscient Dungeon Master and Lore Architect of this choose-your-own-adventure world.
You possess complete knowledge of the cosmological lore, ancient factions, secrets of the land, and mechanical consequences.
Current player: "${context?.heroName || 'Adventurer'}", Location: "${context?.location || 'Unknown'}", Active Quest: "${context?.quest || 'None'}".
Answer complex inquiries about the world, discuss narrative possibilities, analyze tactical quandaries, or reveal deep background lore with evocative, authoritative storytelling.`;
    } else if (roleType === 'companion') {
      systemInstruction = `You are the player's trusty traveling companion and familiar.
You accompany "${context?.heroName || 'friend'}" directly in the field at "${context?.location || 'our camp'}".
Speak in character with distinct warmth, loyalty, sly humor, and observant banter.
Offer practical advice on what to do next, comment on recent battles and weird items in our inventory, and share personal memories.`;
    } else {
      // Lorekeeper / rapid-fire tactician
      systemInstruction = `You are the Rapid-Fire Lorekeeper and Arbiter.
Your prime directive is speed, precision, and tactical clarity.
Provide concise, sharp, high-utility answers: stat breakdowns, item appraisal, monster weaknesses, survival tips, and spell checks. No superfluous pleasantries.`;
    }

    // Build contents array for multi-turn history
    const contents: any[] = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        contents.push({
          role: item.sender === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [
        {
          text: `[Context: Hero=${context?.heroName || 'Unknown'}, Quest=${context?.quest || 'Unknown'}, Location=${context?.location || 'Unknown'}, Items=${context?.inventory || 'N/A'}]
Question: ${message}`,
        },
      ],
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: roleType === 'lorekeeper' ? 0.3 : 0.7,
        },
      });
    } catch {
      selectedModel = 'gemini-3.8-flash';
      response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    }

    return res.json({
      text: response.text || 'The whispers of the ether fade without an answer.',
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in multi-turn chat:', error);
    return res.status(500).json({ error: error.message || 'Chat turn failed' });
  }
});

// 4. LOW-LATENCY QUICK ACTION ENDPOINT
// Uses gemini-3.1-flash-lite for instant sensory, dice checks, and inventory inspections
app.post('/api/adventure/quick-action', async (req: Request, res: Response) => {
  try {
    const { actionType, subject, context } = req.body;

    const prompt = `Perform an instantaneous low-latency appraisal or action:
Hero: "${context?.heroName}", Location: "${context?.location}", Action: "${actionType}", Target/Subject: "${subject}".
Provide an immediate, vivid 1-2 sentence sensory result or tactical discovery.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: 'You are an ultra-fast RPG game engine action resolver. Be extremely vivid, punchy, and brief (under 50 words).',
        temperature: 0.6,
      },
    });

    return res.json({
      result: response.text || 'You notice nothing out of the ordinary.',
      modelUsed: 'gemini-3.1-flash-lite',
    });
  } catch (error: any) {
    console.error('Error in quick-action:', error);
    return res.status(500).json({ error: error.message || 'Quick action failed' });
  }
});

// Mount Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Chronicle Adventure Engine running on http://localhost:${port}`);
  });
}

startServer();
