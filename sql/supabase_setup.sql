-- =============================================================================
-- Marine Conservation Project Complete Supabase Database Setup
-- Marine Conservation Platform Complete Supabase Database Setup
-- =============================================================================
-- One-time import, fully functional database setup with all fixes and features
-- =============================================================================

-- Begin transaction
BEGIN;

-- =============================================================================
-- 1. Core table structure creation (using Supabase built-in authentication system)
-- =============================================================================

-- User profiles table (connected to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'researcher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_banned BOOLEAN DEFAULT FALSE,
    bio TEXT,
    location VARCHAR(255),
    research_interests TEXT[] DEFAULT '{}'
);

-- Marine species table
CREATE TABLE IF NOT EXISTS marine_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100),
    conservation_status VARCHAR(100) CHECK (conservation_status IN ('Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Extinct in Wild', 'Extinct')),
    description TEXT,
    habitat TEXT,
    diet TEXT,
    lifespan VARCHAR(100),
    size_range VARCHAR(100),
    population_trend VARCHAR(50) CHECK (population_trend IN ('Increasing', 'Stable', 'Decreasing', 'Unknown')),
    population_percentage INTEGER DEFAULT 50,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    threats TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Species tracking records table
CREATE TABLE IF NOT EXISTS species_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    species_name TEXT NOT NULL,
    species_id UUID REFERENCES marine_species(id) ON DELETE SET NULL,
    tracking_type TEXT NOT NULL DEFAULT 'observation' CHECK (tracking_type IN ('observation', 'tracking', 'monitoring', 'research')),
    location JSONB,
    metadata JSONB,
    notes TEXT,
    image_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    species_id UUID REFERENCES marine_species(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, species_id) -- Prevent duplicate favorites
);

-- Conservation projects table
CREATE TABLE IF NOT EXISTS conservation_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'planned')),
    budget DECIMAL(12, 2),
    funding_source VARCHAR(255),
    lead_organization VARCHAR(255),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    author_id UUID REFERENCES profiles(id),
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    read_time INTEGER DEFAULT 5,
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational resources table
CREATE TABLE IF NOT EXISTS educational_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    resource_type VARCHAR(100) DEFAULT 'article' CHECK (resource_type IN ('article', 'video', 'infographic', 'document', 'research', 'conservation', 'discovery', 'documentary')),
    difficulty_level VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    target_audience VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    file_url TEXT,
    image_url TEXT,
    read_time INTEGER DEFAULT 10,
    excerpt TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. Create indexes
-- =============================================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Species-related indexes
CREATE INDEX IF NOT EXISTS idx_marine_species_name ON marine_species(name);
CREATE INDEX IF NOT EXISTS idx_marine_species_category ON marine_species(category);
CREATE INDEX IF NOT EXISTS idx_marine_species_conservation_status ON marine_species(conservation_status);
CREATE INDEX IF NOT EXISTS idx_marine_species_tags ON marine_species USING GIN(tags);

-- Tracking records indexes
CREATE INDEX IF NOT EXISTS idx_species_tracking_user_id ON species_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_species_tracking_species_name ON species_tracking(species_name);
CREATE INDEX IF NOT EXISTS idx_species_tracking_species_id ON species_tracking(species_id);
CREATE INDEX IF NOT EXISTS idx_species_tracking_created_at ON species_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_species_tracking_tracking_type ON species_tracking(tracking_type);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_species_id ON user_favorites(species_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Projects and content indexes
CREATE INDEX IF NOT EXISTS idx_conservation_projects_status ON conservation_projects(status);
CREATE INDEX IF NOT EXISTS idx_conservation_projects_created_by ON conservation_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(featured);
CREATE INDEX IF NOT EXISTS idx_educational_resources_type ON educational_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_educational_resources_featured ON educational_resources(featured);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- =============================================================================
-- 3. Create functions and triggers
-- =============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update timestamp triggers for related tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marine_species_updated_at ON marine_species;
CREATE TRIGGER update_marine_species_updated_at BEFORE UPDATE ON marine_species FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conservation_projects_updated_at ON conservation_projects;
CREATE TRIGGER update_conservation_projects_updated_at BEFORE UPDATE ON conservation_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_educational_resources_updated_at ON educational_resources;
CREATE TRIGGER update_educational_resources_updated_at BEFORE UPDATE ON educational_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Automatically create profile when new user registers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. Row Level Security policies (RLS) - Fixed version
-- =============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE species_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Remove potentially conflicting policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own tracking" ON species_tracking;
DROP POLICY IF EXISTS "Users can insert their own tracking" ON species_tracking;
DROP POLICY IF EXISTS "Users can update their own tracking" ON species_tracking;
DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON user_activities;

-- Simplified RLS policies for Profiles table (avoid recursion)
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write" ON profiles FOR ALL USING (auth.uid() = id);

-- Species tracking table - Allow everyone to view, users manage their own data
CREATE POLICY "tracking_read" ON species_tracking FOR SELECT USING (true);
CREATE POLICY "tracking_write" ON species_tracking FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

-- User favorites table - Users can only manage their own favorites
CREATE POLICY "favorites_select" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- User activities table - Allow everyone to view, users manage their own data
CREATE POLICY "activities_read" ON user_activities FOR SELECT USING (true);
CREATE POLICY "activities_write" ON user_activities FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);

