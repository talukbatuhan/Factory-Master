import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Edit, Package, FileText, Truck, History, Plus, Trash2, GitBranch, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PartDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()
    const [part, setPart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    // BOM State
    const [bom, setBom] = useState([])
    const [showBOMDialog, setShowBOMDialog] = useState(false)
    const [bomFormData, setBomFormData] = useState({ componentPartId: '', quantity: 1 })
    const [availableParts, setAvailableParts] = useState([])

    // Suppliers State
    const [suppliers, setSuppliers] = useState([])

    // Files State
    const [files, setFiles] = useState([])
    const [showFileUpload, setShowFileUpload] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // History State
    const [transactions, setTransactions] = useState([])

    // Stock Adjustment State
    const [showStockDialog, setShowStockDialog] = useState(false)
    const [stockFormData, setStockFormData] = useState({ type: 'IN', quantity: 0, notes: '' })

    useEffect(() => {
        loadPartDetails()
        loadAvailableParts()
    }, [id])

    const loadPartDetails = async () => {
        try {
            const result = await window.api.getPartById(id)
            if (result.success) {
                setPart(result.part)
                await loadBOM()
                await loadSuppliers()
                await loadFiles()
                await loadTransactions()
            } else {
                toast.error(t('messages.loadFailed'))
                navigate('/inventory')
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const loadBOM = async () => {
        try {
            const result = await window.api.getBOMForPart(id)
            if (result.success) {
                setBom(result.bom)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const loadSuppliers = async () => {
        try {
            const result = await window.api.getPartById(id)
            if (result.success && result.part.supplierParts) {
                setSuppliers(result.part.supplierParts)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const loadFiles = async () => {
        try {
            const result = await window.api.getFilesForPart(id)
            if (result.success) {
                setFiles(result.files)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const loadTransactions = async () => {
        try {
            const result = await window.api.getInventoryHistory({ partId: id })
            if (result.success) {
                setTransactions(result.transactions)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const loadAvailableParts = async () => {
        try {
            const result = await window.api.getAllParts({})
            if (result.success) {
                setAvailableParts(result.parts.filter(p => p.id !== id))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddBOMComponent = async () => {
        try {
            const result = await window.api.addBOMComponent({
                partId: id,
                componentPartId: bomFormData.componentPartId,
                quantity: bomFormData.quantity,
                unit: 'pcs'
            })

            if (result.success) {
                toast.success(t('bom.componentAdded'))
                setShowBOMDialog(false)
                setBomFormData({ componentPartId: '', quantity: 1 })
                loadBOM()
            } else {
                toast.error(result.error || t('messages.saveFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.saveFailed'))
        }
    }

    const handleRemoveBOMComponent = async (componentId) => {
        if (!confirm(t('bom.removeConfirm'))) return

        try {
            const result = await window.api.removeBOMComponent({
                partId: id,
                componentPartId: componentId
            })

            if (result.success) {
                toast.success(t('bom.componentRemoved'))
                loadBOM()
            } else {
                toast.error(t('messages.deleteFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.deleteFailed'))
        }
    }

    const handleStockAdjustment = async () => {
        try {
            const adjustedQuantity = stockFormData.type === 'IN'
                ? stockFormData.quantity
                : -stockFormData.quantity

            const result = await window.api.recordInventoryTransaction({
                partId: id,
                type: stockFormData.type,
                quantity: adjustedQuantity,
                notes: stockFormData.notes
            })

            if (result.success) {
                toast.success(t('inventory.stockAdjusted'))
                setShowStockDialog(false)
                setStockFormData({ type: 'IN', quantity: 0, notes: '' })
                loadPartDetails()
            } else {
                toast.error(result.error || t('messages.saveFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.saveFailed'))
        }
    }

    const getStockBadge = () => {
        if (!part) return null
        if (part.stockQuantity === 0) {
            return <Badge variant="destructive">{t('inventory.outOfStock')}</Badge>
        } else if (part.stockQuantity <= part.reorderLevel) {
            return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('inventory.lowStock')}</Badge>
        }
        return <Badge variant="success" className="bg-green-500/10 text-green-500 border-green-500/20">{t('inventory.inStock')}</Badge>
    }

    const getTypeBadge = (type) => {
        const colors = {
            PRODUCT: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            ASSEMBLY: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            COMPONENT: 'bg-green-500/10 text-green-500 border-green-500/20',
            RAW_MATERIAL: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        }
        return <Badge className={colors[type] || ''}>{type}</Badge>
    }

    // File Handlers
    const handleFileUpload = async () => {
        try {
            // Open file picker dialog
            const fileResult = await window.api.selectFile()

            if (fileResult.canceled || !fileResult.success) {
                return
            }

            setIsUploading(true)

            // Attach file to part
            const result = await window.api.attachFile({
                partId: id,
                filePath: fileResult.filePath,
                fileType: 'OTHER', // Can be categorized later
                uploadedById: null // Will use first user as fallback
            })

            if (result.success) {
                toast.success('File uploaded successfully')
                setShowFileUpload(false)
                await loadFiles()
            } else {
                toast.error(result.error || 'Upload failed')
            }
        } catch (error) {
            console.error(error)
            toast.error('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownloadFile = async (file) => {
        try {
            // Open file in default application
            const result = await window.api.openFile(file.id)
            if (result.success) {
                toast.success('Opening file...')
            } else {
                toast.error('Cannot open file')
            }
        } catch (error) {
            console.error(error)
            toast.error('Cannot open file')
        }
    }

    const handleDeleteFile = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            const result = await window.api.removeFile(fileId)
            if (result.success) {
                toast.success('File deleted')
                await loadFiles()
            } else {
                toast.error('Delete failed')
            }
        } catch (error) {
            console.error(error)
            toast.error('Delete failed')
        }
    }

    if (loading) {
        return (
            <MainLayout title={t('inventory.partDetails')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </MainLayout>
        )
    }

    if (!part) {
        return (
            <MainLayout title={t('inventory.partNotFound')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('inventory.partNotFound')}</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout
            title={part.name}
            actions={
                <>
                    <Button variant="ghost" onClick={() => navigate('/inventory')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back')}
                    </Button>
                    <Button variant="outline" onClick={() => setShowStockDialog(true)}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t('inventory.adjustStock')}
                    </Button>
                    <Button onClick={() => navigate(`/inventory/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Header Card */}
                <Card className="border-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{part.name}</h2>
                                    {getTypeBadge(part.type)}
                                    {getStockBadge()}
                                </div>
                                <p className="text-muted-foreground font-mono">{part.partNumber}</p>
                                {part.description && <p className="text-sm">{part.description}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold font-mono">{part.stockQuantity}</p>
                                <p className="text-sm text-muted-foreground">{part.unit}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 mt-6 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.materialType')}</p>
                                <p className="font-medium">{part.materialType || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.reorderLevel')}</p>
                                <p className="font-medium font-mono">{part.reorderLevel} {part.unit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.unit')}</p>
                                <p className="font-medium">{part.unit}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs - Modern Design */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-card border border-border rounded-lg p-1.5 mb-6 h-auto">
                        <TabsTrigger
                            value="overview"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md px-4 py-2.5"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('common.overview')}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="bom"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md px-4 py-2.5"
                        >
                            <GitBranch className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('bom.title')}</span>
                            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                                {bom.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="suppliers"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md px-4 py-2.5"
                        >
                            <Truck className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('suppliers.title')}</span>
                            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                                {suppliers.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="files"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md px-4 py-2.5"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('common.files')}</span>
                            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                                {files.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 rounded-md px-4 py-2.5"
                        >
                            <History className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('common.history')}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <Card className="glass glass-border">
                            <CardHeader>
                                <CardTitle>{t('inventory.partInformation')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('inventory.partNumber')}</p>
                                        <p className="font-mono font-medium">{part.partNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('inventory.type')}</p>
                                        <div className="mt-1">{getTypeBadge(part.type)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('inventory.currentStock')}</p>
                                        <p className="font-mono font-bold text-lg">{part.stockQuantity} {part.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('inventory.reorderLevel')}</p>
                                        <p className="font-mono font-medium">{part.reorderLevel} {part.unit}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BOM Tab */}
                    <TabsContent value="bom">
                        <Card className="glass glass-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Bill of Materials</CardTitle>
                                    <Button onClick={() => setShowBOMDialog(true)} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Component
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {bom.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No components in BOM</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Component</TableHead>
                                                <TableHead>Part Number</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bom.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.componentPart?.name}</TableCell>
                                                    <TableCell className="font-mono text-sm">{item.componentPart?.partNumber}</TableCell>
                                                    <TableCell className="font-mono">{item.quantity}</TableCell>
                                                    <TableCell>{item.unit}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveBOMComponent(item.componentPartId)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Suppliers Tab */}
                    <TabsContent value="suppliers">
                        <Card className="glass glass-border">
                            <CardHeader>
                                <CardTitle>Suppliers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {suppliers.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No suppliers assigned</p>
                                ) : (
                                    <div className="space-y-3">
                                        {suppliers.map((sp) => (
                                            <div key={sp.id} className="glass rounded-lg p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{sp.supplier?.name}</p>
                                                    {sp.supplierSKU && (
                                                        <p className="text-sm text-muted-foreground font-mono">SKU: {sp.supplierSKU}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {sp.unitPrice && (
                                                        <p className="font-mono font-bold">${sp.unitPrice}</p>
                                                    )}
                                                    {sp.leadTimeDays && (
                                                        <p className="text-sm text-muted-foreground">{sp.leadTimeDays} days lead time</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files">
                        <Card className="border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Files & Documents</CardTitle>
                                    <Button onClick={() => setShowFileUpload(true)} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Upload File
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {files.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {files.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium">{file.fileName}</p>
                                                        {file.fileType && (
                                                            <p className="text-sm text-muted-foreground">{file.fileType}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadFile(file)}
                                                    >
                                                        Open
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteFile(file.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card className="glass glass-border">
                            <CardHeader>
                                <CardTitle>Inventory History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {transactions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No transactions</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Balance After</TableHead>
                                                <TableHead>Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{tx.type}</Badge>
                                                    </TableCell>
                                                    <TableCell className={`font-mono font-bold ${tx.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                                    </TableCell>
                                                    <TableCell className="font-mono">{tx.balanceAfter}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{tx.notes || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* BOM Dialog */}
            <Dialog open={showBOMDialog} onOpenChange={setShowBOMDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Component to BOM</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Component Part</label>
                            <Select value={bomFormData.componentPartId} onValueChange={(val) => setBomFormData({ ...bomFormData, componentPartId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select part..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableParts.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({p.partNumber})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                                type="number"
                                value={bomFormData.quantity}
                                onChange={(e) => setBomFormData({ ...bomFormData, quantity: parseFloat(e.target.value) || 1 })}
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBOMDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddBOMComponent} disabled={!bomFormData.componentPartId}>
                            Add Component
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stock Adjustment Dialog */}
            <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Transaction Type</label>
                            <Select value={stockFormData.type} onValueChange={(val) => setStockFormData({ ...stockFormData, type: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IN">Stock In (Add)</SelectItem>
                                    <SelectItem value="OUT">Stock Out (Remove)</SelectItem>
                                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                                type="number"
                                value={stockFormData.quantity}
                                onChange={(e) => setStockFormData({ ...stockFormData, quantity: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Input
                                value={stockFormData.notes}
                                onChange={(e) => setStockFormData({ ...stockFormData, notes: e.target.value })}
                                placeholder="Optional notes..."
                            />
                        </div>
                        <div className="glass rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">Current Stock: <span className="font-bold font-mono">{part.stockQuantity}</span></p>
                            <p className="text-sm text-muted-foreground">After Adjustment: <span className="font-bold font-mono">
                                {stockFormData.type === 'IN'
                                    ? part.stockQuantity + stockFormData.quantity
                                    : part.stockQuantity - stockFormData.quantity}
                            </span></p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowStockDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStockAdjustment} disabled={stockFormData.quantity <= 0}>
                            {stockFormData.type === 'IN' ? <TrendingUp className="mr-2 h-4 w-4" /> : <TrendingDown className="mr-2 h-4 w-4" />}
                            Adjust Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* File Upload Dialog */}
            <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Click "Select & Upload" to choose a file from your computer.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supported: PDF, Office docs, CAD files (DWG, STEP), Images
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFileUpload(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Select & Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    )
}
