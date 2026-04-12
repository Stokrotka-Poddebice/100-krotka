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
    // 1. Sprawdzamy, czy koszyk nie jest pusty
    if (cart.length === 0) {
        showToast("Twój koszyk jest pusty!");
        return;
    }

    // 2. Pokazujemy sekcję zamówienia (używamy Twojej funkcji showSection lub klas)
    // Jeśli showSection zajmuje się ukrywaniem reszty, to wystarczy:
    if (typeof showSection === "function") {
        showSection('zamowienie');
    } else {
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
            c.style.display = 'none';
        });
        const orderSec = document.getElementById('zamowienie');
        orderSec.classList.add('active');
        orderSec.style.display = 'block';
    }

    // 3. Pobieramy elementy podsumowania widocznego na stronie
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    // 4. Pobieramy ukryte pola dla Formspree
    const hiddenCartInput = document.getElementById('hidden-cart-data');
    const hiddenTotalInput = document.getElementById('hidden-total-data');

    // --- OBLICZENIA (Deklarujemy 'currentTotal' tylko raz!) ---
    let currentTotal = 0;
    checkoutItems.innerHTML = '';

    cart.forEach(item => {
        const itemSum = item.price * item.quantity;
        currentTotal += itemSum;

        // Tworzymy element listy do podsumowania na ekranie
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.marginBottom = '10px';
        li.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${itemSum} PLN</span>
        `;
        checkoutItems.appendChild(li);
    });

    // 5. Wpisujemy dane do widoku użytkownika
    if (checkoutTotal) checkoutTotal.innerText = `${currentTotal} PLN`;

    // 6. Przygotowujemy tekst dla Formspree (do ukrytych pól)
    const cartText = cart.map(item => `${item.name} x${item.quantity} (${item.price * item.quantity} PLN)`).join(', ');

    if (hiddenCartInput) hiddenCartInput.value = cartText;
    if (hiddenTotalInput) hiddenTotalInput.value = currentTotal + " PLN";

    // 7. Finalne szlify
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof closeCart === "function") closeCart(); // Zamyka boczny panel koszyka
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
function openGalleryModal(imgSrc, altText) {
    const modal = document.getElementById('product-modal');
    
    // Podmieniamy zawartość modala na potrzeby galerii
    document.getElementById('modal-img').src = imgSrc;
    document.getElementById('modal-title').innerText = altText;
    document.getElementById('modal-desc').innerText = "Realizacja Kwiaciarni Stokrotka";
    
    // Ukrywamy przycisk "Dodaj do koszyka" i cenę, bo to tylko podgląd zdjęcia
    document.getElementById('modal-add-btn').style.display = 'none';
    document.getElementById('modal-price').style.display = 'none';
    
    modal.classList.remove('hidden');
}

// Musimy też zmodyfikować funkcję closeModal, aby przywracała widoczność przycisków
const originalCloseModal = closeModal;
closeModal = function() {
    originalCloseModal();
    // Przywracamy widoczność dla zwykłych produktów po zamknięciu
    document.getElementById('modal-add-btn').style.display = 'block';
    document.getElementById('modal-price').style.display = 'block';
};
function switchTab(event, tabId) {
    // 1. Zapobiegamy przeładowaniu strony (jeśli to link lub button w form)
    if (event) event.preventDefault();

    // 2. Ukrywamy WSZYSTKIE sekcje (zakładki + zamówienie)
    // Zakładamy, że każda sekcja (oferta, galeria, kontakt, zamówienie) ma klasę .tab-content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // 3. Pokazujemy wybraną zakładkę
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }

    // 4. Aktualizujemy wygląd przycisków w menu GÓRNYM
    // Szukamy przycisku w nagłówku, który odpowiada wybranemu tabId
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        // Jeśli przycisk ma onclick z tym samym tabId, dajemy mu klasę active
        if (btn.getAttribute('onclick').includes(`'${tabId}'`)) {
            btn.classList.add('active');
        }
    });

    // 5. Płynne przewinięcie na samą górę strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleContactSubmit(event) {
    event.preventDefault(); // Zatrzymuje przeładowanie strony

    // Pobieramy dane (możesz je później wysłać np. przez EmailJS)
    const name = document.getElementById('contact-name').value;
    const subject = document.getElementById('contact-subject').value;

    // Wyświetlamy potwierdzenie (używając Twojego Toasta!)
    showToast(`Dziękujemy ${name}! Twoja wiadomość w sprawie "${subject}" została wysłana.`);

    // Czyścimy formularz
    event.target.reset();
}

function addAddon(name, price) {
    // Sprawdzamy, czy dodatek już jest w koszyku
    const existingAddon = cart.find(item => item.name === name);

    if (existingAddon) {
        existingAddon.quantity += 1;
    } else {
        // Dodajemy jako nowy przedmiot
        cart.push({ name, price, quantity: 1 });
    }

    saveCart();
    updateCart();
    
    // Specjalny efekt dla Toasta, żeby klient wiedział, że dodatek "wskoczył"
    showToast(`Dodano dodatek: ${name}`);
}

function startFomoTimer() {
    const timerElement = document.getElementById('fomo-timer');
    const fomoBar = document.getElementById('fomo-bar');
    const fomoText = document.querySelector('.fomo-text');

    if (!timerElement) return;

    function updateTimer() {
        const now = new Date();
        
        // Ustawiamy godzinę graniczną na 12:00 dzisiejszego dnia
        const deadline = new Date();
        deadline.setHours(12, 0, 0, 0);

        let diff = deadline - now;

        if (diff > 0) {
            // Obliczamy godziny, minuty i sekundy
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            // Formatowanie (dodawanie zera przed cyfrą)
            const hDisplay = hours.toString().padStart(2, '0');
            const mDisplay = minutes.toString().padStart(2, '0');
            const sDisplay = seconds.toString().padStart(2, '0');

            timerElement.innerText = `${hDisplay}:${mDisplay}:${sDisplay}`;
        } else {
            // Jeśli jest po 14:00, zmieniamy komunikat
            fomoText.innerHTML = "🌿 Zamów teraz, a Twoje kwiaty dostarczymy <b>już jutro rano!</b>";
            // Opcjonalnie: możesz ukryć pasek, odkomentowując linię poniżej
            fomoBar.classList.add('hidden'); 
        }
    }

    // Odświeżaj licznik co sekundę
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Uruchom funkcję po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    startFomoTimer();
});

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('dark-mode-toggle');
    
    // Przełączamy klasę
    body.classList.toggle('dark-theme');
    
    // Zmieniamy ikonkę w zależności od trybu
    if (body.classList.contains('dark-theme')) {
        btn.innerText = '☀️'; // Słońce, by wrócić do jasnego
        localStorage.setItem('theme', 'dark');
    } else {
        btn.innerText = '🌙'; // Księżyc, by przejść w ciemny
        localStorage.setItem('theme', 'light');
    }
}

// Sprawdzamy zapisany motyw przy starcie strony
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('dark-mode-toggle').innerText = '☀️';
    }
});