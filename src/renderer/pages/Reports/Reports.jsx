import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, AlertTriangle, Factory } from 'lucide-react'
import { toast } from 'sonner'

export default function Reports() {
    const { t } = useTranslation()
    const [stats, setStats] = useState(null)
    const [lowStock, setLowStock] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsResult, lowStockResult] = await Promise.all([
                window.api.getDashboardStats(),
                window.api.getLowStockReport()
            ])

            if (statsResult) {
                setStats(statsResult)
            }
            if (lowStockResult) {
                setLowStock(lowStockResult)
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <MainLayout title={t('reports.title')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout title={t('reports.title')}>
            <div className="space-y-6">
                {/* Overview Stats */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">{t('common.overview')}</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass glass-border border-t-2 border-t-blue-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    {t('inventory.totalParts')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-mono">{stats?.totalParts || 0}</div>
                            </CardContent>
                        </Card>

                        <Card className="glass glass-border border-t-2 border-t-yellow-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {t('inventory.lowStock')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-mono text-yellow-500">{stats?.lowStockCount || 0}</div>
                            </CardContent>
                        </Card>

                        <Card className="glass glass-border border-t-2 border-t-purple-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Factory className="h-4 w-4" />
                                    {t('production.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-mono">{stats?.totalOrders || 0}</div>
                            </CardContent>
                        </Card>

                        <Card className="glass glass-border border-t-2 border-t-green-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    {t('reports.completedOrders')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold font-mono text-green-500">{stats?.ordersCompleted || 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Production Stats */}
                {stats && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">{t('production.title')}</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="glass glass-border">
                                <CardHeader>
                                    <CardTitle className="text-sm">{t('reports.ordersInProgress')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold font-mono">{stats.ordersInProgress || 0}</div>
                                </CardContent>
                            </Card>

                            <Card className="glass glass-border">
                                <CardHeader>
                                    <CardTitle className="text-sm">{t('dashboard.kpi.completionRate')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold font-mono">
                                        {stats.totalOrders > 0
                                            ? Math.round((stats.ordersCompleted / stats.totalOrders) * 100)
                                            : 0}%
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass glass-border">
                                <CardHeader>
                                    <CardTitle className="text-sm">{t('suppliers.totalSuppliers')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold font-mono">{stats.suppliersCount || 0}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Critical Stock Items */}
                {lowStock && lowStock.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">{t('reports.criticalStockLevel')}</h2>
                        <Card className="glass glass-border">
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {lowStock.slice(0, 10).map((item) => (
                                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-semibold">{item.name}</div>
                                                <div className="text-sm text-muted-foreground font-mono">{item.partNumber}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold font-mono text-red-500">
                                                    {item.stockQuantity} / {item.reorderLevel}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{t('reports.currentMinLevel')}</div>
                                            </div>
                                            <Badge variant="destructive" className="ml-4">
                                                {t('inventory.lowStock')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}
