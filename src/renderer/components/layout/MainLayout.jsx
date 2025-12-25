import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ children, title, actions }) {
    return (
        <div className="flex h-screen w-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {title && <Header title={title} actions={actions} />}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
