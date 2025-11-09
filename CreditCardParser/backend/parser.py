import re
import pdfplumber
import PyPDF2
from io import BytesIO
from typing import Optional, Tuple, List
from datetime import datetime
from dateutil import parser as date_parser
from models import ParsedRecord
import os

# OCR imports (optional)
try:
    import pytesseract
    from pdf2image import convert_from_bytes
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


def parse_pdf(file_bytes: bytes, filename: str) -> ParsedRecord:
    """
    Main entry point: parse a PDF credit card statement.
    Returns a ParsedRecord with status PARSED or FAILED.
    """
    try:
        # Extract text
        text = extract_text(file_bytes)
        if not text or len(text.strip()) < 50:
            return ParsedRecord.create(
                filename=filename,
                status='FAILED',
                error='Unable to extract text from PDF'
            )

        # Detect issuer
        issuer = detect_issuer(text)

        # Extract fields
        card_last4 = extract_last4(text, issuer)
        card_variant = extract_card_variant(text, issuer)
        total_balance = extract_total_balance(text, issuer)
        transaction_count = extract_transaction_count(text, issuer)
        interest_charges = extract_interest_charges(text, issuer)
        
        # Extract merchants and categorize
        merchants = extract_merchants(text)
        top_category = categorize_merchants(merchants)

        return ParsedRecord.create(
            filename=filename,
            issuer=issuer,
            card_last4=card_last4,
            card_variant=card_variant,
            total_balance=total_balance,
            transaction_count=transaction_count,
            interest_charges=interest_charges,
            top_merchant_category=top_category,
            status='PARSED'
        )

    except Exception as e:
        return ParsedRecord.create(
            filename=filename,
            status='FAILED',
            error=f'Parsing error: {str(e)}'
        )


def extract_text(file_bytes: bytes) -> str:
    """
    Extract text from PDF using pdfplumber (primary), PyPDF2 (fallback), or OCR (last resort).
    """
    text = ""
    
    # Try pdfplumber first
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception:
        pass

    # Fallback to PyPDF2 if pdfplumber fails
    if not text or len(text.strip()) < 50:
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            pass

    # Last resort: OCR if available and text is still insufficient
    if OCR_AVAILABLE and (not text or len(text.strip()) < 50):
        try:
            # Convert PDF to images
            images = convert_from_bytes(file_bytes, dpi=300, first_page=1, last_page=3)  # First 3 pages only
            
            for image in images:
                # Perform OCR on each page
                ocr_text = pytesseract.image_to_string(image, lang='eng')
                if ocr_text:
                    text += ocr_text + "\n"
        except Exception as e:
            # OCR failed, continue with whatever text we have
            pass

    # Clean text: normalize whitespace, join hyphenated lines
    text = re.sub(r'-\s*\n\s*', '', text)  # Join hyphenated words
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()


def detect_issuer(text: str) -> str:
    """
    Detect credit card issuer from text using keyword heuristics.
    """
    text_upper = text.upper()
    
    # HDFC patterns
    if any(pattern in text_upper for pattern in [
        'HDFC BANK',
        'HDFC CREDIT CARD',
        'HDFCBANK'
    ]):
        return 'HDFC'
    
    # ICICI patterns
    if any(pattern in text_upper for pattern in [
        'ICICI BANK',
        'ICICI CREDIT CARD',
        'ICICIBANK'
    ]):
        return 'ICICI'
    
    # SBI patterns
    if any(pattern in text_upper for pattern in [
        'STATE BANK OF INDIA',
        'SBI CARD',
        'SBICARD',
        'SBI CREDIT CARD'
    ]):
        return 'SBI'
    
    # Axis patterns
    if any(pattern in text_upper for pattern in [
        'AXIS BANK',
        'AXIS CREDIT CARD',
        'AXISBANK'
    ]):
        return 'AXIS'
    
    # American Express patterns
    if any(pattern in text_upper for pattern in [
        'AMERICAN EXPRESS',
        'AMEX',
        'AMERICANEXPRESS'
    ]):
        return 'AMEX'
    
    return 'UNKNOWN'


