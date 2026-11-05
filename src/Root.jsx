import React from 'react';
import { Composition } from 'remotion';
import { ExplainerVideo } from './ExplainerVideo.jsx';

const defaultProps = {
  title: 'Quantum Tunneling Explained',
  category: 'Science & Tech',
  accentColor: '#00F5D4',
  bgHex: '#090D16',
  totalDurationInSeconds: 12,
  scenes: [
    {
      id: 1,
      headline: 'SOLID WALLS ARE ILLUSIONS',
      subtext: 'P(x) = |?(x)|[G > 0',
      narration: 'At the quantum scale, solid barriers do not stop particles.',
      motionType: 'grid-reveal',
      durationInSeconds: 6,
      audioFile: ''
    }
  ]
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="ExplainerVideo"
      component={ExplainerVideo}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const fps = 30;
        const totalFrames = Math.max(
          90,
          Math.ceil((props.totalDurationInSeconds || 15) * fps)
        );
        return {
          durationInFrames: totalFrames,
          fps,
          width: 1080,
          height: 1920
        };
      }}
    />
  );
};
