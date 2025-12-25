import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import DataTable from '@/components/DataTable'
import ExportButton from '@/components/ExportButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function SupplierList() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState('ALL')

    useEffect(() => {
        loadSuppliers()
    }, [typeFilter])

    const loadSuppliers = async () => {
        setLoading(true)
        try {
            const filters = {}
            if (typeFilter !== 'ALL') filters.type = typeFilter

            const result = await window.api.getAllSuppliers(filters)
            if (result.success) {
                setSuppliers(result.suppliers)
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

    const columns = [
        {
            key: 'name',
            header: t('suppliers.name'),
            cell: (row) => <span className="font-semibold">{row.name}</span>
        },
        {
            key: 'type',
            header: t('inventory.type'),
            cell: (row) => {
                const colors = {
                    ONLINE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    LOCAL: 'bg-green-500/10 text-green-500 border-green-500/20',
                }
                return <Badge className={colors[row.type]}>{t(`suppliers.types.${row.type}`)}</Badge>
            }
        },
        {
            key: 'contactPerson',
            header: t('suppliers.contactPerson'),
            cell: (row) => row.contactPerson || '-'
        },
        {
            key: 'phone',
            header: t('suppliers.phone'),
            cell: (row) => row.phone || '-'
        },
        {
            key: 'email',
            header: t('suppliers.email'),
            cell: (row) => row.email || '-'
        },
        {
            key: 'partsCount',
            header: t('suppliers.parts'),
            cell: (row) => (
                <Badge variant="secondary">
                    {row._count?.supplierParts || 0} {t('suppliers.parts')}
                </Badge>
            )
        },
    ]

    return (
        <MainLayout
            title={t('suppliers.title')}
            actions={
                <div className="flex gap-2">
                    <ExportButton
                        data={suppliers}
                        columns={[
                            { header: t('suppliers.name'), accessor: 'name' },
                            { header: t('inventory.type'), accessor: 'type' },
                            { header: t('suppliers.contactPerson'), accessor: 'contactPerson' },
                            { header: t('suppliers.phone'), accessor: 'phone' },
                            { header: t('suppliers.email'), accessor: 'email' },
                        ]}
                        title={t('suppliers.title')}
                        filename="suppliers-list"
                    />
                    {hasPermission('ENGINEER') && (
                        <Button onClick={() => navigate('/suppliers/new')} className="glow-blue">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('suppliers.addSupplier')}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="glass glass-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('suppliers.totalSuppliers')}</p>
                                <p className="text-2xl font-bold font-mono">{suppliers.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass glass-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('suppliers.types.ONLINE')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {suppliers.filter(s => s.type === 'ONLINE').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="glass glass-border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('suppliers.types.LOCAL')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {suppliers.filter(s => s.type === 'LOCAL').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('suppliers.allTypes')}</SelectItem>
                        <SelectItem value="ONLINE">{t('suppliers.types.ONLINE')}</SelectItem>
                        <SelectItem value="LOCAL">{t('suppliers.types.LOCAL')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Table */}
                {loading ? (
                    <div className="glass glass-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground">{t('common.loading')}</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={suppliers}
                        searchKey="name"
                        onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
                    />
                )}
            </div>
        </MainLayout>
    )
}
