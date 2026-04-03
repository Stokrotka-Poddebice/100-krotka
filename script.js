// script.js

// --- 0. Pomocnicze funkcje ---
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function generateId() {
  return 'p_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1000);
}

// --- 1. ZARZĄDZANIE ZAKŁADKAMI ---
// Zachowujemy kompatybilność z wywołaniami inline openTab(evt, 'sklep')
function openTab(evt, tabName) {
  const contents = document.getElementsByClassName("tab-content");
  for (let content of contents) { content.classList.remove("active-tab"); }

  const links = document.getElementsByClassName("tab-link");
  for (let link of links) { link.classList.remove("active"); link.setAttribute('aria-selected', 'false'); }

  const target = document.getElementById(tabName);
  if (target) target.classList.add("active-tab");

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
    evt.currentTarget.setAttribute('aria-selected', 'true');
  } else {
    // prefer data-target attribute on buttons; fallback to onclick search
    const targetBtn = document.querySelector(`.tab-link[data-target="${tabName}"]`) ||
                      document.querySelector(`button[onclick*="'${tabName}'"]`);
    if (targetBtn) {
      targetBtn.classList.add("active");
      targetBtn.setAttribute('aria-selected', 'true');
    }
  }
}

// --- 2. LOGIKA KOSZYKA ---
// Model: { id, nazwa, cena, qty }
const STORAGE_KEY = 'stokrotkaCart_v1';
let cart = [];

// load
(function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) cart = parsed.map(item => ({
        id: item.id || generateId(),
        nazwa: item.nazwa || '',
        cena: safeNumber(item.cena, 0),
        qty: Math.max(1, safeNumber(item.qty, 1))
      }));
    }
  } catch (e) {
    cart = [];
  }
})();

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) { /* ignore */ }
}

function cartTotalAmount() {
  return cart.reduce((s, it) => s + it.cena * it.qty, 0);
}
function cartTotalItems() {
  return cart.reduce((s, it) => s + it.qty, 0);
}

// render UI (bez innerHTML dla elementów dynamicznych)
function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (!cartItems || !cartCount || !cartTotal) return;

  // count = suma sztuk
  cartCount.innerText = cartTotalItems();

  // wyczyść listę
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    const li = document.createElement('li');
    li.style.textAlign = 'center';
    li.style.padding = '10px';
    li.textContent = 'Pusty koszyk';
    cartItems.appendChild(li);
  } else {
    cart.forEach(item => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '6px 0';
      li.dataset.id = item.id;

      // lewa część (nazwa + cena za sztukę)
      const left = document.createElement('div');
      left.style.flex = '1';
      left.style.minWidth = '0';
      const nameDiv = document.createElement('div');
      nameDiv.textContent = item.nazwa;
      nameDiv.style.whiteSpace = 'nowrap';
      nameDiv.style.overflow = 'hidden';
      nameDiv.style.textOverflow = 'ellipsis';
      const pricePer = document.createElement('div');
      pricePer.style.fontSize = '0.9rem';
      pricePer.style.color = '#666';
      pricePer.textContent = `${item.cena.toFixed(2)} PLN / szt.`;
      left.appendChild(nameDiv);
      left.appendChild(pricePer);

      // prawa część (qty input + suma + remove)
      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '8px';

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = item.qty;
      qtyInput.className = 'qty-input';
      qtyInput.style.width = '64px';
      qtyInput.setAttribute('aria-label', `Ilość ${item.nazwa}`);
      qtyInput.addEventListener('change', (e) => {
        let q = safeNumber(e.target.value, 1);
        if (q < 1) q = 1;
        e.target.value = q;
        updateItemQty(item.id, q);
      });

      const sumDiv = document.createElement('div');
      sumDiv.style.minWidth = '90px';
      sumDiv.style.textAlign = 'right';
      sumDiv.textContent = `${(item.cena * item.qty).toFixed(2)} PLN`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.style.border = 'none';
      removeBtn.style.background = 'transparent';
      removeBtn.style.color = 'red';
      removeBtn.style.cursor = 'pointer';
      removeBtn.title = 'Usuń';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => {
        removeFromCartById(item.id);
      });

      right.appendChild(qtyInput);
      right.appendChild(sumDiv);
      right.appendChild(removeBtn);

      li.appendChild(left);
      li.appendChild(right);
      cartItems.appendChild(li);
    });
  }

  cartTotal.innerText = cartTotalAmount().toFixed(2);
  saveCart();

  // aktualizuj podsumowanie zamówienia jeśli istnieje
  const orderListPreview = document.getElementById('order-list-preview');
  const orderTotalPreview = document.getElementById('order-total-preview');
  const hiddenCartInput = document.getElementById('hidden-cart-input');
  if (orderListPreview && orderTotalPreview && hiddenCartInput) {
    if (cart.length === 0) {
      orderListPreview.textContent = 'Brak produktów w koszyku.';
    } else {
      orderListPreview.textContent = cart.map(i => `${i.nazwa} x${i.qty} — ${(i.cena * i.qty).toFixed(2)} PLN`).join('\n');
    }
    orderTotalPreview.textContent = cartTotalAmount().toFixed(2);
    hiddenCartInput.value = cart.map(i => `${i.nazwa} x${i.qty} — ${(i.cena * i.qty).toFixed(2)} PLN`).join('; ');
  }

  // pokaż/ukryj zakładkę zamówienia (jeśli istnieje)
  const tabHeader = document.getElementById('tab-header-zamowienie');
  if (tabHeader) tabHeader.style.display = cart.length ? 'block' : 'none';
}

