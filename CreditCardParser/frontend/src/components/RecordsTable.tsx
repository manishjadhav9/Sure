import { ParsedRecord } from '../types'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface RecordsTableProps {
  records: ParsedRecord[]
}

export default function RecordsTable({ records }: RecordsTableProps) {
  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getIssuerBadgeColor = (issuer: string) => {
    const colors: Record<string, string> = {
      HDFC: 'bg-blue-100 text-blue-800',
      ICICI: 'bg-orange-100 text-orange-800',
      SBI: 'bg-green-100 text-green-800',
      AXIS: 'bg-purple-100 text-purple-800',
      AMEX: 'bg-indigo-100 text-indigo-800',
      UNKNOWN: 'bg-gray-100 text-gray-800'
    }
    return colors[issuer] || colors.UNKNOWN
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Filename</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Issuer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Card Last 4</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Card Variant</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount Payable</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Interest</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-3 px-4">
                {record.status === 'PARSED' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-5 h-5 text-red-600" />
                    {record.error && (
                      <div className="group relative">
                        <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          {record.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate" title={record.filename}>
                {record.filename}
              </td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getIssuerBadgeColor(record.issuer)}`}>
                  {record.issuer}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300 font-mono">
                {record.card_last4 || '-'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-400">
                {record.card_variant || '-'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300 font-medium">
                {formatAmount(record.total_balance)}
              </td>
              <td className="py-3 px-4 text-sm text-red-600 dark:text-red-400 font-medium">
                {formatAmount(record.interest_charges)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-400">
                <span className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                  {record.top_merchant_category || '-'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                {record.transaction_count || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
