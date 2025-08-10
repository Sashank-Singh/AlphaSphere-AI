import os
import sys
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import threading
import time
import logging
from datetime import datetime, timedelta
import json

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import yahoo_finance # Import the new module
from llm_analysis import llm_analysis_service # Import LLM analysis service

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes, allowing your frontend to connect
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY') or os.getenv('VITE_DEEPSEEK_API_KEY')

ALPACA_API_KEY_ID = os.getenv('ALPACA_API_KEY_ID')
ALPACA_API_SECRET_KEY = os.getenv('ALPACA_API_SECRET_KEY')
ALPACA_DATA_URL = 'https://data.alpaca.markets' # Alpaca's data API base URL
ALPACA_PAPER_URL = 'https://paper-api.alpaca.markets' # Alpaca's paper trading URL
ALPACA_LIVE_URL = 'https://api.alpaca.markets' # Alpaca's live trading URL

# Default to paper trading for safety
ALPACA_IS_PAPER = os.getenv('ALPACA_PAPER_TRADING', 'true').lower() == 'true'
ALPACA_BASE_URL = ALPACA_PAPER_URL if ALPACA_IS_PAPER else ALPACA_LIVE_URL

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

    # Construct the full URL to Alpaca (use data URL for data endpoints, trading URL for trading)
    if endpoint.startswith('v2/') or 'bars' in endpoint or 'trades' in endpoint:
        alpaca_url = f"{ALPACA_DATA_URL}/{endpoint}"
    else:
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

@app.route('/api/yahoo/news/<string:symbol>', methods=['GET'])
def get_symbol_news(symbol):
    """
    Endpoint to get news for a specific symbol from Yahoo Finance.
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        news = yahoo_finance.get_symbol_news(symbol.upper(), limit)
        return jsonify(news)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch news for {symbol}', 'details': str(e)}), 500

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

@app.route('/api/yahoo/options/<string:symbol>', methods=['GET'])
def get_options_chain(symbol):
    """
    Endpoint to get options chain data for a symbol.
    """
    try:
        expiry_date = request.args.get('expiry', None)
        limit = request.args.get('limit', 20, type=int)
        
        # Get current stock price for reference
        stock_quote = yahoo_finance.get_stock_quote(symbol)
        if not stock_quote:
            return jsonify({'error': 'Stock quote not available'}), 404
        
        current_price = stock_quote['price']
        
        # Generate options chain data
        options_data = yahoo_finance.get_options_chain(symbol, current_price, expiry_date, limit)
        return jsonify(options_data)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch options chain', 'details': str(e)}), 500

@app.route('/api/yahoo/options/expirations/<string:symbol>', methods=['GET'])
def get_options_expirations(symbol):
    """
    Endpoint to get available expiration dates for options.
    """
    try:
        expirations = yahoo_finance.get_options_expirations(symbol)
        return jsonify(expirations)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch options expirations', 'details': str(e)}), 500

# --- DeepSeek Proxy Route ---
@app.route('/api/deepseek/chat', methods=['POST'])
def deepseek_chat():
    try:
        if not DEEPSEEK_API_KEY:
            return jsonify({'error': 'DeepSeek API key not configured on server'}), 500
        payload = request.get_json(force=True) or {}
        # Ensure required fields
        if 'messages' not in payload or not isinstance(payload.get('messages'), list):
            return jsonify({'error': 'Invalid payload: messages array is required'}), 400
        if 'model' not in payload:
            payload['model'] = 'deepseek-chat'
        if 'temperature' not in payload:
            payload['temperature'] = 0.2
        if 'max_tokens' not in payload:
            payload['max_tokens'] = 600

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }

        # Try a few compatible endpoints/model names to maximize success
        endpoints = [
            'https://api.deepseek.com/v1/chat/completions',
            'https://api.deepseek.com/chat/completions',
        ]
        models = [payload.get('model'), 'deepseek-v3', 'deepseek-chat']

        last_err = None
        for url in endpoints:
            for model in models:
                trial_payload = dict(payload)
                trial_payload['model'] = model
                try:
                    resp = requests.post(url, data=json.dumps(trial_payload), headers=headers, timeout=25)
                    if resp.status_code == 200:
                        return jsonify(resp.json())
                    else:
                        # Keep last error to return later
                        last_err = {'status': resp.status_code, 'data': resp.text, 'endpoint': url, 'model': model}
                except requests.exceptions.RequestException as e:
                    last_err = {'status': 502, 'data': str(e), 'endpoint': url, 'model': model}

        if last_err:
            return jsonify({'error': 'DeepSeek upstream error', 'details': last_err}), 502 if last_err.get('status', 500) >= 500 else 400
        return jsonify({'error': 'Unknown DeepSeek error'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'DeepSeek request failed', 'details': str(e)}), 502
    except Exception as e:
        return jsonify({'error': 'DeepSeek proxy error', 'details': str(e)}), 500

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

# --- LLM Analysis Routes ---

@app.route('/api/analyze', methods=['POST'])
def analyze_market():
    """
    Endpoint to get LLM-powered market analysis.
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        market_data = data.get('market_data', {})
        rl_predictions = data.get('rl_predictions', [])
        analysis_type = data.get('analysis_type', 'trading_opportunities')
        
        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400
        
        # Generate comprehensive analysis
        analysis = llm_analysis_service.generate_comprehensive_analysis(
            symbols=symbols,
            market_data=market_data,
            rl_predictions=rl_predictions
        )
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/analyze/context', methods=['POST'])
def analyze_market_context():
    """
    Endpoint to get market context analysis.
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        market_data = data.get('market_data', {})
        rl_predictions = data.get('rl_predictions', [])
        
        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400
        
        # Analyze market context
        context = llm_analysis_service.analyze_market_context(
            symbols=symbols,
            market_data=market_data,
            rl_predictions=rl_predictions
        )
        
        return jsonify({
            'sentiment': context.overall_sentiment,
            'volatility': context.volatility_level,
            'trend': context.market_trend,
            'key_events': context.key_events,
            'sector_performance': context.sector_performance
        })
        
    except Exception as e:
        return jsonify({'error': f'Context analysis failed: {str(e)}'}), 500

@app.route('/api/analyze/opportunities', methods=['POST'])
def analyze_opportunities():
    """
    Endpoint to get trading opportunities analysis.
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        market_data = data.get('market_data', {})
        rl_predictions = data.get('rl_predictions', [])
        
        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400
        
        # Identify trading opportunities
        opportunities = llm_analysis_service.identify_trading_opportunities(
            symbols=symbols,
            rl_predictions=rl_predictions,
            market_data=market_data
        )
        
        return jsonify([{
            'symbol': opp.symbol,
            'type': opp.opportunity_type,
            'confidence': opp.confidence,
            'reasoning': opp.reasoning,
            'risk_level': opp.risk_level,
            'time_horizon': opp.time_horizon
        } for opp in opportunities])
        
    except Exception as e:
        return jsonify({'error': f'Opportunities analysis failed: {str(e)}'}), 500

