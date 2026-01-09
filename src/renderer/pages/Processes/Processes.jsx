import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '../../components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronRight,
    Clock,
    Settings,
    CheckCircle2,
    Circle,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    X,
} from 'lucide-react'

export default function Processes() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [processes, setProcesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingProcess, setEditingProcess] = useState(null)
    const [selectedProcess, setSelectedProcess] = useState(null)
    const [showStepsDialog, setShowStepsDialog] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        partId: ''
    })
    const [availableParts, setAvailableParts] = useState([])

    useEffect(() => {
        loadProcesses()
        loadParts()
    }, [])

    const loadParts = async () => {
        try {
            const result = await window.api.getAllParts()
            if (result.success) {
                setAvailableParts(result.parts)
            }
        } catch (error) {
            console.error('Failed to load parts:', error)
        }
    }

    const loadProcesses = async () => {
        try {
            const result = await window.api.getAllProcesses()
            if (result.success) {
                setProcesses(result.processes || [])
            }
        } catch (error) {
            console.error('Failed to load processes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name) {
            alert('Please enter process name')
            return
        }

        try {
            const result = editingProcess
                ? await window.api.updateProcess(editingProcess.id, formData)
                : await window.api.createProcess(formData)

            if (result.success) {
                setShowAddDialog(false)
                setEditingProcess(null)
                setFormData({ name: '', description: '', partId: '' })
                loadProcesses()
            } else {
                alert(result.error || 'Failed to save process')
            }
        } catch (error) {
            console.error('Save process error:', error)
            alert('An error occurred while saving')
        }
    }



    const handleEdit = (process) => {
        setEditingProcess(process)
        setFormData({
            name: process.name,
            description: process.description || '',
            partId: process.partId || ''
        })
        setShowAddDialog(true)
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete process "${name}"? This will also delete all associated steps.`)) {
            return
        }

        try {
            const result = await window.api.deleteProcess(id)
            if (result.success) {
                loadProcesses()
            } else {
                alert(result.error || 'Failed to delete process')
            }
        } catch (error) {
            console.error('Delete process error:', error)
        }
    }

    const handleViewSteps = (process) => {
        setSelectedProcess(process)
        setShowStepsDialog(true)
    }

    const filteredProcesses = processes.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const getStatusBadge = (status) => {
        const variants = {
            PENDING: { variant: 'secondary', icon: Circle, label: 'Pending' },
            IN_PROGRESS: { variant: 'default', icon: Settings, label: 'In Progress' },
            COMPLETED: { variant: 'success', icon: CheckCircle2, label: 'Completed' },
            BLOCKED: { variant: 'destructive', icon: AlertCircle, label: 'Blocked' },
        }
        const config = variants[status] || variants.PENDING
        const Icon = config.icon
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    return (
        <MainLayout title="Processes">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Production Processes</h2>
                        <p className="text-muted-foreground mt-1">
                            Define standardized workflows and routing
                        </p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Process
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Processes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{processes.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {processes.reduce((sum, p) => sum + (p.steps?.length || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Avg Steps/Process
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {processes.length > 0
                                    ? Math.round(
                                        processes.reduce((sum, p) => sum + (p.steps?.length || 0), 0) /
                                        processes.length
                                    )
                                    : 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {processes.reduce(
                                    (sum, p) =>
                                        sum + (p.steps?.filter((s) => s.status === 'IN_PROGRESS')?.length || 0),
                                    0
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search processes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Processes List */}
                {loading ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Loading processes...
                        </CardContent>
                    </Card>
                ) : filteredProcesses.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            {searchTerm
                                ? 'No processes match your search'
                                : 'No processes yet. Click "New Process" to define your first workflow.'}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredProcesses.map((process) => (
                            <Card key={process.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{process.name}</CardTitle>
                                            {process.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {process.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Settings className="h-4 w-4" />
                                                    <span>{process.steps?.length || 0} steps</span>
                                                </div>
                                                {process.steps && process.steps.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {process.steps.reduce(
                                                                (sum, s) => sum + (s.estimatedDuration || 0),
                                                                0
                                                            )}{' '}
                                                            min total
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewSteps(process)}
                                            >
                                                View Steps
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(process)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(process.id, process.name)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {process.steps && process.steps.length > 0 && (
                                    <CardContent>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {process.steps
                                                .sort((a, b) => a.stepOrder - b.stepOrder)
                                                .map((step, idx) => (
                                                    <div
                                                        key={step.id}
                                                        className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 min-w-fit"
                                                    >
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{step.name}</p>
                                                            {step.estimatedDuration && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {step.estimatedDuration} min
                                                                </p>
                                                            )}
                                                        </div>
                                                        {getStatusBadge(step.status)}
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add/Edit Process Dialog */}
                {showAddDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>
                                    {editingProcess ? 'Edit Process' : 'Create New Process'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Process Name *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="CNC Machining Process"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Standard routing for CNC machined parts..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Part *</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.partId}
                                            onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                                            required
                                            disabled={!!editingProcess}
                                        >
                                            <option value="">Select a Part</option>
                                            {availableParts.map((part) => (
                                                <option key={part.id} value={part.id}>
                                                    {part.partNumber} - {part.name}
                                                </option>
                                            ))}
                                        </select>
                                        {editingProcess && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Part cannot be changed for existing process
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddDialog(false)
                                                setEditingProcess(null)
                                                setFormData({ name: '', description: '', partId: '' })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingProcess ? 'Update Process' : 'Create Process'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* View Steps Dialog */}
                {showStepsDialog && selectedProcess && (
                    <ProcessStepsDialog
                        process={selectedProcess}
                        onClose={() => {
                            setShowStepsDialog(false)
                            setSelectedProcess(null)
                            loadProcesses()
                        }}
                    />
                )}
            </div>
        </MainLayout>
    )
}

// Process Steps Management Dialog Component
function ProcessStepsDialog({ process, onClose }) {
    const [steps, setSteps] = useState(process.steps || [])
    const [showAddStep, setShowAddStep] = useState(false)
    const [stepForm, setStepForm] = useState({
        name: '',
        description: '',
        estimatedDuration: '',
        machineRequired: '',
    })

    const handleAddStep = async (e) => {
        e.preventDefault()

        if (!stepForm.name) {
            alert('Please enter step name')
            return
        }

        // Note: This would need a proper API implementation
        alert('Step management API needs to be implemented in IPC handlers')
        setShowAddStep(false)
        setStepForm({
            name: '',
            description: '',
            estimatedDuration: '',
            machineRequired: '',
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{process.name} - Process Steps</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{steps.length} steps defined</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setShowAddStep(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Step
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {steps.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No steps defined. Click "Add Step" to create the workflow.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {steps
                                .sort((a, b) => a.stepOrder - b.stepOrder)
                                .map((step, idx) => (
                                    <div
                                        key={step.id}
                                        className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{step.name}</h4>
                                            {step.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                                {step.estimatedDuration && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{step.estimatedDuration} min</span>
                                                    </div>
                                                )}
                                                {step.machineRequired && (
                                                    <div className="flex items-center gap-1">
                                                        <Settings className="h-4 w-4" />
                                                        <span>{step.machineRequired}</span>
                                                    </div>
                                                )}
                                                {step.part && (
                                                    <div>
                                                        <Badge variant="outline">{step.part.partNumber}</Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {getStatusBadge(step.status)}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {showAddStep && (
                        <Card className="border-2 border-primary">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Step</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddStep} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Step Name *</label>
                                        <Input
                                            value={stepForm.name}
                                            onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                                            placeholder="e.g., CNC Milling"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Description</label>
                                        <Input
                                            value={stepForm.description}
                                            onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                                            placeholder="Mill the part according to drawing..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">
                                                Est. Duration (min)
                                            </label>
                                            <Input
                                                type="number"
                                                value={stepForm.estimatedDuration}
                                                onChange={(e) =>
                                                    setStepForm({ ...stepForm, estimatedDuration: e.target.value })
                                                }
                                                placeholder="30"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Machine Required</label>
                                            <Input
                                                value={stepForm.machineRequired}
                                                onChange={(e) =>
                                                    setStepForm({ ...stepForm, machineRequired: e.target.value })
                                                }
                                                placeholder="CNC Mill"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddStep(false)
                                                setStepForm({
                                                    name: '',
                                                    description: '',
                                                    estimatedDuration: '',
                                                    machineRequired: '',
                                                })
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Step</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function getStatusBadge(status) {
    const variants = {
        PENDING: { variant: 'secondary', icon: Circle, label: 'Pending' },
        IN_PROGRESS: { variant: 'default', icon: Settings, label: 'In Progress' },
        COMPLETED: { variant: 'success', icon: CheckCircle2, label: 'Completed' },
        BLOCKED: { variant: 'destructive', icon: AlertCircle, label: 'Blocked' },
    }
    const config = variants[status] || variants.PENDING
    const Icon = config.icon
    return (
        <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )
}
