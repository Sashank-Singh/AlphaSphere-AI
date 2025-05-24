import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { getOrders, cancelOrder, Order } from '@/lib/alpacaTradingApi';

interface OrdersPanelProps {
  accountId: string;
}

const OrdersPanel: React.FC<OrdersPanelProps> = ({ accountId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrders, setCancellingOrders] = useState<Record<string, boolean>>({});

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOrders(accountId, 'all', 10);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up interval to refresh orders every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, [accountId]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrders(prev => ({ ...prev, [orderId]: true }));
    try {
      await cancelOrder(accountId, orderId);
      // Update the order status in the list
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'canceled', canceled_at: new Date().toISOString() } 
          : order
      ));
    } catch (err) {
      console.error(`Error cancelling order ${orderId}:`, err);
      setError(`Failed to cancel order. Please try again.`);
    } finally {
      setCancellingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'bg-green-500/20 text-green-500';
      case 'canceled':
      case 'expired':
      case 'rejected':
      case 'failed':
        return 'bg-red-500/20 text-red-500';
      case 'new':
      case 'accepted':
      case 'pending_new':
        return 'bg-blue-500/20 text-blue-500';
      case 'partially_filled':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Card className="w-full bg-black border border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <CardDescription>
            Your last 10 orders
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchOrders} 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4">
            {error}
          </div>
        )}
        
        {orders.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            You don't have any recent orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Qty/Notional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <div className="mt-2 text-muted-foreground">Loading orders...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.symbol}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                        {order.side.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {order.notional 
                          ? `$${parseFloat(order.notional.toString()).toFixed(2)}` 
                          : order.qty 
                            ? parseFloat(order.qty).toFixed(2) 
                            : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.submitted_at)}</TableCell>
                      <TableCell>{formatDate(order.updated_at)}</TableCell>
                      <TableCell>
                        {['new', 'accepted', 'pending_new'].includes(order.status) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrders[order.id]}
                          >
                            {cancellingOrders[order.id] ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersPanel;
