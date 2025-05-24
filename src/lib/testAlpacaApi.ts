import dotenv from 'dotenv';
dotenv.config();

// Debug: Log loaded environment variables to check if dotenv is working
console.log('--- DEBUG: Environment variables after dotenv.config() ---');
console.log('VITE_ALPACA_API_KEY_ID:', process.env.VITE_ALPACA_API_KEY_ID);
console.log('VITE_ALPACA_API_SECRET_KEY:', process.env.VITE_ALPACA_API_SECRET_KEY);
console.log('----------------------------------------------------------');

import { getLatestQuote, getOptionChain } from './alpacaApi.ts';

async function testAlpaca() {
  try {
    const symbol = 'AAPL';

    const quote = await getLatestQuote(symbol);
    console.log('Latest Quote:', quote);

    const options = await getOptionChain(symbol);
    console.log('Option Chain:', options);
  } catch (err) {
    console.error('Error testing Alpaca API:', err);
  }
}

testAlpaca();
