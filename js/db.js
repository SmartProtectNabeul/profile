// Simulated Database Service using localStorage
// This acts as a placeholder for Supabase/Firebase
window.DB = {
    // --- Users Table ---
    // Structure: { username: { profileData, links, style: { accent: '#7b61ff' } } }
    getUsers: function() {
        return JSON.parse(localStorage.getItem('nexus_db_users')) || {};
    },
    saveUsers: function(users) {
        localStorage.setItem('nexus_db_users', JSON.stringify(users));
    },
    getUser: function(username) {
        return this.getUsers()[username] || null;
    },
    saveUser: function(username, data) {
        const users = this.getUsers();
        users[username] = { ...users[username], ...data };
        this.saveUsers(users);
    },

    // --- Insights Table ---
    // Structure: { targetUsername: [ { viewerUsername, date } ] }
    recordView: function(targetUsername, viewerUsername) {
        if(targetUsername === viewerUsername) return; // Don't count self
        const views = JSON.parse(localStorage.getItem('nexus_db_views')) || {};
        if (!views[targetUsername]) views[targetUsername] = [];
        
        // Prevent duplicate views in same session if wanted, but let's just log it
        views[targetUsername].push({ viewer: viewerUsername || 'Anonymous', date: new Date().toISOString() });
        localStorage.setItem('nexus_db_views', JSON.stringify(views));
    },
    getViews: function(username) {
        const views = JSON.parse(localStorage.getItem('nexus_db_views')) || {};
        return views[username] || [];
    },

    // --- Contacts Table ---
    // Structure: { username: [ 'fav_user1', 'fav_user2' ] }
    addFavorite: function(username, target) {
        const favs = JSON.parse(localStorage.getItem('nexus_db_favs')) || {};
        if (!favs[username]) favs[username] = [];
        if (!favs[username].includes(target)) {
            favs[username].push(target);
            localStorage.setItem('nexus_db_favs', JSON.stringify(favs));
        }
    },
    removeFavorite: function(username, target) {
        const favs = JSON.parse(localStorage.getItem('nexus_db_favs')) || {};
        if (favs[username]) {
            favs[username] = favs[username].filter(f => f !== target);
            localStorage.setItem('nexus_db_favs', JSON.stringify(favs));
        }
    },
    getFavorites: function(username) {
        const favs = JSON.parse(localStorage.getItem('nexus_db_favs')) || {};
        return favs[username] || [];
    }
};
