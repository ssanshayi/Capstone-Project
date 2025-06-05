-- Function to clean up orphaned records
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_records()
RETURNS void AS $$
BEGIN
    -- Delete profiles that don't have corresponding auth.users
    DELETE FROM public.profiles
    WHERE id NOT IN (SELECT id FROM auth.users);

    -- Delete auth.users that don't have corresponding profiles
    DELETE FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the cleanup
SELECT public.cleanup_orphaned_records();

-- Add unique constraint to auth.users email
ALTER TABLE auth.users
ADD CONSTRAINT users_email_key UNIQUE (email);

-- Modify the handle_new_user function to handle conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        -- Update existing profile
        UPDATE public.profiles
        SET 
            name = COALESCE(NEW.raw_user_meta_data->>'name', name),
            email = NEW.email,
            role = COALESCE(role, 'user')
        WHERE id = NEW.id;
    ELSE
        -- Insert new profile
        INSERT INTO public.profiles (id, name, email, role)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'name',
            NEW.email,
            'user'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 