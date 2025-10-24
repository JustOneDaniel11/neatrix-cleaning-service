import { useState, useEffect } from "react";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Plus, X, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { usePaystackPayment } from 'react-paystack';



const PaymentManagement = () => {
  const { state, fetchUserPaymentMethods, setDefaultPaymentMethod, deleteUserPaymentMethod, createUserPaymentMethod } = useSupabaseData();
  useEffect(() => { fetchUserPaymentMethods(); }, []);

  const paystackAddCardConfig = {
    reference: `card_${Date.now()}`,
    email: state.currentUser?.email || '',
    amount: 100 * 100, // ₦100 in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_public_key_here',
    currency: 'NGN',
    metadata: {
      custom_fields: [
        { display_name: 'Action', variable_name: 'action', value: 'add_card' },
        { display_name: 'User', variable_name: 'user_id', value: state.currentUser?.id || 'anonymous' }
      ]
    }
  };
  const initializeAddCard = usePaystackPayment(paystackAddCardConfig);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    isDefault: false,
    autoBilling: false,
  });

  // Card validation functions
  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    // Luhn algorithm for card validation
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const getCardType = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!newPaymentMethod.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(newPaymentMethod.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!newPaymentMethod.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }
    
    if (!newPaymentMethod.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expYear = parseInt(`20${newPaymentMethod.expiryYear}`);
      const expMonth = parseInt(newPaymentMethod.expiryMonth);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryYear = 'Card has expired';
      }
    }
    
    if (!newPaymentMethod.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (newPaymentMethod.cvv.length < 3 || newPaymentMethod.cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    if (!newPaymentMethod.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return newPaymentMethod.cardNumber.trim() !== '' &&
           newPaymentMethod.expiryMonth !== '' &&
           newPaymentMethod.expiryYear !== '' &&
           newPaymentMethod.cvv.trim() !== '' &&
           newPaymentMethod.cardholderName.trim() !== '' &&
           validateCardNumber(newPaymentMethod.cardNumber) &&
           newPaymentMethod.cvv.length >= 3 &&
           newPaymentMethod.cvv.length <= 4;
  };

  const handleAddPaymentMethod = async () => {
    setIsProcessing(true);
    try {
      initializeAddCard({
        onSuccess: async (reference: any) => {
          try {
            await createUserPaymentMethod({
              user_id: state.currentUser!.id,
              payment_type: 'card',
              card_brand: reference?.authorization?.card_type || 'Card',
              card_last4: reference?.authorization?.last4,
              card_exp_month: reference?.authorization?.exp_month,
              card_exp_year: reference?.authorization?.exp_year,
              paystack_authorization_code: reference?.authorization?.authorization_code,
              paystack_customer_code: reference?.customer?.customer_code,
              is_default: state.userPaymentMethods.length === 0 || newPaymentMethod.isDefault,
              is_active: true
            });
            await fetchUserPaymentMethods();
            setIsProcessing(false);
            setShowAddPaymentModal(false);
            setNewPaymentMethod({
              cardNumber: '',
              expiryMonth: '',
              expiryYear: '',
              cvv: '',
              cardholderName: '',
              billingAddress: '',
              isDefault: false,
              autoBilling: false
            });
            setErrors({});
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
            successDiv.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Payment method added securely!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
          } catch (e) {
            console.error('Error saving payment/card:', e);
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Paystack init error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {state.userPaymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {method.payment_type === 'card' && `${method.card_brand ?? 'Card'} ${method.card_last4 ? '•••• ' + method.card_last4 : ''}`}
                      {method.payment_type === 'bank' && `${method.bank_name ?? 'Bank Account'}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.payment_type === 'card' && method.card_exp_month && method.card_exp_year ? `Expires ${method.card_exp_month}/${method.card_exp_year}` : ''}
                    </div>
                    {method.is_default && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <button
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Set as Default
                    </button>
                  )}

                  <button
                    onClick={() => deleteUserPaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold">Add Payment Method</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setErrors({});
                    setNewPaymentMethod({
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                      cardholderName: '',
                      billingAddress: '',
                      isDefault: false,
                      autoBilling: false,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isProcessing}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Secure Payment Processing</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted and securely stored. We never store your full card number or CVV.
                    </p>
                  </div>
                </div>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCardNumber(newPaymentMethod.cardNumber)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '');
                        if (/^\d*$/.test(value) && value.length <= 16) {
                          setNewPaymentMethod(prev => ({ ...prev, cardNumber: value }));
                          if (errors.cardNumber) {
                            setErrors(prev => ({ ...prev, cardNumber: '' }));
                          }
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pr-12 ${
                        errors.cardNumber 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cardNumber}
                    </p>
                  )}
                  {newPaymentMethod.cardNumber && !errors.cardNumber && validateCardNumber(newPaymentMethod.cardNumber) && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Valid {getCardType(newPaymentMethod.cardNumber)} card
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Month</label>
                    <select
                      value={newPaymentMethod.expiryMonth}
                      onChange={(e) => {
                        setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }));
                        if (errors.expiryMonth) {
                          setErrors(prev => ({ ...prev, expiryMonth: '' }));
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.expiryMonth 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary'
                      }`}
                      disabled={isProcessing}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    {errors.expiryMonth && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.expiryMonth}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Year</label>
                    <select
                      value={newPaymentMethod.expiryYear}
                      onChange={(e) => {
                        setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }));
                        if (errors.expiryYear) {
                          setErrors(prev => ({ ...prev, expiryYear: '' }));
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.expiryYear 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary'
                      }`}
                      disabled={isProcessing}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {new Date().getFullYear() + i}
                        </option>
                      ))}
                    </select>
                    {errors.expiryYear && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.expiryYear}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPaymentMethod.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setNewPaymentMethod(prev => ({ ...prev, cvv: value }));
                          if (errors.cvv) {
                            setErrors(prev => ({ ...prev, cvv: '' }));
                          }
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.cvv 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary'
                      }`}
                      placeholder="123"
                      disabled={isProcessing}
                    />
                  </div>
                  {errors.cvv && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cvv}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">3-4 digit security code on the back of your card</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={newPaymentMethod.cardholderName}
                    onChange={(e) => {
                      setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }));
                      if (errors.cardholderName) {
                        setErrors(prev => ({ ...prev, cardholderName: '' }));
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.cardholderName 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary'
                    }`}
                    placeholder="John Doe"
                    disabled={isProcessing}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cardholderName}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="defaultPayment"
                      checked={newPaymentMethod.isDefault || state.userPaymentMethods.length === 0}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                      disabled={isProcessing || state.userPaymentMethods.length === 0}
                    />
                    <label htmlFor="defaultPayment" className="text-sm">
                      Set as default payment method
                      {state.userPaymentMethods.length === 0 && (
                        <span className="text-gray-500 ml-1">(automatically set for first card)</span>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoBilling"
                      checked={newPaymentMethod.autoBilling}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, autoBilling: e.target.checked }))}
                      className="rounded"
                      disabled={isProcessing}
                    />
                    <label htmlFor="autoBilling" className="text-sm">Enable auto-billing for subscriptions</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isProcessing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Add Payment Method
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;