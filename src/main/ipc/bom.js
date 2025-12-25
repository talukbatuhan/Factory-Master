const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

/**
 * Recursive function to get full BOM tree with all nested assemblies
 * @param {string} partId - The part ID to get BOM for
 * @param {Set} visited - Set of visited part IDs to prevent infinite loops
 * @returns {Promise<Array>} BOM items with nested children
 */
async function getRecursiveBOM(partId, visited = new Set()) {
    // Prevent circular references
    if (visited.has(partId)) {
        return []
    }
    visited.add(partId)

    const bom = await prisma.bOMItem.findMany({
        where: { partId },
        include: {
            componentPart: {
                select: {
                    id: true,
                    partNumber: true,
                    name: true,
                    type: true,
                    stockQuantity: true,
                    unit: true,
                }
            }
        }
    })

    // Recursively get child BOMs for assemblies
    for (const item of bom) {
        if (item.componentPart.type === 'ASSEMBLY') {
            item.children = await getRecursiveBOM(item.componentPart.id, new Set(visited))
        }
    }

    return bom
}

/**
 * Check if adding componentPartId to partId would create a circular dependency
 * @param {string} partId - Parent part ID
 * @param {string} componentPartId - Component being added
 * @returns {Promise<boolean>} True if circular dependency would be created
 */
async function wouldCreateCircularDependency(partId, componentPartId) {
    // Can't add a part to itself
    if (partId === componentPartId) {
        return true
    }

    // Check if partId exists in the BOM tree of componentPartId
    const checkBOMTree = async (currentPartId, targetPartId, visited = new Set()) => {
        if (visited.has(currentPartId)) {
            return false
        }
        visited.add(currentPartId)

        const bom = await prisma.bOMItem.findMany({
            where: { partId: currentPartId },
            select: { componentPartId: true }
        })

        for (const item of bom) {
            if (item.componentPartId === targetPartId) {
                return true
            }
            // Recursively check
            if (await checkBOMTree(item.componentPartId, targetPartId, visited)) {
                return true
            }
        }

        return false
    }

    return await checkBOMTree(componentPartId, partId)
}

// Get BOM for a specific part (with optional recursive loading)
ipcMain.handle('bom:getForPart', async (event, partId, options = {}) => {
    try {
        let bom

        if (options.recursive) {
            bom = await getRecursiveBOM(partId)
        } else {
            bom = await prisma.bOMItem.findMany({
                where: { partId },
                include: {
                    componentPart: {
                        select: {
                            id: true,
                            partNumber: true,
                            name: true,
                            type: true,
                            stockQuantity: true,
                            unit: true,
                        }
                    }
                }
            })
        }

        return { success: true, bom }
    } catch (error) {
        console.error('Get BOM error:', error)
        return { success: false, error: error.message }
    }
})

// Add component to BOM
ipcMain.handle('bom:addComponent', async (event, data) => {
    try {
        // Check for circular dependency
        const isCircular = await wouldCreateCircularDependency(data.partId, data.componentPartId)
        if (isCircular) {
            return { success: false, error: 'Cannot add: This would create a circular dependency!' }
        }

        // Check if already exists
        const existing = await prisma.bOMItem.findFirst({
            where: { partId: data.partId, componentPartId: data.componentPartId }
        })

        if (existing) {
            return { success: false, error: 'Component already exists in BOM' }
        }

        const item = await prisma.bOMItem.create({
            data: {
                partId: data.partId,
                componentPartId: data.componentPartId,
                quantity: parseFloat(data.quantity) || 1,
                unit: data.unit || 'pcs'
            },
            include: {
                componentPart: {
                    select: {
                        id: true,
                        partNumber: true,
                        name: true,
                        type: true,
                        stockQuantity: true,
                        unit: true,
                    }
                }
            }
        })

        return { success: true, item }
    } catch (error) {
        console.error('Add BOM component error:', error)
        return { success: false, error: error.message }
    }
})

// Update BOM item (quantity, unit, etc.)
ipcMain.handle('bom:updateItem', async (event, bomItemId, updates) => {
    try {
        const item = await prisma.bOMItem.update({
            where: { id: bomItemId },
            data: {
                ...(updates.quantity !== undefined && { quantity: parseFloat(updates.quantity) }),
                ...(updates.unit && { unit: updates.unit })
            }
        })
        return { success: true, item }
    } catch (error) {
        console.error('Update BOM item error:', error)
        return { success: false, error: error.message }
    }
})

// Legacy handler for backward compatibility
ipcMain.handle('bom:updateQuantity', async (event, bomItemId, quantity) => {
    try {
        const item = await prisma.bOMItem.update({
            where: { id: bomItemId },
            data: { quantity: parseFloat(quantity) }
        })
        return { success: true, item }
    } catch (error) {
        console.error('Update quantity error:', error)
        return { success: false, error: error.message }
    }
})

// Remove component from BOM
ipcMain.handle('bom:removeComponent', async (event, bomItemId) => {
    try {
        // Handle both string ID and object with ID
        if (typeof bomItemId !== 'string' && bomItemId?.id) {
            bomItemId = bomItemId.id
        }

        await prisma.bOMItem.delete({
            where: { id: bomItemId }
        })

        return { success: true }
    } catch (error) {
        console.error('Remove BOM component error:', error)
        return { success: false, error: error.message }
    }
})

// Bulk add components
ipcMain.handle('bom:bulkAddComponents', async (event, partId, components) => {
    try {
        const results = []
        const errors = []

        for (const comp of components) {
            // Check circular dependency
            const isCircular = await wouldCreateCircularDependency(partId, comp.componentPartId)
            if (isCircular) {
                errors.push({ componentPartId: comp.componentPartId, error: 'Circular dependency' })
                continue
            }

            // Check if already exists
            const existing = await prisma.bOMItem.findFirst({
                where: { partId, componentPartId: comp.componentPartId }
            })

            if (existing) {
                errors.push({ componentPartId: comp.componentPartId, error: 'Already exists' })
                continue
            }

            try {
                const item = await prisma.bOMItem.create({
                    data: {
                        partId,
                        componentPartId: comp.componentPartId,
                        quantity: parseFloat(comp.quantity) || 1,
                        unit: comp.unit || 'pcs'
                    }
                })
                results.push(item)
            } catch (error) {
                errors.push({ componentPartId: comp.componentPartId, error: error.message })
            }
        }

        return {
            success: true,
            added: results.length,
            failed: errors.length,
            results,
            errors
        }
    } catch (error) {
        console.error('Bulk add components error:', error)
        return { success: false, error: error.message }
    }
})