def extract_last4(text: str, issuer: str) -> Optional[str]:
    """
    Extract last 4 digits of card number.
    """
    patterns = [
        r'Card\s*(?:No\.?|Number|#)?\s*(?:ending\s*(?:in|with))?\s*[:#-]?\s*[xX*]{4,16}[\s-]?(\d{4})',
        r'(?:Card|Account)\s*(?:No\.?|Number)?\s*[:#-]?\s*(?:[xX*\d]{4}[\s-]?){3}(\d{4})',
        r'(?:ending|ends)\s*(?:in|with)\s*(\d{4})',
        r'[xX*]{4,16}[\s-]?(\d{4})(?!\d)',
        r'(?:xxxx|XXXX)[\s-]?(\d{4})',
        r'\d{4}[\s-]\d{4}[\s-]\d{4}[\s-](\d{4})',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            last4 = match.group(1)
            if last4.isdigit() and len(last4) == 4:
                return last4
    
    return None


def extract_card_variant(text: str, issuer: str) -> Optional[str]:
    """
    Extract card variant/type (e.g., Platinum, Gold, Signature).
    """
    variant_patterns = [
        r'(?:Card\s*Type|Variant|Product)[:\s-]*([A-Za-z\s]+?)(?:Card|Credit)',
        r'(Platinum|Gold|Silver|Titanium|Signature|Classic|Premium|Rewards|Cashback|Millennia|Regalia)(?:\s+(?:Card|Credit))?',
        r'(?:HDFC|ICICI|SBI|Axis|AMEX)\s+([A-Za-z\s]+?)(?:Card|Credit)',
    ]
    
    for pattern in variant_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            variant = match.group(1).strip()
            if len(variant) > 2 and len(variant) < 50:
                return variant.title()
    
    return None


def extract_total_balance(text: str, issuer: str) -> Optional[float]:
    """
    Extract total balance/outstanding amount.
    """
    patterns = [
        # Standard balance patterns
        r'(?:Total|Outstanding|Current)\s*Balance\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Total\s*Amount\s*(?:Due|Outstanding)\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Amount\s*(?:Payable|Due)\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'(?:Closing|Statement)\s*Balance\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Payment patterns
        r'(?:Minimum|Total)\s*Payment\s*(?:Due|Amount)\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Pay(?:ment)?\s*(?:Due|Amount)\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Due amount patterns
        r'(?:Amount|Total)\s*Due\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Due\s*Amount\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Currency first patterns
        r'(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:Total|Balance|Due|Outstanding|Payable)',
        r'Balance\s*(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)',
        
        # New/Unbilled patterns
        r'(?:New|Unbilled)\s*(?:Balance|Amount)\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Credit limit usage patterns (sometimes shows outstanding)
        r'(?:Total|Current)\s*Outstanding\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Table-like patterns (common in statements)
        r'(?:Total|Balance|Outstanding|Due)\s+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)\s*(?:\n|$)',
        
        # Axis/ICICI specific patterns
        r'(?:Statement|Billing)\s*Amount\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # HDFC specific patterns
        r'(?:Total|Minimum)\s*Amount\s*Payable\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        
        # Generic amount after label
        r'(?:Balance|Outstanding|Due|Payable|Amount)\s*[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
    ]
    
    # Try all patterns and collect valid amounts
    found_amounts = []
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            amount_str = match.group(1)
            amount = normalize_amount(amount_str)
            if amount is not None and amount > 0 and amount < 10000000:  # Reasonable range
                found_amounts.append(amount)
    
    # Return the most common amount or the largest if all unique
    if found_amounts:
        # If we found multiple amounts, return the most frequent one
        from collections import Counter
        if len(found_amounts) > 1:
            amount_counts = Counter(found_amounts)
            most_common = amount_counts.most_common(1)[0][0]
            return most_common
        return found_amounts[0]
    
    return None


def extract_transaction_count(text: str, issuer: str) -> Optional[int]:
    """
    Extract number of transactions from the statement.
    """
    # Try to count transaction entries
    transaction_patterns = [
        r'(?:Total\s*)?(?:Number\s*of\s*)?Transactions?\s*[:#-]?\s*(\d+)',
        r'(\d+)\s*Transactions?',
    ]
    
    for pattern in transaction_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                count = int(match.group(1))
                if 0 < count < 10000:  # Sanity check
                    return count
            except ValueError:
                pass
    
    # Try to count date patterns that might indicate transactions
    # Look for patterns like DD/MM or DD-MMM that appear multiple times
    date_patterns = re.findall(r'\b\d{2}[/-](?:\d{2}|[A-Za-z]{3})\b', text)
    if len(date_patterns) > 5:  # If we find many dates, estimate transaction count
        return len(date_patterns) // 2  # Rough estimate (each transaction might have 2 dates)
    
    return None


def normalize_amount(amount_str: str) -> Optional[float]:
    """
    Normalize amount string to float (remove commas, currency symbols).
    """
    try:
        # Remove commas, currency symbols, whitespace
        cleaned = re.sub(r'[,₹\s]', '', amount_str)
        cleaned = re.sub(r'Rs\.?|INR', '', cleaned, flags=re.IGNORECASE)
        amount = float(cleaned.strip())
        return round(amount, 2)
    except (ValueError, AttributeError):
        return None


def extract_interest_charges(text: str, issuer: str) -> Optional[float]:
    """
    Extract interest charges/finance charges from the statement.
    """
    patterns = [
        r'(?:Interest|Finance)\s*Charge[sd]?\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'(?:Late|Penalty)\s*(?:Fee|Charge)[s]?\s*[:#-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Interest\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'Finance\s*Charges?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)\s*(?:Interest|Finance)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1)
            amount = normalize_amount(amount_str)
            if amount is not None and amount > 0:
                return amount
    
    return None


def extract_merchants(text: str) -> List[str]:
    """
    Extract merchant names from transaction descriptions.
    """
    merchants = []
    
    # Common patterns for merchant names in statements
    # Look for lines that might contain merchant info
    merchant_patterns = [
        r'(?:POS|PURCHASE|TXN)\s+(?:AT\s+)?([A-Z][A-Z\s&\-\.]{3,40})',
        r'([A-Z][A-Z\s&\-\.]{3,40})\s+(?:BANGALORE|MUMBAI|DELHI|PUNE|HYDERABAD|CHENNAI)',
        r'(?:SWIGGY|ZOMATO|AMAZON|FLIPKART|UBER|OLA|PAYTM|PHONEPE|GPAY)([A-Z\s]*)',
    ]
    
    for pattern in merchant_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            merchant = match.strip()
            if len(merchant) > 3 and len(merchant) < 50:
                merchants.append(merchant.title())
    
    return merchants


def categorize_merchants(merchants: List[str]) -> Optional[str]:
    """
    Categorize merchants into spending categories and return the top category.
    """
    if not merchants:
        return None
    
    # Category keywords mapping
    categories = {
        'Food & Dining': ['SWIGGY', 'ZOMATO', 'RESTAURANT', 'CAFE', 'PIZZA', 'BURGER', 'FOOD', 'MCDONALD', 'KFC', 'DOMINO', 'STARBUCKS'],
        'Shopping': ['AMAZON', 'FLIPKART', 'MYNTRA', 'AJIO', 'MALL', 'STORE', 'SHOP', 'RETAIL', 'MART'],
        'Transportation': ['UBER', 'OLA', 'RAPIDO', 'PETROL', 'FUEL', 'PARKING', 'TOLL'],
        'Entertainment': ['NETFLIX', 'PRIME', 'HOTSTAR', 'SPOTIFY', 'CINEMA', 'MOVIE', 'THEATRE', 'BOOKMYSHOW'],
        'Utilities': ['ELECTRICITY', 'WATER', 'GAS', 'INTERNET', 'BROADBAND', 'MOBILE', 'RECHARGE'],
        'Travel': ['AIRLINE', 'FLIGHT', 'HOTEL', 'BOOKING', 'MAKEMYTRIP', 'GOIBIBO', 'IRCTC'],
        'Healthcare': ['HOSPITAL', 'PHARMACY', 'MEDICAL', 'CLINIC', 'DOCTOR', 'APOLLO', 'MEDPLUS'],
        'Digital Services': ['PAYTM', 'PHONEPE', 'GPAY', 'GOOGLE', 'MICROSOFT', 'APPLE', 'ADOBE'],
    }
    
    # Count matches for each category
    category_counts = {cat: 0 for cat in categories}
    
    for merchant in merchants:
        merchant_upper = merchant.upper()
        for category, keywords in categories.items():
            if any(keyword in merchant_upper for keyword in keywords):
                category_counts[category] += 1
    
    # Return the category with most matches
    if max(category_counts.values()) > 0:
        top_category = max(category_counts, key=category_counts.get)
        return top_category
    
    return 'Other'


