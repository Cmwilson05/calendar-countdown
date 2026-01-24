console.log("🚀 app.js loaded");
import { supabaseClient, state, saveData, loadFallbackData, initSupabase } from './storage.js';
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
const unitYearInput = document.getElementById('unitYear');
const unitMonthInput = document.getElementById('unitMonth');
const unitWeekInput = document.getElementById('unitWeek');
const unitDayInput = document.getElementById('unitDay');
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
const toggleIconsCheckbox = document.getElementById('toggleIcons');
const toggleIntervalsCheckbox = document.getElementById('toggleIntervals');
const toggleScreenshotCheckbox = document.getElementById('toggleScreenshot');
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
    initSupabase();

    if (currentDateEl) {
        const now = new Date();
        currentDateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    updateViewToggleUI();
    
    loader.classList.remove('hidden');
    categoryFilterBar.classList.add('hidden');
    gridView.innerHTML = '';
    timelineView.innerHTML = '';

    let dataLoaded = false;

    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                const [catRes, eventRes] = await Promise.all([
                    supabaseClient.from('categories').select('*'),
                    supabaseClient.from('countdown_events').select('*')
                ]);
                
                if (!catRes.error && !eventRes.error) {
                    state.categories = catRes.data || [];
                    state.events = eventRes.data || [];
                    state.isInitialized = true;
                    dataLoaded = true;
                }
            }
        } catch (err) {
            console.error("Supabase fetch error:", err);
        }
    }

    if (!dataLoaded) {
        loadFallbackData();
    }
    
    loader.classList.add('hidden');
    categoryFilterBar.classList.remove('hidden');

    // Initialize view option checkboxes from saved state
    if (toggleGroupingCheckbox) toggleGroupingCheckbox.checked = state.groupByCategory;
    if (toggleNotesCheckbox) toggleNotesCheckbox.checked = state.showNotes;
    if (toggleDaysCheckbox) toggleDaysCheckbox.checked = state.showDays;
    if (toggleIconsCheckbox) toggleIconsCheckbox.checked = state.showIcons;
    if (toggleIntervalsCheckbox) toggleIntervalsCheckbox.checked = state.showIntervals;

    // Initialize sort option from saved state
    document.querySelectorAll('.sort-option').forEach(btn => {
        const check = btn.querySelector('.check');
        if (btn.dataset.sort === state.sortOption) {
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('hover:bg-black/5', 'dark:hover:bg-white/10', 'text-gray-600', 'dark:text-gray-300');
            if (check) check.classList.remove('hidden');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('hover:bg-black/5', 'dark:hover:bg-white/10', 'text-gray-600', 'dark:text-gray-300');
            if (check) check.classList.add('hidden');
        }
    });

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
    let session = null;
    if (supabaseClient) {
        const res = await supabaseClient.auth.getSession();
        session = res.data.session;
        userId = session?.user?.id;
    }

    const displayUnits = {
        year: unitYearInput?.checked || false,
        month: unitMonthInput?.checked || false,
        week: unitWeekInput?.checked || false,
        day: unitDayInput?.checked ?? true
    };
    console.log('Saving display_units:', displayUnits);

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
        display_units: displayUnits,
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
    await saveData();

    if (supabaseClient && session) {
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

function applyScreenshotMode() {
    const bottomNav = document.querySelector('.fixed.bottom-10');
    const headerControls = document.getElementById('headerControls');
    const appContent = document.getElementById('appContent');

    if (state.screenshotMode) {
        // Hide UI elements
        if (bottomNav) bottomNav.classList.add('hidden');
        if (headerControls) headerControls.classList.add('hidden');
        if (categoryFilterBar) categoryFilterBar.classList.add('hidden');
        // Compact the content
        if (appContent) appContent.classList.add('screenshot-mode');
        document.body.classList.add('screenshot-mode');
    } else {
        // Show UI elements
        if (bottomNav) bottomNav.classList.remove('hidden');
        if (headerControls) headerControls.classList.remove('hidden');
        if (categoryFilterBar) categoryFilterBar.classList.remove('hidden');
        // Remove compact mode
        if (appContent) appContent.classList.remove('screenshot-mode');
        document.body.classList.remove('screenshot-mode');
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
        // Load display units (default to day only if not set)
        const units = data.display_units || { year: false, month: false, week: false, day: true };
        if (unitYearInput) unitYearInput.checked = units.year;
        if (unitMonthInput) unitMonthInput.checked = units.month;
        if (unitWeekInput) unitWeekInput.checked = units.week;
        if (unitDayInput) unitDayInput.checked = units.day;
        state.selectedIcon = data.icon || '🎉';
        currentEmojiDisplay.innerText = state.selectedIcon;
        const tab = modalCategoryTabs.querySelector(`[data-category-id="${data.category_id || 'none'}"]`);
        if (tab) tab.classList.add('bg-blue-600', 'text-white');
    } else {
        eventTitleInput.value = '';
        eventDateInput.value = new Date().toISOString().split('T')[0];
        eventNotesInput.value = '';
        eventTagsInput.value = '';
        eventStarredInput.checked = false;
        eventUrlInput.value = '';
        eventMultiDayInput.checked = false;
        eventRepeatInput.value = 'never';
        // Reset display units to default (day only)
        if (unitYearInput) unitYearInput.checked = false;
        if (unitMonthInput) unitMonthInput.checked = false;
        if (unitWeekInput) unitWeekInput.checked = false;
        if (unitDayInput) unitDayInput.checked = true;
        state.selectedIcon = '🎉';
        currentEmojiDisplay.innerText = '🎉';
        const tab = modalCategoryTabs.querySelector('[data-category-id="none"]');
        if (tab) tab.classList.add('bg-blue-600', 'text-white');
    }
}

function closeModal() {
    // Apply exit animations to all modals
    [newEventModal, quickNotesModal, moreInfoModal, manageCategoriesModal].forEach(modal => {
        if (modal) modal.classList.add('scale-95', 'opacity-0');
    });
    
    setTimeout(() => {
        if (modalOverlay) modalOverlay.classList.add('hidden');
        [newEventModal, quickNotesModal, moreInfoModal, manageCategoriesModal].forEach(modal => {
            if (modal) modal.classList.add('hidden');
        });
    }, 200);
}

// Wire up all "X" and "Cancel" buttons to closeModal
[
    cancelEventBtn, closeNewEventModalBtn,
    closeMoreInfoXBtn,
    closeQuickNotesXBtn, cancelQuickNotesBtn,
    closeManageCategoriesBtn
].forEach(btn => {
    if (btn) btn.onclick = closeModal;
});

// Open modal when clicking "+ New Event"
if (addEventBtn) {
    addEventBtn.onclick = () => openModal();
}

// Pop-up specific close buttons
if (closeEmojiPickerBtn) {
    closeEmojiPickerBtn.onclick = () => emojiPicker.classList.add('hidden');
}
if (closeViewOptionsBtn) {
    closeViewOptionsBtn.onclick = () => {
        viewOptionsMenu.classList.add('opacity-0');
        setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200);
    };
}

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
    let session = null;
    if (supabaseClient) {
        const res = await supabaseClient.auth.getSession();
        session = res.data.session;
        if (session) await supabaseClient.from('categories').delete().eq('id', id);
    }
    state.categories = state.categories.filter(c => c.id != id);
    renderCategoriesList();
    renderCategoryFilterBar();
    await saveData();
};

