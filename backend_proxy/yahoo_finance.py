import yfinance as yf
from functools import lru_cache
import pandas as pd
from datetime import datetime, timedelta
import logging
import requests
import yfinance as yf

logging.basicConfig(level=logging.INFO)

@lru_cache(maxsize=128)
def get_ticker(symbol):
    """
    Caches and returns a yfinance Ticker object to avoid re-fetching.
    """
    return yf.Ticker(symbol)

def get_stock_quote(symbol):
    """
    Fetches real-time stock quote data.
    """
    try:
        ticker = get_ticker(symbol)
        info = ticker.info

        price = info.get('currentPrice', info.get('regularMarketPrice'))
        
        if price is None:
            fast_info = ticker.fast_info
            price = fast_info.get('last_price')
            if price is None:
                logging.warning(f"Could not determine price for {symbol}")
                return None

        prev_close = info.get('previousClose', info.get('regularMarketPreviousClose', 0))
        if not prev_close or not price: # Ensure we have values to calculate change
            change = 0
            change_percent = 0
        else:
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0

        return {
            'symbol': symbol.upper(),
            'name': info.get('longName', info.get('shortName')),
            'price': price,
            'change': change,
            'changePercent': change_percent,
            'volume': info.get('volume', 0)
        }
    except Exception as e:
        logging.error(f"Error fetching quote for {symbol}: {e}")
        return None

def get_company_info(symbol):
    """
    Fetches company profile information.
    """
    try:
        ticker = get_ticker(symbol)
        info = ticker.info

        if not info or info.get('trailingEps') is None: # Check for empty info
            logging.warning(f"Incomplete company info for {symbol}")
            # Return a partial object or None
            return {
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

        return company_info
    except Exception as e:
        logging.error(f"Error fetching company info for {symbol}: {e}")
        return None

def get_historical_prices(symbol, period='1y', interval='1d'):
    """
    Fetches historical price data.
    """
    try:
        ticker = get_ticker(symbol)
        history = ticker.history(period=period, interval=interval)

        if history.empty:
            return []
        
        # Reset index to make 'Date' a column and format it
        history.reset_index(inplace=True)
        history['Date'] = history['Date'].dt.strftime('%Y-%m-%d')
        
        # Convert to list of dictionaries
        return history.to_dict('records')
        
    except Exception as e:
        logging.error(f"Error fetching historical data for {symbol}: {e}")
        return []

def get_sector_performance():
    """
    Fetches sector performance data using sector ETFs as proxies.
    Returns performance data for major market sectors.
    """
    try:
        # Major sector ETFs that represent different sectors
        sector_etfs = {
            'Technology': 'XLK',
            'Healthcare': 'XLV', 
            'Financial Services': 'XLF',
            'Consumer Discretionary': 'XLY',
            'Communication Services': 'XLC',
            'Industrials': 'XLI',
            'Consumer Staples': 'XLP',
            'Energy': 'XLE',
            'Utilities': 'XLU',
            'Real Estate': 'XLRE',
            'Materials': 'XLB'
        }
        
        sector_performance = []
        
        for sector_name, etf_symbol in sector_etfs.items():
            try:
                ticker = yf.Ticker(etf_symbol)
                
                # Get current price and 1-day history for change calculation
                hist = ticker.history(period='2d')
                if len(hist) < 2:
                    continue
                    
                current_price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2]
                
                # Calculate daily change
                daily_change = current_price - prev_close
                daily_change_percent = (daily_change / prev_close) * 100 if prev_close else 0
                
                # Get longer term performance
                hist_1m = ticker.history(period='1mo')
                hist_3m = ticker.history(period='3mo')
                hist_1y = ticker.history(period='1y')
                
                # Calculate performance metrics
                monthly_return = 0
                quarterly_return = 0
                yearly_return = 0
                
                if len(hist_1m) > 0:
                    monthly_return = ((current_price - hist_1m['Close'].iloc[0]) / hist_1m['Close'].iloc[0]) * 100
                    
                if len(hist_3m) > 0:
                    quarterly_return = ((current_price - hist_3m['Close'].iloc[0]) / hist_3m['Close'].iloc[0]) * 100
                    
                if len(hist_1y) > 0:
                    yearly_return = ((current_price - hist_1y['Close'].iloc[0]) / hist_1y['Close'].iloc[0]) * 100
                
                sector_data = {
                    'sector': sector_name,
                    'symbol': etf_symbol,
                    'price': round(current_price, 2),
                    'dailyChange': round(daily_change, 2),
                    'dailyChangePercent': round(daily_change_percent, 2),
                    'monthlyReturn': round(monthly_return, 2),
                    'quarterlyReturn': round(quarterly_return, 2),
                    'yearlyReturn': round(yearly_return, 2)
                }
                
                sector_performance.append(sector_data)
                
            except Exception as e:
                logging.warning(f"Error fetching data for sector {sector_name} ({etf_symbol}): {e}")
                continue
        
        # Sort by daily performance (best performing first)
        sector_performance.sort(key=lambda x: x['dailyChangePercent'], reverse=True)
        
        return sector_performance
        
    except Exception as e:
        logging.error(f"Error fetching sector performance: {e}")
        return []

        # Reset index to make 'Date' a column and format it
        history.reset_index(inplace=True)
        history['Date'] = history['Date'].dt.strftime('%Y-%m-%d')
        
        # Rename columns to be consistent with the frontend
        history.rename(columns={
            'Date': 'date',
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        }, inplace=True)
        
        # Return data as a list of dictionaries
        return history[['date', 'open', 'high', 'low', 'close', 'volume']].to_dict('records')
    except Exception as e:
        logging.error(f"Error fetching historical prices for {symbol}: {e}")
        return []

