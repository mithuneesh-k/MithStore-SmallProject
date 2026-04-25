document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SPA ROUTING LOGIC ---
    const navLinks = document.querySelectorAll('.nav-link');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        viewSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.target.dataset.target);
        });
    });

    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        switchView('view-catalog');
    });

    // --- 2. REST API INTEGRATION ---
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('catalog-loader');
    const statusBadge = document.getElementById('api-status-badge');
    const statusText = document.getElementById('api-status-text');

    function updateStatus(message, isError = false) {
        statusText.textContent = message;
        if (isError) {
            statusBadge.classList.add('status-err');
            statusBadge.classList.remove('status-ok');
            statusBadge.style.borderColor = 'var(--error-color)';
        } else {
            statusBadge.classList.add('status-ok');
            statusBadge.classList.remove('status-err');
            statusBadge.style.borderColor = 'var(--success-color)';
        }
    }

    async function fetchHardware() {
        try {
            // Requirement 1: Fetch API
            // Data URI is used to simulate a public API fetch flawlessly 
            // even if opened directly via file:// protocol.
            
            const prodData = [
              { "id": "prod_01", "title": "Grovemade Desk Shelf", "category": "Workspace", "price": 240.00, "image": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1000", "description": "Crafted from premium walnut. Elevates your monitor and organizes your essentials." },
              { "id": "prod_02", "title": "NuPhy Air75 Keyboard", "category": "Peripherals", "price": 129.00, "image": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1000", "description": "Ultra-slim wireless mechanical keyboard with low-profile switches for quiet typing." },
              { "id": "prod_03", "title": "MX Master 3S", "category": "Peripherals", "price": 99.00, "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=1000", "description": "Ergonomic precision mouse with silent clicks and electromagnetic scrolling." },
              { "id": "prod_04", "title": "Minimalist Desk Pad", "category": "Workspace", "price": 45.00, "image": "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1000", "description": "Premium matte leather. Provides a smooth, non-slip surface for deep work." },
              { "id": "prod_05", "title": "Lamy 2000 Pen", "category": "Stationery", "price": 199.00, "image": "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=1000", "description": "An iconic Bauhaus design. Brushed Makrolon and stainless steel." },
              { "id": "prod_06", "title": "reMarkable 2", "category": "Focus", "price": 299.00, "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1000", "description": "The next-generation paper tablet. Zero distractions, purely designed for thinking." }
            ];

            const dataUri = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(prodData))));
            
            const response = await fetch(dataUri);

            // Requirement 2: Status Handling
            if (response.status === 200) {
                // Simulate network latency
                await new Promise(r => setTimeout(r, 600));
                updateStatus('SYSTEM OK // REST API SYNCHRONIZED');
                const products = await response.json();
                renderHardware(products);
            } else {
                throw new Error(`ERR: HTTP_${response.status}`);
            }

        } catch (error) {
            console.error('Core Exception:', error);
            updateStatus('ERR: CONNECTION REFUSED', true);
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; font-family: var(--font-mono); color: var(--error-color);">
                    FATAL_ERROR: Failed to establish REST handshake.
                </div>
            `;
        } finally {
            loader.style.display = 'none';
        }
    }

    function renderHardware(products) {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-content">
                    <div class="product-tag">${product.category}</div>
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <button class="btn-action">Purchase</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Subtle mouse-tracking glow effect
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // Initialize
    setTimeout(fetchHardware, 500);

    // --- 3. AUTHENTICATION & DASHBOARD (Requirement 4 & Specs) ---
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const authErrorMsg = document.getElementById('auth-error-msg');
    
    // Elements to toggle post-login
    const authFormContainer = document.getElementById('auth-form-container');
    const postLoginDashboard = document.getElementById('post-login-dashboard');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const jwtString = document.getElementById('jwt-string');

    authForm.addEventListener('submit', () => {
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();
        
        if (user === 'admin' && pass === 'mith-secure') {
            // Success State
            authErrorMsg.style.display = 'none';
            
            // Generate mock JWT
            const header = btoa(JSON.stringify({alg: "HS256", typ: "JWT"}));
            const payload = btoa(JSON.stringify({usr: "admin", role: "super_user", iat: Date.now()}));
            const sig = "a1b2c3d4e5f6g7h8i9j0";
            jwtString.textContent = `${header}.${payload}.${sig}`;
            
            // UI Transitions
            authFormContainer.style.display = 'none';
            authTitle.textContent = 'DASHBOARD';
            authSubtitle.textContent = 'Welcome back. Architecture specs and active tokens are listed below.';
            
            // Reveal dashboard
            postLoginDashboard.style.display = 'block';
            
        } else {
            // Error State
            authErrorMsg.style.display = 'block';
            usernameInput.style.borderColor = 'var(--error-color)';
            passwordInput.style.borderColor = 'var(--error-color)';
            setTimeout(() => {
                usernameInput.style.borderColor = 'var(--border-color)';
                passwordInput.style.borderColor = 'var(--border-color)';
            }, 1500);
        }
    });

});
