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
      `drawbox=x=64:y=120:w=952:h=1680:color=white@0.12:t=2`,
      `drawbox=x=64:y=860:w='min(952,952*(t/0.6))':h=6:color=${accentHex}:t=fill`,
      `drawtext=text='${categoryLabel} // 0${idx + 1}':fontcolor=${accentHex}:fontsize=34:x=110:y=220`,
      `drawtext=text='${headline}':fontcolor=white:fontsize=76:x=110:y='720-min(40,40*(t/0.35))'`,
      `drawtext=text='${subtext}':fontcolor=${accentHex}:fontsize=44:x=110:y=910`,
      `drawtext=text='${line1}':fontcolor=white@0.9:fontsize=38:x=110:y=1420`,
      `drawtext=text='${line2}':fontcolor=white@0.9:fontsize=38:x=110:y=1480`,
      `drawbox=x=64:y=1790:w='952*(t/${clip.duration})':h=10:color=${accentHex}:t=fill`
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

  console.log(` Papercut schema compiled to ${finalOut}`);
}

renderPapercutTimeline();
