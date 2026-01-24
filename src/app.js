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
let groupByCategory = true; // NEW: Toggle state
let searchQuery = '';

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
const eventRepeatInput = document.getElementById('eventRepeat');
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
const toggleGroupingCheckbox = document.getElementById('toggleGrouping'); // NEW
const searchEventsBtn = document.getElementById('searchEvents');
const searchContainer = document.getElementById('searchContainer');
const mainSearchInput = document.getElementById('mainSearchInput');
const closeSearchBtn = document.getElementById('closeSearchBtn');

// Auth Logic
async function checkUser() {
    if (!supabaseClient) {
        showApp(); // Fallback to local mode
        return;
    }
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) showApp(); else showAuth();
    } catch (e) {
        console.error("Auth check failed:", e);
        showAuth();
    }
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
    if (!supabaseClient) return alert("Supabase not initialized.");
    const { error } = await supabaseClient.auth.signInWithPassword({ 
        email: authEmail.value, 
        password: authPassword.value 
    });
    if (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    if (supabaseClient) supabaseClient.auth.signOut();
    else showAuth();
});

// Persistence Helper
function saveData() {
    if (!supabaseClient || !supabaseClient.auth.getSession()) {
        localStorage.setItem('countdown_events', JSON.stringify(events));
        localStorage.setItem('countdown_categories', JSON.stringify(categories));
    }
}

function loadFallbackData() {
    const savedEvents = localStorage.getItem('countdown_events');
    const savedCats = localStorage.getItem('countdown_categories');
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    } else {
        events = [
            { title: 'Trip', date: '2026-08-23', color: 'bg-green-500', icon: '✈️', category_id: null, starred: true },
            { title: 'Mom\'s Birthday', date: '2026-04-17', color: 'bg-pink-500', icon: '🎂', category_id: 1, starred: false },
            { title: 'Exam 1', date: '2026-02-23', color: 'bg-blue-500', icon: '✏️', category_id: null, starred: true }
        ];
    }

    if (savedCats) {
        categories = JSON.parse(savedCats);
    } else {
        categories = [
            { id: 1, name: 'Birthday', emoji: '🎂', color_default: 'bg-pink-500' }
        ];
    }
}

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
            
            if (catRes.error) throw catRes.error;
            if (eventRes.error) throw eventRes.error;

            categories = catRes.data || [];
            events = eventRes.data || [];
        } catch (err) {
            console.error("Initialization error, using fallback:", err);
            loadFallbackData();
        }
    } else {
        loadFallbackData();
    }
    
    renderCategoryFilterBar();
    renderEvents(events);
}

// Event Handlers
saveEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    if (!title || !date) return alert('Title and Date required');

    const activeTab = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
    const categoryId = activeTab ? (activeTab.dataset.categoryId === 'none' ? null : activeTab.dataset.categoryId) : null;
    
    let userId = null;
    if (supabaseClient) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        userId = user?.id;
    }

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
        repeat: eventRepeatInput?.value || 'never',
        user_id: userId 
    };

    const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
    
    if (editingEventId) {
        const idx = events.findIndex(e => (e.id || e.tempId) == editingEventId);
        if (idx !== -1) events[idx] = { ...events[idx], ...eventData };
    } else {
        events.push({ ...eventData, tempId });
    }

    renderEvents(events);
    closeModal();
    saveData();

    if (supabaseClient) {
        const query = editingEventId && !String(editingEventId).startsWith('temp_')
            ? supabaseClient.from('countdown_events').update(eventData).eq('id', editingEventId).select()
            : supabaseClient.from('countdown_events').insert([eventData]).select();
        
        const { data, error } = await query;
        if (error) {
            console.error("Supabase Save Error:", error);
            init(); 
        } else if (data && data.length > 0) {
            const idx = events.findIndex(e => e.tempId === tempId || e.id === editingEventId);
            if (idx !== -1) events[idx] = data[0];
            renderEvents(events);
        }
    }
});

