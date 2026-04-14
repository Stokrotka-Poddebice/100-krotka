// --- 1. DANE PRODUKTÓW (SKLEP) ---
const products = [
    { 
        id: 1, name: "Bukiet Letnie Harmonie", image: "assets/bukiet1.jpg", price: 210, // price to tylko cena "wyświetlana" w siatce sklepu
        description: "Kompozycja pełna słońca i radości...",
        type: "size", 
        variants: { "Mały": 168, "Średni": 210, "Duży": 260 } 
    },
    { 
        id: 2, name: "Kompozycja Dziki Ogród", image: "assets/bukiet2.jpg", price: 180, 
        description: "Naturalna, lekko niesforna kompozycja w stylu rustykalnym...",
        type: "size", 
        variants: { "Standard": 180, "Premium (Powiększony)": 240 } // Możesz używać dowolnych nazw!
    },
    { 
        id: 3, name: "Roślina Leokasja", image: "assets/bukiet3.jpg", price: 110, 
        description: "Egzotyczna roślina doniczkowa o spektakularnych liściach...",
        type: "size", 
        variants: { "Mniejsza": 85, "Standardowa": 110 } 
    },
    { 
        id: 4, name: "Flowerbox letnia łąka", image: "assets/bukiet4.jpg", price: 150, 
        description: "Klasyczny bukiet w formie boxa...",
        type: "size", 
        variants: { "Średni": 150, "Duży": 200 } 
    },
    { 
        id: 5, name: "Czerwone Róże (Na sztuki)", image: "assets/bukiet5.jpg", price: 300, 
        description: "Klasyczne głębokie, czerwone róże. Skomponuj własną wielkość bukietu.",
        type: "quantity", 
        pricePerItem: 20, // Cena za JEDNĄ sztukę
        defaultQty: 15    // Domyślna ilość pokazana po kliknięciu
    },
    { 
        id: 6, name: "Bukiet Słoneczny", image: "assets/bukiet6.jpg", price: 120, 
        description: "Radosna kompozycja żółtych róż i słoneczników...",
        type: "size", 
        variants: { "Mały": 90, "Średni": 120, "Wielki": 180 } 
    },
    { 
        id: 7, name: "Różowe Tulipany (Na sztuki)", image: "assets/bukiet7.jpg", price: 150, 
        description: "Delikatne tulipany idealne na prezent wiosenny.",
        type: "quantity", 
        pricePerItem: 6, // Cena za 1 tulipana
        defaultQty: 25   // Startujemy od 25 szt.
    }
];

// --- 2. DANE GALERII (REALIZACJE) ---
const galleryItems = [
    { src: "assets/img1.jpg", alt: "Rustykalny bukiet ślubny z lawendą i kłosami zbóż - styl boho.", category: "slubne" },
    { src: "assets/img2.jpg", alt: "Elegancki bukiet pełen pastelowych róż i sezonowych dodatków.", category: "slubne" },
    { src: "assets/img3.jpg", alt: "Subtelna dekoracja stołu z gipsówki i polnych kwiatów - lekkość i wdzięk.", category: "bukiety" },
    { src: "assets/img4.jpg", alt: "Błękitna fantazja - kompozycja z ostróżką i margerytkami.", category: "bukiety" },
    { src: "assets/img5.jpg", alt: "Klasyczny Flowerbox z czerwonymi różami na prezent", category: "bukiety" },
    { src: "assets/img6.jpg", alt: "Klasyczny Flowerbox z różowymi różami na prezent", category: "flowerboxy" },
    { src: "assets/img7.jpg", alt: "Flower box z kwiatami w odcieniach różu", category: "flowerboxy" },
    { src: "assets/img11.jpg", alt: "Dekoracja kwiatowa samochodu do ślubu w kolorze białym", category: "samochody" },
    { src: "assets/img12.jpg", alt: "Dekoracja kwiatowa samochodu do ślubu w kolorze białym", category: "samochody" },
    { src: "assets/img13.jpg", alt: "Delikatna kwiatowa dekoracja samochodu do ślubu", category: "samochody" },
    { src: "assets/img14.jpg", alt: "Dekoracja kwiatowa samochodu do ślubu w kolorze herbacianym", category: "samochody" },
    { src: "assets/img15.jpg", alt: "Dekoracja kwiatowa maski samochodu do ślubu w kolorze białym", category: "samochody" }
];

