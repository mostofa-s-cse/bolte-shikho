-- Plan start: one row per user, set when they click "Start" on /plan
create table if not exists plan_start (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date not null
);

alter table plan_start enable row level security;

create policy "Users manage their own plan start"
  on plan_start for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Plan task progress: one row per (user, day, task)
create table if not exists plan_task_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day int not null,
  task_index int not null,
  completed_at timestamptz,
  unique (user_id, plan_day, task_index)
);

alter table plan_task_progress enable row level security;

create policy "Users manage their own plan task progress"
  on plan_task_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Plan day completion: one row per (user, day), set once all tasks are done
create table if not exists plan_day_completion (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day int not null,
  scheduled_date date not null,
  completed_date date not null,
  primary key (user_id, plan_day)
);

alter table plan_day_completion enable row level security;

create policy "Users manage their own plan day completion"
  on plan_day_completion for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Practice log: daily "I practiced today" streak
create table if not exists practice_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  primary key (user_id, log_date)
);

alter table practice_log enable row level security;

create policy "Users manage their own practice log"
  on practice_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
