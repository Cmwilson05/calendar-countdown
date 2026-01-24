// Supabase configuration
// 1. Verify these credentials in Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://qikfgxpbqjzmkjjcxgfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpa2ZneHBicWp6bWtqamN4Z2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDYzMjUsImV4cCI6MjA4NDQyMjMyNX0.DkvmYMIEfF1GEIyd7s7v1VL0o7Y2h7OIv4ShhgVrQ60';

let supabaseClient;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Supabase failed to initialize:", e);
}

// State
let events = [];
let categories = [];
let currentView = 'timeline'; 
let selectedCategoryId = 'all';
let selectedIcon = '🎉';
let editingEventId = null;
let contextEventId = null;
let editingCategoryId = null;
let isReturningToEventModal = false;
let tempSelectedCategoryId = null;
let pickerContext = 'modal';
let sortOption = 'date-asc';
let showNotes = true;
let showDays = true;
let searchQuery = ''; // NEW: Track search state

// Elements
const authScreen = document.getElementById('authScreen');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('email');
const authPassword = document.getElementById('password');
const authError = document.getElementById('authError');
const appContent = document.getElementById('appContent');
const logoutBtn = document.getElementById('logoutBtn');
const gridView = document.getElementById('gridView');
const timelineView = document.getElementById('timelineView');
const viewToggle = document.getElementById('viewToggle');
const viewIcon = document.getElementById('viewIcon');
const currentDateEl = document.getElementById('currentDate');
const viewTitle = document.getElementById('viewTitle');
const modalOverlay = document.getElementById('modalOverlay');
const newEventModal = document.getElementById('newEventModal');
const moreInfoModal = document.getElementById('moreInfoModal');
const quickNotesModal = document.getElementById('quickNotesModal');
const manageCategoriesModal = document.getElementById('manageCategoriesModal');
const addEventBtn = document.getElementById('addEvent');
const cancelEventBtn = document.getElementById('cancelEvent');
const saveEventBtn = document.getElementById('saveEvent');
const addMoreInfoBtn = document.getElementById('addMoreInfo');
const closeMoreInfoBtn = document.getElementById('closeMoreInfo');
const categoryFilterBar = document.getElementById('categoryFilterBar');
const eventTitleInput = document.getElementById('eventTitle');
const eventNotesInput = document.getElementById('eventNotes');
const eventDateInput = document.getElementById('eventDateInput');
const eventTagsInput = document.getElementById('eventTags');
const eventStarredInput = document.getElementById('eventStarred');
const eventUrlInput = document.getElementById('eventUrl');
const eventMultiDayInput = document.getElementById('eventMultiDay');
const eventRepeatInput = document.getElementById('eventRepeat'); // NEW
const modalCategoryTabs = document.getElementById('modalCategoryTabs');
const emojiPicker = document.getElementById('emojiPicker');
const selectedIconDisplay = document.getElementById('selectedIconDisplay');
const currentEmojiDisplay = document.getElementById('currentEmoji');
const emojiSearch = document.getElementById('emojiSearch');
const emojiList = document.getElementById('emojiList');
const newCategoryEmojiBtn = document.getElementById('newCategoryEmoji');
const newCategoryNameInput = document.getElementById('newCategoryName');
const saveNewCategoryBtn = document.getElementById('saveNewCategory');
const categoriesListEl = document.getElementById('categoriesList');
const contextMenu = document.getElementById('contextMenu');
const menuEdit = document.getElementById('menuEdit');
const menuDelete = document.getElementById('menuDelete');
const menuDuplicate = document.getElementById('menuDuplicate');
const menuNotes = document.getElementById('menuNotes');
const menuStar = document.getElementById('menuStar');
const starLabel = document.getElementById('starLabel');
const menuUpdateIcon = document.getElementById('menuUpdateIcon');
const quickNotesInput = document.getElementById('quickNotesInput');
const saveQuickNotesBtn = document.getElementById('saveQuickNotes');
const cancelQuickNotesBtn = document.getElementById('cancelQuickNotes');
const closeManageCategoriesBtn = document.getElementById('closeManageCategories');
const closeNewEventModalBtn = document.getElementById('closeNewEventModal');
const closeMoreInfoXBtn = document.getElementById('closeMoreInfoX');
const closeQuickNotesXBtn = document.getElementById('closeQuickNotesX');
const closeEmojiPickerBtn = document.getElementById('closeEmojiPicker');
const viewOptionsBtn = document.getElementById('viewOptionsBtn');
const viewOptionsMenu = document.getElementById('viewOptionsMenu');
const closeViewOptionsBtn = document.getElementById('closeViewOptions');
const toggleNotesCheckbox = document.getElementById('toggleNotes');
const toggleDaysCheckbox = document.getElementById('toggleDays');
const searchEventsBtn = document.getElementById('searchEvents'); // NEW
const searchContainer = document.getElementById('searchContainer'); // NEW
const mainSearchInput = document.getElementById('mainSearchInput'); // NEW
const closeSearchBtn = document.getElementById('closeSearchBtn'); // NEW

