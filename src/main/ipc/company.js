const { ipcMain } = require('electron')
const getPrismaClient = require('../database/client')
const fs = require('fs').promises
const path = require('path')
const { app } = require('electron')

const prisma = getPrismaClient()

// Check if initial setup is needed
ipcMain.handle('company:checkSetupNeeded', async () => {
    try {
        const companyCount = await prisma.company.count()
        return { success: true, needsSetup: companyCount === 0 }
    } catch (error) {
        console.error('Setup check error:', error)
        return { success: false, error: error.message }
    }
})

// Get default company (for login display)
ipcMain.handle('company:getDefault', async () => {
    try {
        const company = await prisma.company.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { isDefault: 'desc' }
        })
        return company
    } catch (error) {
        console.error('Get default company error:', error)
        return null
    }
})

// Get all companies
ipcMain.handle('company:getAll', async () => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        users: true,
                        parts: true,
                        productionOrders: true,
                        suppliers: true
                    }
                }
            }
        })
        return { success: true, companies }
    } catch (error) {
        console.error('Get companies error:', error)
        return { success: false, error: error.message }
    }
})

// Get single company by ID
ipcMain.handle('company:get', async (event, companyId) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                _count: {
                    select: {
                        users: true,
                        parts: true,
                        productionOrders: true,
                        suppliers: true
                    }
                }
            }
        })

        if (!company) {
            return { success: false, error: 'Company not found' }
        }

        return { success: true, company }
    } catch (error) {
        console.error('Get company error:', error)
        return { success: false, error: error.message }
    }
})

// Create new company with initial admin user
ipcMain.handle('company:create', async (event, data) => {
    try {
        const { company: companyData, admin: adminData } = data
        const bcrypt = require('bcryptjs')

        // Check if this is the first company
        const companyCount = await prisma.company.count()
        const isFirst = companyCount === 0

        // Create company and admin user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create company
            const company = await tx.company.create({
                data: {
                    name: companyData.name,
                    taxId: companyData.taxId || null,
                    phone: companyData.phone || null,
                    email: companyData.email || null,
                    address: companyData.address || null,
                    website: companyData.website || null,
                    logo: companyData.logo || null,
                    isDefault: isFirst,
                    status: 'ACTIVE'
                }
            })

            // Create admin user if adminData provided
            let admin = null
            if (adminData) {
                const passwordHash = await bcrypt.hash(adminData.password, 10)
                admin = await tx.user.create({
                    data: {
                        companyId: company.id,
                        email: adminData.email,
                        name: adminData.name,
                        passwordHash,
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                })
            }

            return { company, admin }
        })

        const { admin, ...returnData } = result
        if (admin) {
            const { passwordHash, ...adminWithoutPassword } = admin
            returnData.admin = adminWithoutPassword
        }

        return { success: true, ...returnData }
    } catch (error) {
        console.error('Create company error:', error)
        return { success: false, error: error.message }
    }
})

// Update company
ipcMain.handle('company:update', async (event, companyId, data) => {
    try {
        const updateData = {}
        const validFields = ['name', 'taxId', 'phone', 'email', 'address', 'website', 'logo', 'status']

        validFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field]
            }
        })

        const company = await prisma.company.update({
            where: { id: companyId },
            data: updateData
        })

        return { success: true, company }
    } catch (error) {
        console.error('Update company error:', error)
        return { success: false, error: error.message }
    }
})

// Delete company (with all associated data - cascade)
ipcMain.handle('company:delete', async (event, companyId) => {
    try {
        // Check if this is the last company
        const companyCount = await prisma.company.count()
        if (companyCount <= 1) {
            return { success: false, error: 'Cannot delete the last company. At least one company must exist.' }
        }

        await prisma.company.delete({
            where: { id: companyId }
        })

        return { success: true }
    } catch (error) {
        console.error('Delete company error:', error)
        return { success: false, error: error.message }
    }
})

