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
    hidePastEvents: localStorage.getItem('hidePastEvents') === 'true',
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
    localStorage.setItem('hidePastEvents', state.hidePastEvents);
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

// Export data as JSON file download
export function exportData() {
    const data = {
        events: state.events,
        categories: state.categories,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `countdown_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
export async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate structure
                if (!data.events || !Array.isArray(data.events)) {
                    throw new Error('Invalid backup file: missing events array');
                }
                if (!data.categories || !Array.isArray(data.categories)) {
                    throw new Error('Invalid backup file: missing categories array');
                }

                // Confirm replace
                const confirmed = confirm(
                    `This will replace your current data with:\n` +
                    `• ${data.events.length} events\n` +
                    `• ${data.categories.length} categories\n\n` +
                    `Continue?`
                );

                if (!confirmed) {
                    resolve(false);
                    return;
                }

                // Replace state
                state.events = data.events;
                state.categories = data.categories;

                // Save to localStorage
                localStorage.setItem('countdown_events', JSON.stringify(state.events));
                localStorage.setItem('countdown_categories', JSON.stringify(state.categories));

                // Sync to Supabase if logged in
                if (supabaseClient) {
                    try {
                        const { data: { session } } = await supabaseClient.auth.getSession();
                        if (session) {
                            // Delete existing data
                            await supabaseClient.from('countdown_events').delete().eq('user_id', session.user.id);
                            await supabaseClient.from('categories').delete().eq('user_id', session.user.id);

                            // Insert categories first and build ID mapping
                            const categoryIdMap = {};
                            if (state.categories.length > 0) {
                                const catsWithUser = state.categories.map(cat => ({
                                    name: cat.name,
                                    emoji: cat.emoji,
                                    user_id: session.user.id
                                }));
                                const { data: newCats } = await supabaseClient.from('categories').insert(catsWithUser).select();

                                if (newCats) {
                                    // Map old IDs to new IDs (by index since order is preserved)
                                    state.categories.forEach((oldCat, i) => {
                                        if (newCats[i]) {
                                            categoryIdMap[oldCat.id] = newCats[i].id;
                                        }
                                    });
                                    state.categories = newCats;
                                }
                            }

                            // Insert events with updated category_id references
                            if (state.events.length > 0) {
                                const eventsWithUser = state.events.map(ev => ({
                                    title: ev.title,
                                    date: ev.date,
                                    icon: ev.icon,
                                    category_id: ev.category_id ? categoryIdMap[ev.category_id] || null : null,
                                    notes: ev.notes,
                                    starred: ev.starred,
                                    multi_day: ev.multi_day,
                                    repeat: ev.repeat,
                                    display_units: ev.display_units,
                                    color: ev.color,
                                    user_id: session.user.id
                                }));
                                const { data: newEvents } = await supabaseClient.from('countdown_events').insert(eventsWithUser).select();

                                if (newEvents) {
                                    state.events = newEvents;
                                }
                            }

                            // Update localStorage with new IDs
                            localStorage.setItem('countdown_events', JSON.stringify(state.events));
                            localStorage.setItem('countdown_categories', JSON.stringify(state.categories));
                        }
                    } catch (err) {
                        console.error('Failed to sync imported data to Supabase:', err);
                    }
                }

                resolve(true);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
