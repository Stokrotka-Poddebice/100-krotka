// --- LOGIKA KOSZYKA Z LOCAL STORAGE ---
// Pobieramy zapisany koszyk z pamięci przeglądarki, lub tworzymy pusty
let cart = JSON.parse(localStorage.getItem('stokrotka_cart')) || [];

// Inicjalizacja koszyka po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
});

// Funkcja zapisująca obecny stan koszyka do przeglądarki
function saveCart() {
    localStorage.setItem('stokrotka_cart', JSON.stringify(cart));
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('hidden');
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

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
    let total = 0;
    let totalQuantity = 0;

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
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "10px";

        li.innerHTML = `
            <div style="flex: 1;">
                ${item.name}<br>
                <small>${item.price * item.quantity} PLN</small>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="zmienIlosc(${index}, -1)" style="width:25px; cursor:pointer;">-</button>
        <span>${item.quantity}</span>
        <button onclick="zmienIlosc(${index}, 1)" style="width:25px; cursor:pointer;">+</button>
        <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">✖</button>
        </div>
`;
cartItems.appendChild(li);
    });

    cartCount.innerText = `(${totalQuantity})`; // Pokazuje sumę wszystkich kwiatów
    cartTotal.innerText = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
    showToast('Usunięto z koszyka');
}

function goToCheckout() {
    if (cart.length === 0) {
        showToast("Twój koszyk jest pusty!");
        return;
    }
    
    toggleCart();
    
    document.getElementById('zamowienie').classList.remove('hidden');
    document.getElementById('produkty').classList.add('hidden');
    document.getElementById('galeria').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    checkoutItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.innerText = `${item.name} - ${item.price} PLN`;
        checkoutItems.appendChild(li);
    });
    
    checkoutTotal.innerText = total;
}

function submitOrder(e) {
    e.preventDefault();
    showToast("Dziękujemy za zamówienie!");
    
    // Czyszczenie koszyka po zamówieniu
    cart = [];
    saveCart();
    updateCart();
    
    setTimeout(() => {
        document.getElementById('zamowienie').classList.add('hidden');
        document.getElementById('produkty').classList.remove('hidden');
        document.getElementById('galeria').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000); // Wracamy do głównej strony po 2 sekundach
}

// --- SYSTEM POWIADOMIEŃ (TOAST) ---
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) return; 
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Usuń element z kodu HTML po zakończeniu animacji CSS (3 sekundy)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- OKNO MODALNE (SZCZEGÓŁY PRODUKTU) ---
function openModal(name, price, imgSrc) {
    const modal = document.getElementById('product-modal');
    
    // Wstawianie danych do okienka
    document.getElementById('modal-title').innerText = name;
    document.getElementById('modal-price').innerText = `${price} PLN`;
    document.getElementById('modal-img').src = imgSrc;
    
    // Podpinanie akcji dodawania do koszyka pod przycisk
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => {
        addToCart(name, price);
        closeModal();
    };
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

// Zamknięcie modala po kliknięciu poza niego (w ciemne tło)
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target == modal) {
        closeModal();
    }
}

// --- FILTROWANIE GALERII ---
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        galleryItems.forEach(item => {
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
// --- ANIMACJA POJAWIANIA SIĘ ELEMENTÓW (SCROLL REVEAL) ---
const revealElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1 // Element musi być widoczny w 10%, by odpalić animację
    });

    // Wskazujemy, co chcemy animować
    const targets = document.querySelectorAll('.card, .gallery-item, h2, #kontakt p');
    targets.forEach(target => {
        target.classList.add('reveal'); // Dodajemy klasę ukrywającą na start
        observer.observe(target);
    });
};

// Uruchomienie po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    revealElements();
});

function zmienIlosc(index, oIle) {
    // Zmieniamy ilość produktu o podaną wartość (1 lub -1)
    cart[index].quantity += oIle;

    // Jeśli ilość spadnie do zera, usuwamy produkt całkiem
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();   // Zapisz zmianę w pamięci
    updateCart(); // Odśwież wygląd koszyka
}