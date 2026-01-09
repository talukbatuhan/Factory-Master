const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')
const { getCurrentUser } = require('./auth')

const prisma = getPrismaClient()

ipcMain.handle('parts:getAll', async (event, filters = {}) => {
    try {
        const where = {}

        // Add company filter
        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }

        if (filters.type && filters.type !== 'ALL') {
            where.type = filters.type
        }
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { partNumber: { contains: filters.search } }
            ]
        }

        const parts = await prisma.part.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

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
                bomParent: { include: { componentPart: true } },
                supplierParts: { include: { supplier: true } },
                bomChildren: true
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
        const where = {}

        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }

        const allParts = await prisma.part.findMany({
            where,
            include: {
                bomParent: {
                    include: { componentPart: true }
                }
            }
        })

        return { success: true, parts: allParts }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('parts:create', async (event, data) => {
    try {
        const { revisions, ...partData } = data

        const currentUser = getCurrentUser()
        const companyId = partData.companyId || currentUser?.companyId

        if (!companyId) {
            return { success: false, error: 'Company ID is required. Please log in again.' }
        }

        const part = await prisma.part.create({
            data: {
                companyId: companyId,
                partNumber: partData.partNumber,
                name: partData.name,
                description: partData.description || '',
                type: partData.type || 'COMPONENT',
                materialType: partData.materialType || '',
                stockQuantity: parseInt(partData.stockQuantity || 0),
                unit: partData.unit || 'pcs',
                reorderLevel: parseInt(partData.reorderLevel || 0),
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
        await prisma.part.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
