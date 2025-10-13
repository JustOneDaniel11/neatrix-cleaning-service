import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";

const Header = () => {
  const { state } = useSupabaseData();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </Link>
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

        </div>
      </div>
    </header>
  );
};

export default Header;