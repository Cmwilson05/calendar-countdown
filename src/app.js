import { supabaseClient, state, saveData, loadFallbackData } from './storage.js';
import { getEffectiveDate, calculateDays } from './utils.js';
import { checkUser, setupAuthListener, signIn, signOut } from './auth.js';
import { renderEvents, renderCategoryFilterBar, renderModalCategoryTabs, renderCategoriesList } from './render.js';
import { COMMON_EMOJIS } from './emojis.js';

// Elements
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
const toggleGroupingCheckbox = document.getElementById('toggleGrouping');
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const searchEventsBtn = document.getElementById('searchEvents');
const searchContainer = document.getElementById('searchContainer');
const mainSearchInput = document.getElementById('mainSearchInput');
const closeSearchBtn = document.getElementById('closeSearchBtn');
const loader = document.getElementById('loader');
const logoutBtn = document.getElementById('logoutBtn');

// Data Fetching
async function init() {
    if (currentDateEl) {
        const now = new Date();
        currentDateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
    }

    updateViewToggleUI();
    
    loader.classList.remove('hidden');
    categoryFilterBar.classList.add('hidden');
    gridView.innerHTML = '';
    timelineView.innerHTML = '';

    if (supabaseClient) {
        try {
            const [catRes, eventRes] = await Promise.all([
                supabaseClient.from('categories').select('*'),
                supabaseClient.from('countdown_events').select('*')
            ]);
            
            if (catRes.error) throw catRes.error;
            if (eventRes.error) throw eventRes.error;

            state.categories = catRes.data || [];
            state.events = eventRes.data || [];
        } catch (err) {
            console.error("Initialization error, using fallback:", err);
            loadFallbackData();
        }
    } else {
        loadFallbackData();
    }
    
    loader.classList.add('hidden');
    categoryFilterBar.classList.remove('hidden');
    renderCategoryFilterBar();
    renderEvents();
}

// Auth Listener
const authForm = document.getElementById('authForm');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authError = document.getElementById('authError');
        const authSubmit = document.getElementById('authSubmit');
        
        authError.classList.add('hidden');
        authSubmit.disabled = true;
        authSubmit.innerText = 'Signing In...';

        try {
            const { data, error } = await signIn(email, password);
            if (error) {
                authError.innerText = error.message;
                authError.classList.remove('hidden');
            }
        } catch (err) {
            authError.innerText = "An unexpected error occurred.";
            authError.classList.remove('hidden');
        } finally {
            authSubmit.disabled = false;
            authSubmit.innerText = 'Sign In';
        }
    });
}

if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await signOut();
    };
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
        icon: state.selectedIcon, 
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
    
    if (state.editingEventId) {
        const idx = state.events.findIndex(e => (e.id || e.tempId) == state.editingEventId);
        if (idx !== -1) state.events[idx] = { ...state.events[idx], ...eventData };
    } else {
        state.events.push({ ...eventData, tempId });
    }

    renderEvents();
    closeModal();
    saveData();

    if (supabaseClient) {
        const query = state.editingEventId && !String(state.editingEventId).startsWith('temp_')
            ? supabaseClient.from('countdown_events').update(eventData).eq('id', state.editingEventId).select()
            : supabaseClient.from('countdown_events').insert([eventData]).select();
        
        const { data, error } = await query;
        if (error) {
            console.error("Supabase Save Error:", error);
            init(); 
        } else if (data && data.length > 0) {
            const idx = state.events.findIndex(e => e.tempId === tempId || e.id === state.editingEventId);
            if (idx !== -1) state.events[idx] = data[0];
            renderEvents();
        }
    }
});

function updateViewToggleUI() {
    if (state.currentView === 'grid') {
        gridView.classList.remove('hidden'); timelineView.classList.add('hidden'); viewIcon.innerText = '⊞';
    } else {
        gridView.classList.add('hidden'); timelineView.classList.remove('hidden'); viewIcon.innerText = '⋮☰';
    }
}

