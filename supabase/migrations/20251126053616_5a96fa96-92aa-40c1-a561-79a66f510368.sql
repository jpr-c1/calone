-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on campaigns
CREATE POLICY "Allow all operations on campaigns"
ON public.campaigns
FOR ALL
USING (true)
WITH CHECK (true);

-- Add campaign_id column to content table
ALTER TABLE public.content
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_content_campaign_id ON public.content(campaign_id);