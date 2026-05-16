-- Run this script in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    title TEXT,
    bio TEXT,
    avatar TEXT,
    banner TEXT,
    style_accent TEXT DEFAULT '#7b61ff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Links Table
CREATE TABLE links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT REFERENCES profiles(username) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    url TEXT,
    value TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profile Views Table (Insights)
CREATE TABLE profile_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_username TEXT REFERENCES profiles(username) ON DELETE CASCADE,
    viewer_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Favorites Table (Contacts)
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT,
    favorite_username TEXT REFERENCES profiles(username) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(username, favorite_username)
);

-- 5. Access Requests Table (Admin)
CREATE TABLE access_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT,
    phone_number TEXT,
    offer TEXT,
    trx_id TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Access Keys Table (Admin)
CREATE TABLE access_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    access_key TEXT UNIQUE NOT NULL,
    email TEXT,
    offer TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for simplicity during development
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE links DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_keys DISABLE ROW LEVEL SECURITY;
