import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function PartForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()
    const isEdit = !!id

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        partNumber: '',
        name: '',
        description: '',
        type: 'COMPONENT',
        materialType: '',
        stockQuantity: 0,
        unit: 'pcs',
        reorderLevel: 0,
    })

    useEffect(() => {
        if (isEdit) {
            loadPart()
        }
    }, [id])

    const loadPart = async () => {
        try {
            const result = await window.api.getPartById(id)
            if (result.success) {
                setFormData(result.part)
            } else {
                toast.error(t('messages.loadFailed'))
                navigate('/inventory')
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = isEdit
                ? await window.api.updatePart(id, formData)
                : await window.api.createPart(formData)

            if (result.success) {
                toast.success(isEdit ? t('messages.updateSuccess') : t('messages.createSuccess'))
                navigate('/inventory')
            } else {
                toast.error(result.error || t('messages.saveFailed'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.saveFailed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout
            title={isEdit ? t('inventory.editPart') : t('inventory.newPart')}
            actions={
                <Button variant="ghost" onClick={() => navigate('/inventory')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back')}
                </Button>
            }
        >
            <Card className="glass glass-border max-w-3xl">
                <CardHeader>
                    <CardTitle>{isEdit ? t('inventory.editPart') : t('inventory.newPart')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Part Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('inventory.partNumber')} *</label>
                                <Input
                                    value={formData.partNumber}
                                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                                    placeholder={t('inventory.partNumber')}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('inventory.type')} *</label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRODUCT">{t('inventory.types.PRODUCT')}</SelectItem>
                                        <SelectItem value="ASSEMBLY">{t('inventory.types.ASSEMBLY')}</SelectItem>
                                        <SelectItem value="COMPONENT">{t('inventory.types.COMPONENT')}</SelectItem>
                                        <SelectItem value="RAW_MATERIAL">{t('inventory.types.RAW_MATERIAL')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('inventory.name')} *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('inventory.name')}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('inventory.description')}</label>
                            <Input
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t('inventory.description')}
                            />
                        </div>

                        {/* Material Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('inventory.materialType')}</label>
                            <Input
                                value={formData.materialType || ''}
                                onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                                placeholder={t('inventory.materialType')}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Stock Quantity */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('inventory.stockQuantity')} *</label>
                                <Input
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    required
                                />
                            </div>

                            {/* Unit */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('inventory.unit')} *</label>
                                <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pcs">{t('inventory.units.PIECE')}</SelectItem>
                                        <SelectItem value="kg">{t('inventory.units.KG')}</SelectItem>
                                        <SelectItem value="m">{t('inventory.units.METER')}</SelectItem>
                                        <SelectItem value="L">{t('inventory.units.LITER')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reorder Level */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('inventory.reorderLevel')} *</label>
                                <Input
                                    type="number"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={loading} className="glow-blue">
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? t('common.saving') : (isEdit ? t('common.update') : t('common.create'))}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </MainLayout>
    )
}
