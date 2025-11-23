// admin.js (type=module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

// --- PASTE firebaseConfig kamu di sini ---
const firebaseConfig = {
  apiKey: "AIzaSyDKZlCOgSliF6doVyCF46inqrHf9C_9FhU",
  authDomain: "horror-b09d2.firebaseapp.com",
  projectId: "horror-b09d2",
  storageBucket: "horror-b09d2.appspot.com",
  messagingSenderId: "636634426334",
  appId: "1:636634426334:web:b8d5ad069be30ac7be8b4f",
  measurementId: "G-ZHF9H692FM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Simple login
const adminUser = document.getElementById('adminUser');
const adminPass = document.getElementById('adminPass');
const adminLogin = document.getElementById('adminLogin');
const panel = document.getElementById('panel');

adminLogin.onclick = () => {
  if(adminUser.value === 'owner' && adminPass.value === 'horror123'){
    document.getElementById('loginCard').style.display = 'none';
    panel.style.display = 'block';
    loadProductList();
  } else alert('Login gagal');
}

document.getElementById('logoutBtn').onclick = () => { panel.style.display='none'; document.getElementById('loginCard').style.display='block'; }

// Upload banners
async function uploadFile(file, path){
  const ref = sref(storage, path);
  const snap = await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);
  return url;
}

document.getElementById('uploadBanners').onclick = async ()=>{
  const b1 = document.getElementById('banner1').files[0];
  const b2 = document.getElementById('banner2').files[0];
  const b3 = document.getElementById('banner3').files[0];
  if(!b1 || !b2 || !b3) return alert('Pilih 3 gambar banner');
  const u1 = await uploadFile(b1, `banner/${Date.now()}-1`);
  const u2 = await uploadFile(b2, `banner/${Date.now()}-2`);
  const u3 = await uploadFile(b3, `banner/${Date.now()}-3`);
  // save to firestore
  await setDoc(doc(db, 'banner','banner1'), { order:1, url:u1 });
  await setDoc(doc(db, 'banner','banner2'), { order:2, url:u2 });
  await setDoc(doc(db, 'banner','banner3'), { order:3, url:u3 });
  alert('Banner tersimpan');
}

// Add product
document.getElementById('addProduct').onclick = async ()=>{
  const nama = document.getElementById('p_nama').value.trim();
  const harga = Number(document.getElementById('p_harga').value || 0);
  const kategori = document.getElementById('p_kategori').value.trim();
  const status = document.getElementById('p_status').value;
  const tanggal = document.getElementById('p_tanggal').value || '';
  const fileMain = document.getElementById('p_gambar').files[0];
  const files = Array.from(document.getElementById('p_imgs').files).slice(0,3);
  const stokS = Number(document.getElementById('stokS').value || 0);
  const stokM = Number(document.getElementById('stokM').value || 0);
  const stokL = Number(document.getElementById('stokL').value || 0);
  const stokXL = Number(document.getElementById('stokXL').value || 0);
  if(!nama || !fileMain) return alert('Nama dan gambar utama diperlukan');

  const id = 'p-'+Date.now();
  const mainUrl = await uploadFile(fileMain, `produk/${id}/main`);
  const imgs = [];
  for(let i=0;i<files.length;i++){
    const u = await uploadFile(files[i], `produk/${id}/img-${i}`);
    imgs.push(u);
  }
  // selalu tambahkan main ke imgs jika imgs kosong
  if(imgs.length === 0) imgs.push(mainUrl);

  const docRef = doc(db, 'produk', id);
  const detailRef = doc(db, 'detail_produk', id);

  await setDoc(docRef, {
    nama, harga, kategori, gambar: mainUrl, status, tanggal, createdAt: Date.now()
  });

  await setDoc(detailRef, {
    nama, harga, status, tanggal,
    gambar: imgs,
    stokUkuran: { S: stokS, M: stokM, L: stokL, XL: stokXL }
  });

  alert('Produk tersimpan');
  loadProductList();
}

// Load product list
async function loadProductList(){
  const list = document.getElementById('productList');
  list.innerHTML = 'Memuat...';
  const snap = await getDocs(collection(db,'produk'));
  list.innerHTML = '';
  snap.forEach(d => {
    const data = d.data();
    const el = document.createElement('div');
    el.style.padding='8px'; el.style.borderBottom='1px solid #222';
    el.innerHTML = `<strong>${data.nama}</strong> — Rp ${Number(data.harga).toLocaleString('id-ID')}<br><small>${data.kategori} • ${data.status}</small>`;
    list.appendChild(el);
  });
}
