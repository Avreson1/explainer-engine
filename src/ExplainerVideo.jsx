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

// 1. SCIENCE & TECH: Oscilloscope Waveforms + Telemetry Scanner
const GridRevealGraphic = ({ frame, fps, accentColor }) => {
  const scanY = (frame * 6) % 460;
  const points1 = [];
  const points2 = [];

  for (let x = 0; x <= 460; x += 10) {
    const y1 = 230 + Math.sin(x * 0.035 + frame * 0.14) * 95 * Math.sin(frame * 0.04);
    const y2 = 230 + Math.cos(x * 0.025 - frame * 0.1) * 65;
    points1.push(`${x},${y1.toFixed(1)}`);
    points2.push(`${x},${y2.toFixed(1)}`);
  }

  const nodePulse = 8 + Math.sin(frame * 0.25) * 4;
  const activeX = 230 + Math.cos(frame * 0.08) * 140;
  const activeY = 230 + Math.sin(activeX * 0.035 + frame * 0.14) * 95 * Math.sin(frame * 0.04);

  return (
    <svg width="460" height="460" viewBox="0 0 460 460" style={{ overflow: 'visible' }}>
      {/* Coordinate Grid */}
      {[0, 92, 184, 276, 368, 460].map((pos) => (
        <g key={pos}>
          <line x1={pos} y1="0" x2={pos} y2="460" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <line x1="0" y1={pos} x2="460" y2={pos} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        </g>
      ))}
      {/* Center Axis Crosshairs */}
      <line x1="230" y1="0" x2="230" y2="460" stroke="rgba(255,255,255,0.2)" strokeDasharray="6 6" strokeWidth="2" />
      <line x1="0" y1="230" x2="460" y2="230" stroke="rgba(255,255,255,0.2)" strokeDasharray="6 6" strokeWidth="2" />

      {/* Secondary Harmonic Wave */}
      <polyline
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
        points={points2.join(' ')}
      />

      {/* Primary Signal Wave */}
      <polyline
        fill="none"
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        points={points1.join(' ')}
      />

      {/* Laser Telemetry Scanline */}
      <line x1="0" y1={scanY} x2="460" y2={scanY} stroke={accentColor} strokeWidth="2" opacity="0.6" />

      {/* Tracking Telemetry Node */}
      <circle cx={activeX} cy={activeY} r={nodePulse * 2.2} fill={accentColor} opacity="0.2" />
      <circle cx={activeX} cy={activeY} r={nodePulse} fill="#FFFFFF" stroke={accentColor} strokeWidth="4" />
      <text
        x={activeX + 18}
        y={activeY - 14}
        fill={accentColor}
        fontFamily="monospace"
        fontSize="20"
        fontWeight="700"
      >
        {`Ψ(${Math.round(activeX)}, ${Math.round(activeY)})`}
      </text>
    </svg>
  );
};

// 2. SPACE: Keplerian Orbital Mechanics & Vector Tethers
const OrbitalPanGraphic = ({ frame, accentColor }) => {
  const angle1 = frame * 0.055;
  const angle2 = -frame * 0.035 + 1.2;
  const angle3 = frame * 0.09 + 2.4;

  const p1x = 230 + Math.cos(angle1) * 180;
  const p1y = 230 + Math.sin(angle1) * 110;

  const p2x = 230 + Math.cos(angle2) * 130;
  const p2y = 230 + Math.sin(angle2) * 180;

  const p3x = 230 + Math.cos(angle3) * 85;
  const p3y = 230 + Math.sin(angle3) * 85;

  return (
    <svg width="460" height="460" viewBox="0 0 460 460" style={{ overflow: 'visible' }}>
      {/* Outer Reference Ring */}
      <circle
        cx="230"
        cy="230"
        r="215"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
        strokeDasharray="10 14"
        transform={`rotate(${frame * 0.3} 230 230)`}
      />

      {/* Elliptical Orbits */}
      <ellipse cx="230" cy="230" rx="180" ry="110" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
      <ellipse cx="230" cy="230" rx="130" ry="180" fill="none" stroke={accentColor} strokeWidth="2" opacity="0.45" />
      <circle cx="230" cy="230" r="85" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 8" strokeWidth="2" />

      {/* Dynamic Vector Tethers between orbiting bodies */}
      <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke={accentColor} strokeWidth="2" opacity="0.5" strokeDasharray="4 4" />
      <line x1="230" y1="230" x2={p1x} y2={p1y} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Central Gravitational Singularity */}
      <circle cx="230" cy="230" r={36 + Math.sin(frame * 0.15) * 5} fill={accentColor} opacity="0.2" />
      <circle cx="230" cy="230" r="20" fill={accentColor} />
      <circle cx="230" cy="230" r="8" fill="#FFFFFF" />

      {/* Orbiting Bodies */}
      <circle cx={p1x} cy={p1y} r="14" fill="#FFFFFF" stroke={accentColor} strokeWidth="5" />
      <circle cx={p2x} cy={p2y} r="10" fill={accentColor} />
      <circle cx={p3x} cy={p3y} r="7" fill="#FFFFFF" />

      <text x="16" y="440" fill="rgba(255,255,255,0.55)" fontFamily="monospace" fontSize="20">
        {`Δv = ${(7.8 + Math.sin(frame * 0.05) * 1.4).toFixed(3)} km/s`}
      </text>
    </svg>
  );
};