let cart = JSON.parse(localStorage.getItem('stokrotka_cart')) || [];
let currentFlowerCount = 15;
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        const darkModeBtn = document.getElementById('dark-mode-toggle');
        if (darkModeBtn) darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    updateCart();
    displayProducts();
    displayGallery(); 
    setupFilters();   
    startFomoTimer();
    revealElements();
    
    const defaultFilterBtn = document.querySelector('.filter-btn.active');
    if (defaultFilterBtn) defaultFilterBtn.click();
});

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
            <p class="price">od ${product.type === 'quantity' ? (product.pricePerItem * product.defaultQty) : product.price} PLN</p>
            <button class="btn" onclick="openProductModal(${product.id})">Zobacz szczegóły</button>
        `;
        container.appendChild(card);
    });
}

function displayGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = galleryItems.map(item => `
        <img src="${item.src}" alt="${item.alt}" class="gallery-item ${item.category} reveal" onclick="openGalleryModal(this.src, this.alt)" loading="lazy">
    `).join('');
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.getAttribute('data-filter');
            const items = document.querySelectorAll('.gallery-item'); 
            
            items.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block'; 
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0'; 
                    setTimeout(() => item.style.display = 'none', 400);
                }
            });
        });
    });
}

function saveCart() { localStorage.setItem('stokrotka_cart', JSON.stringify(cart)); }
function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('hidden'); }

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ name, price, quantity: 1 });
    saveCart(); updateCart(); showToast(`Dodano: ${name}`);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const orderItemsList = document.getElementById('order-items');
    const orderTotalSpan = document.getElementById('order-total');
    const hiddenCartInput = document.getElementById('cart-items-input');
    
    if(!cartItems || !cartCount || !cartTotal) return;
    
    cartItems.innerHTML = '';
    if (orderItemsList) orderItemsList.innerHTML = '';
    let total = 0, totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: #888; text-align: center;">Twój koszyk jest pusty.</p>';
        if (orderItemsList) orderItemsList.innerHTML = '<p style="color: #fff; text-align: center; opacity: 0.8;">Brak produktów w zamówieniu.</p>';
        cartCount.innerText = '(0)'; cartTotal.innerText = '0';
        if (orderTotalSpan) orderTotalSpan.innerText = '0 PLN';
        if (hiddenCartInput) hiddenCartInput.value = '';
        return;
    }

    cart.forEach((item, index) => {
        const itemSum = item.price * item.quantity;
        total += itemSum; totalQuantity += item.quantity;
        
        const liSidebar = document.createElement('li');
        liSidebar.style.display = "flex"; liSidebar.style.justifyContent = "space-between"; liSidebar.style.alignItems = "center"; liSidebar.style.marginBottom = "10px";
        liSidebar.innerHTML = `
            <div style="flex: 1;">${item.name}<br><small>${itemSum} PLN</small></div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" onclick="zmienIlosc(${index}, -1)" style="width:25px; cursor:pointer;">-</button>
                <span>${item.quantity}</span>
                <button type="button" onclick="zmienIlosc(${index}, 1)" style="width:25px; cursor:pointer;">+</button>
                <button type="button" onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">✖</button>
            </div>`;
        cartItems.appendChild(liSidebar);

        if (orderItemsList) {
            const liCheckout = document.createElement('li');
            liCheckout.style.display = 'flex'; liCheckout.style.justifyContent = 'space-between'; liCheckout.style.alignItems = 'center'; liCheckout.style.marginBottom = '10px'; liCheckout.style.borderBottom = '1px dashed rgba(255,255,255,0.3)'; liCheckout.style.paddingBottom = '10px';
            liCheckout.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #fff;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">Cena: ${item.price} PLN / szt.</div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button type="button" onclick="zmienIlosc(${index}, -1)" style="width:28px; height:28px; border-radius:4px; border:1px solid rgba(255,255,255,0.6); cursor:pointer; background:transparent; color:#fff; font-weight:bold;">-</button>
                        <span style="min-width: 45px; text-align: center; color: #fff; font-weight: bold;">${item.quantity} szt.</span>
                        <button type="button" onclick="zmienIlosc(${index}, 1)" style="width:28px; height:28px; border-radius:4px; border:1px solid rgba(255,255,255,0.6); cursor:pointer; background:transparent; color:#fff; font-weight:bold;">+</button>
                    </div>
                    <div style="font-weight: bold; min-width: 75px; text-align: right; color: #fff;">${itemSum} PLN</div>
                    <button type="button" onclick="removeFromCart(${index})" style="color:var(--accent-color); font-size:1.2rem; background:none; border:none; cursor:pointer;" title="Usuń produkt">✖</button>
                </div>
            `;
            orderItemsList.appendChild(liCheckout);
        }
    });
    
    cartCount.innerText = `(${totalQuantity})`; cartTotal.innerText = total;
    if (orderTotalSpan) orderTotalSpan.innerText = `${total} PLN`;
    if (hiddenCartInput) hiddenCartInput.value = cart.map(item => `${item.name} x${item.quantity} (${item.price * item.quantity} PLN)`).join(', ');
}

