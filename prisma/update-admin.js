const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updateAdmin() {
    console.log('Updating admin user...')

    try {
        // First, check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: 'engineer@factory.com' }
        })

        if (!existing) {
            console.log('User not found! Creating new one...')
            const password = await bcrypt.hash('Tahir123', 10)
            const created = await prisma.user.create({
                data: {
                    email: 'engineer@factory.com',
                    name: 'John Engineer',
                    passwordHash: password,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                }
            })
            console.log('Created user:', created)
        } else {
            console.log('Found existing user, updating...')
            // Hash the password 'Tahir123'
            const password = await bcrypt.hash('Tahir123', 10)

            // Update the user
            const updated = await prisma.user.update({
                where: { email: 'engineer@factory.com' },
                data: {
                    role: 'ADMIN',
                    passwordHash: password,
                    name: 'John Engineer',
                },
            })
            console.log('Updated user:', updated)
        }

        console.log('✅ engineer@factory.com is now ADMIN with password: Tahir123')
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}

updateAdmin()
    .catch((e) => {
        console.error('Update error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
