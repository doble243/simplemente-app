-- Chat logs for AI training and improvement
create table if not exists public.chat_logs (
  id               uuid default gen_random_uuid() primary key,
  session_id       text not null,
  user_message     text not null,
  assistant_message text not null,
  ip_hash          text,
  created_at       timestamptz default now() not null
);

-- Index for querying by session
create index if not exists chat_logs_session_id_idx on public.chat_logs (session_id);
create index if not exists chat_logs_created_at_idx on public.chat_logs (created_at desc);

-- Row-level security: only service role can read/write (no public access)
alter table public.chat_logs enable row level security;

-- Only authenticated admins (service key) can access
create policy "Service role only"
  on public.chat_logs
  for all
  using (false);
