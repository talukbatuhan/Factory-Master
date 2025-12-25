import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import ExportButton from '@/components/ExportButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Eye, Factory, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'

export default function ProductionOrders() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { hasPermission } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')

    useEffect(() => {
        loadOrders()
    }, [statusFilter])

    const loadOrders = async () => {
        setLoading(true)
        try {
            const filters = {}
            if (statusFilter !== 'ALL') filters.status = statusFilter

            const result = await window.api.getAllProductionOrders(filters)
            if (result.success) {
                setOrders(result.orders)
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

    const getStatusBadge = (status) => {
        const variants = {
            PLANNED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
            CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
        }
        return <Badge className={variants[status]}>{status.replace('_', ' ')}</Badge>
    }

    const stats = {
        total: orders.length,
        planned: orders.filter(o => o.status === 'PLANNED').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
    }

    return (
        <MainLayout
            title={t('production.title')}
            actions={
                <div className="flex gap-2">
                    <ExportButton
                        data={orders}
                        columns={[
                            { header: t('production.orderNumber'), accessor: 'orderNumber' },
                            { header: t('production.part'), accessor: (row) => row.part?.name || 'N/A' },
                            { header: t('production.quantity'), accessor: 'quantity' },
                            { header: t('common.status'), accessor: 'status' },
                            { header: t('production.targetDate'), accessor: (row) => row.targetDate ? format(new Date(row.targetDate), 'MMM dd, yyyy') : 'N/A' },
                        ]}
                        title={t('production.title')}
                        filename="production-orders"
                    />
                    {hasPermission('ENGINEER') && (
                        <Button onClick={() => navigate('/production/new')} className="glow-blue">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('production.newOrder')}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="glass glass-border p-4 rounded-lg border-t-2 border-t-blue-500">
                        <div className="flex items-center gap-3">
                            <Factory className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.totalOrders')}</p>
                                <p className="text-2xl font-bold font-mono">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass glass-border p-4 rounded-lg border-t-2 border-t-yellow-500">
                        <div className="flex items-center gap-3">
                            <Factory className="h-8 w-8 text-yellow-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.statuses.IN_PROGRESS')}</p>
                                <p className="text-2xl font-bold font-mono">{stats.inProgress}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass glass-border p-4 rounded-lg border-t-2 border-t-green-500">
                        <div className="flex items-center gap-3">
                            <Factory className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.statuses.COMPLETED')}</p>
                                <p className="text-2xl font-bold font-mono">{stats.completed}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass glass-border p-4 rounded-lg border-t-2 border-t-primary">
                        <div className="flex items-center gap-3">
                            <Factory className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">{t('dashboard.kpi.completionRate')}</p>
                                <p className="text-2xl font-bold font-mono">
                                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('common.filter')} - {t('common.status')}</SelectItem>
                        <SelectItem value="PLANNED">{t('production.statuses.PLANNED')}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t('production.statuses.IN_PROGRESS')}</SelectItem>
                        <SelectItem value="COMPLETED">{t('production.statuses.COMPLETED')}</SelectItem>
                        <SelectItem value="CANCELLED">{t('production.statuses.CANCELLED')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Orders List */}
                {loading ? (
                    <div className="glass glass-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground">{t('common.loading')}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="glass glass-border rounded-lg p-12 text-center">
                        <p className="text-muted-foreground">{t('production.noOrders')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="glass glass-border hover:shadow-glow-blue transition-all cursor-pointer" onClick={() => navigate(`/production/${order.id}`)}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold font-mono">{order.orderNumber}</h3>
                                                {getStatusBadge(order.status)}
                                            </div>

                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">{order.part?.name || 'Unknown Part'}</span>
                                                <span className="text-sm font-mono">({order.part?.partNumber})</span>
                                            </div>

                                            <div className="flex gap-6 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">{t('production.quantity')}: </span>
                                                    <span className="font-bold font-mono">{order.quantity}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">{t('production.targetDate')}: </span>
                                                    <span className="font-mono">
                                                        {order.targetDate ? format(new Date(order.targetDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">{t('production.createdAt')}: </span>
                                                    <span className="font-mono">
                                                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/production/${order.id}`)
                                        }}>
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