// Export company data (backup)
ipcMain.handle('company:export', async (event, companyId) => {
    try {
        // Fetch all company data with relations
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        passwordHash: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                parts: {
                    include: {
                        revisions: true,
                        files: true,
                        supplierParts: true,
                        process: {
                            include: {
                                steps: true
                            }
                        },
                        bomParent: true,
                        bomChildren: true
                    }
                },
                suppliers: {
                    include: {
                        supplierParts: true
                    }
                },
                productionOrders: true,
                inventoryTransactions: true
            }
        })

        if (!company) {
            return { success: false, error: 'Company not found' }
        }

        // Create backup object
        const backup = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            company,
            metadata: {
                userCount: company.users.length,
                partCount: company.parts.length,
                supplierCount: company.suppliers.length,
                orderCount: company.productionOrders.length,
                transactionCount: company.inventoryTransactions.length
            }
        }

        // Save to file
        const { dialog } = require('electron')
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Export Company Data',
            defaultPath: `${company.name.replace(/[^a-z0-9]/gi, '_')}_backup_${Date.now()}.json`,
            filters: [
                { name: 'JSON Files', extensions: ['json'] }
            ]
        })

        if (canceled || !filePath) {
            return { success: false, error: 'Export cancelled' }
        }

        await fs.writeFile(filePath, JSON.stringify(backup, null, 2), 'utf8')

        return { success: true, filePath, metadata: backup.metadata }
    } catch (error) {
        console.error('Export company error:', error)
        return { success: false, error: error.message }
    }
})

// Import company data (restore)
ipcMain.handle('company:import', async (event) => {
    try {
        const { dialog } = require('electron')
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: 'Import Company Data',
            filters: [
                { name: 'JSON Files', extensions: ['json'] }
            ],
            properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0) {
            return { success: false, error: 'Import cancelled' }
        }

        const filePath = filePaths[0]
        const fileContent = await fs.readFile(filePath, 'utf8')
        const backup = JSON.parse(fileContent)

        if (!backup.company) {
            return { success: false, error: 'Invalid backup file format' }
        }

        const bcrypt = require('bcryptjs')

        // Import in transaction
        const result = await prisma.$transaction(async (tx) => {
            const { users, parts, suppliers, productionOrders, inventoryTransactions, ...companyData } = backup.company

            // Remove IDs to let database generate new ones
            delete companyData.id
            delete companyData.createdAt
            delete companyData.updatedAt
            companyData.isDefault = false

            // Create new company
            const newCompany = await tx.company.create({
                data: companyData
            })

            // Map old IDs to new IDs
            const userIdMap = {}
            const partIdMap = {}
            const supplierIdMap = {}

            // Import users
            for (const user of users) {
                const oldId = user.id
                delete user.id
                delete user.createdAt
                delete user.updatedAt

                const newUser = await tx.user.create({
                    data: {
                        ...user,
                        companyId: newCompany.id
                    }
                })
                userIdMap[oldId] = newUser.id
            }

            // Import suppliers
            for (const supplier of suppliers) {
                const { supplierParts, ...supplierData } = supplier
                const oldId = supplierData.id
                delete supplierData.id
                delete supplierData.createdAt
                delete supplierData.updatedAt

                const newSupplier = await tx.supplier.create({
                    data: {
                        ...supplierData,
                        companyId: newCompany.id
                    }
                })
                supplierIdMap[oldId] = newSupplier.id
            }

            // Import parts with relations
            for (const part of parts) {
                const { revisions, files, supplierParts, process, bomParent, bomChildren, productionOrders: partOrders, transactions: partTransactions, ...partData } = part
                const oldId = partData.id
                delete partData.id
                delete partData.createdAt
                delete partData.updatedAt

                const newPart = await tx.part.create({
                    data: {
                        ...partData,
                        companyId: newCompany.id
                    }
                })
                partIdMap[oldId] = newPart.id

                // Import part revisions
                if (revisions && revisions.length > 0) {
                    for (const revision of revisions) {
                        delete revision.id
                        delete revision.createdAt
                        await tx.partRevision.create({
                            data: {
                                ...revision,
                                partId: newPart.id
                            }
                        })
                    }
                }

                // Import process and steps
                if (process) {
                    const { steps, ...processData } = process
                    delete processData.id
                    delete processData.createdAt
                    delete processData.updatedAt

                    const newProcess = await tx.process.create({
                        data: {
                            ...processData,
                            partId: newPart.id
                        }
                    })

                    if (steps && steps.length > 0) {
                        for (const step of steps) {
                            delete step.id
                            await tx.processStep.create({
                                data: {
                                    ...step,
                                    processId: newProcess.id
                                }
                            })
                        }
                    }
                }
            }

            // Import BOM items (after all parts are created)
            for (const part of parts) {
                if (part.bomParent && part.bomParent.length > 0) {
                    for (const bomItem of part.bomParent) {
                        const newPartId = partIdMap[bomItem.partId]
                        const newComponentId = partIdMap[bomItem.componentPartId]

                        if (newPartId && newComponentId) {
                            await tx.bOMItem.create({
                                data: {
                                    partId: newPartId,
                                    componentPartId: newComponentId,
                                    quantity: bomItem.quantity,
                                    unit: bomItem.unit
                                }
                            })
                        }
                    }
                }
            }

            // Import supplier parts
            for (const supplier of suppliers) {
                if (supplier.supplierParts && supplier.supplierParts.length > 0) {
                    for (const sp of supplier.supplierParts) {
                        const newSupplierId = supplierIdMap[sp.supplierId]
                        const newPartId = partIdMap[sp.partId]

                        if (newSupplierId && newPartId) {
                            delete sp.id
                            await tx.supplierPart.create({
                                data: {
                                    ...sp,
                                    supplierId: newSupplierId,
                                    partId: newPartId
                                }
                            })
                        }
                    }
                }
            }

            // Import production orders
            for (const order of productionOrders) {
                delete order.id
                delete order.createdAt
                delete order.updatedAt

                await tx.productionOrder.create({
                    data: {
                        ...order,
                        companyId: newCompany.id,
                        partId: partIdMap[order.partId] || order.partId,
                        createdById: order.createdById ? (userIdMap[order.createdById] || null) : null
                    }
                })
            }

            // Import inventory transactions
            for (const transaction of inventoryTransactions) {
                delete transaction.id
                delete transaction.createdAt

                await tx.inventoryTransaction.create({
                    data: {
                        ...transaction,
                        companyId: newCompany.id,
                        partId: partIdMap[transaction.partId] || transaction.partId,
                        recordedById: transaction.recordedById ? (userIdMap[transaction.recordedById] || null) : null
                    }
                })
            }

            return newCompany
        })

        return { success: true, company: result }
    } catch (error) {
        console.error('Import company error:', error)
        return { success: false, error: error.message }
    }
})

