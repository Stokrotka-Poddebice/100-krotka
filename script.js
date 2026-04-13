// --- KONFIGURACJA I DANE ---
const products = [
    { id: 1, name: "Bukiet Letnie Harmonie", price: 210, image: "assets/bukiet1.jpg", description: "Kompozycja pełna słońca i radości." },
    { id: 2, name: "Kompozycja Dziki Ogród", price: 180, image: "assets/bukiet2.jpg", description: "Styl rustykalny." },
    { id: 3, name: "Roślina Leokasja", price: 110, image: "assets/bukiet3.jpg", description: "Egzotyczna roślina doniczkowa." }
];

let cart = [];

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    initTabs();
    startFomoTimer();
});

// --- OBSŁUGA TAbÓW (Clean Code) ---
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // Przełącz przyciski
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Przełącz sekcje
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.toggle('active', section.id === target);
            });
        });
    });
}

// --- LOGIKA KOSZYKA ---
function syncCart() {
    renderCart();
    saveCart();
}

function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        cart = saved ? JSON.parse(saved) : [];
        syncCart();
    } catch (e) {
        console.error("Błąd ładowania koszyka:", e);
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    syncCart();
    showToast(`Dodano: ${product.name}`);
}

function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    syncCart();
}

function addAddon(name, price) {
    const id = `addon-${name}`;
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, isAddon: true });
    }
    syncCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <div class="qty-ctrl">
                <button onclick="changeQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
            <span>${item.price * item.quantity} PLN</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.innerText = total;
    countEl.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// --- FOMO TIMER (Poprawiona logika) ---
function startFomoTimer() {
    const timerElement = document.getElementById('fomo-timer');
    if (!timerElement) return;

    function update() {
        const now = new Date();
        let deadline = new Date();
        deadline.setHours(12, 0, 0, 0);

        // Jeśli jest po 12:00, ustaw deadline na jutro na 12:00
        if (now > deadline) {
            deadline.setDate(deadline.getDate() + 1);
            document.querySelector('.fomo-text').innerHTML = "🌿 Zamów teraz, a dostarczymy <b>jutro rano!</b>";
        }

        const diff = deadline - now;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff / 60000) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
        
        timerElement.innerText = `${h}:${m}:${s}`;
    }

    update();
    setInterval(update, 1000);
}

// --- UI HELPERY ---
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.price} PLN</p>
            <button class="btn" onclick="addToCart(${p.id})">Dodaj do koszyka</button>
        </div>
    `).join('');
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    const btn = document.getElementById('dark-mode-toggle');
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function showToast(msg) {
    console.log("Toast:", msg); // Tutaj można dodać element DOM dla powiadomienia
}