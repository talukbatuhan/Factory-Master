import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Package, Factory, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationCenter() {
    const { t } = useTranslation()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        loadNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadNotifications = async () => {
        try {
            const result = await window.api.getNotifications()
            if (result.success) {
                setNotifications(result.notifications)
                setUnreadCount(result.notifications.filter(n => !n.read).length)
            }
        } catch (error) {
            console.error('Failed to load notifications:', error)
        }
    }

    const markAsRead = async (id) => {
        try {
            await window.api.markNotificationAsRead(id)
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await window.api.markAllNotificationsAsRead()
            setNotifications(notifications.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const deleteNotification = async (id) => {
        try {
            await window.api.deleteNotification(id)
            setNotifications(notifications.filter(n => n.id !== id))
            const wasUnread = notifications.find(n => n.id === id)?.read === false
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'LOW_STOCK':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'ORDER_COMPLETE':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'ORDER_UPDATE':
                return <Factory className="h-5 w-5 text-blue-500" />
            case 'PART_UPDATE':
                return <Package className="h-5 w-5 text-purple-500" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Badge
                                    variant="destructive"
                                    className="h-5 min-w-[20px] px-1 text-xs flex items-center justify-center rounded-full"
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">{t('notifications.title')}</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            {t('notifications.markAllRead')}
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>{t('notifications.noNotifications')}</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <DropdownMenuItem
                                    className={`flex items-start gap-3 p-4 cursor-pointer ${!notification.read ? 'bg-blue-500/5' : ''
                                        }`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="mt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteNotification(notification.id)
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </motion.div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
