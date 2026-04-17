# Social Media Automation Design

**Goal:** Add a production-ready social content workflow for Simplemente that uses a documented mixed brand voice, generates platform-specific content packs, and makes them easy to review and export to an external scheduler.

**Architecture:** Keep brand identity in human-readable docs and mirror the essential rules in code so the AI prompts stay stable. The system should generate structured content packs from the existing AI stack, expose them through an admin review surface, and export them in a format that tools like Buffer, Make, or Meta Business Suite can consume. In v1, we do not build a full scheduler or publishing queue inside the app; we focus on content generation, approval, and export.

**Tech Stack:** Next.js App Router, TypeScript, Supabase, existing OpenAI-compatible AI client, server routes under `app/api`, and small prompt-builder modules under `lib/ai/prompts`.

---

## Current State

The repo already has:

- A public website for the agency.
- An admin dashboard with leads, clients, projects, invoices, and settings.
- A portal for clients.
- AI routes for sales, replies, summaries, and quote generation.
- A prompt layer under `lib/ai/prompts`.

What it does not have yet:

- A social media brand system.
- A reusable social content prompt layer.
- An admin page dedicated to reviewing social content.
- A structured export payload for scheduling tools.

## Design Principles

- Keep the brand voice consistent across web copy, chat replies, and social content.
- Separate human-facing identity docs from machine-facing prompt data.
- Prefer structured JSON outputs so the admin UI can render and export reliably.
- Avoid building a brittle in-app scheduler until the content workflow proves valuable.
- Reuse existing project patterns instead of inventing a new architecture.

## File Map

### Create

- `docs/brand/soul.md`
- `docs/brand/agent.md`
- `lib/brand/social-profile.ts`
- `lib/ai/prompts/social/create-social-pack.ts`
- `lib/ai/prompts/social/review-social-pack.ts`
- `app/api/ai/social/route.ts`
- `components/admin/SocialPackPreview.tsx`
- `app/(admin)/social/page.tsx`

### Modify

- `components/admin/Sidebar.tsx`
- `components/admin/Topbar.tsx` if the new page needs navigation affordances
- `app/(admin)/layout.tsx` if the new page needs route grouping or nav visibility changes
- `lib/env.ts` if any new social/export env vars are required
- `app/api/settings/route.ts` only if social brand settings are stored in the same settings table

### Optional later

- `supabase/migrations/0008_social_content.sql` if we decide to persist drafts, approvals, or export history in Supabase

## Brand Identity Layer

### `docs/brand/soul.md`

This is the source of truth for the brand. It should define:

- What Simplemente is.
- Who it speaks to.
- The mixed tone: premium enough to sell to businesses, but warm and local enough to feel approachable.
- The core promise: web, automation, and growth that feel practical and real.
- Claims that are allowed.
- Claims that are forbidden.
- Words that fit the brand.
- Words that should not appear.
- How the brand speaks on Instagram, LinkedIn, Facebook, and WhatsApp-style replies.

### `docs/brand/agent.md`

This is the operating guide for the content generator. It should define:

- How to turn brand identity into content ideas.
- How to structure hooks, captions, CTAs, and hashtag sets.
- How to adapt the same message across platforms.
- How to produce content that sounds human and local, not generic or corporate.
- How to avoid overpromising on automation, sales, or AI capabilities.

### `lib/brand/social-profile.ts`

This is the machine-readable version of the same brand rules. It should export a typed object with:

- Brand name.
- One-line positioning statement.
- Target audience.
- Tone attributes.
- Required phrases.
- Forbidden phrases.
- Core offers.
- Core proof points.
- Platform notes.

The AI prompt builders should read from this module, not from the markdown docs directly.

## Content Generation Layer

### `lib/ai/prompts/social/create-social-pack.ts`

This prompt builder should generate a structured content pack for one campaign or topic. The prompt should ask for JSON only and require fields for:

- Campaign title.
- Objective.
- Audience.
- Primary hook.
- Platform variants.
- Caption.
- CTA.
- Hashtags.
- Visual direction.
- Optional carousel slide outline.

### `lib/ai/prompts/social/review-social-pack.ts`

This prompt builder should review a generated pack and flag:

- Tone drift.
- Repetitive wording.
- Claims that are too strong.
- Missing CTA.
- Missing platform adaptation.

The review prompt is optional in the UI, but useful when the generated content needs a second pass before export.

### `app/api/ai/social/route.ts`

This route should accept a campaign brief and return a normalized JSON pack. The API should:

- Validate input with `zod`.
- Build the prompt from `lib/brand/social-profile.ts`.
- Call the existing AI client.
- Parse JSON safely.
- Return a stable fallback when the model response is malformed.

Recommended request shape:

```ts
{
  topic: string
  objective: 'awareness' | 'leads' | 'authority' | 'conversion'
  platforms: Array<'instagram' | 'linkedin' | 'facebook'>
  audience?: string
  offer?: string
  content_type: 'single_post' | 'carousel' | 'short_video'
  tone?: 'premium' | 'friendly' | 'balanced'
}
```

Recommended response shape:

```ts
{
  campaign_title: string
  objective: string
  audience: string
  primary_hook: string
  cta: string
  hashtags: string[]
  visual_direction: string
  posts: Array<{
    platform: 'instagram' | 'linkedin' | 'facebook'
    format: 'post' | 'carousel' | 'reel'
    caption: string
    variants?: string[]
    carousel_slides?: string[]
  }>
  export_payload: Record<string, unknown>
  notes?: string
}
```

## Admin Review Layer

### `components/admin/SocialPackPreview.tsx`

This component should render the generated pack in a compact review format:

- Campaign title.
- Hook.
- CTA.
- Per-platform content blocks.
- Hashtags.
- Visual direction.
- Copy-to-clipboard actions.
- An export button or raw JSON download action.

### `app/(admin)/social/page.tsx`

This page should let the team:

- Enter a campaign topic and objective.
- Choose target platforms.
- Generate a pack.
- Review the output.
- Copy the approved copy.
- Export the pack for Buffer, Make, or Meta Business Suite.

The first version can keep everything local to the page state if needed. If the feature proves useful, we can persist drafts later in Supabase.

## Export Strategy

Do not build a native publisher in v1.

Instead, output a clean export payload that can be used in one of these ways:

- Copied into Buffer manually.
- Sent into Make or Zapier via webhook.
- Mapped into Meta Business Suite tooling.

This keeps the initial rollout fast and reduces the risk of auth and API edge cases across multiple social platforms.

## Error Handling

- If the AI returns invalid JSON, return a fallback pack with a clear warning note.
- If the user input is missing required fields, return a 422 with zod errors.
- If the AI service is unavailable, return a 503 and keep the admin page usable.
- If export data is incomplete, disable the export action and show the missing fields.

## Testing

### Prompt and route tests

- Validate that the social route accepts the expected input shape.
- Validate that invalid JSON from the model falls back safely.
- Validate that the brand profile exports the required fields.

### UI tests

- Verify the admin page renders the form and preview state.
- Verify generated packs can be copied.
- Verify empty states and error states are visible.

### Build checks

- Run `npm run lint`.
- Run `npm run build`.

## Out of Scope for v1

- Direct posting to Instagram, Facebook, or LinkedIn APIs.
- A persistent internal content calendar.
- Multi-step approval workflows.
- Automated commenting or DM replies.
- A full queue worker for scheduled publication.

## Success Criteria

- The brand voice is documented in one place.
- The app can generate structured social content packs.
- The admin can review and export a pack without touching the raw prompt.
- The output is consistent enough to hand off to an external scheduler immediately.
