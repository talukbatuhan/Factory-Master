import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Edit, Package, Check } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function OrderDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()
    const [order, setOrder] = useState(null)
    const [bom, setBom] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrder()
    }, [id])

    const loadOrder = async () => {
        try {
            const result = await window.api.getProductionOrderById(id)
            if (result.success) {
                setOrder(result.order)
                if (result.order.partId) {
                    await loadBOM(result.order.partId)
                }
            } else {
                toast.error('Failed to load order')
                navigate('/production')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load order')
        } finally {
            setLoading(false)
        }
    }

    const loadBOM = async (partId) => {
        try {
            const result = await window.api.getBOMForPart(partId)
            if (result.success) {
                setBom(result.bom)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleStatusChange = async (newStatus) => {
        try {
            const result = await window.api.updateProductionOrderStatus(id, newStatus)
            if (result.success) {
                toast.success(t('messages.updateSuccess'))
                loadOrder()
            } else {
                toast.error(t('messages.updateFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.updateFailed'))
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

    if (loading) {
        return (
            <MainLayout title={t('production.orderDetails')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </MainLayout>
        )
    }

    if (!order) {
        return (
            <MainLayout title={t('production.orderNotFound')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('production.orderNotFound')}</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout
            title={`${t('production.order')} ${order.orderNumber}`}
            actions={
                <Button variant="ghost" onClick={() => navigate('/production')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back')}
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Order Header */}
                <Card className="glass glass-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold font-mono">{order.orderNumber}</h2>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">{order.part?.name || 'Unknown Part'}</span>
                                    <span className="text-sm font-mono">({order.part?.partNumber})</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold font-mono">{order.quantity}</p>
                                <p className="text-sm text-muted-foreground">{t('production.unitsToProduce')}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 mt-6 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.startDate')}</p>
                                <p className="font-medium font-mono">
                                    {order.startDate ? format(new Date(order.startDate), 'MMM dd, yyyy') : t('production.notSet')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.targetDate')}</p>
                                <p className="font-medium font-mono">
                                    {order.targetDate ? format(new Date(order.targetDate), 'MMM dd, yyyy') : t('production.notSet')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('production.completionDate')}</p>
                                <p className="font-medium font-mono">
                                    {order.completionDate ? format(new Date(order.completionDate), 'MMM dd, yyyy') : '-'}
                                </p>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-sm text-muted-foreground">{t('production.notes')}</p>
                                <p className="text-sm mt-1">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Control */}
                <Card className="glass glass-border">
                    <CardHeader>
                        <CardTitle>{t('production.orderStatus')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Select value={order.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLANNED">{t('production.statuses.PLANNED')}</SelectItem>
                                    <SelectItem value="IN_PROGRESS">{t('production.statuses.IN_PROGRESS')}</SelectItem>
                                    <SelectItem value="COMPLETED">{t('production.statuses.COMPLETED')}</SelectItem>
                                    <SelectItem value="CANCELLED">{t('production.statuses.CANCELLED')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">{t('production.changeStatusHint')}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* BOM Requirements */}
                {bom.length > 0 && (
                    <Card className="glass glass-border">
                        <CardHeader>
                            <CardTitle>{t('production.materialRequirements')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bom.map((item) => {
                                    const required = item.quantity * order.quantity
                                    const available = item.componentPart?.stockQuantity || 0
                                    const sufficient = available >= required

                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-4 glass rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{item.componentPart?.name}</p>
                                                    {sufficient ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Badge variant="destructive" className="text-xs">{t('production.insufficient')}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground font-mono">{item.componentPart?.partNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono font-bold">
                                                    {t('production.required')}: {required} {item.unit}
                                                </p>
                                                <p className={`text-sm font-mono ${sufficient ? 'text-green-500' : 'text-red-500'}`}>
                                                    {t('production.available')}: {available} {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    )
}
