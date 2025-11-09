from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import io
import csv
from parser import parse_pdf
from models import ParsedRecord

app = Flask(__name__)
CORS(app)

# In-memory storage for parsed records
records_store = []

# Hardcoded credentials
VALID_EMAIL = "admin@example.com"
VALID_PASSWORD = "admin123"


@app.route('/api/login', methods=['POST'])
def login():
    """
    Dummy login endpoint with hardcoded credentials.
    """
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if email == VALID_EMAIL and password == VALID_PASSWORD:
            return jsonify({
                'success': True,
                'data': {'token': 'dummy-token-12345'}
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/upload', methods=['POST'])
def upload():
    """
    Upload and parse PDF credit card statements.
    Accepts multiple files and returns parsed results immediately.
    """
    try:
        if 'files' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No files provided'
            }), 400

        files = request.files.getlist('files')
        
        if not files or len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'No files provided'
            }), 400

        parsed_results = []

        for file in files:
            if file.filename == '':
                continue

            filename = secure_filename(file.filename)
            
            # Read file bytes
            file_bytes = file.read()
            
            # Parse the PDF
            record = parse_pdf(file_bytes, filename)
            
            # Store in memory
            records_store.append(record)
            
            # Add to results
            parsed_results.append(record.to_dict())

        return jsonify({
            'success': True,
            'data': parsed_results
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/records', methods=['GET'])
def get_records():
    """
    Get all parsed records from memory.
    """
    try:
        return jsonify({
            'success': True,
            'data': [record.to_dict() for record in records_store]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/export.csv', methods=['GET'])
def export_csv():
    """
    Export all records as CSV.
    """
    try:
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Filename', 'Issuer', 'Card Last 4', 
            'Card Variant', 'Amount Payable', 'Transaction Count',
            'Interest Charges', 'Top Spending Category',
            'Uploaded At', 'Status', 'Error'
        ])
        
        # Write data
        for record in records_store:
            writer.writerow([
                record.id,
                record.filename,
                record.issuer,
                record.card_last4 or '',
                record.card_variant or '',
                record.total_balance or '',
                record.transaction_count or '',
                record.interest_charges or '',
                record.top_merchant_category or '',
                record.uploaded_at,
                record.status,
                record.error or ''
            ])
        
        # Prepare response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='credit_card_statements.csv'
        )

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/clear', methods=['DELETE'])
def clear_records():
    """
    Clear all parsed records from memory.
    """
    try:
        global records_store
        records_store = []
        return jsonify({
            'success': True,
            'data': {'message': 'All records cleared successfully'}
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
