const { ipcMain } = require('electron')
const bcrypt = require('bcryptjs')
const getPrismaClient = require('../database/client')

const prisma = getPrismaClient()

let currentUser = null

ipcMain.handle('auth:login', async (event, email, password) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
            return { success: false, error: 'Invalid password' }
        }

        if (user.status !== 'ACTIVE') {
            return { success: false, error: 'User account is inactive' }
        }

        // Strip password hash
        const { passwordHash, ...userWithoutPassword } = user
        currentUser = userWithoutPassword

        return { success: true, user: userWithoutPassword }
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('auth:logout', async () => {
    currentUser = null
    return { success: true }
})

ipcMain.handle('auth:getCurrentUser', async () => {
    return { success: true, user: currentUser }
})

// User Management (Admin Only)
ipcMain.handle('users:getAll', async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                // Exclude passwordHash
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, users }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('users:create', async (event, data) => {
    try {
        const { name, email, password, role } = data

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                status: 'ACTIVE'
            }
        })

        const { passwordHash: _, ...userWithoutPassword } = user
        return { success: true, user: userWithoutPassword }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('users:update', async (event, id, data) => {
    try {
        // Extract password and currentPassword (validation field), don't send to DB
        const { password, currentPassword, ...otherData } = data

        // Only include valid Prisma fields
        const updateData = {}
        const validFields = ['email', 'name', 'role', 'status']

        validFields.forEach(field => {
            if (otherData[field] !== undefined) {
                updateData[field] = otherData[field]
            }
        })

        // If new password provided, hash it
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        const { passwordHash: _, ...userWithoutPassword } = user
        return { success: true, user: userWithoutPassword }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('users:delete', async (event, id) => {
    try {
        // Soft delete or hard delete? Usually soft delete by setting status to INACTIVE
        // But for now let's use hard delete if not specified otherwise in plan.
        // Plan says "Deactivate/Reactivate user (Delete only currently)", so maybe delete.
        await prisma.user.delete({
            where: { id }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})
