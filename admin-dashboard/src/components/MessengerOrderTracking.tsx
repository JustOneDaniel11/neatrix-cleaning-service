import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderInbox from './OrderInbox';
import OrderDetails from './OrderDetails';

interface RawOrderData {
  id: string;
  user_id: string;
  service_name: string;
  service_type: string;
  pickup_option: string;
  tracking_stage: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  service_type: string;
  pickup_option: string;
  tracking_stage: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const MessengerOrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch orders from Supabase with optimized query
  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for orders changes
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        (payload) => {
          console.log('Real-time order update:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            showToast('New order received!', 'info');
          } else if (payload.eventType === 'UPDATE') {
            showToast('Order updated successfully!', 'success');
          }
          
          // Refresh the orders list
          fetchOrders();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for orders');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
          showToast('Real-time updates unavailable', 'error');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Optimized query with specific fields as requested
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          service_name,
          service_type,
          pickup_option,
          tracking_stage,
          status,
          total_amount,
          created_at,
          updated_at,
          users:user_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log(`📦 Fetched ${data?.length || 0} orders from Supabase`);
      
      // Map the data to add customer_name and customer_email for backward compatibility
      const rawData = ((data ?? []) as unknown as RawOrderData[]);
      const ordersWithCustomerInfo: Order[] = rawData.map(order => ({
        id: order.id,
        user_id: order.user_id,
        service_name: order.service_name,
        service_type: order.service_type,
        pickup_option: order.pickup_option,
        tracking_stage: order.tracking_stage,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
        customer_name: order.users?.full_name || 
                      (order.users?.email ? order.users.email.split('@')[0] : 
                       `Customer #${order.id.slice(-6).toUpperCase()}`),
        customer_email: order.users?.email || 'Unknown Email'
      }));
      
      setOrders(ordersWithCustomerInfo);
      
      // If we have a selected order, update it with fresh data
      if (selectedOrder) {
        const updatedSelectedOrder = ordersWithCustomerInfo.find(order => order.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        }
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    if (isMobile) {
      setShowDetails(true);
    }
  };

  const handleBackToInbox = () => {
    setShowDetails(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="w-full h-full flex flex-col">
          {!showDetails ? (
            <div className="flex-1 overflow-hidden">
              <OrderInbox
                orders={orders}
                selectedOrder={selectedOrder}
                onOrderSelect={handleOrderSelect}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                <button
                  onClick={handleBackToInbox}
                  className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              </div>
              {selectedOrder && (
                <OrderDetails
                  order={selectedOrder}
                  onOrderUpdate={fetchOrders}
                  showToast={showToast}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <>
          <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
            <OrderInbox
              orders={orders}
              selectedOrder={selectedOrder}
              onOrderSelect={handleOrderSelect}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </div>
          <div className="flex-1 bg-white overflow-hidden">
            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                onOrderUpdate={fetchOrders}
                showToast={showToast}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Selected</h3>
                  <p className="text-gray-500 max-w-sm">
                    Select an order from the list to view its details and manage tracking stages.
                  </p>
                  {orders.length === 0 && (
                    <p className="text-sm text-gray-400 mt-4">
                      No orders found. Orders will appear here when customers place them.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessengerOrderTracking;