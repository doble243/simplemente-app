import React from 'react';
import { Composition } from 'remotion';
import { AgencySystem, AGENCY_DURATION } from './compositions/AgencySystem';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AgencySystem"
      component={AgencySystem}
      durationInFrames={AGENCY_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
