# 🧾 Credit Card Statement Parser Dashboard

A production-quality full-stack application that automatically parses PDF credit card statements and visualizes the extracted data in a clean, professional dashboard.

## ✨ Features

### 🔍 Advanced Parsing
- **Multi-Bank Support**: Parse statements from HDFC, ICICI, SBI, Axis, and American Express
- **OCR Support**: Automatically extracts text from scanned/image-based PDFs using Tesseract
- **3-Tier Text Extraction**: pdfplumber → PyPDF2 → OCR (fallback)
- **Smart Data Extraction**: 
  - Card last 4 digits
  - Card variant (Platinum, Gold, Cashback, etc.)
  - Total balance/amount payable
  - Transaction count
  - Interest charges & finance fees
  - Merchant categorization

### 📊 Analytics & Insights
- **Interactive Dashboard**: 
  - View all parsed statements with sorting (most recent first)
  - Search and filter by issuer
  - Export data to CSV with all fields
  - Clear all statements option
- **Visual Analytics**:
  - Amount Payable by Issuer (Bar Chart)
  - Transactions by Issuer (Bar Chart)
  - Card Variant Distribution (Pie Chart)
  - KPI Cards with totals
- **Merchant Categorization**: 
  - 8 spending categories (Food, Shopping, Travel, etc.)
  - Automatic merchant detection and classification
  - Top spending category display

### 🎨 Modern UI
- **Dark Mode**: Toggle between light and dark themes with persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Built with React 18, TypeScript, and TailwindCSS
- **Real-time Updates**: Hot module replacement for instant feedback

## 🆕 What's New (Latest Updates)

- ✅ **OCR Support**: Extract text from scanned PDFs using Tesseract
- ✅ **Merchant Categorization**: Automatic spending category detection (8 categories)
- ✅ **Interest Charges**: Track finance charges and late fees
- ✅ **Dark Mode**: Full dark theme with localStorage persistence
- ✅ **Enhanced Charts**: 3 interactive charts (2 bar + 1 pie)
- ✅ **Clear All**: Option to clear all statements for fresh exports
- ✅ **Sort by Recent**: Most recent statements appear first
- ✅ **Better Extraction**: 17+ regex patterns for improved accuracy
- ✅ **Category Badges**: Visual spending category indicators
- ✅ **Improved UX**: Better dark mode text visibility and centered icons

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
- Flask (Python 3.8+)
- pdfplumber for PDF text extraction
- PyPDF2 as fallback parser
- Tesseract OCR for scanned PDFs (optional)
- pdf2image for PDF to image conversion
- In-memory data storage
- RESTful API design with CORS support

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **pip** for Python package management
- **Tesseract OCR** (optional, for scanned PDFs) - See [OCR_SETUP.md](OCR_SETUP.md)
- **Poppler** (optional, for OCR) - See [OCR_SETUP.md](OCR_SETUP.md)

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
│   ├── app.py              # Flask API server with all endpoints
│   ├── parser.py           # Advanced PDF parser with OCR & categorization
│   ├── models.py           # Data models (ParsedRecord with new fields)
│   └── requirements.txt    # Python dependencies (includes OCR libs)
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Parser, Dashboard pages
│   │   ├── components/     # Reusable UI components (with dark mode)
│   │   ├── contexts/       # AuthContext, ThemeContext
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main app with providers
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js  # With dark mode enabled
├── CreditStatements/       # Sample PDF statements for testing
├── OCR_SETUP.md           # OCR installation guide
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

**DELETE** `/api/clear`
- Clears all parsed records from memory
- Returns: Success confirmation

## 📊 Data Model

```typescript
type ParsedRecord = {
  id: string
  filename: string
  issuer: 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'AMEX' | 'UNKNOWN'
  card_last4: string | null
  card_variant: string | null           // NEW: Platinum, Gold, etc.
  total_balance: number | null          // Amount payable (INR)
  transaction_count: number | null      // Number of transactions
  interest_charges: number | null       // NEW: Interest/finance charges
  top_merchant_category: string | null  // NEW: Top spending category
  uploaded_at: string                   // ISO timestamp
  status: 'PARSED' | 'FAILED'
  error?: string
}
```

## 🧪 Testing with Sample PDFs

The `CreditStatements/` directory contains sample PDF statements for testing. Upload these through the Parser page to see the extraction in action.

## 🎨 UI Pages

