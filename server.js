import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 8010;

app.use(cors());
app.use(express.json());

const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_API_URL}/${req.params.symbol}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});