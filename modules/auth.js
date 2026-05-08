import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast } from './helper.js';

// Fungsi untuk Login
export async function login() {
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            // Memastikan kembali ke halaman yang sama setelah login sukses
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) showToast("Gagal login: " + error.message, "error");
}

// Fungsi untuk Logout
export async function logout() {
    await supabase.auth.signOut();
}

// Fungsi pemantau status (Observer)
// Menerima dua parameter fungsi: apa yang harus dilakukan saat login, dan saat logout
export function initAuth(onLoginSukses, onLogoutSukses) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log("🛡️ Status Auth:", event);
        
        // Membersihkan URL jika ada token rahasia yang tertinggal
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname);
                location.reload(); 
            }
        }
        
        // Jika ada sesi aktif (User berhasil login)
        if (session && session.user) {
            state.currentUser = session.user; // Simpan data user ke store
            
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
            
            onLoginSukses(); // Jalankan perintah UI dari app.js
        } 
        // Jika belum login atau baru saja logout
        else {
            state.currentUser = null;
            state.dataSudahDitarikAwal = false; // Reset status data
            
            onLogoutSukses(); // Jalankan perintah UI dari app.js
        }
    });
}