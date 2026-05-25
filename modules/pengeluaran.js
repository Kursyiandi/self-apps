import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast, formatWaktuDetail } from './helper.js';

export async function fetchPengeluaran() {
    const { data, error } = await supabase.from('pengeluaran_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error pengeluaran:", error);
    state.dataPengeluaranPribadi = data || [];
}

export async function simpanPengeluaran(nama, nominal, kategori, tgl) {
    if (!nama || !nominal) { showToast("Isi Nama & Harga dengan benar!", "error"); return false; }
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }

    const { data, error } = await supabase.from('pengeluaran_pribadi').insert([{
        user_id: state.currentUser.id, 
        nama_item: nama, 
        harga: Number(nominal), 
        kategori: kategori, // <--- Sekarang sistem sudah tahu dari mana 'kategori' ini berasal
        tanggal_db: tgl, 
        jam_input: formatWaktuDetail()
    }]).select();
    
    // ... sisa kode di bawahnya biarkan saja

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

export async function updatePengeluaran(id, nama, nominal, kategori) {
    if (!nama || !nominal) { showToast("Isi Nama & Harga dengan benar!", "error"); return false; }
    if (!navigator.onLine) { showToast("Tidak ada koneksi internet!", "error"); return false; }

    const { data, error } = await supabase
        .from('pengeluaran_pribadi')
        .update({ nama_item: nama, harga: Number(nominal), kategori: kategori })
        .eq('id', id)
        .select();

    if (error) { showToast("Gagal mengupdate data!", "error"); return false; }
    
    // Update data di memori aplikasi (Store) agar UI langsung berubah
    const index = state.dataPengeluaranPribadi.findIndex(item => item.id === id);
    if (index !== -1) {
        state.dataPengeluaranPribadi[index].nama_item = nama;
        state.dataPengeluaranPribadi[index].harga = Number(nominal);
        state.dataPengeluaranPribadi[index].kategori = kategori;
    }
    
    showToast("Berhasil diperbarui!", "success");
    return true;
}