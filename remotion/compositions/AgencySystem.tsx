import React from 'react';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { SceneInput } from '../scenes/agency/SceneInput';
import { SceneCentralization } from '../scenes/agency/SceneCentralization';
import { SceneIntelligence } from '../scenes/agency/SceneIntelligence';
import { SceneExecution } from '../scenes/agency/SceneExecution';
import { SceneOutput } from '../scenes/agency/SceneOutput';

// Scene durations at 30fps
const D_INPUT          = 150; // 5s
const D_CENTRALIZATION = 210; // 7s
const D_INTELLIGENCE   = 240; // 8s
const D_EXECUTION      = 300; // 10s
const D_OUTPUT         = 300; // 10s

// Transition durations
const T1 = 12; // input → centralization    (fade)
const T2 = 12; // centralization → intel.   (wipe)
const T3 = 12; // intelligence → execution  (fade)
const T4 = 12; // execution → output        (fade)

// Total = 1200 - 48 = 1152 frames ≈ 38.4s
export const AGENCY_DURATION =
  D_INPUT + D_CENTRALIZATION + D_INTELLIGENCE + D_EXECUTION + D_OUTPUT
  - T1 - T2 - T3 - T4;

export const AgencySystem: React.FC = () => {
  return (
    <TransitionSeries>

      <TransitionSeries.Sequence durationInFrames={D_INPUT}>
        <SceneInput />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T1 })}
      />

      <TransitionSeries.Sequence durationInFrames={D_CENTRALIZATION}>
        <SceneCentralization />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: 'from-left' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: T2 })}
      />

      <TransitionSeries.Sequence durationInFrames={D_INTELLIGENCE}>
        <SceneIntelligence />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T3 })}
      />

      <TransitionSeries.Sequence durationInFrames={D_EXECUTION}>
        <SceneExecution />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T4 })}
      />

      <TransitionSeries.Sequence durationInFrames={D_OUTPUT}>
        <SceneOutput />
      </TransitionSeries.Sequence>

    </TransitionSeries>
  );
};
