import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Calendar, DollarSign, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string; // for PayPal
  bankName?: string; // for bank accounts
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  bookingId?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  bookingId?: string;
}

const PaymentPage: React.FC = () => {
  const { state } = useSupabaseData();
  const [activeTab, setActiveTab] = useState<'methods' | 'history' | 'invoices'>('methods');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState<'card' | 'bank' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Generate real data from SupabaseDataContext
  useEffect(() => {
    if (!state.currentUser) return;

    // Generate payment methods from user's payment history
    const userBilling = state.subscriptionBilling.filter(billing => billing.user_id === state.currentUser?.id);
    const uniquePaymentMethods = new Map<string, PaymentMethod>();
    
    userBilling.forEach((billing, index) => {
      if (billing.payment_method) {
        const methodKey = billing.payment_method;
        if (!uniquePaymentMethods.has(methodKey)) {
          const isCard = methodKey.toLowerCase().includes('card') || methodKey.toLowerCase().includes('visa') || methodKey.toLowerCase().includes('mastercard');
          const isPaypal = methodKey.toLowerCase().includes('paypal');
          
          uniquePaymentMethods.set(methodKey, {
            id: `method-${index + 1}`,
            type: isPaypal ? 'paypal' : isCard ? 'card' : 'bank',
            last4: isCard ? methodKey.slice(-4) : undefined,
            brand: isCard ? (methodKey.toLowerCase().includes('visa') ? 'Visa' : 'Mastercard') : undefined,
            expiryMonth: isCard ? 12 : undefined,
            expiryYear: isCard ? 2025 : undefined,
            isDefault: index === 0,
            email: isPaypal ? state.currentUser?.email : undefined,
            bankName: !isCard && !isPaypal ? methodKey : undefined
          });
        }
      }
    });

    // Add default payment method if none exist
    if (uniquePaymentMethods.size === 0) {
      uniquePaymentMethods.set('default', {
        id: 'default-1',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      });
    }

    setPaymentMethods(Array.from(uniquePaymentMethods.values()));

    // Generate transactions from subscription billing
    const userTransactions: Transaction[] = userBilling.map((billing) => ({
      id: billing.id,
      amount: billing.amount,
      description: `Subscription Payment - ${new Date(billing.billing_date).toLocaleDateString()}`,
      status: billing.status === 'paid' ? 'completed' : billing.status === 'failed' ? 'failed' : 'pending',
      date: billing.billing_date,
      paymentMethod: billing.payment_method || 'Unknown',
      bookingId: billing.subscription_id
    }));

    // Add transactions from regular bookings
    const userBookings = state.bookings.filter(booking => booking.user_id === state.currentUser?.id);
    const bookingTransactions: Transaction[] = userBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      amount: booking.total_amount,
      description: `${booking.service_name} - ${booking.service_type}`,
      status: booking.status === 'completed' ? 'completed' : booking.status === 'cancelled' ? 'failed' : 'pending',
      date: booking.created_at,
      paymentMethod: 'Card ****4242', // Default since we don't have payment method in bookings
      bookingId: booking.id
    }));

    setTransactions([...userTransactions, ...bookingTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));

    // Generate invoices from bookings
    const userInvoices: Invoice[] = userBookings.map((booking, index) => {
      const dueDate = new Date(booking.date);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from service date
      
      const isPaid = booking.status === 'completed';
      const isOverdue = !isPaid && new Date() > dueDate;
      
      return {
        id: booking.id,
        invoiceNumber: `INV-${new Date(booking.created_at).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        amount: booking.total_amount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
        description: `${booking.service_name} - ${booking.service_type}`,
        bookingId: booking.id
      };
    });

    setInvoices(userInvoices.sort((a, b) => 
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    ));
  }, [state.currentUser, state.subscriptionBilling, state.bookings]);

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowAddPayment(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment & Billing</h1>
        <p className="text-gray-600">Manage your payment methods, view transaction history, and handle invoices</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'methods', label: 'Payment Methods', icon: CreditCard },
            { id: 'history', label: 'Transaction History', icon: Receipt },
            { id: 'invoices', label: 'Invoices', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowAddPayment(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Method</span>
            </button>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {method.type === 'card' && `${method.brand} ****${method.last4}`}
                      {method.type === 'paypal' && `PayPal - ${method.email}`}
                      {method.type === 'bank' && `${method.bankName} - ****${method.last4}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.type === 'card' && `Expires ${method.expiryMonth}/${method.expiryYear}`}
                      {method.isDefault && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Payment Method Modal */}
          {showAddPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="bank">Bank Account</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  {newPaymentType === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {newPaymentType === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                      />
                    </div>
                  )}

                  {newPaymentType === 'bank' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Your Bank Name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          placeholder="Account Number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 min-h-[44px]"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddPayment(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Adding...' : 'Add Payment Method'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        {transaction.bookingId && (
                          <div className="text-sm text-gray-500">Booking: {transaction.bookingId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
          
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Receipt className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invoice.status)}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download PDF
                  </button>
                  {invoice.status === 'pending' && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;