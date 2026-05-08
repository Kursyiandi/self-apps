import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast } from './helper.js';

console.log("Aplikasi berhasil dimuat!");
console.log("Supabase Client:", supabase);
console.log("State Awal:", state);

// Contoh memanggil helper
setTimeout(() => {
    showToast("Modul berhasil disambungkan!", "success");
}, 1000);