// 3. MATH: Geometric Proof Rings & Live Fibonacci/Exponential Bars
const CounterScaleGraphic = ({ frame, durationInFrames, accentColor }) => {
  const progress = interpolate(frame, [0, durationInFrames * 0.8], [0, 1], { extrapolateRight: 'clamp' });
  const circumference = 2 * Math.PI * 155;
  const strokeDashoffset = circumference * (1 - progress);
  const bars = [0.25, 0.42, 0.68, 0.52, 0.85, 1.0];

  return (
    <svg width="460" height="460" viewBox="0 0 460 460" style={{ overflow: 'visible' }}>
      {/* Rotating Polygon Geometry */}
      <polygon
        points="230,30 415,135 415,325 230,430 45,325 45,135"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
        transform={`rotate(${frame * 0.4} 230 230)`}
      />

      {/* Self-Drawing Progress Circle */}
      <circle cx="230" cy="230" r="155" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />
      <circle
        cx="230"
        cy="230"
        r="155"
        fill="none"
        stroke={accentColor}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 230 230)"
      />

      {/* Animated Histogram Bars inside the Ring */}
      {bars.map((val, idx) => {
        const barH = val * 160 * progress;
        const x = 135 + idx * 34;
        const y = 295 - barH;
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width="22"
            height={Math.max(4, barH)}
            rx="4"
            fill={idx === bars.length - 1 ? accentColor : 'rgba(255,255,255,0.75)'}
          />
        );
      })}

      {/* Live Interpolated Percentage Readout */}
      <text
        x="230"
        y="135"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="monospace"
        fontSize="42"
        fontWeight="900"
      >
        {`${(progress * 99.9).toFixed(1)}%`}
      </text>
    </svg>
  );
};

