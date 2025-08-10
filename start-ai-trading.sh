#!/bin/bash

# AlphaSphere AI Trading Startup Script
# This script starts all components of the AI trading system

echo "🚀 Starting AlphaSphere AI Trading System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Function to start service
start_service() {
    local name=$1
    local command=$2
    local port=$3
    
    echo -e "${BLUE}Starting $name...${NC}"
    
    if check_port $port; then
        # Start service in background
        eval "$command" &
        local pid=$!
        echo -e "${GREEN}$name started with PID $pid${NC}"
        
        # Wait a moment for service to start
        sleep 3
        
        # Check if service is running
        if kill -0 $pid 2>/dev/null; then
            echo -e "${GREEN}✓ $name is running on port $port${NC}"
        else
            echo -e "${RED}✗ Failed to start $name${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Skipping $name (port $port in use)${NC}"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the AlphaSphere-AI directory${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8+${NC}"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Creating template...${NC}"
    cat > .env.local << EOF
# Alpaca API (Paper Trading)
REACT_APP_ALPACA_API_KEY=your_alpaca_api_key_here
REACT_APP_ALPACA_SECRET_KEY=your_alpaca_secret_key_here

# API Endpoints
REACT_APP_RL_API_ENDPOINT=http://localhost:8501
REACT_APP_LLM_API_ENDPOINT=http://localhost:5001

# Optional: OpenAI API for enhanced LLM analysis
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo -e "${YELLOW}Please edit .env.local with your API keys before continuing${NC}"
    echo -e "${YELLOW}Press Enter to continue or Ctrl+C to exit...${NC}"
    read
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

# Start RL System
echo -e "${BLUE}Setting up RL System...${NC}"
cd "../RL MODELS/trading_rl_system"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/lib/python*/site-packages/fastapi" ]; then
    echo -e "${BLUE}Installing RL system dependencies...${NC}"
    pip install -r requirements.txt
fi

# Start RL API server
start_service "RL System API" "python api_server.py" 8501
RL_PID=$?

# Go back to AlphaSphere-AI
cd "../../AlphaSphere-AI"

# Start Backend Proxy
echo -e "${BLUE}Setting up Backend Proxy...${NC}"
cd "backend_proxy"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/lib/python*/site-packages/flask" ]; then
    echo -e "${BLUE}Installing backend proxy dependencies...${NC}"
    pip install -r requirements.txt
fi

# Start backend proxy
start_service "Backend Proxy" "python app.py" 5001
PROXY_PID=$?

# Go back to AlphaSphere-AI
cd ".."

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
start_service "Frontend" "npm run dev" 5173
FRONTEND_PID=$?

# Wait a moment for all services to start
sleep 5

# Check all services
echo -e "${BLUE}Checking service status...${NC}"

services=(
    "RL System API:8501"
    "Backend Proxy:5001"
    "Frontend:5173"
)

all_running=true

for service in "${services[@]}"; do
    name="${service%:*}"
    port="${service#*:}"
    
    if check_port $port; then
        echo -e "${GREEN}✓ $name is running${NC}"
    else
        echo -e "${RED}✗ $name is not running${NC}"
        all_running=false
    fi
done

if [ "$all_running" = true ]; then
    echo -e "${GREEN}"
    echo "🎉 AlphaSphere AI Trading System is ready!"
    echo ""
    echo "📱 Frontend: http://localhost:5173"
    echo "🤖 RL API: http://localhost:8501"
    echo "🔧 Backend Proxy: http://localhost:5001"
    echo ""
    echo "🎯 Access AI Trading: http://localhost:5173/ai-trading"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo -e "${NC}"
    
    # Function to cleanup on exit
    cleanup() {
        echo -e "${YELLOW}Shutting down services...${NC}"
        
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null
            echo -e "${GREEN}Frontend stopped${NC}"
        fi
        
        if [ ! -z "$PROXY_PID" ]; then
            kill $PROXY_PID 2>/dev/null
            echo -e "${GREEN}Backend Proxy stopped${NC}"
        fi
        
        if [ ! -z "$RL_PID" ]; then
            kill $RL_PID 2>/dev/null
            echo -e "${GREEN}RL System stopped${NC}"
        fi
        
        echo -e "${GREEN}All services stopped${NC}"
        exit 0
    }
    
    # Set trap to cleanup on script exit
    trap cleanup SIGINT SIGTERM
    
    # Keep script running
    while true; do
        sleep 1
    done
    
else
    echo -e "${RED}Some services failed to start. Please check the logs above.${NC}"
    exit 1
fi 