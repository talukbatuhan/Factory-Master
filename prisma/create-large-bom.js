const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createLargeBOMData() {
    console.log('🏭 Creating Large-Scale BOM Test Data...\n')
    console.log('This will create a realistic manufacturing hierarchy:\n')
    console.log('1 PRODUCT → Multiple ASSEMBLIES → Components → Raw Materials\n')

    try {
        // Clear existing data
        console.log('🧹 Clearing existing data...')
        await prisma.bOMItem.deleteMany({})
        await prisma.productionOrder.deleteMany({})
        await prisma.part.deleteMany({})
        console.log('✅ Database cleared\n')

        const allParts = []
        const bomItems = []

        // ==========================================
        // 1. CREATE MAIN PRODUCT
        // ==========================================
        console.log('🎯 Creating Main Product...')
        const mainProduct = await prisma.part.create({
            data: {
                partNumber: 'PROD-MAIN-001',
                name: 'Industrial CNC Machine Model X500',
                type: 'PRODUCT',
                description: 'Complete CNC milling machine with automated tool changer',
                stockQuantity: 5,
                reorderLevel: 2,
                unit: 'pcs'
            }
        })
        allParts.push(mainProduct)
        console.log(`✅ Product: ${mainProduct.name}\n`)

        // ==========================================
        // 2. CREATE ASSEMBLIES (Under Main Product)
        // ==========================================
        console.log('🔧 Creating Assemblies...')
        const assemblyNames = [
            'Base Frame Assembly',
            'Spindle Head Assembly',
            'Tool Changer Assembly',
            'X-Axis Linear Guide Assembly',
            'Y-Axis Linear Guide Assembly',
            'Z-Axis Linear Guide Assembly',
            'Control Cabinet Assembly',
            'Coolant System Assembly',
            'Chip Conveyor Assembly',
            'Electrical Panel Assembly',
            'Hydraulic System Assembly',
            'Lubrication System Assembly'
        ]

        const assemblies = []
        for (let i = 0; i < assemblyNames.length; i++) {
            const assembly = await prisma.part.create({
                data: {
                    partNumber: `ASSY-${String(i + 1).padStart(3, '0')}`,
                    name: assemblyNames[i],
                    type: 'ASSEMBLY',
                    description: `Complete ${assemblyNames[i].toLowerCase()} with all components`,
                    stockQuantity: 8 + i,
                    reorderLevel: 3,
                    unit: 'pcs'
                }
            })
            assemblies.push(assembly)
            allParts.push(assembly)

            // Link Assembly to Main Product
            bomItems.push({
                partId: mainProduct.id,
                componentPartId: assembly.id,
                quantity: 1,
                unit: 'pcs'
            })
        }
        console.log(`✅ Created ${assemblies.length} assemblies\n`)

        // ==========================================
        // 3. CREATE COMPONENTS (Under Each Assembly)
        // ==========================================
        console.log('⚙️  Creating Components...')
        const componentTypes = [
            'Bearing', 'Motor', 'Gear', 'Shaft', 'Coupling',
            'Sensor', 'Valve', 'Pump', 'Cylinder', 'Actuator',
            'Encoder', 'Relay', 'Contactor', 'Switch', 'Cable',
            'Bracket', 'Mount', 'Plate', 'Cover', 'Housing',
            'Seal', 'Gasket', 'O-Ring', 'Bushing', 'Spacer'
        ]

        const components = []
        let componentCounter = 1

        for (const assembly of assemblies) {
            // Each assembly has 5-8 components
            const compCount = 5 + Math.floor(Math.random() * 4)

            for (let i = 0; i < compCount; i++) {
                const compType = componentTypes[Math.floor(Math.random() * componentTypes.length)]
                const component = await prisma.part.create({
                    data: {
                        partNumber: `COMP-${String(componentCounter).padStart(4, '0')}`,
                        name: `${compType} - Type ${String.fromCharCode(65 + (componentCounter % 26))}`,
                        type: 'COMPONENT',
                        description: `Precision ${compType.toLowerCase()} for ${assembly.name}`,
                        stockQuantity: 50 + Math.floor(Math.random() * 200),
                        reorderLevel: 20 + Math.floor(Math.random() * 30),
                        unit: 'pcs'
                    }
                })
                components.push(component)
                allParts.push(component)
                componentCounter++

                // Link Component to Assembly
                bomItems.push({
                    partId: assembly.id,
                    componentPartId: component.id,
                    quantity: 1 + Math.floor(Math.random() * 4),
                    unit: 'pcs'
                })
            }
        }
        console.log(`✅ Created ${components.length} components\n`)

        // ==========================================
        // 4. CREATE RAW MATERIALS (Under Components)
        // ==========================================
        console.log('📦 Creating Raw Materials...')
        const rawMaterialTypes = [
            { name: 'Steel Sheet', unit: 'kg' },
            { name: 'Aluminum Plate', unit: 'kg' },
            { name: 'Stainless Steel Rod', unit: 'kg' },
            { name: 'Brass Bar', unit: 'kg' },
            { name: 'Copper Wire', unit: 'm' },
            { name: 'Plastic Sheet', unit: 'kg' },
            { name: 'Rubber Sheet', unit: 'kg' },
            { name: 'Bronze Bushing Stock', unit: 'kg' },
            { name: 'Carbon Steel Round', unit: 'kg' },
            { name: 'Cast Iron Block', unit: 'kg' }
        ]

        const rawMaterials = []
        for (let i = 0; i < rawMaterialTypes.length; i++) {
            const rmType = rawMaterialTypes[i]
            const rawMaterial = await prisma.part.create({
                data: {
                    partNumber: `RAW-${String(i + 1).padStart(3, '0')}`,
                    name: `${rmType.name} - Grade ${String.fromCharCode(65 + i)}`,
                    type: 'RAW_MATERIAL',
                    description: `High quality ${rmType.name.toLowerCase()} for manufacturing`,
                    stockQuantity: 500 + Math.floor(Math.random() * 1500),
                    reorderLevel: 200 + Math.floor(Math.random() * 300),
                    unit: rmType.unit
                }
            })
            rawMaterials.push(rawMaterial)
            allParts.push(rawMaterial)
        }
        console.log(`✅ Created ${rawMaterials.length} raw materials\n`)

        // Link Raw Materials to Components (each component uses 2-4 raw materials)
        for (const component of components) {
            const rmCount = 2 + Math.floor(Math.random() * 3)
            const usedRMs = new Set()

            for (let i = 0; i < rmCount; i++) {
                let rm = rawMaterials[Math.floor(Math.random() * rawMaterials.length)]
                // Avoid duplicates
                while (usedRMs.has(rm.id)) {
                    rm = rawMaterials[Math.floor(Math.random() * rawMaterials.length)]
                }
                usedRMs.add(rm.id)

                bomItems.push({
                    partId: component.id,
                    componentPartId: rm.id,
                    quantity: 0.5 + Math.random() * 5,
                    unit: rm.unit
                })
            }
        }

        // ==========================================
        // 5. CREATE ALL BOM ITEMS IN DATABASE
        // ==========================================
        console.log('🔗 Creating BOM relationships...')
        await prisma.bOMItem.createMany({
            data: bomItems
        })
        console.log(`✅ Created ${bomItems.length} BOM relationships\n`)

        // ==========================================
        // FINAL SUMMARY
        // ==========================================
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ LARGE-SCALE BOM DATA CREATED SUCCESSFULLY!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        console.log('📊 STATISTICS:\n')
        console.log(`   Total Parts: ${allParts.length}`)
        console.log(`   ├─ 🎯 Products: 1`)
        console.log(`   ├─ 🔧 Assemblies: ${assemblies.length}`)
        console.log(`   ├─ ⚙️  Components: ${components.length}`)
        console.log(`   └─ 📦 Raw Materials: ${rawMaterials.length}`)
        console.log(`\n   Total BOM Links: ${bomItems.length}\n`)
        console.log('🌳 HIERARCHY:\n')
        console.log('   Industrial CNC Machine X500 (PRODUCT)')
        console.log('   ├─ Base Frame Assembly')
        console.log('   ├─ Spindle Head Assembly')
        console.log('   ├─ Tool Changer Assembly')
        console.log('   ├─ X/Y/Z-Axis Assemblies')
        console.log('   ├─ Control Systems')
        console.log('   └─ ... (12 assemblies total)')
        console.log('       └─ Each with 5-8 components')
        console.log('           └─ Each using 2-4 raw materials\n')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        console.log('🚀 GO TO BOM PAGE AND SEE THE BEAUTIFUL TREE!\n')
        console.log('   Navigate: Inventory → Industrial CNC Machine → BOM Tab')
        console.log('   Or: BOM Page → View Full Tree')
        console.log('\n✨ Enjoy your realistic manufacturing BOM!\n')

    } catch (error) {
        console.error('❌ Error creating BOM data:', error)
        throw error
    }
}

createLargeBOMData()
    .catch((e) => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
