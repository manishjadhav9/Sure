import { ApiResponse, ParsedRecord } from '../types'

const API_BASE = '/api'

export const api = {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  async uploadFiles(files: File[]): Promise<ApiResponse<ParsedRecord[]>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  async getRecords(): Promise<ApiResponse<ParsedRecord[]>> {
    const response = await fetch(`${API_BASE}/records`)
    return response.json()
  },

  async exportCSV(): Promise<Blob> {
    const response = await fetch(`${API_BASE}/export.csv`)
    return response.blob()
  },

  async clearRecords(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE}/clear`, {
      method: 'DELETE',
    })
    return response.json()
  },
}
