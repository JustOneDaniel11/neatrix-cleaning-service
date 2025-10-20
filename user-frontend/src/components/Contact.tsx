import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, ArrowRight, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

const Contact = () => {
  const navigate = useNavigate();
  const { createContactMessage } = useSupabaseData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create contact message using Supabase
      await createContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Service Type: ${formData.serviceType}\n\nMessage: ${formData.message}`
      });
      
      // Show success message
      alert('Thank you for your inquiry! We will contact you within 2 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Ready to Get <span className="bg-gradient-hero text-primary sm:bg-clip-text sm:text-transparent">Started?</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Contact us today for a free consultation and quote. We're here to make your space 
                sparkle with professional cleaning services you can trust.
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">Call Us Now</div>
                  <div className="text-muted-foreground text-sm md:text-base">+234 903 484 2430</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">Email Us</div>
                  <div className="text-muted-foreground text-sm md:text-base break-all">contactneatrix@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">Service Areas</div>
                  <div className="text-muted-foreground text-sm md:text-base">Lagos Only</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">Business Hours</div>
                  <div className="text-muted-foreground text-sm md:text-base">Mon-Fri 7AM-6PM, Sat 8AM-4PM</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button 
                size="lg" 
                className="w-full bg-gradient-primary shadow-medium hover:shadow-strong"
                onClick={() => navigate('/signup')}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account & Start Booking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right CTA Card */}
          <Card className="bg-gradient-card border-0 shadow-strong">
            <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
              <div className="text-center space-y-3 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-card-foreground">
                  Get Your Free Quote
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Fill out our quick form and we'll get back to you within 2 hours with a detailed quote.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (e.g., +234 903 484 2430)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <select 
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select Service Type</option>
                    <option value="office">Office Cleaning</option>
                    <option value="house">House Cleaning</option>
                    <option value="school">School Cleaning</option>
                    <option value="dry">Dry Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    name="message"
                    placeholder="Tell us about your cleaning needs..."
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary shadow-medium hover:shadow-strong disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  ⚡ Quick response guaranteed • 💯 No obligation
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;