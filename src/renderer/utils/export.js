import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export data to PDF
 * @param {Object} options - Export options
 * @param {string} options.title - Document title
 * @param {Array} options.columns - Column headers
 * @param {Array} options.data - Data rows
 * @param {string} options.filename - Output filename (without extension)
 */
export const exportToPDF = ({ title, columns, data, filename = 'export' }) => {
    try {
        const doc = new jsPDF()

        // Add title
        doc.setFontSize(18)
        doc.text(title, 14, 20)

        // Add metadata
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)

        // Add table
        doc.autoTable({
            startY: 35,
            head: [columns],
            body: data,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [59, 130, 246], // Blue-500
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251], // Gray-50
            },
            margin: { top: 35 },
        })

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            )
        }

        // Save the PDF
        doc.save(`${filename}.pdf`)

        return { success: true }
    } catch (error) {
        console.error('PDF Export Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Export data to Excel
 * @param {Object} options - Export options
 * @param {string} options.sheetName - Sheet name
 * @param {Array} options.columns - Column headers
 * @param {Array} options.data - Data rows
 * @param {string} options.filename - Output filename (without extension)
 */
export const exportToExcel = ({ sheetName = 'Sheet1', columns, data, filename = 'export' }) => {
    try {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new()

        // Prepare data with headers
        const wsData = [columns, ...data]

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData)

        // Set column widths
        const colWidths = columns.map((col, index) => {
            const maxLength = Math.max(
                col.length,
                ...data.map(row => String(row[index] || '').length)
            )
            return { wch: Math.min(maxLength + 2, 50) }
        })
        ws['!cols'] = colWidths

        // Style header row (first row)
        const range = XLSX.utils.decode_range(ws['!ref'])
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
            if (!ws[cellAddress]) continue
            ws[cellAddress].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '3B82F6' } }, // Blue-500
                alignment: { horizontal: 'center' }
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName)

        // Save the file
        XLSX.writeFile(wb, `${filename}.xlsx`)

        return { success: true }
    } catch (error) {
        console.error('Excel Export Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Export data to CSV
 * @param {Object} options - Export options
 * @param {Array} options.columns - Column headers
 * @param {Array} options.data - Data rows
 * @param {string} options.filename - Output filename (without extension)
 */
export const exportToCSV = ({ columns, data, filename = 'export' }) => {
    try {
        // Create CSV content
        const csvContent = [
            columns.join(','),
            ...data.map(row =>
                row.map(cell => {
                    // Escape cells containing commas or quotes
                    const cellStr = String(cell || '')
                    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`
                    }
                    return cellStr
                }).join(',')
            )
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        return { success: true }
    } catch (error) {
        console.error('CSV Export Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Print current view
 */
export const printView = () => {
    window.print()
}
