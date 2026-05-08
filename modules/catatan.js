import { supabase } from './supabase.js';
import { state } from './store.js';

export async function fetchCatatan() {
    const { data, error } = await supabase.from('catatan_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error catatan:", error);
    state.dataCatatanPribadi = data || [];
}