// Supabase configuration
const SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

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
    sortOption: 'date-asc',
    showNotes: true,
    showDays: true,
    showIcons: true,
    groupByCategory: localStorage.getItem('groupByCategory') === null ? false : localStorage.getItem('groupByCategory') === 'true',
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
            console.log("✅ Supabase initialized");
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
    localStorage.setItem('groupByCategory', state.groupByCategory);
}

export function loadFallbackData() {
    const savedEvents = localStorage.getItem('countdown_events');
    const savedCats = localStorage.getItem('countdown_categories');
    
    // Using console.error to ensure visibility in all console filters
    console.error("--- DEBUG DATA LOAD ---");
    console.error("Raw Events in LocalStorage:", savedEvents);
    console.error("Raw Categories in LocalStorage:", savedCats);

    if (savedEvents && savedEvents !== "[]" && savedEvents !== "null") {
        try {
            state.events = JSON.parse(savedEvents);
            console.error("✅ Successfully parsed events");
        } catch (e) {
            console.error("❌ Failed to parse events:", e);
        }
    } else {
        console.error("⚠️ No events found in storage, using defaults");
        state.events = [
            { title: 'Trip', date: '2026-08-23', color: 'bg-green-500', icon: '✈️', category_id: null, starred: true },
            { title: 'Mom\'s Birthday', date: '2026-04-17', color: 'bg-pink-500', icon: '🎂', category_id: 1, starred: false },
            { title: 'Exam 1', date: '2026-02-23', color: 'bg-blue-500', icon: '✏️', category_id: null, starred: true }
        ];
    }

    if (savedCats && savedCats !== "[]" && savedCats !== "null") {
        try {
            state.categories = JSON.parse(savedCats);
            console.error("✅ Successfully parsed categories");
        } catch (e) {
            console.error("❌ Failed to parse categories:", e);
        }
    } else {
        console.error("⚠️ No categories found in storage, using defaults");
        state.categories = [
            { id: 1, name: 'Birthday', emoji: '🎂', color_default: 'bg-pink-500' }
        ];
    }
    
    state.isInitialized = true;
    console.error("--- END DEBUG ---");
}