saveNewCategoryBtn.onclick = async () => {
    const name = newCategoryNameInput.value.trim();
    if (!name) return;
    const emoji = newCategoryEmojiBtn.innerText;
    
    if (state.editingCategoryId) {
        const index = state.categories.findIndex(c => c.id == state.editingCategoryId);
        if (index !== -1) {
            state.categories[index] = { ...state.categories[index], name, emoji };
            if (supabaseClient) {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session) await supabaseClient.from('categories').update({ name, emoji }).eq('id', state.editingCategoryId);
            }
        }
        state.editingCategoryId = null;
        saveNewCategoryBtn.innerText = 'Add';
    } else {
        let userId = null;
        let session = null;
        if (supabaseClient) {
            const res = await supabaseClient.auth.getSession();
            session = res.data.session;
            userId = session?.user?.id;
        }
        const newCat = { name, emoji, user_id: userId };
        if (supabaseClient && session) {
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
    await saveData();
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

    // Get menu dimensions
    const menuWidth = 224; // w-56 = 14rem = 224px
    const menuHeight = 380; // approximate height with touch-friendly buttons
    const padding = 16; // safe padding from edges

    // On small screens, center the menu horizontally
    const isMobile = window.innerWidth < 480;
    let posX, posY;

    if (isMobile) {
        posX = Math.max(padding, (window.innerWidth - menuWidth) / 2);
    } else {
        posX = Math.min(Math.max(padding, x), window.innerWidth - menuWidth - padding);
    }

    // Position vertically - prefer below click, but flip if needed
    if (y + menuHeight + padding > window.innerHeight) {
        posY = Math.max(padding, y - menuHeight);
    } else {
        posY = Math.max(padding, y);
    }

    contextMenu.style.left = `${posX}px`;
    contextMenu.style.top = `${posY}px`;
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

// Close popups when clicking outside
window.addEventListener('click', (e) => {
    // Close context menu when clicking outside (but not if clicking emoji picker)
    if (!contextMenu.contains(e.target) && !emojiPicker.contains(e.target)) {
        closeContextMenu();
    }

    // Close emoji picker when clicking outside
    if (!emojiPicker.contains(e.target) &&
        !selectedIconDisplay?.contains(e.target) &&
        !menuUpdateIcon?.contains(e.target) &&
        !newCategoryEmojiBtn?.contains(e.target)) {
        emojiPicker.classList.add('hidden');
    }

    // Close view options menu when clicking outside
    if (!viewOptionsMenu.contains(e.target) && !viewOptionsBtn.contains(e.target) && !viewOptionsMenu.classList.contains('hidden')) {
        viewOptionsMenu.classList.add('opacity-0');
        setTimeout(() => viewOptionsMenu.classList.add('hidden'), 200);
    }
});

// Close modal when clicking on overlay (not modal content)
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

menuEdit.onclick = () => {
    const event = state.events.find(e => (e.id || e.tempId) == state.contextEventId);
    // Hide context menu immediately (no animation) before opening modal
    contextMenu.classList.add('hidden', 'opacity-0');
    if (event) openModal(event);
};

menuDelete.onclick = async () => {
    if (!state.contextEventId || !confirm('Delete event?')) return;
    const index = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
    if (index !== -1) {
        const id = state.events[index].id;
        state.events.splice(index, 1);
        if (supabaseClient && id) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) await supabaseClient.from('countdown_events').delete().eq('id', id);
        }
        renderEvents();
        await saveData();
    }
    closeContextMenu();
};

