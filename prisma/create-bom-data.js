const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createBOMTestData() {
    console.log('🌳 Creating BOM Tree test data...\n')

    try {
        // Get existing parts
        const parts = await prisma.part.findMany()

        if (parts.length === 0) {
            console.log('❌ No parts found! Please run create-test-data.js first')
            return
        }

        console.log(`📦 Found ${parts.length} parts\n`)

        // Find specific part types
        const assembly = parts.find(p => p.type === 'ASSEMBLY')
        const products = parts.filter(p => p.type === 'PRODUCT')
        const components = parts.filter(p => p.type === 'COMPONENT')
        const rawMaterials = parts.filter(p => p.type === 'RAW_MATERIAL')

        const bomItems = []

        // 1. ASSEMBLY → Components (Main Assembly needs components)
        if (assembly && components.length > 0) {
            console.log('🔧 Creating Assembly BOM...')
            components.forEach((comp, idx) => {
                bomItems.push(
                    prisma.bOMItem.create({
                        data: {
                            partId: assembly.id, // Changed from parentPartId
                            componentPartId: comp.id,
                            quantity: 1 + idx, // 1, 2, 3 pieces
                            unit: comp.unit
                        }
                    })
                )
            })
        }

        // 2. PRODUCTS → Components + Raw Materials
        if (products.length > 0) {
            console.log('🏭 Creating Product BOMs...')
            products.forEach((product, pidx) => {
                // Each product uses 2-3 components
                const compCount = 2 + (pidx % 2)
                for (let i = 0; i < compCount && i < components.length; i++) {
                    bomItems.push(
                        prisma.bOMItem.create({
                            data: {
                                partId: product.id, // Changed from parentPartId
                                componentPartId: components[i].id,
                                quantity: 2 + i,
                                unit: components[i].unit
                            }
                        })
                    )
                }

                // Each product also uses 1-2 raw materials
                const rawCount = 1 + (pidx % 2)
                for (let i = 0; i < rawCount && i < rawMaterials.length; i++) {
                    bomItems.push(
                        prisma.bOMItem.create({
                            data: {
                                partId: product.id, // Changed from parentPartId
                                componentPartId: rawMaterials[i].id,
                                quantity: 5 + (i * 3), // 5, 8, 11... kg
                                unit: rawMaterials[i].unit
                            }
                        })
                    )
                }
            })
        }

        // 3. COMPONENTS → Raw Materials  
        if (components.length > 0 && rawMaterials.length > 0) {
            console.log('⚙️ Creating Component BOMs...')
            components.forEach((comp, cidx) => {
                // Each component uses 1-2 raw materials
                const rawCount = 1 + (cidx % 2)
                for (let i = 0; i < rawCount && i < rawMaterials.length; i++) {
                    bomItems.push(
                        prisma.bOMItem.create({
                            data: {
                                partId: comp.id, // Changed from parentPartId
                                componentPartId: rawMaterials[i].id,
                                quantity: 2 + (i * 2), // 2, 4, 6... kg
                                unit: rawMaterials[i].unit
                            }
                        })
                    )
                }
            })
        }

        await Promise.all(bomItems)

        console.log(`\n✅ Created ${bomItems.length} BOM relationships\n`)

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ BOM Tree data created!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('\n🌳 BOM Structure:')
        console.log(`   Assembly (1) → Components (${components.length})`)
        console.log(`   Products (${products.length}) → Components + Raw Materials`)
        console.log(`   Components (${components.length}) → Raw Materials`)
        console.log(`\n   Total BOM Items: ${bomItems.length}`)
        console.log('\n🚀 Go to BOM page to see the tree!')

    } catch (error) {
        console.error('❌ Error creating BOM data:', error)
        throw error
    }
}

createBOMTestData()
    .catch((e) => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
