const products = [
    { id: 1, name: "Bukiet Letnie Harmonie", image: "assets/bukiet1.webp", price: 210, description: "Eksplozja kolorów lata! Słoneczniki, eustoma i róże.", type: "size", variants: { "Mały": 168, "Średni": 210, "Duży": 260 }, category: ["Polecane", "bukiety"] },
    { id: 2, name: "Kompozycja Dziki Ogród", image: "assets/bukiet2.webp", price: 180, description: "Rustykalny bukiet z polnymi kwiatami i eukaliptusem.", type: "size", variants: { "Standard": 180, "Premium": 240 }, category: ["bukiety"] },
    { id: 3, name: "Roślina Leokasja", image: "assets/bukiet3.webp", price: 110, description: "Egzotyczna Alokazja w ceramicznej osłonce.", type: "size", variants: { "Mała": 85, "Standard": 110 }, category: ["doniczkowe"] },
    { id: 4, name: "Flowerbox Letnia Łąka", image: "assets/bukiet4.webp", price: 150, description: "Pastelowe pudełko pełne sezonowych kwiatów.", type: "size", variants: { "Średni": 150, "Duży": 200 }, category: ["flowerboxy"] },
    { id: 5, name: "Czerwone Róże", image: "assets/bukiet5.webp", price: 300, description: "Aksamitne róże premium. Wybierz własną ilość.", type: "quantity", pricePerItem: 20, defaultQty: 15, category: ["bukiety"] },
    { id: 6, name: "Bukiet Słoneczny", image: "assets/bukiet6.webp", price: 120, description: "Żółte róże i margerytki - czysty optymizm.", type: "size", variants: { "Mały": 90, "Średni": 120, "Duży": 180 }, category: ["bukiety"] },
    { id: 7, name: "Różowe Tulipany", image: "assets/bukiet7.webp", price: 150, description: "Wiosenne tulipany sprzedawane na sztuki.", type: "quantity", pricePerItem: 6, defaultQty: 25, category: ["bukiety"] },
    { id: 8, name: "Flowerbox Romantyczny Pastel", image: "assets/bukiet8_new.webp", price: 230, description: "Welurowe pudełko z jaskrami i różami premium.", type: "size", variants: { "Mały": 180, "Średni": 230, "Duży": 290 }, category: ["flowerboxy"] },
    { id: 9, name: "Monstera Deliciosa", image: "assets/bukiet9_new.webp", price: 120, description: "Kultowa roślina o wielkich liściach w betonowej osłonce.", type: "size", variants: { "Standard": 120, "Duża": 160 }, category: ["doniczkowe"] },
    { id: 10, name: "Bukiet Awangarda", image: "assets/bukiet10_new.webp", price: 220, description: "Artystyczna Protea z eukaliptusem i trawami.", type: "size", variants: { "Standard": 220, "Premium": 300 }, category: ["Polecane", "bukiety"] }
];

const galleryItems = [
    { src: "assets/img1.jpg", category: "slubne" }, { src: "assets/img2.jpg", category: "slubne" },
    { src: "assets/img3.jpg", category: "bukiety" }, { src: "assets/img4.jpg", category: "bukiety" },
    { src: "assets/img6.jpg", category: "flowerboxy" }, { src: "assets/img11.jpg", category: "samochody" }
];

let cart = JSON.parse(localStorage.getItem('stokrotka_cart')) || [];
let currentFlowerCount = 15;
let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
    updateCart(); displayProducts(); displayGallery(); setupGalleryFilters(); setupProductFilters(); startFomoTimer();
    document.querySelector('.product-filter-btn[data-filter="Polecane"]').click();
});

function displayProducts() {
    const cont = document.getElementById('products-container');
    if (!cont) return;
    cont.innerHTML = products.map(p => `
        <div class="card reveal ${Array.isArray(p.category) ? p.category.join(' ') : p.category}">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <h3>${p.name}</h3>
            <p class="price">od ${p.type === 'quantity' ? p.pricePerItem * p.defaultQty : p.price} PLN</p>
            <button class="btn" onclick="openProductModal(${p.id})">Zobacz szczegóły</button>
        </div>
    `).join('');
}

function displayGallery() {
    const cont = document.getElementById('gallery-container');
    if (!cont) return;
    cont.innerHTML = galleryItems.map(i => `<img src="${i.src}" class="gallery-item ${i.category} reveal" onclick="openGalleryModal(this.src)" loading="lazy">`).join('');
}

