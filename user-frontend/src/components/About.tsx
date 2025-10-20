import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Leaf, 
  Users, 
  Award, 
  Clock, 
  Heart,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  const values = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "Fully licensed, bonded, and insured for your peace of mind. Professional liability coverage protects your property."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Methods",
      description: "We use environmentally safe, non-toxic cleaning products that are safe for your family, pets, and the planet."
    },
    {
      icon: Users,
      title: "Trained Professionals",
      description: "Our team undergoes rigorous training and background checks. Experienced cleaners who care about quality."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "100% satisfaction guarantee. If you're not happy with our service, we'll make it right or refund your money."
    },
    {
      icon: Clock,
      title: "Reliable Service",
      description: "Punctual, consistent, and dependable. We respect your time and always arrive when scheduled."
    },
    {
      icon: Heart,
      title: "Customer-Focused",
      description: "Your satisfaction is our priority. We listen to your needs and customize our services accordingly."
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Customers" },
    { number: "5", label: "Years Experience" },
    { number: "10,000+", label: "Cleanings Completed" },
    { number: "4.9", label: "Average Rating" }
  ];

  const reasons = [
    "Professional-grade equipment and supplies",
    "Flexible scheduling including weekends",
    "Customizable cleaning checklists",
    "Emergency and same-day service available",
    "Competitive pricing with no hidden fees",
    "Local Nigerian business supporting the community",
    "Multi-language customer support",
    "Advanced booking and tracking system"
  ];



  return (
    <section id="about" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero text-primary sm:bg-clip-text sm:text-transparent">
              About Neatrix
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Nigeria's premier cleaning service company, dedicated to transforming spaces and 
            exceeding expectations. We combine professional expertise with eco-friendly practices 
            to deliver exceptional results every time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-card-foreground mb-6">Our Story</h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Founded in 2019, Neatrix began with a simple mission: to provide Nigerian 
                      families and businesses with reliable, professional cleaning services that 
                      they can trust. What started as a small local business has grown into one 
                      of Nigeria's most trusted cleaning service providers.
                    </p>
                    <p>
                      We understand the unique challenges of maintaining clean spaces in Nigeria's 
                      climate and environment. Our team has developed specialized techniques and 
                      uses the right products to tackle dust, humidity, and local cleaning challenges 
                      effectively.
                    </p>
                    <p>
                      Today, we're proud to serve customers across Lagos, Abuja, Port Harcourt, 
                      and surrounding areas, with a team of over 50 trained professionals who 
                      share our commitment to excellence.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-primary/10 rounded-lg p-6">
                    <h4 className="font-semibold text-card-foreground mb-3">Our Mission</h4>
                    <p className="text-muted-foreground text-sm">
                      To provide exceptional cleaning services that enhance the quality of life 
                      for our customers while promoting environmental sustainability and supporting 
                      local communities.
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-6">
                    <h4 className="font-semibold text-card-foreground mb-3">Our Vision</h4>
                    <p className="text-muted-foreground text-sm">
                      To be Nigeria's leading cleaning service provider, known for innovation, 
                      reliability, and exceptional customer satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Why Choose Neatrix?
            </span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h4 className="text-xl font-semibold text-card-foreground mb-3">{value.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reasons to Choose Us */}
        <div className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-3xl font-bold text-center text-card-foreground mb-8">
                What Sets Us Apart
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{reason}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eco-Friendly Focus */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-soft">
            <CardContent className="p-8 lg:p-12 text-center">
              <Leaf className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-green-800 mb-6">Eco-Friendly Commitment</h3>
              <div className="max-w-3xl mx-auto space-y-4 text-green-700">
                <p>
                  We're committed to protecting Nigeria's environment while keeping your spaces clean. 
                  Our eco-friendly approach includes:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="text-left space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Biodegradable cleaning products</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Non-toxic, family-safe formulas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Minimal packaging waste</span>
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Energy-efficient equipment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Water conservation practices</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Sustainable business practices</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-card-foreground mb-4">
            Ready to Experience the Neatrix Difference?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied customers who trust Neatrix for their cleaning needs. 
            Get your free quote today and see why we're Nigeria's preferred cleaning service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary shadow-medium hover:shadow-strong"
              onClick={() => {
                navigate('/login', { state: { redirectTo: '/dashboard/support' } });
              }}
            >
              Get Free Quote
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                window.location.href = "tel:+2349034842430";
              }}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;