// Upload company logo
ipcMain.handle('company:uploadLogo', async (event, companyId) => {
    try {
        const { dialog } = require('electron')
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: 'Select Company Logo',
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }
            ],
            properties: ['openFile']
        })

        if (canceled || !filePaths || filePaths.length === 0) {
            return { success: false, error: 'Logo selection cancelled' }
        }

        const sourcePath = filePaths[0]
        const ext = path.extname(sourcePath)
        const filename = `company_${companyId}_${Date.now()}${ext}`

        // Create logos directory in userData
        const userDataPath = app.getPath('userData')
        const logosDir = path.join(userDataPath, 'logos')

        try {
            await fs.mkdir(logosDir, { recursive: true })
        } catch (err) {
            // Directory might already exist
        }

        const destPath = path.join(logosDir, filename)

        // Copy file
        await fs.copyFile(sourcePath, destPath)

        // Update company
        const company = await prisma.company.update({
            where: { id: companyId },
            data: { logo: filename }
        })

        return { success: true, logo: filename, company }
    } catch (error) {
        console.error('Upload logo error:', error)
        return { success: false, error: error.message }
    }
})

// Get logo path for renderer
ipcMain.handle('company:getLogoPath', async (event, filename) => {
    try {
        if (!filename) {
            return { success: true, path: null }
        }

        const userDataPath = app.getPath('userData')
        const logoPath = path.join(userDataPath, 'logos', filename)

        // Check if file exists
        try {
            await fs.access(logoPath)
            return { success: true, path: logoPath }
        } catch {
            return { success: true, path: null }
        }
    } catch (error) {
        console.error('Get logo path error:', error)
        return { success: false, error: error.message }
    }
})

module.exports = {}
