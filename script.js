const CART_KEY = 'stokrotka_final_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// --- 1. FUNKCJE KOSZYKA ---
window.addToCartDirect = function(name, price, image) { // Dodano brakującą klamrę {
    const cleanName = name.trim();
    
    // Szukamy, czy produkt już jest (ujednolicamy wielkość liter do porównania)
    const existingItem = cart.find(item => 
        item.nazwa.toLowerCase().trim() === cleanName.toLowerCase()
    );

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        // Poprawiono nazwę zmiennej na cleanName
        cart.push({ 
            nazwa: cleanName, 
            cena: parseFloat(price), 
            qty: 1,
            img: image || 'assets/default.jpg' 
        });
    }
    saveAndRefresh();
    const cartDiv = document.getElementById('cart');
    if (cartDiv) cartDiv.classList.add('active');
};

window.changeQty = function(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveAndRefresh();
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveAndRefresh();
};

function saveAndRefresh() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.innerText = totalItems;

    if (!cartItems) return;
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<li style="text-align:center; padding:20px;">Koszyk jest pusty</li>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = (item.cena * item.qty).toFixed(2);
            total += parseFloat(itemTotal);
            const li = document.createElement('li');
            li.className = "cart-item-block";
            li.innerHTML = `
                <div class="qty-control">
                    <button onclick="changeQty(${index}, -1)">−</button>
                    <span class="qty-value">${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
                
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.nazwa}</span>
                    <span class="cart-item-price-unit">${item.cena.toFixed(2)} PLN / szt.</span>
                </div>

                <div class="cart-item-total-row">
                    <span class="cart-item-total">${itemTotal} PLN</span>
                    <button class="cart-remove" onclick="removeFromCart(${index})">✕</button>
                </div>`;
            cartItems.appendChild(li);
        });
    }
    if (cartTotal) cartTotal.innerText = total.toFixed(2);
}

// --- PRZEJŚCIE DO KASY (PODSUMOWANIE) ---

window.goToCheckout = function() {
    if (cart.length === 0) {
        alert("Twój koszyk jest pusty!");
        return;
    }
    
    // 1. Sprawdzamy, czy na TEJ stronie jest sekcja zamówienia
    const orderSection = document.getElementById('zamowienie');

    if (orderSection) {
        // JEŚLI JESTEŚMY NA STRONIE GŁÓWNEJ:
        // (Robimy to co do tej pory - wypełniamy podsumowanie)
        let summaryHtml = "";
        let summaryText = "Zamówienie: ";
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.cena * item.qty;
            summaryHtml += `<li>${item.nazwa} x ${item.qty} - ${itemTotal.toFixed(2)} PLN</li>`;
            summaryText += `${item.nazwa} (x${item.qty}), `;
            total += itemTotal;
        });

        const previewList = document.getElementById('order-list-preview');
        const previewTotal = document.getElementById('order-total-preview');
        const hiddenInput = document.getElementById('hidden-cart-input');

        if (previewList) previewList.innerHTML = summaryHtml;
        if (previewTotal) previewTotal.innerText = total.toFixed(2);
        if (hiddenInput) hiddenInput.value = summaryText + " Łącznie: " + total.toFixed(2) + " PLN";

        openTab(null, 'zamowienie');
        const cartDiv = document.getElementById('cart');
        if (cartDiv) cartDiv.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // JEŚLI JESTEŚMY NA STRONIE PRODUKTU:
        // Przenosimy klienta na stronę główną z dopiskiem, że chcemy iść do kasy
        window.location.href = 'index.html#zamowienie';
    }
};

// --- 2. OBSŁUGA ZAKŁADEK ---
window.openTab = function(evt, tabName) {
    const contents = document.getElementsByClassName("tab-content");
    for (let content of contents) content.classList.remove("active-tab");
    
    const links = document.getElementsByClassName("tab-link");
    for (let link of links) link.classList.remove("active");
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add("active-tab");
    
    if (evt) {
        evt.currentTarget.classList.add("active");
    } else {
        const btn = document.querySelector(`button[onclick*="'${tabName}'"]`);
        if (btn) btn.classList.add("active");
    }
};

// --- 3. START STRONY ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const hash = window.location.hash.replace('#', '');
    if (hash) {
        openTab(null, hash);
        // DODAJ TO: Jeśli weszliśmy prosto do zamówienia, odśwież podsumowanie
        if (hash === 'zamowienie') {
            goToCheckout(); 
        }
    } else {
        openTab(null, 'sklep'); 
    }

    const cartBtn = document.getElementById('cart-button');
    const cartDiv = document.getElementById('cart');
    if (cartBtn && cartDiv) {
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cartDiv.classList.toggle('active');
        });
        window.addEventListener('click', () => cartDiv.classList.remove('active'));
        cartDiv.addEventListener('click', (e) => e.stopPropagation());
    }
});
let currentImgIndex = 0;
let allGalleryImages = [];

// Funkcja otwierania okna
window.openModal = function(imgElement) {
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("imgModal");
    const captionText = document.getElementById("caption");

    // Pobieramy wszystkie widoczne zdjęcia w galerii do nawigacji
    allGalleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    currentImgIndex = allGalleryImages.indexOf(imgElement);

    modal.style.display = "block";
    modalImg.src = imgElement.src;
    captionText.innerHTML = imgElement.getAttribute("data-description") || imgElement.alt;
};

// Zamykanie okna
window.closeModal = function() {
    document.getElementById("galleryModal").style.display = "none";
};

// Przewijanie zdjęć
window.changeImage = function(n) {
    currentImgIndex += n;

    if (currentImgIndex >= allGalleryImages.length) currentImgIndex = 0;
    if (currentImgIndex < 0) currentImgIndex = allGalleryImages.length - 1;

    const nextImg = allGalleryImages[currentImgIndex];
    document.getElementById("imgModal").src = nextImg.src;
    document.getElementById("caption").innerHTML = nextImg.getAttribute("data-description") || nextImg.alt;
};

// Filtrowanie sekcji
window.filterGallery = function(category) {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
};

// Zamknij po kliknięciu poza obrazkiem
window.onclick = function(event) {
    const modal = document.getElementById("galleryModal");
    if (event.target == modal) {
        closeModal();
    }
};
// --- AUTOMATYCZNY ROK W STOPCE ---
// Ten kod szuka miejsca z id "current-year" i wpisuje tam aktualny rok
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// --- POPRAWKA GALERII (Zabezpieczenie przed pustą ramką) ---
// Jeśli zamkniesz okno, czyścimy źródło obrazka, żeby przy kolejnym otwarciu nie "mignęło" stare zdjęcie
const originalCloseModal = window.closeModal;
window.closeModal = function() {
    originalCloseModal();
    const modalImg = document.getElementById("imgModal");
    if (modalImg) modalImg.src = ""; 
};