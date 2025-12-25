const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

ipcMain.handle('parts:getAll', async (event, filters = {}) => {
    try {
        const where = {}
        if (filters.type && filters.type !== 'ALL') {
            where.type = filters.type
        }
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } }, // SQLite doesn't support mode: 'insensitive' natively in Prisma 5 via args usually?
                { partNumber: { contains: filters.search } }
            ]
        }
        if (filters.stockStatus) {
            if (filters.stockStatus === 'LOW') {
                // Cant easily do field comparison in where, do logic after fetch or raw query
            }
        }

        const parts = await prisma.part.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

        // Post-filter for stock status if needed?
        // UI usually handles badge logic, but filters might be needed.
        // For MVP, basic filtering is fine.

        return { success: true, parts }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:getById', async (event, id) => {
    try {
        const part = await prisma.part.findUnique({
            where: { id },
            include: {
                revisions: { orderBy: { createdAt: 'desc' } },
                bomParent: { include: { componentPart: true } }, // Where this part is parent
                supplierParts: { include: { supplier: true } },
                bomChildren: true // Where this part is child? No, BOMItem relations.
                // bomParent = items where this part is parent (has components)
                // bomChildren = items where this part is component (is used in assemblies)
            }
        })

        if (!part) return { success: false, error: 'Part not found' }

        return { success: true, part }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:getTree', async () => {
    try {
        // Fetch all BOM items and build tree?
        // Or fetch top Level items?
        // For tree visualization, we need structure.

        const allParts = await prisma.part.findMany({
            include: {
                bomParent: {
                    include: { componentPart: true }
                }
            }
        })

        // Build tree logical structure in memory if needed or just return flat list with BOM
        return { success: true, parts: allParts }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:create', async (event, data) => {
    try {
        const { revisions, ...partData } = data
        // revisions is usually just handled by creating first revision?
        // partData should have fields matching schema.

        const part = await prisma.part.create({
            data: {
                ...partData,
                // Ensure required defaults
                stockQuantity: parseInt(partData.stockQuantity || 0),
                reorderLevel: parseInt(partData.reorderLevel || 0)
            }
        })
        return { success: true, part }
    } catch (error) {
        console.error('Create part error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:update', async (event, id, data) => {
    try {
        const part = await prisma.part.update({
            where: { id },
            data
        })
        return { success: true, part }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:delete', async (event, id) => {
    try {
        // Check dependencies
        // BOM usage, Production Orders, Stocks?

        await prisma.part.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
