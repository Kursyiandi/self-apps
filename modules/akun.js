import { supabase } from './supabase.js';
import { state } from './store.js';

export async function fetchAkun() {
    const { data, error } = await supabase.from('akun_pribadi').select('*').order('id', { ascending: false });
    if (error) console.error("Error akun:", error);
    state.dataAkunPribadi = data || [];
}