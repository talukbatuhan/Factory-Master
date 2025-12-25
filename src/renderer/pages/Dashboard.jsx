import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import ProductionTrendChart from '@/components/charts/ProductionTrendChart'
import InventoryLevelChart from '@/components/charts/InventoryLevelChart'
import OrderStatusChart from '@/components/charts/OrderStatusChart'
import {
    Package,
    AlertTriangle,
    Factory,
    TrendingUp,
    ArrowRight,
    Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [stats, setStats] = useState(null)
    const [lowStock, setLowStock] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            const [statsResult, lowStockResult, ordersResult] = await Promise.all([
                window.api.getDashboardStats(),
                window.api.getLowStockReport(),
                window.api.getAllProductionOrders({ limit: 5 })
            ])

            if (statsResult) setStats(statsResult)
            if (lowStockResult) setLowStock(lowStockResult.slice(0, 5))
            if (ordersResult?.success) setRecentOrders(ordersResult.orders.slice(0, 5))
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const checkLowStockAlerts = async () => {
        try {
            const result = await window.api.checkLowStockNotifications()
            if (result.success) {
                if (result.count > 0) {
                    // Create notifications
                    for (const notif of result.notifications) {
                        await window.api.createNotification(notif)
                    }
                    toast.success(`${result.count} low stock alert(s) created`, {
                        description: 'Check the notification center'
                    })
                } else {
                    toast.info('No low stock items found')
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to check low stock')
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return t('dashboard.greetings.morning')
        if (hour < 18) return t('dashboard.greetings.afternoon')
        return t('dashboard.greetings.evening')
    }

    const getStatusBadge = (status) => {
        const variants = {
            PLANNED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
        }
        return <Badge variant="outline" className={variants[status] || ''}>{t(`production.statuses.${status}`)}</Badge>
    }

    if (loading) {
        return (
            <MainLayout title={t('dashboard.title')}>
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('dashboard.loadingDashboard')}</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout
            title={t('dashboard.title')}
            actions={
                <Button onClick={checkLowStockAlerts} variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Check Alerts
                </Button>
            }
        >
            <div className="space-y-8">
                {/* Welcome */}
                <div className="bg-card border border-border p-8 rounded-lg">
                    <h2 className="text-3xl font-bold mb-2">
                        {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>!
                    </h2>
                    <p className="text-muted-foreground">{t('dashboard.welcomeMessage')}</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border border-t-2 border-t-blue-500 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/inventory')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                {t('dashboard.kpi.totalParts')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold font-mono">{stats?.totalParts || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2">{t('dashboard.kpi.clickToView')}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border border-t-2 border-t-yellow-500 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/inventory')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {t('dashboard.kpi.lowStockAlerts')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold font-mono text-yellow-500">{stats?.lowStockCount || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2">{t('dashboard.kpi.itemsNeedReordering')}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border border-t-2 border-t-purple-500 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/production')}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Factory className="h-4 w-4" />
                                {t('dashboard.kpi.productionOrders')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold font-mono">{stats?.totalOrders || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {stats?.ordersInProgress || 0} {t('dashboard.kpi.inProgress')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border border-t-2 border-t-green-500 hover:shadow-lg transition-all">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {t('dashboard.kpi.completionRate')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold font-mono text-green-500">
                                {stats?.totalOrders > 0
                                    ? Math.round((stats.ordersCompleted / stats.totalOrders) * 100)
                                    : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{stats?.ordersCompleted || 0} {t('dashboard.kpi.ordersCompleted')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <ProductionTrendChart title="Production Trend (6 Months)" />
                    <InventoryLevelChart title="Inventory by Type" />
                    <OrderStatusChart title="Order Status" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Low Stock Items */}
                    {lowStock.length > 0 && (
                        <Card className="border-border">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        {t('dashboard.sections.lowStockItems')}
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                                        {t('common.viewAll')}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {lowStock.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/inventory/${item.id}`)}>
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground font-mono">{item.partNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold font-mono text-red-500">{item.stockQuantity}</p>
                                                <p className="text-xs text-muted-foreground">{t('common.min')}: {item.reorderLevel}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Orders */}
                    <Card className="border-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    {t('dashboard.sections.recentOrders')}
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/production')}>
                                    {t('common.viewAll')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/production/${order.id}`)}>
                                            <div>
                                                <p className="font-semibold font-mono">{order.orderNumber}</p>
                                                <p className="text-sm text-muted-foreground">{order.part?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(order.status)}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(order.createdAt), 'MMM dd')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">{t('dashboard.sections.noRecentOrders')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}
