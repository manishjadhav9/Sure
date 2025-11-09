import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, XCircle, BarChart3, LogOut } from 'lucide-react'
import { api } from '../services/api'
import { ParsedRecord } from '../types'
import { useAuth } from '../contexts/AuthContext'
import FileDropZone from '../components/FileDropZone'
import RecordsTable from '../components/RecordsTable'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Parser() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<ParsedRecord[]>([])

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setIsUploading(true)
    try {
      const response = await api.uploadFiles(files)
      
      if (response.success && response.data) {
        setResults(response.data)
        const successCount = response.data.filter(r => r.status === 'PARSED').length
        const failCount = response.data.filter(r => r.status === 'FAILED').length
        
        if (successCount > 0) {
          toast.success(`Successfully parsed ${successCount} file(s)`)
        }
        if (failCount > 0) {
          toast.error(`Failed to parse ${failCount} file(s)`)
        }
        
        setFiles([])
      } else {
        toast.error(response.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('An error occurred during upload')
    } finally {
      setIsUploading(false)
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statement Parser</h1>
            </div>
            <div className="flex items-center space-x-3">
              <DarkModeToggle />
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
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
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Credit Card Statements
            </h2>
            
            <FileDropZone onFilesSelected={handleFilesSelected} />

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Files ({files.length}):
                </p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-400 dark:text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  <span>{isUploading ? 'Parsing...' : 'Parse Statements'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Parsing Results
                </h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{results.filter(r => r.status === 'PARSED').length} Success</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span>{results.filter(r => r.status === 'FAILED').length} Failed</span>
                  </div>
                </div>
              </div>
              
              <RecordsTable records={results} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
