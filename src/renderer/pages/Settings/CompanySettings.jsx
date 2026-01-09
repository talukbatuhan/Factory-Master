import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Save, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function CompanySettings() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoPath, setLogoPath] = useState(null)

    const [companyData, setCompanyData] = useState({
        name: '',
        taxId: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        logo: null
    })

    useEffect(() => {
        if (user?.companyId) {
            loadCompanyData()
        }
    }, [user])

    const loadCompanyData = async () => {
        setLoading(true)
        try {
            const result = await window.api.getCompany(user.companyId)
            if (result.success) {
                setCompanyData(result.company)

                // Load logo path if exists
                if (result.company.logo) {
                    const logoResult = await window.api.getCompanyLogoPath(result.company.logo)
                    if (logoResult.success && logoResult.path) {
                        setLogoPath(logoResult.path)
                    }
                }
            } else {
                toast.error(result.error || t('messages.errorOccurred'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await window.api.updateCompany(user.companyId, {
                name: companyData.name,
                taxId: companyData.taxId,
                phone: companyData.phone,
                email: companyData.email,
                address: companyData.address,
                website: companyData.website
            })

            if (result.success) {
                toast.success(t('company.updateSuccess'))
                setCompanyData(result.company)
            } else {
                toast.error(result.error || t('company.updateFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = async () => {
        try {
            const result = await window.api.uploadCompanyLogo(user.companyId)
            if (result.success) {
                toast.success(t('company.logoUploadSuccess'))
                setCompanyData(result.company)

                // Reload logo path
                if (result.logo) {
                    const logoResult = await window.api.getCompanyLogoPath(result.logo)
                    if (logoResult.success && logoResult.path) {
                        setLogoPath(logoResult.path)
                    }
                }
            } else if (result.error !== 'Logo selection cancelled') {
                toast.error(result.error || t('company.logoUploadFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        }
    }

    if (loading) {
        return (
            <MainLayout title={t('company.settings')}>
                <div className="flex items-center justify-center h-64 glass glass-border rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout title={t('company.settings')}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t('company.settings')}</h2>
                    <p className="text-muted-foreground">{t('company.settingsDescription')}</p>
                </div>

                <Card className="glass glass-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {t('company.information')}
                        </CardTitle>
                        <CardDescription>{t('company.informationDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Logo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('company.logo')}</label>
                            <div className="flex items-center gap-4">
                                {logoPath ? (
                                    <div className="w-24 h-24 rounded-lg border border-border overflow-hidden">
                                        <img
                                            src={`file://${logoPath}`}
                                            alt="Company Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <Button variant="outline" onClick={handleLogoUpload}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {logoPath ? t('company.changeLogo') : t('company.uploadLogo')}
                                </Button>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('company.name')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                    placeholder={t('company.namePlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('company.taxId')}</label>
                                <Input
                                    value={companyData.taxId || ''}
                                    onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                                    placeholder={t('company.taxIdPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('company.email')}</label>
                                <Input
                                    type="email"
                                    value={companyData.email || ''}
                                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                                    placeholder={t('company.emailPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('company.phone')}</label>
                                <Input
                                    value={companyData.phone || ''}
                                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                    placeholder={t('company.phonePlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Address & Website */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('company.address')}</label>
                            <Input
                                value={companyData.address || ''}
                                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                placeholder={t('company.addressPlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('company.website')}</label>
                            <Input
                                value={companyData.website || ''}
                                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                                placeholder={t('company.websitePlaceholder')}
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={saving || !companyData.name} className="glow-blue">
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
