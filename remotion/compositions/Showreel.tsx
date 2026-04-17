import React from 'react';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { SceneIntro } from '../scenes/SceneIntro';
import { SceneServices } from '../scenes/SceneServices';
import { SceneStats } from '../scenes/SceneStats';
import { SceneCTA } from '../scenes/SceneCTA';

// Duraciones de escena
const INTRO = 120;       // 4s
const SERVICES = 150;    // 5s
const STATS = 150;       // 5s
const CTA = 90;          // 3s

// Duraciones de transición
const T1 = 20; // fade
const T2 = 20; // slide
const T3 = 20; // wipe

// Total = 120 + 150 + 150 + 90 - 20 - 20 - 20 = 450 frames (15s)
export const SHOWREEL_DURATION = INTRO + SERVICES + STATS + CTA - T1 - T2 - T3;

export const Showreel: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={INTRO}>
        <SceneIntro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T1 })}
      />

      <TransitionSeries.Sequence durationInFrames={SERVICES}>
        <SceneServices />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-right' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: T2 })}
      />

      <TransitionSeries.Sequence durationInFrames={STATS}>
        <SceneStats />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-left' })}
        timing={linearTiming({ durationInFrames: T3 })}
      />

      <TransitionSeries.Sequence durationInFrames={CTA}>
        <SceneCTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
