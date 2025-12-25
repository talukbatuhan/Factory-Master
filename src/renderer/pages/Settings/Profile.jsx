import React, { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Profile() {
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [editingName, setEditingName] = useState(false)
    const [newName, setNewName] = useState(user?.name || '')

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Password Change State
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value })
    }

    const onSaveName = async () => {
        if (!newName.trim()) {
            toast.error("Name cannot be empty")
            return
        }

        setLoading(true)
        try {
            const result = await window.api.updateUser(user.id, { name: newName })

            if (result.success) {
                toast.success("Name updated successfully")
                setEditingName(false)
                // Reload user data by re-authenticating (optional: implement a dedicated refresh method)
                window.location.reload()
            } else {
                toast.error(result.error || "Failed to update name")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const onSavePassword = async (e) => {
        e.preventDefault()

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords don't match")
            return
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            const result = await window.api.updateUser(user.id, {
                password: passwords.newPassword,
                currentPassword: passwords.currentPassword
            })

            if (result.success) {
                toast.success("Password updated successfully")
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                toast.error(result.error || "Failed to update password")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout title="My Profile">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* User Info Card */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                {editingName ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Enter name"
                                        />
                                        <Button onClick={onSaveName} disabled={loading} size="sm">
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditingName(false)
                                                setNewName(user?.name || '')
                                            }}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border">
                                        <span className="font-medium">{user?.name}</span>
                                        <Button
                                            onClick={() => setEditingName(true)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <div className="p-2 bg-muted/50 rounded-md border border-border font-medium">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <div className="p-2 bg-muted/50 rounded-md border border-border font-medium flex items-center gap-2">
                                    <span className="capitalize">{user?.role?.toLowerCase()}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                <div className="p-2 bg-muted/50 rounded-md border border-border font-mono text-xs text-muted-foreground flex items-center">
                                    {user?.id}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Update your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSavePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwords.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-r-md transition-colors"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-r-md transition-colors"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-accent rounded-r-md transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </MainLayout>
    )
}
