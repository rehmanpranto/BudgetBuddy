# BudgetBuddy Server

Environment variables:

- PORT: default 4000
- DATABASE_URL: Supabase Postgres connection string
- JWT_SECRET: secret for signing JWTs

Tables required:

- users(id uuid primary key default gen_random_uuid(), email text unique not null, password_hash text not null)
- transactions(id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade, type text check (type in ('income','expense')) not null, amount numeric not null, category text not null, date date not null, note text)

Ensure pgcrypto or gen_random_uuid() available; otherwise use uuid_generate_v4().
