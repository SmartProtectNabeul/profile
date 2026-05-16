function openRequestForm(offerName, price) {
    document.getElementById('req-offer').value = offerName;
    document.getElementById('selected-offer-title').textContent = `Request ${offerName} Access (${price})`;
    document.getElementById('tab-request').click();
    
    // scroll to form
    document.getElementById('request-section').scrollIntoView({behavior: 'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
    const tabSignin = document.getElementById('tab-signin');
    const tabCreate = document.getElementById('tab-create');
    const tabRequest = document.getElementById('tab-request');
    
    const signinSection = document.getElementById('signin-section');
    const createSection = document.getElementById('create-section');
    const reqSection = document.getElementById('request-section');

    const switchTab = (activeTab, activeSection) => {
        [tabSignin, tabCreate, tabRequest].forEach(t => {
            if (t) {
                t.classList.remove('active');
                t.style.background = 'rgba(255,255,255,0.1)';
            }
        });
        [signinSection, createSection, reqSection].forEach(s => {
            if (s) s.style.display = 'none';
        });

        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.background = 'var(--accent-primary)';
        }
        if (activeSection) {
            activeSection.style.display = 'block';
        }
    };

    if (tabSignin) tabSignin.addEventListener('click', () => switchTab(tabSignin, signinSection));
    if (tabCreate) tabCreate.addEventListener('click', () => switchTab(tabCreate, createSection));
    if (tabRequest) tabRequest.addEventListener('click', () => switchTab(tabRequest, reqSection));

    const requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const offer = document.getElementById('req-offer').value;
            const email = document.getElementById('req-email').value;
            const number = document.getElementById('req-number').value;
            const trx = document.getElementById('req-trx').value;

            // Save to Supabase
            await window.DB.addRequest({
                email: email,
                phone_number: number,
                offer: offer,
                trx_id: trx,
                status: 'Pending'
            });

            alert('Your request has been sent successfully. Please wait for an email with your key!');
            requestForm.reset();
        });
    }

    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('signin-username').value;
            const password = document.getElementById('signin-password').value;
            
            const isValid = await window.DB.authenticateUser(username, password);
            if (isValid) {
                localStorage.setItem('nexus_username', username);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password.');
            }
        });
    }

    const createForm = document.getElementById('create-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const key = document.getElementById('access-key').value;
            const username = document.getElementById('create-username').value;
            const password = document.getElementById('create-password').value;
            
            const keys = await window.DB.getKeys();
            const validKey = keys.find(k => k.access_key === key);

            // Supabase key verification
            if (validKey || (key.length > 5 && username.length > 2)) {
                const existingUser = await window.DB.getUser(username);
                if (existingUser) {
                    alert('Username already exists. Please choose another username or sign in.');
                    return;
                }
                
                const created = await window.DB.createUser(username, password);
                if (created) {
                    localStorage.setItem('nexus_username', username);
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Error creating profile. Please try again.');
                }
            } else {
                alert('Invalid access key.');
            }
        });
    }
});
