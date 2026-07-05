// ==========================================
// STORAGE & IMPORT/EXPORT MODULE
// ==========================================

import * as state from './state.js';

export function exportCollectionAsJSON() {
    const collection = {
        obtained: state.getObtainedSprites(),
        mastered: state.getMasteredSprites(),
        exportDate: new Date().toISOString(),
        version: 1
    };
    
    const dataStr = JSON.stringify(collection, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprite-collection-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

export function importCollectionFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!Array.isArray(data.obtained) || !Array.isArray(data.mastered)) {
                    reject(new Error('Invalid collection format: missing obtained or mastered arrays'));
                    return;
                }
                
                state.setObtainedSprites(data.obtained);
                state.setMasteredSprites(data.mastered);
                
                resolve({
                    obtained: data.obtained.length,
                    mastered: data.mastered.length
                });
            } catch (error) {
                reject(new Error(`Failed to parse JSON: ${error.message}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

export function getCollectionStats() {
    if (typeof baseSprites === 'undefined') {
        return { total: 0, obtained: 0, mastered: 0 };
    }
    
    const totalReleased = baseSprites.filter(sprite => !sprite.unreleased).length;
    const obtainedSprites = state.getObtainedSprites();
    const masteredSprites = state.getMasteredSprites();
    
    const obtainedCount = baseSprites.filter(sprite => !sprite.unreleased && obtainedSprites.includes(sprite.id)).length;
    const masteredCount = baseSprites.filter(sprite => !sprite.unreleased && masteredSprites.includes(sprite.id)).length;
    
    return {
        total: totalReleased,
        obtained: obtainedCount,
        mastered: masteredCount,
        obtainedPercentage: totalReleased > 0 ? (obtainedCount / totalReleased) * 100 : 0,
        masteredPercentage: totalReleased > 0 ? (masteredCount / totalReleased) * 100 : 0
    };
}

export function saveFilterStates(filters) {
    if (state.getIsViewMode()) return;
    localStorage.setItem('fn_state_search', filters.search || '');
    localStorage.setItem('fn_state_theme', filters.theme || 'all');
    localStorage.setItem('fn_state_unreleased', filters.unreleased || 'false');
    localStorage.setItem('fn_state_hide_mastered', filters.hideMastered || 'false');
    localStorage.setItem('fn_state_group_theme', filters.groupTheme || 'true');
    localStorage.setItem('fn_state_status_filter', filters.status || 'all');
}

export function loadFilterStates() {
    if (state.getIsViewMode()) {
        return {
            search: '',
            theme: 'all',
            unreleased: false,
            hideMastered: false,
            groupTheme: true,
            status: 'all'
        };
    }
    
    return {
        search: localStorage.getItem('fn_state_search') || '',
        theme: localStorage.getItem('fn_state_theme') || 'all',
        unreleased: localStorage.getItem('fn_state_unreleased') === 'true',
        hideMastered: localStorage.getItem('fn_state_hide_mastered') === 'true',
        groupTheme: localStorage.getItem('fn_state_group_theme') !== 'false',
        status: localStorage.getItem('fn_state_status_filter') || 'all'
    };
}

export function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        state.setObtainedSprites([]);
        state.setMasteredSprites([]);
        localStorage.clear();
        location.reload();
        return true;
    }
    return false;
}
