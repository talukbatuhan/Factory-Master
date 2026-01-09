import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function OrderStatusChart({ data, title = "Order Status Distribution" }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (data) {
            setChartData(data)
            setLoading(false)
        } else {
            fetchOrderStatusData()
        }
    }, [data])

    const fetchOrderStatusData = async () => {
        try {
            const result = await window.api.getAllProductionOrders({})
            if (result?.success && result.orders) {
                // Group orders by status
                const statusCounts = result.orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1
                    return acc
                }, {})

                const colors = {
                    'COMPLETED': '#10b981',
                    'IN_PROGRESS': '#f59e0b',
                    'PLANNED': '#3b82f6',
                    'ON_HOLD': '#6b7280',
                    'CANCELLED': '#ef4444'
                }

                const formattedData = Object.entries(statusCounts).map(([status, count]) => ({
                    name: status.replace('_', ' '),
                    value: count,
                    color: colors[status] || '#3b82f6'
                }))

                setChartData(formattedData.length > 0 ? formattedData : [
                    { name: 'No Data', value: 1, color: '#6b7280' }
                ])
            }
        } catch (error) {
            console.error('Error fetching order status data:', error)
            setChartData([{ name: 'No Data', value: 1, color: '#6b7280' }])
        } finally {
            setLoading(false)
        }
    }

    const RADIAN = Math.PI / 180
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        if (percent < 0.05) return null // Don't show label if too small

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    if (loading) {
        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-purple-500" />
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
                    <Activity className="h-5 w-5 text-purple-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry) => (
                                <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                                    {value} ({entry.payload.value})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
