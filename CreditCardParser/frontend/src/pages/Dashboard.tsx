import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, Upload, LogOut, Download, XCircle } from 'lucide-react'
import { api } from '../services/api'
import { ParsedRecord, Issuer } from '../types'
import { useAuth } from '../contexts/AuthContext'
import RecordsTable from '../components/RecordsTable'
import KPICards from '../components/KPICards'
import Chart from '../components/Chart'
import TransactionChart from '../components/TransactionChart'
import CardVariantChart from '../components/CardVariantChart'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [records, setRecords] = useState<ParsedRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ParsedRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [issuerFilter, setIssuerFilter] = useState<Issuer | 'ALL'>('ALL')

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [records, searchQuery, issuerFilter])

  const loadRecords = async () => {
    setIsLoading(true)
    try {
      const response = await api.getRecords()
      if (response.success && response.data) {
        // Sort by uploaded_at descending (most recent first)
        const sortedRecords = response.data.sort((a, b) => 
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        )
        setRecords(sortedRecords)
      } else {
        toast.error(response.error || 'Failed to load records')
      }
    } catch (error) {
      toast.error('An error occurred while loading records')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    // Apply issuer filter
    if (issuerFilter !== 'ALL') {
      filtered = filtered.filter(r => r.issuer === issuerFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.issuer.toLowerCase().includes(query) ||
        r.card_last4?.toLowerCase().includes(query) ||
        r.filename.toLowerCase().includes(query)
      )
    }

    setFilteredRecords(filtered)
  }

  const handleExport = async () => {
    try {
      const blob = await api.exportCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'credit_card_statements.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('CSV exported successfully')
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all statements? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.clearRecords()
      if (response.success) {
        setRecords([])
        setFilteredRecords([])
        toast.success('All statements cleared successfully')
      } else {
        toast.error(response.error || 'Failed to clear records')
      }
    } catch (error) {
      toast.error('An error occurred while clearing records')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <DarkModeToggle />
              <button
                onClick={() => navigate('/parser')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition"
              >
                <Upload className="w-5 h-5" />
                <span>Parser</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <KPICards records={records} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Amount Payable by Issuer */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Amount Payable by Issuer
                </h2>
                <Chart records={records} />
              </div>

              {/* Transaction Count by Issuer */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transactions by Issuer
                </h2>
                <TransactionChart records={records} />
              </div>
            </div>

            {/* Card Variant Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Card Variant Distribution
              </h2>
              <CardVariantChart records={records} />
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Statements
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleClearAll}
                    disabled={records.length === 0}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={records.length === 0}
                    className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by filename or card number..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Issuer
                  </label>
                  <select
                    value={issuerFilter}
                    onChange={(e) => setIssuerFilter(e.target.value as Issuer | 'ALL')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ALL">All Issuers</option>
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                    <option value="SBI">SBI</option>
                    <option value="AXIS">AXIS</option>
                    <option value="AMEX">AMEX</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {records.length === 0 ? (
                    <>
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No statements parsed yet</p>
                      <button
                        onClick={() => navigate('/parser')}
                        className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Upload your first statement
                      </button>
                    </>
                  ) : (
                    <p>No statements match your filters</p>
                  )}
                </div>
              ) : (
                <RecordsTable records={filteredRecords} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
