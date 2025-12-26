import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted',
                className
            )}
            {...props}
        />
    )
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} className="h-12 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="border border-border rounded-lg p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    )
}

export function StatCardSkeleton() {
    return (
        <div className="border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
        </div>
    )
}
