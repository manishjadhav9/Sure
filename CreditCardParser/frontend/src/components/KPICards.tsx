import { ParsedRecord } from '../types'
import { FileText, DollarSign, Calendar } from 'lucide-react'

interface KPICardsProps {
  records: ParsedRecord[]
}

export default function KPICards({ records }: KPICardsProps) {
  const totalStatements = records.filter(r => r.status === 'PARSED').length
  
  const totalBalance = records
    .filter(r => r.status === 'PARSED' && r.total_balance !== null)
    .reduce((sum, r) => sum + (r.total_balance || 0), 0)

  const totalTransactions = records
    .filter(r => r.status === 'PARSED' && r.transaction_count !== null)
    .reduce((sum, r) => sum + (r.transaction_count || 0), 0)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Statements',
      value: totalStatements.toString(),
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Amount Payable',
      value: formatAmount(totalBalance),
      icon: DollarSign,
      color: 'bg-primary-500'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions.toString(),
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
