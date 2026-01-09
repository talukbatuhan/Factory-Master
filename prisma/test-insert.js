const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({ log: ['query', 'error'] })

async function main() {
    console.log('Testing...')

    const company = await prisma.company.findFirst({ where: { isDefault: true } })
    console.log('Company:', company)

    try {
        const part = await prisma.part.create({
            data: {
                companyId: company.id,
                partNumber: 'TEST-001',
                name: 'Test Parça',
                type: 'COMPONENT',
                stockQuantity: 10,
                unit: 'ADET',
                reorderLevel: 5,
            }
        })
        console.log('✅ Part created:', part.name)
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('Full error:', error)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
