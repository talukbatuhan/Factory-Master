const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = !app.isPackaged

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Commented out for development - only needed for production builds
// if (require('electron-squirrel-startup')) {
//     app.quit()
// }

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#09090b', // Zinc-950
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false // Required for some file system operations if strictly sandboxed
        },
        show: false // Don't show until ready-to-show
    })

    // Load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Remove menu for production feel
    mainWindow.setMenuBarVisibility(false)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
    createWindow()

    // Load IPC handlers
    try {
        require('./ipc/auth')
        require('./ipc/parts')
        require('./ipc/bom')
        require('./ipc/files')
        require('./ipc/suppliers')
        require('./ipc/processes')
        require('./ipc/production')
        require('./ipc/inventory')
        require('./ipc/reports')
        require('./ipc/settings')
        require('./ipc/search')
        require('./ipc/notifications')
        require('./services/notificationService')
        console.log('All IPC handlers loaded successfully')
    } catch (error) {
        console.error('Error loading IPC handlers:', error)
    }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Helper for other files to access app paths
module.exports = { app, mainWindow }