// Auth Logic
async function checkUser() {
    if (!supabaseClient) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) showApp(); else showAuth();
}

function setupAuthListener() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) showApp(); else showAuth();
    });
}

function showApp() {
    authScreen.classList.add('hidden');
    appContent.classList.remove('hidden');
    init();
}

function showAuth() {
    authScreen.classList.remove('hidden');
    appContent.classList.add('hidden');
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    const { error } = await supabaseClient.auth.signInWithPassword({ 
        email: authEmail.value, 
        password: authPassword.value 
    });
    if (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => supabaseClient.auth.signOut());

// Data Fetching
async function init() {
    if (currentDateEl) {
        const now = new Date();
        currentDateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
    }

    updateViewToggleUI();
    
    if (supabaseClient) {
        try {
            const [catRes, eventRes] = await Promise.all([
                supabaseClient.from('categories').select('*'),
                supabaseClient.from('countdown_events').select('*')
            ]);
            
            if (catRes.error) console.error("Categories fetch error:", catRes.error.message);
            if (eventRes.error) console.error("Events fetch error:", eventRes.error.message);

            categories = catRes.data || [];
            events = eventRes.data || [];
            
            renderCategoryFilterBar();
            renderEvents(events);
        } catch (err) {
            console.error("Initialization error:", err);
        }
    }
}

// Event Handlers
saveEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    if (!title || !date) return alert('Title and Date required');

    const activeTab = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
    const categoryId = activeTab ? (activeTab.dataset.categoryId === 'none' ? null : activeTab.dataset.categoryId) : null;
    
    const { data: { user } } = await supabaseClient.auth.getUser();

    const eventData = {
        title, 
        date, 
        icon: selectedIcon, 
        category_id: categoryId,
        notes: eventNotesInput.value.trim(),
        tags: eventTagsInput?.value || '',
        starred: eventStarredInput?.checked || false,
        url: eventUrlInput?.value || '',
        multi_day: eventMultiDayInput?.checked || false,
        repeat: eventRepeatInput?.value || 'never', // NEW
        user_id: user?.id 
    };

    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    
    // Optimistic UI update
    if (editingEventId) {
        const idx = events.findIndex(e => (e.id || e.tempId) == editingEventId);
        if (idx !== -1) events[idx] = { ...events[idx], ...eventData };
    } else {
        events.push({ ...eventData, tempId });
    }

    renderEvents(events);
    closeModal();

    if (supabaseClient) {
        const query = editingEventId && !String(editingEventId).startsWith('temp_')
            ? supabaseClient.from('countdown_events').update(eventData).eq('id', editingEventId).select()
            : supabaseClient.from('countdown_events').insert([eventData]).select();
        
        const { data, error } = await query;
        
        if (error) {
            console.error("Supabase Save Error:", error);
            alert(`DATABASE ERROR: ${error.message}\n\nPlease ensure the 'countdown_events' table has all required columns.`);
            init(); // Refresh to clear failed optimistic update
        } else if (data && data.length > 0) {
            const idx = events.findIndex(e => e.tempId === tempId || e.id === editingEventId);
            if (idx !== -1) events[idx] = data[0];
            renderEvents(events);
        }
    }
});

