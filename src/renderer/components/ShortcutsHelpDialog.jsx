import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from 'lucide-react'
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts'

export default function ShortcutsHelpDialog({ open, onOpenChange }) {
    const { t } = useTranslation()

    const getCategoryTitle = (category) => {
        const titles = {
            navigation: t('shortcuts.categories.navigation'),
            actions: t('shortcuts.categories.actions'),
            general: t('shortcuts.categories.general'),
        }
        return titles[category] || category
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Keyboard className="h-6 w-6 text-primary" />
                        {t('shortcuts.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('shortcuts.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {SHORTCUTS.map((category) => (
                        <div key={category.category}>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                {getCategoryTitle(category.category)}
                            </h3>
                            <div className="space-y-2">
                                {category.shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">
                                            {t(`shortcuts.actions.${shortcut.action.toLowerCase()}`, shortcut.description)}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <React.Fragment key={keyIndex}>
                                                    <Badge
                                                        variant="outline"
                                                        className="px-2 py-1 font-mono text-xs bg-card border-2"
                                                    >
                                                        {key}
                                                    </Badge>
                                                    {keyIndex < shortcut.keys.length - 1 && (
                                                        <span className="text-muted-foreground text-xs">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        <span>{t('shortcuts.tip')}</span>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
