import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileType, Printer, Loader2 } from 'lucide-react'
import { exportToPDF, exportToExcel, exportToCSV, printView } from '@/utils/export'
import { toast } from 'sonner'

export default function ExportButton({
    data,
    columns,
    title,
    filename = 'export',
    className = ''
}) {
    const { t } = useTranslation()
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (type) => {
        setIsExporting(true)

        try {
            // Prepare data for export (convert to array of arrays)
            const exportData = data.map(row =>
                columns.map(col => {
                    if (typeof col.accessor === 'function') {
                        return col.accessor(row)
                    }
                    return row[col.accessor] || ''
                })
            )

            const columnHeaders = columns.map(col => col.header || col.Header || '')

            let result
            switch (type) {
                case 'pdf':
                    result = exportToPDF({
                        title: title || t('export.defaultTitle'),
                        columns: columnHeaders,
                        data: exportData,
                        filename
                    })
                    break

                case 'excel':
                    result = exportToExcel({
                        sheetName: title || 'Data',
                        columns: columnHeaders,
                        data: exportData,
                        filename
                    })
                    break

                case 'csv':
                    result = exportToCSV({
                        columns: columnHeaders,
                        data: exportData,
                        filename
                    })
                    break

                case 'print':
                    printView()
                    result = { success: true }
                    break

                default:
                    throw new Error('Unknown export type')
            }

            if (result.success) {
                toast.success(t('export.success', { type: type.toUpperCase() }))
            } else {
                toast.error(t('export.failed', { error: result.error }))
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error(t('export.failed', { error: error.message }))
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={className}
                    disabled={isExporting || !data || data.length === 0}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('export.exporting')}
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            {t('export.export')}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="mr-2 h-4 w-4 text-red-500" />
                    {t('export.exportPDF')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-500" />
                    {t('export.exportExcel')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileType className="mr-2 h-4 w-4 text-blue-500" />
                    {t('export.exportCSV')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('print')}>
                    <Printer className="mr-2 h-4 w-4" />
                    {t('export.print')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
