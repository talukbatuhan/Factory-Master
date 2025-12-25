const { PrismaClient } = require('@prisma/client')
const path = require('path')
const { app } = require('electron')

let prisma = null

function getPrismaClient() {
    if (!prisma) {
        // In production, DB file is in userData? Or resources?
        // standard behavior:

        const dbPath = app.isPackaged
            ? path.join(process.resourcesPath, 'prisma/dev.db')
            : path.join(__dirname, '../../../prisma/dev.db')

        // For simple dev setup we rely on default env or schema path. 
        // But Prisma Client usually needs 'datasourceUrl' override if moving binary.

        prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        })
    }
    return prisma
}

module.exports = getPrismaClient
