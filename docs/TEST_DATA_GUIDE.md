# 🧪 Test Data Guide - FactoryMaster

Complete guide for creating and managing test data in FactoryMaster.

---

## 📋 Overview

FactoryMaster includes several scripts to populate the database with realistic test data for development and demonstration purposes.

---

## 🚀 Quick Start

### Prerequisites
```bash
# Make sure you're in the project directory
cd FactoryMaster

# Database should be set up (migrations run)
npx prisma migrate deploy
```

### Create All Test Data (Recommended Order)

```bash
# 1. Create Admin User
node prisma/create-admin.js

# 2. Create Large-Scale BOM (Recommended)
node prisma/create-large-bom.js
```

That's it! You now have a fully populated database with 100+ parts in a realistic hierarchy.

---

## 📊 Available Scripts

### 1. create-admin.js
**Purpose:** Create the default admin user

**What it creates:**
- 1 Admin user

**Credentials:**
```
Email:    admin@factory.com
Password: admin123
Role:     ADMIN
```

**When to use:**
- Fresh database setup
- After database reset
- When admin user is deleted

**Run:**
```bash
node prisma/create-admin.js
```

---

### 2. create-large-bom.js ⭐ RECOMMENDED
**Purpose:** Create a complete, realistic manufacturing BOM hierarchy

**What it creates:**
- **1 Product:** Industrial CNC Machine Model X500
- **12 Assemblies:** Major machine assemblies
- **60-96 Components:** Various components
- **10 Raw Materials:** Manufacturing materials
- **Total:** 100-120+ parts
- **BOM Links:** 200-250+ relationships

**Hierarchy:**
```
Product (1)
└── Assemblies (12)
    └── Components (5-8 each)
        └── Raw Materials (2-4 each)
```

**When to use:**
- Demonstrating BOM tree functionality
- Realistic data presentation
- Testing with large datasets
- Client demos

**Run:**
```bash
node prisma/create-large-bom.js
```

**⚠️ Warning:** This script clears existing parts and BOM data!

---

### 3. create-test-data.js
**Purpose:** Create basic test data for general development

**What it creates:**
- 8 Parts (mixed types)
- ~24 Production Orders (last 6 months)

**When to use:**
- Quick testing
- When you don't need large BOM
- Dashboard chart testing

**Run:**
```bash
node prisma/create-test-data.js
```

---

### 4. create-bom-data.js
**Purpose:** Add BOM relationships to existing parts

**What it creates:**
- BOM links between existing parts

**When to use:**
- After create-test-data.js
- When parts exist but BOM is missing

**Run:**
```bash
node prisma/create-bom-data.js
```

---

### 5. update-admin.js
**Purpose:** Update existing user to ADMIN role with specific password

**What it does:**
- Finds or creates engineer@factory.com
- Sets role to ADMIN
- Sets password to Tahir123

**When to use:**
- Updating user permissions
- Changing admin password
- User migration

**Run:**
```bash
node prisma/update-admin.js
```

---

## 🌳 BOM Hierarchy Details

### Large BOM Structure
The `create-large-bom.js` script creates a realistic CNC machine structure:

**Level 1: Product**
```
Industrial CNC Machine Model X500
├─ Part Number: PROD-MAIN-001
├─ Type: PRODUCT
└─ Stock: 5 units
```

**Level 2: Assemblies (12 total)**
```
1.  Base Frame Assembly (ASSY-001)
2.  Spindle Head Assembly (ASSY-002)
3.  Tool Changer Assembly (ASSY-003)
4.  X-Axis Linear Guide Assembly (ASSY-004)
5.  Y-Axis Linear Guide Assembly (ASSY-005)
6.  Z-Axis Linear Guide Assembly (ASSY-006)
7.  Control Cabinet Assembly (ASSY-007)
8.  Coolant System Assembly (ASSY-008)
9.  Chip Conveyor Assembly (ASSY-009)
10. Electrical Panel Assembly (ASSY-010)
11. Hydraulic System Assembly (ASSY-011)
12. Lubrication System Assembly (ASSY-012)
```

**Level 3: Components (5-8 per assembly)**
```
Types include:
- Bearings
- Motors
- Gears
- Shafts
- Couplings
- Sensors
- Valves
- Pumps
- Cylinders
- Actuators
- Encoders
- Relays
- Contactors
- Switches
- Cables
- Brackets
- Mounts
- Plates
- Covers
- Housings
- Seals
- Gaskets
- O-Rings
- Bushings
- Spacers
```

