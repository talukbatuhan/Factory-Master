const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')
const { getCurrentUser } = require('./auth')

const prisma = getPrismaClient()

ipcMain.handle('suppliers:getAll', async (event, filters = {}) => {
    try {
        const where = {}

        const currentUser = getCurrentUser()
        if (currentUser?.companyId) {
            where.companyId = currentUser.companyId
        }

        if (filters.type && filters.type !== 'ALL') {
            where.type = filters.type
        }
        if (filters.search) {
            where.name = { contains: filters.search }
        }

        const suppliers = await prisma.supplier.findMany({
            where,
            include: {
                _count: {
                    select: { supplierParts: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, suppliers }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:getById', async (event, id) => {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                supplierParts: {
                    include: {
                        part: true
                    }
                }
            }
        })

        if (!supplier) return { success: false, error: 'Supplier not found' }

        return { success: true, supplier }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:create', async (event, data) => {
    try {
        const currentUser = getCurrentUser()
        if (!data.companyId && currentUser?.companyId) {
            data.companyId = currentUser.companyId
        }

        const supplier = await prisma.supplier.create({
            data
        })
        return { success: true, supplier }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:update', async (event, id, data) => {
    try {
        const supplier = await prisma.supplier.update({
            where: { id },
            data
        })
        return { success: true, supplier }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:delete', async (event, id) => {
    try {
        const count = await prisma.supplierPart.count({ where: { supplierId: id } })
        if (count > 0) {
            await prisma.supplierPart.deleteMany({ where: { supplierId: id } })
        }

        await prisma.supplier.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:assignPart', async (event, supplierId, partId, data) => {
    try {
        const existing = await prisma.supplierPart.findFirst({
            where: { supplierId, partId }
        })

        if (existing) {
            const updated = await prisma.supplierPart.update({
                where: { id: existing.id },
                data
            })
            return { success: true, supplierPart: updated }
        }

        const created = await prisma.supplierPart.create({
            data: {
                supplierId,
                partId,
                ...data
            }
        })
        return { success: true, supplierPart: created }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('suppliers:removePart', async (event, supplierId, partId) => {
    try {
        await prisma.supplierPart.deleteMany({
            where: {
                supplierId,
                partId
            }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
