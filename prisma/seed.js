const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create default ADMIN user
    const adminPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@factory.com' },
        update: {
            role: 'ADMIN',
            passwordHash: adminPassword,
        },
        create: {
            email: 'admin@factory.com',
            name: 'Administrator',
            passwordHash: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    })

    console.log('✅ Default admin user created/updated:')
    console.log('   Email:', admin.email)
    console.log('   Password: admin123')
    console.log('   Role:', admin.role)
    console.log('')
    console.log('🚀 Seed complete! You can now login with:')
    console.log('   admin@factory.com / admin123')
}

main()
    .catch((e) => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
