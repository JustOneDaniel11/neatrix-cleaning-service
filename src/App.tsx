import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import GalleryPage from "./pages/GalleryPage";
import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import EmailVerificationSuccessPage from "./pages/EmailVerificationSuccessPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLiveChat from "./pages/AdminLiveChat";
import SupportPage from "./pages/SupportPage";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";
import { SupabaseDataProvider, useSupabaseData } from "./contexts/SupabaseDataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ServiceStatusBanner from "./components/ServiceStatusBanner";

const queryClient = new QueryClient();

const StatusBannerHost = () => {
  const { state } = useSupabaseData();
  return <ServiceStatusBanner errorMessage={state.error} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseDataProvider>
        <Toaster />
        <Sonner />
        <StatusBannerHost />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            <Route path="/email-verification-success" element={<EmailVerificationSuccessPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/book-service" element={<BookingPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/live-chat" element={
              <ProtectedRoute>
                <AdminLiveChat />
              </ProtectedRoute>
            } />
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SupabaseDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
