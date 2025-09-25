import { Sparkles, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <span className="text-2xl font-bold">Neatrix</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              Professional cleaning services that make your space sparkle. 
              Trusted by hundreds of satisfied customers.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-background/60 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Services</h3>
            <div className="space-y-3">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Company</h3>
            <div className="space-y-3">
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
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block text-background/80 hover:text-primary transition-colors text-left"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-background">Get In Touch</h3>
            <div className="space-y-3 text-background/80">
              <div>+234 803 123 4567</div>
              <div>hello@neatrix.com</div>
              <div>Lagos, Abuja, Port Harcourt & Surrounding Areas</div>
              <div>Mon-Fri 7AM-6PM<br />Sat 8AM-4PM</div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              © 2024 Neatrix Cleaning Services. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-background/60 hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-background/60 hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-background/60 hover:text-primary transition-colors"
              >
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;