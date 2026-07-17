import { supabase } from './supabase.js';
import { state } from './store.js';
import { showToast } from './helper.js';

export async function login() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) showToast("Gagal login: " + error.message, "error");
}

export async function logout() {
    await supabase.auth.signOut();
}

export function initAuth(onLoginSukses, onLogoutSukses) {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname);
                location.reload();
            }
        }

        if (session && session.user) {
            state.currentUser = session.user;
            
            if (window.location.hash.includes('access_token')) {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
            
            onLoginSukses();
        } else {
            state.currentUser = null;
            state.dataSudahDitarikAwal = false;
            onLogoutSukses();
        }
    });
}
