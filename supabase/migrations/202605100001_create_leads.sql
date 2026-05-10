create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  audit_id text not null,
  email text not null,
  company_name text,
  role text,
  team_size integer,
  primary_use_case text not null,
  monthly_savings numeric(12, 2) not null default 0,
  annual_savings numeric(12, 2) not null default 0,
  source_url text,
  user_agent text,
  email_delivery_status text not null default 'not_attempted'
    check (email_delivery_status in ('not_attempted', 'sent', 'skipped', 'failed')),
  resend_email_id text,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_audit_id_idx on public.leads (audit_id);

alter table public.leads enable row level security;

