import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function InventoryLevelChart({ data, title = "Inventory by Type" }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (data) {
            setChartData(data)
            setLoading(false)
        } else {
            fetchInventoryData()
        }
    }, [data])

    const fetchInventoryData = async () => {
        try {
            const result = await window.api.getAllParts({})
            if (result?.success && result.parts) {
                // Group parts by type
                const typeCounts = result.parts.reduce((acc, part) => {
                    const type = part.type || 'UNKNOWN'
                    if (!acc[type]) {
                        acc[type] = { count: 0, totalStock: 0 }
                    }
                    acc[type].count++
                    acc[type].totalStock += part.stockQuantity || 0
                    return acc
                }, {})

                const typeLabels = {
                    'RAW_MATERIAL': 'Raw Materials',
                    'COMPONENT': 'Components',
                    'ASSEMBLY': 'Assemblies',
                    'PRODUCT': 'Products',
                    'UNKNOWN': 'Unknown'
                }

                const formattedData = Object.entries(typeCounts).map(([type, info]) => {
                    // Determine status based on average stock
                    const avgStock = info.totalStock / info.count
                    let status = 'good'
                    if (avgStock < 10) status = 'low'
                    else if (avgStock < 50) status = 'warning'

                    return {
                        name: typeLabels[type] || type,
                        count: info.count,
                        status
                    }
                })

                setChartData(formattedData.length > 0 ? formattedData : [
                    { name: 'No Data', count: 0, status: 'good' }
                ])
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error)
            setChartData([{ name: 'No Data', count: 0, status: 'good' }])
        } finally {
            setLoading(false)
        }
    }

    const getColor = (status) => {
        switch (status) {
            case 'good':
                return '#10b981' // green
            case 'warning':
                return '#f59e0b' // yellow
            case 'low':
                return '#ef4444' // red
            default:
                return '#3b82f6' // blue
        }
    }

    if (loading) {
        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="h-5 w-5 text-emerald-500" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5 text-emerald-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            name="Parts Count"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
