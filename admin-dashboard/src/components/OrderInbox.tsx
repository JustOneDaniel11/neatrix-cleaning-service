import React, { useState, useMemo } from 'react';
import { Search, Package, Clock, User, Filter, MapPin, Truck } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  pickup_option: string;
  tracking_stage: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderInboxProps {
  orders: Order[];
  selectedOrder: Order | null;
  onOrderSelect: (order: Order) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

const OrderInbox: React.FC<OrderInboxProps> = ({
  orders,
  selectedOrder,
  onOrderSelect,
  formatDate,
  formatCurrency
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Stage labels and colors
  const getStageLabel = (stage: string): string => {
    const stageLabels: { [key: string]: string } = {
      'order_placed': 'Order Placed',
      'pickup_scheduled': 'Pickup Scheduled',
      'items_collected': 'Items Collected',
      'in_cleaning': 'In Cleaning',
      'quality_check': 'Quality Check',
      'ready_for_delivery': 'Ready for Delivery',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'picked_up': 'Picked Up'
    };
    return stageLabels[stage] || stage;
  };

  const getStageColor = (stage: string): string => {
    const stageColors: { [key: string]: string } = {
      'order_placed': 'bg-blue-500',
      'pickup_scheduled': 'bg-yellow-500',
      'items_collected': 'bg-orange-500',
      'in_cleaning': 'bg-purple-500',
      'quality_check': 'bg-indigo-500',
      'ready_for_delivery': 'bg-cyan-500',
      'out_for_delivery': 'bg-amber-500',
      'delivered': 'bg-green-500',
      'picked_up': 'bg-green-500'
    };
    return stageColors[stage] || 'bg-gray-500';
  };

  const isOrderCompleted = (stage: string): boolean => {
    return stage === 'delivered' || stage === 'picked_up';
  };

  const getStatusDot = (stage: string) => {
    const color = getStageColor(stage);
    return <div className={`w-3 h-3 rounded-full ${color}`} />;
  };

  const handleTrackingSearch = () => {
    if (!trackingSearch.trim()) return;
    
    const foundOrder = orders.find(order => 
      order.id.toLowerCase().includes(trackingSearch.toLowerCase()) ||
      order.id === trackingSearch
    );
    
    if (foundOrder) {
      onOrderSelect(foundOrder);
      setTrackingSearch('');
    }
  };

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = !searchQuery || 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesFilter = activeFilter === 'all' || 
        (activeFilter === 'completed' && isOrderCompleted(order.tracking_stage)) ||
        (activeFilter === 'active' && !isOrderCompleted(order.tracking_stage));

      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, activeFilter]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Inbox</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Find order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Tracking Code Search */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter tracking code..."
            value={trackingSearch}
            onChange={(e) => setTrackingSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleTrackingSearch()}
          />
          <button
            onClick={handleTrackingSearch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Locate
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeFilter === status
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onOrderSelect(order)}
                className={`p-4 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isOrderCompleted(order.tracking_stage) ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusDot(order.tracking_stage)}
                    <h3 className="font-medium text-gray-900">
                      {order.customer_name}
                    </h3>
                    {isOrderCompleted(order.tracking_stage) && (
                      <span className="text-green-600 text-sm">✅</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(order.updated_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>#{order.id.slice(-8)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{order.customer_email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {order.pickup_option === 'delivery' ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span>{order.service_name} - {order.pickup_option}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isOrderCompleted(order.tracking_stage)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getStageLabel(order.tracking_stage)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderInbox;