ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nickname_changed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS age_changed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS time_slots jsonb DEFAULT '{}'::jsonb;