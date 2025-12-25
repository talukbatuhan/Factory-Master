import React, { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Database, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'
import { useSettings } from '@/context/SettingsContext'

export default function SystemSettings() {
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const { settings, updateSettings } = useSettings()
    const [loading, setLoading] = useState(false)

    // Local state for form management
    const [formData, setFormData] = useState({
        dateFormat: 'EU (DD/MM/YYYY)', // Fixed to EU format
        currency: 'USD',
        unitSystem: 'Metric'
    })

    // Sync form with global settings when they load
    useEffect(() => {
        if (settings) {
            setFormData({
                dateFormat: settings.dateFormat,
                currency: settings.currency,
                unitSystem: settings.unitSystem
            })
        }
    }, [settings])

    const handleSave = async () => {
        setLoading(true)
        try {
            const settingsToSave = {
                ...formData,
                theme: theme,
                language: i18n.language
            }

            const result = await updateSettings(settingsToSave)

            if (result.success) {
                toast.success('System settings saved')
            } else {
                toast.error(result.error || 'Failed to save settings')
            }
        } catch (error) {
            console.error('Save error:', error)
            toast.error('An error occurred while saving')
        } finally {
            setLoading(false)
        }
    }

    const handleBackup = async () => {
        try {
            const result = await window.api.backupDatabase()
            if (result.success) {
                toast.success('Backup completed successfully')
            } else if (result.error !== 'Backup cancelled') {
                toast.error(result.error || 'Backup failed')
            }
        } catch (error) {
            console.error('Backup error:', error)
            toast.error('An error occurred during backup')
        }
    }

    if (settings.loading) {
        return (
            <MainLayout title="System Settings">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout title="System Settings">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground mt-1">
                        Configure application-wide preferences
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Appearance & Locale */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Regional & Appearance
                            </CardTitle>
                            <CardDescription>
                                Set defaults for language, theme, and formats
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Language</label>
                                    <Select
                                        value={i18n.language}
                                        onValueChange={(val) => {
                                            i18n.changeLanguage(val)
                                            updateSettings({ language: val })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="tr">Türkçe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Theme</label>
                                    <Select
                                        value={theme}
                                        onValueChange={(val) => {
                                            setTheme(val)
                                            updateSettings({ theme: val })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Format</label>
                                    <div className="p-2 bg-muted/50 rounded-md border border-border font-medium text-muted-foreground">
                                        EU (DD/MM/YYYY)
                                    </div>
                                    <p className="text-xs text-muted-foreground">Date format is fixed to European standard</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Currency</label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={(val) => setFormData({ ...formData, currency: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="TRY">TRY (₺)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Data Management
                            </CardTitle>
                            <CardDescription>
                                Backup and maintenance options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Database Backup</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Create a local backup of your database.
                                    </p>
                                </div>
                                <Button onClick={handleBackup} variant="outline">
                                    Backup Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={loading} size="lg">
                            <Settings className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
