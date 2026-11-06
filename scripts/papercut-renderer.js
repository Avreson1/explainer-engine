import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function cleanFFmpegText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\u2019")
    .replace(/:/g, '\\:')
    .replace(/%/g, '\\%')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function renderPapercutTimeline() {
  const schemaPath = path.resolve('papercut.json');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('papercut.json not found');
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const tempDir = path.resolve('out/papercut-segments');
  fs.mkdirSync(tempDir, { recursive: true });

  const segmentFiles = [];
  const categoryLabel = cleanFFmpegText(schema.meta.category.toUpperCase());

  schema.timeline.forEach((clip, idx) => {
    const canvas = clip.layers.find((l) => l.type === 'canvas');
    const textLayer = clip.layers.find((l) => l.type === 'kinetic_text');
    const audioLayer = clip.layers.find((l) => l.type === 'audio');

    const bgHex = canvas.backgroundColor.replace('#', '0x');
    const accentHex = canvas.accentColor.replace('#', '0x');

    const headline = cleanFFmpegText(textLayer.headline);
    const subtext = cleanFFmpegText(textLayer.subtext);

    const words = textLayer.caption.split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = cleanFFmpegText(words.slice(0, mid).join(' '));
    const line2 = cleanFFmpegText(words.slice(mid).join(' '));

    const segPath = path.join(tempDir, `seg-${idx}.mp4`);
    segmentFiles.push(segPath);

    const filterGraph = [
      // Outer Swiss Structural Frame
      `drawbox=x=64:y=100:w=952:h=1720:color=white@0.12:t=2`,
      // Animated Vertical & Horizontal Telemetry Scanlines inside Center Stage
      `drawbox=x=110:y=620:w=860:h=520:color=white@0.06:t=2`,
      `drawbox=x='110+430+380*sin(2*PI*t/2.5)':y=620:w=4:h=520:color=${accentHex}@0.75:t=fill`,
      `drawbox=x=110:y='620+260+220*cos(2*PI*t/2.0)':w=860:h=4:color=${accentHex}@0.75:t=fill`,
      // Orbiting / Oscillating Geometric Target Node
      `drawbox=x='520+260*cos(3*t)':y='860+160*sin(3*t)':w=36:h=36:color=${accentHex}:t=fill`,
      `drawbox=x='520-260*cos(2.2*t)':y='860-140*sin(2.2*t)':w=24:h=24:color=white:t=fill`,
      // Expanding Accent Rule
      `drawbox=x=110:y=540:w='min(860,860*(t/0.45))':h=6:color=${accentHex}:t=fill`,
      // Category & Sequence Header
      `drawtext=text='${categoryLabel} // SEQ 0${idx + 1}':fontcolor=${accentHex}:fontsize=34:x=110:y=160`,
      // Subtext Formula Tag
      `drawtext=text='${subtext}':fontcolor=${accentHex}:fontsize=42:x=110:y=260`,
      // Kinetic Headline with smooth upward slide
      `drawtext=text='${headline}':fontcolor=white:fontsize=68:x=110:y='380-min(40,40*(t/0.3))'`,
      // Lower-third Spoken Narration Box
      `drawbox=x=96:y=1340:w=888:h=220:color=black@0.55:t=fill`,
      `drawtext=text='${line1}':fontcolor=white:fontsize=38:x=124:y=1395`,
      `drawtext=text='${line2}':fontcolor=${accentHex}:fontsize=38:x=124:y=1465`,
      // Bottom Timeline Progress Bar
      `drawbox=x=64:y=1810:w='952*(t/${clip.duration})':h=10:color=${accentHex}:t=fill`
    ].join(',');

    execFileSync('ffmpeg', [
      '-y',
      '-f', 'lavfi',
      '-i', `color=c=${bgHex}:s=1080x1920:r=30:d=${clip.duration}`,
      '-i', path.resolve(audioLayer.src),
      '-vf', filterGraph,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      segPath
    ], { stdio: 'inherit' });
  });

  const concatListPath = path.join(tempDir, 'concat.txt');
  const concatBody = segmentFiles.map((f) => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatBody);

  const finalOut = path.resolve(schema.output);
  execFileSync('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c', 'copy',
    finalOut
  ], { stdio: 'inherit' });

  console.log(`✅ Papercut animated schema compiled to ${finalOut}`);
}

renderPapercutTimeline();
