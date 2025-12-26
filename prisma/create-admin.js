const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function createAdmin() {
    console.log('Creating admin user...')

    try {
        // Delete all existing users first
        await prisma.user.deleteMany({})
        console.log('Cleared existing users')

        // Create admin
        const adminPassword = await bcrypt.hash('admin123', 10)

        const admin = await prisma.user.create({
            data: {
                email: 'admin@factory.com',
                name: 'Administrator',
                passwordHash: adminPassword,
                role: 'ADMIN',
                status: 'ACTIVE',
            }
        })

        console.log('✅ Admin user created successfully!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📧 Email:    admin@factory.com')
        console.log('🔑 Password: admin123')
        console.log('👑 Role:     ADMIN')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('\n🚀 You can now login!')

    } catch (error) {
        console.error('❌ Error creating admin:', error.message)
        throw error
    }
}

createAdmin()
    .catch((e) => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
