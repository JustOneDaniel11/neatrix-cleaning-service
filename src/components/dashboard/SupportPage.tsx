import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Headphones,
  Construction
} from "lucide-react";

const SupportPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Center</h1>
        <p className="text-gray-600">Get help when you need it - we're here to assist you</p>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            We're working hard to bring you an amazing support experience. 
            Our support center will be available soon with live chat, ticket management, and comprehensive help resources.
          </p>
          
          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
              <p className="text-sm text-gray-600">Call us directly</p>
              <p className="text-sm font-medium text-blue-600 mt-1">+1 (555) 123-4567</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-600">Send us a message</p>
              <p className="text-sm font-medium text-blue-600 mt-1">support@neatrix.com</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
              <p className="text-sm text-gray-600">We're available</p>
              <p className="text-sm font-medium text-blue-600 mt-1">Mon-Fri 9AM-6PM</p>
            </div>
          </div>
          
          {/* Temporary Contact Form */}
          <div className="bg-gray-50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help Now?</h3>
            <p className="text-sm text-gray-600 mb-4">
              For immediate assistance, please contact us using the information above or send us an email with your inquiry.
            </p>
            <div className="flex items-center justify-center">
              <a 
                href="mailto:support@neatrix.com" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;