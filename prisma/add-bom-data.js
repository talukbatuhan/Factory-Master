const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🌲 Adding BOM Tree test data...')

    const company = await prisma.company.findFirst({ where: { isDefault: true } })

    if (!company) {
        console.error('❌ Please run seed first!')
        return
    }

    // Get existing parts
    const parts = await prisma.part.findMany({
        where: { companyId: company.id },
        orderBy: { partNumber: 'asc' }
    })

    if (parts.length < 8) {
        console.error('❌ Please run add-test-data first!')
        return
    }

    console.log(`Found ${parts.length} parts`)

    // Clean existing BOM items
    await prisma.bOMItem.deleteMany({})
    console.log('✅ Cleaned existing BOM items')

    // Create BOM structure
    // Product (PRD-001: Pompa) consists of:
    //   - Assembly (ASM-001: Dişli Grubu)
    //     - Component (CMP-002: Rulman) x2
    //     - Raw Material (RM-001: Çelik Levha)
    //   - Assembly (ASM-002: Motor Montaj)
    //     - Component (CMP-001: Cıvata) x8
    //     - Component (CMP-002: Rulman) x1

    const pump = parts.find(p => p.partNumber === 'PRD-001')
    const gearAsm = parts.find(p => p.partNumber === 'ASM-001')
    const motorAsm = parts.find(p => p.partNumber === 'ASM-002')
    const bolt = parts.find(p => p.partNumber === 'CMP-001')
    const bearing = parts.find(p => p.partNumber === 'CMP-002')
    const steel = parts.find(p => p.partNumber === 'RM-001')

    console.log('Creating BOM items...')

    // Level 1: Product -> Assemblies
    await prisma.bOMItem.create({
        data: {
            partId: pump.id,
            componentPartId: gearAsm.id,
            quantity: 1,
            unit: 'ADET',
        }
    })

    await prisma.bOMItem.create({
        data: {
            partId: pump.id,
            componentPartId: motorAsm.id,
            quantity: 1,
            unit: 'ADET',
        }
    })

    console.log('✅ Level 1 BOM items added (Product -> Assemblies)')

    // Level 2: Gear Assembly -> Components
    await prisma.bOMItem.create({
        data: {
            partId: gearAsm.id,
            componentPartId: bearing.id,
            quantity: 2,
            unit: 'ADET',
        }
    })

    await prisma.bOMItem.create({
        data: {
            partId: gearAsm.id,
            componentPartId: steel.id,
            quantity: 5,
            unit: 'KG',
        }
    })

    console.log('✅ Level 2 BOM items added (Gear Assembly -> Components)')

    // Level 2: Motor Assembly -> Components
    await prisma.bOMItem.create({
        data: {
            partId: motorAsm.id,
            componentPartId: bolt.id,
            quantity: 8,
            unit: 'ADET',
        }
    })

    await prisma.bOMItem.create({
        data: {
            partId: motorAsm.id,
            componentPartId: bearing.id,
            quantity: 1,
            unit: 'ADET',
        }
    })

    console.log('✅ Level 2 BOM items added (Motor Assembly -> Components)')

    // Conveyor Belt BOM
    const conveyor = parts.find(p => p.partNumber === 'PRD-002')
    const aluminum = parts.find(p => p.partNumber === 'RM-002')

    await prisma.bOMItem.create({
        data: {
            partId: conveyor.id,
            componentPartId: motorAsm.id,
            quantity: 2,
            unit: 'ADET',
        }
    })

    await prisma.bOMItem.create({
        data: {
            partId: conveyor.id,
            componentPartId: aluminum.id,
            quantity: 15,
            unit: 'METER',
        }
    })

    await prisma.bOMItem.create({
        data: {
            partId: conveyor.id,
            componentPartId: bolt.id,
            quantity: 50,
            unit: 'ADET',
        }
    })

    console.log('✅ Conveyor BOM items added')

    console.log('')
    console.log('🎉 BOM Tree structure created!')
    console.log('')
    console.log('📊 BOM Structure:')
    console.log('   PRD-001 (Pompa)')
    console.log('   ├── ASM-001 (Dişli Grubu) x1')
    console.log('   │   ├── CMP-002 (Rulman) x2')
    console.log('   │   └── RM-001 (Çelik Levha) x5 KG')
    console.log('   └── ASM-002 (Motor Montaj) x1')
    console.log('       ├── CMP-001 (Cıvata) x8')
    console.log('       └── CMP-002 (Rulman) x1')
    console.log('')
    console.log('   PRD-002 (Taşıyıcı Bant)')
    console.log('   ├── ASM-002 (Motor Montaj) x2')
    console.log('   ├── RM-002 (Alüminyum) x15 M')
    console.log('   └── CMP-001 (Cıvata) x50')
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
