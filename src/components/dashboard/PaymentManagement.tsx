import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus, X, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  autoBilling: boolean;
}

interface PaymentManagementProps {
  paymentMethods: PaymentMethod[];
  onSetDefault: (methodId: string) => void;
  onToggleAutoBilling: (methodId: string) => void;
  onDeletePayment: (methodId: string) => void;
  onAddPayment: (paymentMethod: any) => void;
}

const PaymentManagement = ({
  paymentMethods,
  onSetDefault,
  onToggleAutoBilling,
  onDeletePayment,
  onAddPayment
}: PaymentManagementProps) => {
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
    autoBilling: false
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
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate secure payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentMethod = {
        id: Date.now().toString(),
        type: getCardType(newPaymentMethod.cardNumber),
        last4: newPaymentMethod.cardNumber.replace(/\s/g, '').slice(-4),
        expiryMonth: newPaymentMethod.expiryMonth,
        expiryYear: newPaymentMethod.expiryYear,
        isDefault: newPaymentMethod.isDefault || paymentMethods.length === 0,
        autoBilling: newPaymentMethod.autoBilling
      };

      onAddPayment(paymentMethod);
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
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successDiv.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Payment method added securely!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      setErrors({ general: 'Failed to add payment method. Please try again.' });
    } finally {
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
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                    {method.isDefault && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => onSetDefault(method.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => onToggleAutoBilling(method.id)}
                    className={`text-sm px-3 py-1 rounded-full ${
                      method.autoBilling 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {method.autoBilling ? 'Auto-billing ON' : 'Auto-billing OFF'}
                  </button>
                  <button
                    onClick={() => onDeletePayment(method.id)}
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
                      autoBilling: false
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
                      checked={newPaymentMethod.isDefault || paymentMethods.length === 0}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                      disabled={isProcessing || paymentMethods.length === 0}
                    />
                    <label htmlFor="defaultPayment" className="text-sm">
                      Set as default payment method
                      {paymentMethods.length === 0 && (
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
                  disabled={isProcessing || !isFormValid()}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isProcessing || !isFormValid()
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