// UI Rendering
function renderEvents(eventsToRender) {
    let filtered = [...eventsToRender];

    if (selectedCategoryId === 'upcoming') filtered = filtered.filter(e => calculateDays(getEffectiveDate(e)) >= 0);
    else if (selectedCategoryId === 'starred') filtered = filtered.filter(e => e.starred);
    else if (selectedCategoryId !== 'all') filtered = filtered.filter(e => e.category_id == selectedCategoryId);

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(lowerQ) || 
            (e.notes && e.notes.toLowerCase().includes(lowerQ))
        );
    }

    filtered.sort((a, b) => {
        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);
        if (sortOption === 'date-asc') return dateA - dateB;
        if (sortOption === 'date-desc') return dateB - dateA;
        if (sortOption === 'alpha') return a.title.localeCompare(b.title);
        return 0;
    });

    gridView.innerHTML = filtered.map(event => {
        const effectiveDate = getEffectiveDate(event);
        const days = calculateDays(effectiveDate);
        const cat = categories.find(c => c.id == event.category_id);
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

    if (groupByCategory) {
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
                            ${catEvents.map(event => renderTimelineItem(event)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        if (filtered.length === 0) {
            timelineView.innerHTML = `<div class="text-center text-gray-400 py-10">No events found.</div>`;
        } else {
            timelineView.innerHTML = `
                <div class="relative px-4 pt-4">
                    <div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-gray-300"></div>
                    <div class="flex flex-col gap-10">
                        ${filtered.map(event => renderTimelineItem(event)).join('')}
                    </div>
                </div>
            `;
        }
    }
}

function renderTimelineItem(event) {
    const effectiveDate = getEffectiveDate(event);
    const days = calculateDays(effectiveDate);
    const cat = categories.find(c => c.id == event.category_id);
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
}

function getEffectiveDate(event) {
    if (!event.date) return new Date();
    let target = new Date(event.date + 'T00:00:00');
    if (!event.repeat || event.repeat === 'never') return target;
    const now = new Date(); now.setHours(0,0,0,0);
    if (target >= now) return target;
    while (target < now) {
        if (event.repeat === 'daily') target.setDate(target.getDate() + 1);
        else if (event.repeat === 'weekly') target.setDate(target.getDate() + 7);
        else if (event.repeat === 'monthly') target.setMonth(target.getMonth() + 1);
        else if (event.repeat === 'yearly') target.setFullYear(target.getFullYear() + 1);
        else break;
    }
    return target;
}

function calculateDays(dateObjOrString) {
    const target = dateObjOrString instanceof Date ? dateObjOrString : new Date(dateObjOrString + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = target - now;
    return Math.ceil(diff / 86400000);
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
        eventRepeatInput.value = data.repeat || 'never';
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
        eventRepeatInput.value = 'never';
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

// Search
searchEventsBtn.addEventListener('click', () => {
    searchContainer.classList.remove('hidden');
    mainSearchInput.focus();
});

closeSearchBtn.addEventListener('click', () => {
    searchContainer.classList.add('hidden');
    mainSearchInput.value = '';
    searchQuery = '';
    renderEvents(events);
});

mainSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderEvents(events);
});

// Category Management
function renderCategoryFilterBar() {
    const smart = [{id:'upcoming', name:'Upcoming', emoji:'📅'}, {id:'starred', name:'Starred', emoji:'⭐'}, {id:'all', name:'All', emoji:'🌐'}];
    let html = smart.map(f => `<button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId === f.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${f.id}">${f.emoji} ${f.name}</button>`).join('');
    html += categories.map(cat => `<button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId == cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${cat.id}">${cat.emoji} ${cat.name}</button>`).join('');
    html += `<button id="manageCategoriesBtn" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">+ Edit</button>`;
    categoryFilterBar.innerHTML = html;

    categoryFilterBar.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            selectedCategoryId = tab.dataset.categoryId;
            const f = [...smart, ...categories].find(x => x.id == selectedCategoryId);
            viewTitle.innerText = f ? f.name : 'All';
            renderCategoryFilterBar();
            renderEvents(events);
        });
    });

    document.getElementById('manageCategoriesBtn').onclick = () => openManageCategories();
}

