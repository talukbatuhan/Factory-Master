const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
    console.log('🌱 Creating test data...\n')

    try {
        // 1. Create Parts (Different types for inventory chart)
        console.log('📦 Creating parts...')
        const parts = await Promise.all([
            // Products
            prisma.part.create({
                data: {
                    partNumber: 'PROD-001',
                    name: 'Steel Frame Assembly',
                    type: 'PRODUCT',
                    stockQuantity: 45,
                    reorderLevel: 20,
                    unit: 'pcs'
                }
            }),
            prisma.part.create({
                data: {
                    partNumber: 'PROD-002',
                    name: 'Aluminum Housing',
                    type: 'PRODUCT',
                    stockQuantity: 32,
                    reorderLevel: 15,
                    unit: 'pcs'
                }
            }),
            // Components
            prisma.part.create({
                data: {
                    partNumber: 'COMP-001',
                    name: 'Bearing Unit',
                    type: 'COMPONENT',
                    stockQuantity: 150,
                    reorderLevel: 50,
                    unit: 'pcs'
                }
            }),
            prisma.part.create({
                data: {
                    partNumber: 'COMP-002',
                    name: 'Motor Assembly',
                    type: 'COMPONENT',
                    stockQuantity: 75,
                    reorderLevel: 30,
                    unit: 'pcs'
                }
            }),
            prisma.part.create({
                data: {
                    partNumber: 'COMP-003',
                    name: 'Control Panel',
                    type: 'COMPONENT',
                    stockQuantity: 60,
                    reorderLevel: 25,
                    unit: 'pcs'
                }
            }),
            // Raw Materials
            prisma.part.create({
                data: {
                    partNumber: 'RAW-001',
                    name: 'Steel Sheet 2mm',
                    type: 'RAW_MATERIAL',
                    stockQuantity: 500,
                    reorderLevel: 200,
                    unit: 'kg'
                }
            }),
            prisma.part.create({
                data: {
                    partNumber: 'RAW-002',
                    name: 'Aluminum Rod 50mm',
                    type: 'RAW_MATERIAL',
                    stockQuantity: 300,
                    reorderLevel: 100,
                    unit: 'kg'
                }
            }),
            // Assembly
            prisma.part.create({
                data: {
                    partNumber: 'ASSY-001',
                    name: 'Main Assembly Unit',
                    type: 'ASSEMBLY',
                    stockQuantity: 25,
                    reorderLevel: 10,
                    unit: 'pcs'
                }
            }),
        ])
        console.log(`✅ Created ${parts.length} parts\n`)

        // 2. Create Production Orders (For production trend chart)
        console.log('🏭 Creating production orders...')

        // Get current date and go back 6 months
        const now = new Date()
        const orders = []

        // Create orders for last 6 months
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 15)

            // 3-5 orders per month with different statuses
            const monthOrderCount = 3 + Math.floor(Math.random() * 3)

            for (let j = 0; j < monthOrderCount; j++) {
                const randomPart = parts[Math.floor(Math.random() * parts.length)]
                const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED']
                const status = i === 0 ? statuses[Math.floor(Math.random() * 2)] : 'COMPLETED' // Current month mixed, others completed

                orders.push(
                    prisma.productionOrder.create({
                        data: {
                            orderNumber: `PO-${now.getFullYear()}${String(now.getMonth() - i + 1).padStart(2, '0')}-${String(j + 1).padStart(3, '0')}`,
                            partId: randomPart.id,
                            quantity: 10 + Math.floor(Math.random() * 40),
                            status: status,
                            targetDate: new Date(monthDate.getTime() + 10 * 24 * 60 * 60 * 1000),
                            createdAt: monthDate,
                        }
                    })
                )
            }
        }

        await Promise.all(orders)
        console.log(`✅ Created ${orders.length} production orders\n`)

        // 3. Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ Test data created successfully!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('\n📊 Summary:')
        console.log(`   Parts: ${parts.length}`)
        console.log(`   - PRODUCT: 2`)
        console.log(`   - COMPONENT: 3`)
        console.log(`   - RAW_MATERIAL: 2`)
        console.log(`   - ASSEMBLY: 1`)
        console.log(`   Production Orders: ${orders.length}`)
        console.log('\n🚀 Now refresh your dashboard to see real data in charts!')

    } catch (error) {
        console.error('❌ Error creating test data:', error)
        throw error
    }
}

createTestData()
    .catch((e) => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
