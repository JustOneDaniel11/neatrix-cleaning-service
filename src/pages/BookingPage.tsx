import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookingSystem from "@/components/BookingSystem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BookingPage = () => {
  const navigate = useNavigate();

  const handleBookingSuccess = () => {
    // Redirect to dashboard after successful booking
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        {/* Back button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Booking System */}
        <BookingSystem onBookingSuccess={handleBookingSuccess} />
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;