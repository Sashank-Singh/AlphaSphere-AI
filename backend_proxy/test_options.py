#!/usr/bin/env python3
"""
Test script for options API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def test_options_expirations():
    """Test the options expirations endpoint"""
    print("Testing options expirations endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/yahoo/options/expirations/AAPL")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_options_chain():
    """Test the options chain endpoint"""
    print("\nTesting options chain endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/yahoo/options/AAPL?limit=10")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        if 'calls' in data:
            print(f"Number of calls: {len(data['calls'])}")
        if 'puts' in data:
            print(f"Number of puts: {len(data['puts'])}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Options API Endpoints")
    print("=" * 40)
    
    expirations_ok = test_options_expirations()
    chain_ok = test_options_chain()
    
    print("\n" + "=" * 40)
    print("Test Results:")
    print(f"Expirations API: {'✓ PASS' if expirations_ok else '✗ FAIL'}")
    print(f"Options Chain API: {'✓ PASS' if chain_ok else '✗ FAIL'}")
    
    if expirations_ok and chain_ok:
        print("\n🎉 All tests passed! Options API is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the backend server and API endpoints.") 