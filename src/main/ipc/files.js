const { ipcMain, dialog, shell } = require('electron')
const getPrismaClient = require('../database/client')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { app } = require('electron') // Fixed import

const prisma = getPrismaClient()

// Get base files directory
function getFilesDirectory(partId) {
    const filesDir = path.join(app.getPath('userData'), 'files', partId)
    if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true })
    }
    return filesDir
}

// Get files for a part
ipcMain.handle('files:getForPart', async (event, partId) => {
    try {
        const files = await prisma.partFile.findMany({
            where: { partId },
            include: {
                uploadedBy: {
                    select: { name: true },
                },
            },
            orderBy: { uploadedAt: 'desc' },
        })

        return { success: true, files }
    } catch (error) {
        console.error('Get files error:', error)
        return { success: false, error: error.message }
    }
})

// Attach file to part (copy to internal storage)
ipcMain.handle('files:attach', async (event, data) => {
    try {
        const { partId, filePath: sourcePath, fileType, revision, uploadedById } = data

        // Get file info
        const originalFileName = path.basename(sourcePath)
        const fileStats = fs.statSync(sourcePath)

        // Generate unique filename
        const fileExt = path.extname(originalFileName)
        const uniqueFileName = `${uuidv4()}${fileExt}`

        // Determine destination
        const filesDir = getFilesDirectory(partId)
        const destPath = path.join(filesDir, uniqueFileName)

        // Copy file to internal storage
        fs.copyFileSync(sourcePath, destPath)

        // Get first user if no uploadedById provided
        let finalUploadedById = uploadedById
        if (!finalUploadedById) {
            const firstUser = await prisma.user.findFirst()
            if (!firstUser) {
                return { success: false, error: 'No users found in database' }
            }
            finalUploadedById = firstUser.id
        }

        // Create database record with correct field names
        const file = await prisma.partFile.create({
            data: {
                partId,
                fileName: originalFileName,
                filePath: destPath,
                originalPath: sourcePath,
                fileType: fileType || 'OTHER',
                revision: revision || null,
                fileSize: fileStats.size,
                uploadedById: finalUploadedById,
            },
            include: {
                uploadedBy: {
                    select: { name: true },
                },
            },
        })

        return { success: true, file }
    } catch (error) {
        console.error('Attach file error:', error)
        return { success: false, error: error.message }
    }
})

// Open file in default application
ipcMain.handle('files:open', async (event, fileId) => {
    try {
        const file = await prisma.partFile.findUnique({
            where: { id: fileId },
        })

        if (!file) {
            return { success: false, error: 'File not found' }
        }

        // Check if file exists
        if (!fs.existsSync(file.filePath)) {
            return { success: false, error: 'File no longer exists in storage' }
        }

        // Open file with default application
        await shell.openPath(file.filePath)

        return { success: true }
    } catch (error) {
        console.error('Open file error:', error)
        return { success: false, error: error.message }
    }
})

// Remove file (delete from storage and database)
ipcMain.handle('files:remove', async (event, fileId) => {
    try {
        const file = await prisma.partFile.findUnique({
            where: { id: fileId },
        })

        if (!file) {
            return { success: false, error: 'File not found' }
        }

        // Delete physical file
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath)
        }

        // Delete database record
        await prisma.partFile.delete({
            where: { id: fileId },
        })

        return { success: true }
    } catch (error) {
        console.error('Remove file error:', error)
        return { success: false, error: error.message }
    }
})

// File dialog for selecting files
ipcMain.handle('files:select', async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'PDF Documents', extensions: ['pdf'] },
                { name: 'CAD Files (DXF, STEP)', extensions: ['dxf', 'step', 'stp', 'dwg'] },
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg'] },
                { name: 'Office Documents', extensions: ['doc', 'docx', 'xls', 'xlsx'] },
            ],
        })

        if (result.canceled) {
            return { success: false, canceled: true }
        }

        return { success: true, filePath: result.filePaths[0] }
    } catch (error) {
        console.error('Select file error:', error)
        return { success: false, error: error.message }
    }
})
