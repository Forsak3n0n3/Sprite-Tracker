# Module Documentation

## Overview
The application has been refactored into modular components for better maintainability and extensibility. Each module handles a specific aspect of the application.

## Modules

### `state.js`
**Purpose:** Global state management for sprites and application mode.

**Key Exports:**
- `initializeState(viewMode)` - Initialize app state
- `getObtainedSprites()` - Get array of obtained sprite IDs
- `getMasteredSprites()` - Get array of mastered sprite IDs
- `setObtainedSprites(sprites)` - Update obtained sprites list
- `setMasteredSprites(sprites)` - Update mastered sprites list
- `toggleObtained(id)` - Toggle obtained status for a sprite
- `toggleMastery(id)` - Toggle mastery status for a sprite
- `getStatusFilter()` - Get current status filter (all/obtained/missing)
- `setStatusFilter(filterValue)` - Set status filter
- `getIsViewMode()` - Check if in view/share mode

---

### `storage.js`
**Purpose:** Handle localStorage persistence and JSON import/export.

**Key Exports:**
- `exportCollectionAsJSON()` - Download collection as JSON file
- `importCollectionFromJSON(file)` - Import collection from JSON file (returns Promise)
- `getCollectionStats()` - Get stats (total, obtained, mastered, percentages)
- `saveFilterStates(filters)` - Persist filter settings to localStorage
- `loadFilterStates()` - Load saved filter settings
- `clearAllData()` - Clear all data with confirmation

**JSON Format:**
```json
{
  "obtained": ["water_basic", "water_gold", ...],
  "mastered": ["water_basic", ...],
  "exportDate": "2026-07-05T12:34:56.789Z",
  "version": 1
}
```

---

### `filters.js`
**Purpose:** Filter and sort sprite data.

**Key Exports:**
- `applyFilters(baseSprites, filterSettings)` - Filter sprites by search, theme, status, etc.
- `sortByTheme(sprites)` - Sort sprites by theme order
- `getFilterOptions()` - Get available filter options

**Filter Settings Object:**
```javascript
{
  search: '',              // Search query
  theme: 'all',           // Theme: 'all', 'Basic', 'Gold', etc.
  unreleased: false,      // Show unreleased sprites
  hideMastered: false,    // Hide already mastered sprites
  status: 'all'           // Status: 'all', 'obtained', 'missing'
}
```

---

### `rendering.js`
**Purpose:** Handle UI rendering of sprite grid and cards.

**Key Exports:**
- `renderGrid(baseSprites, filterSettings)` - Render sprite grid with current filters
- `buildCardHTML(sprite, isObtained, isMastered)` - Generate HTML for sprite card
- `updateCollectionCounter()` - Update progress bars
- `adjustCardFontSizes()` - Auto-scale card title text

---

### `export.js`
**Purpose:** Canvas-based image export functionality.

**Key Exports:**
- `exportCanvasImage(mode, baseSprites, filterSettings)` - Export collection as PNG

**Export Modes:**
- `'collected'` - Your collected sprites with progress bars
- `'missing'` - Sprites you're looking for
- `'unmastered'` - Collected but not mastered sprites
- `'mastered'` - Your mastered sprites

---

## Usage Examples

### Exporting Collection as JSON
```javascript
import * as storage from './modules/storage.js';

// User clicks Export button
storage.exportCollectionAsJSON();
```

### Importing Collection from JSON
```javascript
import * as storage from './modules/storage.js';

const file = event.target.files[0];
storage.importCollectionFromJSON(file)
  .then(result => {
    console.log(`Imported ${result.obtained} obtained, ${result.mastered} mastered`);
  })
  .catch(error => console.error(error));
```

### Filtering and Rendering
```javascript
import * as rendering from './modules/rendering.js';
import * as filters from './modules/filters.js';

const filterSettings = {
  search: 'water',
  theme: 'Gold',
  unreleased: false,
  hideMastered: false,
  status: 'obtained'
};

rendering.renderGrid(baseSprites, filterSettings);
```

### Getting Collection Statistics
```javascript
import * as storage from './modules/storage.js';

const stats = storage.getCollectionStats();
console.log(`${stats.obtained}/${stats.total} sprites (${stats.obtainedPercentage.toFixed(1)}%)`);
```

---

## Migration from Old Code

The old `app.js` logic has been split:
- **DOM Setup & Event Listeners** → `app-new.js`
- **State Management** → `state.js`
- **Persistence** → `storage.js`
- **Filtering Logic** → `filters.js`
- **Rendering** → `rendering.js`
- **Canvas Export** → `export.js`

To use the new modular app, include `app-new.js` with `type="module"`:
```html
<script src="app-new.js" type="module" defer></script>
```

---

## Adding New Features

### Example: Add a sorting option
1. Add sorting function to `filters.js`
2. Update filter settings object to include sort option
3. Call sort before `renderGrid()` in `app-new.js`
4. Add UI control for the new sort option

### Example: Add new export mode
1. Add mode case to `exportCanvasImage()` in `export.js`
2. Add button to `index.html`
3. Add click handler in `app-new.js`

---

## Benefits

- **Separation of Concerns**: Each module has a single responsibility
- **Reusability**: Modules can be used in other projects
- **Testability**: Easier to unit test isolated functions
- **Maintainability**: Changes are localized to specific modules
- **Scalability**: Easy to add new features without cluttering main app
