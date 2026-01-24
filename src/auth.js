import { supabaseClient } from './storage.js';

const authScreen = document.getElementById('authScreen');
const appContent = document.getElementById('appContent');

export function showApp(initCallback) {
    console.log("Showing App Content");
    if (authScreen) authScreen.classList.add('hidden');
    if (appContent) appContent.classList.remove('hidden');
    if (initCallback) initCallback();
}

export function showAuth() {
    console.log("Showing Auth Screen");
    if (authScreen) authScreen.classList.remove('hidden');
    if (appContent) appContent.classList.add('hidden');
}

export async function checkUser(initCallback) {
    if (!supabaseClient) {
        console.log("No Supabase client, showing app (local mode)");
        showApp(initCallback);
        return;
    }
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && !error) {
            console.log("Session found, showing app");
            showApp(initCallback);
        } else {
            console.log("No session, showing auth");
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
        console.log("Auth state changed:", event);
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
        console.log("Attempting sign in for:", email);
        const result = await supabaseClient.auth.signInWithPassword({ email, password });
        console.log("Sign in result:", result);
        return result;
    } catch (err) {
        console.error("Sign in error:", err);
        return { error: err };
    }
}

export async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
}
