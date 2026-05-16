// Supabase Database Service
const SUPABASE_URL = 'https://slkrndsblwtlcpbzlheb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Oqlac0mR0IQcst2NXzqpNQ_hIZg2e1Y';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.DB = {
    // --- Users Table ---
    authenticateUser: async function(username, password) {
        if (!supabaseClient) return false;
        const { data: profile } = await supabaseClient.from('profiles').select('password').eq('username', username).single();
        if (!profile) return false;
        return profile.password === password;
    },

    createUser: async function(username, password) {
        if (!supabaseClient) return false;
        const { error } = await supabaseClient.from('profiles').insert({
            username: username,
            password: password,
            name: username,
            title: 'New User',
            bio: 'Welcome to my Nexus profile',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
            banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop'
        });
        return !error;
    },

    getUser: async function(username) {
        if (!supabaseClient) return null;
        
        const { data: profile } = await supabaseClient.from('profiles').select('*').eq('username', username).single();
        if (!profile) return null;
        
        const { data: links } = await supabaseClient.from('links').select('*').eq('username', username).order('order_index', { ascending: true });
        
        return {
            profile: {
                name: profile.name,
                title: profile.title,
                bio: profile.bio,
                avatar: profile.avatar,
                banner: profile.banner
            },
            links: links || [],
            style: { accent: profile.style_accent || '#7b61ff' }
        };
    },

    saveUser: async function(username, data) {
        if (!supabaseClient) return;

        // Update Profile (Assume it was created via createUser)
        await supabaseClient.from('profiles').update({
            name: data.profile.name,
            title: data.profile.title,
            bio: data.profile.bio,
            avatar: data.profile.avatar,
            banner: data.profile.banner,
            style_accent: data.style.accent
        }).eq('username', username);

        // Delete old links and insert new
        await supabaseClient.from('links').delete().eq('username', username);
        
        if (data.links && data.links.length > 0) {
            const newLinks = data.links.map((l, index) => ({
                username: username,
                type: l.type,
                title: l.title,
                url: l.url,
                value: l.value,
                order_index: index
            }));
            await supabaseClient.from('links').insert(newLinks);
        }
    },

    // --- Insights Table ---
    recordView: async function(targetUsername, viewerUsername) {
        if (!supabaseClient || targetUsername === viewerUsername) return;
        
        await supabaseClient.from('profile_views').insert({
            target_username: targetUsername,
            viewer_username: viewerUsername || 'Anonymous'
        });
    },

    getViews: async function(username) {
        if (!supabaseClient) return [];
        const { data } = await supabaseClient.from('profile_views').select('*').eq('target_username', username).order('created_at', { ascending: false });
        return (data || []).map(v => ({ viewer: v.viewer_username, date: v.created_at }));
    },

    // --- Contacts Table ---
    addFavorite: async function(username, target) {
        if (!supabaseClient) return;
        await supabaseClient.from('favorites').upsert({
            username: username,
            favorite_username: target
        }, { onConflict: 'username,favorite_username' });
    },
    
    removeFavorite: async function(username, target) {
        if (!supabaseClient) return;
        await supabaseClient.from('favorites').delete().match({ username: username, favorite_username: target });
    },

    getFavorites: async function(username) {
        if (!supabaseClient) return [];
        const { data } = await supabaseClient.from('favorites').select('favorite_username').eq('username', username);
        return (data || []).map(f => f.favorite_username);
    },

    // --- Admin Functions ---
    getRequests: async function() {
        if (!supabaseClient) return [];
        const { data } = await supabaseClient.from('access_requests').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    
    addRequest: async function(requestData) {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.from('access_requests').insert([requestData]);
        if (error) {
            console.error("Error adding request:", error);
            alert("Database Error (Access Denied): " + error.message + "\n\nPlease ensure you have disabled Row Level Security on the access_requests table.");
            throw error;
        }
    },

    acceptRequest: async function(id, status) {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.from('access_requests').update({ status: status }).eq('id', id);
        if (error) {
            console.error("Error updating request:", error);
            alert("Database Error (Access Denied): " + error.message + "\n\nPlease ensure you have disabled Row Level Security on the access_requests table.");
            throw error;
        }
    },

    getKeys: async function() {
        if (!supabaseClient) return [];
        const { data } = await supabaseClient.from('access_keys').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    addKey: async function(keyData) {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.from('access_keys').insert([keyData]);
        if (error) {
            console.error("Error adding key:", error);
            alert("Database Error (Access Denied): " + error.message + "\n\nPlease ensure you have disabled Row Level Security on the access_keys table.");
            throw error;
        }
    }
};