function renderModalCategoryTabs() {
    let html = categories.map(cat => `<button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="${cat.id}">${cat.name}</button>`).join('');
    html += `<button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="none">None</button>`;
    html += `<button id="modalManageCategoriesBtn" class="py-1.5 px-3 rounded-lg text-sm font-semibold bg-gray-700 text-white ml-2">⚙️</button>`;
    modalCategoryTabs.innerHTML = html;

    modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(tab => {
        tab.onclick = () => {
            modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(t => t.classList.remove('bg-blue-600'));
            tab.classList.add('bg-blue-600');
        };
    });

    document.getElementById('modalManageCategoriesBtn').onclick = (e) => {
        e.stopPropagation();
        const active = modalCategoryTabs.querySelector('.modal-category-tab.bg-blue-600');
        tempSelectedCategoryId = active ? active.dataset.categoryId : null;
        isReturningToEventModal = true;
        newEventModal.classList.add('hidden');
        openManageCategories();
    };
}

function openManageCategories() {
    modalOverlay.classList.remove('hidden');
    manageCategoriesModal.classList.remove('hidden');
    void manageCategoriesModal.offsetWidth;
    manageCategoriesModal.classList.remove('scale-95', 'opacity-0');
    renderCategoriesList();
}

document.getElementById('closeManageCategories').onclick = () => {
    manageCategoriesModal.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        manageCategoriesModal.classList.add('hidden');
        if (isReturningToEventModal) {
            newEventModal.classList.remove('hidden');
            renderModalCategoryTabs();
            if (tempSelectedCategoryId) {
                const tab = modalCategoryTabs.querySelector(`[data-category-id="${tempSelectedCategoryId}"]`);
                if (tab) tab.classList.add('bg-blue-600');
            }
            isReturningToEventModal = false;
        } else {
            modalOverlay.classList.add('hidden');
        }
    }, 200);
};

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
    saveData();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
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
        let userId = null;
        if (supabaseClient) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            userId = user?.id;
        }
        const newCat = { name, emoji, user_id: userId };
        if (supabaseClient) {
            const { data } = await supabaseClient.from('categories').insert([newCat]).select();
            if (data) categories.push(data[0]);
        } else {
            newCat.id = Date.now();
            categories.push(newCat);
        }
    }
    newCategoryNameInput.value = '';
    newCategoryEmojiBtn.innerText = '📁';
    renderCategoriesList();
    renderCategoryFilterBar();
    saveData();
};

// Context Menu
window.handleEventClick = function(eventId) {
    const e = window.event;
    if (e) { e.stopPropagation(); e.preventDefault(); }
    openContextMenu(e?.clientX || 0, e?.clientY || 0, eventId);
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
    setTimeout(() => contextMenu.classList.add('hidden'), 200);
}

window.addEventListener('mousedown', (e) => {
    if (!contextMenu.contains(e.target) && !emojiPicker.contains(e.target)) closeContextMenu();
});

menuEdit.onclick = () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) openModal(event);
    closeContextMenu();
};

menuDelete.onclick = async () => {
    if (!contextEventId || !confirm('Delete event?')) return;
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        const id = events[index].id;
        events.splice(index, 1);
        if (supabaseClient && id) await supabaseClient.from('countdown_events').delete().eq('id', id);
        renderEvents(events);
        saveData();
    }
    closeContextMenu();
};

menuStar.onclick = async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        events[index].starred = !events[index].starred;
        if (supabaseClient && events[index].id) await supabaseClient.from('countdown_events').update({ starred: events[index].starred }).eq('id', events[index].id);
        renderEvents(events);
        saveData();
    }
    closeContextMenu();
};

menuNotes.onclick = () => {
    const event = events.find(e => (e.id || e.tempId) == contextEventId);
    if (event) {
        newEventModal.classList.add('hidden');
        modalOverlay.classList.remove('hidden');
        quickNotesInput.value = event.notes || '';
        quickNotesModal.classList.remove('hidden');
        void quickNotesModal.offsetWidth;
        quickNotesModal.classList.remove('scale-95', 'opacity-0');
        setTimeout(() => quickNotesInput.focus(), 100);
    }
    closeContextMenu();
};

saveQuickNotesBtn.onclick = async () => {
    const index = events.findIndex(e => (e.id || e.tempId) == contextEventId);
    if (index !== -1) {
        const notes = quickNotesInput.value.trim();
        events[index].notes = notes;
        if (supabaseClient && events[index].id) await supabaseClient.from('countdown_events').update({ notes }).eq('id', events[index].id);
        renderEvents(events);
        saveData();
    }
    closeModal();
};

