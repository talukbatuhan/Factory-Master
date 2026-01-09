const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')
const { getCurrentUser } = require('./auth')

const prisma = getPrismaClient()

ipcMain.handle('inventory:getHistory', async (event, filters) => {
    try {
        const partId = typeof filters === 'string' ? filters : filters?.partId

        const where = {}
        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }
        if (partId) {
            where.partId = partId
        }

        const transactions = await prisma.inventoryTransaction.findMany({
            where,
            include: {
                recordedBy: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, transactions }
    } catch (error) {
        console.error('Get inventory history error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('inventory:record', async (event, data) => {
    try {
        const { partId, type, quantity, notes, recordedById } = data

        const result = await prisma.$transaction(async (tx) => {
            const part = await tx.part.findUnique({
                where: { id: partId }
            })

            if (!part) throw new Error('Part not found')

            let newBalance = part.stockQuantity
            let change = parseInt(quantity)
            if (type === 'OUT') change = -Math.abs(change)
            if (type === 'IN') change = Math.abs(change)

            newBalance += change

            if (newBalance < 0) throw new Error('Insufficient stock')

            const transaction = await tx.inventoryTransaction.create({
                data: {
                    companyId: part.companyId,
                    partId,
                    type,
                    quantity: change,
                    balanceAfter: newBalance,
                    notes,
                    recordedById
                }
            })

            const updatedPart = await tx.part.update({
                where: { id: partId },
                data: { stockQuantity: newBalance }
            })

            return { transaction, part: updatedPart }
        })

        return { success: true, ...result }
    } catch (error) {
        console.error('Inventory record error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('inventory:getLowStock', async () => {
    try {
        const where = {}
        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }

        const allParts = await prisma.part.findMany({
            where,
            select: {
                id: true,
                partNumber: true,
                name: true,
                stockQuantity: true,
                reorderLevel: true
            }
        })

        const lowStock = allParts.filter(p => p.stockQuantity <= p.reorderLevel)
        return { success: true, parts: lowStock }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