// 4. MYSTERY: Cryptographic Cipher Wheel & Redaction Declassifier
const RedactedStrikeGraphic = ({ frame, durationInFrames, accentColor }) => {
  const sweepAngle = (frame * 4) % 360;
  const revealProgress = interpolate(frame, [10, durationInFrames * 0.65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <svg width="460" height="460" viewBox="0 0 460 460" style={{ overflow: 'visible' }}>
      {/* Outer Cipher Ring */}
      <circle
        cx="230"
        cy="230"
        r="195"
        fill="none"
        stroke={accentColor}
        strokeWidth="3"
        strokeDasharray="24 12 6 12"
        transform={`rotate(${-frame * 0.8} 230 230)`}
      />
      <circle
        cx="230"
        cy="230"
        r="145"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeDasharray="8 16"
        transform={`rotate(${frame * 1.1} 230 230)`}
      />

      {/* Radar Sweep Line */}
      <line
        x1="230"
        y1="230"
        x2="230"
        y2="35"
        stroke={accentColor}
        strokeWidth="4"
        transform={`rotate(${sweepAngle} 230 230)`}
      />

      {/* Declassified Document Redaction Bars */}
      {[0, 1, 2].map((row) => {
        const y = 175 + row * 45;
        const barWidth = 240 * (1 - revealProgress * (row === 1 ? 0.85 : 0.4));
        return (
          <g key={row}>
            <rect x="110" y={y} width="240" height="26" fill="rgba(255,255,255,0.12)" rx="4" />
            <text x="120" y={y + 19} fill="#FFFFFF" fontFamily="monospace" fontSize="18" fontWeight="700">
              {row === 1 ? 'SIGNAL_DECRYPTED' : '0x7F9A_ANOMALY'}
            </text>
            <rect x="110" y={y} width={barWidth} height="26" fill={accentColor} rx="4" />
          </g>
        );
      })}
    </svg>
  );
};

const SceneCard = ({ scene, index, totalScenes, category, accentColor, bgHex }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ambient Moving Background Grid
  const bgOffset = (frame * 1.2) % 80;

  // Headline word-by-word spring physics
  const headlineWords = String(scene.headline || '').split(' ');

  // Active word index for karaoke-style lower-third narration
  const narrationWords = String(scene.narration || '').split(' ');
  const activeWordIndex = Math.floor(
    interpolate(frame, [0, Math.max(10, durationInFrames - 12)], [0, narrationWords.length], {
      extrapolateRight: 'clamp'
    })
  );

  // Scene transition scale & opacity
  const cardScale = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const progressWidth = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp'
  });

  const renderGraphic = () => {
    switch (scene.motionType) {
      case 'orbital-pan':
        return <OrbitalPanGraphic frame={frame} accentColor={accentColor} />;
      case 'counter-scale':
        return <CounterScaleGraphic frame={frame} durationInFrames={durationInFrames} accentColor={accentColor} />;
      case 'redacted-strike':
        return <RedactedStrikeGraphic frame={frame} durationInFrames={durationInFrames} accentColor={accentColor} />;
      case 'grid-reveal':
      default:
        return <GridRevealGraphic frame={frame} fps={fps} accentColor={accentColor} />;
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgHex,
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 64,
        justifyContent: 'space-between',
        opacity: exitOpacity,
        overflow: 'hidden'
      }}
    >
      {scene.audioFile ? <Audio src={staticFile(scene.audioFile)} /> : null}

      {/* Moving Perspective Blueprint Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: -160,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translate(${bgOffset}px, ${bgOffset}px) rotate(-4deg)`,
          pointerEvents: 'none'
        }}
      />

      {/* Glowing Ambient Radial Orb */}
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
          top: 420 + Math.sin(frame * 0.05) * 40,
          left: 180 + Math.cos(frame * 0.05) * 40,
          pointerEvents: 'none'
        }}
      />

      {/* 1. Top Telemetry & Category Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(255,255,255,0.15)',
          paddingBottom: 24,
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 18px ${accentColor}`
            }}
          />
          <span
            style={{
              color: accentColor,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: 'uppercase'
            }}
          >
            {category}
          </span>
        </div>

        <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
          {`SEQ // 0${index + 1}_0${totalScenes}`}
        </span>
      </div>

      {/* 2. Staggered Kinetic Headline + Formula Badge */}
      <div style={{ zIndex: 2, marginTop: 10 }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderLeft: `6px solid ${accentColor}`,
            padding: '10px 22px',
            marginBottom: 22,
            fontFamily: 'monospace',
            fontSize: 32,
            fontWeight: 700,
            color: accentColor,
            transform: `scale(${cardScale})`,
            transformOrigin: 'left center'
          }}
        >
          {scene.subtext}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 20px' }}>
          {headlineWords.map((word, wIdx) => {
            const wordSpring = spring({
              frame: Math.max(0, frame - wIdx * 3),
              fps,
              config: { damping: 12, stiffness: 150 }
            });
            const wordY = interpolate(wordSpring, [0, 1], [45, 0]);

            return (
              <span
                key={wIdx}
                style={{
                  fontSize: 74,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: -2,
                  textTransform: 'uppercase',
                  transform: `translateY(${wordY}px)`,
                  opacity: wordSpring,
                  color: wIdx === headlineWords.length - 1 ? accentColor : '#FFFFFF'
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. Center Animated Vector Motion-Graphics Stage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 520,
          zIndex: 2,
          transform: `scale(${interpolate(cardScale, [0, 1], [0.82, 1])})`
        }}
      >
        {renderGraphic()}
      </div>

      {/* 4. Synchronized Word-by-Word Karaoke Caption Box & Progress Bar */}
      <div style={{ zIndex: 2 }}>
        <div
          style={{
            backgroundColor: 'rgba(8, 10, 18, 0.78)',
            padding: '28px 34px',
            borderRadius: 20,
            border: '1.5px solid rgba(255,255,255,0.14)',
            marginBottom: 32,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 12px'
          }}
        >
          {narrationWords.map((word, idx) => {
            const isSpoken = idx <= activeWordIndex;
            const isCurrent = idx === activeWordIndex;
            return (
              <span
                key={idx}
                style={{
                  fontSize: 40,
                  fontWeight: isCurrent ? 800 : 600,
                  lineHeight: 1.3,
                  color: isCurrent ? accentColor : isSpoken ? '#FFFFFF' : 'rgba(255,255,255,0.38)',
                  transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.08s ease'
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div style={{ width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 5 }}>
          <div
            style={{
              width: `${progressWidth}%`,
              height: '100%',
              backgroundColor: accentColor,
              borderRadius: 5,
              boxShadow: `0 0 16px ${accentColor}`
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
