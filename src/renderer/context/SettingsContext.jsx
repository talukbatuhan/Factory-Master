import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const SettingsContext = createContext(null)

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider')
    }
    return context
}

const STORAGE_KEY = 'factorymaster-settings'

const defaultSettings = {
    dateFormat: 'EU (DD/MM/YYYY)', // Fixed to EU format
    currency: 'USD',
    unitSystem: 'Metric',
    theme: 'dark',
    language: 'en',
    notifications: {
        lowStock: true,
        productionUpdates: true,
        emailAlerts: false
    }
}

export const SettingsProvider = ({ children }) => {
    const { i18n } = useTranslation()
    const [settings, setSettings] = useState({ ...defaultSettings, loading: true })

    // Load settings on mount
    useEffect(() => {
        loadSettings()
    }, [])

    // Apply theme when it changes
    useEffect(() => {
        if (!settings.loading) {
            applyTheme(settings.theme)
        }
    }, [settings.theme, settings.loading])

    // Apply language when it changes
    useEffect(() => {
        if (!settings.loading && i18n.language !== settings.language) {
            i18n.changeLanguage(settings.language)
        }
    }, [settings.language, settings.loading, i18n])

    const loadSettings = async () => {
        try {
            // First try to load from localStorage (instant)
            const localSettings = loadFromLocalStorage()
            if (localSettings) {
                setSettings({ ...localSettings, loading: false })
            }

            // Then try to load from backend (may have additional settings)
            const result = await window.api.getSystemSettings()
            if (result.success && result.settings) {
                const mergedSettings = { ...defaultSettings, ...result.settings }
                setSettings({ ...mergedSettings, loading: false })
                saveToLocalStorage(mergedSettings)
            } else if (!localSettings) {
                setSettings({ ...defaultSettings, loading: false })
                saveToLocalStorage(defaultSettings)
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
            const localSettings = loadFromLocalStorage()
            setSettings({ ...(localSettings || defaultSettings), loading: false })
        }
    }

    const updateSettings = async (newSettings) => {
        try {
            const updatedSettings = { ...settings, ...newSettings }

            // Immediately update state and localStorage for instant feedback
            setSettings({ ...updatedSettings, loading: false })
            saveToLocalStorage(updatedSettings)

            // Then save to backend
            const result = await window.api.saveSystemSettings(updatedSettings)
            if (result.success) {
                return { success: true }
            }
            return { success: false, error: result.error }
        } catch (error) {
            console.error('Failed to update settings:', error)
            return { success: false, error: error.message }
        }
    }

    const updateSetting = (key, value) => {
        return updateSettings({ [key]: value })
    }

    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                return JSON.parse(stored)
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error)
        }
        return null
    }

    const saveToLocalStorage = (settingsToSave) => {
        try {
            const { loading, ...cleanSettings } = settingsToSave
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanSettings))
        } catch (error) {
            console.error('Failed to save to localStorage:', error)
        }
    }

    const applyTheme = (theme) => {
        const root = document.documentElement

        // Remove all theme classes
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            // Follow system preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }

    const resetSettings = async () => {
        const result = await updateSettings(defaultSettings)
        if (result.success) {
            loadSettings()
        }
        return result
    }

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettings,
                updateSetting,
                resetSettings,
                isLoading: settings.loading
            }}
        >
            {children}
        </SettingsContext.Provider>
    )
}
