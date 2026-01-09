const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('📦 Adding test data...')

    const company = await prisma.company.findFirst({ where: { isDefault: true } })
    const admin = await prisma.user.findFirst({ where: { email: 'admin@factory.com' } })

    if (!company || !admin) {
        console.error('❌ Please run seed first!')
        return
    }

    console.log('Using company:', company.name)

    //  Clean existing test data
    console.log('Cleaning existing data...')
    await prisma.inventoryTransaction.deleteMany({ where: { companyId: company.id } })
    await prisma.productionOrder.deleteMany({ where: { companyId: company.id } })
    await prisma.supplierPart.deleteMany({})
    await prisma.supplier.deleteMany({ where: { companyId: company.id } })
    await prisma.part.deleteMany({ where: { companyId: company.id } })
    console.log('✅ Cleaned')

    // Add Parts one by one
    console.log('Adding parts...')
    const parts = []

    const partData = [
        { partNumber: 'RM-001', name: 'Çelik Levha A36', description: 'Yapısal çelik levha', type: 'RAW_MATERIAL', materialType: 'Çelik', stockQuantity: 150, unit: 'KG', reorderLevel: 50 },
        { partNumber: 'RM-002', name: 'Alüminyum Çubuk 6061', description: 'Yüksek mukavemetli alüminyum', type: 'RAW_MATERIAL', materialType: 'Alüminyum', stockQuantity: 80, unit: 'METER', reorderLevel: 30 },
        { partNumber: 'CMP-001', name: 'M8 Cıvata', description: 'Paslanmaz çelik cıvata', type: 'COMPONENT', materialType: 'Çelik', stockQuantity: 5000, unit: 'ADET', reorderLevel: 1000 },
        { partNumber: 'CMP-002', name: 'Rulman 6205', description: 'Bilyalı rulman', type: 'COMPONENT', materialType: 'Çelik', stockQuantity: 120, unit: 'ADET', reorderLevel: 50 },
        { partNumber: 'ASM-001', name: 'Dişli Grubu GA-100', description: 'Komple dişli grubu', type: 'ASSEMBLY', materialType: 'Çelik', stockQuantity: 45, unit: 'ADET', reorderLevel: 20 },
        { partNumber: 'ASM-002', name: 'Motor Montaj Grubu', description: 'Motor montaj braketi', type: 'ASSEMBLY', materialType: 'Alüminyum', stockQuantity: 30, unit: 'ADET', reorderLevel: 15 },
        { partNumber: 'PRD-001', name: 'Endustriyel Pompa Model X', description: 'Agir hizmet pompasi', type: 'PRODUCT', materialType: 'Karma', stockQuantity: 8, unit: 'ADET', reorderLevel: 12 },
        { partNumber: 'PRD-002', name: 'Tasiyici Bant Sistemi', description: 'Otomatik tasiyici bant', type: 'PRODUCT', materialType: 'Karma', stockQuantity: 5, unit: 'ADET', reorderLevel: 8 },
    ]

    for (const data of partData) {
        const part = await prisma.part.create({
            data: { companyId: company.id, ...data }
        })
        parts.push(part)
    }

    console.log(`✅ ${parts.length} parts added`)

    // Add Suppliers
    console.log('Adding suppliers...')
    const suppliers = []
    const supplierData = [
        { name: 'Global Çelik Tedarik', type: 'INTERNATIONAL', contactPerson: 'Mehmet Yılmaz', email: 'info@globalcelik.com', phone: '+90 312 123 4567', address: 'Ankara', status: 'ACTIVE' },
        { name: 'Yerel Bileşenler A.Ş.', type: 'LOCAL', contactPerson: 'Ayşe Kaya', email: 'satis@yerelbilesken.com', phone: '+90 312 456 7890', address: 'İstanbul', status: 'ACTIVE' },
        { name: 'Premium Parça Ltd.', type: 'INTERNATIONAL', contactPerson: 'John Smith', email: 'orders@premiumparts.com', phone: '+49 30 9876 5432', address: 'Berlin', status: 'ACTIVE' },
    ]

    for (const data of supplierData) {
        const supplier = await prisma.supplier.create({
            data: { companyId: company.id, ...data }
        })
        suppliers.push(supplier)
    }

    console.log(`✅ ${suppliers.length} suppliers added`)

    // Add Production Orders
    console.log('Adding production orders...')
    const now = new Date()
    const orders = []

    const orderData = [
        { orderNumber: 'PO-000001', partId: parts[6].id, quantity: 5, status: 'COMPLETED', startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1), targetDate: new Date(now.getFullYear(), now.getMonth() - 2, 15), completionDate: new Date(now.getFullYear(), now.getMonth() - 2, 14), notes: 'Acil sipariş' },
        { orderNumber: 'PO-000002', partId: parts[7].id, quantity: 3, status: 'COMPLETED', startDate: new Date(now.getFullYear(), now.getMonth() - 1, 5), targetDate: new Date(now.getFullYear(), now.getMonth() - 1, 20), completionDate: new Date(now.getFullYear(), now.getMonth() - 1, 18), notes: 'Standart üretim' },
        { orderNumber: 'PO-000003', partId: parts[4].id, quantity: 20, status: 'IN_PROGRESS', startDate: new Date(now.getFullYear(), now.getMonth(), 1), targetDate: new Date(now.getFullYear(), now.getMonth(), 25), notes: 'Normal parti' },
        { orderNumber: 'PO-000004', partId: parts[5].id, quantity: 15, status: 'IN_PROGRESS', startDate: new Date(now.getFullYear(), now.getMonth(), 10), targetDate: new Date(now.getFullYear(), now.getMonth(), 28) },
        { orderNumber: 'PO-000005', partId: parts[6].id, quantity: 8, status: 'PLANNED', startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), targetDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), notes: 'Planlandı' },
    ]

    for (const data of orderData) {
        const order = await prisma.productionOrder.create({
            data: { companyId: company.id, createdById: admin.id, ...data }
        })
        orders.push(order)
    }

    console.log(`✅ ${orders.length} production orders added`)

    console.log('')
    console.log('🎉 Test data added successfully!')
    console.log(`   - ${parts.length} parts`)
    console.log(`   - ${suppliers.length} suppliers`)
    console.log(`   - ${orders.length} production orders`)
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
