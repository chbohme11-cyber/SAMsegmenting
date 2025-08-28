-- Create table for storing API configurations
CREATE TABLE IF NOT EXISTS public.api_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  model_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own API configurations" 
ON public.api_configurations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create table for segmentation jobs
CREATE TABLE IF NOT EXISTS public.segmentation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  click_points JSONB NOT NULL,
  mask_url TEXT,
  status TEXT DEFAULT 'pending',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.segmentation_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own segmentation jobs" 
ON public.segmentation_jobs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create table for inpainting jobs
CREATE TABLE IF NOT EXISTS public.inpainting_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  mask_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result_url TEXT,
  status TEXT DEFAULT 'pending',
  provider TEXT NOT NULL,
  model_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inpainting_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own inpainting jobs" 
ON public.inpainting_jobs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_api_configurations_updated_at
  BEFORE UPDATE ON public.api_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_segmentation_jobs_updated_at
  BEFORE UPDATE ON public.segmentation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inpainting_jobs_updated_at
  BEFORE UPDATE ON public.inpainting_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();