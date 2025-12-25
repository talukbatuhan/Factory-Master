const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

ipcMain.handle('inventory:getHistory', async (event, filters) => {
    try {
        // Handle both string partId and object with partId
        const partId = typeof filters === 'string' ? filters : filters?.partId

        const transactions = await prisma.inventoryTransaction.findMany({
            where: partId ? { partId } : {},
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

        // Use transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get current part stock
            const part = await tx.part.findUnique({
                where: { id: partId }
            })

            if (!part) throw new Error('Part not found')

            let newBalance = part.stockQuantity
            // If type is OUT, subtract. If IN, add. ADJUSTMENT depends on sign of quantity or explicit set?
            // Usually ADJUSTMENT is +/- quantity.
            // Let's assume quantity is already signed or type dictates it.
            // Standard convention: 
            // IN: + quantity
            // OUT: - quantity (input should be positive usually, so we subtract)
            // ADJUSTMENT: + quantity (can be negative)

            let change = parseInt(quantity)
            if (type === 'OUT') change = -Math.abs(change)
            if (type === 'IN') change = Math.abs(change)

            newBalance += change

            if (newBalance < 0) throw new Error('Insufficient stock')

            const transaction = await tx.inventoryTransaction.create({
                data: {
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
        // SQLite limitation on field comparison might require raw query or retrieving all
        // Prisma doesn't support where: { stockQuantity: { lte: prisma.part.fields.reorderLevel } } easily

        const allParts = await prisma.part.findMany({
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
