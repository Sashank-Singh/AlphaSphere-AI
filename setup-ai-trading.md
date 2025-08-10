# 🚀 AlphaSphere AI Trading Setup Guide

This guide will help you set up the complete AI Trading ecosystem that integrates LLM analysis, RL models, and Alpaca paper trading.

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Alpaca API account (free paper trading)
- Git

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AlphaSphere   │    │   RL System     │    │  Backend Proxy  │
│   Frontend      │◄──►│   (FastAPI)     │◄──►│   (Flask)       │
│   (React)       │    │   Port: 8501    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Alpaca API    │    │   Market Data   │    │   LLM Analysis  │
│   (Paper Trading)│    │   (Yahoo Finance)│    │   Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Step-by-Step Setup

### 1. Clone and Setup AlphaSphere Frontend

```bash
# Navigate to AlphaSphere-AI directory
cd AlphaSphere-AI

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` and add your Alpaca API credentials:

```env
# Alpaca API (Paper Trading)
REACT_APP_ALPACA_API_KEY=your_alpaca_api_key
REACT_APP_ALPACA_SECRET_KEY=your_alpaca_secret_key

# API Endpoints
REACT_APP_RL_API_ENDPOINT=http://localhost:8501
REACT_APP_LLM_API_ENDPOINT=http://localhost:5001

# Optional: OpenAI API for enhanced LLM analysis
OPENAI_API_KEY=your_openai_api_key
```

### 3. Setup RL Trading System

```bash
# Navigate to RL system directory
cd ../RL\ MODELS/trading_rl_system

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start RL API server
python api_server.py
```

The RL system will start on `http://localhost:8501`

### 4. Setup Backend Proxy

```bash
# Navigate to backend proxy directory
cd ../../AlphaSphere-AI/backend_proxy

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend proxy
python app.py
```

The backend proxy will start on `http://localhost:5001`

### 5. Start AlphaSphere Frontend

```bash
# Navigate back to AlphaSphere-AI
cd ..

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Accessing AI Trading

1. Open your browser and go to `http://localhost:5173`
2. Navigate to `/ai-trading` or click on the AI Trading link
3. Log in to access the AI Trading dashboard
4. Initialize your AI trading session

## 🔍 API Endpoints

### RL System API (Port 8501)
- `GET /` - API status
- `GET /health` - Health check
- `GET /models` - Available models
- `POST /predict` - Single prediction
- `POST /predict/batch` - Batch predictions
- `POST /analyze` - Market analysis
- `POST /performance` - Model performance

### Backend Proxy API (Port 5001)
- `POST /api/analyze` - LLM market analysis
- `POST /api/analyze/context` - Market context
- `POST /api/analyze/opportunities` - Trading opportunities
- `POST /api/analyze/risks` - Risk factors
- `POST /api/analyze/recommendations` - Trading recommendations
- `GET /api/yahoo/*` - Yahoo Finance data
- `GET /alpaca/api/*` - Alpaca API proxy

## 🧪 Testing the Integration

### 1. Test RL System
```bash
curl http://localhost:8501/health
```

### 2. Test Backend Proxy
```bash
curl http://localhost:5001/api/yahoo/quote/AAPL
```

### 3. Test AI Trading Dashboard
- Open `http://localhost:5173/ai-trading`
- Click "Start AI Trading Session"
- Check the different tabs for functionality

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :8501
   lsof -i :5001
   lsof -i :5173
   
   # Kill process
   kill -9 <PID>
   ```

2. **Python Import Errors**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

3. **Node Modules Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS Issues**
   - Ensure all services are running on correct ports
   - Check that CORS is enabled in backend services

### Debug Mode

Enable debug logging:

```bash
# RL System
export DEBUG=1
python api_server.py

# Backend Proxy
export FLASK_DEBUG=1
python app.py

# Frontend
npm run dev -- --debug
```

## 📊 Monitoring

### Health Checks
- RL System: `http://localhost:8501/health`
- Backend Proxy: `http://localhost:5001/api/cache/status`
- Frontend: Check browser console

### Logs
- RL System: Check terminal output
- Backend Proxy: Check terminal output
- Frontend: Browser developer tools

## 🚀 Production Deployment

### Environment Variables
```env
# Production settings
NODE_ENV=production
FLASK_ENV=production
DEBUG=0

# API endpoints (update with your domain)
REACT_APP_RL_API_ENDPOINT=https://your-domain.com/rl-api
REACT_APP_LLM_API_ENDPOINT=https://your-domain.com/api
```

### Build Commands
```bash
# Frontend
npm run build

# Backend Proxy
gunicorn -w 4 -b 0.0.0.0:5001 app:app

# RL System
gunicorn -w 4 -b 0.0.0.0:8501 api_server:app
```

## 📚 Next Steps

1. **Customize RL Models**: Modify models in `RL MODELS/trading_rl_system/models/`
2. **Enhance LLM Analysis**: Add more sophisticated analysis in `backend_proxy/llm_analysis.py`
3. **Add More Data Sources**: Integrate additional market data providers
4. **Implement Live Trading**: Transition from paper trading to live trading
5. **Add User Management**: Implement user authentication and session management
6. **Performance Optimization**: Add caching, load balancing, and monitoring

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all services are running on correct ports
4. Verify environment variables are set correctly
5. Check that all dependencies are installed

## 📝 Notes

- The system uses paper trading by default for safety
- All AI predictions are for educational purposes
- Real trading involves significant risk
- Always test thoroughly before using with real money
- Consider consulting with a financial advisor

---

**Happy AI Trading! 🤖📈** 