import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast, formatWaktuDetail } from './helper.js';

export async function fetchCatatan() {
    const { data, error } = await supabase
        .from('catatan_pribadi')
        .select('*')
        .order('id', { ascending: false });

    if (error) return;
    state.dataCatatanPribadi = data || [];
}

export async function simpanCatatan(teks, tgl) {
    if (!teks) {
        showToast("Catatan tidak boleh kosong!", "error");
        return false;
    }
    if (!navigator.onLine) {
        showToast("Tidak ada koneksi internet!", "error");
        return false;
    }

    const { data, error } = await supabase
        .from('catatan_pribadi')
        .insert([{
            user_id: state.currentUser.id,
            isi: teks,
            tanggal_db: tgl,
            jam_input: formatWaktuDetail()
        }])
        .select();

    if (error) {
        showToast(`Gagal: ${error.message}`, "error");
        return false;
    }

    if (data && data.length > 0) {
        state.dataCatatanPribadi.unshift(data[0]);
        showToast("Catatan tersimpan!", "success");
        return true;
    }
    return false;
}

export async function hapusCatatan(idItem) {
    if (!navigator.onLine) {
        showToast("Tidak ada koneksi internet!", "error");
        return false;
    }

    const { error } = await supabase
        .from('catatan_pribadi')
        .delete()
        .eq('id', idItem);

    if (error) {
        showToast("Gagal menghapus!", "error");
        return false;
    }

    state.dataCatatanPribadi = state.dataCatatanPribadi.filter(d => d.id != idItem);
    showToast("Data dihapus!", "success");
    return true;
}

export async function updateCatatan(idItem, teksBaru) {
    if (!navigator.onLine) {
        showToast("Tidak ada koneksi internet!", "error");
        return false;
    }

    const jamBaru = formatWaktuDetail() + " (Edit)";
    const { error } = await supabase
        .from('catatan_pribadi')
        .update({ isi: teksBaru, jam_input: jamBaru })
        .eq('id', idItem);

    if (error) {
        showToast("Gagal menyimpan!", "error");
        return false;
    }

    const index = state.dataCatatanPribadi.findIndex(d => d.id == idItem);
    if (index !== -1) {
        state.dataCatatanPribadi[index].isi = teksBaru;
        state.dataCatatanPribadi[index].jam_input = jamBaru;
    }
    
    showToast("Perubahan disimpan!", "success");
    return true;
}
