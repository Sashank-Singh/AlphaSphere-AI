import os
import sys
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import threading
import time

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import yahoo_finance # Import the new module

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes, allowing your frontend to connect

ALPACA_API_KEY_ID = os.getenv('ALPACA_API_KEY_ID')
ALPACA_API_SECRET_KEY = os.getenv('ALPACA_API_SECRET_KEY')
ALPACA_BASE_URL = 'https://data.alpaca.markets' # Alpaca's data API base URL

# Make Alpaca optional - only warn if keys are missing
if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
    print("INFO: Alpaca API keys are not configured. Alpaca functionality will be disabled.")
    print("You can still use Yahoo Finance endpoints.")

def periodic_cache_cleanup():
    """Background thread to periodically clean up expired cache entries."""
    while True:
        try:
            time.sleep(300)  # Run every 5 minutes
            yahoo_finance.periodic_cache_cleanup()
        except Exception as e:
            print(f"Error in cache cleanup: {e}")

# Start cache cleanup thread
cache_cleanup_thread = threading.Thread(target=periodic_cache_cleanup, daemon=True)
cache_cleanup_thread.start()

@app.route('/alpaca/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE']) # Allow various methods
def alpaca_proxy(endpoint):
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
        return jsonify({"error": "API keys not configured on server"}), 500

    headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY,
        'Accept': 'application/json'
    }

    # Forward relevant headers from the incoming request if needed
    # For example, Content-Type for POST requests
    if 'Content-Type' in request.headers:
        headers['Content-Type'] = request.headers['Content-Type']

    # Construct the full URL to Alpaca
    alpaca_url = f"{ALPACA_BASE_URL}/{endpoint}"

    try:
        # Make the request to Alpaca
        if request.method == 'GET':
            alpaca_response = requests.get(alpaca_url, headers=headers, params=request.args)
        elif request.method == 'POST':
            alpaca_response = requests.post(alpaca_url, headers=headers, params=request.args, json=request.json)
        # Add other methods (PUT, DELETE) if needed
        else:
            return jsonify({"error": "Unsupported HTTP method"}), 405

        # Raise an exception for bad status codes (4xx or 5xx)
        alpaca_response.raise_for_status()

        # Return the JSON response from Alpaca
        return jsonify(alpaca_response.json()), alpaca_response.status_code

    except requests.exceptions.HTTPError as http_err:
        # Attempt to return Alpaca's error message if available
        try:
            error_details = http_err.response.json()
        except ValueError: # If Alpaca's error response isn't JSON
            error_details = {"error": str(http_err), "details": http_err.response.text}
        return jsonify(error_details), http_err.response.status_code
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": "Failed to connect to Alpaca API", "details": str(req_err)}), 503 # Service Unavailable
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# --- Yahoo Finance Routes ---

@app.route('/api/yahoo/quote/<string:symbol>', methods=['GET'])
def get_quote(symbol):
    """
    Endpoint to get a stock quote.
    """
    try:
        quote = yahoo_finance.get_stock_quote(symbol)
        if quote:
            return jsonify(quote)
        return jsonify({'error': 'Symbol not found or data unavailable'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to fetch quote', 'details': str(e)}), 500

@app.route('/api/yahoo/info/<string:symbol>', methods=['GET'])
def get_info(symbol):
    """
    Endpoint to get company information.
    """
    try:
        info = yahoo_finance.get_company_info(symbol)
        if info:
            return jsonify(info)
        return jsonify({'error': 'Symbol not found or data unavailable'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to fetch company info', 'details': str(e)}), 500

@app.route('/api/yahoo/history/<string:symbol>', methods=['GET'])
def get_history(symbol):
    """
    Endpoint to get historical price data.
    """
    try:
        period = request.args.get('period', '1y')
        interval = request.args.get('interval', '1d')
        history = yahoo_finance.get_historical_prices(symbol, period, interval)
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch history', 'details': str(e)}), 500

@app.route('/api/yahoo/recommendation/<string:symbol>', methods=['GET'])
def get_recommendation(symbol):
    """
    Endpoint to get a trade recommendation.
    """
    try:
        recommendation = yahoo_finance.get_trade_recommendation(symbol)
        if recommendation:
            return jsonify(recommendation)
        return jsonify({'error': 'Could not generate recommendation for symbol'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to generate recommendation', 'details': str(e)}), 500

@app.route('/api/yahoo/options_recommendation/<string:symbol>', methods=['GET'])
def get_options_recommendation_route(symbol):
    """
    Endpoint to get an options trading recommendation.
    """
    try:
        recommendation = yahoo_finance.get_options_recommendation(symbol)
        if recommendation:
            return jsonify(recommendation)
        return jsonify({'error': 'Could not generate options recommendation for symbol'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to generate options recommendation', 'details': str(e)}), 500

@app.route('/api/yahoo/news', methods=['GET'])
def get_market_news():
    """
    Endpoint to get market news from Yahoo Finance.
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        news = yahoo_finance.get_market_news(limit)
        return jsonify(news)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch market news', 'details': str(e)}), 500

@app.route('/api/yahoo/sectors', methods=['GET'])
def get_sector_performance():
    """
    Endpoint to get sector performance data.
    """
    try:
        sectors = yahoo_finance.get_sector_performance()
        return jsonify(sectors)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch sector performance', 'details': str(e)}), 500

@app.route('/api/cache/status', methods=['GET'])
def get_cache_status():
    """
    Endpoint to get cache status and statistics.
    """
    try:
        import yahoo_finance
        cache_info = {
            'total_entries': len(yahoo_finance.cache_storage),
            'cache_file_exists': os.path.exists(yahoo_finance.CACHE_FILE),
            'cache_file_size': os.path.getsize(yahoo_finance.CACHE_FILE) if os.path.exists(yahoo_finance.CACHE_FILE) else 0
        }
        return jsonify(cache_info)
    except Exception as e:
        return jsonify({'error': 'Failed to get cache status', 'details': str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """
    Endpoint to clear the cache.
    """
    try:
        import yahoo_finance
        yahoo_finance.cache_storage.clear()
        if os.path.exists(yahoo_finance.CACHE_FILE):
            os.remove(yahoo_finance.CACHE_FILE)
        return jsonify({'message': 'Cache cleared successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to clear cache', 'details': str(e)}), 500

if __name__ == '__main__':
    # Default port for Flask is 5000. You can change it if needed.
    # Ensure debug=False for production.
    app.run(debug=True, port=5001) 