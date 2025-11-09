import { useCallback } from 'react'
import { Upload } from 'lucide-react'

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
}

export default function FileDropZone({ onFilesSelected }: FileDropZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      )
      if (files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      )
      if (files.length > 0) {
        onFilesSelected(files)
      }
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        'border-gray-300 dark:border-gray-600 hover:border-primary-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        accept="application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop PDF files here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supports multiple credit card statement PDFs
        </p>
      </label>
    </div>
  )
}
