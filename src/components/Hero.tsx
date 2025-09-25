import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Shield, UserPlus, LayoutDashboard, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseData } from "@/contexts/SupabaseDataContext";
import heroImage from "@/assets/hero-cleaning.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { state } = useSupabaseData();

  return (
    <section id="home" className="pt-20 pb-16 bg-gradient-to-br from-background via-secondary/30 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-medium text-accent-dark">5-Star Rated Service</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Sparkling Clean
                </span>
                <br />
                <span className="text-foreground">
                  Spaces, Every Time
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Professional cleaning services for offices, homes, schools, and more. 
                Trust Neatrix to make your space shine with our expert team and eco-friendly approach.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary shadow-medium hover:shadow-strong transition-all"
                onClick={() => navigate('/signup')}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              {state.isAuthenticated ? (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/5"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/5"
                  onClick={() => navigate('/login')}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Eco-Friendly Products</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="text-sm text-muted-foreground">500+ Happy Clients</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="Professional cleaning team at work" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-medium border border-border">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">100% Satisfaction</div>
                  <div className="text-sm text-muted-foreground">Guaranteed Results</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;