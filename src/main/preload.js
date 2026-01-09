const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use ipcRenderer
contextBridge.exposeInMainWorld('api', {
    // Auth
    login: (email, password) => ipcRenderer.invoke('auth:login', email, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),

    // Company
    checkSetupNeeded: () => ipcRenderer.invoke('company:checkSetupNeeded'),
    getDefaultCompany: () => ipcRenderer.invoke('company:getDefault'),
    getAllCompanies: () => ipcRenderer.invoke('company:getAll'),
    getCompany: (companyId) => ipcRenderer.invoke('company:get', companyId),
    createCompany: (data) => ipcRenderer.invoke('company:create', data),
    updateCompany: (companyId, data) => ipcRenderer.invoke('company:update', companyId, data),
    deleteCompany: (companyId) => ipcRenderer.invoke('company:delete', companyId),
    exportCompany: (companyId) => ipcRenderer.invoke('company:export', companyId),
    importCompany: () => ipcRenderer.invoke('company:import'),
    uploadCompanyLogo: (companyId) => ipcRenderer.invoke('company:uploadLogo', companyId),
    getCompanyLogoPath: (filename) => ipcRenderer.invoke('company:getLogoPath', filename),

    // Parts
    getAllParts: (filters) => ipcRenderer.invoke('parts:getAll', filters),
    getPartById: (id) => ipcRenderer.invoke('parts:getById', id),
    getPartTree: () => ipcRenderer.invoke('parts:getTree'),
    createPart: (data) => ipcRenderer.invoke('parts:create', data),
    updatePart: (id, data) => ipcRenderer.invoke('parts:update', id, data),
    deletePart: (id) => ipcRenderer.invoke('parts:delete', id),

    // BOM
    getBOMForPart: (partId, options) => ipcRenderer.invoke('bom:getForPart', partId, options),
    addBOMItem: (data) => ipcRenderer.invoke('bom:addComponent', data),
    addBOMComponent: (data) => ipcRenderer.invoke('bom:addComponent', data), // Alias for compatibility
    updateBOMItem: (bomItemId, updates) => ipcRenderer.invoke('bom:updateItem', bomItemId, updates),
    updateBOMQuantity: (bomItemId, quantity) =>
        ipcRenderer.invoke('bom:updateQuantity', bomItemId, quantity),
    deleteBOMItem: (bomItemId) => ipcRenderer.invoke('bom:removeComponent', bomItemId),
    removeBOMComponent: (data) => ipcRenderer.invoke('bom:removeComponent', data), // Alias for compatibility
    bulkAddBOMComponents: (partId, components) => ipcRenderer.invoke('bom:bulkAddComponents', partId, components),

    // Files
    getFilesForPart: (partId) => ipcRenderer.invoke('files:getForPart', partId),
    attachFile: (data) => ipcRenderer.invoke('files:attach', data),
    openFile: (fileId) => ipcRenderer.invoke('files:open', fileId),
    removeFile: (fileId) => ipcRenderer.invoke('files:remove', fileId),
    selectFile: () => ipcRenderer.invoke('files:select'),

    // Revisions
    getRevisionsForPart: (partId) => ipcRenderer.invoke('revisions:getForPart', partId),

    // Suppliers
    getAllSuppliers: (filters) => ipcRenderer.invoke('suppliers:getAll', filters),
    getSupplierById: (id) => ipcRenderer.invoke('suppliers:getById', id),
    createSupplier: (data) => ipcRenderer.invoke('suppliers:create', data),
    updateSupplier: (id, data) => ipcRenderer.invoke('suppliers:update', id, data),
    deleteSupplier: (id) => ipcRenderer.invoke('suppliers:delete', id),
    assignPartToSupplier: (supplierId, partId, data) =>
        ipcRenderer.invoke('suppliers:assignPart', supplierId, partId, data),
    removePartFromSupplier: (supplierId, partId) =>
        ipcRenderer.invoke('suppliers:removePart', supplierId, partId),

    // Processes
    getAllProcesses: () => ipcRenderer.invoke('processes:getAll'),
    getProcessById: (id) => ipcRenderer.invoke('processes:getById', id),
    createProcess: (data) => ipcRenderer.invoke('processes:create', data),
    updateProcess: (id, data) => ipcRenderer.invoke('processes:update', id, data),
    deleteProcess: (id) => ipcRenderer.invoke('processes:delete', id),
    updateStepStatus: (stepId, status) => ipcRenderer.invoke('processes:updateStepStatus', stepId, status),

    // Production Orders
    getAllOrders: (filters) => ipcRenderer.invoke('production:getAll', filters),
    getOrderById: (id) => ipcRenderer.invoke('production:getById', id),
    createOrder: (data) => ipcRenderer.invoke('production:create', data),
    updateOrder: (id, data) => ipcRenderer.invoke('production:update', id, data),
    updateOrderStatus: (id, status) => ipcRenderer.invoke('production:updateStatus', id, status),
    getAllProductionOrders: (filters) => ipcRenderer.invoke('production:getAll', filters),
    getProductionOrderById: (id) => ipcRenderer.invoke('production:getById', id),
    createProductionOrder: (data) => ipcRenderer.invoke('production:create', data),
    updateProductionOrderStatus: (id, status) => ipcRenderer.invoke('production:updateStatus', id, status),
    deleteProductionOrder: (id) => ipcRenderer.invoke('production:delete', id),

    // Inventory
    getInventoryHistory: (partId) => ipcRenderer.invoke('inventory:getHistory', partId),
    recordInventoryTransaction: (data) => ipcRenderer.invoke('inventory:record', data),
    recordTransaction: (data) => ipcRenderer.invoke('inventory:record', data), // Keep alias for backward compatibility
    getLowStockParts: () => ipcRenderer.invoke('inventory:getLowStock'),

    // Users (Admin only)
    getAllUsers: () => ipcRenderer.invoke('users:getAll'),
    createUser: (data) => ipcRenderer.invoke('users:create', data),
    updateUser: (id, data) => ipcRenderer.invoke('users:update', id, data),
    deleteUser: (id) => ipcRenderer.invoke('users:delete', id),

    // Reports
    getDashboardStats: () => ipcRenderer.invoke('reports:getStats'),
    getInventoryValuation: () => ipcRenderer.invoke('reports:getInventoryValuation'),
    getProductionStats: (days) => ipcRenderer.invoke('reports:getProductionStats', days),
    getLowStockReport: () => ipcRenderer.invoke('reports:getLowStock'),

    // System
    backupDatabase: () => ipcRenderer.invoke('system:backupDatabase'),
    getSystemSettings: () => ipcRenderer.invoke('settings:get'),
    saveSystemSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

    // Search
    searchParts: (query) => ipcRenderer.invoke('search:parts', query),
    searchProductionOrders: (query) => ipcRenderer.invoke('search:orders', query),
    searchSuppliers: (query) => ipcRenderer.invoke('search:suppliers', query),

    // Notifications
    getNotifications: () => ipcRenderer.invoke('notifications:getAll'),
    markNotificationAsRead: (id) => ipcRenderer.invoke('notifications:markAsRead', id),
    markAllNotificationsAsRead: () => ipcRenderer.invoke('notifications:markAllAsRead'),
    deleteNotification: (id) => ipcRenderer.invoke('notifications:delete', id),
    createNotification: (notification) => ipcRenderer.invoke('notifications:create', notification),
    checkLowStockNotifications: () => ipcRenderer.invoke('notifications:checkLowStock'),
    createOrderNotification: (data) => ipcRenderer.invoke('notifications:createOrderNotification', data),

    // Utility
    openExternal: (url) => ipcRenderer.invoke('utility:openExternal', url),
})
