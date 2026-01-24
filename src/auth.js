import { supabaseClient } from './storage.js';

const authScreen = document.getElementById('authScreen');
const appContent = document.getElementById('appContent');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('email');
const authPassword = document.getElementById('password');
const authError = document.getElementById('authError');

export function showApp(initCallback) {
    authScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    if (initCallback) initCallback();
}

export function showAuth() {
    authScreen.classList.remove('hidden');
    appContent.classList.add('hidden');
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

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    if (!supabaseClient) return alert("Supabase not initialized.");
    
    const email = authEmail.value;
    const password = authPassword.value;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
    // onAuthStateChange will handle the UI transition
});
