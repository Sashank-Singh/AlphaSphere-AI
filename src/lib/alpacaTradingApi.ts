// Alpaca Trading API service
const ALPACA_API_KEY = 'CKN7E7O3WAHG8426XDMQ';
const ALPACA_API_SECRET = 'pItkpMbBWVD9wME8Hjg9BhthcwN9x5raTbsG8sJV';
const ALPACA_API_URL = 'https://broker-api.sandbox.alpaca.markets';

// Define interfaces for trading
export interface OrderRequest {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
  trail_price?: number;
  trail_percent?: number;
  extended_hours?: boolean;
  client_order_id?: string;
  order_class?: 'simple' | 'bracket' | 'oco' | 'oto';
  commission?: number;
  commission_type?: 'notional' | 'qty' | 'bps';
  subtag?: string;
}

export interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  replaced_at: string | null;
  replaced_by: string | null;
  replaces: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional: number | null;
  qty: string | null;
  filled_qty: string;
  filled_avg_price: string | null;
  order_class: string;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: string;
  extended_hours: boolean;
  legs: Order[] | null;
  trail_percent: string | null;
  trail_price: string | null;
  hwm: string | null;
  commission: string;
  source: string;
}

export interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  asset_marginable: boolean;
  qty: string;
  avg_entry_price: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface Account {
  id: string;
  account_number: string;
  status: string;
  crypto_status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

// Define types for asset data
export interface Asset {
  id: string;
  class: string;
  exchange: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
}

// Define generic response type for config updates
export interface AccountConfigResponse {
  dtbp_check: string;
  fractional_trading: boolean;
  max_margin_multiplier: string;
  no_shorting: boolean;
  pdt_check: string;
  suspend_trade: boolean;
  trade_confirm_email: string;
}

// Helper function to make authenticated requests to Alpaca API
const alpacaRequest = async <T>(endpoint: string, method: string = 'GET', data?: Record<string, unknown>): Promise<T> => {
  try {
    const url = `${ALPACA_API_URL}${endpoint}`;
    const headers = {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
      cache: 'no-store'
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpaca API error (${response.status}): ${errorText}`);
      throw new Error(`Alpaca API error (${response.status}): ${errorText}`);
    }

    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error('Error making request to Alpaca API:', error);
    throw error;
  }
};

// Get account information
export const getAccount = async (accountId: string): Promise<Account> => {
  return alpacaRequest<Account>(`/v1/trading/accounts/${accountId}/account`);
};

// Get all positions for an account
export const getPositions = async (accountId: string): Promise<Position[]> => {
  return alpacaRequest<Position[]>(`/v1/trading/accounts/${accountId}/positions`);
};

// Get a specific position
export const getPosition = async (accountId: string, symbol: string): Promise<Position> => {
  return alpacaRequest<Position>(`/v1/trading/accounts/${accountId}/positions/${symbol}`);
};

// Create an order
export const createOrder = async (accountId: string, orderRequest: OrderRequest): Promise<Order> => {
  return alpacaRequest<Order>(`/v1/trading/accounts/${accountId}/orders`, 'POST', orderRequest as unknown as Record<string, unknown>);
};

// Get all orders
export const getOrders = async (
  accountId: string,
  status?: 'open' | 'closed' | 'all',
  limit?: number,
  after?: string,
  until?: string,
  direction?: 'asc' | 'desc'
): Promise<Order[]> => {
  let url = `/v1/trading/accounts/${accountId}/orders`;
  const params = new URLSearchParams();
  
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit.toString());
  if (after) params.append('after', after);
  if (until) params.append('until', until);
  if (direction) params.append('direction', direction);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return alpacaRequest<Order[]>(url);
};

// Get a specific order
export const getOrder = async (accountId: string, orderId: string): Promise<Order> => {
  return alpacaRequest<Order>(`/v1/trading/accounts/${accountId}/orders/${orderId}`);
};

// Cancel an order
export const cancelOrder = async (accountId: string, orderId: string): Promise<void> => {
  return alpacaRequest<void>(`/v1/trading/accounts/${accountId}/orders/${orderId}`, 'DELETE');
};

// Get assets that support fractional trading
export const getFractionableAssets = async (): Promise<Asset[]> => {
  const assets = await alpacaRequest<Asset[]>('/v1/assets');
  return assets.filter((asset: Asset) => asset.fractionable);
};

// Update account configuration
export const updateAccountConfiguration = async (accountId: string, config: { fractional_trading?: boolean }): Promise<AccountConfigResponse> => {
  return alpacaRequest<AccountConfigResponse>(`/v1/trading/accounts/${accountId}/account/configurations`, 'PATCH', config);
};

// Market buy order (using notional amount - dollar-based)
export const marketBuyDollars = async (accountId: string, symbol: string, dollars: number): Promise<Order> => {
  const orderRequest: OrderRequest = {
    symbol,
    notional: dollars,
    side: 'buy',
    type: 'market',
    time_in_force: 'day'
  };
  
  return createOrder(accountId, orderRequest);
};

// Market buy order (using quantity)
export const marketBuyShares = async (accountId: string, symbol: string, quantity: number): Promise<Order> => {
  const orderRequest: OrderRequest = {
    symbol,
    qty: quantity,
    side: 'buy',
    type: 'market',
    time_in_force: 'day'
  };
  
  return createOrder(accountId, orderRequest);
};

// Market sell order (using quantity)
export const marketSellShares = async (accountId: string, symbol: string, quantity: number): Promise<Order> => {
  const orderRequest: OrderRequest = {
    symbol,
    qty: quantity,
    side: 'sell',
    type: 'market',
    time_in_force: 'day'
  };
  
  return createOrder(accountId, orderRequest);
};

// Limit buy order
export const limitBuyShares = async (
  accountId: string, 
  symbol: string, 
  quantity: number, 
  limitPrice: number
): Promise<Order> => {
  const orderRequest: OrderRequest = {
    symbol,
    qty: quantity,
    side: 'buy',
    type: 'limit',
    time_in_force: 'day',
    limit_price: limitPrice
  };
  
  return createOrder(accountId, orderRequest);
};

// Limit sell order
export const limitSellShares = async (
  accountId: string, 
  symbol: string, 
  quantity: number, 
  limitPrice: number
): Promise<Order> => {
  const orderRequest: OrderRequest = {
    symbol,
    qty: quantity,
    side: 'sell',
    type: 'limit',
    time_in_force: 'day',
    limit_price: limitPrice
  };
  
  return createOrder(accountId, orderRequest);
};

// Close all positions
export const closeAllPositions = async (accountId: string): Promise<Order[]> => {
  return alpacaRequest<Order[]>(`/v1/trading/accounts/${accountId}/positions`, 'DELETE');
};

// Close a specific position
export const closePosition = async (accountId: string, symbol: string): Promise<Order> => {
  return alpacaRequest<Order>(`/v1/trading/accounts/${accountId}/positions/${symbol}`, 'DELETE');
};