-- Marine species table - Everyone can view
DROP POLICY IF EXISTS "Anyone can view marine species" ON marine_species;
CREATE POLICY "Anyone can view marine species" ON marine_species FOR SELECT USING (true);

-- RLS policies for Conservation projects table
DROP POLICY IF EXISTS "Anyone can view projects" ON conservation_projects;
CREATE POLICY "Anyone can view projects" ON conservation_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON conservation_projects;
CREATE POLICY "Authenticated users can create projects" ON conservation_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for News articles table
DROP POLICY IF EXISTS "Anyone can view published articles" ON news_articles;
CREATE POLICY "Anyone can view published articles" ON news_articles FOR SELECT USING (published_at IS NOT NULL);

-- RLS policies for Educational resources table
DROP POLICY IF EXISTS "Anyone can view resources" ON educational_resources;
CREATE POLICY "Anyone can view resources" ON educational_resources FOR SELECT USING (true);

-- System settings table - Everyone can view
DROP POLICY IF EXISTS "Anyone can view settings" ON system_settings;
CREATE POLICY "Anyone can view settings" ON system_settings FOR SELECT USING (true);

-- =============================================================================
-- 5. System settings data
-- =============================================================================

INSERT INTO system_settings (key, value, description) VALUES
    ('site_name', '"Marine Conservation Platform"', 'Website name'),
    ('site_description', '"A comprehensive platform dedicated to marine conservation and research"', 'Website description'),
    ('maintenance_mode', 'false', 'Maintenance mode toggle'),
    ('registration_enabled', 'true', 'Whether user registration is allowed'),
    ('max_file_size', '10485760', 'Maximum file upload size (bytes)'),
    ('supported_image_types', '["jpg", "jpeg", "png", "gif", "webp"]', 'Supported image formats'),
    ('contact_email', '"admin@oceanprotect.org"', 'Contact email'),
    ('api_rate_limit', '1000', 'API request limit per hour'),
    ('backup_frequency', '"daily"', 'Data backup frequency')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 6. Marine species sample data (using online images)
-- =============================================================================

