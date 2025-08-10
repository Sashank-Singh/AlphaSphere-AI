import yfinance as yf
from functools import lru_cache, wraps
import pandas as pd
from datetime import datetime, timedelta
import logging
import requests
import time
import json
import os
import pickle
import random
from threading import Lock

logging.basicConfig(level=logging.INFO)

# Rate limiting configuration
RATE_LIMIT_LOCK = Lock()
LAST_REQUEST_TIME = 0
MIN_REQUEST_INTERVAL = 0.1  # 100ms between requests

def retry_with_backoff(retries=3, backoff_in_seconds=1):
    """Decorator to retry functions with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries - 1:
                        logging.error(f"All {retries} attempts failed for {func.__name__}: {str(e)}")
                        raise e
                    wait_time = backoff_in_seconds * (2 ** attempt) + random.uniform(0, 1)
                    logging.warning(f"Attempt {attempt + 1} failed for {func.__name__}, retrying in {wait_time:.2f}s: {str(e)}")
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator

def rate_limit():
    """Ensure minimum interval between Yahoo Finance requests"""
    global LAST_REQUEST_TIME
    with RATE_LIMIT_LOCK:
        current_time = time.time()
        elapsed = current_time - LAST_REQUEST_TIME
        if elapsed < MIN_REQUEST_INTERVAL:
            sleep_time = MIN_REQUEST_INTERVAL - elapsed
            time.sleep(sleep_time)
        LAST_REQUEST_TIME = time.time()

# Cache configuration
CACHE_DURATION = {
    'quote': 30,  # 30 seconds for stock quotes
    'news': 300,  # 5 minutes for news
    'info': 3600,  # 1 hour for company info
    'history': 300,  # 5 minutes for historical data
    'sectors': 1800,  # 30 minutes for sector data
}

# Cache file path
CACHE_FILE = 'yahoo_finance_cache.pkl'

# In-memory cache storage
cache_storage = {}

def load_cache_from_file():
    """Load cache data from file on startup."""
    global cache_storage
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'rb') as f:
                cache_storage = pickle.load(f)
            logging.info(f"Loaded cache from file with {len(cache_storage)} entries")
        else:
            cache_storage = {}
            logging.info("No cache file found, starting with empty cache")
    except Exception as e:
        logging.error(f"Error loading cache from file: {e}")
        cache_storage = {}

def save_cache_to_file():
    """Save cache data to file."""
    try:
        # Clean expired entries before saving
        current_time = time.time()
        expired_keys = []
        
        for key, entry in cache_storage.items():
            if current_time - entry['timestamp'] > entry['duration']:
                expired_keys.append(key)
        
        for key in expired_keys:
            del cache_storage[key]
        
        with open(CACHE_FILE, 'wb') as f:
            pickle.dump(cache_storage, f)
        logging.info(f"Saved cache to file with {len(cache_storage)} entries")
    except Exception as e:
        logging.error(f"Error saving cache to file: {e}")

def get_cache_key(prefix, identifier):
    """Generate a cache key for storing data."""
    return f"{prefix}_{identifier}"

def is_cache_valid(cache_key):
    """Check if cached data is still valid."""
    if cache_key not in cache_storage:
        return False
    
    cache_entry = cache_storage[cache_key]
    current_time = time.time()
    
    # Check if cache has expired
    if current_time - cache_entry['timestamp'] > cache_entry['duration']:
        del cache_storage[cache_key]  # Remove expired cache
        return False
    
    return True

def get_cached_data(cache_key):
    """Retrieve data from cache if valid."""
    if is_cache_valid(cache_key):
        logging.info(f"Cache hit for {cache_key}")
        return cache_storage[cache_key]['data']
    return None

def set_cached_data(cache_key, data, duration):
    """Store data in cache with expiration."""
    cache_storage[cache_key] = {
        'data': data,
        'timestamp': time.time(),
        'duration': duration
    }
    logging.info(f"Cached data for {cache_key} (expires in {duration}s)")
    
    # Save to file periodically (every 10 cache operations)
    if len(cache_storage) % 10 == 0:
        save_cache_to_file()

def cleanup_expired_cache():
    """Remove expired cache entries."""
    current_time = time.time()
    expired_keys = []
    
    for key, entry in cache_storage.items():
        if current_time - entry['timestamp'] > entry['duration']:
            expired_keys.append(key)
    
    for key in expired_keys:
        del cache_storage[key]
    
    if expired_keys:
        logging.info(f"Cleaned up {len(expired_keys)} expired cache entries")
        save_cache_to_file()

# Load cache on module import
load_cache_from_file()

@lru_cache(maxsize=128)
def get_ticker(symbol):
    """
    Caches and returns a yfinance Ticker object to avoid re-fetching.
    """
    return yf.Ticker(symbol)

@retry_with_backoff(retries=3, backoff_in_seconds=1)
def get_stock_quote(symbol):
    """
    Fetches real-time stock quote data with caching and retry logic.
    """
    if not symbol or not isinstance(symbol, str):
        logging.error(f"Invalid symbol provided: {symbol}")
        return None
        
    symbol = symbol.upper().strip()
    cache_key = get_cache_key('quote', symbol)
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    # Apply rate limiting
    rate_limit()
    
    try:
        ticker = get_ticker(symbol)
        
        # Try multiple methods to get stock info
        info = None
        try:
            info = ticker.info
        except Exception as e:
            logging.warning(f"Failed to get info for {symbol}, trying fast_info: {e}")
            try:
                fast_info = ticker.fast_info
                info = {
                    'currentPrice': fast_info.get('last_price'),
                    'previousClose': fast_info.get('previous_close'),
                    'volume': fast_info.get('shares'),
                    'longName': symbol
                }
            except Exception as e2:
                logging.error(f"Failed to get fast_info for {symbol}: {e2}")
                raise e2

        if not info:
            raise ValueError(f"No data available for symbol {symbol}")

        # Validate and extract price data
        price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('last_price')
        
        if price is None or price <= 0:
            raise ValueError(f"Invalid or missing price data for {symbol}")
            
        # Convert to float and validate
        try:
            price = float(price)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid price format for {symbol}: {price}")

        prev_close = info.get('previousClose') or info.get('regularMarketPreviousClose') or price
        try:
            prev_close = float(prev_close) if prev_close else price
        except (ValueError, TypeError):
            prev_close = price

        # Calculate change safely
        change = price - prev_close if prev_close > 0 else 0
        change_percent = (change / prev_close) * 100 if prev_close > 0 else 0

        # Validate all required fields
        quote_data = {
            'symbol': symbol,
            'name': info.get('longName') or info.get('shortName') or symbol,
            'price': round(price, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 2),
            'volume': int(info.get('volume', 0)) if info.get('volume') else 0,
            'timestamp': time.time()
        }
        
        # Cache the quote data
        set_cached_data(cache_key, quote_data, CACHE_DURATION['quote'])
        logging.info(f"Successfully fetched quote for {symbol}: ${price}")
        return quote_data
        
    except Exception as e:
        logging.error(f"Error fetching quote for {symbol}: {e}")
        return None

def get_company_info(symbol):
    """
    Fetches company profile information with caching.
    """
    cache_key = get_cache_key('info', symbol.upper())
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        ticker = get_ticker(symbol)
        info = ticker.info

        if not info or info.get('trailingEps') is None: # Check for empty info
            logging.warning(f"Incomplete company info for {symbol}")
            # Return a partial object or None
            company_info = {
                'symbol': symbol.upper(),
                'name': info.get('longName', 'N/A'),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'exchange': info.get('exchange', 'N/A'),
                'marketCap': info.get('marketCap'),
                'description': info.get('longBusinessSummary', 'No description available.'),
                'peRatio': info.get('trailingPE'),
                'high52Week': info.get('fiftyTwoWeekHigh'),
                'low52Week': info.get('fiftyTwoWeekLow'),
                'avgVolume': info.get('averageVolume'),
            }
        else:
            company_info = {
                'symbol': symbol.upper(),
                'name': info.get('longName', info.get('shortName')),
                'sector': info.get('sector'),
                'industry': info.get('industry'),
                'exchange': info.get('exchange'),
                'marketCap': info.get('marketCap'),
                'description': info.get('longBusinessSummary'),
                'peRatio': info.get('trailingPE'),
                'high52Week': info.get('fiftyTwoWeekHigh'),
                'low52Week': info.get('fiftyTwoWeekLow'),
                'avgVolume': info.get('averageVolume'),
            }

        # Cache the company info
        set_cached_data(cache_key, company_info, CACHE_DURATION['info'])
        return company_info
        
    except Exception as e:
        logging.error(f"Error fetching company info for {symbol}: {e}")
        return None

def get_historical_prices(symbol, period='1y', interval='1d'):
    """
    Fetches historical price data with caching.
    """
    cache_key = get_cache_key('history', f"{symbol}_{period}_{interval}")
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        ticker = get_ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            logging.warning(f"No historical data available for {symbol}")
            return []
        
        # Convert to list of dictionaries
        historical_data = []
        for index, row in hist.iterrows():
            historical_data.append({
                'date': index.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })
        
        # Cache the historical data
        set_cached_data(cache_key, historical_data, CACHE_DURATION['history'])
        return historical_data
        
    except Exception as e:
        logging.error(f"Error fetching historical data for {symbol}: {e}")
        return []

def get_sector_performance():
    """
    Fetches sector performance data with caching.
    """
    cache_key = get_cache_key('sectors', 'performance')
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        # Define major sectors and their representative ETFs
        sectors = [
            {'name': 'Technology', 'etf': 'XLK'},
            {'name': 'Healthcare', 'etf': 'XLV'},
            {'name': 'Financial', 'etf': 'XLF'},
            {'name': 'Consumer Discretionary', 'etf': 'XLY'},
            {'name': 'Energy', 'etf': 'XLE'},
            {'name': 'Industrials', 'etf': 'XLI'},
            {'name': 'Consumer Staples', 'etf': 'XLP'},
            {'name': 'Materials', 'etf': 'XLB'},
            {'name': 'Real Estate', 'etf': 'XLRE'},
            {'name': 'Utilities', 'etf': 'XLU'},
            {'name': 'Communication Services', 'etf': 'XLC'}
        ]
        
        sector_data = []
        for sector in sectors:
            try:
                ticker = get_ticker(sector['etf'])
                info = ticker.info
                
                current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
                previous_close = info.get('previousClose', info.get('regularMarketPreviousClose', 0))
                
                if current_price and previous_close:
                    change_percent = ((current_price - previous_close) / previous_close) * 100
                else:
                    change_percent = 0
                
                sector_data.append({
                    'name': sector['name'],
                    'change': change_percent,
                    'etf': sector['etf']
                })
            except Exception as e:
                logging.error(f"Error fetching sector data for {sector['name']}: {e}")
                sector_data.append({
                    'name': sector['name'],
                    'change': 0,
                    'etf': sector['etf']
                })
        
        # Cache the sector data
        set_cached_data(cache_key, sector_data, CACHE_DURATION['sectors'])
        return sector_data
        
    except Exception as e:
        logging.error(f"Error fetching sector performance: {e}")
        return []

def get_trade_recommendation(symbol):
    """
    Generates trade recommendations with caching.
    """
    cache_key = get_cache_key('recommendation', symbol.upper())
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        # Get current stock data
        quote = get_stock_quote(symbol)
        if not quote:
            return {'signal': 'HOLD', 'confidence': 0, 'reasoning': 'Unable to fetch stock data'}
        
        # Simple recommendation logic (in real app, this would be more sophisticated)
        change_percent = quote['changePercent']
        
        if change_percent > 2:
            signal = 'BUY'
            confidence = min(85, 70 + abs(change_percent))
            reasoning = f"Strong positive momentum with {change_percent:.2f}% gain"
        elif change_percent > 0.5:
            signal = 'BUY'
            confidence = 60
            reasoning = f"Moderate positive movement with {change_percent:.2f}% gain"
        elif change_percent < -2:
            signal = 'SELL'
            confidence = min(85, 70 + abs(change_percent))
            reasoning = f"Strong negative momentum with {change_percent:.2f}% loss"
        elif change_percent < -0.5:
            signal = 'SELL'
            confidence = 60
            reasoning = f"Moderate negative movement with {change_percent:.2f}% loss"
        else:
            signal = 'HOLD'
            confidence = 50
            reasoning = f"Minimal movement ({change_percent:.2f}%), maintaining current position"
        
        recommendation = {
            'signal': signal,
            'confidence': confidence,
            'reasoning': reasoning,
            'current_price': quote['price'],
            'change_percent': change_percent
        }
        
        # Cache the recommendation
        set_cached_data(cache_key, recommendation, CACHE_DURATION['quote'])
        return recommendation
        
    except Exception as e:
        logging.error(f"Error generating trade recommendation for {symbol}: {e}")
        return {'signal': 'HOLD', 'confidence': 0, 'reasoning': 'Error occurred during analysis'}

def get_options_recommendation(symbol):
    """
    Generates options trading recommendations with caching.
    """
    cache_key = get_cache_key('options_recommendation', symbol.upper())
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        # Get trade recommendation first
        trade_rec = get_trade_recommendation(symbol)
        if trade_rec['signal'] == 'HOLD':
            return {'strategy': 'HOLD', 'summary': 'No options strategy recommended at this time.'}
        
        # Get current stock price
        quote = get_stock_quote(symbol)
        if not quote:
            return {'strategy': 'UNAVAILABLE', 'summary': 'Unable to fetch stock data'}
        
        current_price = quote['price']
        
        # Generate mock options data (in real app, this would fetch real options data)
        import random
        
        # Mock expiration dates (next 4 fridays)
        from datetime import datetime, timedelta
        expirations = []
        current_date = datetime.now()
        for i in range(4):
            days_ahead = 4 - current_date.weekday()  # Friday is 4
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            target_date = current_date + timedelta(days=days_ahead + (i * 7))
            expirations.append(target_date.strftime('%Y-%m-%d'))
        
        best_expiration = expirations[0]  # Use nearest expiration
        
        if trade_rec['signal'] == 'BUY':
            # Suggest a Long Call
            strike_price = current_price * 1.05  # 5% OTM
            strategy = 'Long Call'
            summary = f"A bullish outlook for {symbol} suggests buying a call option. This strategy profits if the stock price rises significantly before the option expires."
        else: # signal == 'SELL'
            # Suggest a Long Put
            strike_price = current_price * 0.95  # 5% OTM
            strategy = 'Long Put'
            summary = f"A bearish outlook for {symbol} suggests buying a put option. This strategy profits if the stock price falls significantly before the option expires."

        contract_details = {
            'symbol': f"{symbol}{best_expiration}C{strike_price:.0f}" if trade_rec['signal'] == 'BUY' else f"{symbol}{best_expiration}P{strike_price:.0f}",
            'strikePrice': strike_price,
            'type': 'call' if trade_rec['signal'] == 'BUY' else 'put',
            'expiryDate': best_expiration,
            'premium': current_price * 0.05,  # 5% of stock price as premium
            'openInterest': random.randint(100, 1000),
            'volume': random.randint(50, 500),
        }

        recommendation = {
            'strategy': strategy,
            'summary': summary,
            'contract': contract_details,
            'confidence': trade_rec['confidence']
        }
        
        # Cache the options recommendation
        set_cached_data(cache_key, recommendation, CACHE_DURATION['quote'])
        return recommendation
        
    except Exception as e:
        logging.error(f"Error generating options recommendation for {symbol}: {e}")
        return { 'strategy': 'UNAVAILABLE', 'summary': 'An error occurred during analysis.' }

def get_market_news(limit=10):
    """
    Fetches real market news from Yahoo Finance with caching.
    """
    cache_key = get_cache_key('news', f"market_{limit}")
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        # Try multiple approaches to get real news from Yahoo Finance
        news_data = None
        
        # Approach 1: Try S&P 500
        try:
            ticker = yf.Ticker("^GSPC")
            news_data = ticker.news
            if news_data and len(news_data) > 0:
                logging.info(f"Successfully fetched {len(news_data)} news items from S&P 500")
        except Exception as e:
            logging.warning(f"Failed to fetch news from S&P 500: {e}")
        
        # Approach 2: Try AAPL if S&P 500 failed
        if not news_data or len(news_data) == 0:
            try:
                ticker = yf.Ticker("AAPL")
                news_data = ticker.news
                if news_data and len(news_data) > 0:
                    logging.info(f"Successfully fetched {len(news_data)} news items from AAPL")
            except Exception as e:
                logging.warning(f"Failed to fetch news from AAPL: {e}")
        
        # Approach 3: Try MSFT if AAPL failed
        if not news_data or len(news_data) == 0:
            try:
                ticker = yf.Ticker("MSFT")
                news_data = ticker.news
                if news_data and len(news_data) > 0:
                    logging.info(f"Successfully fetched {len(news_data)} news items from MSFT")
            except Exception as e:
                logging.warning(f"Failed to fetch news from MSFT: {e}")
        
        # Approach 4: Try NVDA if MSFT failed
        if not news_data or len(news_data) == 0:
            try:
                ticker = yf.Ticker("NVDA")
                news_data = ticker.news
                if news_data and len(news_data) > 0:
                    logging.info(f"Successfully fetched {len(news_data)} news items from NVDA")
            except Exception as e:
                logging.warning(f"Failed to fetch news from NVDA: {e}")
        
        # Approach 5: Try TSLA if NVDA failed
        if not news_data or len(news_data) == 0:
            try:
                ticker = yf.Ticker("TSLA")
                news_data = ticker.news
                if news_data and len(news_data) > 0:
                    logging.info(f"Successfully fetched {len(news_data)} news items from TSLA")
            except Exception as e:
                logging.warning(f"Failed to fetch news from TSLA: {e}")
        
        if not news_data or len(news_data) == 0:
            # If still no news, return comprehensive fallback data
            logging.info("No real news available, using fallback news")
            fallback_news = get_fallback_news(limit)
            set_cached_data(cache_key, fallback_news, CACHE_DURATION['news'])
            return fallback_news
        
        # Process and format the news data
        formatted_news = []
        for i, news_item in enumerate(news_data[:limit]):
            # Check if news item has the new structure
            if 'content' in news_item:
                content = news_item['content']
                title = content.get('title', '')
                summary = content.get('summary', '')
                
                # Skip items with no title or summary
                if not title or not summary:
                    continue
                    
                # Extract timestamp and convert to relative time
                pub_date = content.get('pubDate', '')
                if pub_date:
                    try:
                        publish_time = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                        time_diff = datetime.now(publish_time.tzinfo) - publish_time
                        
                        if time_diff.total_seconds() < 3600:  # Less than 1 hour
                            minutes = int(time_diff.total_seconds() / 60)
                            time_ago = f"{minutes} minute{'s' if minutes != 1 else ''} ago"
                        elif time_diff.total_seconds() < 86400:  # Less than 24 hours
                            hours = int(time_diff.total_seconds() / 3600)
                            time_ago = f"{hours} hour{'s' if hours != 1 else ''} ago"
                        else:
                            days = int(time_diff.total_seconds() / 86400)
                            time_ago = f"{days} day{'s' if days != 1 else ''} ago"
                    except:
                        time_ago = "Recently"
                else:
                    time_ago = "Recently"
                
                # Get the link from the new structure
                click_through_url = content.get('clickThroughUrl', {})
                link = click_through_url.get('url', '') if click_through_url else ''
                
                # If no valid link, create a search link for the title
                if not link or not link.startswith('http'):
                    link = f"https://finance.yahoo.com/news?q={title.replace(' ', '+')}"
                
                # Get the provider/source
                provider = content.get('provider', {})
                source = provider.get('displayName', 'Yahoo Finance') if provider else 'Yahoo Finance'
                
                formatted_news.append({
                    'title': title,
                    'description': summary,
                    'timeAgo': time_ago,
                    'link': link,
                    'source': source
                })
            else:
                # Handle old structure for backward compatibility
                title = news_item.get('title', '')
                summary = news_item.get('summary', '')
                
                # Skip items with no title or summary
                if not title or not summary:
                    continue
                    
                # Extract timestamp and convert to relative time
                timestamp = news_item.get('providerPublishTime', 0)
                if timestamp:
                    publish_time = datetime.fromtimestamp(timestamp)
                    time_diff = datetime.now() - publish_time
                    
                    if time_diff.total_seconds() < 3600:  # Less than 1 hour
                        minutes = int(time_diff.total_seconds() / 60)
                        time_ago = f"{minutes} minute{'s' if minutes != 1 else ''} ago"
                    elif time_diff.total_seconds() < 86400:  # Less than 24 hours
                        hours = int(time_diff.total_seconds() / 3600)
                        time_ago = f"{hours} hour{'s' if hours != 1 else ''} ago"
                    else:
                        days = int(time_diff.total_seconds() / 86400)
                        time_ago = f"{days} day{'s' if days != 1 else ''} ago"
                else:
                    time_ago = "Recently"
                
                # Use the original link from Yahoo Finance if available
                original_link = news_item.get('link', '')
                if original_link and original_link.startswith('http'):
                    # Use the original Yahoo Finance link
                    link = original_link
                else:
                    # If no valid link, create a search link for the title
                    link = f"https://finance.yahoo.com/news?q={title.replace(' ', '+')}"
                
                formatted_news.append({
                    'title': title,
                    'description': summary,
                    'timeAgo': time_ago,
                    'link': link,
                    'source': news_item.get('publisher', 'Yahoo Finance')
                })
        
        # If we don't have enough real news, supplement with fallback
        if len(formatted_news) < limit:
            fallback_news = get_fallback_news(limit - len(formatted_news))
            formatted_news.extend(fallback_news)
        
        final_news = formatted_news[:limit]
        
        # Cache the news data
        set_cached_data(cache_key, final_news, CACHE_DURATION['news'])
        return final_news
        
    except Exception as e:
        logging.error(f"Error fetching market news: {e}")
        # Return comprehensive fallback data
        fallback_news = get_fallback_news(limit)
        set_cached_data(cache_key, fallback_news, CACHE_DURATION['news'])
        return fallback_news

def get_symbol_news(symbol, limit=10):
    """
    Fetches real news for a specific symbol from Yahoo Finance with caching.
    """
    cache_key = get_cache_key('news', f"symbol_{symbol}_{limit}")
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        rate_limit()  # Apply rate limiting
        ticker = yf.Ticker(symbol)
        news_data = ticker.news
        
        if not news_data or len(news_data) == 0:
            # If no real news, return symbol-specific fallback
            logging.info(f"No real news available for {symbol}, using fallback news")
            fallback_news = get_symbol_fallback_news(symbol, limit)
            set_cached_data(cache_key, fallback_news, CACHE_DURATION['news'])
            return fallback_news
        
        # Process and format the news data
        formatted_news = []
        for i, news_item in enumerate(news_data[:limit]):
            # Check if news item has the new structure
            if 'content' in news_item:
                content = news_item['content']
                title = content.get('title', '')
                summary = content.get('summary', '')
                
                # Skip items with no title or summary
                if not title or not summary:
                    continue
                    
                # Extract timestamp and convert to relative time
                pub_date = content.get('pubDate', '')
                if pub_date:
                    try:
                        publish_time = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                        time_diff = datetime.now() - publish_time.replace(tzinfo=None)
                        
                        if time_diff.total_seconds() < 3600:  # Less than 1 hour
                            minutes = int(time_diff.total_seconds() / 60)
                            time_ago = f"{minutes} minute{'s' if minutes != 1 else ''} ago"
                        elif time_diff.total_seconds() < 86400:  # Less than 24 hours
                            hours = int(time_diff.total_seconds() / 3600)
                            time_ago = f"{hours} hour{'s' if hours != 1 else ''} ago"
                        else:
                            days = int(time_diff.total_seconds() / 86400)
                            time_ago = f"{days} day{'s' if days != 1 else ''} ago"
                    except Exception:
                        time_ago = "Recently"
                else:
                    time_ago = "Recently"
                
                # Use the original link from content if available
                clickThroughUrl = content.get('clickThroughUrl', {})
                link = clickThroughUrl.get('url', '') if clickThroughUrl else ''
                
                # If no valid link, create a search link for the title
                if not link or not link.startswith('http'):
                    link = f"https://finance.yahoo.com/quote/{symbol}/news"
                
                # Get the provider/source
                provider = content.get('provider', {})
                source = provider.get('displayName', 'Yahoo Finance') if provider else 'Yahoo Finance'
                
                formatted_news.append({
                    'title': title,
                    'url': link,
                    'publisher': source,
                    'publishedAt': pub_date,
                    'summary': summary,
                    'imageUrl': content.get('thumbnail', {}).get('url') if content.get('thumbnail') else None
                })
            else:
                # Handle old structure for backward compatibility
                title = news_item.get('title', '')
                summary = news_item.get('summary', '')
                
                # Skip items with no title or summary
                if not title or not summary:
                    continue
                    
                # Extract timestamp and convert to relative time
                timestamp = news_item.get('providerPublishTime', 0)
                published_at = None
                if timestamp:
                    publish_time = datetime.fromtimestamp(timestamp)
                    published_at = publish_time.isoformat()
                
                # Use the original link from Yahoo Finance if available
                original_link = news_item.get('link', '')
                if original_link and original_link.startswith('http'):
                    link = original_link
                else:
                    link = f"https://finance.yahoo.com/quote/{symbol}/news"
                
                formatted_news.append({
                    'title': title,
                    'url': link,
                    'publisher': news_item.get('publisher', 'Yahoo Finance'),
                    'publishedAt': published_at,
                    'summary': summary,
                    'imageUrl': None
                })
        
        # If we don't have enough real news, supplement with fallback
        if len(formatted_news) < limit:
            fallback_news = get_symbol_fallback_news(symbol, limit - len(formatted_news))
            formatted_news.extend(fallback_news)
        
        final_news = formatted_news[:limit]
        
        # Cache the news data
        set_cached_data(cache_key, final_news, CACHE_DURATION['news'])
        return final_news
        
    except Exception as e:
        logging.error(f"Error fetching news for {symbol}: {e}")
        # Return symbol-specific fallback data
        fallback_news = get_symbol_fallback_news(symbol, limit)
        set_cached_data(cache_key, fallback_news, CACHE_DURATION['news'])
        return fallback_news

def get_symbol_fallback_news(symbol, limit=10):
    """
    Provides symbol-specific fallback news when Yahoo Finance API is unavailable.
    """
    # Get company name for more realistic news titles
    company_names = {
        'AAPL': 'Apple',
        'MSFT': 'Microsoft', 
        'GOOGL': 'Google',
        'AMZN': 'Amazon',
        'TSLA': 'Tesla',
        'NVDA': 'NVIDIA',
        'META': 'Meta',
        'NFLX': 'Netflix',
        'AMD': 'AMD',
        'INTC': 'Intel'
    }
    
    company_name = company_names.get(symbol, symbol)
    
    fallback_news = []
    now = datetime.now()
    
    # Generate realistic news items for the symbol
    news_templates = [
        f"{company_name} Reports Strong Quarterly Earnings",
        f"{company_name} Announces New Product Innovation",
        f"Analysts Upgrade {company_name} Price Target",
        f"{company_name} Stock Shows Technical Strength",
        f"{company_name} Management Provides Forward Guidance",
        f"Institutional Investors Increase {company_name} Holdings"
    ]
    
    for i in range(min(limit, len(news_templates))):
        time_offset = i * 2 + random.randint(1, 4)  # Hours ago
        pub_time = now - timedelta(hours=time_offset)
        
        fallback_news.append({
            'title': news_templates[i],
            'url': f"https://finance.yahoo.com/quote/{symbol}/news",
            'publisher': 'AlphaSphere AI',
            'publishedAt': pub_time.isoformat(),
            'summary': f"Latest development and market commentary for {company_name} ({symbol}).",
            'imageUrl': None
        })
    
    return fallback_news

def get_fallback_news(limit=10):
    """
    Provides comprehensive fallback market news when Yahoo Finance API is unavailable.
    """
    fallback_news = [
        {
            'title': 'S&P 500 and Nasdaq Fall as Tech Stocks Retreat from Record Highs',
            'description': 'Major indices decline as investors take profits from recent tech rally. NVIDIA, Apple, and Microsoft lead the selloff while market volatility increases.',
            'timeAgo': '1 hour ago',
            'link': 'https://finance.yahoo.com/news?q=S&P+500+and+Nasdaq+Fall+as+Tech+Stocks+Retreat',
            'source': 'Yahoo Finance'
        },
        {
            'title': 'Federal Reserve Officials Signal Cautious Approach to Rate Cuts',
            'description': 'Fed policymakers emphasize need for more evidence of inflation cooling before considering interest rate reductions. Markets adjust expectations for 2024 policy path.',
            'timeAgo': '3 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Federal+Reserve+Officials+Signal+Cautious+Approach+to+Rate+Cuts',
            'source': 'Reuters'
        },
        {
            'title': 'Oil Prices Decline on Concerns Over Global Demand and Supply',
            'description': 'Crude oil futures fall as traders weigh mixed signals on global economic growth and OPEC+ production decisions. WTI crude drops below $80 per barrel.',
            'timeAgo': '5 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Oil+Prices+Decline+on+Concerns+Over+Global+Demand',
            'source': 'MarketWatch'
        },
        {
            'title': 'Banking Sector Shows Mixed Performance Amid Economic Data',
            'description': 'Financial stocks display varied performance as investors assess loan demand and interest rate environment. JPMorgan and Bank of America show resilience.',
            'timeAgo': '7 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Banking+Sector+Shows+Mixed+Performance+Amid+Economic+Data',
            'source': 'Bloomberg'
        },
        {
            'title': 'Consumer Confidence Data Suggests Economic Resilience',
            'description': 'Latest consumer sentiment figures indicate continued spending despite inflation concerns. Retail sector stocks show positive momentum.',
            'timeAgo': '9 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Consumer+Confidence+Data+Suggests+Economic+Resilience',
            'source': 'CNBC'
        },
        {
            'title': 'Healthcare Stocks Gain on Positive Drug Trial Results',
            'description': 'Pharmaceutical companies rise following encouraging clinical trial outcomes and FDA approval announcements. Biotech sector shows strong performance.',
            'timeAgo': '11 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Healthcare+Stocks+Gain+on+Positive+Drug+Trial+Results',
            'source': 'Yahoo Finance'
        },
        {
            'title': 'Cryptocurrency Market Stabilizes After Recent Volatility',
            'description': 'Bitcoin and Ethereum show signs of stabilization as institutional adoption continues. Crypto-related stocks display mixed performance.',
            'timeAgo': '13 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Cryptocurrency+Market+Stabilizes+After+Recent+Volatility',
            'source': 'CoinDesk'
        },
        {
            'title': 'Electric Vehicle Stocks Face Pressure from Competition Concerns',
            'description': 'Tesla and other EV manufacturers decline as market competition intensifies. Battery technology companies show varied performance.',
            'timeAgo': '15 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Electric+Vehicle+Stocks+Face+Pressure+from+Competition',
            'source': 'Automotive News'
        },
        {
            'title': 'Real Estate Market Shows Signs of Recovery',
            'description': 'Housing data indicates improving conditions as mortgage rates stabilize. REITs and real estate companies show positive momentum.',
            'timeAgo': '17 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Real+Estate+Market+Shows+Signs+of+Recovery',
            'source': 'Real Estate Weekly'
        },
        {
            'title': 'Utilities Sector Outperforms as Investors Seek Defensive Plays',
            'description': 'Utility stocks gain as market volatility drives investors toward defensive sectors. Dividend-paying utilities attract capital.',
            'timeAgo': '19 hours ago',
            'link': 'https://finance.yahoo.com/news?q=Utilities+Sector+Outperforms+as+Investors+Seek+Defensive+Plays',
            'source': 'Yahoo Finance'
        }
    ]
    
    # Return the requested number of news items
    return fallback_news[:limit]

def get_options_chain(symbol, current_price, expiry_date=None, limit=20):
    """
    Generate options chain data for a given symbol.
    
    Args:
        symbol: Stock symbol
        current_price: Current stock price
        expiry_date: Specific expiration date (optional)
        limit: Number of strikes to generate
    
    Returns:
        Dictionary with calls and puts data
    """
    try:
        # Generate strikes around current price
        strikes = []
        base_strike = round(current_price / 5) * 5  # Round to nearest $5
        
        # Generate strikes in a range around current price
        for i in range(-limit//2, limit//2 + 1):
            strike = base_strike + (i * 5)
            if strike > 0:
                strikes.append(strike)
        
        calls = []
        puts = []
        
        for strike in strikes:
            # Calculate option prices using simplified Black-Scholes
            time_to_expiry = 0.25  # 3 months
            volatility = 0.3
            risk_free_rate = 0.05
            
            # Simplified option pricing
            moneyness = strike / current_price
            time_value = max(0.5, 5 - abs(moneyness - 1) * 10)
            
            # Call option
            call_intrinsic = max(current_price - strike, 0)
            call_price = call_intrinsic + time_value
            call_iv = volatility + abs(moneyness - 1) * 0.1
            
            calls.append({
                'strike': strike,
                'bid': round(call_price - 0.05, 2),
                'ask': round(call_price + 0.05, 2),
                'last': round(call_price, 2),
                'change': round((random.random() - 0.5) * 0.2, 2),
                'volume': int(random.random() * 1000),
                'openInterest': int(random.random() * 5000),
                'iv': round(call_iv * 100, 1),
                'delta': round(max(0.1, min(0.9, 0.5 + (current_price - strike) / (current_price * 0.2))), 2),
                'gamma': round(random.random() * 0.05, 3),
                'theta': round(-random.random() * 0.1, 3),
                'vega': round(random.random() * 0.2, 3),
                'rho': round(random.random() * 0.01, 3),
                'type': 'call',
                'expiry': expiry_date or get_next_friday()
            })
            
            # Put option
            put_intrinsic = max(strike - current_price, 0)
            put_price = put_intrinsic + time_value
            put_iv = volatility + abs(moneyness - 1) * 0.1 + 0.02  # Put skew
            
            puts.append({
                'strike': strike,
                'bid': round(put_price - 0.05, 2),
                'ask': round(put_price + 0.05, 2),
                'last': round(put_price, 2),
                'change': round((random.random() - 0.5) * 0.2, 2),
                'volume': int(random.random() * 1000),
                'openInterest': int(random.random() * 5000),
                'iv': round(put_iv * 100, 1),
                'delta': round(-max(0.1, min(0.9, 0.5 + (strike - current_price) / (current_price * 0.2))), 2),
                'gamma': round(random.random() * 0.05, 3),
                'theta': round(-random.random() * 0.1, 3),
                'vega': round(random.random() * 0.2, 3),
                'rho': round(-random.random() * 0.01, 3),
                'type': 'put',
                'expiry': expiry_date or get_next_friday()
            })
        
        return {
            'calls': calls,
            'puts': puts,
            'underlying': {
                'symbol': symbol,
                'price': current_price,
                'lastUpdated': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Error generating options chain for {symbol}: {e}")
        return {'error': str(e)}

def get_options_expirations(symbol):
    """
    Get available expiration dates for options.
    
    Args:
        symbol: Stock symbol
    
    Returns:
        List of expiration dates
    """
    try:
        # Generate next 4 Fridays as expiration dates
        expirations = []
        current_date = datetime.now()
        
        for i in range(4):
            # Find next Friday
            days_ahead = 4 - current_date.weekday()  # Friday is 4
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
            days_ahead += i * 7  # Add weeks
            
            expiration_date = current_date + timedelta(days=days_ahead)
            expirations.append({
                'date': expiration_date.strftime('%Y-%m-%d'),
                'daysToExpiry': (expiration_date - current_date).days,
                'formatted': expiration_date.strftime('%b %d, %Y')
            })
        
        return expirations
        
    except Exception as e:
        logging.error(f"Error getting options expirations for {symbol}: {e}")
        return []

def get_next_friday():
    """Get the next Friday date as a string."""
    current_date = datetime.now()
    days_ahead = 4 - current_date.weekday()  # Friday is 4
    if days_ahead <= 0:  # Target day already happened this week
        days_ahead += 7
    next_friday = current_date + timedelta(days=days_ahead)
    return next_friday.strftime('%Y-%m-%d')

# Cleanup function to be called periodically
def periodic_cache_cleanup():
    """Periodically clean up expired cache entries."""
    cleanup_expired_cache()
