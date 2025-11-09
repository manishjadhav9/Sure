# 🧾 Credit Card Statement Parser Dashboard

A production-quality full-stack application that automatically parses PDF credit card statements and visualizes the extracted data in a clean, professional dashboard.

## 🎯 Features

- **Multi-Issuer Support**: Parses statements from HDFC, ICICI, SBI, Axis Bank, and American Express
- **Automatic Extraction**: Extracts 5 key fields from each statement:
  - Issuer identification
  - Card last 4 digits
  - Statement period (start and end dates)
  - Total amount due
  - Payment due date
- **Modern UI**: Clean white & green design with responsive layout
- **Real-time Parsing**: Upload PDFs and see results immediately
- **Data Visualization**: Interactive charts and KPI cards
- **Export Functionality**: Download parsed data as CSV
- **Search & Filter**: Find statements by issuer, card number, or filename

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Recharts for data visualization
- React Router for navigation
- React Hook Form for form validation
- Lucide React for icons

**Backend:**
- Python Flask
- pdfplumber for PDF text extraction
- PyPDF2 as fallback parser
- SQLite for optional persistence

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **pip** for Python package management

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd CreditCardParser
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## 📁 Project Structure

```
CreditCardParser/
├── backend/
│   ├── app.py              # Flask API server
│   ├── parser.py           # Unified PDF parser with issuer detection
│   ├── models.py           # Data models (ParsedRecord, StatementPeriod)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Parser, Dashboard pages
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript type definitions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── CreditStatements/       # Sample PDF statements for testing
└── README.md
```

## 🔌 API Endpoints

### Authentication

**POST** `/api/login`
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Upload & Parse

**POST** `/api/upload`
- Content-Type: `multipart/form-data`
- Body: `files[]` - Array of PDF files
- Returns: Array of `ParsedRecord` objects

### Get Records

**GET** `/api/records`
- Returns: All parsed records

### Export CSV

**GET** `/api/export.csv`
- Downloads: CSV file with all records

## 📊 Data Model

```typescript
type ParsedRecord = {
  id: string
  filename: string
  issuer: 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'AMEX' | 'UNKNOWN'
  card_last4: string | null
  statement_period: {
    start: string | null  // ISO date
    end: string | null    // ISO date
  }
  total_amount_due: number | null  // INR
  payment_due_date: string | null  // ISO date
  uploaded_at: string              // ISO timestamp
  status: 'PARSED' | 'FAILED'
  error?: string
}
```

## 🧪 Testing with Sample PDFs

The `CreditStatements/` directory contains sample PDF statements for testing. Upload these through the Parser page to see the extraction in action.

## 🎨 UI Pages

### 1. Login (`/login`)
- Email and password authentication
- Form validation
- Demo credentials displayed

### 2. Parser (`/parser`)
- Drag-and-drop file upload
- Multi-file support
- Real-time parsing status
- Results table with parsed data

### 3. Dashboard (`/dashboard`)
- KPI cards (Total Statements, Total Due, Due Soon)
- Bar chart showing amount due by issuer
- Searchable and filterable data table
- CSV export functionality

## 🔧 Parser Implementation

The parser (`backend/parser.py`) uses a unified approach:

1. **Text Extraction**: Uses pdfplumber (primary) with PyPDF2 fallback
2. **Issuer Detection**: Keyword-based heuristics for 5 major issuers
3. **Field Extraction**: Regex patterns with issuer-specific tweaks
4. **Data Normalization**: Converts amounts and dates to standard formats
5. **Error Handling**: Returns failed status with error messages

### Adding New Issuer Patterns

Edit `backend/parser.py` and add patterns to:
- `detect_issuer()` - Add issuer keywords
- Field extraction functions - Add issuer-specific regex patterns

## 🎯 Key Features

### Robust Parsing
- Handles multiple PDF formats
- Fallback mechanisms for text extraction
- Defensive coding for noisy PDFs
- Normalizes dates and amounts

### Clean UI/UX
- White background with green (#16A34A) accents
- Responsive design for all screen sizes
- Loading states and error toasts
- Empty states with helpful messages
- Accessible keyboard navigation

### Type Safety
- Full TypeScript coverage in frontend
- Type-safe API client
- Validated data models

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

**PDF parsing fails:**
- Ensure PDF is not password-protected
- Check if PDF contains extractable text (not scanned images)
- Review error message in the results table

### Frontend Issues

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API calls failing:**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure proxy is configured in `vite.config.ts`

## 📝 Development Notes

- **No External OCR**: Uses only pdfplumber and PyPDF2 (no Tesseract required)
- **Dummy Authentication**: Hardcoded credentials for demo purposes
- **In-Memory Storage**: Records stored in memory (cleared on restart)
- **Single Parser File**: All parsing logic in one file for simplicity

## 🚀 Production Deployment

For production use, consider:
1. Implement real authentication (JWT, OAuth)
2. Add SQLite/PostgreSQL for persistent storage
3. Add rate limiting and file size validation
4. Implement proper error logging
5. Add unit tests for parser functions
6. Set up CI/CD pipeline
7. Use environment variables for configuration

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

To add support for new issuers or improve parsing accuracy:
1. Add test PDFs to `CreditStatements/`
2. Update regex patterns in `backend/parser.py`
3. Test with various statement formats
4. Document any issuer-specific quirks

## 📧 Support

For issues or questions, please refer to the inline code comments or create an issue in the repository.

---

**Built with ❤️ using React, TypeScript, Flask, and TailwindCSS**
