import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function SupplierDetails() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()
    const [supplier, setSupplier] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSupplier()
    }, [id])

    const loadSupplier = async () => {
        try {
            const result = await window.api.getSupplierById(id)
            if (result.success) {
                setSupplier(result.supplier)
            } else {
                toast.error(t('messages.loadFailed'))
                navigate('/suppliers')
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const getTypeBadge = (type) => {
        const colors = {
            ONLINE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            LOCAL: 'bg-green-500/10 text-green-500 border-green-500/20',
        }
        return <Badge className={colors[type]}>{t(`suppliers.types.${type}`)}</Badge>
    }

    if (loading) {
        return (
            <MainLayout title={t('suppliers.supplierDetails')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </MainLayout>
        )
    }

    if (!supplier) {
        return (
            <MainLayout title={t('suppliers.supplierNotFound')}>
                <div className="glass glass-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">{t('suppliers.supplierNotFound')}</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout
            title={supplier.name}
            actions={
                <Button variant="ghost" onClick={() => navigate('/suppliers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back')}
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Header Card */}
                <Card className="glass glass-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{supplier.name}</h2>
                                    {getTypeBadge(supplier.type)}
                                </div>
                                {supplier.contactPerson && (
                                    <p className="text-muted-foreground">{t('suppliers.contact')}: {supplier.contactPerson}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {supplier.email && (
                                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('suppliers.email')}</p>
                                        <p className="font-medium">{supplier.email}</p>
                                    </div>
                                </div>
                            )}

                            {supplier.phone && (
                                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                                    <Phone className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('suppliers.phone')}</p>
                                        <p className="font-medium">{supplier.phone}</p>
                                    </div>
                                </div>
                            )}

                            {supplier.website && (
                                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                                    <Globe className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('suppliers.website')}</p>
                                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:underline">
                                            {supplier.website}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {supplier.address && (
                                <div className="flex items-center gap-3 p-3 glass rounded-lg">
                                    <MapPin className="h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('suppliers.address')}</p>
                                        <p className="font-medium">{supplier.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {supplier.notes && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-sm text-muted-foreground mb-2">{t('production.notes')}</p>
                                <p className="text-sm">{supplier.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Supplied Parts */}
                <Card className="glass glass-border">
                    <CardHeader>
                        <CardTitle>{t('suppliers.suppliedParts')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {supplier.supplierParts && supplier.supplierParts.length > 0 ? (
                            <div className="space-y-3">
                                {supplier.supplierParts.map((sp) => (
                                    <div key={sp.id} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/inventory/${sp.part?.id}`)}>
                                        <div>
                                            <p className="font-semibold">{sp.part?.name}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{sp.part?.partNumber}</p>
                                            {sp.supplierSKU && (
                                                <p className="text-xs text-muted-foreground mt-1">SKU: {sp.supplierSKU}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {sp.unitPrice && (
                                                <p className="font-mono font-bold">${sp.unitPrice} {sp.currency || 'USD'}</p>
                                            )}
                                            {sp.leadTimeDays && (
                                                <p className="text-sm text-muted-foreground">{sp.leadTimeDays} {t('suppliers.daysLeadTime')}</p>
                                            )}
                                            {sp.minOrderQty && sp.minOrderQty > 1 && (
                                                <p className="text-xs text-muted-foreground">{t('suppliers.minOrder')}: {sp.minOrderQty}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">{t('suppliers.noPartsAssigned')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
