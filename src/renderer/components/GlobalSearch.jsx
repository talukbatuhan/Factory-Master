import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboardEvent } from '@/hooks/useKeyboardShortcuts'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, Factory, Truck, Loader2, ArrowRight } from 'lucide-react'

export default function GlobalSearch({ open, onOpenChange }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState({ parts: [], orders: [], suppliers: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)

    const debouncedQuery = useDebounce(query, 300)

    // Search function
    const performSearch = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults({ parts: [], orders: [], suppliers: [] })
            return
        }

        setIsSearching(true)
        try {
            const [partsResult, ordersResult, suppliersResult] = await Promise.all([
                window.api.searchParts(searchQuery),
                window.api.searchProductionOrders(searchQuery),
                window.api.searchSuppliers(searchQuery)
            ])

            setResults({
                parts: partsResult?.parts || [],
                orders: ordersResult?.orders || [],
                suppliers: suppliersResult?.suppliers || []
            })
        } catch (error) {
            console.error('Search error:', error)
            setResults({ parts: [], orders: [], suppliers: [] })
        } finally {
            setIsSearching(false)
        }
    }

    // Debounced search
    useEffect(() => {
        performSearch(debouncedQuery)
    }, [debouncedQuery])

    // Focus input when dialog opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open])

    // Flatten results for keyboard navigation
    const allResults = [
        ...results.parts.map(item => ({ type: 'part', data: item })),
        ...results.orders.map(item => ({ type: 'order', data: item })),
        ...results.suppliers.map(item => ({ type: 'supplier', data: item }))
    ]

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            e.preventDefault()
            handleSelectResult(allResults[selectedIndex])
        }
    }

    // Navigate to result
    const handleSelectResult = (result) => {
        if (result.type === 'part') {
            navigate(`/inventory/${result.data.id}`)
        } else if (result.type === 'order') {
            navigate(`/production/${result.data.id}`)
        } else if (result.type === 'supplier') {
            navigate(`/suppliers/${result.data.id}`)
        }
        onOpenChange(false)
        setQuery('')
    }

    // Reset when closed
    useEffect(() => {
        if (!open) {
            setQuery('')
            setSelectedIndex(0)
            setResults({ parts: [], orders: [], suppliers: [] })
        }
    }, [open])

    const totalResults = allResults.length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[600px] p-0 gap-0">
                <DialogHeader className="p-4 pb-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('search.placeholder')}
                            className="pl-10 pr-10 h-12 text-lg border-0 focus-visible:ring-0 bg-muted/30"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[450px] p-4 pt-2">
                    {query.length < 2 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>{t('search.typeToSearch')}</p>
                            <p className="text-sm mt-1">{t('search.minChars')}</p>
                        </div>
                    ) : totalResults === 0 && !isSearching ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>{t('search.noResults')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Parts Results */}
                            {results.parts.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        {t('search.categories.parts')} ({results.parts.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.parts.slice(0, 5).map((part, index) => {
                                            const globalIndex = index
                                            return (
                                                <button
                                                    key={part.id}
                                                    onClick={() => handleSelectResult({ type: 'part', data: part })}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedIndex === globalIndex
                                                            ? 'bg-primary/10 border border-primary'
                                                            : 'hover:bg-muted border border-transparent'
                                                        }`}
                                                >
                                                    <Package className="h-5 w-5 text-blue-500" />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium truncate">{part.name}</p>
                                                        <p className="text-sm text-muted-foreground font-mono">{part.partNumber}</p>
                                                    </div>
                                                    <Badge variant="outline">{part.type}</Badge>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Production Orders Results */}
                            {results.orders.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                        <Factory className="h-4 w-4" />
                                        {t('search.categories.orders')} ({results.orders.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.orders.slice(0, 5).map((order, index) => {
                                            const globalIndex = results.parts.length + index
                                            return (
                                                <button
                                                    key={order.id}
                                                    onClick={() => handleSelectResult({ type: 'order', data: order })}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedIndex === globalIndex
                                                            ? 'bg-primary/10 border border-primary'
                                                            : 'hover:bg-muted border border-transparent'
                                                        }`}
                                                >
                                                    <Factory className="h-5 w-5 text-purple-500" />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium font-mono">{order.orderNumber}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{order.part?.name}</p>
                                                    </div>
                                                    <Badge variant="outline">{order.status}</Badge>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Suppliers Results */}
                            {results.suppliers.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                        <Truck className="h-4 w-4" />
                                        {t('search.categories.suppliers')} ({results.suppliers.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {results.suppliers.slice(0, 5).map((supplier, index) => {
                                            const globalIndex = results.parts.length + results.orders.length + index
                                            return (
                                                <button
                                                    key={supplier.id}
                                                    onClick={() => handleSelectResult({ type: 'supplier', data: supplier })}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedIndex === globalIndex
                                                            ? 'bg-primary/10 border border-primary'
                                                            : 'hover:bg-muted border border-transparent'
                                                        }`}
                                                >
                                                    <Truck className="h-5 w-5 text-green-500" />
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium truncate">{supplier.name}</p>
                                                        <p className="text-sm text-muted-foreground truncate">{supplier.email}</p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {totalResults > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('search.resultsCount', { count: totalResults })}</span>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-background border">↑↓</kbd>
                                {t('search.navigate')}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-background border">Enter</kbd>
                                {t('search.select')}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-background border">Esc</kbd>
                                {t('search.close')}
                            </span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
