const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

// Get all processes
ipcMain.handle('processes:getAll', async () => {
    try {
        const processes = await prisma.process.findMany({
            include: {
                steps: {
                    include: {
                        part: {
                            select: {
                                id: true,
                                partNumber: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        })

        return { success: true, processes }
    } catch (error) {
        console.error('Get processes error:', error)
        return { success: false, error: error.message }
    }
})

// Get process by ID
ipcMain.handle('processes:getById', async (event, id) => {
    try {
        const process = await prisma.process.findUnique({
            where: { id },
            include: {
                steps: {
                    include: {
                        part: {
                            select: {
                                id: true,
                                partNumber: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!process) {
            return { success: false, error: 'Process not found' }
        }

        return { success: true, process }
    } catch (error) {
        console.error('Get process error:', error)
        return { success: false, error: error.message }
    }
})

// Create process
ipcMain.handle('processes:create', async (event, data) => {
    try {
        const { steps, ...processData } = data

        const process = await prisma.process.create({
            data: {
                ...processData,
                steps: steps ? {
                    create: steps.map((step, index) => ({
                        partId: step.partId,
                        order: index + 1,
                        name: step.name,
                        description: step.description,
                        estimatedDuration: step.estimatedDuration,
                        machineRequired: step.machineRequired,
                    })),
                } : undefined,
            },
            include: {
                steps: {
                    include: {
                        part: {
                            select: { id: true, partNumber: true, name: true },
                        },
                    },
                },
            },
        })

        return { success: true, process }
    } catch (error) {
        console.error('Create process error:', error)
        return { success: false, error: error.message }
    }
})

// Update process
ipcMain.handle('processes:update', async (event, id, data) => {
    try {
        const process = await prisma.process.update({
            where: { id },
            data,
        })

        return { success: true, process }
    } catch (error) {
        console.error('Update process error:', error)
        return { success: false, error: error.message }
    }
})

// Delete process
ipcMain.handle('processes:delete', async (event, id) => {
    try {
        await prisma.process.delete({
            where: { id },
        })

        return { success: true }
    } catch (error) {
        console.error('Delete process error:', error)
        return { success: false, error: error.message }
    }
})

// Update process step status
ipcMain.handle('processes:updateStepStatus', async (event, stepId, status) => {
    try {
        const step = await prisma.processStep.update({
            where: { id: stepId },
            data: { status },
        })

        return { success: true, step }
    } catch (error) {
        console.error('Update step status error:', error)
        return { success: false, error: error.message }
    }
})
