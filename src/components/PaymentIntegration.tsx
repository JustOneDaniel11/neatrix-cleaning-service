import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Zap, Shield, CheckCircle, AlertCircle, Copy, Phone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: string;
}

interface PaymentData {
  amount: number;
  service: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
  bankDetails?: {
    bank: string;
    accountNumber: string;
  };
}

const PaymentIntegration: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 15000,
    service: 'House Cleaning Service',
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    paymentMethod: '',
    cardDetails: {
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    },
    bankDetails: {
      bank: '',
      accountNumber: ''
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, Verve cards',
      processingTime: 'Instant',
      fees: '1.5% + ₦100'
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: <Building className="w-6 h-6" />,
      description: 'Direct bank transfer',
      processingTime: '5-10 minutes',
      fees: 'Free'
    },
    {
      id: 'ussd',
      name: 'USSD Payment',
      icon: <Phone className="w-6 h-6" />,
      description: 'Pay with your mobile banking USSD',
      processingTime: 'Instant',
      fees: 'Free'
    },
    {
      id: 'mobile-money',
      name: 'Mobile Money',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Opay, PalmPay, Kuda, etc.',
      processingTime: 'Instant',
      fees: '1% + ₦50'
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: <Zap className="w-6 h-6" />,
      description: 'Secure payment with Paystack',
      processingTime: 'Instant',
      fees: '1.5% + ₦100'
    }
  ];

  const nigerianBanks = [
    'Access Bank', 'Zenith Bank', 'GTBank', 'First Bank', 'UBA', 'Fidelity Bank',
    'Union Bank', 'Sterling Bank', 'Stanbic IBTC', 'Wema Bank', 'FCMB', 'Ecobank',
    'Heritage Bank', 'Keystone Bank', 'Polaris Bank', 'Unity Bank', 'Jaiz Bank'
  ];

  const ussdCodes = [
    { bank: 'GTBank', code: '*737*', description: 'Dial *737*Amount*Account# to pay' },
    { bank: 'Access Bank', code: '*901*', description: 'Dial *901*Amount*Account# to pay' },
    { bank: 'Zenith Bank', code: '*966*', description: 'Dial *966*Amount*Account# to pay' },
    { bank: 'First Bank', code: '*894*', description: 'Dial *894*Amount*Account# to pay' },
    { bank: 'UBA', code: '*919*', description: 'Dial *919*Amount*Account# to pay' },
    { bank: 'Fidelity Bank', code: '*770*', description: 'Dial *770*Amount*Account# to pay' }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for demo
      if (success) {
        setPaymentStatus('success');
        alert('Payment successful! Your booking has been confirmed.');
      } else {
        setPaymentStatus('failed');
        alert('Payment failed. Please try again or use a different payment method.');
      }
      setIsProcessing(false);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const renderPaymentMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Payment Method</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{method.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>⏱️ {method.processingTime}</span>
                  <span>💰 {method.fees}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCardPayment = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Card Payment Details
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
          <input
            type="text"
            value={paymentData.cardDetails?.name || ''}
            onChange={(e) => setPaymentData(prev => ({
              ...prev,
              cardDetails: { ...prev.cardDetails!, name: e.target.value }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Name on card"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
          <input
            type="text"
            value={paymentData.cardDetails?.number || ''}
            onChange={(e) => setPaymentData(prev => ({
              ...prev,
              cardDetails: { ...prev.cardDetails!, number: e.target.value }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <input
            type="text"
            value={paymentData.cardDetails?.expiry || ''}
            onChange={(e) => setPaymentData(prev => ({
              ...prev,
              cardDetails: { ...prev.cardDetails!, expiry: e.target.value }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="MM/YY"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
          <input
            type="text"
            value={paymentData.cardDetails?.cvv || ''}
            onChange={(e) => setPaymentData(prev => ({
              ...prev,
              cardDetails: { ...prev.cardDetails!, cvv: e.target.value }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="w-4 h-4 mr-2 text-green-600" />
        Your card details are encrypted and secure. We use industry-standard SSL encryption.
      </div>
    </div>
  );

  const renderBankTransfer = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <Building className="w-5 h-5 mr-2" />
        Bank Transfer Details
      </h4>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-2">Transfer to:</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>Account Name:</span>
            <span className="font-medium">Neatrix Cleaning Services Ltd</span>
            <button
              onClick={() => copyToClipboard('Neatrix Cleaning Services Ltd')}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>Account Number:</span>
            <span className="font-medium">0123456789</span>
            <button
              onClick={() => copyToClipboard('0123456789')}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>Bank:</span>
            <span className="font-medium">GTBank</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Amount:</span>
            <span className="font-medium text-lg text-green-600">₦{paymentData.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use your phone number as the transfer reference</li>
              <li>Payment confirmation may take 5-10 minutes</li>
              <li>Keep your transfer receipt for verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUSSDPayment = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <Phone className="w-5 h-5 mr-2" />
        USSD Payment
      </h4>
      <div className="bg-green-50 p-4 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-3">Choose your bank:</h5>
        <div className="grid md:grid-cols-2 gap-3">
          {ussdCodes.map((bank) => (
            <div key={bank.bank} className="bg-white p-3 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{bank.bank}</span>
                <span className="text-lg font-bold text-green-600">{bank.code}</span>
              </div>
              <p className="text-sm text-gray-600">{bank.description}</p>
              <button
                onClick={() => copyToClipboard(`${bank.code}${paymentData.amount}*0123456789#`)}
                className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Copy USSD Code
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-2">How to pay:</h5>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>Dial the USSD code for your bank</li>
          <li>Follow the prompts on your phone</li>
          <li>Enter the amount: ₦{paymentData.amount.toLocaleString()}</li>
          <li>Confirm the payment</li>
          <li>You'll receive an SMS confirmation</li>
        </ol>
      </div>
    </div>
  );

  const renderMobileMoney = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <Smartphone className="w-5 h-5 mr-2" />
        Mobile Money Payment
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        {['Opay', 'PalmPay', 'Kuda', 'Carbon'].map((provider) => (
          <div key={provider} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold">
                {provider[0]}
              </div>
              <h5 className="font-semibold text-gray-800">{provider}</h5>
              <p className="text-sm text-gray-600">Pay with {provider} wallet</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-800">
          You'll be redirected to your mobile money app to complete the payment of ₦{paymentData.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
      case 'paystack':
        return renderCardPayment();
      case 'bank-transfer':
        return renderBankTransfer();
      case 'ussd':
        return renderUSSDPayment();
      case 'mobile-money':
        return renderMobileMoney();
      default:
        return null;
    }
  };

  return (
    <section id="payment" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Secure Payment</h2>
          <p className="text-xl text-gray-600">Multiple payment options for your convenience</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="font-medium">{paymentData.service}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{(paymentData.amount * 0.925).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%):</span>
                <span>₦{(paymentData.amount * 0.075).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">₦{paymentData.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={paymentData.customerInfo.name}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, name: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={paymentData.customerInfo.phone}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, phone: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+234 xxx xxx xxxx"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={paymentData.customerInfo.email}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, email: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          {renderPaymentMethodSelection()}

          {/* Payment Form */}
          {selectedMethod && (
            <div className="mt-8">
              {renderPaymentForm()}
            </div>
          )}

          {/* Payment Button */}
          {selectedMethod && (
            <div className="mt-8">
              <button
                onClick={handlePayment}
                disabled={isProcessing || paymentStatus === 'processing'}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 font-semibold text-lg flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Pay ₦{paymentData.amount.toLocaleString()} Securely
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-600" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentIntegration;