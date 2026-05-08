import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast, formatWaktuDetail } from './helper.js';

export async function fetchPengeluaran() {
    const { data, error } = await supabase.from('pengeluaran_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error pengeluaran:", error);
    state.dataPengeluaranPribadi = data || [];
}

export async function simpanPengeluaran(nama, nominal, tgl) {
    if (!nama || !nominal) { showToast("Isi Nama & Harga dengan benar!", "error"); return false; }
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }

    const { data, error } = await supabase.from('pengeluaran_pribadi').insert([{
        user_id: state.currentUser.id, nama_item: nama, harga: Number(nominal), tanggal_db: tgl, jam_input: formatWaktuDetail()
    }]).select();

    if (error) { 
        showToast(`Gagal: ${error.message}`, "error"); return false;
    } else if (data && data.length > 0) {
        state.dataPengeluaranPribadi.unshift(data[0]);
        showToast("Pengeluaran dicatat!", "success");
        return true;
    }
}

export async function hapusPengeluaran(idItem) {
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }
    const { error } = await supabase.from('pengeluaran_pribadi').delete().eq('id', idItem);
    if (!error) { 
        state.dataPengeluaranPribadi = state.dataPengeluaranPribadi.filter(d => d.id != idItem);
        showToast("Data dihapus!", "success"); return true;
    }
    showToast("Gagal menghapus!", "error"); return false;
}