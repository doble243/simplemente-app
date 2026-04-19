'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { AGENCY_DURATION, AgencySystem } from '@/remotion/compositions/AgencySystem'

const Player = dynamic(
  () => import('@remotion/player').then((m) => ({ default: m.Player })),
  { ssr: false, loading: () => <PlayerSkeleton /> }
)

function PlayerSkeleton() {
  return (
    <div
      className="w-full animate-pulse rounded-2xl"
      style={{ aspectRatio: '16/9', background: 'var(--pub-skeleton-bg)' }}
    />
  )
}

export function ShowreelSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 800, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Showreel
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Así construimos tu presencia.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground/50">
            Desde la primera línea de código hasta el resultado final.
          </p>
        </div>

        {/* Player */}
        <div className="relative">
          <div
            className="rounded-2xl p-[1px]"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(168,85,247,0.2) 50%, rgba(255,255,255,0.06) 100%)',
            }}
          >
            <div className="overflow-hidden rounded-2xl bg-background">
              <Player
                component={AgencySystem}
                durationInFrames={AGENCY_DURATION}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{ width: '100%', display: 'block' }}
                controls
                loop
                clickToPlay
                spaceKeyToPlayOrPause
              />
            </div>
          </div>

          {/* Glow shadow */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-40 blur-2xl"
            style={{
              width: '60%', height: 24,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Tech chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {['React', 'Next.js', 'Supabase', 'IA Integrada', 'MercadoPago', 'Tailwind CSS'].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-foreground/[0.08] bg-foreground/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-foreground/40"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  )
}
