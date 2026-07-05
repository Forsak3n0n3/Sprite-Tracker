// ==========================================
// FILTER MANAGEMENT MODULE
// ==========================================

import * as state from './state.js';
import * as storage from './storage.js';

export function applyFilters(baseSprites, filterSettings) {
    if (!baseSprites || baseSprites.length === 0) return [];
    
    const {
        search = '',
        theme = 'all',
        unreleased = false,
        hideMastered = false,
        status = 'all'
    } = filterSettings;

    const obtainedSprites = state.getObtainedSprites();
    const masteredSprites = state.getMasteredSprites();
    const isViewMode = state.getIsViewMode();

    const searchQuery = search.toLowerCase();

    return baseSprites.filter(sprite => {
        // Unreleased filter
        if (!unreleased && sprite.unreleased) return false;
        
        // View mode: only show obtained sprites
        if (isViewMode && (!obtainedSprites.includes(sprite.id) || sprite.unreleased)) return false;
        
        // Search filter
        if (searchQuery && !sprite.name.toLowerCase().includes(searchQuery)) return false;
        
        // Theme filter
        if (theme !== 'all' && sprite.theme !== theme) return false;
        
        // Hide mastered filter
        if (hideMastered && masteredSprites.includes(sprite.id)) return false;
        
        // Status filter (only in normal mode)
        if (!isViewMode) {
            const isObtained = obtainedSprites.includes(sprite.id);
            if (status === 'obtained' && !isObtained) return false;
            if (status === 'missing' && isObtained) return false;
        }
        
        return true;
    });
}

export function sortByTheme(sprites) {
    const themeOrder = ["Basic", "Gold", "Candy", "Galaxy", "Gem", "Holofoil", "Rift"];
    
    return [...sprites].sort((a, b) => {
        const themeA = a.theme || 'Basic';
        const themeB = b.theme || 'Basic';
        return themeOrder.indexOf(themeA) - themeOrder.indexOf(themeB);
    });
}

export function getFilterOptions() {
    return {
        themes: ["Basic", "Gold", "Candy", "Galaxy", "Gem", "Holofoil", "Rift"],
        statuses: ["all", "obtained", "missing"]
    };
}
