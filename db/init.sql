create extension if not exists "pgcrypto";

create table if not exists tickets (
    id             uuid primary key default gen_random_uuid(),
    customer_name  text not null,
    request_text   text not null,
    attachment_url text,
    category       text,
    priority       text,
    summary        text,
    status         text not null default 'Abierto',
    owner          text,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create table if not exists comments (
    id         uuid primary key default gen_random_uuid(),
    ticket_id  uuid not null references tickets(id) on delete cascade,
    author     text,
    body       text not null,
    created_at timestamptz not null default now()
);

create index if not exists comments_ticket_id_idx on comments(ticket_id);
create index if not exists tickets_created_at_idx on tickets(created_at desc);