function zmienIlosc(index, oIle) {
    cart[index].quantity += oIle;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(); updateCart(); 
}

function removeFromCart(index) {
    cart.splice(index, 1); saveCart(); updateCart(); showToast('Usunięto z koszyka');
}

function addAddon(name, price) { addToCart(name, price); }

function goToCheckout() {
    if (cart.length === 0) { showToast("Twój koszyk jest pusty!"); return; }
    switchTab(null, 'zamowienie'); window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('cart-sidebar').classList.add('hidden');
}

// --- LOGIKA MODALA BAZUJĄCA NA TYPIE PRODUKTU ---
function openProductModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    const modal = document.getElementById('product-modal');
    modal.classList.remove('is-gallery');

    document.getElementById('modal-img').src = currentProduct.image;
    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-desc').innerText = currentProduct.description;
    
    const methodSize = document.getElementById('method-size');
    const methodQty = document.getElementById('method-qty');
    const variantContainer = document.getElementById('modal-variants');

    // Obsługa produktów o stałych rozmiarach
    if (currentProduct.type === 'size') {
        methodSize.classList.remove('hidden');
        methodQty.classList.add('hidden');
        variantContainer.innerHTML = ''; // Czyścimy stare warianty

        const variantKeys = Object.keys(currentProduct.variants);
        
        variantKeys.forEach((vName, index) => {
            const btn = document.createElement('button');
            btn.className = 'variant-btn';
            btn.type = 'button';
            btn.innerText = vName;
            
            // Domyślnie zaznacz 'Średni' lub środkowy element, jeśli nie ma 'Średniego'
            if (vName === 'Średni' || index === Math.floor(variantKeys.length / 2)) {
                btn.classList.add('active');
                document.getElementById('modal-price').innerText = `${currentProduct.variants[vName]} PLN`;
                setupAddToCartBtn(`${currentProduct.name} (${vName})`, currentProduct.variants[vName]);
            }

            btn.onclick = function() {
                variantContainer.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const price = currentProduct.variants[vName];
                document.getElementById('modal-price').innerText = `${price} PLN`;
                setupAddToCartBtn(`${currentProduct.name} (${vName})`, price);
            };
            
            variantContainer.appendChild(btn);
        });

        // Jeżeli żaden przycisk nie został domyślnie zaznaczony (np. zła nazwa), klikamy pierwszy lepszy
        if(!variantContainer.querySelector('.active') && variantContainer.firstChild) {
            variantContainer.firstChild.click();
        }
    } 
    // Obsługa produktów na sztuki
    else if (currentProduct.type === 'quantity') {
        methodQty.classList.remove('hidden');
        methodSize.classList.add('hidden');
        
        currentFlowerCount = currentProduct.defaultQty || 1;
        updateFlowerCount(0); // Odświeżenie wyświetlanej ceny i ilości
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

function updateFlowerCount(delta) {
    if (!currentProduct || currentProduct.type !== 'quantity') return;
    
    currentFlowerCount = Math.max(1, currentFlowerCount + delta); // minimum 1 sztuka
    document.getElementById('flower-count-display').innerText = `${currentFlowerCount} szt.`;

    const finalPrice = currentFlowerCount * currentProduct.pricePerItem;
    document.getElementById('modal-price').innerText = `${finalPrice} PLN`;

    setupAddToCartBtn(`${currentProduct.name} (${currentFlowerCount} szt.)`, finalPrice);
}

// Funkcja pomocnicza aktualizująca zachowanie przycisku "Dodaj do koszyka"
function setupAddToCartBtn(finalName, finalPrice) {
    document.getElementById('modal-add-btn').onclick = () => {
        addToCart(finalName, finalPrice);
        closeModal();
    };
}

function openGalleryModal(imgSrc, altText) {
    const modal = document.getElementById('product-modal');
    modal.classList.add('is-gallery');
    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-title').innerText = altText;
    document.getElementById('modal-desc').innerText = "Realizacja Kwiaciarni Stokrotka";
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

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