def get_trade_recommendation(symbol):
    """
    Generates a trade recommendation based on simple moving averages.
    """
    try:
        ticker = get_ticker(symbol)
        
        # Fetch 1 year of historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        hist = ticker.history(start=start_date, end=end_date)

        if hist.empty:
            return {
                'signal': 'UNAVAILABLE',
                'summary': 'Not enough historical data to generate a recommendation.',
                'confidence': 0,
                'currentPrice': 0,
                'sma50': 0,
                'sma200': 0,
            }

        # Calculate SMAs
        hist['SMA50'] = hist['Close'].rolling(window=50).mean()
        hist['SMA200'] = hist['Close'].rolling(window=200).mean()
        
        # Get the most recent data
        latest = hist.iloc[-1]
        current_price = latest['Close']
        sma50 = latest['SMA50']
        sma200 = latest['SMA200']

        # Generate signal
        if sma50 > sma200:
            signal = 'BUY'
            summary = f"{symbol} is in a bullish trend. The 50-day moving average is above the 200-day moving average, which is a positive sign."
            confidence = (sma50 - sma200) / sma200 * 100
        elif sma50 < sma200:
            signal = 'SELL'
            summary = f"{symbol} is in a bearish trend. The 50-day moving average is below the 200-day moving average, which is a negative sign."
            confidence = (sma200 - sma50) / sma50 * 100
        else:
            signal = 'HOLD'
            summary = "Market conditions are neutral. There is no clear trend based on moving averages."
            confidence = 50

        return {
            'signal': signal,
            'summary': summary,
            'confidence': min(max(confidence, 0), 100),  # Clamp between 0 and 100
            'currentPrice': current_price,
            'sma50': sma50,
            'sma200': sma200,
        }
    except Exception as e:
        logging.error(f"Error generating trade recommendation for {symbol}: {e}")
        return { 'signal': 'UNAVAILABLE', 'summary': 'An error occurred during analysis.' }

def get_options_recommendation(symbol):
    """
    Generates an options trading recommendation.
    """
    try:
        ticker = get_ticker(symbol)
        
        # Get trade recommendation to determine trend
        trade_rec = get_trade_recommendation(symbol)
        signal = trade_rec['signal']
        current_price = trade_rec['currentPrice']

        if signal not in ['BUY', 'SELL']:
            return {
                'strategy': 'NEUTRAL',
                'summary': 'Market conditions are neutral. No clear options strategy is recommended.',
                'contract': None,
                'confidence': 50
            }

        # Get available expiration dates
        expirations = ticker.options
        if not expirations:
            return {'strategy': 'UNAVAILABLE', 'summary': 'No options data available for this stock.', 'contract': None, 'confidence': 0}

        # Find an expiration date roughly 30-45 days out
        target_date = datetime.now() + timedelta(days=35)
        try:
            exp_dates = [datetime.strptime(d, '%Y-%m-%d') for d in expirations]
            best_expiration_date = min(exp_dates, key=lambda d: abs(d - target_date))
            best_expiration = best_expiration_date.strftime('%Y-%m-%d')
        except (ValueError, TypeError):
             return {'strategy': 'UNAVAILABLE', 'summary': 'Could not parse expiration dates.', 'contract': None, 'confidence': 0}


        # Get the option chain for that date
        opt_chain = ticker.option_chain(best_expiration)

        if signal == 'BUY':
            # Suggest a Long Call
            calls = opt_chain.calls.sort_values(by='strike')
            otm_calls = calls[calls['strike'] > current_price]
            
            if otm_calls.empty:
                otm_calls = calls[calls['strike'] <= current_price].tail(1) # Closest ITM if no OTM

            if otm_calls.empty:
                 return {'strategy': 'UNAVAILABLE', 'summary': 'Could not find a suitable call option.', 'contract': None, 'confidence': 0}

            recommended_contract_df = otm_calls.iloc[0]
            strategy = 'Long Call'
            summary = f"A bullish outlook for {symbol} suggests buying a call option. This strategy profits if the stock price increases significantly before the option expires."

        else: # signal == 'SELL'
            # Suggest a Long Put
            puts = opt_chain.puts.sort_values(by='strike', ascending=False)
            otm_puts = puts[puts['strike'] < current_price]
            
            if otm_puts.empty:
                otm_puts = puts[puts['strike'] >= current_price].tail(1) # Closest ITM if no OTM
            
            if otm_puts.empty:
                return {'strategy': 'UNAVAILABLE', 'summary': 'Could not find a suitable put option.', 'contract': None, 'confidence': 0}
                
            recommended_contract_df = otm_puts.iloc[0]
            strategy = 'Long Put'
            summary = f"A bearish outlook for {symbol} suggests buying a put option. This strategy profits if the stock price falls significantly before the option expires."

        recommended_contract = recommended_contract_df.to_dict()

        contract_details = {
            'symbol': recommended_contract.get('contractSymbol'),
            'strikePrice': recommended_contract.get('strike'),
            'type': 'call' if signal == 'BUY' else 'put',
            'expiryDate': best_expiration,
            'premium': recommended_contract.get('lastPrice'),
            'openInterest': recommended_contract.get('openInterest'),
            'volume': recommended_contract.get('volume'),
        }

        return {
            'strategy': strategy,
            'summary': summary,
            'contract': contract_details,
            'confidence': trade_rec['confidence']
        }
    except Exception as e:
        logging.error(f"Error generating options recommendation for {symbol}: {e}")
        return { 'strategy': 'UNAVAILABLE', 'summary': 'An error occurred during analysis.' }

