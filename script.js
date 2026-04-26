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

    let allProducts = [];

    async function fetchHardware() {
        try {
            const response = await fetch('products.json');
            if (response.ok) {
                await new Promise(r => setTimeout(r, 800));
                updateStatus('SYSTEM OK // REST API SYNCHRONIZED');
                allProducts = await response.json();
                renderHardware(allProducts);
                setupFilters();
            } else {
                throw new Error(`ERR: HTTP_${response.status}`);
            }
        } catch (error) {
            console.error('Core Exception:', error);
            updateStatus('ERR: CONNECTION REFUSED', true);
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; font-family: var(--font-mono); color: var(--error-color);">
                    FATAL_ERROR: Failed to establish REST handshake. Check products.json availability.
                </div>
            `;
        } finally {
            loader.style.display = 'none';
        }
    }

    function setupFilters() {
        const filterContainer = document.getElementById('category-filters');
        const categories = ['all', ...new Set(allProducts.map(p => p.category))];
        
        filterContainer.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
        `).join('');

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                const filtered = category === 'all' 
                    ? allProducts 
                    : allProducts.filter(p => p.category === category);
                
                renderHardware(filtered);
            });
        });
    }

    function renderHardware(products) {
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; font-family: var(--font-mono); color: var(--text-muted);">
                    NO_PRODUCTS_FOUND: Refine your search filters.
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map((product, index) => `
            <div class="product-card" style="--animation-order: ${index}">
                <div class="product-content">
                    <div class="product-meta">
                        <div class="product-tag">${product.category}</div>
                        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    </div>
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.title}" loading="lazy">
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        <button class="btn-action">Purchase</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-attach mouse tracking
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

    // --- 3. AUTHENTICATION & DASHBOARD ---
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
