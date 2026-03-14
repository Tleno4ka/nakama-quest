
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;
