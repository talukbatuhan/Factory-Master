const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

// Settings storage
let settings = {
    dateFormat: 'ISO 8601 (YYYY-MM-DD)',
    currency: 'USD',
    unitSystem: 'Metric',
    theme: 'dark',
    language: 'en',
}

ipcMain.handle('settings:get', async () => {
    return { success: true, settings }
})

ipcMain.handle('settings:save', async (event, newSettings) => {
    try {
        settings = { ...newSettings }
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('system:backupDatabase', async () => {
    try {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Backup Database',
            defaultPath: path.join(app.getPath('documents'), `factorymaster-backup-${Date.now()}.db`),
            filters: [
                { name: 'Database Files', extensions: ['db'] },
            ],
        })

        if (canceled || !filePath) {
            return { success: false, error: 'Backup cancelled' }
        }

        const dbPath = path.join(__dirname, '../../prisma/dev.db')
        fs.copyFileSync(dbPath, filePath)

        return { success: true, path: filePath }
    } catch (error) {
        console.error('Backup error:', error)
        return { success: false, error: error.message }
    }
})
