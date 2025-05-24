import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes, allowing your frontend to connect

ALPACA_API_KEY_ID = os.getenv('ALPACA_API_KEY_ID')
ALPACA_API_SECRET_KEY = os.getenv('ALPACA_API_SECRET_KEY')
ALPACA_BASE_URL = 'https://data.alpaca.markets' # Alpaca's data API base URL

if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
    print("CRITICAL: Alpaca API keys are not configured in .env file.")
    # You might want to raise an exception or exit here in a real app

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

if __name__ == '__main__':
    # Default port for Flask is 5000. You can change it if needed.
    # Ensure debug=False for production.
    app.run(debug=True, port=5001) # Running on port 5001 to avoid conflict with Vite (often 5173 or 3000) 