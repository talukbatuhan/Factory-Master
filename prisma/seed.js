const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create users
    const engineerPassword = await bcrypt.hash('password123', 10)
    const operatorPassword = await bcrypt.hash('password123', 10)

    const engineer = await prisma.user.upsert({
        where: { email: 'engineer@factory.com' },
        update: {},
        create: {
            email: 'engineer@factory.com',
            name: 'John Engineer',
            passwordHash: engineerPassword,
            role: 'ENGINEER',
            status: 'ACTIVE',
        },
    })

    const operator = await prisma.user.upsert({
        where: { email: 'operator@factory.com' },
        update: {},
        create: {
            email: 'operator@factory.com',
            name: 'Sarah Operator',
            passwordHash: operatorPassword,
            role: 'OPERATOR',
            status: 'ACTIVE',
        },
    })

    console.log('Created users:', { engineer, operator })
    console.log('Seed complete!')
}

main()
    .catch((e) => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
