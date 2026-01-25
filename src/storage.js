// Supabase configuration
// Prefer environment variables, fallback to hardcoded values for development
const FALLBACK_SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Warn if using fallback values
if (!import.meta.env?.VITE_SUPABASE_URL || !import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    console.warn(
        '[Calendar Countdown] Environment variables not found. Using fallback Supabase configuration.\n' +
        'For production, create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
}

export let supabaseClient = null;
export const state = {
    events: [],
    categories: [],
    currentView: 'timeline',
    selectedCategoryId: 'all',
    selectedIcon: '🎉',
    editingEventId: null,
    contextEventId: null,
    editingCategoryId: null,
    isReturningToEventModal: false,
    tempSelectedCategoryId: null,
    pickerContext: 'modal',
    sortOption: localStorage.getItem('sortOption') || 'date-asc',
    showNotes: localStorage.getItem('showNotes') === null ? true : localStorage.getItem('showNotes') === 'true',
    showDays: localStorage.getItem('showDays') === null ? true : localStorage.getItem('showDays') === 'true',
    showIcons: localStorage.getItem('showIcons') === null ? true : localStorage.getItem('showIcons') === 'true',
    showIntervals: localStorage.getItem('showIntervals') === 'true',
    groupByCategory: localStorage.getItem('groupByCategory') === 'true',
    screenshotMode: false,
    searchQuery: '',
    menuTimeout: null,
    isInitialized: false
};

// Attempt to initialize Supabase
export function initSupabase() {
    try {
        const lib = window.supabase;
        if (lib && !supabaseClient) {
            supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return true;
        }
    } catch (e) {
        console.error("Supabase init failed:", e);
    }
    return false;
}

initSupabase();

export async function saveData() {
    if (!state.isInitialized) return;

    let isSupabaseActive = false;
    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            isSupabaseActive = !!session;
        } catch (e) {
            isSupabaseActive = false;
        }
    }

    if (!isSupabaseActive) {
        localStorage.setItem('countdown_events', JSON.stringify(state.events));
        localStorage.setItem('countdown_categories', JSON.stringify(state.categories));
    }
    // Save all view options
    localStorage.setItem('sortOption', state.sortOption);
    localStorage.setItem('showNotes', state.showNotes);
    localStorage.setItem('showDays', state.showDays);
    localStorage.setItem('showIcons', state.showIcons);
    localStorage.setItem('showIntervals', state.showIntervals);
    localStorage.setItem('groupByCategory', state.groupByCategory);
}

export function loadFallbackData() {
    const savedEvents = localStorage.getItem('countdown_events');
    const savedCats = localStorage.getItem('countdown_categories');
    
    if (savedEvents && savedEvents !== "[]" && savedEvents !== "null") {
        try {
            state.events = JSON.parse(savedEvents);
        } catch (e) {
            console.error("Failed to parse events:", e);
        }
    } else {
        state.events = [
            { title: 'Trip', date: '2026-08-23', icon: '✈️', category_id: null, starred: true },
            { title: 'Mom\'s Birthday', date: '2026-04-17', icon: '🎂', category_id: 1, starred: false },
            { title: 'Exam 1', date: '2026-02-23', icon: '✏️', category_id: null, starred: true }
        ];
    }

    if (savedCats && savedCats !== "[]" && savedCats !== "null") {
        try {
            state.categories = JSON.parse(savedCats);
        } catch (e) {
            console.error("Failed to parse categories:", e);
        }
    } else {
        state.categories = [
            { id: 1, name: 'Birthday', emoji: '🎂' }
        ];
    }
    
    state.isInitialized = true;
}
