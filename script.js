// --- LOGIKA KOSZYKA ---
let cart = [];

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('hidden');
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCart();
    alert(`Dodano: ${name} do koszyka!`);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const li = document.createElement('li');
        li.innerHTML = `${item.name} - <b>${item.price} PLN</b> <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">✖</button>`;
        li.style.marginBottom = "10px";
        cartItems.appendChild(li);
    });

    cartCount.innerText = `(${cart.length})`;
    cartTotal.innerText = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function goToCheckout() {
    if (cart.length === 0) {
        alert("Twój koszyk jest pusty!");
        return;
    }
    
    toggleCart();
    
    // Przejście do sekcji finalizacji
    document.getElementById('zamowienie').classList.remove('hidden');
    document.getElementById('produkty').classList.add('hidden');
    document.getElementById('galeria').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Aktualizacja podsumowania w kasie
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    checkoutItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price;
        const li = document.createElement('li');
        li.innerText = `${item.name} - ${item.price} PLN`;
        checkoutItems.appendChild(li);
    });
    
    checkoutTotal.innerText = total;
}

function submitOrder(e) {
    e.preventDefault();
    alert("Dziękujemy za zamówienie! Skontaktujemy się wkrótce w celu jego potwierdzenia.");
    cart = [];
    updateCart();
    document.getElementById('zamowienie').classList.add('hidden');
    document.getElementById('produkty').classList.remove('hidden');
    document.getElementById('galeria').classList.remove('hidden');
}

// --- FILTROWANIE GALERII ---
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Usuń klasę active ze wszystkich przycisków
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Dodaj active do klikniętego
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});