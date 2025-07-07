-- =============================================================================
-- Marine Conservation Platform - Admin Setup Script
-- =============================================================================
-- This script sets up admin functionality and creates admin users
-- =============================================================================

-- Begin transaction
BEGIN;

-- =============================================================================
-- 1. Create admin user function
-- =============================================================================

CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_full_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % does not exist. Please create the user account first.', admin_email;
    END IF;
    
    -- Update or insert profile with admin role
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (user_id, admin_email, admin_full_name, 'admin')
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        full_name = COALESCE(admin_full_name, profiles.full_name),
        updated_at = NOW();
    
    RAISE NOTICE '✅ Admin user created/updated: % (ID: %)', admin_email, user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. Create admin management functions
-- =============================================================================

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update role to admin
    UPDATE profiles SET role = 'admin', updated_at = NOW() WHERE id = user_id;
    
    RAISE NOTICE '✅ User % promoted to admin', user_email;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to user
CREATE OR REPLACE FUNCTION demote_from_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update role to user
    UPDATE profiles SET role = 'user', updated_at = NOW() WHERE id = user_id;
    
    RAISE NOTICE '✅ Admin % demoted to user', user_email;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban/unban user
CREATE OR REPLACE FUNCTION toggle_user_ban(user_email TEXT, ban_status BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update ban status
    UPDATE profiles SET is_banned = ban_status, updated_at = NOW() WHERE id = user_id;
    
    IF ban_status THEN
        RAISE NOTICE '✅ User % has been banned', user_email;
    ELSE
        RAISE NOTICE '✅ User % has been unbanned', user_email;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. Create admin-specific RLS policies
-- =============================================================================

-- Admin can read all profiles
DROP POLICY IF EXISTS "admin_profiles_read" ON profiles;
CREATE POLICY "admin_profiles_read" ON profiles 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can update all profiles
DROP POLICY IF EXISTS "admin_profiles_update" ON profiles;
CREATE POLICY "admin_profiles_update" ON profiles 
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage all species
DROP POLICY IF EXISTS "admin_species_manage" ON marine_species;
CREATE POLICY "admin_species_manage" ON marine_species 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage all tracking records
DROP POLICY IF EXISTS "admin_tracking_manage" ON species_tracking;
CREATE POLICY "admin_tracking_manage" ON species_tracking 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage all projects
DROP POLICY IF EXISTS "admin_projects_manage" ON conservation_projects;
CREATE POLICY "admin_projects_manage" ON conservation_projects 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage all news articles
DROP POLICY IF EXISTS "admin_news_manage" ON news_articles;
CREATE POLICY "admin_news_manage" ON news_articles 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage all educational resources
DROP POLICY IF EXISTS "admin_resources_manage" ON educational_resources;
CREATE POLICY "admin_resources_manage" ON educational_resources 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can view all user activities
DROP POLICY IF EXISTS "admin_activities_read" ON user_activities;
CREATE POLICY "admin_activities_read" ON user_activities 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admin can manage system settings
DROP POLICY IF EXISTS "admin_settings_manage" ON system_settings;
CREATE POLICY "admin_settings_manage" ON system_settings 
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================================================
-- 4. Create admin helper functions
-- =============================================================================

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    is_banned BOOLEAN,
    created_at TIMESTAMPTZ,
    last_sign_in TIMESTAMPTZ
) AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.role,
        p.is_banned,
        p.created_at,
        u.last_sign_in_at
    FROM profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system statistics (admin only)
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_species BIGINT,
    total_tracking_records BIGINT,
    total_projects BIGINT,
    total_news_articles BIGINT,
    total_resources BIGINT,
    admin_users BIGINT,
    banned_users BIGINT
) AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles) as total_users,
        (SELECT COUNT(*) FROM marine_species) as total_species,
        (SELECT COUNT(*) FROM species_tracking) as total_tracking_records,
        (SELECT COUNT(*) FROM conservation_projects) as total_projects,
        (SELECT COUNT(*) FROM news_articles) as total_news_articles,
        (SELECT COUNT(*) FROM educational_resources) as total_resources,
        (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM profiles WHERE is_banned = true) as banned_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. Create admin user (replace with your email)
-- =============================================================================

-- Uncomment and modify the line below to create your first admin user
-- SELECT create_admin_user('your-email@example.com', 'Your Name');

-- =============================================================================
-- 6. Insert default admin settings
-- =============================================================================

INSERT INTO system_settings (key, value, description) VALUES
    ('admin_email_notifications', 'true', 'Enable email notifications for admin actions'),
    ('admin_dashboard_refresh_interval', '30000', 'Admin dashboard refresh interval in milliseconds'),
    ('max_file_upload_size', '10485760', 'Maximum file upload size for admin uploads (10MB)'),
    ('admin_session_timeout', '3600000', 'Admin session timeout in milliseconds (1 hour)'),
    ('enable_admin_audit_log', 'true', 'Enable audit logging for admin actions')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 7. Display setup completion
-- =============================================================================

SELECT '🌊 Admin setup complete!' as status;

SELECT 
    '📋 Available admin functions:' as functions_header;

SELECT 
    'create_admin_user(email, name)' as function_1,
    'promote_to_admin(email)' as function_2,
    'demote_from_admin(email)' as function_3,
    'toggle_user_ban(email, true/false)' as function_4,
    'get_all_users()' as function_5,
    'get_system_stats()' as function_6;

SELECT 
    '🔐 To create your first admin user, run:' as instruction_header,
    'SELECT create_admin_user(''your-email@example.com'', ''Your Name'');' as instruction;

-- Commit transaction
COMMIT; 