function setupProductFilters() {
    document.querySelectorAll('.product-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.product-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('#products-container .card').forEach(card => {
                card.style.display = (filter === 'all' || card.classList.contains(filter)) ? 'block' : 'none';
            });
        });
    });
}

function setupGalleryFilters() {
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('.gallery-item').forEach(img => {
                img.style.display = (filter === 'all' || img.classList.contains(filter)) ? 'block' : 'none';
            });
        });
    });
}

function updateCart() {
    const itemsList = document.getElementById('cart-items');
    const orderList = document.getElementById('order-items');
    let total = 0;
    itemsList.innerHTML = ''; if (orderList) orderList.innerHTML = '';

    cart.forEach((item, idx) => {
        const sum = item.price * item.quantity; total += sum;
        itemsList.innerHTML += `<li style="display:flex; justify-content:space-between; margin-bottom:10px;">${item.name} x${item.quantity}<span>${sum} PLN</span></li>`;
        if (orderList) orderList.innerHTML += `<li style="color:#fff; border-bottom:1px dashed rgba(255,255,255,0.3); padding:10px 0;">${item.name} x${item.quantity} <span style="font-weight:bold;">${sum} PLN</span></li>`;
    });
    document.getElementById('cart-total').innerText = total;
    if (document.getElementById('order-total')) document.getElementById('order-total').innerText = total + " PLN";
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.quantity++; else cart.push({ name, price, quantity: 1 });
    localStorage.setItem('stokrotka_cart', JSON.stringify(cart)); updateCart(); showToast(`Dodano: ${name}`);
}

function openProductModal(id) {
    currentProduct = products.find(p => p.id === id);
    const modal = document.getElementById('product-modal');
    modal.classList.remove('is-gallery', 'hidden');
    document.getElementById('modal-img').src = currentProduct.image;
    document.getElementById('modal-title').innerText = currentProduct.name;
    document.getElementById('modal-desc').innerText = currentProduct.description;

    const mSize = document.getElementById('method-size');
    const mQty = document.getElementById('method-qty');
    const vCont = document.getElementById('modal-variants');

    if (currentProduct.type === 'size') {
        mSize.classList.remove('hidden'); mQty.classList.add('hidden'); vCont.innerHTML = '';
        Object.keys(currentProduct.variants).forEach(v => {
            const b = document.createElement('button'); b.className = 'variant-btn'; b.innerText = v;
            b.onclick = () => {
                vCont.querySelectorAll('.variant-btn').forEach(x => x.classList.remove('active')); b.classList.add('active');
                document.getElementById('modal-price').innerText = currentProduct.variants[v] + " PLN";
                document.getElementById('modal-add-btn').onclick = () => { addToCart(`${currentProduct.name} (${v})`, currentProduct.variants[v]); closeModal(); };
            };
            vCont.appendChild(b);
        });
        vCont.firstChild.click();
    } else {
        mQty.classList.remove('hidden'); mSize.classList.add('hidden'); currentFlowerCount = currentProduct.defaultQty;
        updateFlowerCount(0);
    }
}

function updateFlowerCount(delta) {
    currentFlowerCount = Math.max(1, currentFlowerCount + delta);
    document.getElementById('flower-count-display').innerText = currentFlowerCount + " szt.";
    const p = currentFlowerCount * currentProduct.pricePerItem;
    document.getElementById('modal-price').innerText = p + " PLN";
    document.getElementById('modal-add-btn').onclick = () => { addToCart(`${currentProduct.name} (${currentFlowerCount} szt.)`, p); closeModal(); };
}

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('hidden'); }
function closeModal() { document.getElementById('product-modal').classList.add('hidden'); }
function showToast(m) { const t = document.createElement('div'); t.className = 'toast'; t.innerText = m; document.getElementById('toast-container').appendChild(t); setTimeout(() => t.remove(), 3000); }
function toggleDarkMode() { document.body.classList.toggle('dark-theme'); localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light'); }
function switchTab(e, id) { document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function startFomoTimer() { setInterval(() => { const d = new Date(); const t = document.getElementById('fomo-timer'); if(t) t.innerText = (23-d.getHours())+":"+(59-d.getMinutes())+":"+(59-d.getSeconds()); }, 1000); }
