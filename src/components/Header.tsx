import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useSupabaseData();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close mobile menu after navigation
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Neatrix
            </span>
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
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/gallery" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/faq" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                to="/blog" 
                className="text-foreground hover:text-primary transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-foreground hover:text-primary transition-colors text-left"
              >
                Contact
              </button>
              <div className="flex flex-col space-y-2 pt-4">
                {state.isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-gradient-primary w-full"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-gradient-primary w-full"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;