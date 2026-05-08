import { state } from './store.js';
import { login, logout, initAuth } from './auth.js';
import { fetchCatatan } from './catatan.js';
import { fetchPengeluaran } from './pengeluaran.js';
import { fetchAkun } from './akun.js';
import { updateTanggalHeader, gantiTab, renderLayarUtama } from './ui.js';

// 1. Inisialisasi Tanggal Hari Ini
const inputTanggal = document.getElementById('inputTanggalPilih');
const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
inputTanggal.value = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
updateTanggalHeader(); 

// 2. Fungsi Utama: Menarik semua data setelah Login
async function initData() {
    console.log("Sedang menarik data dari Supabase...");
    await Promise.all([
        fetchCatatan(),
        fetchPengeluaran(),
        fetchAkun()
    ]);
    console.log("Data berhasil ditarik!");
    renderLayarUtama(); // Gambar data ke layar
}

// 3. Menjalankan Pemantau Sesi (Login/Logout)
initAuth(
    // JIKA LOGIN SUKSES
    () => {
        document.getElementById('areaLogin').style.display = 'none';
        document.getElementById('areaApp').style.display = 'block';
        document.getElementById('infoUser').innerText = `Halo, ${state.currentUser.user_metadata.full_name || 'Pengguna'}!`;
        
        // Mencegah tarik data berulang kali jika status berubah-ubah
        if (!state.dataSudahDitarikAwal) {
            state.dataSudahDitarikAwal = true; 
            setTimeout(() => { initData(); }, 150); // Jeda kecil untuk keamanan Supabase
        }
    },
    // JIKA LOGOUT
    () => {
        document.getElementById('areaLogin').style.display = 'block';
        document.getElementById('areaApp').style.display = 'none';
        document.getElementById('infoUser').innerText = "";
    }
);

// 4. Pasang Event Listener Tombol Utama
document.getElementById('btnLogin').addEventListener('click', login);
document.getElementById('btnLogout').addEventListener('click', logout);

// Event Listener Tab Menu
document.getElementById('btnMenuCatatan').addEventListener('click', () => gantiTab('catatan'));
document.getElementById('btnMenuPengeluaran').addEventListener('click', () => gantiTab('pengeluaran'));
document.getElementById('btnMenuAkun').addEventListener('click', () => gantiTab('akun'));

// Event Listener Tanggal & Pencarian
inputTanggal.addEventListener('change', () => { 
    updateTanggalHeader(); 
    renderLayarUtama(); 
});
document.getElementById('inputCariItem').addEventListener('input', () => {
    renderLayarUtama();
});