// Dodaj do koszyka (używane przez index.html: addToCartDirect)
window.addToCartDirect = function(name, price) {
  const id = generateId();
  const p = safeNumber(price, 0);
  // jeśli produkt o tej samej nazwie istnieje, zwiększ qty (możesz zmienić logikę na porównanie id)
  const existing = cart.find(i => i.nazwa === name && i.cena === p);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, nazwa: name, cena: p, qty: 1 });
  }
  updateCartUI();
  const cartEl = document.getElementById('cart');
  if (cartEl) cartEl.classList.add('active');
};

// Usuwanie po id (bez polegania na indeksach)
function removeFromCartById(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}
window.removeFromCart = function(index) {
  // zachowujemy kompatybilność: jeśli wywołano removeFromCart(index) - usuń po indeksie
  if (typeof index === 'number') {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      updateCartUI();
    }
  }
};

// Aktualizacja ilości po id
function updateItemQty(id, qty) {
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, safeNumber(qty, 1));
  updateCartUI();
}

// --- 3. PRZEJŚCIE DO ZAMÓWIENIA ---
window.goToCheckout = function() {
  if (cart.length === 0) {
    alert("Koszyk jest pusty!");
    return;
  }

  let total = cartTotalAmount();
  const summaryHtml = document.createElement('ul');
  let summaryText = [];

  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.nazwa} - ${item.cena.toFixed(2)} PLN x${item.qty} = ${(item.cena * item.qty).toFixed(2)} PLN`;
    summaryHtml.appendChild(li);
    summaryText.push(`${item.nazwa} (${item.cena.toFixed(2)} PLN x${item.qty})`);
  });

  const orderListPreview = document.getElementById('order-list-preview');
  const orderTotalPreview = document.getElementById('order-total-preview');
  const hiddenCartInput = document.getElementById('hidden-cart-input');

  if (orderListPreview) {
    orderListPreview.innerHTML = '';
    orderListPreview.appendChild(summaryHtml);
  }
  if (orderTotalPreview) orderTotalPreview.innerText = total.toFixed(2);
  if (hiddenCartInput) hiddenCartInput.value = summaryText.join('; ') + ' Razem: ' + total.toFixed(2) + ' PLN';

  const tabHeader = document.getElementById('tab-header-zamowienie');
  if (tabHeader) tabHeader.style.display = 'block';
  openTab(null, 'zamowienie');

  const cartEl = document.getElementById('cart');
  if (cartEl) cartEl.classList.remove('active');
};

// --- 4. INICJALIZACJA UI ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const cartBtn = document.getElementById('cart-button');
  const cartDiv = document.getElementById('cart');

  if (cartBtn && cartDiv) {
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cartDiv.classList.toggle('active');
    });

    // kliknięcie poza koszyk zamyka go
    document.addEventListener('click', () => {
      if (cartDiv.classList.contains('active')) cartDiv.classList.remove('active');
    });

    cartDiv.addEventListener('click', (e) => e.stopPropagation());
  }

  // opcjonalnie: delegacja kliknięć na przyciski "Dodaj do koszyka" jeśli są bezpośrednio w DOM
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest && e.target.closest('.btn-add');
    if (!addBtn) return;
    const card = addBtn.closest('.product-card');
    if (!card) return;
    const name = card.dataset.name || (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Produkt';
    const price = safeNumber(card.dataset.price || (card.querySelector('.price') && card.querySelector('.price').textContent.replace(/[^\d,.-]/g, '').replace(',', '.')), 0);
    // dodajemy 1 sztukę
    const existing = cart.find(i => i.nazwa === name && i.cena === price);
    if (existing) existing.qty += 1;
    else cart.push({ id: generateId(), nazwa: name, cena: price, qty: 1 });
    updateCartUI();
    const cartEl = document.getElementById('cart');
    if (cartEl) cartEl.classList.add('active');
    // pokaż zakładkę zamówienia
    const tabHeader = document.getElementById('tab-header-zamowienie');
    if (tabHeader) tabHeader.style.display = 'block';
  });
});