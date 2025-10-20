import { Sparkles, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand */}
          <div className="space-y-3 md:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl md:text-2xl font-bold">Neatrix</span>
            </div>
            <p className="text-background/80 leading-relaxed text-sm md:text-base">
              Professional cleaning services that make your space sparkle. 
              Trusted by hundreds of satisfied customers.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <Facebook className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors touch-manipulation" />
              <Twitter className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors touch-manipulation" />
              <Instagram className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors touch-manipulation" />
              <Linkedin className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors touch-manipulation" />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-background">Services</h3>
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Office Cleaning
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                House Cleaning
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                School Cleaning
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Dry Cleaning
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Deep Cleaning
              </button>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-background">Company</h3>
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={() => scrollToSection('about')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Our Team
              </button>
              <Link 
                to="/dashboard/payment" 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Payment
              </Link>
              <Link 
                to="/dashboard/alerts" 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Alerts
              </Link>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Careers
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Blog
              </button>
              <Link 
                to="/contact" 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-background">Get In Touch</h3>
            <div className="space-y-2 md:space-y-3 text-background/80">
              <div className="text-sm md:text-base">+234 903 484 2430</div>
              <div className="text-sm md:text-base">contactneatrix@gmail.com</div>
              <div className="text-sm md:text-base">Lagos Only</div>
              <div className="text-sm md:text-base">Mon-Fri 7AM-6PM<br />Sat 8AM-4PM</div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-background/60 text-sm md:text-base text-center md:text-left">
              © 2024 Neatrix. All rights reserved.
            </p>
            <div className="flex space-x-4 md:space-x-6">
              <button className="text-background/60 hover:text-primary transition-colors text-sm md:text-base touch-manipulation">
                Privacy Policy
              </button>
              <button className="text-background/60 hover:text-primary transition-colors text-sm md:text-base touch-manipulation">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;