import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Building2, Plus, Download, Upload, Trash2, Users,
    Package, ShoppingCart, FileText, ChevronRight, LogIn
} from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CompanyProfiles() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { t } = useTranslation()
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [companyToDelete, setCompanyToDelete] = useState(null)

    useEffect(() => {
        loadCompanies()
    }, [])

    const loadCompanies = async () => {
        setLoading(true)
        try {
            const result = await window.api.getAllCompanies()
            if (result.success) {
                setCompanies(result.companies)
            } else {
                toast.error(result.error || t('messages.errorOccurred'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleSelectCompany = (companyId) => {
        // Navigate to login and pass company ID
        navigate('/login', { state: { selectedCompanyId: companyId } })
    }

    const handleCreateNew = () => {
        navigate('/setup')
    }

    const handleExport = async (companyId, companyName) => {
        try {
            const result = await window.api.exportCompany(companyId)
            if (result.success) {
                toast.success(t('company.exportSuccess', { name: companyName }))
            } else {
                toast.error(result.error || t('company.exportFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        }
    }

    const handleImport = async () => {
        try {
            const result = await window.api.importCompany()
            if (result.success) {
                toast.success(t('company.importSuccess'))
                loadCompanies() // Refresh list
            } else if (result.error !== 'Import cancelled') {
                toast.error(result.error || t('company.importFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        }
    }

    const handleDeleteClick = (company) => {
        setCompanyToDelete(company)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!companyToDelete) return

        try {
            const result = await window.api.deleteCompany(companyToDelete.id)
            if (result.success) {
                toast.success(t('company.deleteSuccess', { name: companyToDelete.name }))
                loadCompanies() // Refresh list
            } else {
                toast.error(result.error || t('company.deleteFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setDeleteDialogOpen(false)
            setCompanyToDelete(null)
        }
    }

    const handleBackupAll = async () => {
        // Export all companies one by one
        for (const company of companies) {
            await handleExport(company.id, company.name)
            // Small delay between exports
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('messages.loading')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {t('company.profiles')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t('company.profilesSubtitle')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleImport} variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            {t('company.import')}
                        </Button>
                        <Button onClick={handleBackupAll} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            {t('company.backupAll')}
                        </Button>
                        <Button onClick={handleCreateNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('company.createNew')}
                        </Button>
                    </div>
                </div>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                        <Card
                            key={company.id}
                            className="border-border hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{company.name}</CardTitle>
                                            {company.isDefault && (
                                                <span className="text-xs text-blue-400">({t('company.default')})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Company Info */}
                                <div className="space-y-2 text-sm">
                                    {company.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span>📧</span>
                                            <span className="truncate">{company.email}</span>
                                        </div>
                                    )}
                                    {company.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span>📞</span>
                                            <span>{company.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {company._count?.users || 0} {t('company.users')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {company._count?.parts || 0} {t('company.parts')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {company._count?.productionOrders || 0} {t('company.orders')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {company._count?.suppliers || 0} {t('company.suppliers')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleSelectCompany(company.id)}
                                    >
                                        <LogIn className="h-4 w-4 mr-2" />
                                        {t('company.select')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleExport(company.id, company.name)
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteClick(company)
                                        }}
                                        disabled={companies.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {companies.length === 0 && (
                    <Card className="border-border">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('company.noProfiles')}</h3>
                            <p className="text-muted-foreground mb-4">{t('company.noProfilesDescription')}</p>
                            <Button onClick={handleCreateNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('company.createFirst')}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('company.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('company.deleteConfirmMessage', { name: companyToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
