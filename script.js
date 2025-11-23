// FINAL script.js integrated with Firebase import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"; import { getFirestore, collection, getDocs, getDoc, query, orderBy, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase Config const firebaseConfig = { apiKey: "AIzaSyDKZlCOgSliF6doVyCF46inqrHf9C_9FhU", authDomain: "horror-b09d2.firebaseapp.com", projectId: "horror-b09d2", storageBucket: "horror-b09d2.appspot.com", messagingSenderId: "636634426334", appId: "1:636634426334:web:b8d5ad069be30ac7be8b4f", measurementId: "G-ZHF9H692FM" };

const app = initializeApp(firebaseConfig); const db = getFirestore(app);

/* ================= LOAD PRODUCT FIREBASE ================= */ let productData = [];

async function loadProductsFromFirestore(){ const q = query(collection(db,'produk'), orderBy('createdAt','desc')); const snap = await getDocs(q);

productData = []; for (const d of snap.docs){ const id = d.id; const prod = d.data();

const detailSnap = await getDoc(doc(db,'detail_produk', id));
const detail = detailSnap.exists() ? detailSnap.data() : {};

productData.push({ id, ...prod, detail });

}

renderProducts(productData); }

/* ================= RENDER PRODUCT GRID ================= */ function renderProducts(list){ const grid = document.getElementById('grid'); grid.innerHTML = "";

list.forEach(prod =>{ let statusBadge = "";

if (prod.status === "habis") {
  statusBadge = `<div class='badge soldout'>SOLD OUT</div>`;
} else if (prod.status === "menipis") {
  statusBadge = `<div class='badge low'>STOK MENIPIS</div>`;
} else if (prod.status === "release") {
  statusBadge = `<div class='badge release'>RELEASE ON<br>${prod.tanggal}</div>`;
} else if (prod.status === "resale") {
  statusBadge = `<div class='badge resale'>RESALE ON<br>${prod.tanggal}</div>`;
}

let whiten = prod.status === "habis" ? "filter:brightness(40%);" : "";

let div = document.createElement("div");
div.className = "product";
div.innerHTML = `
  <div class='product-img-wrapper'>${statusBadge}<img src='${prod.gambar}' style='${whiten}'></div>
  <h4>${prod.nama}</h4>
  <p>Rp ${Number(prod.harga).toLocaleString('id-ID')}</p>
`;

div.addEventListener('click', ()=> openDetail(prod));
grid.appendChild(div);

}); }

/* ================= FILTER ================= */ window.filterCategory = function(cat){ if(cat === 'all') renderProducts(productData); else renderProducts(productData.filter(p => p.kategori === cat)); }

/* ================= SORT ================= */ window.sortProducts = function(type){ let sorted = [...productData]; if(type === 'termurah') sorted.sort((a,b)=> a.harga - b.harga); if(type === 'termahal') sorted.sort((a,b)=> b.harga - a.harga); renderProducts(sorted); }

/* ================= DETAIL PRODUK ================= */ function openDetail(prod){ const sheet = document.getElementById('sheet'); const overlay = document.getElementById('overlay'); const carousel = document.getElementById('carousel-produk');

carousel.innerHTML = ""; prod.detail.gambar.forEach(src =>{ let img = document.createElement("img"); img.src = src; carousel.appendChild(img); });

document.getElementById('detailNama').textContent = prod.nama; document.getElementById('detailHarga').textContent = Number(prod.harga).toLocaleString('id-ID');

// tombol beli const btn = document.querySelector('#sheet button'); if (prod.status === "habis" || prod.status === "release" || prod.status === "resale"){ btn.style.background = '#999'; btn.style.pointerEvents = 'none'; } else { btn.style.background = '#9d001c'; btn.style.pointerEvents = 'auto'; }

sheet.classList.add('show'); overlay.classList.add('show'); }

/* ================= CLOSE DETAIL ================= */ document.getElementById('close-btn').onclick = () =>{ sheet.classList.remove('show'); overlay.classList.remove('show'); }

document.getElementById('overlay').onclick = () =>{ sheet.classList.remove('show'); overlay.classList.remove('show'); }

/* ================= LOAD FIREBASE ================= */ loadProductsFromFirestore();
