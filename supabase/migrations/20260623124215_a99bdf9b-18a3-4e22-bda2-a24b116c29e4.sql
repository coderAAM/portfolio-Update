ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY featured DESC, created_at DESC) - 1 AS rn
  FROM public.projects
)
UPDATE public.projects p SET sort_order = ordered.rn FROM ordered WHERE p.id = ordered.id;