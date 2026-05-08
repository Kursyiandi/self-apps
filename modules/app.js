import { state } from './store.js';
import { login, logout, initAuth } from './auth.js';

// 1. Tangkap Elemen HTML yang dibutuhkan
const areaLogin = document.getElementById('areaLogin');
const areaApp = document.getElementById('areaApp');
const infoUser = document.getElementById('infoUser');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');

// 2. Pasang Event Listener ke Tombol
btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', logout);

// 3. Jalankan Pemantau Autentikasi
initAuth(
    // A. Blok ini dijalankan jika USER BERHASIL LOGIN
    () => {
        areaLogin.style.display = 'none';
        areaApp.style.display = 'block';
        infoUser.innerText = `Halo, ${state.currentUser.user_metadata.full_name || 'Pengguna'}!`;
        
        console.log("Sesi aktif! Siap menarik data dari database...");
        // TODO: Nanti kita panggil fungsi fetchSemuaData() di sini
    },
    
    // B. Blok ini dijalankan jika USER BELUM LOGIN / LOGOUT
    () => {
        areaLogin.style.display = 'block';
        areaApp.style.display = 'none';
        infoUser.innerText = "";
    }
);