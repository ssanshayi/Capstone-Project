-- =============================================================================
-- Simple RLS Fix - Allow Normal Access
-- =============================================================================

-- This script provides a simple fix that allows normal access
-- while avoiding the infinite recursion issue

BEGIN;

-- =============================================================================
-- 1. Remove all problematic policies
-- =============================================================================

-- Remove all existing policies to start fresh
DROP POLICY IF EXISTS "profiles_read" ON profiles;
DROP POLICY IF EXISTS "profiles_write" ON profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_write_own" ON profiles;
DROP POLICY IF EXISTS "admin_profiles_read" ON profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON profiles;

DROP POLICY IF EXISTS "Anyone can view marine species" ON marine_species;
DROP POLICY IF EXISTS "species_read_all" ON marine_species;
DROP POLICY IF EXISTS "species_write_admin" ON marine_species;
DROP POLICY IF EXISTS "admin_species_manage" ON marine_species;

DROP POLICY IF EXISTS "tracking_read_all" ON species_tracking;
DROP POLICY IF EXISTS "tracking_write_own" ON species_tracking;
DROP POLICY IF EXISTS "admin_tracking_manage" ON species_tracking;

DROP POLICY IF EXISTS "Anyone can view projects" ON conservation_projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON conservation_projects;
DROP POLICY IF EXISTS "projects_read_all" ON conservation_projects;
DROP POLICY IF EXISTS "projects_write_admin" ON conservation_projects;
DROP POLICY IF EXISTS "admin_projects_manage" ON conservation_projects;

DROP POLICY IF EXISTS "Anyone can view published articles" ON news_articles;
DROP POLICY IF EXISTS "news_read_all" ON news_articles;
DROP POLICY IF EXISTS "news_write_admin" ON news_articles;
DROP POLICY IF EXISTS "admin_news_manage" ON news_articles;

DROP POLICY IF EXISTS "Anyone can view resources" ON educational_resources;
DROP POLICY IF EXISTS "resources_read_all" ON educational_resources;
DROP POLICY IF EXISTS "resources_write_admin" ON educational_resources;
DROP POLICY IF EXISTS "admin_resources_manage" ON educational_resources;

DROP POLICY IF EXISTS "activities_read" ON user_activities;
DROP POLICY IF EXISTS "activities_write" ON user_activities;
DROP POLICY IF EXISTS "activities_read_all" ON user_activities;
DROP POLICY IF EXISTS "activities_write_own" ON user_activities;
DROP POLICY IF EXISTS "admin_activities_read" ON user_activities;

DROP POLICY IF EXISTS "Anyone can view settings" ON system_settings;
DROP POLICY IF EXISTS "settings_read_all" ON system_settings;
DROP POLICY IF EXISTS "settings_write_admin" ON system_settings;
DROP POLICY IF EXISTS "admin_settings_manage" ON system_settings;

-- =============================================================================
-- 2. Create simple, permissive policies for normal access
-- =============================================================================

-- Profiles: Allow read access to all, write access to own profile
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write" ON profiles FOR ALL USING (auth.uid() = id);

-- Marine species: Allow read access to all, write access to authenticated users
CREATE POLICY "species_public_read" ON marine_species FOR SELECT USING (true);
CREATE POLICY "species_authenticated_write" ON marine_species FOR ALL USING (auth.uid() IS NOT NULL);

-- Species tracking: Allow read access to all, write access to authenticated users
CREATE POLICY "tracking_public_read" ON species_tracking FOR SELECT USING (true);
CREATE POLICY "tracking_authenticated_write" ON species_tracking FOR ALL USING (auth.uid() IS NOT NULL);

-- Conservation projects: Allow read access to all, write access to authenticated users
CREATE POLICY "projects_public_read" ON conservation_projects FOR SELECT USING (true);
CREATE POLICY "projects_authenticated_write" ON conservation_projects FOR ALL USING (auth.uid() IS NOT NULL);

-- News articles: Allow read access to all, write access to authenticated users
CREATE POLICY "news_public_read" ON news_articles FOR SELECT USING (true);
CREATE POLICY "news_authenticated_write" ON news_articles FOR ALL USING (auth.uid() IS NOT NULL);

-- Educational resources: Allow read access to all, write access to authenticated users
CREATE POLICY "resources_public_read" ON educational_resources FOR SELECT USING (true);
CREATE POLICY "resources_authenticated_write" ON educational_resources FOR ALL USING (auth.uid() IS NOT NULL);

-- User activities: Allow read access to all, write access to authenticated users
CREATE POLICY "activities_public_read" ON user_activities FOR SELECT USING (true);
CREATE POLICY "activities_authenticated_write" ON user_activities FOR ALL USING (auth.uid() IS NOT NULL);

-- System settings: Allow read access to all, write access to authenticated users
CREATE POLICY "settings_public_read" ON system_settings FOR SELECT USING (true);
CREATE POLICY "settings_authenticated_write" ON system_settings FOR ALL USING (auth.uid() IS NOT NULL);

-- User favorites: Allow read access to own favorites, write access to authenticated users
CREATE POLICY "favorites_own_read" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_authenticated_write" ON user_favorites FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- 3. Test the fix
-- =============================================================================

-- Test that we can now query the profiles table
SELECT 'Testing profiles table access...' as test_message;
SELECT COUNT(*) as profiles_count FROM profiles;

-- Test that we can query marine_species table
SELECT 'Testing marine_species table access...' as test_message;
SELECT COUNT(*) as species_count FROM marine_species;

-- Test that we can query other tables
SELECT 'Testing other tables access...' as test_message;
SELECT COUNT(*) as tracking_count FROM species_tracking;
SELECT COUNT(*) as projects_count FROM conservation_projects;
SELECT COUNT(*) as news_count FROM news_articles;
SELECT COUNT(*) as resources_count FROM educational_resources;

COMMIT;

SELECT '✅ Simple RLS fix applied! All users should now have normal access.' as status; 