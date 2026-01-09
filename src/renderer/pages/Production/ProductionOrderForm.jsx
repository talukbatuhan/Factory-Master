import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Calendar as CalendarIcon, Package } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ProductionOrderForm() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [parts, setParts] = useState([])
    const [formData, setFormData] = useState({
        partId: '',
        quantity: '',
        targetDate: format(new Date(), 'yyyy-MM-dd'),
        startDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    })

    useEffect(() => {
        loadParts()
    }, [])

    const loadParts = async () => {
        try {
            // Only load products and assemblies (items that can be produced)
            // Or load all parts and filter in UI. For now, let's load all.
            const result = await window.api.getAllParts()
            if (result.success) {
                // Filter parts that are usually produced (PRODUCT or ASSEMBLY)
                // If you want to allow producing components, remove filter.
                const producableParts = result.parts.filter(p =>
                    p.type === 'PRODUCT' || p.type === 'ASSEMBLY' || p.type === 'COMPONENT'
                )
                setParts(producableParts)
            }
        } catch (error) {
            console.error('Failed to load parts:', error)
            toast.error(t('messages.loadFailed'))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.partId || !formData.quantity) {
            toast.error(t('messages.requiredFields'))
            return
        }

        setLoading(true)
        try {
            const result = await window.api.createProductionOrder({
                ...formData,
                quantity: parseInt(formData.quantity)
            })

            if (result.success) {
                toast.success(t('messages.saveSuccess'))
                navigate('/production')
            } else {
                toast.error(result.error || t('messages.saveFailed'))
            }
        } catch (error) {
            console.error('Create order error:', error)
            toast.error(t('messages.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    // Find selected part to show unit/details
    const selectedPart = parts.find(p => p.id === formData.partId)

    return (
        <MainLayout
            title={t('production.newOrder')}
            actions={
                <Button variant="ghost" onClick={() => navigate('/production')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back')}
                </Button>
            }
        >
            <div className="max-w-2xl mx-auto">
                <Card className="glass glass-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {t('production.newOrder')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Part Selection */}
                            <div className="space-y-2">
                                <Label>{t('production.part')} *</Label>
                                <Select
                                    value={formData.partId}
                                    onValueChange={(val) => setFormData({ ...formData, partId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('inventory.selectPartPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parts.map((part) => (
                                            <SelectItem key={part.id} value={part.id}>
                                                <span className="font-medium">{part.partNumber}</span> - {part.name}
                                                <span className="ml-2 text-xs text-muted-foreground">({part.stockQuantity} {part.unit})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quantity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('production.quantity')} *</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            placeholder="0"
                                            required
                                        />
                                        {selectedPart && (
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {selectedPart.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('production.startDate')}</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('production.targetDate')}</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={formData.targetDate}
                                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label>{t('production.notes')}</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder={t('production.notesPlaceholder') || "Production notes..."}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={loading} className="glow-blue">
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? t('common.saving') : t('production.createOrder')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
