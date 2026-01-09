import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Package, Box, Cpu, Factory, Boxes, AlertCircle, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const getTypeIcon = (type) => {
    switch (type) {
        case 'PRODUCT':
            return <Factory className="h-4 w-4" />
        case 'ASSEMBLY':
            return <Boxes className="h-4 w-4" />
        case 'COMPONENT':
            return <Cpu className="h-4 w-4" />
        case 'RAW_MATERIAL':
            return <Box className="h-4 w-4" />
        default:
            return <Package className="h-4 w-4" />
    }
}

const getTypeColor = (type) => {
    switch (type) {
        case 'PRODUCT':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        case 'ASSEMBLY':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'COMPONENT':
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'RAW_MATERIAL':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
}

function BOMTreeNode({ item, level = 0, onExpand, onCollapse, isExpanded, onItemClick }) {
    const [localExpanded, setLocalExpanded] = useState(isExpanded)
    const hasChildren = item.children && item.children.length > 0
    const part = item.componentPart

    const handleToggle = () => {
        const newState = !localExpanded
        setLocalExpanded(newState)
        if (newState && onExpand) {
            onExpand(item)
        } else if (!newState && onCollapse) {
            onCollapse(item)
        }
    }

    const indentation = level * 32

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="group"
            >
                {/* Connection Lines */}
                {level > 0 && (
                    <>
                        {/* Horizontal line */}
                        <div
                            className="absolute  top-5 border-t-2 border-border/40"
                            style={{
                                left: `${indentation - 16}px`,
                                width: '16px'
                            }}
                        />
                        {/* Vertical line */}
                        <div
                            className="absolute top-0 bottom-0 border-l-2 border-border/40"
                            style={{
                                left: `${indentation - 16}px`,
                                height: hasChildren && localExpanded ? '100%' : '24px'
                            }}
                        />
                    </>
                )}

                {/* Node Content */}
                <div
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-all"
                    style={{ paddingLeft: `${indentation}px` }}
                    onClick={() => onItemClick?.(part)}
                >
                    {/* Expand/Collapse Button */}
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleToggle()
                            }}
                            className="flex-shrink-0 p-1 rounded hover:bg-accent transition-colors"
                        >
                            {localExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    {/* Part Type Icon */}
                    <div className={`p-1.5 rounded-md border ${getTypeColor(part.type)}`}>
                        {getTypeIcon(part.type)}
                    </div>

                    {/* Part Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{part.name}</span>
                            <Badge variant="outline" className="text-xs font-mono">
                                {part.partNumber}
                            </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>Stock: {part.stockQuantity} {part.unit}</span>
                            {item.quantity && (
                                <span className="text-blue-400">
                                    • Required: {item.quantity} {item.unit}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quantity Badge */}
                    {item.quantity && (
                        <div className="flex-shrink-0">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                ×{item.quantity}
                            </Badge>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Children */}
            <AnimatePresence>
                {hasChildren && localExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {item.children.map((child, index) => (
                            <BOMTreeNode
                                key={child.id || index}
                                item={child}
                                level={level + 1}
                                onExpand={onExpand}
                                onCollapse={onCollapse}
                                isExpanded={true}
                                onItemClick={onItemClick}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function BOMTreeViewer({ partId, onItemClick }) {
    const { t } = useTranslation()
    const [bomData, setBomData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [rootPart, setRootPart] = useState(null)
    const [expandAll, setExpandAll] = useState(true)

    useEffect(() => {
        if (partId) {
            loadBOMTree()
        }
    }, [partId])

    const loadBOMTree = async () => {
        setLoading(true)
        setError(null)

        try {
            // Get part details
            const partResult = await window.api.getPartById(partId)
            if (partResult.success) {
                setRootPart(partResult.part)
            }

            // Get BOM tree
            const result = await window.api.getBOMForPart(partId, { recursive: true })

            if (result.success) {
                setBomData(result.bom)
            } else {
                setError(result.error || 'Failed to load BOM')
                toast.error('Failed to load BOM tree')
            }
        } catch (err) {
            setError(err.message)
            toast.error('Error loading BOM tree')
        } finally {
            setLoading(false)
        }
    }

    const handleExpandAll = () => {
        setExpandAll(true)
    }

    const handleCollapseAll = () => {
        setExpandAll(false)
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Boxes className="h-5 w-5" />
                        Bill of Materials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Boxes className="h-5 w-5" />
                        Bill of Materials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mb-2" />
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!bomData || bomData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Boxes className="h-5 w-5" />
                        Bill of Materials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mb-2" />
                        <p>No BOM structure defined for this part</p>
                        <p className="text-sm mt-1">Add components to create a BOM</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-blue-500" />
                        Bill of Materials
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExpandAll}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Expand All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCollapseAll}
                            className="gap-2"
                        >
                            <Minus className="h-4 w-4" />
                            Collapse All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Root Part */}
                {rootPart && (
                    <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${getTypeColor(rootPart.type)}`}>
                                {getTypeIcon(rootPart.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{rootPart.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {rootPart.partNumber} • Stock: {rootPart.stockQuantity} {rootPart.unit}
                                </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                Root
                            </Badge>
                        </div>
                    </div>
                )}

                {/* BOM Tree */}
                <div className="space-y-1">
                    {bomData.map((item, index) => (
                        <BOMTreeNode
                            key={item.id || index}
                            item={item}
                            level={1}
                            isExpanded={expandAll}
                            onItemClick={onItemClick}
                        />
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total Components: {bomData.length}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadBOMTree}
                            className="gap-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
