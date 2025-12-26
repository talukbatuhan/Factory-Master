import React from 'react'
import { Button } from '@/components/ui/button'

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    className = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {Icon && (
                <div className="mb-6 rounded-full bg-muted/50 p-6">
                    <Icon className="h-16 w-16 text-muted-foreground/50" />
                </div>
            )}
            <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
            {description && (
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    {description}
                </p>
            )}
            {action && actionLabel && (
                <Button onClick={action}>
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
