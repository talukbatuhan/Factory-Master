const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    const company = await prisma.company.create({
        data: {
            name: 'Acme Manufacturing Ltd.',
            status: 'ACTIVE',
            isDefault: true,
        },
    })

    console.log('✅ Company created:', company.name)

    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
        data: {
            companyId: company.id,
            email: 'admin@factory.com',
            name: 'Admin User',
            passwordHash: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    })

    console.log('✅ Admin user created')
    console.log('')
    console.log('🎉 Seeding completed!')
    console.log('📝 Login: admin@factory.com / admin123')
    console.log('')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
