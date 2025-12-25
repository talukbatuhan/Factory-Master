import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import DataTable from '@/components/DataTable'
import ExportButton from '@/components/ExportButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function InventoryList() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const [parts, setParts] = useState([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [stockFilter, setStockFilter] = useState('ALL')

    useEffect(() => {
        loadParts()
    }, [typeFilter])

    const loadParts = async () => {
        setLoading(true)
        try {
            const filters = {}
            if (typeFilter !== 'ALL') filters.type = typeFilter

            const result = await window.api.getAllParts(filters)
            if (result.success) {
                let filtered = result.parts

                // Apply stock filter
                if (stockFilter === 'LOW') {
                    filtered = filtered.filter(p => p.stockQuantity <= p.reorderLevel)
                } else if (stockFilter === 'OUT') {
                    filtered = filtered.filter(p => p.stockQuantity === 0)
                } else if (stockFilter === 'IN_STOCK') {
                    filtered = filtered.filter(p => p.stockQuantity > p.reorderLevel)
                }

                setParts(filtered)
            } else {
                toast.error(result.error || t('messages.loadFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadParts()
    }, [stockFilter])

    const getStockBadge = (part) => {
        if (part.stockQuantity === 0) {
            return <Badge variant="destructive">{t('inventory.outOfStock')}</Badge>
        } else if (part.stockQuantity <= part.reorderLevel) {
            return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('inventory.lowStock')}</Badge>
        }
        return <Badge variant="success">{t('inventory.inStock')}</Badge>
    }

    const columns = [
        {
            key: 'partNumber',
            header: t('inventory.partNumber'),
            cell: (row) => <span className="font-mono text-sm">{row.partNumber}</span>
        },
        {
            key: 'name',
            header: t('inventory.name'),
            cell: (row) => <span className="font-medium">{row.name}</span>
        },
        {
            key: 'type',
            header: t('inventory.type'),
            cell: (row) => {
                const colors = {
                    PRODUCT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    ASSEMBLY: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                    COMPONENT: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    RAW_MATERIAL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                }
                return <Badge variant="outline" className={colors[row.type] || ''}>{t(`inventory.types.${row.type}`)}</Badge>
            }
        },
        {
            key: 'stockQuantity',
            header: t('inventory.stockQuantity'),
            cell: (row) => (
                <span className="font-mono font-semibold">
                    {row.stockQuantity} {row.unit}
                </span>
            )
        },
        {
            key: 'reorderLevel',
            header: t('inventory.reorderLevel'),
            cell: (row) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {row.reorderLevel} {row.unit}
                </span>
            )
        },
        {
            key: 'status',
            header: t('common.status'),
            cell: (row) => getStockBadge(row)
        },
    ]

    return (
        <MainLayout
            title={t('inventory.title')}
            actions={
                <div className="flex gap-2">
                    <ExportButton
                        data={parts}
                        columns={[
                            { header: t('inventory.partNumber'), accessor: 'partNumber' },
                            { header: t('inventory.name'), accessor: 'name' },
                            { header: t('inventory.type'), accessor: 'type' },
                            { header: t('inventory.stock'), accessor: 'stockQuantity' },
                            { header: t('inventory.reorderLevel'), accessor: 'reorderLevel' },
                        ]}
                        title={t('inventory.title')}
                        filename="inventory-list"
                    />
                    {hasPermission('ENGINEER') && (
                        <Button onClick={() => navigate('/inventory/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('inventory.addPart')}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-card border border-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.totalParts')}</p>
                                <p className="text-2xl font-bold font-mono">{parts.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.inStock')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {parts.filter(p => p.stockQuantity > p.reorderLevel).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.lowStock')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {parts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('inventory.outOfStock')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {parts.filter(p => p.stockQuantity === 0).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t('common.filter')} - {t('inventory.type')}</SelectItem>
                            <SelectItem value="PRODUCT">{t('inventory.types.PRODUCT')}</SelectItem>
                            <SelectItem value="ASSEMBLY">{t('inventory.types.ASSEMBLY')}</SelectItem>
                            <SelectItem value="COMPONENT">{t('inventory.types.COMPONENT')}</SelectItem>
                            <SelectItem value="RAW_MATERIAL">{t('inventory.types.RAW_MATERIAL')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t('common.filter')} - {t('inventory.stockQuantity')}</SelectItem>
                            <SelectItem value="IN_STOCK">{t('inventory.inStock')}</SelectItem>
                            <SelectItem value="LOW">{t('inventory.lowStock')}</SelectItem>
                            <SelectItem value="OUT">{t('inventory.outOfStock')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground">{t('common.loading')}</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={parts}
                        searchKey="name"
                        onRowClick={(row) => navigate(`/inventory/${row.id}`)}
                    />
                )}
            </div>
        </MainLayout>
    )
}
