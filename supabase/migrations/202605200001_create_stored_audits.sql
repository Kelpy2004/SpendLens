create table if not exists public.stored_audits (
  id uuid primary key default gen_random_uuid(),
  audit_id text not null,
  email text not null,
  input_stack jsonb not null,
  output_result jsonb not null,
  pricing_snapshot jsonb not null,
  pricing_version text not null,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

create index if not exists stored_audits_email_idx on public.stored_audits (lower(email));
create index if not exists stored_audits_audit_id_idx on public.stored_audits (audit_id);
create index if not exists stored_audits_pricing_version_idx on public.stored_audits (pricing_version);

alter table public.stored_audits enable row level security;
