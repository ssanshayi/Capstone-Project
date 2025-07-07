-- Fix RLS policies for resources table
-- This script adds proper RLS policies to allow admin users to manage resources

-- Enable RLS on resources table (if not already enabled)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;

-- Create new policies
-- Anyone can view resources
CREATE POLICY "resources_public_read" ON resources FOR SELECT USING (true);

-- Admin users can manage resources (insert, update, delete)
CREATE POLICY "resources_admin_manage" ON resources FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Authenticated users can view resources (redundant but explicit)
CREATE POLICY "resources_authenticated_read" ON resources FOR SELECT USING (auth.uid() IS NOT NULL);

-- Display the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'resources'; 