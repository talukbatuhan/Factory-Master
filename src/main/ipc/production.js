const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

// Generate PO Number
async function generateOrderNumber() {
    const lastOrder = await prisma.productionOrder.findFirst({
        orderBy: { createdAt: 'desc' },
    })

    if (!lastOrder) return 'PO-000001'

    const lastNum = parseInt(lastOrder.orderNumber.split('-')[1])
    return `PO-${String(lastNum + 1).padStart(6, '0')}`
}

ipcMain.handle('production:getAll', async (event, filters = {}) => {
    try {
        const where = {}
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
                part: {
                    include: {
                        bomParent: {
                            include: {
                                componentPart: true
                            }
                        }
                    }
                },
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
        const orderNumber = await generateOrderNumber()

        const order = await prisma.productionOrder.create({
            data: {
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

        // Use transaction if we were deducting stock, but simple update for now
        const order = await prisma.productionOrder.update({
            where: { id },
            data: updateData
        })

        return { success: true, order }
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
