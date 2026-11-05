import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate
} from 'remotion';

const SceneCard = ({ scene, index, totalScenes, category, accentColor, bgHex }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 }
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const progressWidth = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgHex,
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 72,
        justifyContent: 'space-between',
        border: '2px solid rgba(255,255,255,0.08)'
      }}
    >
      {scene.audioFile ? <Audio src={staticFile(scene.audioFile)} /> : null}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(255,255,255,0.15)',
          paddingBottom: 28
        }}
      >
        <span
          style={{
            color: accentColor,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase'
          }}
        >
          {category}
        </span>
        <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          0{index + 1} / 0{totalScenes}
        </span>
      </div>

      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity: entrance
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderLeft: `6px solid ${accentColor}`,
            padding: '14px 24px',
            marginBottom: 32,
            fontFamily: 'monospace',
            fontSize: 38,
            color: accentColor
          }}
        >
          {scene.subtext}
        </div>

        <h1
          style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -2,
            margin: 0,
            textTransform: 'uppercase'
          }}
        >
          {scene.headline}
        </h1>
      </div>

      <div>
        <p
          style={{
            fontSize: 42,
            lineHeight: 1.38,
            color: 'rgba(255,255,255,0.88)',
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: 32,
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 40
          }}
        >
          {scene.narration}
        </p>

        <div style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <div
            style={{
              width: `${progressWidth}%`,
              height: '100%',
              backgroundColor: accentColor
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ExplainerVideo = ({ category, accentColor, bgHex, scenes }) => {
  const { fps } = useVideoConfig();
  let currentStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: bgHex }}>
      {scenes.map((scene, idx) => {
        const durationInFrames = Math.max(30, Math.round(scene.durationInSeconds * fps));
        const fromFrame = currentStartFrame;
        currentStartFrame += durationInFrames;

        return (
          <Sequence key={scene.id || idx} from={fromFrame} durationInFrames={durationInFrames}>
            <SceneCard
              scene={scene}
              index={idx}
              totalScenes={scenes.length}
              category={category}
              accentColor={accentColor}
              bgHex={bgHex}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
