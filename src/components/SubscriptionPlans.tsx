import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar, 
  CalendarDays, 
  CalendarRange,
  Star,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const plans = [
    {
      icon: Calendar,
      title: "Weekly Plan",
      subtitle: "Perfect for busy households",
      originalPrice: "₦100,000",
      discountedPrice: "₦85,000",
      savings: "15% OFF",
      period: "/month",
      description: "Regular weekly cleaning to keep your space consistently pristine.",
      features: [
        "4 cleaning sessions per month",
        "All rooms and common areas",
        "Kitchen and bathroom deep clean",
        "Laundry folding included",
        "Priority booking",
        "Dedicated cleaning team",
        "Eco-friendly products",
        "Satisfaction guarantee"
      ],
      popular: false,
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: CalendarDays,
      title: "Bi-Weekly Plan",
      subtitle: "Most popular choice",
      originalPrice: "₦60,000",
      discountedPrice: "₦48,000",
      savings: "20% OFF",
      period: "/month",
      description: "Ideal balance of cleanliness and affordability with bi-weekly service.",
      features: [
        "2 cleaning sessions per month",
        "Complete home cleaning",
        "Kitchen and bathroom focus",
        "Flexible scheduling",
        "Professional equipment",
        "Insured and bonded staff",
        "Quality assurance",
        "24/7 customer support"
      ],
      popular: true,
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: CalendarRange,
      title: "Monthly Plan",
      subtitle: "Budget-friendly option",
      originalPrice: "₦35,000",
      discountedPrice: "₦28,000",
      savings: "20% OFF",
      period: "/month",
      description: "Monthly deep cleaning perfect for maintaining a fresh environment.",
      features: [
        "1 comprehensive cleaning per month",
        "Deep cleaning focus",
        "All areas covered",
        "Stain removal included",
        "Window cleaning",
        "Appliance cleaning",
        "Move furniture cleaning",
        "Post-cleaning inspection"
      ],
      popular: false,
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ];



  return (
    <section id="subscription-plans" className="py-20 bg-gradient-to-br from-secondary/10 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Subscription Plans
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Save more with our flexible subscription plans. Regular cleaning services 
            with significant discounts and priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-gradient-card border-0 shadow-soft hover:shadow-strong transition-all duration-300 group ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl text-card-foreground">{plan.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                    <Badge variant="secondary" className="text-xs">{plan.savings}</Badge>
                  </div>
                  <div className="flex items-baseline justify-center mt-2">
                    <span className="text-4xl font-bold text-primary">{plan.discountedPrice}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground text-sm leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm text-card-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-primary' : 'bg-gradient-secondary'} shadow-medium hover:shadow-strong group`}
                  onClick={() => navigate('/signup')}
                >
                  Choose Plan
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include free consultation and customizable service options
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const message = "Hello! I'm interested in a custom cleaning plan. Can you help me create a personalized package?";
                const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
            >
              WhatsApp for Custom Plan
            </Button>
            <Button 
              size="lg"
              onClick={() => {
                window.location.href = "tel:+2348031234567";
              }}
              className="bg-gradient-primary shadow-medium hover:shadow-strong"
            >
              Call for Custom Plan
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const subject = "Custom Cleaning Plan Request";
                const body = "Hello,\n\nI'm interested in creating a custom cleaning plan that fits my specific needs. Please contact me to discuss the options and pricing.\n\nThank you!";
                const mailtoUrl = `mailto:info@neatrix.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoUrl;
              }}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Email for Custom Plan
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;