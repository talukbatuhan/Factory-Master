const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

// Check for low stock parts and create notifications
async function checkLowStock() {
    try {
        const lowStockParts = await prisma.part.findMany({
            where: {
                OR: [
                    {
                        stockQuantity: {
                            lte: prisma.raw('reorderLevel')
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                partNumber: true,
                stockQuantity: true,
                reorderLevel: true,
            }
        })

        // Alternative: Use raw query for better compatibility
        const parts = await prisma.$queryRaw`
            SELECT id, name, partNumber, stockQuantity, reorderLevel 
            FROM Part 
            WHERE stockQuantity <= reorderLevel
        `

        return parts
    } catch (error) {
        console.error('Check low stock error:', error)
        return []
    }
}

// Create low stock notification
async function createLowStockNotification(part) {
    const notification = {
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `${part.name} (${part.partNumber}) is running low. Current stock: ${part.stockQuantity} units (Reorder level: ${part.reorderLevel})`,
        relatedId: part.id,
        relatedType: 'PART',
    }

    // Send to IPC notification handler
    return notification
}

// IPC Handler to check and create low stock notifications
ipcMain.handle('notifications:checkLowStock', async () => {
    try {
        const lowStockParts = await checkLowStock()
        const notifications = []

        for (const part of lowStockParts) {
            const notification = await createLowStockNotification(part)
            notifications.push(notification)
        }

        return { success: true, notifications, count: notifications.length }
    } catch (error) {
        console.error('Check low stock notifications error:', error)
        return { success: false, error: error.message, notifications: [] }
    }
})

// IPC Handler to create production order notification
ipcMain.handle('notifications:createOrderNotification', async (event, data) => {
    try {
        const { orderId, orderNumber, status, type } = data

        let title, message

        switch (type) {
            case 'STATUS_CHANGE':
                title = 'Production Order Updated'
                message = `Order ${orderNumber} status changed to ${status}`
                break
            case 'COMPLETED':
                title = 'Production Order Completed'
                message = `Order ${orderNumber} has been completed successfully`
                break
            case 'CREATED':
                title = 'New Production Order'
                message = `Order ${orderNumber} has been created`
                break
            default:
                title = 'Production Order Update'
                message = `Order ${orderNumber} has been updated`
        }

        const notification = {
            type: type === 'COMPLETED' ? 'ORDER_COMPLETE' : 'ORDER_UPDATE',
            title,
            message,
            relatedId: orderId,
            relatedType: 'ORDER',
        }

        return { success: true, notification }
    } catch (error) {
        console.error('Create order notification error:', error)
        return { success: false, error: error.message }
    }
})

module.exports = {
    checkLowStock,
    createLowStockNotification,
}
