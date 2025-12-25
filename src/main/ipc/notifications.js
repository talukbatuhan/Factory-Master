const { ipcMain } = require('electron')

// Mock notifications store (in production, use database)
let notifications = [
    {
        id: '1',
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'Bearing SKF 6205 is running low. Current stock: 5 units',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
        id: '2',
        type: 'ORDER_COMPLETE',
        title: 'Production Order Completed',
        message: 'Order #PO-2024-001 has been completed successfully',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
        id: '3',
        type: 'ORDER_UPDATE',
        title: 'Production Order Updated',
        message: 'Order #PO-2024-003 status changed to IN_PROGRESS',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
]

// Get all notifications
ipcMain.handle('notifications:getAll', async () => {
    try {
        return {
            success: true,
            notifications: notifications.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ),
        }
    } catch (error) {
        console.error('Get notifications error:', error)
        return { success: false, error: error.message, notifications: [] }
    }
})

// Mark notification as read
ipcMain.handle('notifications:markAsRead', async (event, id) => {
    try {
        const notification = notifications.find(n => n.id === id)
        if (notification) {
            notification.read = true
        }
        return { success: true }
    } catch (error) {
        console.error('Mark as read error:', error)
        return { success: false, error: error.message }
    }
})

// Mark all notifications as read
ipcMain.handle('notifications:markAllAsRead', async () => {
    try {
        notifications = notifications.map(n => ({ ...n, read: true }))
        return { success: true }
    } catch (error) {
        console.error('Mark all as read error:', error)
        return { success: false, error: error.message }
    }
})

// Delete notification
ipcMain.handle('notifications:delete', async (event, id) => {
    try {
        notifications = notifications.filter(n => n.id !== id)
        return { success: true }
    } catch (error) {
        console.error('Delete notification error:', error)
        return { success: false, error: error.message }
    }
})

// Create notification (for system use)
ipcMain.handle('notifications:create', async (event, notification) => {
    try {
        const newNotification = {
            id: Date.now().toString(),
            ...notification,
            read: false,
            createdAt: new Date().toISOString(),
        }
        notifications.unshift(newNotification)
        return { success: true, notification: newNotification }
    } catch (error) {
        console.error('Create notification error:', error)
        return { success: false, error: error.message }
    }
})

module.exports = {}
