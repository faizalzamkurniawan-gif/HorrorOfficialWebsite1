/* ==========================
   PAGE DETECTION
========================== */
const page = window.location.pathname;

/* ==========================
   HEADER + CART + LOGIN (UNTUK SEMUA HALAMAN)
========================== */
const header = document.getElementById('siteHeader');

if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

const cartIcon = document.getElementById("cartIcon");
const cartSidebar = document.getElementById("cartSidebar");

if (cartIcon && cartSidebar) {
  cartIcon.onclick = () => {
    cartSidebar.classList.add("show");
  };

  document.addEventListener("click", (e) => {
    if (cartSidebar.classList.contains("show")) {
      if (!cartSidebar.contains(e.target) && !e.target.closest("#cartIcon")) {
        cartSidebar.classList.remove("show");
      }
    }
  });
}

const btnUser = document.getElementById("btn-user");
const loginOverlay = document.getElementById("login-overlay");
const loginCard = document.getElementById("login-card");

if (btnUser && loginOverlay && loginCard) {
  btnUser.onclick = () => {
    loginOverlay.style.display = "block";
    loginCard.style.display = "flex";
    loginCard.style.transform = "translate(-50%,-50%) scale(1)";
  };

  loginOverlay.onclick = () => {
    loginOverlay.style.display = "none";
    loginCard.style.display = "none";
  };
}

/* ==========================
   INDEX PAGE (SLIDER)
========================== */
if (page.includes("index.html")) {

  const slides = document.querySelector('.slides');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  if (slides && prevBtn && nextBtn) {

    let activeSet = [];
    let index = 1;
    let autoSlide;

    function updateActiveSet() {
      activeSet = Array.from(document.querySelectorAll(
        window.innerWidth <= 768 ? '.mobile' : '.desktop'
      ));
      slides.style.transition = 'none';
      index = 1;
      slides.style.transform = `translateX(${-index * 100}%)`;
      resetAutoSlide();
    }

    function moveSlide(direction) {
      index += direction;
      slides.style.transition = 'transform 0.6s ease-in-out';
      slides.style.transform = `translateX(${-index * 100}%)`;
    }

    slides.addEventListener('transitionend', () => {
      const lastIndex = activeSet.length - 2;

      if (activeSet[index].classList.contains('clone-start')) {
        slides.style.transition = 'none';
        index = 1;
        slides.style.transform = `translateX(${-index * 100}%)`;
      }
      if (activeSet[index].classList.contains('clone-end')) {
        slides.style.transition = 'none';
        index = lastIndex;
        slides.style.transform = `translateX(${-index * 100}%)`;
      }
    });

    nextBtn.addEventListener('click', () => {
      moveSlide(1);
      resetAutoSlide();
    });
    prevBtn.addEventListener('click', () => {
      moveSlide(-1);
      resetAutoSlide();
    });

    // SWIPE HP
    let startX = 0;
    slides.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    slides.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        moveSlide(diff > 0 ? 1 : -1);
        resetAutoSlide();
      }
    });

    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(() => moveSlide(1), 5000);
    }

    window.addEventListener('resize', updateActiveSet);
    updateActiveSet();
  }
}

/* ==========================
   SHOP PAGE (PRODUCT LIST + DETAIL)
========================== */
if (page.includes("shop.html")) {

  // --- Firestore dynamic loader (letakkan di awal file shop.html script) ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDKZlCOgSliF6doVyCF46inqrHf9C_9FhU",
  authDomain: "horror-b09d2.firebaseapp.com",
  projectId: "horror-b09d2",
  storageBucket: "horror-b09d2.firebasestorage.app",
  messagingSenderId: "636634426334",
  appId: "1:636634426334:web:b8d5ad069be30ac7be8b4f",
  measurementId: "G-ZHF9H692FM"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let productData = [];
async function loadProductsFromFirestore(){
  const q = query(collection(db,'produk'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  productData = [];
  for(const docSnap of snap.docs){
    const id = docSnap.id;
    const data = docSnap.data();
    // fetch detail
    const dSnap = await getDoc(doc(db,'detail_produk', id));
    const detail = dSnap.exists() ? dSnap.data() : {};
    productData.push({ id, ...data, detail });
  }
  renderProducts(productData);
}

// call loadProductsFromFirestore() instead of renderProducts(productData) at end of shop init

  /* DOM */
  const grid = document.getElementById('grid');
  const sheet = document.getElementById('sheet');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('close-btn');
  const carousel = document.getElementById('carousel-produk');
  const detailNama = document.getElementById('detailNama');
  const detailHarga = document.getElementById('detailHarga');

  /* LIST PRODUK */
  function renderProducts(list){
    if (!grid) return;
    grid.innerHTML = "";
    list.forEach(prod => {
      let div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${prod.img}">
        <h4>${prod.nama}</h4>
        <p>Rp ${prod.harga.toLocaleString('id-ID')}</p>
      `;
      div.addEventListener('click', () => openDetail(prod));
      grid.appendChild(div);
    });
  }

  /* FILTER */
  window.filterCategory = function(cat){
    if(cat === 'all'){
      renderProducts(productData);
    } else {
      renderProducts(productData.filter(p => p.kategori === cat));
    }
  }

  /* SORT */
  window.sortProducts = function(type){
    let sorted = [...productData];
    if(type === 'termurah') sorted.sort((a,b)=>a.harga - b.harga);
    if(type === 'termahal') sorted.sort((a,b)=>b.harga - a.harga);
    renderProducts(sorted);
  }

  /* DETAIL PRODUK */
  function openDetail(prod){
    if (!sheet || !overlay || !carousel) return;

    carousel.innerHTML = "";
    prod.imgs.forEach(src => {
      let img = document.createElement("img");
      img.src = src;
      carousel.appendChild(img);
    });

    detailNama.textContent = prod.nama;
    detailHarga.textContent = prod.harga.toLocaleString('id-ID');

    sheet.classList.add('show');
    overlay.classList.add('show');
  }

  /* CLOSE DETAIL */
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      sheet.classList.remove('show');
      overlay.classList.remove('show');
    });
    overlay.addEventListener('click', () => {
      sheet.classList.remove('show');
      overlay.classList.remove('show');
    });
  }

  /* LOAD AWAL */
  renderProducts(productData);
}