// UI Rendering
function renderEvents(eventsToRender) {
    let filtered = eventsToRender;

    // Filter by Category
    if (selectedCategoryId === 'upcoming') filtered = filtered.filter(e => calculateDays(getEffectiveDate(e)) >= 0);
    else if (selectedCategoryId === 'starred') filtered = filtered.filter(e => e.starred);
    else if (selectedCategoryId !== 'all') filtered = filtered.filter(e => e.category_id == selectedCategoryId);

    // NEW: Filter by Search Query
    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(lowerQ) || 
            (e.notes && e.notes.toLowerCase().includes(lowerQ))
        );
    }

    // Sorting (Using Effective Date for Repeatable Events)
    filtered.sort((a, b) => {
        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);
        
        if (sortOption === 'date-asc') return dateA - dateB;
        if (sortOption === 'date-desc') return dateB - dateA;
        if (sortOption === 'alpha') return a.title.localeCompare(b.title);
        return 0;
    });

    // Render Grid
    gridView.innerHTML = filtered.map(event => {
        const effectiveDate = getEffectiveDate(event);
        const days = calculateDays(effectiveDate);
        const cat = categories.find(c => c.id == event.category_id);
        
        // FIX: Prioritize Event Icon
        const displayIcon = event.icon || (cat ? cat.emoji : '📅');
        
        return `
            <div class="bg-blue-500 text-white p-6 rounded-3xl shadow-lg aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform" 
                 onclick="handleEventClick('${event.id || event.tempId}')">
                <div class="flex justify-between items-start">
                    <div class="text-xl font-bold line-clamp-2">${event.title}</div>
                    <div class="text-xl">${displayIcon}</div>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex items-baseline gap-2">
                        ${showDays ? `<div class="text-3xl font-bold">${Math.abs(days)}</div>` : ''}
                        ${showNotes && event.notes ? `<div class="text-xs opacity-70 line-clamp-2 italic">${event.notes}</div>` : ''}
                    </div>
                    ${showDays ? `<div class="text-sm opacity-80 uppercase tracking-wider">${days === 0 ? 'Today' : (days > 0 ? 'Days Until' : 'Days Since')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Render Timeline
    const grouped = filtered.reduce((acc, event) => {
        const catId = event.category_id || 'none';
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(event);
        return acc;
    }, {});

    timelineView.innerHTML = Object.entries(grouped).map(([catId, catEvents]) => {
        const cat = categories.find(c => c.id == catId);
        return `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-green-400 mb-6 px-4">${cat ? cat.name : 'Uncategorized'}</h2>
                <div class="relative px-4">
                    <div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-green-300"></div>
                    <div class="flex flex-col gap-10">
                        ${catEvents.map(event => {
                            const effectiveDate = getEffectiveDate(event);
                            const days = calculateDays(effectiveDate);
                            const displayIcon = event.icon || (cat ? cat.emoji : '📅');
                            
                            return `
                                <div class="flex items-start gap-6 relative group cursor-pointer" onclick="handleEventClick('${event.id || event.tempId}')">
                                    <div class="w-16 text-right pt-1 flex-shrink-0">
                                        <div class="text-gray-400 font-bold text-xl leading-none mb-1">${effectiveDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                                        <div class="text-gray-300 text-sm font-semibold">${effectiveDate.getFullYear()}</div>
                                    </div>
                                    <div class="relative z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex-shrink-0">
                                        <span class="text-2xl">${displayIcon}</span>
                                    </div>
                                    <div class="flex-1 pt-1">
                                        <div class="font-bold text-2xl text-black leading-tight mb-0.5">${event.title}</div>
                                        <div class="flex items-baseline gap-2">
                                            ${showDays ? `<div class="text-gray-400 font-semibold text-xl">${days === 0 ? 'Today' : (days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`)}</div>` : ''}
                                            ${showNotes && event.notes ? `<div class="text-sm text-gray-500 italic">${event.notes}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper: Calculate the *next* occurrence of a repeatable event
function getEffectiveDate(event) {
    let target = new Date(event.date + 'T00:00:00');
    if (!event.repeat || event.repeat === 'never') return target;

    const now = new Date();
    now.setHours(0,0,0,0);
    
    // If original date is in the future, don't shift it yet
    if (target >= now) return target;

    // Logic to shift date forward
    while (target < now) {
        if (event.repeat === 'daily') target.setDate(target.getDate() + 1);
        else if (event.repeat === 'weekly') target.setDate(target.getDate() + 7);
        else if (event.repeat === 'monthly') target.setMonth(target.getMonth() + 1);
        else if (event.repeat === 'yearly') target.setFullYear(target.getFullYear() + 1);
        else break; // Safety
    }
    return target;
}

// Helpers
function calculateDays(dateObjOrString) {
    const target = dateObjOrString instanceof Date ? dateObjOrString : new Date(dateObjOrString + 'T00:00:00');
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function updateViewToggleUI() {
    if (currentView === 'grid') {
        gridView.classList.remove('hidden'); timelineView.classList.add('hidden'); viewIcon.innerText = '⊞';
    } else {
        gridView.classList.add('hidden'); timelineView.classList.remove('hidden'); viewIcon.innerText = '⋮☰';
    }
}

viewToggle.onclick = () => {
    currentView = currentView === 'grid' ? 'timeline' : 'grid';
    updateViewToggleUI();
};

function openModal(data = null) {
    editingEventId = data ? (data.id || data.tempId) : null;
    modalOverlay.classList.remove('hidden');
    newEventModal.classList.remove('hidden');
    void newEventModal.offsetWidth;
    newEventModal.classList.remove('scale-95', 'opacity-0');
    renderModalCategoryTabs();
    
    if (data) {
        eventTitleInput.value = data.title;
        eventDateInput.value = data.date;
        eventNotesInput.value = data.notes || '';
        eventTagsInput.value = data.tags || '';
        eventStarredInput.checked = data.starred || false;
        eventUrlInput.value = data.url || '';
        eventMultiDayInput.checked = data.multi_day || false;
        eventRepeatInput.value = data.repeat || 'never'; // NEW
        selectedIcon = data.icon || '🎉';
        currentEmojiDisplay.innerText = selectedIcon;
        const tab = modalCategoryTabs.querySelector(`[data-category-id="${data.category_id || 'none'}"]`);
        if (tab) tab.classList.add('bg-blue-600');
    } else {
        eventTitleInput.value = '';
        eventDateInput.value = new Date().toISOString().split('T')[0];
        eventNotesInput.value = '';
        eventTagsInput.value = '';
        eventStarredInput.checked = false;
        eventUrlInput.value = '';
        eventMultiDayInput.checked = false;
        eventRepeatInput.value = 'never'; // NEW
        selectedIcon = '🎉';
        currentEmojiDisplay.innerText = '🎉';
        const tab = modalCategoryTabs.querySelector('[data-category-id="none"]');
        if (tab) tab.classList.add('bg-blue-600');
    }
}

function closeModal() {
    newEventModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        newEventModal.classList.add('hidden');
    }, 200);
}

addEventBtn.onclick = () => openModal();
cancelEventBtn.onclick = closeModal;

// Initial Load
checkUser();
setupAuthListener();

// NEW: Search Functionality
searchEventsBtn.addEventListener('click', () => {
    searchContainer.classList.remove('hidden');
    mainSearchInput.focus();
});

closeSearchBtn.addEventListener('click', () => {
    searchContainer.classList.add('hidden');
    mainSearchInput.value = '';
    searchQuery = '';
    renderEvents(events); // Reset view
});

mainSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderEvents(events);
});


// Context Menu Logic
window.handleEventClick = function(eventId) {
    const e = window.event;
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    const x = e?.clientX || 0;
    const y = e?.clientY || 0;
    openContextMenu(x, y, eventId);
};

function openContextMenu(x, y, eventId) {
    contextEventId = eventId;
    const event = events.find(e => (e.id || e.tempId) == eventId);
    if (!event) return;

    starLabel.innerText = event.starred ? 'Unstar' : 'Star';

    contextMenu.style.left = `${Math.min(x, window.innerWidth - 240)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 400)}px`;
    contextMenu.classList.remove('hidden');
    void contextMenu.offsetWidth;
    contextMenu.classList.remove('opacity-0');
}

function closeContextMenu() {
    contextMenu.classList.add('opacity-0');
    emojiPicker.classList.add('hidden');
    setTimeout(() => {
        contextMenu.classList.add('hidden');
    }, 200);
}

window.addEventListener('mousedown', (e) => {
    if (contextMenu.classList.contains('hidden') || contextMenu.classList.contains('opacity-0')) return;
    if (!contextMenu.contains(e.target) && !emojiPicker.contains(e.target)) {
        closeContextMenu();
    }
});

menuEdit.addEventListener('click', () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) openModal(event);
    closeContextMenu();
});

