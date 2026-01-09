import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function ProductionTrendChart({ data, title = "Production Trend" }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (data) {
            setChartData(data)
            setLoading(false)
        } else {
            fetchProductionTrendData()
        }
    }, [data])

    const fetchProductionTrendData = async () => {
        try {
            const result = await window.api.getAllProductionOrders({})
            if (result?.success && result.orders) {
                // Get last 6 months
                const now = new Date()
                const monthsData = []

                for (let i = 5; i >= 0; i--) {
                    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
                    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
                    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

                    // Filter orders for this month
                    const monthOrders = result.orders.filter(order => {
                        const orderDate = new Date(order.createdAt)
                        return orderDate >= monthStart && orderDate <= monthEnd
                    })

                    monthsData.push({
                        month: monthName,
                        orders: monthOrders.length,
                        completed: monthOrders.filter(o => o.status === 'COMPLETED').length
                    })
                }

                setChartData(monthsData)
            }
        } catch (error) {
            console.error('Error fetching production trend data:', error)
            // Set empty data
            setChartData([
                { month: 'No', orders: 0, completed: 0 },
                { month: 'Data', orders: 0, completed: 0 }
            ])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
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
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="month"
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
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                            name="Total Orders"
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            name="Completed"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
