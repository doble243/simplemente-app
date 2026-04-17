import React from 'react';
import { Composition } from 'remotion';
import { ProjectShowcase } from './compositions/ProjectShowcase';
import { AgencyIntro } from './compositions/AgencyIntro';
import { Showreel, SHOWREEL_DURATION } from './compositions/Showreel';
import { KineticShowreel, KINETIC_DURATION } from './compositions/KineticShowreel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video de intro para la agencia — 10 segundos, 1080p */}
      <Composition
        id="AgencyIntro"
        component={AgencyIntro}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          agencyName: 'Simplemente',
          tagline: 'Diseño web que convierte',
          primaryColor: '#6366f1',
        }}
      />

      {/* Showreel completo — 15 segundos, 4 escenas con transiciones */}
      <Composition
        id="Showreel"
        component={Showreel}
        durationInFrames={SHOWREEL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Kinetic showreel — estilo tipografía cinética, 13s */}
      <Composition
        id="KineticShowreel"
        component={KineticShowreel}
        durationInFrames={KINETIC_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Video de showcase de proyecto — 15 segundos */}
      <Composition
        id="ProjectShowcase"
        component={ProjectShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          projectName: 'Nombre del Proyecto',
          clientName: 'Cliente',
          description: 'Descripción del proyecto realizado.',
          tags: ['Diseño', 'Desarrollo', 'SEO'],
          primaryColor: '#6366f1',
        }}
      />
    </>
  );
};
