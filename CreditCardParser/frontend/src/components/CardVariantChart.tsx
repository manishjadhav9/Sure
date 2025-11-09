import { ParsedRecord } from '../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CardVariantChartProps {
  records: ParsedRecord[]
}

const COLORS = ['#16A34A', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function CardVariantChart({ records }: CardVariantChartProps) {
  // Count card variants
  const variantCounts: Record<string, number> = {}

  records
    .filter(r => r.status === 'PARSED' && r.card_variant)
    .forEach(r => {
      const variant = r.card_variant || 'Unknown'
      variantCounts[variant] = (variantCounts[variant] || 0) + 1
    })

  const chartData = Object.entries(variantCounts)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No card variant data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
