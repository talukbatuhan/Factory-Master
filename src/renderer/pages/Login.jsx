import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { t } = useTranslation()
    const [email, setEmail] = useState('engineer@factory.com')
    const [password, setPassword] = useState('password123')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-4">
            <Card className="w-full max-w-md border-border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {t('auth.title')}
                    </CardTitle>
                    <CardDescription>{t('auth.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('auth.email')}</label>
                            <Input
                                type="email"
                                placeholder={t('auth.emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('auth.password')}</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.passwordPlaceholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-r-md transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('auth.signingIn') : t('auth.signIn')}
                        </Button>
                        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded border border-border">
                            <p className="font-semibold mb-1">{t('auth.demoCredentials')}</p>
                            <p>{t('auth.engineer')}: engineer@factory.com / password123</p>
                            <p>{t('auth.operator')}: operator@factory.com / password123</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
