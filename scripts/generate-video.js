import { GoogleGenAI, Type } from '@google/genai';
import { execSync, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PILLARS = [
  {
    category: 'Science & Tech',
    accentColor: '#00F5D4',
    bgHex: '#090D16',
    voice: 'en-US-ChristopherNeural',
    focus: 'Counterintuitive physics laws, invisible infrastructure mechanics, or quantum breakthroughs.'
  },
  {
    category: 'Mystery',
    accentColor: '#FF2A85',
    bgHex: '#0A070E',
    voice: 'en-US-GuyNeural',
    focus: 'Unsolved scientific anomalies, cryptographic puzzles, signal anomalies, or historical engineering mysteries.'
  },
  {
    category: 'Math',
    accentColor: '#FEE440',
    bgHex: '#0B0C10',
    voice: 'en-US-EricNeural',
    focus: 'Probability paradoxes, geometric proofs, prime number anomalies, or game theory traps.'
  },
  {
    category: 'Space',
    accentColor: '#7B2CBF',
    bgHex: '#05050A',
    voice: 'en-US-RogerNeural',
    focus: 'Orbital mechanics, relativistic time dilation, exoplanet extremes, or cosmic scale paradoxes.'
  }
];

function getDeterministicPillar() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const slot = now.getUTCHours() >= 12 ? 1 : 0;
  const index = (dayOfYear * 2 + slot) % PILLARS.length;
  return PILLARS[index];
}