@app.route('/api/analyze/risks', methods=['POST'])
def analyze_risks():
    """
    Endpoint to get risk factors analysis.
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        market_data = data.get('market_data', {})
        rl_predictions = data.get('rl_predictions', [])
        
        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400
        
        # Identify risk factors
        risk_factors = llm_analysis_service.identify_risk_factors(
            symbols=symbols,
            market_data=market_data,
            rl_predictions=rl_predictions
        )
        
        return jsonify([{
            'factor': rf.factor,
            'impact': rf.impact,
            'description': rf.description,
            'mitigation': rf.mitigation
        } for rf in risk_factors])
        
    except Exception as e:
        return jsonify({'error': f'Risk analysis failed: {str(e)}'}), 500

@app.route('/api/analyze/recommendations', methods=['POST'])
def analyze_recommendations():
    """
    Endpoint to get trading recommendations.
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        market_data = data.get('market_data', {})
        rl_predictions = data.get('rl_predictions', [])
        
        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400
        
        # Generate market context and analysis
        market_context = llm_analysis_service.analyze_market_context(
            symbols=symbols,
            market_data=market_data,
            rl_predictions=rl_predictions
        )
        
        opportunities = llm_analysis_service.identify_trading_opportunities(
            symbols=symbols,
            rl_predictions=rl_predictions,
            market_data=market_data
        )
        
        risk_factors = llm_analysis_service.identify_risk_factors(
            symbols=symbols,
            market_data=market_data,
            rl_predictions=rl_predictions
        )
        
        # Generate recommendations
        recommendations = llm_analysis_service.generate_recommendations(
            market_context=market_context,
            opportunities=opportunities,
            risk_factors=risk_factors
        )
        
        return jsonify([{
            'action': rec.action,
            'reasoning': rec.reasoning,
            'priority': rec.priority,
            'timeframe': rec.timeframe
        } for rec in recommendations])
        
    except Exception as e:
        return jsonify({'error': f'Recommendations analysis failed: {str(e)}'}), 500

# --- Alpaca Trading Routes ---

@app.route('/api/alpaca/account', methods=['GET'])
def get_alpaca_account():
    """Get Alpaca account information"""
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
        return jsonify({"error": "Alpaca API keys not configured"}), 500
    
    try:
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY
        }
        
        response = requests.get(f"{ALPACA_BASE_URL}/v2/account", headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": f"Failed to get account info: {str(e)}"}), 500

@app.route('/api/alpaca/orders', methods=['POST'])
def place_alpaca_order():
    """Place a trade order through Alpaca"""
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
        return jsonify({"error": "Alpaca API keys not configured"}), 500
    
    try:
        order_data = request.json
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY,
            'Content-Type': 'application/json'
        }
        
        response = requests.post(f"{ALPACA_BASE_URL}/v2/orders", 
                               headers=headers, 
                               json=order_data)
        response.raise_for_status()
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": f"Failed to place order: {str(e)}"}), 500

