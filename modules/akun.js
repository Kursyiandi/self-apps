import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast, formatWaktuDetail, enkripsi } from './helper.js';

export async function fetchAkun() {
    const { data, error } = await supabase.from('akun_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error akun:", error);
    state.dataAkunPribadi = data || [];
}

export async function simpanAkun(platform, username, password, pinMaster) {
    if (!pinMaster) { showToast("PIN Master wajib diisi!", "error"); return false; }
    if (!platform || !username || !password) { showToast("Isi semua data!", "error"); return false; }
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }

    const pwdEnc = enkripsi(password, pinMaster);
    const { data, error } = await supabase.from('akun_pribadi').insert([{
        user_id: state.currentUser.id, platform: platform, username: username, password_enc: pwdEnc, jam_input: formatWaktuDetail()
    }]).select();

    if (error) { 
        showToast(`Gagal: ${error.message}`, "error"); return false;
    } else if (data && data.length > 0) {
        state.dataAkunPribadi.unshift(data[0]);
        showToast("Akun dikunci & disimpan!", "success");
        return true;
    }
}

export async function hapusAkun(idItem) {
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }
    const { error } = await supabase.from('akun_pribadi').delete().eq('id', idItem);
    if (!error) { 
        state.dataAkunPribadi = state.dataAkunPribadi.filter(d => d.id != idItem);
        showToast("Data dihapus!", "success"); return true;
    }
    showToast("Gagal menghapus!", "error"); return false;
}