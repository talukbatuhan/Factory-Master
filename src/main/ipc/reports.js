const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

// Get Dashboard Stats
ipcMain.handle('reports:getStats', async (event) => {
    try {
        const prisma = getPrismaClient()

        // SQLite doesn't support column comparison in where clause efficiently with standard Prisma API
        // So we fetch necessary fields to count low stock
        const allPartsForStock = await prisma.part.findMany({
            select: { stockQuantity: true, reorderLevel: true }
        })
        const lowStockCount = allPartsForStock.filter(p => p.stockQuantity <= p.reorderLevel).length

        const [
            totalParts,
            totalOrders,
            ordersInProgress,
            ordersCompleted,
            suppliersCount
        ] = await Promise.all([
            prisma.part.count(),
            prisma.productionOrder.count(),
            prisma.productionOrder.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.productionOrder.count({ where: { status: 'COMPLETED' } }),
            prisma.supplier.count()
        ])

        return {
            totalParts,
            lowStockCount,
            totalOrders,
            ordersInProgress,
            ordersCompleted,
            suppliersCount
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
    }
})

// Get Inventory Valuation Report
ipcMain.handle('reports:getInventoryValuation', async (event) => {
    try {
        const prisma = getPrismaClient()
        // Fetch all parts with their stock and supplier pricing
        const parts = await prisma.part.findMany({
            where: {
                stockQuantity: {
                    gt: 0 // Only interested in items in stock
                }
            },
            include: {
                supplierParts: {
                    select: {
                        unitPrice: true,
                        currency: true
                    }
                }
            }
        })

        // Calculate value for each part
        const valuationData = parts.map(part => {
            // Calculate average price from suppliers (simplistic approach)
            const prices = part.supplierParts
                .filter(sp => sp.unitPrice !== null)
                .map(sp => sp.unitPrice)

            const avgPrice = prices.length > 0
                ? prices.reduce((a, b) => a + b, 0) / prices.length
                : 0

            const totalValue = part.stockQuantity * avgPrice

            return {
                id: part.id,
                partNumber: part.partNumber,
                name: part.name,
                stockQuantity: part.stockQuantity,
                unit: part.unit,
                avgUnitPrice: avgPrice,
                totalValue: totalValue,
                supplierCount: part.supplierParts.length
            }
        })

        // Sort by total value descending
        valuationData.sort((a, b) => b.totalValue - a.totalValue)

        const grandTotalValue = valuationData.reduce((sum, item) => sum + item.totalValue, 0)

        // Count items with no value (missing supplier pricing)
        const itemsWithNoValue = valuationData.filter(item => item.totalValue === 0).length

        return {
            items: valuationData,
            grandTotal: grandTotalValue,
            itemsWithNoValue
        }
    } catch (error) {
        console.error('Error fetching inventory valuation:', error)
        throw error
    }
})

// Get Production Performance Report
ipcMain.handle('reports:getProductionStats', async (event, days = 30) => {
    try {
        const prisma = getPrismaClient()
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - days)

        const orders = await prisma.productionOrder.findMany({
            where: {
                createdAt: {
                    gte: dateLimit
                }
            },
            include: {
                part: {
                    select: {
                        name: true,
                        partNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Group by status
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1
            return acc
        }, {})

        // Calculate completion rate (Completed vs Total Non-Cancelled)
        const completed = statusCounts['COMPLETED'] || 0
        const total = orders.length
        const cancelled = statusCounts['CANCELLED'] || 0
        const activeTotal = total - cancelled

        const completionRate = activeTotal > 0 ? (completed / activeTotal) * 100 : 0

        return {
            timeframeDays: days,
            totalOrders: total,
            statusBreakdown: statusCounts,
            completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
            recentOrders: orders.slice(0, 10) // Return last 10 for display
        }
    } catch (error) {
        console.error('Error fetching production stats:', error)
        throw error
    }
})

// Get Low Stock Report
ipcMain.handle('reports:getLowStock', async (event) => {
    try {
        const prisma = getPrismaClient()
        // Fetch all parts then filtering is required for SQLite column comparison
        const allParts = await prisma.part.findMany({
            include: {
                supplierParts: {
                    include: {
                        supplier: true
                    },
                    take: 1 // Just get the primary supplier
                }
            }
        })

        const lowStockItems = allParts.filter(item => item.stockQuantity <= item.reorderLevel)

        return lowStockItems.map(item => ({
            id: item.id,
            partNumber: item.partNumber,
            name: item.name,
            stockQuantity: item.stockQuantity,
            reorderLevel: item.reorderLevel,
            shortage: item.reorderLevel - item.stockQuantity,
            primarySupplier: item.supplierParts[0]?.supplier?.name || 'N/A'
        }))
    } catch (error) {
        console.error('Error fetching low stock report:', error)
        throw error
    }
})
