import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            // Always clear localStorage on app start to require fresh login
            localStorage.removeItem('factorymaster-user')
            setUser(null)
            setIsAuthenticated(false)
        } catch (error) {
            console.error('Auth check error:', error)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const result = await window.api.login(email, password)
            if (result.success) {
                setUser(result.user)
                setIsAuthenticated(true)
                // Still save to localStorage for session management during app usage
                localStorage.setItem('factorymaster-user', JSON.stringify(result.user))
                return { success: true }
            }
            return { success: false, error: result.error }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: 'Login failed' }
        }
    }

    const logout = async () => {
        try {
            await window.api.logout()
            setUser(null)
            setIsAuthenticated(false)
            localStorage.removeItem('factorymaster-user')

            // Navigate to login page after logout
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const hasPermission = (requiredRole) => {
        if (!user) return false
        const roleHierarchy = { ADMIN: 3, ENGINEER: 2, OPERATOR: 1 }
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
    }

    const checkSetupNeeded = async () => {
        try {
            const result = await window.api.checkSetupNeeded()
            return result // returns true if setup needed
        } catch (error) {
            console.error('Setup check error:', error)
            return false
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                hasPermission,
                checkSetupNeeded,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
