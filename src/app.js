// Supabase configuration
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
let isReturningToEventModal = false;
let tempSelectedCategoryId = null;

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
const manageCategoriesModal = document.getElementById('manageCategoriesModal');
const addEventBtn = document.getElementById('addEvent');
const cancelEventBtn = document.getElementById('cancelEvent');
const saveEventBtn = document.getElementById('saveEvent');
const categoryFilterBar = document.getElementById('categoryFilterBar');
const eventTitleInput = document.getElementById('eventTitle');
const eventNotesInput = document.getElementById('eventNotes');
const eventDateInput = document.getElementById('eventDateInput');
const eventTagsInput = document.getElementById('eventTags');
const eventStarredInput = document.getElementById('eventStarred');
const eventUrlInput = document.getElementById('eventUrl');
const eventMultiDayInput = document.getElementById('eventMultiDay');
const modalCategoryTabs = document.getElementById('modalCategoryTabs');
const selectedIconDisplay = document.getElementById('selectedIconDisplay');
const currentEmojiDisplay = document.getElementById('currentEmoji');
const newCategoryEmojiBtn = document.getElementById('newCategoryEmoji');
const newCategoryNameInput = document.getElementById('newCategoryName');
const saveNewCategoryBtn = document.getElementById('saveNewCategory');
const categoriesListEl = document.getElementById('categoriesList');

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
        // FIX: Added .select() to the update query so it returns data and doesn't trigger the warning
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
        } else {
            alert("WARNING: Event saved but server returned no data. Check your Supabase RLS 'SELECT' policies.");
        }
    }
});

// UI Rendering
function renderEvents(eventsToRender) {
    let filtered = eventsToRender;
    if (selectedCategoryId === 'upcoming') filtered = eventsToRender.filter(e => calculateDays(e.date) >= 0);
    else if (selectedCategoryId === 'starred') filtered = eventsToRender.filter(e => e.starred);
    else if (selectedCategoryId !== 'all') filtered = eventsToRender.filter(e => e.category_id == selectedCategoryId);

    gridView.innerHTML = filtered.map(event => {
        const days = calculateDays(event.date);
        const cat = categories.find(c => c.id == event.category_id);
        return `
            <div class="bg-blue-500 text-white p-6 rounded-3xl shadow-lg aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform" 
                 onclick="handleEventClick('${event.id || event.tempId}')">
                <div class="flex justify-between items-start">
                    <div class="text-xl font-bold">${event.title}</div>
                    <div class="text-xl">${cat ? cat.emoji : ''}</div>
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex items-baseline gap-2">
                        <div class="text-3xl font-bold">${Math.abs(days)}</div>
                    </div>
                    <div class="text-sm opacity-80 uppercase tracking-wider">${days === 0 ? 'Today' : (days > 0 ? 'Days Until' : 'Days Since')}</div>
                </div>
            </div>
        `;
    }).join('');

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
                            const days = calculateDays(event.date);
                            const d = new Date(event.date);
                            return `
                                <div class="flex items-start gap-6 relative group cursor-pointer" onclick="handleEventClick('${event.id || event.tempId}')">
                                    <div class="w-16 text-right pt-1 flex-shrink-0">
                                        <div class="text-gray-400 font-bold text-xl leading-none mb-1">${d.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                                        <div class="text-gray-300 text-sm font-semibold">${d.getFullYear()}</div>
                                    </div>
                                    <div class="relative z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex-shrink-0">
                                        <span class="text-2xl">${event.icon || '📅'}</span>
                                    </div>
                                    <div class="flex-1 pt-1">
                                        <div class="font-bold text-2xl text-black leading-tight mb-0.5">${event.title}</div>
                                        <div class="text-gray-400 font-semibold text-xl">${days === 0 ? 'Today' : (days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`)}</div>
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

function renderCategoryFilterBar() {
    const smart = [{id:'upcoming', name:'Upcoming', emoji:'📅'}, {id:'starred', name:'Starred', emoji:'⭐'}, {id:'all', name:'All', emoji:'🌐'}];
    let html = smart.map(f => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId === f.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${f.id}">
            ${f.emoji} ${f.name}
        </button>
    `).join('');
    html += categories.map(cat => `
        <button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${selectedCategoryId == cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}" data-category-id="${cat.id}">
            ${cat.emoji} ${cat.name}
        </button>
    `).join('');
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
    let html = categories.map(cat => `
        <button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="${cat.id}">${cat.name}</button>
    `).join('');
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

// Helpers
function calculateDays(date) {
    const d = new Date(date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    return Math.ceil((d - now) / 86400000);
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

window.handleEventClick = (id) => {
    const ev = events.find(e => (e.id || e.tempId) == id);
    if (ev) openModal(ev);
};

function renderCategoriesList() {
    categoriesListEl.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between bg-[#2c2c2e] p-3 rounded-xl">
            <div class="flex items-center gap-3"><span>${cat.emoji}</span><span>${cat.name}</span></div>
            <button onclick="deleteCategory(${cat.id})" class="text-red-500 font-bold">Delete</button>
        </div>
    `).join('');
}

window.deleteCategory = async (id) => {
    if (!confirm('Delete category?')) return;
    if (supabaseClient) {
        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
        if (error) return alert(`Error deleting category: ${error.message}`);
    }
    categories = categories.filter(c => c.id != id);
    renderCategoriesList();
    renderCategoryFilterBar();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    const newCat = { name, emoji: newCategoryEmojiBtn.innerText, user_id: user?.id };
    if (supabaseClient) {
        const { data, error } = await supabaseClient.from('categories').insert([newCat]).select();
        if (data && data.length > 0) {
            categories.push(data[0]);
        } else if (error) {
            alert(`Error saving category: ${error.message}`);
        }
    }
    newCategoryNameInput.value = '';
    renderCategoriesList();
    renderCategoryFilterBar();
};