def get_market_news(limit=10):
    """
    Fetches market news with realistic mock data and current timestamps.
    """
    try:
        # For now, return realistic mock data with current timestamps
        # This can be replaced with actual API calls when available
        import random
        
        news_templates = [
            {
                'title': 'Federal Reserve Maintains Interest Rates at Current Levels',
                'description': 'The Federal Reserve announced it will keep interest rates unchanged, citing ongoing economic stability and controlled inflation metrics.',
                'link': 'https://finance.yahoo.com/news/fed-rates'
            },
            {
                'title': 'Tech Stocks Rally as AI Sector Shows Strong Growth',
                'description': 'Major technology companies see significant gains as artificial intelligence investments continue to drive market optimism.',
                'link': 'https://finance.yahoo.com/news/tech-rally'
            },
            {
                'title': 'Oil Prices Fluctuate Amid Global Supply Chain Concerns',
                'description': 'Energy markets remain volatile as geopolitical tensions and supply chain disruptions impact crude oil pricing.',
                'link': 'https://finance.yahoo.com/news/oil-prices'
            },
            {
                'title': 'S&P 500 Reaches New Milestone as Market Sentiment Improves',
                'description': 'The benchmark index continues its upward trajectory, driven by strong corporate earnings and positive economic indicators.',
                'link': 'https://finance.yahoo.com/news/sp500-milestone'
            },
            {
                'title': 'Cryptocurrency Market Shows Mixed Signals',
                'description': 'Digital assets display varied performance as regulatory clarity and institutional adoption continue to evolve.',
                'link': 'https://finance.yahoo.com/news/crypto-mixed'
            },
            {
                'title': 'Banking Sector Outperforms Amid Rising Interest Rate Environment',
                'description': 'Financial institutions benefit from improved net interest margins as rate environment remains favorable for lending.',
                'link': 'https://finance.yahoo.com/news/banking-sector'
            },
            {
                'title': 'Consumer Spending Data Indicates Economic Resilience',
                'description': 'Latest retail sales figures suggest continued consumer confidence despite ongoing economic uncertainties.',
                'link': 'https://finance.yahoo.com/news/consumer-spending'
            },
            {
                'title': 'Healthcare Stocks Gain on Breakthrough Drug Approvals',
                'description': 'Pharmaceutical companies see significant gains following FDA approvals for innovative treatments and therapies.',
                'link': 'https://finance.yahoo.com/news/healthcare-gains'
            }
        ]
        
        # Randomly select news items
        selected_news = random.sample(news_templates, min(limit, len(news_templates)))
        
        news_items = []
        now = datetime.now()
        
        for i, template in enumerate(selected_news):
            # Generate realistic timestamps (within last 24 hours)
            hours_ago = random.randint(1, 24)
            minutes_ago = random.randint(0, 59)
            
            if hours_ago == 1 and minutes_ago < 30:
                time_ago = f"{minutes_ago} minute{'s' if minutes_ago != 1 else ''} ago"
            elif hours_ago == 1:
                time_ago = "1 hour ago"
            else:
                time_ago = f"{hours_ago} hours ago"
            
            news_item = {
                'title': template['title'],
                'description': template['description'],
                'timeAgo': time_ago,
                'link': template['link']
            }
            news_items.append(news_item)
        
        return news_items
        
    except Exception as e:
        logging.error(f"Error generating market news: {e}")
        return []
