import { state } from './storage.js';
import { getEffectiveDate, calculateDays } from './utils.js';

const gridView = document.getElementById('gridView');
const timelineView = document.getElementById('timelineView');
const categoryFilterBar = document.getElementById('categoryFilterBar');
const viewTitle = document.getElementById('viewTitle');
const modalCategoryTabs = document.getElementById('modalCategoryTabs');
const categoriesListEl = document.getElementById('categoriesList');
const currentEmojiDisplay = document.getElementById('currentEmoji');

export function renderEvents() {
    let filtered = [...state.events];

    if (state.selectedCategoryId === 'upcoming') filtered = filtered.filter(e => calculateDays(getEffectiveDate(e)) >= 0);
    else if (state.selectedCategoryId === 'starred') filtered = filtered.filter(e => e.starred);
    else if (state.selectedCategoryId !== 'all') filtered = filtered.filter(e => e.category_id == state.selectedCategoryId);

    if (state.searchQuery) {
        const lowerQ = state.searchQuery.toLowerCase();
        filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(lowerQ) || 
            (e.notes && e.notes.toLowerCase().includes(lowerQ))
        );
    }

    if (filtered.length === 0) {
        const message = state.searchQuery 
            ? `No matches for "${state.searchQuery}"` 
            : "No events yet. Tap + to start!";
        const emptyHtml = `<div class="col-span-full text-center text-gray-400 mt-20">${message}</div>`;
        gridView.innerHTML = emptyHtml;
        timelineView.innerHTML = emptyHtml;
        return;
    }

    filtered.sort((a, b) => {
        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);
        if (state.sortOption === 'date-asc') return dateA - dateB;
        if (state.sortOption === 'date-desc') return dateB - dateA;
        if (state.sortOption === 'alpha') return a.title.localeCompare(b.title);
        return 0;
    });

    gridView.innerHTML = filtered.map(event => {
        const effectiveDate = getEffectiveDate(event);
        const days = calculateDays(effectiveDate);
        const cat = state.categories.find(c => c.id == event.category_id);
        const displayIcon = event.icon || (cat ? cat.emoji : '📅');
        
        return `
            <div class="bg-blue-600 text-white p-6 rounded-3xl shadow-lg aspect-square flex flex-col justify-between cursor-pointer active:scale-95 transition-transform relative"
                 onclick="handleEventClick('${event.id || event.tempId}')">
                ${event.starred ? `<div class="absolute top-3 left-3 text-yellow-300 text-lg">⭐</div>` : ''}
                <div class="flex justify-between items-start">
                    <div class="text-xl font-bold line-clamp-2 ${event.starred ? 'ml-6' : ''}">${event.title}</div>
                    ${state.showIcons ? `<div class="text-xl">${displayIcon}</div>` : ''}
                </div>
                <div class="flex flex-col gap-1">
                    <div class="flex items-baseline gap-2">
                        ${state.showDays ? `<div class="text-3xl font-bold">${Math.abs(days)}</div>` : ''}
                        ${state.showNotes && event.notes ? `<div class="text-xs opacity-70 line-clamp-2 italic">${event.notes}</div>` : ''}
                    </div>
                    ${state.showDays ? `<div class="text-sm opacity-80 uppercase tracking-wider">${days === 0 ? 'Today' : (days > 0 ? 'Days Until' : 'Days Since')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    if (state.groupByCategory) {
        const grouped = filtered.reduce((acc, event) => {
            const catId = event.category_id || 'none';
            if (!acc[catId]) acc[catId] = [];
            acc[catId].push(event);
            return acc;
        }, {});

        const sortedCatIds = Object.keys(grouped).sort((a, b) => {
            if (a === 'none') return 1;
            if (b === 'none') return -1;
            const catA = state.categories.find(c => c.id == a);
            const catB = state.categories.find(c => c.id == b);
            return (catA?.name || '').localeCompare(catB?.name || '');
        });

        timelineView.innerHTML = sortedCatIds.map(catId => {
            const catEvents = grouped[catId];
            const cat = state.categories.find(c => c.id == catId);
            return `
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-green-500 dark:text-green-400 mb-6 px-4">${cat ? cat.name : 'Uncategorized'}</h2>
                    <div class="relative px-4">
                        ${state.showIcons ? `<div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-gray-200 dark:border-gray-800"></div>` : ''}
                        <div class="flex flex-col gap-10">
                            ${catEvents.map(event => renderTimelineItem(event)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        timelineView.innerHTML = `
            <div class="relative px-4 pt-4">
                ${state.showIcons ? `<div class="absolute left-[104px] top-0 bottom-0 border-l-2 border-dotted border-gray-200 dark:border-gray-800"></div>` : ''}
                <div class="flex flex-col gap-10">
                    ${filtered.map(event => renderTimelineItem(event)).join('')}
                </div>
            </div>
        `;
    }
}

function renderTimelineItem(event) {
    const effectiveDate = getEffectiveDate(event);
    const days = calculateDays(effectiveDate);
    const cat = state.categories.find(c => c.id == event.category_id);
    const displayIcon = event.icon || (cat ? cat.emoji : '📅');

    return `
        <div class="flex items-start gap-6 relative group cursor-pointer" onclick="handleEventClick('${event.id || event.tempId}')">
            <div class="w-16 text-right pt-1 flex-shrink-0">
                <div class="text-gray-400 dark:text-gray-500 font-bold text-xl leading-none mb-1">${effectiveDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</div>
                <div class="text-gray-300 dark:text-gray-600 text-sm font-semibold">${effectiveDate.getFullYear()}</div>
            </div>
            ${state.showIcons ? `
            <div class="relative z-10 flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0">
                <span class="text-2xl">${displayIcon}</span>
            </div>` : ''}
            <div class="flex-1 pt-1">
                <div class="flex items-center gap-2">
                    <div class="font-bold text-2xl text-black dark:text-white leading-tight">${event.title}</div>
                    ${event.starred ? `<span class="text-yellow-500 text-lg">⭐</span>` : ''}
                </div>
                <div class="flex items-baseline gap-2">
                    ${state.showDays ? `<div class="text-gray-500 dark:text-gray-400 font-semibold text-xl">${days === 0 ? 'Today' : (days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`)}</div>` : ''}
                    ${state.showNotes && event.notes ? `<div class="text-sm text-gray-400 italic">${event.notes}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

export function renderCategoryFilterBar() {
    const smart = [{id:'upcoming', name:'Upcoming', emoji:'📅'}, {id:'starred', name:'Starred', emoji:'⭐'}, {id:'all', name:'All', emoji:'🌐'}];
    let html = smart.map(f => `<button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${state.selectedCategoryId === f.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}" data-category-id="${f.id}">${f.emoji} ${f.name}</button>`).join('');
    html += state.categories.map(cat => `<button class="filter-tab px-4 py-1.5 rounded-full text-sm font-semibold ${state.selectedCategoryId == cat.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}" data-category-id="${cat.id}">${cat.emoji} ${cat.name}</button>`).join('');
    html += `<button id="manageCategoriesBtn" class="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">+ Edit</button>`;
    categoryFilterBar.innerHTML = html;

    categoryFilterBar.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            state.selectedCategoryId = tab.dataset.categoryId;
            const f = [...smart, ...state.categories].find(x => x.id == state.selectedCategoryId);
            viewTitle.innerText = f ? f.name : 'All';
            renderCategoryFilterBar();
            renderEvents();
        });
    });
}

export function renderModalCategoryTabs() {
    let html = state.categories.map(cat => `<button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="${cat.id}">${cat.name}</button>`).join('');
    html += `<button class="modal-category-tab flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold" data-category-id="none">None</button>`;
    html += `<button id="modalManageCategoriesBtn" class="py-1.5 px-3 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-black dark:text-white ml-2">⚙️</button>`;
    modalCategoryTabs.innerHTML = html;

    modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(tab => {
        tab.onclick = () => {
            modalCategoryTabs.querySelectorAll('.modal-category-tab').forEach(t => t.classList.remove('bg-blue-600', 'text-white'));
            tab.classList.add('bg-blue-600', 'text-white');
        };
    });
}

export function renderCategoriesList() {
    categoriesListEl.innerHTML = state.categories.map(cat => `
        <div class="flex items-center justify-between bg-gray-50 dark:bg-[#2c2c2e] p-3 rounded-xl border border-gray-100 dark:border-transparent">
            <div class="flex items-center gap-3"><span>${cat.emoji}</span><span class="text-black dark:text-white">${cat.name}</span></div>
            <div class="flex gap-2">
                <button onclick="editCategory(${cat.id})" class="text-blue-500 font-bold text-sm">Edit</button>
                <button onclick="deleteCategory(${cat.id})" class="text-red-500 font-bold text-sm">Delete</button>
            </div>
        </div>
    `).join('');
}