#!/usr/bin/env python3

import yfinance as yf
import json
from datetime import datetime

def test_yahoo_news():
    """Test Yahoo Finance news fetching"""
    
    # Test AAPL
    ticker_symbol = 'AAPL'
    print(f"\nTesting {ticker_symbol}:")
    try:
        ticker = yf.Ticker(ticker_symbol)
        news = ticker.news
        
        if news and len(news) > 0:
            print(f"  ✅ Found {len(news)} news items")
            
            # Show the structure of the first news item
            first_news = news[0]
            print(f"  📋 News item keys: {list(first_news.keys())}")
            print(f"  📄 Full news item:")
            print(json.dumps(first_news, indent=2))
            
        else:
            print(f"  ❌ No news found")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")

if __name__ == "__main__":
    test_yahoo_news() 