menuStar.onclick = async () => {
    const index = state.events.findIndex(e => (e.id || e.tempId) == state.contextEventId);
    if (index !== -1) {
        state.events[index].starred = !state.events[index].starred;
        if (supabaseClient && state.events[index].id) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) await supabaseClient.from('countdown_events').update({ starred: state.events[index].starred }).eq('id', state.events[index].id);
        }
        renderEvents();
        await saveData();
    }
    closeContextMenu();
};

menuNotes.onclick = () => {
    const event = state.events.find(e => (e.id || e.tempId) == state.contextEventId);
    if (event) {
        // Ensure other modals are hidden
        newEventModal.classList.add('hidden');
        manageCategoriesModal.classList.add('hidden');
        moreInfoModal.classList.add('hidden');
        
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
        if (supabaseClient && state.events[index].id) {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) await supabaseClient.from('countdown_events').update({ notes }).eq('id', state.events[index].id);
        }
        renderEvents();
        await saveData();
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
    const pickerWidth = 288; // w-72 = 18rem = 288px
    const pickerHeight = 280; // approximate height
    const padding = 16;
    const isMobile = window.innerWidth < 480;

    let posX, posY;

    if (isMobile) {
        // Center horizontally on mobile
        posX = Math.max(padding, (window.innerWidth - pickerWidth) / 2);
        // Position in upper portion of screen for thumb accessibility
        posY = Math.max(padding, Math.min(y, window.innerHeight - pickerHeight - padding));
    } else {
        posX = Math.max(padding, Math.min(x, window.innerWidth - pickerWidth - padding));
        posY = Math.max(padding, Math.min(y, window.innerHeight - pickerHeight - padding));
    }

    emojiPicker.style.left = `${posX}px`;
    emojiPicker.style.top = `${posY}px`;
}

