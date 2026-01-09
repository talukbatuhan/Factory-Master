const { ipcMain, shell } = require('electron')

// Open URL in external browser
ipcMain.handle('utility:openExternal', async (event, url) => {
    try {
        if (!url) {
            return { success: false, error: 'URL is required' }
        }

        // Validate URL format
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        await shell.openExternal(url)
        return { success: true }
    } catch (error) {
        console.error('Open external URL error:', error)
        return { success: false, error: error.message }
    }
})

module.exports = {}