viewToggle.onclick = () => {
    state.currentView = state.currentView === 'grid' ? 'timeline' : 'grid';
    updateViewToggleUI();
};

function openModal(data = null) {
    state.editingEventId = data ? (data.id || data.tempId) : null;
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
        state.selectedIcon = data.icon || '🎉';
        currentEmojiDisplay.innerText = state.selectedIcon;
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
        state.selectedIcon = '🎉';
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
    state.searchQuery = '';
    renderEvents();
});

mainSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderEvents();
});

// Category Management
categoryFilterBar.addEventListener('click', (e) => {
    if (e.target.closest('#manageCategoriesBtn')) {
        openManageCategories();
    }
});

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
        if (state.isReturningToEventModal) {
            newEventModal.classList.remove('hidden');
            renderModalCategoryTabs();
            if (state.tempSelectedCategoryId) {
                const tab = modalCategoryTabs.querySelector(`[data-category-id="${state.tempSelectedCategoryId}"]`);
                if (tab) tab.classList.add('bg-blue-600');
            }
            state.isReturningToEventModal = false;
        } else {
            modalOverlay.classList.add('hidden');
        }
    }, 200);
};

window.editCategory = (id) => {
    const cat = state.categories.find(c => c.id == id);
    if (cat) {
        state.editingCategoryId = id;
        newCategoryNameInput.value = cat.name;
        newCategoryEmojiBtn.innerText = cat.emoji;
        saveNewCategoryBtn.innerText = 'Update';
        newCategoryNameInput.focus();
    }
};

window.deleteCategory = async (id) => {
    if (!confirm('Delete category?')) return;
    if (supabaseClient) await supabaseClient.from('categories').delete().eq('id', id);
    state.categories = state.categories.filter(c => c.id != id);
    renderCategoriesList();
    renderCategoryFilterBar();
    saveData();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
    const emoji = newCategoryEmojiBtn.innerText;
    
    if (state.editingCategoryId) {
        const index = state.categories.findIndex(c => c.id == state.editingCategoryId);
        if (index !== -1) {
            state.categories[index] = { ...state.categories[index], name, emoji };
            if (supabaseClient) await supabaseClient.from('categories').update({ name, emoji }).eq('id', state.editingCategoryId);
        }
        state.editingCategoryId = null;
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
            if (data) state.categories.push(data[0]);
        } else {
            newCat.id = Date.now();
            state.categories.push(newCat);
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
    if (state.menuTimeout) clearTimeout(state.menuTimeout);
    state.contextEventId = eventId;
    const event = state.events.find(e => (e.id || e.tempId) == eventId);
    if (!event) return;
    starLabel.innerText = event.starred ? 'Unstar' : 'Star';
    contextMenu.style.left = `${Math.min(x, window.innerWidth - 240)}px`;
    contextMenu.style.top = `${Math.min(y, window.innerHeight - 400)}px`;
    contextMenu.classList.remove('hidden');
    void contextMenu.offsetWidth;
    contextMenu.classList.remove('opacity-0');
}

function closeContextMenu() {
    if (state.menuTimeout) clearTimeout(state.menuTimeout);
    contextMenu.classList.add('opacity-0');
    state.menuTimeout = setTimeout(() => {
        contextMenu.classList.add('hidden');
    }, 200);
}

window.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target) && !emojiPicker.contains(e.target)) closeContextMenu();
});

menuEdit.onclick = () => {
    const event = state.events.find(e => (e.id || e.tempId) == state.contextEventId);
    if (event) openModal(event);
    closeContextMenu();
};

menuDelete.onclick = async () => {
    if (!state.contextEventId || !confirm('Delete event?')) return;
    const index = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
    if (index !== -1) {
        const id = state.events[index].id;
        state.events.splice(index, 1);
        if (supabaseClient && id) await supabaseClient.from('countdown_events').delete().eq('id', id);
        renderEvents();
        saveData();
    }
    closeContextMenu();
};

