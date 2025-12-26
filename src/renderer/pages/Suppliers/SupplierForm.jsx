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

export default function SupplierForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { t } = useTranslation()
    const isEdit = Boolean(id)

    const [formData, setFormData] = useState({
        name: '',
        type: 'LOCAL',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        notes: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isEdit) {
            loadSupplier()
        }
    }, [id])

    const loadSupplier = async () => {
        try {
            const result = await window.api.getSupplierById(id)
            if (result.success) {
                setFormData(result.supplier)
            } else {
                toast.error(t('messages.loadFailed'))
                navigate('/suppliers')
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        }
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = t('validation.required')
        }

        if (!formData.email.trim()) {
            newErrors.email = t('validation.required')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('validation.emailInvalid')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) {
            toast.error(t('validation.fixErrors'))
            return
        }

        setLoading(true)
        try {
            const result = isEdit
                ? await window.api.updateSupplier(id, formData)
                : await window.api.createSupplier(formData)

            if (result.success) {
                toast.success(isEdit ? t('suppliers.updated') : t('suppliers.created'))
                navigate('/suppliers')
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <MainLayout
            title={isEdit ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}
            actions={
                <Button variant="ghost" onClick={() => navigate('/suppliers')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back')}
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>{t('suppliers.basicInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('suppliers.name')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder={t('suppliers.namePlaceholder')}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('suppliers.type')}</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOCAL">{t('suppliers.types.LOCAL')}</SelectItem>
                                        <SelectItem value="ONLINE">{t('suppliers.types.ONLINE')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('suppliers.contactPerson')}</label>
                                <Input
                                    value={formData.contactPerson}
                                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                                    placeholder={t('suppliers.contactPersonPlaceholder')}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('suppliers.phone')}</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="+90 555 123 4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('suppliers.email')} <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="supplier@example.com"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('suppliers.website')}</label>
                            <Input
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('suppliers.address')}</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder={t('suppliers.addressPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('suppliers.notes')}</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder={t('suppliers.notesPlaceholder')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/suppliers')}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? t('common.saving') : t('common.save')}
                    </Button>
                </div>
            </form>
        </MainLayout>
    )
}
