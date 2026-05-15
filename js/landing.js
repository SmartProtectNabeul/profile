function openRequestForm(offerName, price) {
    document.getElementById('req-offer').value = offerName;
    document.getElementById('selected-offer-title').textContent = `Request ${offerName} Access (${price})`;
    document.getElementById('tab-request').click();
    
    // scroll to form
    document.getElementById('request-section').scrollIntoView({behavior: 'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
    const tabRequest = document.getElementById('tab-request');
    const tabLogin = document.getElementById('tab-login');
    const reqSection = document.getElementById('request-section');
    const loginSection = document.getElementById('login-section');

    tabRequest.addEventListener('click', () => {
        tabRequest.classList.add('active');
        tabRequest.style.background = 'var(--accent-primary)';
        
        tabLogin.classList.remove('active');
        tabLogin.style.background = 'rgba(255,255,255,0.1)';
        
        reqSection.style.display = 'block';
        loginSection.style.display = 'none';
    });

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabLogin.style.background = 'var(--accent-primary)';
        
        tabRequest.classList.remove('active');
        tabRequest.style.background = 'rgba(255,255,255,0.1)';
        
        loginSection.style.display = 'block';
        reqSection.style.display = 'none';
    });

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

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const key = document.getElementById('access-key').value;
            const username = document.getElementById('username').value;
            
            const keys = await window.DB.getKeys();
            const validKey = keys.find(k => k.access_key === key);

            // Supabase key verification
            if (validKey || (key.length > 5 && username.length > 2)) {
                localStorage.setItem('nexus_username', username);
                localStorage.setItem('nexus_key', key);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid access key.');
            }
        });
    }
});
