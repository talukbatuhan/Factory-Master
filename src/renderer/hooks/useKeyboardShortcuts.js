import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Custom hook for global keyboard shortcuts
 * @param {Object} options - Configuration options
 * @param {Function} options.onOpenShortcutsHelp - Callback for opening shortcuts help dialog
 */
export const useKeyboardShortcuts = (options = {}) => {
    const navigate = useNavigate()
    const { onOpenShortcutsHelp } = options

    const handleKeyPress = useCallback((event) => {
        const { key, ctrlKey, metaKey, shiftKey, target } = event
        const isModifier = ctrlKey || metaKey // Support both Ctrl (Windows/Linux) and Cmd (Mac)

        // Don't trigger shortcuts when typing in inputs/textareas
        const isTyping = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable

        // ========================
        // NAVIGATION SHORTCUTS (with Ctrl/Cmd)
        // ========================
        if (isModifier && !shiftKey) {
            switch (key.toLowerCase()) {
                case 'h':
                    event.preventDefault()
                    navigate('/')
                    break

                case 'i':
                    event.preventDefault()
                    navigate('/inventory')
                    break

                case 'b':
                    event.preventDefault()
                    navigate('/bom')
                    break

                case 'p':
                    event.preventDefault()
                    navigate('/production')
                    break

                case 'k':
                    // Command Palette / Search (future implementation)
                    event.preventDefault()
                    console.log('Command palette shortcut triggered')
                    // TODO: Open command palette
                    break

                case 's':
                    // Save - let the current page handle it
                    if (!isTyping) {
                        event.preventDefault()
                        // Dispatch custom event that components can listen to
                        window.dispatchEvent(new CustomEvent('keyboard-save'))
                    }
                    break

                case 'n':
                    // New item - context aware
                    if (!isTyping) {
                        event.preventDefault()
                        window.dispatchEvent(new CustomEvent('keyboard-new'))
                    }
                    break

                case 'f':
                    // Search in current page
                    if (!isTyping) {
                        event.preventDefault()
                        window.dispatchEvent(new CustomEvent('keyboard-search'))
                    }
                    break

                default:
                    break
            }
        }

        // ========================
        // NON-MODIFIER SHORTCUTS
        // ========================
        if (!isModifier && !isTyping) {
            switch (key) {
                case '?':
                    event.preventDefault()
                    if (onOpenShortcutsHelp) {
                        onOpenShortcutsHelp()
                    }
                    break

                case 'Escape':
                    // Close modals/dialogs - dispatch event for components to handle
                    window.dispatchEvent(new CustomEvent('keyboard-escape'))
                    break

                default:
                    break
            }
        }
    }, [navigate, onOpenShortcutsHelp])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [handleKeyPress])
}

/**
 * Hook for listening to specific keyboard events in components
 * @param {string} eventName - Event name (e.g., 'keyboard-save', 'keyboard-new')
 * @param {Function} callback - Callback function to execute
 */
export const useKeyboardEvent = (eventName, callback) => {
    useEffect(() => {
        const handler = () => callback()
        window.addEventListener(eventName, handler)
        return () => window.removeEventListener(eventName, handler)
    }, [eventName, callback])
}

// Shortcut definitions for help dialog
export const SHORTCUTS = [
    {
        category: 'navigation',
        shortcuts: [
            { keys: ['Ctrl', 'H'], description: 'Go to Dashboard', action: 'Home' },
            { keys: ['Ctrl', 'I'], description: 'Go to Inventory', action: 'Inventory' },
            { keys: ['Ctrl', 'B'], description: 'Go to BOM', action: 'BOM' },
            { keys: ['Ctrl', 'P'], description: 'Go to Production', action: 'Production' },
        ]
    },
    {
        category: 'actions',
        shortcuts: [
            { keys: ['Ctrl', 'N'], description: 'Create new item', action: 'New' },
            { keys: ['Ctrl', 'S'], description: 'Save current form', action: 'Save' },
            { keys: ['Ctrl', 'F'], description: 'Search in page', action: 'Find' },
            { keys: ['Ctrl', 'K'], description: 'Open command palette', action: 'Command' },
        ]
    },
    {
        category: 'general',
        shortcuts: [
            { keys: ['?'], description: 'Show keyboard shortcuts', action: 'Help' },
            { keys: ['Esc'], description: 'Close dialogs/modals', action: 'Close' },
        ]
    }
]
