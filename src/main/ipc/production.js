const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')
const { getCurrentUser } = require('./auth')

const prisma = getPrismaClient()

// Generate PO Number (scoped to company)
async function generateOrderNumber(companyId) {
    const lastOrder = await prisma.productionOrder.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
    })

    if (!lastOrder) return 'PO-000001'

    const lastNum = parseInt(lastOrder.orderNumber.split('-')[1])
    return `PO-${String(lastNum + 1).padStart(6, '0')}`
}

ipcMain.handle('production:getAll', async (event, filters = {}) => {
    try {
        const where = {}

        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }

        if (filters.status && filters.status !== 'ALL') {
            where.status = filters.status
        }
        if (filters.search) {
            where.OR = [
                { orderNumber: { contains: filters.search } },
                { part: { name: { contains: filters.search } } }
            ]
        }

        const orders = await prisma.productionOrder.findMany({
            where,
            include: {
                part: true,
                createdBy: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, orders }
    } catch (error) {
        console.error('Get orders error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('production:getById', async (event, id) => {
    try {
        const order = await prisma.productionOrder.findUnique({
            where: { id },
            include: {
                part: true,
                createdBy: { select: { name: true } }
            }
        })

        if (!order) return { success: false, error: 'Order not found' }

        return { success: true, order }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('production:create', async (event, data) => {
    try {
        const currentUser = getCurrentUser()
        const companyId = data.companyId || currentUser?.companyId

        if (!companyId) {
            return { success: false, error: 'Company ID is required' }
        }

        const orderNumber = await generateOrderNumber(companyId)

        const order = await prisma.productionOrder.create({
            data: {
                companyId,
                partId: data.partId,
                quantity: parseInt(data.quantity),
                status: 'PLANNED',
                targetDate: new Date(data.targetDate),
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                notes: data.notes,
                orderNumber,
                createdById: data.createdById
            }
        })

        return { success: true, order }
    } catch (error) {
        console.error('Create order error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('production:update', async (event, id, data) => {
    try {
        const order = await prisma.productionOrder.update({
            where: { id },
            data
        })
        return { success: true, order }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('production:updateStatus', async (event, id, status) => {
    try {
        const updateData = { status }
        if (status === 'COMPLETED') {
            updateData.completionDate = new Date()
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update order status
            const order = await tx.productionOrder.update({
                where: { id },
                data: updateData,
                include: { part: true }
            })

            // 2. Handle Stock Movements if COMPLETED
            if (status === 'COMPLETED') {
                // a. Increment Finished Good Stock
                const updatedPart = await tx.part.update({
                    where: { id: order.partId },
                    data: { stockQuantity: { increment: order.quantity } }
                })

                // Create Transaction Record (IN)
                await tx.inventoryTransaction.create({
                    data: {
                        companyId: order.companyId,
                        partId: order.partId,
                        type: 'PRODUCTION',
                        quantity: order.quantity,
                        balanceAfter: updatedPart.stockQuantity,
                        referenceId: order.id,
                        notes: `Production Completed: ${order.orderNumber}`
                    }
                })

                // b. Decrement Components Stock (BOM)
                // Note: Using 'bOMItem' as Prisma client model name usually lowercases the first letter
                const bomItems = await tx.bOMItem.findMany({
                    where: { partId: order.partId },
                    include: { componentPart: true }
                })

                for (const item of bomItems) {
                    const requiredQty = item.quantity * order.quantity

                    const updatedComponent = await tx.part.update({
                        where: { id: item.componentPartId },
                        data: { stockQuantity: { decrement: requiredQty } }
                    })

                    // Create Transaction Record (OUT)
                    await tx.inventoryTransaction.create({
                        data: {
                            companyId: order.companyId,
                            partId: item.componentPartId,
                            type: 'CONSUMPTION',
                            quantity: -requiredQty,
                            balanceAfter: updatedComponent.stockQuantity,
                            referenceId: order.id,
                            notes: `Consumed for Production: ${order.orderNumber}`
                        }
                    })
                }
            }

            return order
        })

        return { success: true, order: result }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('production:delete', async (event, id) => {
    try {
        await prisma.productionOrder.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
