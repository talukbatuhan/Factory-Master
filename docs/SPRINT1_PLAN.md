# Sprint 1: Core Experience Enhancement

## Overview
**Duration:** 2 weeks  
**Priority:** HIGH  
**Goal:** Complete translation coverage, add dashboard analytics, persist user preferences, implement keyboard shortcuts

---

## Phase 1.1: Complete Translation Coverage

### Remaining Pages to Translate

#### Inventory Module
**Files:**
- [`InventoryList.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Inventory/InventoryList.jsx)
- [`PartForm.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Inventory/PartForm.jsx)
- [`PartDetails.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Inventory/PartDetails.jsx)

**Tasks:**
- Add `useTranslation` hook
- Translate table headers, form labels, buttons
- Translate validation messages
- Translate empty states and tooltips

#### BOM Module
**Files:**
- [`BOMTree.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/BOM/BOMTree.jsx)

**Tasks:**
- Translate tree view labels
- Translate action buttons
- Translate tooltips

#### Production Module
**Files:**
- [`ProductionOrders.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Production/ProductionOrders.jsx)
- [`OrderDetails.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Production/OrderDetails.jsx)

**Tasks:**
- Translate order list headers
- Translate status badges
- Translate timeline labels

#### Suppliers Module
**Files:**
- [`SupplierList.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Suppliers/SupplierList.jsx)
- [`SupplierDetails.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Suppliers/SupplierDetails.jsx)

**Tasks:**
- Translate table headers
- Translate contact information labels
- Translate action buttons

#### Settings & Reports
**Files:**
- [`UserManagement.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Settings/UserManagement.jsx)
- [`Profile.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Settings/Profile.jsx)
- [`SystemSettings.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Settings/SystemSettings.jsx)
- [`Processes.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Processes/Processes.jsx)
- [`Reports.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Reports/Reports.jsx)

### Language Persistence
**File:** [`SettingsContext.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/context/SettingsContext.jsx) (new)

**Implementation:**
```javascript
// Create SettingsContext to persist user preferences
- Save language to localStorage
- Load on app start
- Sync with i18n

// Also save to user profile in database for multi-device sync
```

### Date Localization
**File:** [`i18n/config.js`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/i18n/config.js)

**Tasks:**
- Import date-fns locales (tr, en)
- Create date formatting utility
- Apply to all date displays

---

## Phase 1.2: Dashboard Analytics & Visualization

### Install Dependencies
```bash
npm install recharts
```

### Chart Components to Create

#### 1. Production Trend Chart
**File:** `src/renderer/components/charts/ProductionTrendChart.jsx` (new)

**Features:**
- Line chart showing production over time
- Last 30 days data
- Planned vs Completed comparison
- Interactive tooltips

#### 2. Inventory Level Chart
**File:** `src/renderer/components/charts/InventoryLevelChart.jsx` (new)

**Features:**
- Bar chart showing stock levels by category
- Color coding (green: good, yellow: low, red: out of stock)
- Click to drill down

#### 3. Monthly Comparison Chart
**File:** `src/renderer/components/charts/MonthlyComparisonChart.jsx` (new)

**Features:**
- Bar chart comparing this month vs last month
- Orders, production, costs
- Percentage change indicators

#### 4. Supplier Performance Chart
**File:** `src/renderer/components/charts/SupplierPerformanceChart.jsx` (new)

**Features:**
- Pie chart or horizontal bar
- On-time delivery rate
- Top 5 suppliers

### Database Queries
**File:** `src/main/ipc/dashboard.js`

**New Endpoints:**
- `dashboard:getProductionTrend` - Last 30 days production data
- `dashboard:getInventoryLevels` - Stock levels by category
- `dashboard:getMonthlyComparison` - Current vs previous month
- `dashboard:getSupplierPerformance` - Supplier metrics

### Update Dashboard
**File:** [`Dashboard.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Dashboard.jsx)

**Changes:**
- Add chart section below KPI cards
- 2x2 grid layout for 4 charts
- Add loading states
- Add error handling
- Add refresh button

---

## Phase 1.3: Theme Persistence & Options

### Update ThemeContext
**File:** [`ThemeContext.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/context/ThemeContext.jsx)

