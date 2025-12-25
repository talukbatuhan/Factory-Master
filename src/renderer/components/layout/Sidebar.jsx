import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Package,
    GitBranch,
    Factory,
    Truck,
    Settings,
    LogOut,
    FileText,
    Workflow,
    User,
    Moon,
    Sun,
    Languages,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { Button } from '../ui/button'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'BOM', href: '/bom', icon: GitBranch },
    { name: 'Production', href: '/production', icon: Factory },
    { name: 'Suppliers', href: '/suppliers', icon: Truck },
    { name: 'Processes', href: '/processes', icon: Workflow },
    { name: 'Reports', href: '/reports', icon: FileText },
]

const settingsNav = [
    { name: 'Users', href: '/settings/users', icon: User, requiredRole: 'ENGINEER' },
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'System', href: '/settings/system', icon: Settings },
]

export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout, hasPermission } = useAuth()
    const { theme, setTheme } = useTheme()
    const { t, i18n } = useTranslation()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const handleLogout = async () => {
        await logout()
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'tr' : 'en'
        i18n.changeLanguage(newLang)
    }

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 80 : 256 }}
            className="relative bg-card border-r border-border flex flex-col h-screen"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Logo */}
            <div className="p-6 border-b border-border">
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.h1
                            key="full-logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                        >
                            Factory Master
                        </motion.h1>
                    ) : (
                        <motion.div
                            key="mini-logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center"
                        >
                            FM
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== '/' && location.pathname.startsWith(item.href))

                    return (
                        <motion.button
                            key={item.name}
                            onClick={() => navigate(item.href)}
                            whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                            whileTap={{ scale: 0.98 }}
                            title={isCollapsed ? t(`nav.${item.name.toLowerCase()}`) : ''}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-lg transition-all ${isActive
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span className="font-medium">{t(`nav.${item.name.toLowerCase()}`)}</span>}
                        </motion.button>
                    )
                })}

                <div className="pt-4 mt-4 border-t border-border">
                    {!isCollapsed && (
                        <p className="px-4 text-xs font-semibold text-muted-foreground mb-2">
                            {t('nav.settingsHeader')}
                        </p>
                    )}
                    {settingsNav.map((item) => {
                        if (item.requiredRole && !hasPermission(item.requiredRole)) return null

                        const isActive = location.pathname === item.href

                        return (
                            <motion.button
                                key={item.name}
                                onClick={() => navigate(item.href)}
                                whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                                whileTap={{ scale: 0.98 }}
                                title={isCollapsed ? t(`nav.${item.name.toLowerCase()}`) : ''}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-lg transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {!isCollapsed && <span className="font-medium">{t(`nav.${item.name.toLowerCase()}`)}</span>}
                            </motion.button>
                        )
                    })}
                </div>
            </nav>

            {/* Theme & Language Toggle */}
            <div className="p-4 border-t border-border space-y-2">
                <div className={`flex ${isCollapsed ? 'flex-col' : ''} gap-2`}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        className="flex-1"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {!isCollapsed && <span className="ml-2">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleLanguage}
                        className="flex-1"
                        title={i18n.language === 'en' ? 'Türkçe\'ye Geç' : 'Switch to English'}
                    >
                        <Languages className="h-4 w-4" />
                        {!isCollapsed && <span className="ml-2 text-xs font-bold">{i18n.language.toUpperCase()}</span>}
                    </Button>
                </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-border">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.role}</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full justify-start gap-2"
                            size="sm"
                        >
                            <LogOut className="h-4 w-4" />
                            {t('common.logout')}
                        </Button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="w-full"
                            title={t('common.logout')}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
