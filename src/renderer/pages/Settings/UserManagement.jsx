import React, { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Users, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function UserManagement() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    // Check if current user is admin
    const isAdmin = currentUser?.role === 'ADMIN'

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'OPERATOR'
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const result = await window.api.getAllUsers()
            if (result.success) {
                setUsers(result.users)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingUser(null)
        setFormData({ name: '', email: '', password: '', role: 'OPERATOR' })
        setDialogOpen(true)
    }

    const handleEdit = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role
        })
        setDialogOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Prevent non-admin users from submitting role changes
        if (!isAdmin && editingUser && editingUser.role !== formData.role) {
            toast.error("Only administrators can change user roles")
            return
        }

        try {
            let result
            if (editingUser) {
                // Update
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    // Only include role if admin
                    ...(isAdmin ? { role: formData.role } : {})
                }
                if (formData.password) updateData.password = formData.password

                result = await window.api.updateUser(editingUser.id, updateData)
            } else {
                // Create
                result = await window.api.createUser(formData)
            }

            if (result.success) {
                toast.success(editingUser ? "User updated" : "User created")
                setDialogOpen(false)
                loadUsers()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error("Operation failed")
        }
    }

    const handleDelete = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        try {
            const result = await window.api.deleteUser(userId)
            if (result.success) {
                toast.success("User deleted")
                loadUsers()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error("Delete failed")
        }
    }

    return (
        <MainLayout title="User Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold">Users</h2>
                        <p className="text-muted-foreground">Manage system access and roles</p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Registered Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'destructive'} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {/* Prevent deleting self */}
                                                {currentUser?.id !== user.id && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-600 hover:bg-red-100/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                Role
                                {!isAdmin && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Lock className="h-3 w-3" />
                                        Admin Only
                                    </span>
                                )}
                            </label>
                            <Select
                                value={formData.role}
                                onValueChange={val => setFormData({ ...formData, role: val })}
                                disabled={!isAdmin}
                            >
                                <SelectTrigger className={!isAdmin ? "opacity-60 cursor-not-allowed" : ""}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="ENGINEER">Engineer</SelectItem>
                                    <SelectItem value="OPERATOR">Operator</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isAdmin && (
                                <p className="text-xs text-muted-foreground">
                                    Only administrators can assign roles
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {editingUser ? 'New Password (Optional)' : 'Password'}
                            </label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                                minLength={6}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    )
}
