-- Create kyc_requests table
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    use_case TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    assigned_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_requests
CREATE POLICY "Users can view their own workspace KYC requests" ON public.kyc_requests
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
        OR workspace_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert KYC requests for their workspace" ON public.kyc_requests
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
        OR workspace_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        )
    );

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc_documents', 'kyc_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for kyc_documents
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'kyc_documents' );

CREATE POLICY "Authenticated users can upload KYC documents" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'kyc_documents' AND auth.role() = 'authenticated' );
