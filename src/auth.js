import { supabaseClient } from './storage.js';

const authScreen = document.getElementById('authScreen');
const appContent = document.getElementById('appContent');

export function showApp(initCallback) {
    if (authScreen) authScreen.classList.add('hidden');
    if (appContent) appContent.classList.remove('hidden');
    if (initCallback) initCallback();
}

export function showAuth() {
    if (authScreen) authScreen.classList.remove('hidden');
    if (appContent) appContent.classList.add('hidden');
}

export async function checkUser(initCallback) {
    if (!supabaseClient) {
        showApp(initCallback);
        return;
    }
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && !error) {
            showApp(initCallback);
        } else {
            showAuth();
        }
    } catch (e) {
        console.error("Auth check failed:", e);
        showAuth();
    }
}

export function setupAuthListener(initCallback) {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            showApp(initCallback);
        } else {
            showAuth();
        }
    });
}

export async function signIn(email, password) {
    if (!supabaseClient) return { error: { message: "Supabase not initialized." } };
    try {
        return await supabaseClient.auth.signInWithPassword({ email, password });
    } catch (err) {
        return { error: err };
    }
}

export async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
}
