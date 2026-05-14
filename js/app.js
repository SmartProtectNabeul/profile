document.addEventListener('DOMContentLoaded', () => {
    const isDashboard = document.querySelector('.dashboard-body') !== null;
    
    if (isDashboard) {
        const urlParams = new URLSearchParams(window.location.search);
        const viewUser = urlParams.get('u');
        const currentUser = localStorage.getItem('nexus_username') || 'ahmed';
        const isViewMode = viewUser && viewUser !== currentUser;
        const targetUsername = isViewMode ? viewUser : currentUser;

        // DB Migration / Fetch Data
        let userData = window.DB.getUser(targetUsername);
        if (!userData) {
            // Default mock data
            userData = {
                profile: {
                    name: targetUsername === 'ahmed' ? 'Ahmed Najjar' : targetUsername,
                    title: 'IT Guy',
                    bio: 'IT student\nTunisia, Nabeul\nISETN',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
                    banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop'
                },
                links: [],
                style: { accent: '#7b61ff' }
            };
            
            // Migrate legacy data if it's the current user
            if (!isViewMode) {
                const legProf = JSON.parse(localStorage.getItem('nexus_profile'));
                if (legProf) userData.profile = legProf;
                const legLinks = JSON.parse(localStorage.getItem('nexus_links'));
                if (legLinks) userData.links = legLinks;
                window.DB.saveUser(targetUsername, userData);
            }
        }

        // --- View Mode Overrides ---
        if (isViewMode) {
            const editBadgeBtn = document.getElementById('edit-badge-btn');
            const editProfileBtn = document.getElementById('edit-profile-btn');
            const topHeader = document.getElementById('top-header');
            const nav = document.querySelector('.bottom-nav');
            
            if(editBadgeBtn) editBadgeBtn.style.display = 'none';
            if(editProfileBtn) editProfileBtn.style.display = 'none';
            if(topHeader) topHeader.innerHTML = `<div class="logo">nexus.</div>`; 
            if(nav) nav.style.display = 'none'; // Only show tabs to owner
            document.querySelector('.dashboard-main').style.paddingBottom = '2rem';

            // Record View
            window.DB.recordView(targetUsername, currentUser);
        }

        // Apply Style
        document.documentElement.style.setProperty('--accent-primary', userData.style.accent);

        // --- Tabs Logic ---
        const tabs = document.querySelectorAll('.tab-content');
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute('data-tab');
                if(!targetTab) return;

                // Update active classes
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update contents
                tabs.forEach(tab => {
                    tab.style.display = tab.id === targetTab ? 'block' : 'none';
                });
            });
        });

        // --- Load Profile Display ---
        const loadProfileDisplay = () => {
            const usernameDisplay = document.getElementById('share-username');
            if (usernameDisplay) usernameDisplay.textContent = targetUsername;

            document.getElementById('profile-name').textContent = userData.profile.name;
            document.getElementById('profile-title').textContent = userData.profile.title;
            document.getElementById('profile-desc').innerHTML = userData.profile.bio.replace(/\n/g, '<br>');
            document.getElementById('avatar-img').src = userData.profile.avatar;
            document.getElementById('banner-img').src = userData.profile.banner;
            
            const navAvatar = document.getElementById('nav-avatar');
            if (navAvatar) navAvatar.src = userData.profile.avatar;

            // Form Fields
            if (!isViewMode) {
                document.getElementById('edit-name').value = userData.profile.name;
                document.getElementById('edit-title').value = userData.profile.title;
                document.getElementById('edit-bio').value = userData.profile.bio;
                renderEditLinks();
                renderInsights();
                renderContacts();
            }
            renderLinks();
        };

        // --- Render Links ---
        const linksContainer = document.getElementById('links-container');
        const editLinksContainer = document.getElementById('edit-links-container');
        
        const getIconConfig = (type) => {
            const map = {
                'Website': { icon: 'fa-regular fa-compass', color: '#007AFF', bg: 'white' },
                'Call': { icon: 'fa-solid fa-phone', color: 'white', bg: '#34C759' },
                'Email': { icon: 'fa-regular fa-envelope', color: 'white', bg: '#00A8FF' },
                'LinkedIn': { icon: 'fa-brands fa-linkedin-in', color: 'white', bg: '#0077B5' },
                'Instagram': { icon: 'fa-brands fa-instagram', color: 'white', bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
                'Facebook': { icon: 'fa-brands fa-facebook-f', color: 'white', bg: '#1877F2' },
                'WhatsApp': { icon: 'fa-brands fa-whatsapp', color: 'white', bg: '#25D366' },
                'Other': { icon: 'fa-solid fa-link', color: 'white', bg: 'var(--accent-primary)' }
            };
            return map[type] || map['Other'];
        };

        const renderLinks = () => {
            linksContainer.innerHTML = '';
            userData.links.forEach(link => {
                const config = getIconConfig(link.type);
                const displayVal = ['Call', 'Email'].includes(link.type) ? link.value : link.url.replace(/^https?:\/\//, '');
                
                const linkEl = document.createElement('a');
                linkEl.href = link.url;
                linkEl.className = 'glass-card link-item';
                linkEl.style.textDecoration = 'none';
                linkEl.style.color = 'inherit';
                linkEl.setAttribute('data-id', link.id);
                
                linkEl.innerHTML = `
                    <div class="link-icon" style="background: ${config.bg}; color: ${config.color};">
                        <i class="${config.icon}"></i>
                    </div>
                    <div class="link-details">
                        <h4>${link.title}</h4>
                        <p>${displayVal}</p>
                    </div>
                    ${!isViewMode ? '<div class="drag-handle" style="padding: 10px; cursor: grab;"><i class="fa-solid fa-sort"></i></div>' : ''}
                `;
                
                const handle = linkEl.querySelector('.drag-handle');
                if (handle) handle.addEventListener('click', (e) => e.preventDefault());

                linksContainer.appendChild(linkEl);
            });

            if (!isViewMode && typeof Sortable !== 'undefined') {
                new Sortable(linksContainer, {
                    handle: '.drag-handle',
                    animation: 150,
                    onEnd: function (evt) {
                        const items = Array.from(linksContainer.children);
                        const newOrderIds = items.map(el => el.getAttribute('data-id'));
                        
                        const newLinks = [];
                        newOrderIds.forEach(id => {
                            const found = userData.links.find(l => l.id === id);
                            if(found) newLinks.push(found);
                        });
                        userData.links = newLinks;
                        window.DB.saveUser(targetUsername, userData);
                    }
                });
            }
        };

        const renderEditLinks = () => {
            editLinksContainer.innerHTML = '';
            userData.links.forEach((link, idx) => {
                const div = document.createElement('div');
                div.className = 'glass-card';
                div.style.padding = '1rem';
                div.style.display = 'flex';
                div.style.flexDirection = 'column';
                div.style.gap = '0.5rem';
                
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <select class="link-type-sel" style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: white; padding: 0.5rem; border-radius: 8px;">
                            ${['Website','Call','Email','LinkedIn','Instagram','Facebook','WhatsApp','Other'].map(opt => `<option value="${opt}" ${link.type === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                        <button type="button" class="badge-btn remove-link-btn" style="background: #dc3545;" data-idx="${idx}">Remove</button>
                    </div>
                    <input type="text" class="link-title-inp" value="${link.title}" placeholder="Title" style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: white; padding: 0.5rem; border-radius: 8px;">
                    <input type="text" class="link-url-inp" value="${link.url}" placeholder="URL (or tel: for call)" style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: white; padding: 0.5rem; border-radius: 8px;">
                    ${['Call', 'Email'].includes(link.type) ? `<input type="text" class="link-val-inp" value="${link.value || ''}" placeholder="Display Value" style="background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: white; padding: 0.5rem; border-radius: 8px;">` : ''}
                `;
                
                div.querySelector('.link-type-sel').addEventListener('change', (e) => {
                    userData.links[idx].type = e.target.value;
                    renderEditLinks();
                });
                
                div.querySelector('.link-title-inp').addEventListener('input', (e) => userData.links[idx].title = e.target.value);
                div.querySelector('.link-url-inp').addEventListener('input', (e) => userData.links[idx].url = e.target.value);
                const valInp = div.querySelector('.link-val-inp');
                if(valInp) valInp.addEventListener('input', (e) => userData.links[idx].value = e.target.value);

                div.querySelector('.remove-link-btn').addEventListener('click', (e) => {
                    const removeIdx = parseInt(e.target.getAttribute('data-idx'));
                    userData.links.splice(removeIdx, 1);
                    renderEditLinks();
                });

                editLinksContainer.appendChild(div);
            });
        };

        const addLinkBtn = document.getElementById('add-link-btn');
        if (addLinkBtn) {
            addLinkBtn.addEventListener('click', () => {
                userData.links.push({ id: Date.now().toString(), type: 'Website', title: 'New Link', url: 'https://' });
                renderEditLinks();
            });
        }

        // --- Insights ---
        const renderInsights = () => {
            const views = window.DB.getViews(targetUsername);
            document.getElementById('insights-views').textContent = views.length;
            
            const list = document.getElementById('recent-visitors-list');
            list.innerHTML = '';
            
            [...views].reverse().slice(0, 10).forEach(v => {
                const div = document.createElement('div');
                div.className = 'glass-card link-item';
                div.innerHTML = `
                    <div class="link-details">
                        <h4 style="margin-bottom:0;">@${v.viewer}</h4>
                        <p style="font-size: 0.7rem;">${new Date(v.date).toLocaleString()}</p>
                    </div>
                `;
                list.appendChild(div);
            });
        };

        // --- Styles ---
        document.querySelectorAll('.color-btn').forEach(btn => {
            if(btn.dataset.color === userData.style.accent) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                userData.style.accent = btn.dataset.color;
                document.documentElement.style.setProperty('--accent-primary', userData.style.accent);
                window.DB.saveUser(targetUsername, userData);
            });
        });

        // --- Contacts / Favorites ---
        const renderContacts = () => {
            const favs = window.DB.getFavorites(targetUsername);
            const list = document.getElementById('favorites-list');
            list.innerHTML = '';
            
            if (favs.length === 0) {
                list.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No favorites yet.</p>';
            }

            favs.forEach(favU => {
                const favData = window.DB.getUser(favU) || { profile: { name: favU, title: 'User', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }};
                const div = document.createElement('a');
                div.href = `dashboard.html?u=${favU}`;
                div.className = 'glass-card contact-item';
                div.innerHTML = `
                    <img src="${favData.profile.avatar}" class="nav-avatar" style="border-color: var(--accent-primary);">
                    <div class="link-details">
                        <h4>${favData.profile.name}</h4>
                        <p>@${favU}</p>
                    </div>
                    <button class="btn btn-icon remove-fav-btn" data-user="${favU}" style="background: rgba(255,0,0,0.2);"><i class="fa-solid fa-heart-crack"></i></button>
                `;
                list.appendChild(div);
            });

            document.querySelectorAll('.remove-fav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault(); // prevent navigation
                    window.DB.removeFavorite(targetUsername, btn.dataset.user);
                    renderContacts();
                });
            });
        };

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const q = document.getElementById('contact-search').value;
                if (!q) return;
                const found = window.DB.getUser(q);
                if (found) {
                    window.DB.addFavorite(targetUsername, q);
                    renderContacts();
                    document.getElementById('contact-search').value = '';
                } else {
                    alert('User not found!');
                }
            });
        }

        // --- Profile Editing / Modals ---
        let pendingAvatarBase64 = null;
        let pendingBannerBase64 = null;
        
        const fileToBase64 = (file, callback) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => callback(reader.result);
        };

        const editAvatarFile = document.getElementById('edit-avatar-file');
        const editBannerFile = document.getElementById('edit-banner-file');
        if (editAvatarFile) editAvatarFile.addEventListener('change', (e) => { if (e.target.files[0]) fileToBase64(e.target.files[0], b => pendingAvatarBase64 = b); });
        if (editBannerFile) editBannerFile.addEventListener('change', (e) => { if (e.target.files[0]) fileToBase64(e.target.files[0], b => pendingBannerBase64 = b); });

        const editProfileForm = document.getElementById('edit-profile-form');
        const editModal = document.getElementById('edit-modal');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                userData.profile.name = document.getElementById('edit-name').value;
                userData.profile.title = document.getElementById('edit-title').value;
                userData.profile.bio = document.getElementById('edit-bio').value;
                if(pendingAvatarBase64) userData.profile.avatar = pendingAvatarBase64;
                if(pendingBannerBase64) userData.profile.banner = pendingBannerBase64;
                
                window.DB.saveUser(targetUsername, userData);
                loadProfileDisplay();
                editModal.classList.remove('active');
            });
        }

        const openEditModal = () => { if (editModal) editModal.classList.add('active'); };
        const closeEditModal = () => { if (editModal) editModal.classList.remove('active'); };
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const editBadgeBtn = document.getElementById('edit-badge-btn');
        const closeEditBtn = document.getElementById('close-edit');

        if (editProfileBtn) editProfileBtn.addEventListener('click', openEditModal);
        if (editBadgeBtn) editBadgeBtn.addEventListener('click', openEditModal);
        if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);

        // Share Modal
        const shareBtn = document.getElementById('share-btn');
        const qrModal = document.getElementById('qr-modal');
        const closeQrBtn = document.getElementById('close-qr');
        const qrContainer = document.getElementById('qrcode');
        const copyLinkBtn = document.getElementById('copy-link-btn');

        if (shareBtn && qrModal) {
            shareBtn.addEventListener('click', () => {
                qrModal.classList.add('active');
                if (qrContainer && qrContainer.innerHTML === '') {
                    const profileUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/dashboard.html') + '?u=' + targetUsername;
                    new QRCode(qrContainer, { text: profileUrl, width: 200, height: 200, colorDark : "#000000", colorLight : "#ffffff" });
                }
            });
        }

        if (closeQrBtn) closeQrBtn.addEventListener('click', () => qrModal.classList.remove('active'));

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                const profileUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/dashboard.html') + '?u=' + targetUsername;
                navigator.clipboard.writeText(profileUrl).then(() => {
                    const originalText = copyLinkBtn.textContent;
                    copyLinkBtn.textContent = 'Copied!';
                    copyLinkBtn.style.background = '#34C759';
                    setTimeout(() => { copyLinkBtn.textContent = originalText; copyLinkBtn.style.background = 'var(--accent-primary)'; }, 2000);
                });
            });
        }

        // Initialize display
        loadProfileDisplay();
    }
});
