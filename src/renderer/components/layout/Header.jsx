import React from 'react'
import { useAuth } from '@/context/AuthContext'
import NotificationCenter from '../NotificationCenter'

export default function Header({ title, actions }) {
    const { user } = useAuth()

    return (
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div>
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
            </div>
            <div className="flex items-center gap-4">
                {actions}
                <NotificationCenter />
            </div>
        </header>
    )
}
