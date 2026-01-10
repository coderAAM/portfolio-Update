-- Create education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  period TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create policies for education table
CREATE POLICY "Anyone can view education" 
ON public.education 
FOR SELECT 
USING (true);

CREATE POLICY "Owner can insert education" 
ON public.education 
FOR INSERT 
WITH CHECK (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can update education" 
ON public.education 
FOR UPDATE 
USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

CREATE POLICY "Owner can delete education" 
ON public.education 
FOR DELETE 
USING (auth.uid() = '31f87836-1cd3-45a5-881c-859652683b5b'::uuid);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_education_updated_at
BEFORE UPDATE ON public.education
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();