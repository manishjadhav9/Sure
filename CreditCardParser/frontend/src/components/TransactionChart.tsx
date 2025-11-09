import { ParsedRecord, Issuer } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TransactionChartProps {
  records: ParsedRecord[]
}

export default function TransactionChart({ records }: TransactionChartProps) {
  // Aggregate transaction count by issuer
  const issuerData: Record<Issuer | 'UNKNOWN', number> = {
    HDFC: 0,
    ICICI: 0,
    SBI: 0,
    AXIS: 0,
    AMEX: 0,
    UNKNOWN: 0
  }

  records
    .filter(r => r.status === 'PARSED' && r.transaction_count !== null)
    .forEach(r => {
      issuerData[r.issuer] += r.transaction_count || 0
    })

  const chartData = Object.entries(issuerData)
    .filter(([_, value]) => value > 0)
    .map(([issuer, count]) => ({
      issuer,
      count
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No transaction data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="issuer" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