### 1. Login (`/login`)
- Email and password authentication
- Form validation with React Hook Form
- Demo credentials displayed
- Dark mode toggle

### 2. Parser (`/parser`)
- Drag-and-drop file upload with visual feedback
- Multi-file PDF support
- Real-time parsing status with progress
- Results table with all extracted fields
- Success/failure indicators
- Dark mode support

### 3. Dashboard (`/dashboard`)
- **KPI Cards**: Total Statements, Amount Payable, Total Transactions
- **Visual Analytics**:
  - Amount Payable by Issuer (Bar Chart)
  - Transactions by Issuer (Bar Chart)
  - Card Variant Distribution (Pie Chart)
- **Data Table**: 
  - Searchable and filterable
  - Shows all fields including interest and category
  - Sorted by most recent first
- **Actions**:
  - Export to CSV
  - Clear All Statements
- **Dark mode** with theme persistence

## 🔧 Parser Implementation

The parser (`backend/parser.py`) uses an advanced multi-tier approach:

1. **Text Extraction** (3-tier fallback):
   - Primary: pdfplumber (fast, works for most PDFs)
   - Fallback: PyPDF2 (alternative extraction)
   - Last Resort: Tesseract OCR (for scanned/image PDFs)

2. **Issuer Detection**: Keyword-based heuristics for 5 major issuers

3. **Field Extraction** with 17+ regex patterns:
   - Card details (last 4 digits, variant)
   - Financial data (balance, interest charges)
   - Transaction information (count, merchants)

4. **Merchant Categorization**:
   - Extracts merchant names from transactions
   - Categorizes into 8 spending categories
   - Returns top spending category

5. **Data Normalization**: Converts amounts to float, handles currency symbols

6. **Error Handling**: Graceful failures with detailed error messages

### Adding New Issuer Patterns

Edit `backend/parser.py` and add patterns to:
- `detect_issuer()` - Add issuer keywords
- Field extraction functions - Add issuer-specific regex patterns

## 🎯 Key Features

### Robust Parsing
- Handles multiple PDF formats (text-based and scanned)
- 3-tier fallback mechanism (pdfplumber → PyPDF2 → OCR)
- Defensive coding for noisy/malformed PDFs
- 17+ regex patterns for data extraction
- Normalizes amounts and handles currency symbols
- Merchant detection and categorization

### Clean UI/UX
- **Light & Dark Mode** with localStorage persistence
- Green (#16A34A) primary color with professional design
- Fully responsive for desktop, tablet, and mobile
- Loading states, progress indicators, and error toasts
- Empty states with helpful messages
- Accessible keyboard navigation
- Smooth transitions and hover effects

### Type Safety
- Full TypeScript coverage in frontend
- Type-safe API client with proper error handling
- Validated data models on both frontend and backend
- React Context for state management

### Data Insights
- 3 interactive charts (bar and pie)
- KPI cards with aggregated metrics
- Merchant spending categorization
- Interest charges tracking
- Sortable and filterable data table

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

**PDF parsing fails:**
- Ensure PDF is not password-protected
- For scanned PDFs, install Tesseract OCR (see [OCR_SETUP.md](OCR_SETUP.md))
- Check if text extraction returns < 50 characters (OCR will auto-trigger)
- Review error message in the results table

**OCR not working:**
- Verify Tesseract is installed: `tesseract --version`
- Check Poppler is installed and in PATH
- See detailed setup in [OCR_SETUP.md](OCR_SETUP.md)
- OCR is optional - parser works without it for text-based PDFs

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

- **Optional OCR**: Tesseract OCR is optional - works without it for text-based PDFs
- **Dummy Authentication**: Hardcoded credentials for demo purposes
- **In-Memory Storage**: Records stored in memory (cleared on restart)
- **Theme Persistence**: Dark mode preference saved in localStorage
- **Modular Architecture**: Separate contexts for Auth and Theme management

## 🚀 Production Deployment

For production use, consider:
1. Implement real authentication (JWT, OAuth)
2. Add SQLite/PostgreSQL for persistent storage
3. Add rate limiting and file size validation
4. Implement proper error logging and monitoring
5. Add unit tests for parser functions
6. Set up CI/CD pipeline
7. Use environment variables for configuration
8. Optimize OCR performance (caching, async processing)
9. Add data backup and recovery mechanisms
10. Implement user management and multi-tenancy

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