**Enhancements:**
- Save theme to localStorage
- Add `auto` mode (follow system)
- Add custom color themes

**Theme Options:**
- `light` - Light mode
- `dark` - Dark mode (current)
- `auto` - Follow system preference
- `blue` - Blue accent theme
- `green` - Green accent theme
- `purple` - Purple accent theme

### CSS Variables
**File:** [`globals.css`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/styles/globals.css)

**Add theme variants:**
```css
[data-theme="blue"] { --primary: ...blue colors... }
[data-theme="green"] { --primary: ...green colors... }
[data-theme="purple"] { --primary: ...purple colors... }
```

### Settings UI
**File:** [`SystemSettings.jsx`](file:///c:/Users/taluc/Desktop/FF15/FactoryMaster/src/renderer/pages/Settings/SystemSettings.jsx)

**Add:**
- Theme selector (Light/Dark/Auto)
- Color scheme selector (Default/Blue/Green/Purple)
- Preview cards

---

## Phase 1.4: Keyboard Shortcuts

### Global Shortcut Handler
**File:** `src/renderer/hooks/useKeyboardShortcuts.js` (new)

**Implementation:**
```javascript
// Custom hook to register keyboard shortcuts
// Handle Ctrl+S, Ctrl+F, Ctrl+N, Ctrl+K, Esc, etc.
// Show shortcut help dialog
```

### Shortcuts to Implement

**Global:**
- `Ctrl+K` or `?` - Show keyboard shortcuts help
- `Ctrl+/` - Toggle sidebar
- `Esc` - Close modal/dialog

**Navigation:**
- `Ctrl+H` - Go to Dashboard
- `Ctrl+I` - Go to Inventory
- `Ctrl+P` - Go to Production
- `Ctrl+S` - Save (when in form)

**Actions:**
- `Ctrl+N` - New record (context-aware)
- `Ctrl+F` - Focus search
- `Ctrl+R` - Refresh data

### Shortcuts Help Dialog
**File:** `src/renderer/components/ShortcutsHelpDialog.jsx` (new)

**Features:**
- Modal showing all available shortcuts
- Organized by category
- Search within shortcuts
- Visual keyboard key styling

### User Preferences
**Allow users to:**
- Enable/disable shortcuts
- Customize key bindings (advanced)

---

## Implementation Order

### Week 1: Translations & Persistence
**Days 1-2:** Complete Inventory module translations  
**Days 3-4:** Complete Production, Suppliers, BOM translations  
**Day 5:** Complete Settings, Reports, Processes translations  
**Days 6-7:** Implement language/theme persistence + date localization

### Week 2: Charts & Shortcuts
**Days 1-3:** Implement all 4 dashboard charts with backend queries  
**Days 4-5:** Implement keyboard shortcuts system  
**Days 6-7:** Testing, bug fixes, polish

---

## Verification Plan

### Translation Testing
- [ ] Switch language on every page
- [ ] Verify no missing keys
- [ ] Check Turkish characters display correctly
- [ ] Test with long translations (layout doesn't break)

### Charts Testing
- [ ] Verify data loads correctly
- [ ] Test with empty data (show empty state)
- [ ] Test tooltips and interactions
- [ ] Check responsive behavior

### Persistence Testing
- [ ] Close app, reopen → theme/language preserved
- [ ] Switch user → preferences per user
- [ ] Clear localStorage → fallback to defaults

### Shortcuts Testing
- [ ] Test all shortcuts work
- [ ] Test shortcut help dialog opens
- [ ] Test shortcuts don't conflict
- [ ] Test on forms (Ctrl+S saves)

---

## Success Criteria

✅ **100% Translation Coverage** - All pages in EN/TR  
✅ **4 Interactive Charts** - On dashboard with real data  
✅ **Persistent Preferences** - Theme & language saved  
✅ **15+ Keyboard Shortcuts** - Fully functional  
✅ **No Breaking Changes** - All existing features work  
✅ **Performance** - Dashboard loads in < 2s with charts

---

## Ready to Start?

This is a detailed plan for Sprint 1. Shall I begin implementation with Phase 1.1 (completing translations)?
