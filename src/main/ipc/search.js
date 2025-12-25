const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

// Search Parts
ipcMain.handle('search:parts', async (event, query) => {
    try {
        if (!query || query.length < 2) {
            return { success: true, parts: [] }
        }

        const searchTerm = `%${query}%`

        const parts = await prisma.part.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { partNumber: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            orderBy: [
                { name: 'asc' }
            ]
        })

        return { success: true, parts }
    } catch (error) {
        console.error('Search parts error:', error)
        return { success: false, error: error.message, parts: [] }
    }
})

// Search Production Orders
ipcMain.handle('search:orders', async (event, query) => {
    try {
        if (!query || query.length < 2) {
            return { success: true, orders: [] }
        }

        const orders = await prisma.productionOrder.findMany({
            where: {
                OR: [
                    { orderNumber: { contains: query, mode: 'insensitive' } },
                    { notes: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                part: {
                    select: {
                        id: true,
                        name: true,
                        partNumber: true
                    }
                }
            },
            take: 10,
            orderBy: [
                { createdAt: 'desc' }
            ]
        })

        return { success: true, orders }
    } catch (error) {
        console.error('Search orders error:', error)
        return { success: false, error: error.message, orders: [] }
    }
})

// Search Suppliers
ipcMain.handle('search:suppliers', async (event, query) => {
    try {
        if (!query || query.length < 2) {
            return { success: true, suppliers: [] }
        }

        const suppliers = await prisma.supplier.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { contactPerson: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            orderBy: [
                { name: 'asc' }
            ]
        })

        return { success: true, suppliers }
    } catch (error) {
        console.error('Search suppliers error:', error)
        return { success: false, error: error.message, suppliers: [] }
    }
})

module.exports = {}
