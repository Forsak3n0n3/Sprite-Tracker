// ==========================================
// RENDERING MODULE
// ==========================================

import * as state from './state.js';
import * as filters from './filters.js';

export function buildCardHTML(sprite, isObtained, isMastered) {
    const itemRarity = sprite.rarity || 'Rare';
    const unreleasedBadge = sprite.unreleased ? `<div class="status-badge unreleased">UNRELEASED</div>` : '';
    
    let badgeHTML = '';
    let renderedCrownHTML = '';
    
    if (isMastered) {
        badgeHTML = `<div class="status-badge mastered-badge">MASTERED</div>`;
        renderedCrownHTML = `<div class="rendered-head-crown">👑</div>`; 
    } else if (isObtained) {
        badgeHTML = `<div class="status-badge collected">COLLECTED</div>`;
    }

    let crownHTML = '';
    if (isObtained && !isMastered) {
        crownHTML = `<div class="crown-action-icon" title="Master this Sprite">👑</div>`;
    }

    const displayRarityText = itemRarity === 'Mythic' ? 'MYTHIC' : itemRarity;
    const rarityBadge = `<div class="fortnite-rarity-tag">${displayRarityText}</div>`;
    const inferredImagePath = `sprites/${sprite.id}.png`;

    return `
        ${unreleasedBadge}
        ${badgeHTML}
        ${crownHTML}
        <div class="card-inner-display">
            ${renderedCrownHTML}
            <img src="${inferredImagePath}" class="sprite-img" alt="${sprite.name}" onerror="this.src='https://placehold.co/150?text=Missing+File'">
            ${rarityBadge}
        </div>
        <div class="card-title-footer"><span>${sprite.name}</span></div>
    `;
}

export function adjustCardFontSizes() {
    document.querySelectorAll('.card-title-footer span').forEach(span => {
        const parent = span.parentElement;
        let currentSize = 16.95;
        span.style.fontSize = currentSize + 'px';
        
        while ((span.scrollWidth > parent.clientWidth) && currentSize > 6) {
            currentSize -= 0.5;
            span.style.fontSize = currentSize + 'px';
        }
    });
}

export function updateCollectionCounter() {
    if (typeof baseSprites === 'undefined') return;

    const liveRatio = document.getElementById('live-counter-ratio');
    const liveBarFill = document.getElementById('live-counter-bar');
    const masteryRatio = document.getElementById('mastery-counter-ratio');
    const masteryBarFill = document.getElementById('mastery-counter-bar');

    const totalReleased = baseSprites.filter(sprite => !sprite.unreleased).length;
    const obtainedSprites = state.getObtainedSprites();
    const masteredSprites = state.getMasteredSprites();
    
    const collectedReleased = baseSprites.filter(sprite => !sprite.unreleased && obtainedSprites.includes(sprite.id)).length;
    const masteredReleased = baseSprites.filter(sprite => !sprite.unreleased && masteredSprites.includes(sprite.id)).length;
    
    liveRatio.textContent = `${collectedReleased} / ${totalReleased}`;
    const collectionPercentage = totalReleased > 0 ? (collectedReleased / totalReleased) * 100 : 0;
    liveBarFill.style.width = `${collectionPercentage}%`;

    masteryRatio.textContent = `${masteredReleased} / ${totalReleased}`;
    const masteryPercentage = totalReleased > 0 ? (masteredReleased / totalReleased) * 100 : 0;
    masteryBarFill.style.width = `${masteryPercentage}%`;
}

export function renderGrid(baseSprites, filterSettings) {
    const spriteGrid = document.getElementById('spriteGrid');
    spriteGrid.innerHTML = '';
    
    if (!baseSprites || baseSprites.length === 0) return;

    updateCollectionCounter();

    const filteredSprites = filters.applyFilters(baseSprites, filterSettings);
    let spritesToRender = filterSettings.groupTheme ? filters.sortByTheme(filteredSprites) : filteredSprites;

    const obtainedSprites = state.getObtainedSprites();
    const masteredSprites = state.getMasteredSprites();
    const isViewMode = state.getIsViewMode();

    const renderedCards = [];

    spritesToRender.forEach(sprite => {
        const isObtained = obtainedSprites.includes(sprite.id);
        const isMastered = masteredSprites.includes(sprite.id);
        
        const card = document.createElement('div');
        card.dataset.id = sprite.id;
        
        const itemRarity = sprite.rarity || 'Rare';
        const itemTheme = sprite.theme || 'Basic';
        let masteryClass = isMastered ? ' mastered' : '';
        card.className = `sprite-card rarity-${itemRarity} theme-${itemTheme} ${isObtained ? 'obtained' : ''}${masteryClass}`;
        card.innerHTML = buildCardHTML(sprite, isObtained, isMastered);

        if (!isViewMode && isObtained && !isMastered) {
            const crownIcon = card.querySelector('.crown-action-icon');
            if (crownIcon) {
                crownIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    state.toggleMastery(sprite.id);
                    renderGrid(baseSprites, filterSettings);
                });
            }
        }

        if (!isViewMode) {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                state.toggleObtained(sprite.id);
                renderGrid(baseSprites, filterSettings);
            });
        }
        
        renderedCards.push(card);
    });

    if (renderedCards.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-title">NO SPRITES MATCH THESE FILTERS</div>
            <p>Try clearing the filters or widening your search.</p>
        `;
        spriteGrid.appendChild(emptyState);
    } else {
        renderedCards.forEach(card => spriteGrid.appendChild(card));
    }

    adjustCardFontSizes();
}