function renderEmojis(arr) {
    const isSearch = emojiSearch.value.length > 0;
    if (isSearch) {
        emojiList.className = "grid grid-cols-5 gap-1 p-2 max-h-56 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = arr.map(em => `<button class="emoji-item w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 text-2xl transition-colors" data-emoji="${em.char}">${em.char}</button>`).join('');
    } else {
        const groups = {};
        arr.forEach(em => { if (!groups[em.category]) groups[em.category] = []; groups[em.category].push(em); });
        emojiList.className = "flex flex-col p-2 max-h-56 overflow-y-auto custom-scrollbar";
        emojiList.innerHTML = Object.entries(groups).map(([cat, ems]) => `
            <div class="mb-3">
                <h3 class="text-[10px] uppercase text-gray-400 font-bold mb-1.5 px-1">${cat}</h3>
                <div class="grid grid-cols-5 gap-1">
                    ${ems.map(em => `<button class="emoji-item w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 text-2xl transition-colors" data-emoji="${em.char}">${em.char}</button>`).join('')}
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
                    if (supabaseClient && state.events[idx].id) {
                        const { data: { session } } = await supabaseClient.auth.getSession();
                        if (session) await supabaseClient.from('countdown_events').update({ icon: em }).eq('id', state.events[idx].id);
                    }
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
        saveData();
    };
});
toggleNotesCheckbox.onchange = (e) => { state.showNotes = e.target.checked; renderEvents(); saveData(); };
toggleDaysCheckbox.onchange = (e) => { state.showDays = e.target.checked; renderEvents(); saveData(); };
toggleIconsCheckbox.onchange = (e) => { state.showIcons = e.target.checked; renderEvents(); saveData(); };
toggleIntervalsCheckbox.onchange = (e) => { state.showIntervals = e.target.checked; renderEvents(); saveData(); };
toggleScreenshotCheckbox.onchange = (e) => {
    state.screenshotMode = e.target.checked;
    updateScreenshotToggleUI();
    applyScreenshotMode();
    renderEvents();
    // Close view options menu after enabling screenshot mode
    if (state.screenshotMode) {
        viewOptionsMenu.classList.add('hidden', 'opacity-0');
    }
};

// Screenshot toggle button in header
const screenshotToggleBtn = document.getElementById('screenshotToggleBtn');
const screenshotIcon = document.getElementById('screenshotIcon');

function updateScreenshotToggleUI() {
    if (screenshotIcon) {
        screenshotIcon.innerText = state.screenshotMode ? '📷' : '📷';
        screenshotIcon.style.opacity = state.screenshotMode ? '1' : '0.5';
    }
    if (toggleScreenshotCheckbox) {
        toggleScreenshotCheckbox.checked = state.screenshotMode;
    }
}

if (screenshotToggleBtn) {
    screenshotToggleBtn.onclick = () => {
        state.screenshotMode = !state.screenshotMode;
        updateScreenshotToggleUI();
        applyScreenshotMode();
        renderEvents();
        if (state.screenshotMode) {
            viewOptionsMenu.classList.add('hidden', 'opacity-0');
        }
    };
}
toggleGroupingCheckbox.onchange = (e) => { state.groupByCategory = e.target.checked; renderEvents(); saveData(); };

// Theme Logic
function updateThemeUI(isDark) {
    const root = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        if (themeIcon) themeIcon.innerText = '☀️';
    } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        if (themeIcon) themeIcon.innerText = '🌙';
    }
}

if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
        console.log("--- THEME TOGGLE CLICKED ---");
        const isDark = !document.documentElement.classList.contains('dark');
        updateThemeUI(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    updateThemeUI(savedTheme === 'dark');
} else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateThemeUI(prefersDark);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        emojiPicker.classList.add('hidden');
        viewOptionsMenu.classList.add('hidden');
        closeContextMenu();
        closeModal();
        searchContainer.classList.add('hidden');
    }
});

// Add More Info Button Logic
if (addMoreInfoBtn) {
    addMoreInfoBtn.onclick = () => {
        console.log('Add More Info clicked');
        newEventModal.classList.add('hidden');
        moreInfoModal.classList.remove('hidden');
        void moreInfoModal.offsetWidth;
        moreInfoModal.classList.remove('scale-95', 'opacity-0');
    };
} else {
    console.error('addMoreInfoBtn not found');
}

if (closeMoreInfoBtn) {
    closeMoreInfoBtn.onclick = () => {
        moreInfoModal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            moreInfoModal.classList.add('hidden');
            newEventModal.classList.remove('hidden');
            void newEventModal.offsetWidth;
            newEventModal.classList.remove('scale-95', 'opacity-0');
        }, 200);
    };
}

// Manage Categories Button Logic + Birthday auto-repeat
if (modalCategoryTabs) {
    modalCategoryTabs.addEventListener('click', (e) => {
        if (e.target.closest('#modalManageCategoriesBtn')) {
            console.log('Manage Categories clicked');
            newEventModal.classList.add('hidden');
            openManageCategories();
        }

        // Check if a category tab was clicked and if it's a birthday category
        const tab = e.target.closest('.modal-category-tab');
        if (tab) {
            const categoryId = tab.dataset.categoryId;
            const category = state.categories.find(c => c.id == categoryId);
            // Auto-set repeat to yearly for birthday categories
            if (category && category.name.toLowerCase().includes('birthday')) {
                if (eventRepeatInput) eventRepeatInput.value = 'yearly';
            }
        }
    });
} else {
    console.error('modalCategoryTabs not found');
}
