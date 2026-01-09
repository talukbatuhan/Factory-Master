import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import { useKeyboardShortcuts, useKeyboardEvent } from './hooks/useKeyboardShortcuts'
import ShortcutsHelpDialog from './components/ShortcutsHelpDialog'
import GlobalSearch from './components/GlobalSearch'
import './i18n/config'
import { Toaster } from 'sonner'

// Pages
import SetupWizard from './pages/Setup/SetupWizard'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InventoryList from './pages/Inventory/InventoryList'
import PartForm from './pages/Inventory/PartForm'
import PartDetails from './pages/Inventory/PartDetails'
import BOMTree from './pages/BOM/BOMTree'
import ProductionOrders from './pages/Production/ProductionOrders'
import ProductionOrderForm from './pages/Production/ProductionOrderForm'
import OrderDetails from './pages/Production/OrderDetails'
import SupplierList from './pages/Suppliers/SupplierList'
import SupplierDetails from './pages/Suppliers/SupplierDetails'
import SupplierForm from './pages/Suppliers/SupplierForm'
import Processes from './pages/Processes/Processes'
import UserManagement from './pages/Settings/UserManagement'
import Profile from './pages/Settings/Profile'
import SystemSettings from './pages/Settings/SystemSettings'
import CompanySettings from './pages/Settings/CompanySettings'
import CompanyProfiles from './pages/Settings/CompanyProfiles'
import Reports from './pages/Reports/Reports'
import PageWrapper from './components/PageWrapper'

// Protected Route Wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

function AppRoutes() {
    const location = useLocation()
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false)
    const [searchDialogOpen, setSearchDialogOpen] = useState(false)

    // Initialize keyboard shortcuts
    useKeyboardShortcuts({
        onOpenShortcutsHelp: () => setShortcutsDialogOpen(true)
    })

    // Listen for search shortcut (Ctrl+F)
    useKeyboardEvent('keyboard-search', () => {
        setSearchDialogOpen(true)
    })

    return (
        <>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/setup" element={
                        <PageWrapper>
                            <SetupWizard />
                        </PageWrapper>
                    } />
                    <Route path="/profiles" element={
                        <PageWrapper>
                            <CompanyProfiles />
                        </PageWrapper>
                    } />
                    <Route path="/login" element={
                        <PageWrapper>
                            <Login />
                        </PageWrapper>
                    } />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <Dashboard />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/inventory" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <InventoryList />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/inventory/new" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <PartForm />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/inventory/:id/edit" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <PartForm />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/inventory/:id" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <PartDetails />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/bom" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <BOMTree />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/production" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <ProductionOrders />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/production/new" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <ProductionOrderForm />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/production/:id" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <OrderDetails />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/suppliers" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <SupplierList />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/suppliers/new" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <SupplierForm />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/suppliers/:id" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <SupplierDetails />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/suppliers/:id/edit" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <SupplierForm />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/processes" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <Processes />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/users" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <UserManagement />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/profile" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <Profile />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/system" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <SystemSettings />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/settings/company" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <CompanySettings />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute>
                            <PageWrapper>
                                <Reports />
                            </PageWrapper>
                        </ProtectedRoute>
                    } />
                </Routes>
            </AnimatePresence>

            <ShortcutsHelpDialog
                open={shortcutsDialogOpen}
                onOpenChange={setShortcutsDialogOpen}
            />

            <GlobalSearch
                open={searchDialogOpen}
                onOpenChange={setSearchDialogOpen}
            />
        </>
    )
}

function App() {
    return (
        <ThemeProvider>
            <SettingsProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                        <Toaster
                            position="top-right"
                            expand={false}
                            richColors
                            closeButton
                            toastOptions={{
                                duration: 4000,
                                className: 'toast-custom',
                            }}
                        />
                    </AuthProvider>
                </BrowserRouter>
            </SettingsProvider>
        </ThemeProvider>
    )
}

export default App