@app.route('/api/alpaca/positions', methods=['GET'])
def get_alpaca_positions():
    """Get current positions from Alpaca"""
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
        return jsonify({"error": "Alpaca API keys not configured"}), 500
    
    try:
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY
        }
        
        response = requests.get(f"{ALPACA_BASE_URL}/v2/positions", headers=headers)
        response.raise_for_status()
        
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": f"Failed to get positions: {str(e)}"}), 500

# --- Options Trading Routes ---

@app.route('/api/options/chain', methods=['GET'])
def get_real_options_chain():
    """Get real-time options chain for a symbol"""
    try:
        symbol = request.args.get('symbol', '').upper()
        expiry = request.args.get('expiry')
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        # Try to get options chain from Yahoo Finance
        import yfinance as yf
        
        ticker = yf.Ticker(symbol)
        info = ticker.info
        current_price = info.get('currentPrice', info.get('regularMarketPrice', 150))
        
        # Get available expiration dates
        try:
            expirations = ticker.options
            if not expirations:
                # Return mock data if no real options available
                return jsonify(generate_mock_options_chain(symbol, current_price))
                
            # Use specified expiry or first available
            target_expiry = expiry if expiry in expirations else expirations[0]
            
            # Get options chain for the expiry
            options_chain = ticker.option_chain(target_expiry)
            
            # Process calls and puts
            calls = []
            puts = []
            
            if hasattr(options_chain, 'calls') and not options_chain.calls.empty:
                for _, call in options_chain.calls.iterrows():
                    calls.append({
                        'symbol': call.get('contractSymbol', ''),
                        'strike': float(call.get('strike', 0)),
                        'expiry': target_expiry,
                        'bid': float(call.get('bid', 0)),
                        'ask': float(call.get('ask', 0)),
                        'last': float(call.get('lastPrice', 0)),
                        'volume': int(call.get('volume', 0)) if call.get('volume') else 0,
                        'openInterest': int(call.get('openInterest', 0)) if call.get('openInterest') else 0,
                        'impliedVolatility': float(call.get('impliedVolatility', 0)) if call.get('impliedVolatility') else 0,
                        'percentChange': float(call.get('percentChange', 0)) if call.get('percentChange') else 0
                    })
            
            if hasattr(options_chain, 'puts') and not options_chain.puts.empty:
                for _, put in options_chain.puts.iterrows():
                    puts.append({
                        'symbol': put.get('contractSymbol', ''),
                        'strike': float(put.get('strike', 0)),
                        'expiry': target_expiry,
                        'bid': float(put.get('bid', 0)),
                        'ask': float(put.get('ask', 0)),
                        'last': float(put.get('lastPrice', 0)),
                        'volume': int(put.get('volume', 0)) if put.get('volume') else 0,
                        'openInterest': int(put.get('openInterest', 0)) if put.get('openInterest') else 0,
                        'impliedVolatility': float(put.get('impliedVolatility', 0)) if put.get('impliedVolatility') else 0,
                        'percentChange': float(put.get('percentChange', 0)) if put.get('percentChange') else 0
                    })
            
            return jsonify({
                'underlying': symbol,
                'underlyingPrice': current_price,
                'expirationDates': list(expirations),
                'calls': calls,
                'puts': puts,
                'timestamp': time.time()
            })
            
        except Exception as e:
            logging.warning(f"Could not fetch real options for {symbol}: {e}")
            return jsonify(generate_mock_options_chain(symbol, current_price))
            
    except Exception as e:
        logging.error(f"Error fetching options chain for {symbol}: {e}")
        return jsonify({'error': 'Failed to fetch options chain'}), 500

@app.route('/api/options/flow', methods=['GET'])
def get_real_options_flow():
    """Get options flow and unusual activity"""
    try:
        symbol = request.args.get('symbol')
        
        # For now, return mock options flow data
        # In production, this would connect to a real options flow provider
        unusual_activity = []
        
        symbols_to_analyze = [symbol] if symbol else ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'SPY', 'QQQ']
        
        for sym in symbols_to_analyze:
            for i in range(3):  # 3 entries per symbol
                unusual_activity.append({
                    'symbol': sym,
                    'type': 'call' if i % 2 == 0 else 'put',
                    'strike': 150 + (i * 10),
                    'expiry': (datetime.now() + timedelta(days=7 + i*7)).strftime('%Y-%m-%d'),
                    'volume': 1000 + (i * 500),
                    'openInterest': 5000 + (i * 1000),
                    'premium': 5.0 + (i * 2.5),
                    'sentiment': 'bullish' if i % 2 == 0 else 'bearish',
                    'size': ['large', 'block', 'sweep'][i % 3]
                })
        
        return jsonify({
            'unusualActivity': unusual_activity,
            'topVolume': [],
            'topGainers': [],
            'topLosers': [],
            'timestamp': time.time()
        })
        
    except Exception as e:
        logging.error(f"Error fetching options flow: {e}")
        return jsonify({'error': 'Failed to fetch options flow'}), 500

