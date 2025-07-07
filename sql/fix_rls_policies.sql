-- =============================================================================
-- Fix RLS Policies - Remove Infinite Recursion
-- =============================================================================

-- This script fixes the infinite recursion issue in RLS policies
-- by removing the problematic admin policies that reference the profiles table

BEGIN;

-- =============================================================================
-- 1. Remove problematic admin policies that cause infinite recursion
-- =============================================================================

-- Remove admin policies that reference profiles table
DROP POLICY IF EXISTS "admin_profiles_read" ON profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON profiles;

-- Remove other admin policies that might cause issues
DROP POLICY IF EXISTS "admin_species_manage" ON marine_species;
DROP POLICY IF EXISTS "admin_tracking_manage" ON species_tracking;
DROP POLICY IF EXISTS "admin_projects_manage" ON conservation_projects;
DROP POLICY IF EXISTS "admin_news_manage" ON news_articles;
DROP POLICY IF EXISTS "admin_resources_manage" ON educational_resources;
DROP POLICY IF EXISTS "admin_activities_read" ON user_activities;
DROP POLICY IF EXISTS "admin_settings_manage" ON system_settings;

-- =============================================================================
-- 2. Create simple, non-recursive policies
-- =============================================================================

-- Simple profiles policies (no admin checks)
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Simple marine_species policies
CREATE POLICY "species_read_all" ON marine_species FOR SELECT USING (true);
CREATE POLICY "species_write_admin" ON marine_species FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple tracking policies
CREATE POLICY "tracking_read_all" ON species_tracking FOR SELECT USING (true);
CREATE POLICY "tracking_write_own" ON species_tracking FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple projects policies
CREATE POLICY "projects_read_all" ON conservation_projects FOR SELECT USING (true);
CREATE POLICY "projects_write_admin" ON conservation_projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple news policies
CREATE POLICY "news_read_all" ON news_articles FOR SELECT USING (true);
CREATE POLICY "news_write_admin" ON news_articles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple resources policies
CREATE POLICY "resources_read_all" ON educational_resources FOR SELECT USING (true);
CREATE POLICY "resources_write_admin" ON educational_resources FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple activities policies
CREATE POLICY "activities_read_all" ON user_activities FOR SELECT USING (true);
CREATE POLICY "activities_write_own" ON user_activities FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Simple settings policies
CREATE POLICY "settings_read_all" ON system_settings FOR SELECT USING (true);
CREATE POLICY "settings_write_admin" ON system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- =============================================================================
-- 3. Test the fix
-- =============================================================================

-- Test that we can now query the profiles table
SELECT 'Testing profiles table access...' as test_message;
SELECT COUNT(*) as profiles_count FROM profiles;

-- Test that we can query marine_species table
SELECT 'Testing marine_species table access...' as test_message;
SELECT COUNT(*) as species_count FROM marine_species;

COMMIT;

SELECT '✅ RLS policies fixed! Infinite recursion issue resolved.' as status; 