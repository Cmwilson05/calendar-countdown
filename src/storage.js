// Supabase configuration
const SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

export let supabaseClient = null;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Supabase failed to initialize:", e);
}

// State
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
    groupByCategory: true,
    searchQuery: '',
    menuTimeout: null
};

export function saveData() {
    if (!supabaseClient || !supabaseClient.auth.getSession()) {
        localStorage.setItem('countdown_events', JSON.stringify(state.events));
        localStorage.setItem('countdown_categories', JSON.stringify(state.categories));
    }
}

export function loadFallbackData() {
    const savedEvents = localStorage.getItem('countdown_events');
    const savedCats = localStorage.getItem('countdown_categories');
    
    if (savedEvents) {
        state.events = JSON.parse(savedEvents);
    } else {
        state.events = [
            { title: 'Trip', date: '2026-08-23', color: 'bg-green-500', icon: '✈️', category_id: null, starred: true },
            { title: 'Mom\'s Birthday', date: '2026-04-17', color: 'bg-pink-500', icon: '🎂', category_id: 1, starred: false },
            { title: 'Exam 1', date: '2026-02-23', color: 'bg-blue-500', icon: '✏️', category_id: null, starred: true }
        ];
    }

    if (savedCats) {
        state.categories = JSON.parse(savedCats);
    } else {
        state.categories = [
            { id: 1, name: 'Birthday', emoji: '🎂', color_default: 'bg-pink-500' }
        ];
    }
}