def generate_mock_options_chain(symbol, underlying_price):
    """Generate mock options chain data"""
    import datetime
    import random
    
    # Generate expiration dates
    expirations = []
    for i in range(6):  # Next 6 expirations
        date = datetime.datetime.now() + datetime.timedelta(days=7 + i*7)
        expirations.append(date.strftime('%Y-%m-%d'))
    
    # Generate strikes around current price
    strikes = []
    base_strike = int(underlying_price // 5) * 5  # Round to nearest $5
    for i in range(-4, 5):  # 9 strikes total
        strikes.append(base_strike + (i * 5))
    
    calls = []
    puts = []
    
    for strike in strikes:
        expiry = expirations[0]  # Use first expiry for mock
        
        # Mock call data
        call_intrinsic = max(underlying_price - strike, 0)
        call_time_value = max(0.1, (30/365) * 0.3 * (underlying_price/strike) * 5)
        call_price = call_intrinsic + call_time_value
        
        calls.append({
            'symbol': f"{symbol}{expiry.replace('-', '')}C{strike}",
            'strike': strike,
            'expiry': expiry,
            'bid': round(call_price * 0.98, 2),
            'ask': round(call_price * 1.02, 2),
            'last': round(call_price, 2),
            'volume': int(100 + (abs(underlying_price - strike) * 10)),
            'openInterest': int(500 + (abs(underlying_price - strike) * 50)),
            'impliedVolatility': round(0.2 + (abs(underlying_price - strike) / underlying_price), 3),
            'percentChange': round((random.random() - 0.5) * 20, 2)
        })
        
        # Mock put data
        put_intrinsic = max(strike - underlying_price, 0)
        put_time_value = max(0.1, (30/365) * 0.3 * (strike/underlying_price) * 5)
        put_price = put_intrinsic + put_time_value
        
        puts.append({
            'symbol': f"{symbol}{expiry.replace('-', '')}P{strike}",
            'strike': strike,
            'expiry': expiry,
            'bid': round(put_price * 0.98, 2),
            'ask': round(put_price * 1.02, 2),
            'last': round(put_price, 2),
            'volume': int(80 + (abs(strike - underlying_price) * 8)),
            'openInterest': int(400 + (abs(strike - underlying_price) * 40)),
            'impliedVolatility': round(0.25 + (abs(strike - underlying_price) / underlying_price), 3),
            'percentChange': round((random.random() - 0.5) * 15, 2)
        })
    
    return {
        'underlying': symbol,
        'underlyingPrice': underlying_price,
        'expirationDates': expirations,
        'calls': calls,
        'puts': puts,
        'timestamp': time.time()
    }

# --- Health Check Routes ---

@app.route('/health/yahoo-finance', methods=['GET'])
def health_yahoo_finance():
    """Health check for Yahoo Finance connectivity"""
    try:
        # Test Yahoo Finance connection with a simple quote request
        quote = yahoo_finance.get_stock_quote('AAPL')
        return jsonify({
            'status': 'healthy' if quote else 'degraded',
            'service': 'yahoo-finance',
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'yahoo-finance',
            'error': str(e),
            'timestamp': time.time()
        }), 500

@app.route('/health/alpaca', methods=['GET'])
def health_alpaca():
    """Health check for Alpaca connectivity"""
    if not ALPACA_API_KEY_ID or not ALPACA_API_SECRET_KEY:
        return jsonify({
            'status': 'not_configured',
            'service': 'alpaca',
            'message': 'API keys not configured'
        })
    
    try:
        headers = {
            'APCA-API-KEY-ID': ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': ALPACA_API_SECRET_KEY
        }
        
        response = requests.get(f"{ALPACA_BASE_URL}/v2/account", headers=headers)
        return jsonify({
            'status': 'healthy' if response.ok else 'degraded',
            'service': 'alpaca',
            'is_paper': ALPACA_IS_PAPER,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'alpaca',
            'error': str(e),
            'timestamp': time.time()
        }), 500

if __name__ == '__main__':
    # Default port for Flask is 5000. You can change it if needed.
    # Ensure debug=False for production.
    app.run(debug=True, port=5001) 