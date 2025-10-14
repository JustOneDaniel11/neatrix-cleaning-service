import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  BarChart3, 
  Home, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Package,
  Shirt,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useSupabaseData, formatDate, formatCurrency } from "@/contexts/SupabaseDataContext";

interface DryCleaningOrder {
  id: string;
  service_type: string;
  service_name: string;
  date: string;
  time: string;
  address: string;
  phone: string;
  status: string;
  pickup_status?: string;
  cleaning_status?: string;
  delivery_status?: string;
  pickup_date?: string;
  delivery_date?: string;
  estimated_completion?: string;
  item_count?: number;
  item_details?: any;
  tracking_notes?: string;
  total_amount: number;
  created_at: string;
}

const DryCleaningTracker = () => {
  const { state, updateDryCleaningStatus } = useSupabaseData();
  const navigate = useNavigate();
  
  // Filter bookings for dry cleaning orders
  const orders = state.bookings.filter(booking => 
    booking.service_type?.toLowerCase().includes('dry') || 
    booking.service_name?.toLowerCase().includes('dry')
  );

  const handleViewDetails = (orderId: string) => {
    // Navigate to order details or show modal
    console.log('View details for order:', orderId);
  };

  const handleContactSupport = (orderId: string) => {
    // Navigate to support or show contact modal
    console.log('Contact support for order:', orderId);
  };

  const handleSchedulePickup = async (orderId: string) => {
    try {
      await updateDryCleaningStatus(orderId, {
        pickup_status: 'scheduled',
        pickup_date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error scheduling pickup:', error);
    }
  };

  const handleScheduleDelivery = async (orderId: string) => {
    try {
      await updateDryCleaningStatus(orderId, {
        delivery_status: 'ready'
      });
    } catch (error) {
      console.error('Error scheduling delivery:', error);
    }
  };

  const handleRefreshStatus = async (orderId: string) => {
    // Refresh order status from server
    console.log('Refresh status for order:', orderId);
  };
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (order: DryCleaningOrder) => {
    let progress = 0;
    if (order.pickup_status === 'picked_up') progress += 33;
    if (order.cleaning_status === 'completed') progress += 34;
    if (order.delivery_status === 'delivered') progress += 33;
    return progress;
  };

  const getNextAction = (order: DryCleaningOrder) => {
    const pickupStatus = order.pickup_status || 'pending';
    const cleaningStatus = order.cleaning_status || 'pending';
    const deliveryStatus = order.delivery_status || 'pending';
    
    if (pickupStatus === 'pending') return 'Schedule Pickup';
    if (pickupStatus === 'scheduled') return 'Awaiting Pickup';
    if (pickupStatus === 'picked_up' && cleaningStatus === 'pending') return 'Cleaning Queued';
    if (cleaningStatus === 'in_progress') return 'Cleaning in Progress';
    if (deliveryStatus === 'ready') return 'Schedule Delivery';
    if (deliveryStatus === 'out_for_delivery') return 'Out for Delivery';
    if (deliveryStatus === 'delivered') return 'Completed';
    return 'Processing';
  };

  const renderProgressSteps = (order: DryCleaningOrder) => {
    const pickupStatus = order.pickup_status || 'pending';
    const cleaningStatus = order.cleaning_status || 'pending';
    const deliveryStatus = order.delivery_status || 'pending';
    
    const steps = [
      {
        label: 'Pickup',
        status: pickupStatus,
        icon: Truck,
        completed: pickupStatus === 'picked_up',
        active: pickupStatus === 'scheduled'
      },
      {
        label: 'Cleaning',
        status: cleaningStatus,
        icon: BarChart3,
        completed: cleaningStatus === 'completed',
        active: cleaningStatus === 'in_progress'
      },
      {
        label: 'Delivery',
        status: deliveryStatus,
        icon: Home,
        completed: deliveryStatus === 'delivered',
        active: deliveryStatus === 'out_for_delivery'
      }
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step.completed ? 'bg-green-500 text-white' :
                step.active ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="ml-3">
                <p className={`font-medium ${step.completed ? 'text-green-600' : step.active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-sm text-gray-500 capitalize">{step.status.replace('_', ' ')}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  steps[index + 1].completed || steps[index + 1].active ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrderDetails = (order: DryCleaningOrder) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Booked: {formatDate(order.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{order.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{order.phone}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Items: {order.item_count || 'Not specified'}</span>
          </div>
          {order.estimated_completion && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Est. Completion: {formatDate(order.estimated_completion)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total: {formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {order.item_details && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Item Details:</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {typeof order.item_details === 'string' ? order.item_details : JSON.stringify(order.item_details, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {order.tracking_notes && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Tracking Notes:</h4>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">{order.tracking_notes}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No dry cleaning orders</h3>
        <p className="text-gray-600 mb-6">You don't have any dry cleaning orders to track.</p>
        <button
          onClick={() => window.location.href = '/book-service'}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Book Dry Cleaning Service
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dry Cleaning Tracker</h2>
        <div className="text-sm text-gray-600">
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{order.service_name}</CardTitle>
                <p className="text-gray-600">Order #{order.id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleRefreshStatus(order.id)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            {renderProgressSteps(order)}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">{getProgressPercentage(order)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(order)}%` }}
                />
              </div>
            </div>

            {/* Next Action */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Next: {getNextAction(order)}
                </span>
              </div>
            </div>

            {/* Order Details (Expandable) */}
            {selectedOrder === order.id && renderOrderDetails(order)}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
              </button>
              
              {(order.pickup_status || 'pending') === 'pending' && (
                <button
                  onClick={() => handleSchedulePickup(order.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Truck className="w-4 h-4" />
                  Schedule Pickup
                </button>
              )}
              
              {(order.delivery_status || 'pending') === 'ready' && (
                <button
                  onClick={() => handleScheduleDelivery(order.id)}
                  className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  Schedule Delivery
                </button>
              )}
              
              <button
                onClick={() => handleContactSupport(order.id)}
                className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DryCleaningTracker;