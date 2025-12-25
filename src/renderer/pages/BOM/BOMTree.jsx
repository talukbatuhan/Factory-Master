import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import BOMPanel from '@/components/BOM/BOMPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, GitBranch, Plus, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core'

/**
 * Recursive BOM Item Component
 * Displays a single BOM item with its children (nested assemblies)
 */
function BOMItem({ item, level = 0, onDelete, onUpdateQuantity, parentPath = [], selectedPartId }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(true)
    const [editingQty, setEditingQty] = useState(false)
    const [quantity, setQuantity] = useState(item.quantity)
    const [children, setChildren] = useState([])
    const [loadingChildren, setLoadingChildren] = useState(false)

    // Load children if this component is an assembly
    useEffect(() => {
        if (item.componentPart?.type === 'ASSEMBLY' && expanded) {
            loadChildren()
        }
    }, [item.componentPart?.id, expanded])

    const loadChildren = async () => {
        if (!item.componentPart?.id) return

        setLoadingChildren(true)
        try {
            const result = await window.api.getBOMForPart(item.componentPart.id)
            if (result.success) {
                setChildren(result.bom || [])
            }
        } catch (error) {
            console.error('Error loading BOM children:', error)
        } finally {
            setLoadingChildren(false)
        }
    }

    const handleSaveQuantity = () => {
        if (quantity > 0) {
            onUpdateQuantity(item.id, quantity)
            setEditingQty(false)
        }
    }

    const hasChildren = item.componentPart?.type === 'ASSEMBLY' || children.length > 0

    return (
        <div className={`mb-2`}>
            <div
                className={`flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                {/* Expand/Collapse Button */}
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                    >
                        {expanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                )}
                {!hasChildren && <div className="w-6" />}

                <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/inventory/${item.componentPart?.id}`)}
                >
                    <p className="font-semibold text-sm">{item.componentPart?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.componentPart?.partNumber}</p>
                </div>

                {/* Quantity Editor */}
                <div className="flex items-center gap-2">
                    {editingQty ? (
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="w-20 h-8 text-sm"
                                min="0.01"
                                step="0.01"
                            />
                            <Button size="sm" onClick={handleSaveQuantity}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                                setEditingQty(false)
                                setQuantity(item.quantity)
                            }}>Cancel</Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditingQty(true)}
                            className="font-mono font-bold text-sm px-2 py-1 hover:bg-accent rounded transition-colors"
                        >
                            {item.quantity} {item.unit}
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Recursive Children */}
            {hasChildren && expanded && (
                <div className="mt-2">
                    {loadingChildren ? (
                        <p className="text-xs text-muted-foreground ml-12">Loading sub-components...</p>
                    ) : (
                        children.map((child) => (
                            <BOMItem
                                key={child.id}
                                item={child}
                                level={level + 1}
                                onDelete={onDelete}
                                onUpdateQuantity={onUpdateQuantity}
                                parentPath={[...parentPath, item.componentPart?.id]}
                                selectedPartId={selectedPartId}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * Droppable BOM Tree Area
 */
function DroppableBOMTree({ children, partId }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `bom-tree-${partId}`,
        data: { partId }
    })

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-border'
                }`}
        >
            {children}
        </div>
    )
}

export default function BOMTree() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [parts, setParts] = useState([])
    const [selectedPart, setSelectedPart] = useState(null)
    const [bom, setBom] = useState([])
    const [loading, setLoading] = useState(true)
    const [panelOpen, setPanelOpen] = useState(false)
    const [activeDragItem, setActiveDragItem] = useState(null)

    useEffect(() => {
        loadParts()
    }, [])

    const loadParts = async () => {
        try {
            const result = await window.api.getAllParts({})
            if (result.success) {
                // Filter to show only PRODUCT and ASSEMBLY types for top-level selection
                setParts(result.parts.filter(p => p.type === 'PRODUCT' || p.type === 'ASSEMBLY'))
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handlePartSelect = async (partId) => {
        setSelectedPart(partId)
        try {
            const result = await window.api.getBOMForPart(partId)
            if (result.success) {
                setBom(result.bom || [])
            }
        } catch (error) {
            console.error(error)
            toast.error(t('messages.loadFailed'))
        }
    }

    // Check for circular dependency
    const wouldCreateCircularDependency = (parentPartId, childPartId) => {
        // Can't add a part to itself
        if (parentPartId === childPartId) return true

        // Check if childPart is an ancestor of parentPart
        const checkAncestor = (currentPartId, targetPartId, visited = new Set()) => {
            if (visited.has(currentPartId)) return false
            visited.add(currentPartId)

            if (currentPartId === targetPartId) return true

            // Get BOM of current part and check recursively
            // This is a simplified check - in production you'd query the full tree
            return false
        }

        return checkAncestor(childPartId, parentPartId)
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        setActiveDragItem(null)

        if (!over || !selectedPart) return

        const draggedPart = active.data.current?.part
        if (!draggedPart) return

        // Prevent circular dependency
        if (wouldCreateCircularDependency(selectedPart, draggedPart.id)) {
            toast.error('Cannot add: This would create a circular dependency!')
            return
        }

        // Check if already in BOM
        if (bom.some(item => item.componentPartId === draggedPart.id)) {
            toast.error('This part is already in the BOM')
            return
        }

        try {
            const result = await window.api.addBOMItem({
                partId: selectedPart,
                componentPartId: draggedPart.id,
                quantity: 1,
                unit: draggedPart.unit || 'pcs'
            })

            if (result.success) {
                toast.success('Component added to BOM')
                handlePartSelect(selectedPart) // Reload BOM
            } else {
                toast.error(result.error || 'Failed to add component')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    const handleDeleteBOMItem = async (bomItemId) => {
        if (!confirm('Remove this component from BOM?')) return

        try {
            const result = await window.api.deleteBOMItem(bomItemId)
            if (result.success) {
                toast.success('Component removed')
                handlePartSelect(selectedPart) // Reload BOM
            } else {
                toast.error(result.error || 'Failed to remove component')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    const handleUpdateQuantity = async (bomItemId, newQuantity) => {
        try {
            const result = await window.api.updateBOMItem(bomItemId, { quantity: newQuantity })
            if (result.success) {
                toast.success('Quantity updated')
                handlePartSelect(selectedPart) // Reload BOM
            } else {
                toast.error(result.error || 'Failed to update quantity')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveDragItem(e.active.data.current?.part)}>
            <MainLayout title={t('bom.bomTree')}>
                <div className="space-y-6">
                    {/* Header with Actions */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold">{t('bom.bomTree')}</h2>
                            <p className="text-muted-foreground">Build and manage product assemblies</p>
                        </div>
                        <Button onClick={() => setPanelOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Components
                        </Button>
                    </div>

                    {/* Part Selection */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle>{t('bom.selectPart')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedPart || ''} onValueChange={handlePartSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('bom.selectPartPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {parts.map((part) => (
                                        <SelectItem key={part.id} value={part.id}>
                                            {part.name} ({part.partNumber}) - {part.type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* BOM Tree Display */}
                    {selectedPart && (
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {t('bom.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bom.length === 0 ? (
                                    <DroppableBOMTree partId={selectedPart}>
                                        <div className="text-center py-12">
                                            <GitBranch className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                            <p className="text-muted-foreground">{t('bom.noComponents')}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Click "Add Components" or drag parts here
                                            </p>
                                        </div>
                                    </DroppableBOMTree>
                                ) : (
                                    <DroppableBOMTree partId={selectedPart}>
                                        {bom.map((item) => (
                                            <BOMItem
                                                key={item.id}
                                                item={item}
                                                level={0}
                                                onDelete={handleDeleteBOMItem}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                selectedPartId={selectedPart}
                                            />
                                        ))}
                                    </DroppableBOMTree>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {!selectedPart && (
                        <div className="border border-border rounded-lg p-12 text-center bg-muted/20">
                            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-xl font-semibold mb-2">{t('bom.selectPartTitle')}</p>
                            <p className="text-muted-foreground">{t('bom.selectPartDesc')}</p>
                        </div>
                    )}
                </div>

                {/* BOM Panel */}
                <BOMPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeDragItem && (
                        <div className="p-3 bg-card border-2 border-primary rounded-lg shadow-lg">
                            <p className="font-medium text-sm">{activeDragItem.name}</p>
                            <p className="text-xs text-muted-foreground">{activeDragItem.partNumber}</p>
                        </div>
                    )}
                </DragOverlay>
            </MainLayout>
        </DndContext>
    )
}
