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
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const offer = document.getElementById('req-offer').value;
            const email = document.getElementById('req-email').value;
            const number = document.getElementById('req-number').value;
            const trx = document.getElementById('req-trx').value;

            // Save to simulated database
            const requests = JSON.parse(localStorage.getItem('nexus_requests')) || [];
            requests.push({
                date: new Date().toISOString(),
                offer, email, number, trx, status: 'Pending'
            });
            localStorage.setItem('nexus_requests', JSON.stringify(requests));

            alert('Your request has been sent successfully. Please wait for an email with your key!');
            requestForm.reset();
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const key = document.getElementById('access-key').value;
            const username = document.getElementById('username').value;
            
            const keys = JSON.parse(localStorage.getItem('nexus_keys')) || [];
            const validKey = keys.find(k => k.key === key);

            // Simulation: allow test keys or any key > 5 length for demo
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