**Level 4: Raw Materials (10 types)**
```
1. Steel Sheet - Grade A (kg)
2. Aluminum Plate - Grade B (kg)
3. Stainless Steel Rod - Grade C (kg)
4. Brass Bar - Grade D (kg)
5. Copper Wire - Grade E (m)
6. Plastic Sheet - Grade F (kg)
7. Rubber Sheet - Grade G (kg)
8. Bronze Bushing Stock - Grade H (kg)
9. Carbon Steel Round - Grade I (kg)
10. Cast Iron Block - Grade J (kg)
```

---

## 🎯 Use Cases

### For Demonstrations
```bash
# Best for client demos
node prisma/create-large-bom.js
```
**Shows:**
- Complex BOM tree
- Realistic manufacturing data
- Professional part naming
- Multi-level hierarchy

### For Development
```bash
# Quick test data
node prisma/create-test-data.js
```
**Good for:**
- Fast iteration
- Testing features
- Quick database population

### For BOM Feature Testing
```bash
# Comprehensive BOM
node prisma/create-large-bom.js
```
**Tests:**
- Tree rendering with 100+ nodes
- Deep hierarchy (4 levels)
- Large dataset performance
- Expand/collapse functionality

---

## 🔄 Resetting Data

### Clear All Data
```bash
# Option 1: Delete database and recreate
rm prisma/dev.db
npx prisma migrate deploy
node prisma/create-admin.js
node prisma/create-large-bom.js

# Option 2: Use large BOM script (auto-clears)
node prisma/create-large-bom.js
```

### Clear Specific Data
```bash
# Clear only BOM relationships
npx prisma studio
# Navigate to BOMItem → Delete all
```

---

## 📊 Data Statistics

### After create-large-bom.js

**Database Counts:**
```
Total Parts:       100-120
  Products:        1
  Assemblies:      12
  Components:      60-96
  Raw Materials:   10

Total BOM Links:   200-250
Hierarchy Depth:   4 levels
```

**Memory Impact:**
```
Database Size:     ~2-5 MB
Load Time:         ~1-2 seconds
Tree Render:       ~500ms
```

---

## 🧪 Testing Scenarios

### Scenario 1: BOM Tree Visualization
```bash
node prisma/create-large-bom.js
```
1. Login to app
2. Go to Inventory
3. Find "Industrial CNC Machine Model X500"
4. Click → Part Details → BOM Tab
5. See full 4-level hierarchy

### Scenario 2: Dashboard Charts
```bash
node prisma/create-test-data.js
```
1. Login to app
2. Go to Dashboard
3. See charts with last 6 months data
4. Check production trends
5. View inventory distribution

### Scenario 3: Search & Export
```bash
node prisma/create-large-bom.js
```
1. Login to app
2. Use Global Search (Ctrl+F)
3. Search "bearing" → Find multiple
4. Go to Inventory → Export to Excel
5. Verify 100+ rows

---

## ⚠️ Important Notes

1. **Data Persistence:** All scripts create real database entries
2. **Large BOM:** Auto-clears existing data - use with caution
3. **Admin User:** Always create first
4. **Performance:** 100+ parts may take 5-10 seconds to load in tree
5. **Unique Constraints:** Scripts handle duplicate prevention

---

## 🎨 Customization

### Modify Part Counts
Edit `create-large-bom.js`:
```javascript
// Line ~50: Change assembly count
const assemblyNames = [
    'Base Frame Assembly',
    'Spindle Head Assembly',
    // Add more here
]

// Line ~75: Change components per assembly
const compCount = 5 + Math.floor(Math.random() * 4) // 5-8
// Change to: 
const compCount = 10 + Math.floor(Math.random() * 6) // 10-15
```

### Add More Raw Materials
Edit `create-large-bom.js`:
```javascript
// Line ~130: Add more materials
const rawMaterialTypes = [
    { name: 'Steel Sheet', unit: 'kg' },
    { name: 'Your Material', unit: 'kg' },
    // Add more here
]
```

---

## 🚀 Production Notes

**DO NOT use test data scripts in production!**

For production:
1. Import real data from CSV/Excel
2. Use API integrations
3. Manual data entry by users
4. Database backup/restore

---

## 📞 Support

If test data doesn't generate correctly:
1. Check database connection
2. Verify Prisma schema is up to date
3. Run `npx prisma generate`
4. Check console for errors
5. Try database reset

---

**Happy Testing!** 🧪✨