// Emoji Picker
function initEmojiPicker() {
    renderEmojis(COMMON_EMOJIS);
    menuUpdateIcon.onclick = (e) => {
        e.stopPropagation(); pickerContext = 'context';
        const rect = menuUpdateIcon.getBoundingClientRect();
        positionEmojiPicker(rect.left - 260, rect.top);
        emojiPicker.classList.toggle('hidden');
    };
    selectedIconDisplay.onclick = (e) => {
        e.stopPropagation(); pickerContext = 'modal';
        const rect = selectedIconDisplay.getBoundingClientRect();
        positionEmojiPicker(rect.right - 256, rect.top - 200);
        emojiPicker.classList.toggle('hidden');
    };
    newCategoryEmojiBtn.onclick = (e) => {
        e.stopPropagation(); pickerContext = 'category';
        const rect = newCategoryEmojiBtn.getBoundingClientRect();
        positionEmojiPicker(rect.left, rect.top - 250);
        emojiPicker.classList.toggle('hidden');
    };
    emojiSearch.oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderEmojis(q ? COMMON_EMOJIS.filter(em => em.char.includes(q) || em.keywords.includes(q)) : COMMON_EMOJIS);
    };
}

function positionEmojiPicker(x, y) {
    emojiPicker.style.left = `${Math.max(10, Math.min(x, window.innerWidth - 270))}px`;
    emojiPicker.style.top = `${Math.max(10, Math.min(y, window.innerHeight - 250))}px`;
}

function renderEmojis(arr) {
    const isSearch = emojiSearch.value.length > 0;
    if (isSearch) {
        emojiList.className = "grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = arr.map(em => `<button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl" data-emoji="${em.char}">${em.char}</button>`).join('');
    } else {
        const groups = {};
        arr.forEach(em => { if (!groups[em.category]) groups[em.category] = []; groups[em.category].push(em); });
        emojiList.className = "flex flex-col p-2 max-h-48 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = Object.entries(groups).map(([cat, ems]) => `
            <div class="mb-3">
                <h3 class="text-[10px] uppercase text-gray-400 font-bold mb-1.5 px-1">${cat}</h3>
                <div class="grid grid-cols-6 gap-1">
                    ${ems.map(em => `<button class="emoji-item w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl" data-emoji="${em.char}">${em.char}</button>`).join('')}
                </div>
            </div>
        `).join('');
    }
    document.querySelectorAll('.emoji-item').forEach(item => {
        item.onclick = async () => {
            const em = item.dataset.emoji;
            if (pickerContext === 'modal') { selectedIcon = em; currentEmojiDisplay.innerText = em; }
            else if (pickerContext === 'context' && contextEventId) {
                const idx = events.findIndex(e => (e.id || e.tempId) == contextEventId);
                if (idx !== -1) {
                    events[idx].icon = em;
                    if (supabaseClient && events[idx].id) await supabaseClient.from('countdown_events').update({ icon: em }).eq('id', events[idx].id);
                    renderEvents(events);
                }
            } else if (pickerContext === 'category') newCategoryEmojiBtn.innerText = em;
            emojiPicker.classList.add('hidden');
        };
    });
}

initEmojiPicker();
checkUser();
setupAuthListener();

// View Options
viewOptionsBtn.onclick = (e) => { e.stopPropagation(); viewOptionsMenu.classList.toggle('hidden'); viewOptionsMenu.classList.toggle('opacity-0'); };
document.querySelectorAll('.sort-option').forEach(btn => {
    btn.onclick = () => {
        sortOption = btn.dataset.sort;
        document.querySelectorAll('.sort-option .check').forEach(c => c.classList.add('hidden'));
        btn.querySelector('.check').classList.remove('hidden');
        renderEvents(events);
    };
});
toggleNotesCheckbox.onchange = (e) => { showNotes = e.target.checked; renderEvents(events); };
toggleDaysCheckbox.onchange = (e) => { showDays = e.target.checked; renderEvents(events); };
toggleGroupingCheckbox.onchange = (e) => { groupByCategory = e.target.checked; renderEvents(events); }; // NEW
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        emojiPicker.classList.add('hidden');
        viewOptionsMenu.classList.add('hidden');
        closeContextMenu();
        closeModal();
        searchContainer.classList.add('hidden');
    }
});
