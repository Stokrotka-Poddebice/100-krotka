// --- OPISY PRODUKTÓW ---
const products = [
    { id: 1, name: "Bukiet Letnie Harmonie", price: 210, image: "assets/bukiet1.jpg", description: "Kompozycja pełna słońca i radości..." },
    { id: 2, name: "Kompozycja Dziki Ogród", price: 180, image: "assets/bukiet2.jpg", description: "Naturalna, lekko niesforna kompozycja w stylu rustykalnym..." },
    { id: 3, name: "Roślina Leokasja", price: 110, image: "assets/bukiet3.jpg", description: "Egzotyczna roślina doniczkowa o spektakularnych liściach..." },
    { id: 4, name: "Flowerbox letnia łąka", price: 150, image: "assets/bukiet4.jpg", description: "Klasyczny bukiet 15 głębokich, czerwonych róż..." },
    { id: 5, name: "Flowerbox czerwone róże", price: 300, image: "assets/bukiet5.jpg", description: "Klasyczny bukiet 15 głębokich, czerwonych róż..." },
    { id: 6, name: "Bukiet Słoneczny", price: 120, image: "assets/bukiet6.jpg", description: "Radosna kompozycja żółtych róż i słoneczników..." },
    { id: 7, name: "Czerwona Pasja", price: 150, image: "assets/bukiet7.jpg", description: "Klasyczny bukiet 15 głębokich, czerwonych róż..." }
];

let cart = JSON.parse(localStorage.getItem('stokrotka_cart')) || [];

// Złączone i uporządkowane nasłuchiwanie zdarzeń na starcie
document.addEventListener('DOMContentLoaded', () => {
    // Ładowanie motywu
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        const darkModeBtn = document.getElementById('dark-mode-toggle');
        if (darkModeBtn) {
            darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    // Inicjalizacja funkcji sklepu
    updateCart();
    displayProducts();
    startFomoTimer();
    revealElements();
    
    const defaultFilterBtn = document.querySelector('.filter-btn.active');
    if (defaultFilterBtn) defaultFilterBtn.click();
});

// --- GENEROWANIE PRODUKTÓW ---
function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card reveal';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="price">${product.price} PLN</p>
            <button class="btn" onclick="openProductModal(${product.id})">Zobacz szczegóły</button>
        `;
        container.appendChild(card);
    });
}

// --- LOGIKA KOSZYKA ---
function saveCart() { localStorage.setItem('stokrotka_cart', JSON.stringify(cart)); }

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('hidden'); }

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ name, price, quantity: 1 });

    saveCart();
    updateCart();
    showToast(`Dodano: ${name}`);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if(!cartItems || !cartCount || !cartTotal) return;
    cartItems.innerHTML = '';
    let total = 0, totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: #888; text-align: center;">Twój koszyk jest pusty.</p>';
        cartCount.innerText = '(0)';
        cartTotal.innerText = '0';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalQuantity += item.quantity;
        const li = document.createElement('li');
        li.style.display = "flex"; li.style.justifyContent = "space-between"; li.style.alignItems = "center"; li.style.marginBottom = "10px";
        li.innerHTML = `
            <div style="flex: 1;">${item.name}<br><small>${item.price * item.quantity} PLN</small></div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="zmienIlosc(${index}, -1)" style="width:25px; cursor:pointer;">-</button>
                <span>${item.quantity}</span>
                <button onclick="zmienIlosc(${index}, 1)" style="width:25px; cursor:pointer;">+</button>
                <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">✖</button>
            </div>`;
        cartItems.appendChild(li);
    });
    cartCount.innerText = `(${totalQuantity})`;
    cartTotal.innerText = total;
}

function zmienIlosc(index, oIle) {
    cart[index].quantity += oIle;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(); updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(); updateCart();
    showToast('Usunięto z koszyka');
}

function addAddon(name, price) {
    addToCart(name, price);
}

// --- ZAMÓWIENIE (KASA) ---
function goToCheckout() {
    if (cart.length === 0) {
        showToast("Twój koszyk jest pusty!");
        return;
    }

    switchTab(null, 'zamowienie');

    const orderItemsList = document.getElementById('order-items');
    const orderTotalSpan = document.getElementById('order-total');
    const hiddenCartInput = document.getElementById('cart-items-input');

    let currentTotal = 0;
    if (orderItemsList) orderItemsList.innerHTML = '';

    cart.forEach(item => {
        const itemSum = item.price * item.quantity;
        currentTotal += itemSum;
        if (orderItemsList) {
            const li = document.createElement('li');
            li.style.display = 'flex'; li.style.justifyContent = 'space-between'; li.style.marginBottom = '5px';
            li.innerHTML = `<span>${item.name} x${item.quantity}</span><span>${itemSum} PLN</span>`;
            orderItemsList.appendChild(li);
        }
    });

    if (orderTotalSpan) orderTotalSpan.innerText = `${currentTotal} PLN`;
    if (hiddenCartInput) {
        hiddenCartInput.value = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('cart-sidebar').classList.add('hidden');
}

// --- MODAL DLA PRODUKTÓW ---
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    modal.classList.remove('is-gallery');

    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.description;
    document.getElementById('modal-price').innerText = `${product.price} PLN`;

    document.getElementById('modal-add-btn').onclick = () => {
        addToCart(product.name, product.price);
        closeModal();
    };
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

// --- MODAL DLA GALERII ---
function openGalleryModal(imgSrc, altText) {
    const modal = document.getElementById('product-modal');
    modal.classList.add('is-gallery');

    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-title').innerText = altText;
    document.getElementById('modal-desc').innerText = "Realizacja Kwiaciarni Stokrotka";

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// --- ZAMYKANIE MODALA ---
function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// --- ZAKŁADKI, FILTRY, TOASTY, INNE ---
function switchTab(event, tabId) {
    if (event) event.preventDefault();
    document.querySelectorAll('.tab-content').forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
    
    const activeContent = document.getElementById(tabId);
    if (activeContent) { activeContent.classList.add('active'); activeContent.style.display = 'block'; }

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${tabId}'`)) btn.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filterValue = button.getAttribute('data-filter');
        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.style.display = 'block'; setTimeout(() => item.style.opacity = '1', 10);
            } else {
                item.style.opacity = '0'; setTimeout(() => item.style.display = 'none', 400);
            }
        });
    });
});

function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) return; 
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

const revealElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card, .gallery-item, h2, #kontakt p').forEach(target => {
        target.classList.add('reveal'); observer.observe(target);
    });
};

function startFomoTimer() {
    const timerElement = document.getElementById('fomo-timer');
    if (!timerElement) return;
    function updateTimer() {
        const now = new Date();
        const deadline = new Date();
        deadline.setHours(12, 0, 0, 0);
        let diff = deadline - now;
        if (diff > 0) {
            timerElement.innerText = `${Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0')}:${Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0')}:${Math.floor((diff / 1000) % 60).toString().padStart(2, '0')}`;
        } else {
            document.querySelector('.fomo-text').innerHTML = "🌿 Zamów teraz, a Twoje kwiaty dostarczymy <b>już jutro rano!</b>";
        }
    }
    updateTimer(); setInterval(updateTimer, 1000);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
    const btn = document.getElementById('dark-mode-toggle');
    const isDark = document.body.classList.contains('dark-theme');
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}