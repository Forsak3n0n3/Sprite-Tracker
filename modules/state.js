// ==========================================
// GLOBAL STATE MANAGEMENT
// ==========================================

let obtainedSprites = [];
let masteredSprites = [];
let isViewMode = false;
let currentStatusFilter = 'all';

export function initializeState(viewMode = false) {
    isViewMode = viewMode;
    if (isViewMode) {
        document.body.classList.add('viewing-shared-collection');
        document.getElementById('viewModeBanner').style.display = 'block';
    } else {
        loadCollectionFromStorage();
    }
}

export function loadCollectionFromStorage() {
    obtainedSprites = JSON.parse(localStorage.getItem('fn_obtained_sprites')) || [];
    masteredSprites = JSON.parse(localStorage.getItem('fn_mastered_sprites')) || [];
}

export function loadCollectionFromViewMode(baseSprites, compressedCode) {
    if (typeof decompressCollection === 'undefined') {
        console.error('share-utils.js not loaded');
        return;
    }
    const decoded = decompressCollection(baseSprites, compressedCode);
    obtainedSprites = decoded.obtained;
    masteredSprites = decoded.mastered;
}

export function getObtainedSprites() {
    return obtainedSprites;
}

export function getMasteredSprites() {
    return masteredSprites;
}

export function setObtainedSprites(sprites) {
    obtainedSprites = sprites;
    saveCollectionToStorage();
}

export function setMasteredSprites(sprites) {
    masteredSprites = sprites;
    saveCollectionToStorage();
}

export function toggleObtained(id) {
    if (obtainedSprites.includes(id)) {
        obtainedSprites = obtainedSprites.filter(item => item !== id);
        masteredSprites = masteredSprites.filter(item => item !== id);
    } else {
        obtainedSprites.push(id);
    }
    saveCollectionToStorage();
}

export function toggleMastery(id) {
    if (!obtainedSprites.includes(id)) return;
    if (!masteredSprites.includes(id)) {
        masteredSprites.push(id);
    } else {
        masteredSprites = masteredSprites.filter(item => item !== id);
    }
    saveCollectionToStorage();
}

export function getStatusFilter() {
    return currentStatusFilter;
}

export function setStatusFilter(filterValue) {
    if (isViewMode) return false;
    currentStatusFilter = filterValue;
    localStorage.setItem('fn_state_status_filter', filterValue);
    return true;
}

export function saveCollectionToStorage() {
    localStorage.setItem('fn_obtained_sprites', JSON.stringify(obtainedSprites));
    localStorage.setItem('fn_mastered_sprites', JSON.stringify(masteredSprites));
}

export function getIsViewMode() {
    return isViewMode;
}