menuDelete.addEventListener('click', async () => {
    if (!contextEventId) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
        const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
        if (index !== -1) {
            const eventToDelete = events[index];
            events.splice(index, 1);
            
            if (supabaseClient && eventToDelete.id) {
                await supabaseClient.from('countdown_events').delete().eq('id', eventToDelete.id);
            }
            renderEvents(events);
        }
    }
    closeContextMenu();
});

menuDuplicate.addEventListener('click', async () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const duplicateData = { ...event, title: `${event.title} (Copy)`, user_id: user?.id };
        delete duplicateData.id; delete duplicateData.tempId;
        if (supabaseClient) {
            const { data } = await supabaseClient.from('countdown_events').insert([duplicateData]).select();
            if (data) events.push(data[0]);
        }
        renderEvents(events);
    }
    closeContextMenu();
});

menuNotes.addEventListener('click', () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) {
        newEventModal.classList.add('hidden');
        moreInfoModal.classList.add('hidden');
        manageCategoriesModal.classList.add('hidden');
        modalOverlay.classList.remove('hidden');
        quickNotesInput.value = event.notes || '';
        quickNotesModal.classList.remove('hidden');
        void quickNotesModal.offsetWidth;
        quickNotesModal.classList.remove('scale-95', 'opacity-0');
        setTimeout(() => quickNotesInput.focus(), 100);
    }
    closeContextMenu();
});

