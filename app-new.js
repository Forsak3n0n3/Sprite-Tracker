// ==========================================
// MAIN APPLICATION
// ==========================================

import * as state from './modules/state.js';
import * as storage from './modules/storage.js';
import * as filters from './modules/filters.js';
import * as rendering from './modules/rendering.js';
import * as exportModule from './modules/export.js';

// DOM Elements
const urlParams = new URLSearchParams(window.location.search);
const compressedCode = urlParams.get('c');
const isViewMode = compressedCode !== null;

const searchInput = document.getElementById('search');
const themeFilter = document.getElementById('theme-filter');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const unreleasedSwitch = document.getElementById('unreleased-switch');
const shareBtn = document.getElementById('shareBtn');
const imageBtn = document.getElementById('imageBtn');
const missingImageBtn = document.getElementById('missingImageBtn');
const unmasteredImageBtn = document.getElementById('unmasteredImageBtn');
const masteredImageBtn = document.getElementById('masteredImageBtn');
const hideMasteredSwitch = document.getElementById('hide-mastered-switch');
const groupThemeSwitch = document.getElementById('group-theme-switch');

const toggleAll = document.getElementById('toggle-all');
const toggleOwned = document.getElementById('toggle-owned');
const toggleUnowned = document.getElementById('toggle-unowned');

const closeCreatorBtn = document.getElementById('closeCreatorBtn');
const creatorCard = document.querySelector('.creator-card');

// Import/Export buttons (will be created dynamically if not present)
let importBtn = document.getElementById('importBtn');
let exportBtn = document.getElementById('exportBtn');

// Initialize app
function initializeApp() {
    // Initialize state
    state.initializeState(isViewMode);
    
    if (isViewMode) {
        if (typeof baseSprites !== 'undefined') {
            state.loadCollectionFromViewMode(baseSprites, compressedCode);
        }
    }

    // Load filter states
    const filterStates = storage.loadFilterStates();
    
    if (!isViewMode) {
        searchInput.value = filterStates.search;
        themeFilter.value = filterStates.theme;
        unreleasedSwitch.checked = filterStates.unreleased;
        hideMasteredSwitch.checked = filterStates.hideMastered;
        groupThemeSwitch.checked = filterStates.groupTheme;
    }

    state.setStatusFilter(filterStates.status);
    
    // Restore active button state
    const currentStatus = state.getStatusFilter();
    [toggleAll, toggleOwned, toggleUnowned].forEach(btn => btn.classList.remove('active'));
    if (currentStatus === 'all') toggleAll.classList.add('active');
    else if (currentStatus === 'obtained') toggleOwned.classList.add('active');
    else if (currentStatus === 'missing') toggleUnowned.classList.add('active');

    // Hide creator card if needed
    if (sessionStorage.getItem('hide_creator_card') === 'true' && creatorCard) {
        creatorCard.style.display = 'none';
    }

    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    if (typeof baseSprites !== 'undefined') {
        renderCurrentGrid();
    }
}

function setupEventListeners() {
    // Status filter buttons
    toggleAll.addEventListener('click', () => {
        state.setStatusFilter('all');
        updateStatusButtons('all');
        renderCurrentGrid();
    });
    toggleOwned.addEventListener('click', () => {
        state.setStatusFilter('obtained');
        updateStatusButtons('obtained');
        renderCurrentGrid();
    });
    toggleUnowned.addEventListener('click', () => {
        state.setStatusFilter('missing');
        updateStatusButtons('missing');
        renderCurrentGrid();
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);

    // Filter inputs
    searchInput.addEventListener('input', () => {
        saveFilterStates();
        renderCurrentGrid();
    });
    themeFilter.addEventListener('change', () => {
        saveFilterStates();
        renderCurrentGrid();
    });
    unreleasedSwitch.addEventListener('change', () => {
        saveFilterStates();
        renderCurrentGrid();
    });
    hideMasteredSwitch.addEventListener('change', () => {
        saveFilterStates();
        renderCurrentGrid();
    });
    groupThemeSwitch.addEventListener('change', () => {
        saveFilterStates();
        renderCurrentGrid();
    });

    // Creator card close
    if (closeCreatorBtn && creatorCard) {
        closeCreatorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            creatorCard.style.display = 'none';
            sessionStorage.setItem('hide_creator_card', 'true');
        });
    }

    // Export buttons
    imageBtn.addEventListener('click', () => {
        const filterSettings = getFilterSettings();
        exportModule.exportCanvasImage('collected', baseSprites, filterSettings);
    });
    missingImageBtn.addEventListener('click', () => {
        const filterSettings = getFilterSettings();
        exportModule.exportCanvasImage('missing', baseSprites, filterSettings);
    });
    unmasteredImageBtn.addEventListener('click', () => {
        const filterSettings = getFilterSettings();
        exportModule.exportCanvasImage('unmastered', baseSprites, filterSettings);
    });
    masteredImageBtn.addEventListener('click', () => {
        const filterSettings = getFilterSettings();
        exportModule.exportCanvasImage('mastered', baseSprites, filterSettings);
    });

    // Share button
    shareBtn.addEventListener('click', () => {
        if (typeof baseSprites === 'undefined' || typeof compressCollection === 'undefined') return;
        const compressionCodeString = compressCollection(baseSprites, state.getObtainedSprites(), state.getMasteredSprites());
        const shareURL = `${window.location.origin}${window.location.pathname}?c=${compressionCodeString}`;
        navigator.clipboard.writeText(shareURL).then(() => { alert("Share link copied!"); });
    });

    // Import/Export JSON buttons
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            storage.exportCollectionAsJSON();
        });
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const result = await storage.importCollectionFromJSON(file);
                    alert(`Imported successfully!\nObtained: ${result.obtained}\nMastered: ${result.mastered}`);
                    renderCurrentGrid();
                } catch (error) {
                    alert(`Import failed: ${error.message}`);
                }
            });
            input.click();
        });
    }
}

function updateStatusButtons(status) {
    [toggleAll, toggleOwned, toggleUnowned].forEach(btn => btn.classList.remove('active'));
    if (status === 'all') toggleAll.classList.add('active');
    else if (status === 'obtained') toggleOwned.classList.add('active');
    else if (status === 'missing') toggleUnowned.classList.add('active');
}

function resetFilters() {
    searchInput.value = '';
    themeFilter.value = 'all';
    unreleasedSwitch.checked = false;
    hideMasteredSwitch.checked = false;
    groupThemeSwitch.checked = true;
    state.setStatusFilter('all');

    saveFilterStates();
    updateStatusButtons('all');
    renderCurrentGrid();
}

function getFilterSettings() {
    return {
        search: searchInput.value,
        theme: themeFilter.value,
        unreleased: unreleasedSwitch.checked,
        hideMastered: hideMasteredSwitch.checked,
        groupTheme: groupThemeSwitch.checked,
        status: state.getStatusFilter()
    };
}

function saveFilterStates() {
    if (isViewMode) return;
    const filterSettings = getFilterSettings();
    storage.saveFilterStates({
        search: filterSettings.search,
        theme: filterSettings.theme,
        unreleased: filterSettings.unreleased,
        hideMastered: filterSettings.hideMastered,
        groupTheme: filterSettings.groupTheme,
        status: filterSettings.status
    });
}

function renderCurrentGrid() {
    const filterSettings = getFilterSettings();
    rendering.renderGrid(baseSprites, filterSettings);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
