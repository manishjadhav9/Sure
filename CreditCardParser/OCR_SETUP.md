# OCR Setup Guide

The Credit Card Parser now includes optional OCR support for scanned or image-based PDFs using Tesseract.

## Prerequisites

### Windows
1. **Download Tesseract**:
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Install the `.exe` file (recommended: tesseract-ocr-w64-setup-5.3.3.exe)

2. **Add to PATH**:
   - Default installation path: `C:\Program Files\Tesseract-OCR`
   - Add to System Environment Variables PATH
   - Or set in your code: `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`

3. **Install Poppler** (for pdf2image):
   - Download from: https://github.com/oschwartz10612/poppler-windows/releases
   - Extract to `C:\Program Files\poppler`
   - Add `C:\Program Files\poppler\Library\bin` to PATH

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install poppler-utils
```

### macOS
```bash
brew install tesseract
brew install poppler
```

## Python Dependencies

Already included in `requirements.txt`:
```
pytesseract==0.3.10
Pillow==10.1.0
pdf2image==1.16.3
```

Install with:
```bash
pip install -r requirements.txt
```

## How It Works

The parser uses a **3-tier fallback system**:

1. **pdfplumber** (Primary) - Fast, works for most PDFs with text
2. **PyPDF2** (Fallback) - Alternative text extraction
3. **Tesseract OCR** (Last Resort) - For scanned/image PDFs

OCR is automatically triggered when:
- Regular text extraction returns < 50 characters
- The PDF contains scanned images instead of text

## Performance Notes

- OCR is **slower** than regular text extraction (5-10 seconds per page)
- Only processes **first 3 pages** to save time
- Uses **300 DPI** for better accuracy
- Gracefully falls back if OCR fails

## Testing OCR

To test if OCR is working:
1. Upload a scanned credit card statement (image-based PDF)
2. Check the parsing results
3. Backend logs will show if OCR was used

## Disabling OCR

If you don't want OCR support:
1. Don't install Tesseract
2. The parser will automatically skip OCR and use only text extraction
3. No code changes needed - it's optional!

## Troubleshooting

### "tesseract is not recognized"
- Tesseract not in PATH
- Solution: Add Tesseract installation directory to PATH

### "Unable to get page count"
- Poppler not installed or not in PATH
- Solution: Install Poppler and add to PATH

### OCR returns gibberish
- Low quality scan
- Solution: Use higher DPI (edit `dpi=300` to `dpi=400` in parser.py)

### OCR is too slow
- Processing too many pages
- Solution: Reduce `last_page=3` to `last_page=1` in parser.py

## Language Support

Default: English (`lang='eng'`)

For other languages:
1. Download language data from: https://github.com/tesseract-ocr/tessdata
2. Place in Tesseract's `tessdata` folder
3. Update parser.py: `pytesseract.image_to_string(image, lang='hin')` for Hindi

## Status Check

Run this to verify OCR is available:
```python
from parser import OCR_AVAILABLE
print(f"OCR Available: {OCR_AVAILABLE}")
```
