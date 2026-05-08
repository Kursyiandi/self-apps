import { supabase } from './supabase.js';
import { state } from './store.js';

export async function fetchPengeluaran() {
    const { data, error } = await supabase.from('pengeluaran_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error pengeluaran:", error);
    state.dataPengeluaranPribadi = data || [];
}