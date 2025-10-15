import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderInbox from './OrderInbox';
import OrderDetails from './OrderDetails';

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

  // Fetch orders from Supabase
  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          fetchOrders(); // Refresh the orders list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders', 'error');
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
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
            <div className="h-full flex flex-col">
              <div className="p-4 bg-white border-b border-gray-200 flex items-center flex-shrink-0">
                <button
                  onClick={handleBackToInbox}
                  className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold">Order Details</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <OrderDetails
                  order={selectedOrder}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onOrderUpdate={fetchOrders}
                  onShowToast={showToast}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <>
          <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-gray-200">
            <OrderInbox
              orders={orders}
              selectedOrder={selectedOrder}
              onOrderSelect={handleOrderSelect}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </div>
          <div className="flex-1 min-w-0">
            <OrderDetails
              order={selectedOrder}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onOrderUpdate={fetchOrders}
              onShowToast={showToast}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MessengerOrderTracking;