async function generateStructuredScript(pillar) {
  console.log(`🤖 Requesting ${pillar.category} script from Gemini 3.8 Flash...`);

  const scriptSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Punchy title under 55 characters' },
      category: { type: Type.STRING, description: 'Category name' },
      accentColor: { type: Type.STRING, description: 'Primary hex color' },
      bgHex: { type: Type.STRING, description: 'Dark background hex color' },
      scenes: {
        type: Type.ARRAY,
        description: 'Exactly 4 scenes: 1 Hook, 2 Body Steps, 1 Mind-blowing Takeaway',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            headline: { type: Type.STRING, description: '2 to 4 ALL-CAPS impact words shown on screen' },
            subtext: { type: Type.STRING, description: 'Short formula, coordinate, or key metric (under 35 chars)' },
            narration: { type: Type.STRING, description: 'Spoken voiceover sentence (15 to 22 words max)' },
            motionType: {
              type: Type.STRING,
              enum: ['grid-reveal', 'counter-scale', 'orbital-pan', 'redacted-strike']
            }
          },
          required: ['id', 'headline', 'subtext', 'narration', 'motionType']
        }
      }
    },
    required: ['title', 'category', 'accentColor', 'bgHex', 'scenes']
  };

  const prompt = `
    You are an elite vertical micro-documentary writer specializing in ${pillar.category}.
    Focus area: ${pillar.focus}
    Use accentColor "${pillar.accentColor}" and bgHex "${pillar.bgHex}".
    
    Write a tight 4-scene explainer script (total spoken time ~25-32 seconds):
    - Scene 1: High-retention hook stating a counterintuitive fact or paradox.
    - Scene 2: The core mechanism or mathematical/scientific setup.
    - Scene 3: The twist or escalation with a concrete number or metric in subtext.
    - Scene 4: The lingering conclusion that rewards re-watching.
    Avoid markdown symbols like asterisks or backticks inside strings.
  `;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: scriptSchema,
          temperature: 0.75
        }
      });

      const parsed = JSON.parse(response.text.trim());
      if (!parsed.scenes || parsed.scenes.length === 0) {
        throw new Error('Empty scenes array returned');
      }
      return parsed;
    } catch (err) {
      console.warn(`⚠️ Gemini attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
    }
  }
}

function synthesizeSceneAudio(scenes, voice, publicDir) {
  console.log(`🎙️ Synthesizing neural voiceover (${voice}) and probing exact durations...`);
  const enrichedScenes = [];

  for (const scene of scenes) {
    const audioFileName = `scene-${scene.id}.mp3`;
    const audioFullPath = path.join(publicDir, audioFileName);

    execFileSync('edge-tts', [
      '--voice', voice,
      '--rate=+8%',
      '--text', scene.narration,
      '--write-media', audioFullPath
    ], { stdio: 'inherit' });

    const probeOut = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioFullPath
    ]).toString().trim();

    const rawSeconds = parseFloat(probeOut) || 5.0;
    const durationInSeconds = Number((rawSeconds + 0.35).toFixed(2));

    enrichedScenes.push({
      ...scene,
      audioFile: audioFileName,
      durationInSeconds
    });
  }

  return enrichedScenes;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function runPipeline() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY environment variable.');
    process.exit(1);
  }

  const outDir = path.resolve('out');
  const publicDir = path.resolve('public');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });

  const pillar = getDeterministicPillar();
  const rawScript = await generateStructuredScript(pillar);

  const enrichedScenes = synthesizeSceneAudio(rawScript.scenes, pillar.voice, publicDir);
  const totalDuration = Number(
    enrichedScenes.reduce((acc, s) => acc + s.durationInSeconds, 0).toFixed(2)
  );

  const payload = {
    ...rawScript,
    totalDurationInSeconds: totalDuration,
    fps: 30,
    width: 1080,
    height: 1920,
    scenes: enrichedScenes
  };

  const dayOfMonth = new Date().getDate();
  const isEvenDay = dayOfMonth % 2 === 0;
  const outputVideoPath = path.resolve('out/output.mp4');

  console.log(`📅 Date check: Day ${dayOfMonth} (${isEvenDay ? 'EVEN -> Remotion' : 'ODD -> Papercut Schema'})`);

  if (isEvenDay) {
    const propsPath = path.resolve('out/remotion-props.json');
    fs.writeFileSync(propsPath, JSON.stringify(payload, null, 2));

    console.log('🎬 Executing Remotion headless composition render...');
    execFileSync('npx', [
      'remotion',
      'render',
      'src/index.jsx',
      'ExplainerVideo',
      outputVideoPath,
      `--props=${propsPath}`
    ], { stdio: 'inherit' });
  } else {
    console.log('📐 Compiling dynamic timeline array to papercut.json schema...');
    let cursor = 0;
    const timeline = enrichedScenes.map((scene) => {
      const start = Number(cursor.toFixed(2));
      const end = Number((cursor + scene.durationInSeconds).toFixed(2));
      cursor = end;
      return {
        id: `scene_${scene.id}`,
        start,
        end,
        duration: scene.durationInSeconds,
        layers: [
          {
            type: 'canvas',
            backgroundColor: payload.bgHex,
            accentColor: payload.accentColor,
            motionPreset: scene.motionType
          },
          {
            type: 'kinetic_text',
            headline: scene.headline,
            subtext: scene.subtext,
            caption: scene.narration
          },
          {
            type: 'audio',
            src: path.join('public', scene.audioFile)
          }
        ]
      };
    });

    const papercutSchema = {
      $schema: 'https://papercut.dev/schema/v1.json',
      version: '1.0',
      meta: {
        title: payload.title,
        category: payload.category,
        resolution: { width: 1080, height: 1920, fps: 30 }
      },
      output: 'out/output.mp4',
      timeline
    };

    fs.writeFileSync(path.resolve('papercut.json'), JSON.stringify(papercutSchema, null, 2));

    try {
      execSync('npx --no-install papercut-cli render --config papercut.json', { stdio: 'inherit' });
    } catch {
      console.log('⚡ Transforming papercut.json via built-in FFmpeg schema renderer...');
      execFileSync('node', ['scripts/papercut-renderer.js'], { stdio: 'inherit' });
    }
  }

  if (!fs.existsSync(outputVideoPath) || fs.statSync(outputVideoPath).size < 10000) {
    console.error('❌ Render failed or produced an empty MP4 file.');
    process.exit(1);
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('ℹ️ Telegram credentials not set in environment; skipping upload.');
    return;
  }

  console.log('📤 Streaming out/output.mp4 to Telegram...');
  const engineLabel = isEvenDay ? 'Remotion 4.0' : 'Papercut Timeline';
  const htmlCaption = `<b>[${escapeHtml(payload.category.toUpperCase())}] ${escapeHtml(payload.title)}</b>\n\n⚙️ Engine: <code>${engineLabel}</code>\n⏱ Duration: <code>${totalDuration}s</code>`;

  execFileSync('curl', [
    '--fail',
    '--silent',
    '--show-error',
    '-X', 'POST',
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`,
    '-F', `chat_id=${TELEGRAM_CHAT_ID}`,
    '-F', `video=@${outputVideoPath}`,
    '-F', `caption=${htmlCaption}`,
    '-F', 'parse_mode=HTML',
    '-F', 'supports_streaming=true'
  ], { stdio: 'inherit' });

  console.log('✅ Pipeline completed and delivered to Telegram.');
}

runPipeline().catch((err) => {
  console.error('💥 Fatal Pipeline Error:', err);
  process.exit(1);
});
