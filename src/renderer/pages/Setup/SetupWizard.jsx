import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Building2, User, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function SetupWizard() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Company data
    const [companyData, setCompanyData] = useState({
        name: '',
        taxId: '',
        phone: '',
        email: '',
        address: '',
        website: ''
    })

    // Admin user data
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const totalSteps = 3
    const progress = (step / totalSteps) * 100

    const handleNext = () => {
        // Validation for each step
        if (step === 1) {
            if (!companyData.name.trim()) {
                toast.error(t('setup.companyNameRequired'))
                return
            }
        }

        if (step === 2) {
            if (!adminData.name.trim() || !adminData.email.trim() || !adminData.password) {
                toast.error(t('setup.allFieldsRequired'))
                return
            }
            if (adminData.password !== adminData.confirmPassword) {
                toast.error(t('setup.passwordsDoNotMatch'))
                return
            }
            if (adminData.password.length < 6) {
                toast.error(t('setup.passwordTooShort'))
                return
            }
        }

        setStep(step + 1)
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const handleComplete = async () => {
        setLoading(true)

        try {
            const result = await window.api.createCompany({
                company: companyData,
                admin: {
                    name: adminData.name,
                    email: adminData.email,
                    password: adminData.password
                }
            })

            if (result.success) {
                toast.success(t('setup.setupComplete'))
                // Navigate to login
                navigate('/login')
            } else {
                toast.error(result.error || t('setup.setupFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-4">
            <Card className="w-full max-w-2xl border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {t('setup.welcomeTitle')}
                    </CardTitle>
                    <CardDescription>{t('setup.welcomeSubtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress indicator */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{t('setup.step')} {step} {t('setup.of')} {totalSteps}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Step indicators */}
                    <div className="flex justify-between">
                        {[
                            { icon: Building2, label: t('setup.companyInfo') },
                            { icon: User, label: t('setup.adminUser') },
                            { icon: Check, label: t('setup.confirm') }
                        ].map((item, index) => {
                            const stepNum = index + 1
                            const Icon = item.icon
                            const isActive = step === stepNum
                            const isCompleted = step > stepNum

                            return (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                                        ? 'bg-blue-500 border-blue-500'
                                        : isActive
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-border bg-background'
                                        }`}>
                                        <Icon className={`h-5 w-5 ${isCompleted || isActive ? 'text-blue-400' : 'text-muted-foreground'
                                            }`} />
                                    </div>
                                    <span className={`text-xs mt-2 text-center ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                                        }`}>
                                        {item.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Step 1: Company Information */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('setup.companyName')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                    placeholder={t('setup.companyNamePlaceholder')}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('setup.taxId')}</label>
                                    <Input
                                        value={companyData.taxId}
                                        onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                                        placeholder={t('setup.taxIdPlaceholder')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('setup.phone')}</label>
                                    <Input
                                        value={companyData.phone}
                                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                        placeholder={t('setup.phonePlaceholder')}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('setup.companyEmail')}</label>
                                <Input
                                    type="email"
                                    value={companyData.email}
                                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                                    placeholder={t('setup.companyEmailPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('setup.address')}</label>
                                <Input
                                    value={companyData.address}
                                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                    placeholder={t('setup.addressPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('setup.website')}</label>
                                <Input
                                    value={companyData.website}
                                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                                    placeholder={t('setup.websitePlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Admin User */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('setup.adminName')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={adminData.name}
                                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                                    placeholder={t('setup.adminNamePlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('setup.adminEmail')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={adminData.email}
                                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                    placeholder={t('setup.adminEmailPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('setup.password')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    value={adminData.password}
                                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                    placeholder={t('setup.passwordPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {t('setup.confirmPassword')} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    value={adminData.confirmPassword}
                                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                                    placeholder={t('setup.confirmPasswordPlaceholder')}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border">
                                {t('setup.passwordRequirements')}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="bg-muted/50 p-6 rounded-lg border border-border space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">{t('setup.companyInfo')}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('setup.companyName')}:</span>
                                            <span className="font-medium">{companyData.name}</span>
                                        </div>
                                        {companyData.taxId && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('setup.taxId')}:</span>
                                                <span className="font-medium">{companyData.taxId}</span>
                                            </div>
                                        )}
                                        {companyData.email && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('setup.companyEmail')}:</span>
                                                <span className="font-medium">{companyData.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-border pt-4">
                                    <h3 className="font-semibold text-lg mb-3">{t('setup.adminUser')}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('setup.adminName')}:</span>
                                            <span className="font-medium">{adminData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('setup.adminEmail')}:</span>
                                            <span className="font-medium">{adminData.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    {t('setup.confirmMessage')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-4">
                        {step > 1 ? (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('setup.back')}
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        {step < totalSteps ? (
                            <Button onClick={handleNext}>
                                {t('setup.next')}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleComplete} disabled={loading}>
                                <Check className="h-4 w-4 mr-2" />
                                {loading ? t('setup.completing') : t('setup.complete')}
                            </Button>
                        )}
                    </div>

                    {/* Login Link */}
                    <div className="text-center pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            {t('setup.alreadyHaveAccount')}{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                {t('auth.signIn')}
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