saveQuickNotesBtn.addEventListener('click', async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        const notes = quickNotesInput.value.trim();
        events[index].notes = notes;
        if (supabaseClient && events[index].id) await supabaseClient.from('countdown_events').update({ notes }).eq('id', events[index].id);
        renderEvents(events);
    }
    closeModal();
});

cancelQuickNotesBtn.addEventListener('click', closeModal);

menuStar.addEventListener('click', async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        events[index].starred = !events[index].starred;
        if (supabaseClient && events[index].id) await supabaseClient.from('countdown_events').update({ starred: events[index].starred }).eq('id', events[index].id);
        renderEvents(events);
    }
    closeContextMenu();
});

addMoreInfoBtn.addEventListener('click', () => {
    newEventModal.classList.add('hidden');
    moreInfoModal.classList.remove('hidden');
    void moreInfoModal.offsetWidth;
    moreInfoModal.classList.remove('scale-95', 'opacity-0');
});

closeMoreInfoBtn.addEventListener('click', () => {
    moreInfoModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        moreInfoModal.classList.add('hidden');
        newEventModal.classList.remove('hidden');
        void newEventModal.offsetWidth;
        newEventModal.classList.remove('scale-95', 'opacity-0');
    }, 200);
});

function renderCategoriesList() {
    categoriesListEl.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between bg-[#2c2c2e] p-3 rounded-xl">
            <div class="flex items-center gap-3"><span>${cat.emoji}</span><span>${cat.name}</span></div>
            <div class="flex gap-2">
                <button onclick="editCategory(${cat.id})" class="text-blue-500 font-bold text-sm">Edit</button>
                <button onclick="deleteCategory(${cat.id})" class="text-red-500 font-bold text-sm">Delete</button>
            </div>
        </div>
    `).join('');
}

window.editCategory = (id) => {
    const cat = categories.find(c => c.id == id);
    if (cat) {
        editingCategoryId = id;
        newCategoryNameInput.value = cat.name;
        newCategoryEmojiBtn.innerText = cat.emoji;
        saveNewCategoryBtn.innerText = 'Update';
        newCategoryNameInput.focus();
    }
};

window.deleteCategory = async (id) => {
    if (!confirm('Delete category?')) return;
    if (supabaseClient) await supabaseClient.from('categories').delete().eq('id', id);
    categories = categories.filter(c => c.id != id);
    renderCategoriesList();
    renderCategoryFilterBar();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    const emoji = newCategoryEmojiBtn.innerText;
    if (editingCategoryId) {
        const index = categories.findIndex(c => c.id == editingCategoryId);
        if (index !== -1) {
            categories[index] = { ...categories[index], name, emoji };
            if (supabaseClient) await supabaseClient.from('categories').update({ name, emoji }).eq('id', editingCategoryId);
        }
        editingCategoryId = null;
        saveNewCategoryBtn.innerText = 'Add';
    } else {
        const newCat = { name, emoji, user_id: user?.id };
        if (supabaseClient) {
            const { data } = await supabaseClient.from('categories').insert([newCat]).select();
            if (data) categories.push(data[0]);
        }
    }
    newCategoryNameInput.value = '';
    newCategoryEmojiBtn.innerText = '📁';
    renderCategoriesList();
    renderCategoryFilterBar();
};

// Emoji Picker Logic
function initEmojiPicker() {
    renderEmojis(COMMON_EMOJIS);
    menuUpdateIcon.addEventListener('click', (e) => {
        e.stopPropagation(); pickerContext = 'context';
        const rect = menuUpdateIcon.getBoundingClientRect();
        positionEmojiPicker(rect.left - 260, rect.top);
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) emojiSearch.focus();
    });
    selectedIconDisplay.addEventListener('click', (e) => {
        e.stopPropagation(); pickerContext = 'modal';
        const rect = selectedIconDisplay.getBoundingClientRect();
        positionEmojiPicker(rect.right - 256, rect.top - 200);
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) emojiSearch.focus();
    });
    newCategoryEmojiBtn.addEventListener('click', (e) => {
        e.stopPropagation(); pickerContext = 'category';
        const rect = newCategoryEmojiBtn.getBoundingClientRect();
        positionEmojiPicker(rect.left, rect.top - 250);
        emojiPicker.classList.toggle('hidden');
        if (!emojiPicker.classList.contains('hidden')) emojiSearch.focus();
    });
    emojiSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        renderEmojis(query ? COMMON_EMOJIS.filter(emoji => emoji.char.includes(query) || emoji.keywords.includes(query) || emoji.category.toLowerCase().includes(query)) : COMMON_EMOJIS);
    });
    document.addEventListener('mousedown', (e) => {
        if (!emojiPicker.classList.contains('hidden') && !emojiPicker.contains(e.target) && !selectedIconDisplay.contains(e.target) && !menuUpdateIcon.contains(e.target) && !newCategoryEmojiBtn.contains(e.target)) emojiPicker.classList.add('hidden');
    });
}

function positionEmojiPicker(x, y) {
    const maxX = window.innerWidth - 270; const maxY = window.innerHeight - 250;
    emojiPicker.style.left = `${Math.max(10, Math.min(x, maxX))}px`;
    emojiPicker.style.top = `${Math.max(10, Math.min(y, maxY))}px`;
}

function renderEmojis(emojiArray) {
    const isSearch = emojiSearch.value.length > 0;
    if (isSearch) {
        emojiList.className = "grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = emojiArray.map(emoji => `<button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl transition-colors" data-emoji="${emoji.char}">${emoji.char}</button>`).join('');
    } else {
        const groups = {};
        emojiArray.forEach(emoji => { if (!groups[emoji.category]) groups[emoji.category] = []; groups[emoji.category].push(emoji); });
        emojiList.className = "flex flex-col p-2 max-h-48 overflow-y-auto custom-scrollbar";
        let html = '';
        for (const category in groups) {
            html += `<div class="mb-3"><h3 class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 px-1">${category}</h3><div class="grid grid-cols-6 gap-1">${groups[category].map(emoji => `<button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl transition-colors" data-emoji="${emoji.char}">${emoji.char}</button>`).join('')}</div></div>`;
        }
        emojiList.innerHTML = html;
    }
    document.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', async () => {
            const emoji = item.dataset.emoji;
            if (pickerContext === 'modal') { selectedIcon = emoji; currentEmojiDisplay.innerText = emoji; }
            else if (pickerContext === 'context' && contextEventId) {
                const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
                if (index !== -1) {
                    events[index].icon = emoji;
                    if (supabaseClient && events[index].id) await supabaseClient.from('countdown_events').update({ icon: emoji }).eq('id', events[index].id);
                    renderEvents(events);
                }
                closeContextMenu();
            } else if (pickerContext === 'category') newCategoryEmojiBtn.innerText = emoji;
            emojiPicker.classList.add('hidden');
        });
    });
}

