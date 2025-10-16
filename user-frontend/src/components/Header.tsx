import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import { useState } from "react";

const Header = () => {
  const { state } = useSupabaseData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/Neatrix_logo%20transparent.png"
              alt="Neatrix Logo"
              className="w-6 h-6 md:w-24 md:h-24 rounded object-cover"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Services
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              About
            </Link>
            <Link 
              to="/gallery" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Gallery
            </Link>
            <Link 
              to="/faq" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              FAQ
            </Link>
            <Link 
              to="/blog" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {state.isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-primary"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-gradient-primary"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleMobileMenu}
              className="p-3 h-12 w-12 touch-manipulation"
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-40">
            <nav className="container mx-auto px-4 py-6 space-y-2 safe-area-inset-bottom">
              <Link 
                to="/" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                to="/gallery" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                Gallery
              </Link>
              <Link 
                to="/faq" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                FAQ
              </Link>
              <Link 
                to="/blog" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="block text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 touch-manipulation"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-6 space-y-3 border-t border-border mt-4">
                {state.isAuthenticated ? (
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="w-full bg-gradient-primary h-12 text-base font-medium touch-manipulation"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full h-12 text-base font-medium touch-manipulation"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={closeMobileMenu}>
                      <Button 
                        variant="default" 
                        size="lg" 
                        className="w-full bg-gradient-primary h-12 text-base font-medium touch-manipulation"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;