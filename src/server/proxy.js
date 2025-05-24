const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Proxy for Yahoo Finance
app.get('/api/yahoo/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1d', interval = '5m' } = req.query;
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Yahoo Finance proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});