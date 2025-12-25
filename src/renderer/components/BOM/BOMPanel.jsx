import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Search, Package } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

/**
 * Draggable Part Item Component
 * Individual part that can be dragged to BOM tree
 */
function DraggablePart({ part }) {
    const { t } = useTranslation()
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `draggable-part-${part.id}`,
        data: { part }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
    } : { cursor: 'grab' }

    const typeColors = {
        'PRODUCT': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'ASSEMBLY': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'COMPONENT': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'RAW_MATERIAL': 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-sm truncate">{part.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{part.partNumber}</p>
                </div>
                <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ${typeColors[part.type] || ''}`}
                >
                    {t(`inventory.types.${part.type}`)}
                </Badge>
            </div>
            {part.stockQuantity !== undefined && (
                <p className="text-xs text-muted-foreground mt-2">
                    Stock: {part.stockQuantity} {part.unit}
                </p>
            )}
        </div>
    )
}

/**
 * BOMPanel Component
 * Right slide-in panel showing available parts for drag-and-drop
 */
export default function BOMPanel({ isOpen, onClose }) {
    const { t } = useTranslation()
    const [parts, setParts] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('ALL')

    useEffect(() => {
        if (isOpen) {
            loadParts()
        }
    }, [isOpen])

    const loadParts = async () => {
        setLoading(true)
        try {
            const result = await window.api.getAllParts({})
            if (result.success) {
                setParts(result.parts)
            }
        } catch (error) {
            console.error('Error loading parts:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter parts based on search and type
    const filteredParts = parts.filter(part => {
        const matchesSearch = !searchTerm ||
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = selectedType === 'ALL' || part.type === selectedType

        return matchesSearch && matchesType
    })

    // Group parts by type
    const groupedParts = filteredParts.reduce((acc, part) => {
        if (!acc[part.type]) {
            acc[part.type] = []
        }
        acc[part.type].push(part)
        return acc
    }, {})

    const types = ['ALL', 'PRODUCT', 'ASSEMBLY', 'COMPONENT', 'RAW_MATERIAL']

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Slide-in Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Parts Library</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search parts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex flex-wrap gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${selectedType === type
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:bg-muted'
                                        }`}
                                >
                                    {type === 'ALL' ? 'All' : t(`inventory.types.${type}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parts List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground text-sm">Loading parts...</p>
                            </div>
                        ) : filteredParts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <Package className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                                <p className="text-muted-foreground text-sm">No parts found</p>
                                <p className="text-muted-foreground text-xs mt-1">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            Object.entries(groupedParts).map(([type, typeParts]) => (
                                <div key={type}>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                        {t(`inventory.types.${type}`)} ({typeParts.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {typeParts.map(part => (
                                            <DraggablePart key={part.id} part={part} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 border-t border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground text-center">
                            Drag parts onto the BOM tree to add them
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