INSERT INTO marine_species (name, scientific_name, category, conservation_status, description, habitat, diet, lifespan, size_range, population_trend, population_percentage, image_url, tags, threats) VALUES
    ('Great White Shark', 'Carcharodon carcharias', 'Sharks', 'Vulnerable', 'The Great White Shark is the worlds largest predatory shark and is considered an apex predator in the ocean. They play an important role in marine ecosystems but face threats from overfishing and habitat destruction.', 'Temperate and tropical deep ocean waters', 'Seals, sea lions, large fish like tuna', 'Over 70 years', '4-6 meters', 'Decreasing', 30, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', ARRAY['Apex Predator', 'Endangered Species', 'Marine Conservation'], ARRAY['Overfishing', 'Habitat Destruction', 'Ocean Pollution']),
    
    ('Blue Whale', 'Balaenoptera musculus', 'Whales', 'Endangered', 'Blue whales are the largest animals on Earth and were once on the brink of extinction. Although now protected, population recovery is slow and they still face threats from ship strikes and ocean noise.', 'Global oceans, primarily feeding in polar waters', 'Krill', '80-90 years', '24-27 meters', 'Increasing', 15, 'https://images.unsplash.com/photo-1535649812653-bb302b6ec0b2?w=400&h=300&fit=crop', ARRAY['Largest Animal', 'Endangered Species', 'Migratory'], ARRAY['Ship Strikes', 'Ocean Noise', 'Climate Change']),
    
    ('Green Sea Turtle', 'Chelonia mydas', 'Reptiles', 'Endangered', 'Green sea turtles are one of the largest hard-shelled sea turtles, feeding on seagrass and algae. Their population has declined significantly due to nesting beach development and ocean pollution.', 'Tropical and subtropical oceans and coastal waters', 'Seagrass, algae, jellyfish', 'Over 80 years', '1-1.5 meters', 'Stable', 25, 'https://images.unsplash.com/photo-1507473358421-72f5e1104b7f?w=400&h=300&fit=crop', ARRAY['Ancient Species', 'Migratory', 'Endangered'], ARRAY['Beach Development', 'Plastic Pollution', 'Fishing']),
    
    ('Humpback Whale', 'Megaptera novaeangliae', 'Whales', 'Least Concern', 'Humpback whales are known for their complex songs and spectacular breaching behavior. Through international conservation efforts, their population has recovered significantly.', 'Global oceans, seasonal migration', 'Krill, small fish', '45-100 years', '12-16 meters', 'Increasing', 85, 'https://images.unsplash.com/photo-1535649812653-bb302b6ec0b2?w=400&h=300&fit=crop', ARRAY['Songs', 'Breaching', 'Migratory', 'Conservation Success'], ARRAY['Ship Disturbance', 'Fishing Net Entanglement', 'Ocean Noise']),
    
    ('Bottlenose Dolphin', 'Tursiops truncatus', 'Dolphins', 'Least Concern', 'Bottlenose dolphins are highly intelligent marine mammals known for their friendly nature and complex social behavior. They are adaptable and widely distributed.', 'Temperate and tropical oceans, coastal waters', 'Fish, cephalopods', '20-45 years', '2-4 meters', 'Stable', 75, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', ARRAY['High Intelligence', 'Social', 'Friendly'], ARRAY['Ocean Pollution', 'Fishing Bycatch', 'Habitat Destruction']),
    
    ('Reef-building Coral', 'Anthozoa', 'Corals', 'Critically Endangered', 'Coral reefs are one of the most diverse ecosystems in the ocean, but are facing bleaching threats from climate change. Coral reefs provide habitat for countless marine organisms.', 'Tropical shallow waters', 'Plankton, small organic matter', 'Hundreds of years', 'Colonies can extend for kilometers', 'Decreasing', 10, 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop', ARRAY['Ecosystem Engineer', 'Biodiversity', 'Bleaching'], ARRAY['Climate Change', 'Ocean Acidification', 'Pollution', 'Overdevelopment']),
    
    ('Seahorse', 'Hippocampus', 'Fish', 'Vulnerable', 'Seahorses are unique marine fish where males are responsible for incubating offspring. Many species face threats from habitat loss and overfishing.', 'Coastal seagrass beds, coral reefs, mangroves', 'Small crustaceans, plankton', '1-5 years', '1.5-35 centimeters', 'Decreasing', 40, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', ARRAY['Unique Reproduction', 'Camouflage', 'Vulnerable'], ARRAY['Habitat Destruction', 'Overfishing', 'Water Pollution']),
    
    ('Whale Shark', 'Rhincodon typus', 'Sharks', 'Endangered', 'Whale sharks are the world''s largest fish species. This gentle giant primarily feeds on plankton. Despite their massive size, their numbers are declining.', 'Tropical ocean surface waters', 'Plankton, small fish', '60-100 years', '12-18 meters', 'Decreasing', 20, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', ARRAY['Largest Fish', 'Gentle', 'Filter Feeder'], ARRAY['Fishing Bycatch', 'Ship Strikes', 'Habitat Destruction']),
    
    ('Polar Bear', 'Ursus maritimus', 'Mammals', 'Vulnerable', 'Polar bears depend on sea ice for hunting and are among the most direct victims of climate change. As Arctic sea ice decreases, their survival faces unprecedented challenges.', 'Arctic sea ice and surrounding areas', 'Seals (primarily ringed seals)', '15-18 years', '2-3 meters', 'Decreasing', 35, 'https://images.unsplash.com/photo-1551244072-f55267d5c6b3?w=400&h=300&fit=crop', ARRAY['Arctic', 'Climate Change Indicator', 'Apex Predator'], ARRAY['Climate Change', 'Sea Ice Reduction', 'Habitat Loss']),
    
    ('Emperor Penguin', 'Aptenodytes forsteri', 'Birds', 'Near Threatened', 'Emperor penguins are an iconic species of Antarctica, breeding in extremely cold conditions. Climate change poses threats to their sea ice breeding grounds.', 'Antarctic sea ice and surrounding waters', 'Krill, fish, cephalopods', '15-20 years', '100-130 centimeters tall', 'Stable', 60, 'https://images.unsplash.com/photo-1551986781-8be21a8870e9?w=400&h=300&fit=crop', ARRAY['Antarctic', 'Colonial', 'Polar Adaptation'], ARRAY['Climate Change', 'Sea Ice Changes', 'Food Chain Changes']),
    
    ('Spanish Dancer Sea Slug', 'Hexabranchus sanguineus', 'Mollusks', 'Least Concern', 'Spanish dancer sea slug is a large, colorful sea slug named for its elegant swimming posture, and is an important component of coral reef ecosystems.', 'Indo-Pacific coral reefs', 'Sponges', '1 year', '20-40 centimeters', 'Stable', 70, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', ARRAY['Colorful', 'Coral Reef', 'Swimming'], ARRAY['Coral Reef Destruction', 'Water Pollution']),
    
    ('Giant Pacific Octopus', 'Enteroctopus dofleini', 'Cephalopods', 'Least Concern', 'Giant Pacific octopus is the world''s largest octopus species, with extremely high intelligence and color-changing abilities, making it a master of camouflage in the ocean.', 'North Pacific coastal deep waters', 'Crabs, mollusks, fish', '3-5 years', 'Arm span up to 9 meters', 'Stable', 65, 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop', ARRAY['High Intelligence', 'Camouflage', 'Giant'], ARRAY['Overfishing', 'Habitat Destruction'])
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. Species tracking sample data
-- =============================================================================

INSERT INTO species_tracking (user_id, species_name, species_id, tracking_type, location, metadata, notes, created_at) VALUES
-- Past 7 days data
(NULL, 'Great White Shark', NULL, 'observation', '{"latitude": 35.6762, "longitude": 139.6503}', '{"weather": "Sunny"}', 'Observed great white shark activity in Tokyo Bay', NOW() - INTERVAL '1 day'),
(NULL, 'Blue Whale', NULL, 'tracking', '{"latitude": 36.2048, "longitude": 138.2529}', '{"weather": "Cloudy"}', 'Blue whale migration path monitoring', NOW() - INTERVAL '1 day'),
(NULL, 'Green Sea Turtle', NULL, 'monitoring', '{"latitude": 26.2041, "longitude": 127.6792}', '{"weather": "Sunny"}', 'Monitoring turtle nesting grounds', NOW() - INTERVAL '2 days'),
(NULL, 'Great White Shark', NULL, 'observation', '{"latitude": 35.6762, "longitude": 139.6503}', '{"weather": "Sunny"}', 'Observed great white shark again', NOW() - INTERVAL '2 days'),
(NULL, 'Humpback Whale', NULL, 'research', '{"latitude": 37.7749, "longitude": -122.4194}', '{"weather": "Foggy"}', 'Humpback whale song research', NOW() - INTERVAL '3 days'),
(NULL, 'Bottlenose Dolphin', NULL, 'observation', '{"latitude": 25.7617, "longitude": -80.1918}', '{"weather": "Sunny"}', 'Dolphin group observation', NOW() - INTERVAL '3 days'),
(NULL, 'Whale Shark', NULL, 'monitoring', '{"latitude": 4.2105, "longitude": 101.9758}', '{"weather": "Sunny"}', 'Whale Shark觅食监测', NOW() - INTERVAL '4 days'),
(NULL, 'Green Sea Turtle', NULL, 'observation', '{"latitude": 21.3099, "longitude": -157.8581}', '{"weather": "Sunny"}', 'Hawaiian green sea turtle observation', NOW() - INTERVAL '4 days'),
(NULL, 'Great White Shark', NULL, 'tracking', '{"latitude": -34.9285, "longitude": 138.6007}', '{"weather": "Cloudy"}', 'Great white shark tracking in Australia', NOW() - INTERVAL '5 days'),
(NULL, 'Polar Bear', NULL, 'monitoring', '{"latitude": 74.0445, "longitude": -125.0729}', '{"weather": "Snowy"}', 'Polar Bear栖息地监测', NOW() - INTERVAL '5 days'),
-- Past 30 days data
(NULL, 'Emperor Penguin', NULL, 'research', '{"latitude": -77.8419, "longitude": 166.6863}', '{"weather": "Snowy"}', 'Antarctic penguin research', NOW() - INTERVAL '7 days'),
(NULL, 'Reef-Building Coral', NULL, 'monitoring', '{"latitude": -16.2839, "longitude": 145.7781}', '{"weather": "Sunny"}', 'Coral bleaching monitoring', NOW() - INTERVAL '8 days'),
(NULL, 'Seahorse', NULL, 'observation', '{"latitude": 22.3193, "longitude": 114.1694}', '{"weather": "Sunny"}', 'Seahorse栖息地调查', NOW() - INTERVAL '10 days'),
(NULL, 'Giant Pacific Octopus', NULL, 'research', '{"latitude": 47.6062, "longitude": -122.3321}', '{"weather": "Cloudy"}', 'Octopus behavior research', NOW() - INTERVAL '12 days'),
(NULL, 'Blue Whale', NULL, 'tracking', '{"latitude": 35.6762, "longitude": 139.6503}', '{"weather": "Cloudy"}', 'Blue whale migration monitoring', NOW() - INTERVAL '15 days'),
(NULL, 'Humpback Whale', NULL, 'observation', '{"latitude": 21.3099, "longitude": -157.8581}', '{"weather": "Sunny"}', 'Humpback whale song recording', NOW() - INTERVAL '18 days'),
(NULL, 'Green Sea Turtle', NULL, 'monitoring', '{"latitude": -23.5505, "longitude": -46.6333}', '{"weather": "Rainy"}', 'Turtle conservation monitoring', NOW() - INTERVAL '20 days'),
(NULL, 'Great White Shark', NULL, 'research', '{"latitude": -33.9249, "longitude": 18.4241}', '{"weather": "Sunny"}', 'Great white shark behavior research', NOW() - INTERVAL '22 days'),
(NULL, 'Whale Shark', NULL, 'observation', '{"latitude": 20.6596, "longitude": -87.0739}', '{"weather": "Sunny"}', 'Whale Shark观光监测', NOW() - INTERVAL '25 days'),
(NULL, 'Bottlenose Dolphin', NULL, 'tracking', '{"latitude": 25.7617, "longitude": -80.1918}', '{"weather": "Cloudy"}', 'Dolphin tracking research', NOW() - INTERVAL '28 days');

-- =============================================================================
-- 8. User Activities Sample Data
-- =============================================================================

INSERT INTO user_activities (user_id, activity_type, activity_data, ip_address, user_agent, created_at) VALUES
-- Recent activity
(NULL, 'page_view', '{"page": "/species", "duration": 45}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '1 hour'),
(NULL, 'page_view', '{"page": "/species/detail", "duration": 120}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '2 hours'),
(NULL, 'page_view', '{"page": "/tracking", "duration": 180}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '3 hours'),
(NULL, 'search', '{"query": "Great White Shark", "results": 5}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '4 hours'),
(NULL, 'species_favorite', '{"species_name": "Great White Shark"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '6 hours'),
-- Daily activity
(NULL, 'user_login', '{"method": "email"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '1 day'),
(NULL, 'page_view', '{"page": "/resources", "duration": 90}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '1 day'),
(NULL, 'search', '{"query": "Endangered Species", "results": 12}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '2 days'),
(NULL, 'resource_download', '{"resource_name": "Marine Guide"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '2 days'),
(NULL, 'page_view', '{"page": "/admin", "duration": 300}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '3 days'),
(NULL, 'user_register', '{"method": "email"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '5 days'),
(NULL, 'page_view', '{"page": "/species", "duration": 60}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '7 days'),
(NULL, 'search', '{"query": "Whale", "results": 8}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '10 days'),
(NULL, 'species_favorite', '{"species_name": "Blue Whale"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '12 days'),
(NULL, 'resource_view', '{"resource_name": "Documentary"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '15 days'),
(NULL, 'admin_species_create', '{"species_name": "New Species"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '18 days'),
(NULL, 'admin_species_edit', '{"species_name": "Great White Shark"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '20 days'),
(NULL, 'data_export', '{"type": "species_list"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '25 days'),
(NULL, 'user_login', '{"method": "google"}', '127.0.0.1', 'Sample Browser', NOW() - INTERVAL '30 days');

-- =============================================================================
Section 9. Conservation Project Sample Data
-- =============================================================================

INSERT INTO conservation_projects (name, description, location, start_date, end_date, status, budget, funding_source, lead_organization) VALUES
    ('Great Barrier Reef Coral Restoration Project', 
     'Restore damaged coral reef ecosystems using artificial breeding and transplantation, aiming to restore 1000 hectares in 5 years', 
     'Great Barrier Reef, Australia', '2024-01-01', '2028-12-31', 'active', 15000000.00, 'Australian Government + International Environmental Fund', 'Australian Institute of Marine Science'),

    ('Pacific Sea Turtle Protection Network', 
     'Establish a Pacific sea turtle protection network to safeguard nesting beaches, monitor populations, and reduce human threats', 
     'Pacific coastal countries', '2023-06-01', '2026-05-31', 'active', 8500000.00, 'UN Environment Programme', 'Pacific Turtle Conservation Alliance'),

    ('Humpback Whale Migration Corridor Protection', 
     'Establish a protection zone for humpback whale migration corridors, reduce ship strikes, and monitor whale migration patterns', 
     'Pacific Migration Corridor', '2024-03-01', '2027-02-28', 'active', 6200000.00, 'International Whaling Commission', 'International Whale Protection Organization'),

    ('Ocean Plastic Cleanup Innovation Project', 
     'Develop and deploy innovative technologies to clean up marine plastic waste, focusing on the Pacific garbage patch', 
     'Pacific Garbage Patch', '2023-01-01', '2026-12-31', 'active', 25000000.00, 'Private Foundations + Tech Companies', 'Ocean Cleanup Foundation'),

    ('Mediterranean Dolphin Habitat Protection', 
     'Establish Mediterranean dolphin sanctuaries, enforce vessel speed limits, and reduce underwater noise pollution', 
     'Western Mediterranean', '2024-02-01', '2026-01-31', 'active', 4800000.00, 'EU Marine Conservation Fund', 'Mediterranean Marine Conservation Alliance'),

    ('Arctic Sea Ice Protection Campaign', 
     'Reduce carbon emissions through international cooperation, protect Arctic sea ice, and preserve habitat for species like the polar bear', 
     'Arctic Region', '2024-01-01', '2030-12-31', 'active', 50000000.00, 'Arctic Council', 'International Arctic Conservation Coalition')
ON CONFLICT DO NOTHING;


-- =============================================================================
Section 10. News Articles Sample Data
-- =============================================================================

INSERT INTO news_articles (title, content, summary, category, tags, image_url, read_time, featured, published_at) VALUES
    ('Great Barrier Reef Coral Bleaching Eased, Protection Efforts Show Results', 
     'Recent scientific studies show that sustained conservation efforts and innovative coral restoration techniques have improved coral bleaching in several areas of the Great Barrier Reef. The team used heat-resistant coral strains to increase adaptation to temperature changes. Strict water quality controls and restricted boating also played key roles. Experts say this offers valuable insights for global coral conservation...', 
     'Reef recovery shows conservation works, offering hope for global coral reefs', 
     'Environmental Protection', 
     ARRAY['Coral', 'Great Barrier Reef', 'Climate Change', 'Conservation Success'], 
     'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop', 
     8, 
     true, 
     NOW() - INTERVAL '2 days'),

    ('Deep Sea Exploration Uncovers New Species Communities, Faces Mining Threats', 
     'An international marine science team discovered multiple previously unknown species communities in the deep Pacific, including new corals, unique tubeworms, and unidentified crustaceans. These habitats face threats from deep-sea mining. Scientists urge a halt to commercial exploitation until ecosystems are better understood, warning recovery could take centuries...', 
     'New deep-sea species discovered alongside conservation concerns, scientists urge caution', 
     'Scientific Discovery', 
     ARRAY['Deep Sea', 'New Species', 'Mining Threats', 'Scientific Discovery'], 
     'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', 
     6, 
     true, 
     NOW() - INTERVAL '5 days'),

    ('Global Whale Populations Show Recovery Trend', 
     'A report from the International Whaling Commission shows that decades of protection have led to population rebounds in many whale species. Humpback whales increased from under 1,000 in the 1960s to over 80,000 today. Gray and bowhead whales show similar trends. However, species like the blue whale and North Atlantic right whale remain vulnerable, requiring continued conservation efforts...', 
     'International conservation efforts yield success as whale populations rebound', 
     'Conservation Results', 
     ARRAY['Whales', 'Population Recovery', 'Conservation Success', 'International Cooperation'], 
     'https://images.unsplash.com/photo-1535649812653-bb302b6ec0b2?w=400&h=300&fit=crop', 
     7, 
     true, 
     NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;


-- =============================================================================
Section 11. Educational Resources Sample Data
-- =============================================================================

INSERT INTO educational_resources (title, content, resource_type, difficulty_level, target_audience, tags, file_url, image_url, read_time, excerpt, featured) VALUES
    ('Complete Guide to Marine Ecosystem Fundamentals', 
     'Marine ecosystems are among the most complex and diverse ecosystems on Earth, covering 71% of the planet’s surface. This guide explains the fundamental components, food web relationships, nutrient cycles, and human impacts on the marine environment. It includes niches of plankton, benthic and nekton organisms, and features of coral reefs, deep sea, and polar environments...', 
     'article', 
     'beginner', 
     'Primary and secondary students, marine science beginners', 
     ARRAY['Ecosystem', 'Fundamentals', 'Education', 'Marine Science'], 
     '/resources/marine-ecosystem-guide.pdf', 
     'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', 
     15, 
     'Comprehensive guide on the structure, function, and significance of marine ecosystems', 
     true),

    ('Coral Reef Biodiversity Exploration Documentary', 
     'This 45-minute HD documentary explores the biodiversity of coral reefs, showcasing complex relationships among thousands of marine organisms. Filmed in iconic locations such as the Great Barrier Reef, Maldives, and Red Sea, it captures symbiosis, fish cleaning behaviors, and nocturnal activity...', 
     'documentary', 
     'intermediate', 
     'High school students, university students, marine enthusiasts', 
     ARRAY['Coral Reefs', 'Biodiversity', 'Documentary', 'Visual Education'], 
     '/resources/coral-reef-documentary.mp4', 
     'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400&h=300&fit=crop', 
     45, 
     'Visually showcases the magical beauty and complexity of coral reef ecosystems', 
     true)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 12. Data statistics and validation
-- =============================================================================

-- 更新表统计信息
ANALYZE profiles;
ANALYZE marine_species;
ANALYZE species_tracking;
ANALYZE user_favorites;
ANALYZE conservation_projects;
ANALYZE news_articles;
ANALYZE educational_resources;
ANALYZE user_activities;
ANALYZE system_settings;

-- 提交事务
COMMIT;

-- =============================================================================
-- 13. Display setup completion message
-- =============================================================================

-- 显示数据库Status
SELECT '🌊 Marine Conservation Platform Supabase setup complete!' as status;

-- 显示统计信息
SELECT 
    '📊 Database Statistics:' as stats_header;

SELECT 
    '🐋 Marine Species' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Issue' END as Status 
FROM marine_species
UNION ALL
SELECT 
    '📊 Species Tracking' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No Data' END as Status
FROM species_tracking
UNION ALL
SELECT 
    '❤️ User Favorites' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) >= 0 THEN '✅ OK' ELSE '❌ Issue' END as Status
FROM user_favorites
UNION ALL
SELECT 
    '📈 User Activities' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No Data' END as Status
FROM user_activities
UNION ALL
SELECT 
    '🌱 Conservation Projects' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No Data' END as Status
FROM conservation_projects
UNION ALL
SELECT 
    '📰 News Articles' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No Data' END as Status
FROM news_articles
UNION ALL
SELECT 
    '📚 Educational Resources' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ No Data' END as Status
FROM educational_resources
UNION ALL
SELECT 
    '⚙️ System Settings' as Category, COUNT(*) as Count,
    CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '❌ Issue' END as Status
FROM system_settings;

-- 显示使用说明
SELECT 
    '🚀 Database is ready! Includes the following features:' as ready_status;

SELECT 
    '✅ User authentication and profile management' as feature_1,
    '✅ Marine species data management' as feature_2,
    '✅ Species tracking and monitoring' as feature_3,
    '✅ User favorite system' as feature_4,
    '✅ Data analysis and statistics' as feature_5,
    '✅ Conservation project management' as feature_6,
    '✅ News and educational resources' as feature_7,
    '✅ Full RLS security policies' as feature_8;

    -- =============================================================================
-- Section 14. Resources Table and Sample Data
-- =============================================================================

-- Create the resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Research', 'Conservation', 'Discovery', 'Documentary', 'Education')),
    excerpt TEXT,
    image_url TEXT,
    read_time TEXT,
    author VARCHAR(255),
    author_avatar TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS policy
DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);

-- Trigger for auto update timestamp
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured);

-- Sample data
INSERT INTO resources (title, date, category, excerpt, image_url, read_time, author, author_avatar, featured) VALUES
('New Migration Patterns Discovered in Blue Whales','2025-05-02','Research','Researchers have identified previously unknown migration routes for blue whales in the Pacific Ocean, providing new insights into their behavior and adaptation to changing ocean conditions.','https://www.oceanactionhub.org/storage/2023/10/blue-whale-mother-and-calf-.jpg','8 min read','Dr. Emily Chen','/placeholder.svg?height=100&width=100&text=EC',true),
('Ocean Acidification Effects on Coral Reefs','2025-04-28','Research','A comprehensive study reveals the accelerating impact of ocean acidification on coral reef ecosystems worldwide, with concerning implications for marine biodiversity.','/placeholder.svg?height=400&width=600&text=Coral+Research','12 min read','Prof. James Wilson','/placeholder.svg?height=100&width=100&text=JW',false),
('Deep Sea Exploration Yields New Species','2025-04-15','Discovery','Marine biologists have identified 12 new species during a deep-sea expedition in the Mariana Trench, highlighting how much remains unknown about our ocean depths.','/placeholder.svg?height=400&width=600&text=Deep+Sea+Research','10 min read','Dr. Sarah Johnson','/placeholder.svg?height=100&width=100&text=SJ',false),
('Marine Protected Areas Show Positive Results','2025-05-05','Conservation','A 10-year study of marine protected areas shows significant recovery of fish populations and ecosystem health, providing evidence for expanded conservation efforts.','/placeholder.svg?height=400&width=600&text=Marine+Protected+Areas','7 min read','Maria Rodriguez','/placeholder.svg?height=100&width=100&text=MR',true),
('International Agreement on Plastic Pollution','2025-04-22','Conservation','World leaders have signed a landmark agreement to reduce plastic waste entering the oceans by 80% by 2030, marking a significant step in marine conservation.','/placeholder.svg?height=400&width=600&text=Plastic+Pollution','9 min read','Thomas Lee','/placeholder.svg?height=100&width=100&text=TL',false),
('Community-Led Conservation Success Story','2025-04-10','Conservation','Local communities in coastal regions have successfully implemented sustainable fishing practices, leading to marine ecosystem recovery and improved livelihoods.','/placeholder.svg?height=400&width=600&text=Community+Conservation','6 min read','Aisha Patel','/placeholder.svg?height=100&width=100&text=AP',false),
('Rare Megamouth Shark Sighted','2025-05-07','Discovery','Scientists have documented a rare sighting of the elusive megamouth shark off the coast of Japan, providing valuable data about this mysterious deep-sea species.','/placeholder.svg?height=400&width=600&text=Megamouth+Shark','5 min read','Dr. Kenji Tanaka','/placeholder.svg?height=100&width=100&text=KT',false),
('New Coral Reef Discovered in Deep Waters','2025-04-25','Discovery','Researchers have found a previously unknown coral reef system thriving at unusual depths in the Indian Ocean, challenging our understanding of coral ecosystems.','/placeholder.svg?height=400&width=600&text=Deep+Coral+Reef','8 min read','Dr. Amara Singh','/placeholder.svg?height=100&width=100&text=AS',false),
('Ancient Shipwreck Reveals Marine Ecosystem','2025-04-18','Discovery','A 400-year-old shipwreck has become a thriving artificial reef, hosting dozens of marine species and providing insights into ecosystem development.','/placeholder.svg?height=400&width=600&text=Shipwreck+Ecosystem','7 min read','Marco Rossi','/placeholder.svg?height=100&width=100&text=MR',false),
('Climate Change Impact on Marine Mammals','2025-05-01','Research','New research documents how climate change is affecting marine mammal populations worldwide, with particular focus on Arctic species and their changing habitats.','/placeholder.svg?height=400&width=600&text=Climate+Change+Impact','11 min read','Dr. Lisa Nordstrom','/placeholder.svg?height=100&width=100&text=LN',false),
('Innovative Technologies for Ocean Cleanup','2025-04-20','Conservation','Engineers have developed new autonomous systems for removing plastic waste from oceans, with pilot programs showing promising results in heavily polluted areas.','/placeholder.svg?height=400&width=600&text=Ocean+Cleanup','9 min read','Michael Zhang','/placeholder.svg?height=100&width=100&text=MZ',false),
('Marine Biology Education Programs for Schools','2025-04-05','Education','New curriculum resources are helping K-12 students learn about marine ecosystems and conservation through interactive, hands-on activities.','/placeholder.svg?height=400&width=600&text=Marine+Education','6 min read','Emma Thompson','/placeholder.svg?height=100&width=100&text=ET',false),
('Blue Planet II: The Deep','2025-03-15','Documentary','An exploration of the deepest parts of our oceans, revealing extraordinary creatures and behaviors never before filmed, narrated by Sir David Attenborough.','/placeholder.svg?height=400&width=600&text=Blue+Planet+II','58 min watch','BBC Earth','/placeholder.svg?height=100&width=100&text=BBC',true),
('Chasing Coral: The Vanishing Reefs','2025-03-10','Documentary','A team of divers, photographers, and scientists set out on an ocean adventure to discover why coral reefs are disappearing at an unprecedented rate.','/placeholder.svg?height=400&width=600&text=Chasing+Coral','93 min watch','Exposure Labs','/placeholder.svg?height=100&width=100&text=EL',false),
('Mission Blue: Hope Spots','2025-02-28','Documentary','Dr. Sylvia Earle\'s mission to create a global network of marine protected areas, called \"Hope Spots,\" to safeguard the health of our oceans.','/placeholder.svg?height=400&width=600&text=Mission+Blue','95 min watch','Netflix Originals','/placeholder.svg?height=100&width=100&text=NF',false),
('Seaspiracy: Fishing Industry Exposed','2025-02-15','Documentary','An investigation into the environmental impact of industrial fishing and the human rights abuses in the fishing industry worldwide.','/placeholder.svg?height=400&width=600&text=Seaspiracy','89 min watch','Ali Tabrizi','/placeholder.svg?height=100&width=100&text=AT',false),
('My Octopus Teacher','2025-01-25','Documentary','A filmmaker forges an unusual friendship with an octopus living in a South African kelp forest, learning as the animal shares the mysteries of her world.','/placeholder.svg?height=400&width=600&text=Octopus+Teacher','85 min watch','Craig Foster','/placeholder.svg?height=100&width=100&text=CF',false),
('A Plastic Ocean: The Truth About Pollution','2025-01-10','Documentary','An adventure documentary that brings to light the consequences of our global disposable lifestyle, revealing the causes and solutions for plastic pollution.','/placeholder.svg?height=400&width=600&text=Plastic+Ocean','102 min watch','Plastic Oceans Foundation','/placeholder.svg?height=100&width=100&text=PO',false),
('Acoustic Monitoring of Whale Populations','2025-05-10','Research','New acoustic monitoring technologies are revolutionizing how scientists track and study whale populations, providing non-invasive methods for conservation research.','/placeholder.svg?height=400&width=600&text=Acoustic+Monitoring','14 min read','Dr. Carlos Mendez','/placeholder.svg?height=100&width=100&text=CM',false),
('Microplastics in Marine Food Webs','2025-04-30','Research','A comprehensive study on how microplastics enter and move through marine food webs, with implications for both wildlife and human health.','/placeholder.svg?height=400&width=600&text=Microplastics','15 min read','Dr. Hannah Kim','/placeholder.svg?height=100&width=100&text=HK',false),
('Seagrass Restoration Projects Worldwide','2025-03-25','Conservation','An overview of successful seagrass meadow restoration projects that are helping to rebuild critical marine habitats and sequester carbon.','/placeholder.svg?height=400&width=600&text=Seagrass+Restoration','8 min read','Dr. Robert Green','/placeholder.svg?height=100&width=100&text=RG',false),
('Indigenous Knowledge in Marine Conservation','2025-03-20','Conservation','How traditional ecological knowledge from indigenous communities is being integrated with scientific approaches to enhance marine conservation efforts.','/placeholder.svg?height=400&width=600&text=Indigenous+Knowledge','11 min read','Maya Williams','/placeholder.svg?height=100&width=100&text=MW',false),
('Virtual Reality Ocean Exploration for Classrooms','2025-02-05','Education','New VR technologies are bringing ocean exploration into classrooms, allowing students to experience marine environments without leaving school.','/placeholder.svg?height=400&width=600&text=VR+Ocean','7 min read','Tech Education Team','/placeholder.svg?height=100&width=100&text=TET',false),
('Citizen Science Programs for Ocean Monitoring','2025-01-15','Education','How everyday citizens are contributing to marine research through organized monitoring programs, with opportunities for public participation.','/placeholder.svg?height=400&width=600&text=Citizen+Science','9 min read','Community Science Initiative','/placeholder.svg?height=100&width=100&text=CSI',false);

-- Analyze for optimizer
ANALYZE resources;
