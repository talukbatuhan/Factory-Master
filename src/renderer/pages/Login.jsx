import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Factory, Sparkles, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { t } = useTranslation()
    const [email, setEmail] = useState('admin@factory.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [companyInfo, setCompanyInfo] = useState(null)

    // Get company info for display
    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const result = await window.api.getDefaultCompany()
                if (result) {
                    setCompanyInfo(result)
                }
            } catch (error) {
                console.error('Failed to fetch company:', error)
            }
        }
        fetchCompanyInfo()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                toast.success(t('messages.loginSuccess'))
                navigate('/')
            } else {
                toast.error(result.error || t('messages.loginFailed'))
            }
        } catch (error) {
            toast.error(t('messages.errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
                {/* Animated Orbs */}
                <motion.div
                    className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Company Info Banner (if available) */}
                {companyInfo && (
                    <motion.div
                        className="mb-6 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                                <Building2 className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white text-lg">{companyInfo.name}</h3>
                                {companyInfo.email && (
                                    <p className="text-sm text-blue-200/70">{companyInfo.email}</p>
                                )}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                <span className="text-xs font-medium text-emerald-300">Active</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Login Card with Glassmorphism */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
                    <CardHeader className="space-y-2 pb-6">
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                <Factory className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                                {t('auth.title')}
                            </CardTitle>
                        </motion.div>
                        <CardDescription className="text-blue-100/70">
                            {t('auth.subtitle')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="text-sm font-medium text-white/90">{t('auth.email')}</label>
                                <Input
                                    type="email"
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/50"
                                />
                            </motion.div>
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="text-sm font-medium text-white/90">{t('auth.password')}</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:ring-blue-400/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-white/10 rounded-r-md transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-white/60" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-white/60" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            {t('auth.signingIn')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            {t('auth.signIn')}
                                        </span>
                                    )}
                                </Button>
                            </motion.div>
                            <motion.div
                                className="text-xs text-blue-100/60 mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <p className="font-semibold mb-1.5 text-blue-200">{t('auth.demoCredentials')}</p>
                                <p className="font-mono">admin@factory.com / admin123</p>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <motion.div
                    className="mt-6 text-center space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-sm text-blue-200/50">
                        FactoryMaster ERP © 2025
                    </p>
                    <div className="pt-2 border-t border-white/10">
                        <p className="text-sm text-blue-200/60">
                            Need to set up a new company?{' '}
                            <button
                                onClick={() => navigate('/setup')}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline"
                            >
                                Create Company Profile
                            </button>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