initEmojiPicker();
closeNewEventModalBtn.addEventListener('click', closeModal);
closeMoreInfoXBtn.addEventListener('click', () => {
    moreInfoModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { moreInfoModal.classList.add('hidden'); newEventModal.classList.remove('hidden'); void newEventModal.offsetWidth; newEventModal.classList.remove('scale-95', 'opacity-0'); }, 200);
});
closeQuickNotesXBtn.addEventListener('click', closeModal);
closeEmojiPickerBtn.addEventListener('click', () => emojiPicker.classList.add('hidden'));
viewOptionsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); viewOptionsMenu.classList.toggle('hidden');
    if (!viewOptionsMenu.classList.contains('hidden')) viewOptionsMenu.classList.remove('opacity-0'); else viewOptionsMenu.classList.add('opacity-0');
});
closeViewOptionsBtn.addEventListener('click', () => { viewOptionsMenu.classList.add('opacity-0'); setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200); });
document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
        sortOption = btn.dataset.sort;
        document.querySelectorAll('.sort-option .check').forEach(c => c.classList.add('hidden'));
        btn.querySelector('.check').classList.remove('hidden');
        document.querySelectorAll('.sort-option').forEach(b => { b.classList.remove('bg-blue-600', 'text-white'); b.classList.add('hover:bg-white/10', 'text-gray-300'); });
        btn.classList.remove('hover:bg-white/10', 'text-gray-300'); btn.classList.add('bg-blue-600', 'text-white');
        renderEvents(events);
    });
});
toggleNotesCheckbox.addEventListener('change', (e) => { showNotes = e.target.checked; renderEvents(events); });
toggleDaysCheckbox.addEventListener('change', (e) => { showDays = e.target.checked; renderEvents(events); });
document.addEventListener('click', (e) => { if (!viewOptionsMenu.classList.contains('hidden') && !viewOptionsMenu.contains(e.target) && !viewOptionsBtn.contains(e.target)) { viewOptionsMenu.classList.add('opacity-0'); setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200); } });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!emojiPicker.classList.contains('hidden')) emojiPicker.classList.add('hidden');
        else if (!viewOptionsMenu.classList.contains('hidden')) { viewOptionsMenu.classList.add('opacity-0'); setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200); }
        else if (!contextMenu.classList.contains('hidden') && !contextMenu.classList.contains('opacity-0')) closeContextMenu();
        else if (!manageCategoriesModal.classList.contains('hidden')) closeManageCategoriesBtn.click();
        else if (!quickNotesModal.classList.contains('hidden')) closeModal();
        else if (!moreInfoModal.classList.contains('hidden')) closeMoreInfoXBtn.click();
        else if (!newEventModal.classList.contains('hidden')) closeModal();
        else if (!searchContainer.classList.contains('hidden')) closeSearchBtn.click(); // NEW
    }
});