menuStar.onclick = async () => {
    const index = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
    if (index !== -1) {
        state.events[index].starred = !state.events[index].starred;
        if (supabaseClient && state.events[index].id) await supabaseClient.from('countdown_events').update({ starred: state.events[index].starred }).eq('id', state.events[index].id);
        renderEvents();
        saveData();
    }
    closeContextMenu();
};

menuNotes.onclick = () => {
    const event = state.events.find(e => (e.id || e.tempId) == state.contextEventId);
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
    const index = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
    if (index !== -1) {
        const notes = quickNotesInput.value.trim();
        state.events[index].notes = notes;
        if (supabaseClient && state.events[index].id) await supabaseClient.from('countdown_events').update({ notes }).eq('id', state.events[index].id);
        renderEvents();
        saveData();
    }
    closeModal();
};

cancelQuickNotesBtn.addEventListener('click', closeModal);

// Emoji Picker
function initEmojiPicker() {
    renderEmojis(COMMON_EMOJIS);
    menuUpdateIcon.onclick = (e) => {
        e.stopPropagation(); state.pickerContext = 'context';
        const rect = menuUpdateIcon.getBoundingClientRect();
        positionEmojiPicker(rect.left - 260, rect.top);
        emojiPicker.classList.toggle('hidden');
    };
    selectedIconDisplay.onclick = (e) => {
        e.stopPropagation(); state.pickerContext = 'modal';
        const rect = selectedIconDisplay.getBoundingClientRect();
        positionEmojiPicker(rect.right - 256, rect.top - 200);
        emojiPicker.classList.toggle('hidden');
    };
    newCategoryEmojiBtn.onclick = (e) => {
        e.stopPropagation(); state.pickerContext = 'category';
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
            if (state.pickerContext === 'modal') { state.selectedIcon = em; currentEmojiDisplay.innerText = em; }
            else if (state.pickerContext === 'context' && state.contextEventId) {
                const idx = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
                if (idx !== -1) {
                    state.events[idx].icon = em;
                    if (supabaseClient && state.events[idx].id) await supabaseClient.from('countdown_events').update({ icon: em }).eq('id', state.events[idx].id);
                    renderEvents();
                }
            } else if (state.pickerContext === 'category') newCategoryEmojiBtn.innerText = em;
            emojiPicker.classList.add('hidden');
        };
    });
}

initEmojiPicker();
checkUser(init);
setupAuthListener(init);

// View Options
viewOptionsBtn.onclick = (e) => { e.stopPropagation(); viewOptionsMenu.classList.toggle('hidden'); viewOptionsMenu.classList.toggle('opacity-0'); };
closeViewOptionsBtn.onclick = () => { viewOptionsMenu.classList.add('opacity-0'); setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200); };
document.querySelectorAll('.sort-option').forEach(btn => {
    btn.onclick = () => {
        state.sortOption = btn.dataset.sort;
        document.querySelectorAll('.sort-option .check').forEach(c => c.classList.add('hidden'));
        btn.querySelector('.check').classList.remove('hidden');
        renderEvents();
    };
});
toggleNotesCheckbox.onchange = (e) => { state.showNotes = e.target.checked; renderEvents(); };
toggleDaysCheckbox.onchange = (e) => { state.showDays = e.target.checked; renderEvents(); };
toggleGroupingCheckbox.onchange = (e) => { state.groupByCategory = e.target.checked; renderEvents(); };

// Theme Logic
function updateThemeUI(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeIcon.innerText = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.innerText = '🌙';
    }
}

themeToggleBtn.onclick = () => {
    const isDark = !document.documentElement.classList.contains('dark');
    updateThemeUI(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
updateThemeUI(savedTheme === 'dark' || (!savedTheme && prefersDark));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        emojiPicker.classList.add('hidden');
        viewOptionsMenu.classList.add('hidden');
        closeContextMenu();
        closeModal();
        searchContainer.classList.add('hidden');
    }
});
