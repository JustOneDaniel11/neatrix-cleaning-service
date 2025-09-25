import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Home, 
  GraduationCap, 
  Shirt, 
  ArrowRight,
  CheckCircle,
  Zap,
  Waves,
  Droplets,
  HardHat,
  Sofa,
  Grid3X3
} from "lucide-react";
import officeImage from "@/assets/office-cleaning.jpg";
import houseImage from "@/assets/house-cleaning.jpg";
import schoolImage from "@/assets/school-cleaning.jpg";

const Services = () => {
  const services = [
    {
      icon: Building2,
      title: "Office Cleaning",
      description: "Professional commercial cleaning for offices, buildings, and workspaces. Keep your business environment pristine and productive.",
      image: officeImage,
      features: ["Daily maintenance", "Deep sanitization", "Window cleaning", "Carpet care", "Restroom cleaning", "Kitchen areas"],
      price: "From ₦45,000/week",
      detailedPricing: "Small office: ₦45,000/week • Medium office: ₦75,000/week • Large office: ₦120,000/week"
    },
    {
      icon: Home,
      title: "House Cleaning",
      description: "Residential cleaning services that make your home sparkle. Regular maintenance or deep cleaning - we've got you covered.",
      image: houseImage,
      features: ["Regular maintenance", "Deep cleaning", "Move-in/out", "Post-construction", "Kitchen & bathrooms", "Laundry folding"],
      price: "From ₦25,000/visit",
      detailedPricing: "1-2 bedrooms: ₦25,000 • 3-4 bedrooms: ₦40,000 • 5+ bedrooms: ₦60,000"
    },
    {
      icon: HardHat,
      title: "Post-Construction Cleaning",
      description: "Specialized cleaning services for newly constructed or renovated spaces. Remove construction debris, dust, and prepare your space for occupancy.",
      image: null,
      features: ["Debris removal", "Dust elimination", "Window cleaning", "Floor polishing", "Paint splatter removal", "Final inspection"],
      price: "From ₦55,000/project",
      detailedPricing: "Small project: ₦55,000 • Medium project: ₦85,000 • Large project: ₦150,000"
    },
    {
      icon: Grid3X3,
      title: "Rug & Tiles Cleaning",
      description: "Deep cleaning services for rugs, carpets, and tile surfaces. Restore the beauty and hygiene of your floor coverings.",
      image: null,
      features: ["Deep steam cleaning", "Stain removal", "Odor elimination", "Grout cleaning", "Protective treatment", "Quick drying"],
      price: "From ₦8,000/sqm",
      detailedPricing: "Rugs: ₦8,000/sqm • Tiles: ₦6,000/sqm • Grout cleaning: ₦3,000/sqm"
    },
    {
      icon: Sofa,
      title: "Couch Cleaning",
      description: "Professional upholstery cleaning for sofas, chairs, and furniture. Extend the life of your furniture with expert care.",
      image: null,
      features: ["Fabric cleaning", "Leather treatment", "Stain removal", "Odor elimination", "Fabric protection", "Quick drying"],
      price: "From ₦12,000/piece",
      detailedPricing: "2-seater: ₦12,000 • 3-seater: ₦18,000 • Sectional: ₦25,000 • Chairs: ₦8,000"
    },
    {
      icon: Droplets,
      title: "Laundry Service",
      description: "Complete laundry solutions with wash, dry, and fold services. Professional care for all your clothing and household items.",
      image: null,
      features: ["Wash & fold", "Delicate care", "Stain treatment", "Fabric softening", "Pick-up & delivery", "Same-day service"],
      price: "From ₦2,000/kg",
      detailedPricing: "Regular wash: ₦2,000/kg • Delicate items: ₦3,000/kg • Express service: ₦3,500/kg"
    },
    {
      icon: Shirt,
      title: "Dry Cleaning",
      description: "Professional dry cleaning services for delicate fabrics and specialty items. Quality care for your valuable garments.",
      image: null,
      features: ["Garment care", "Stain removal", "Alterations", "Same-day service", "Leather cleaning", "Wedding dress care"],
      price: "From ₦3,500/item",
      detailedPricing: "Shirts: ₦3,500 • Suits: ₦8,000 • Dresses: ₦5,500 • Coats: ₦12,000"
    },
    {
      icon: Waves,
      title: "Ironing Service",
      description: "Professional ironing and pressing services to keep your clothes crisp and wrinkle-free. Perfect finishing for all garments.",
      image: null,
      features: ["Professional pressing", "Steam ironing", "Crease setting", "Delicate handling", "Hanging service", "Quick turnaround"],
      price: "From ₦800/item",
      detailedPricing: "Shirts: ₦800 • Trousers: ₦1,000 • Dresses: ₦1,200 • Suits: ₦2,500"
    },
    {
      icon: Zap,
      title: "Express Service",
      description: "Fast-track cleaning and laundry services for urgent needs. Same-day or next-day delivery available.",
      image: null,
      features: ["Same-day service", "2-hour express", "Priority handling", "Emergency cleaning", "Weekend availability", "Rush delivery"],
      price: "From ₦5,000 + 50% surcharge",
      detailedPricing: "2-hour express: +100% • Same-day: +50% • Next-day: +25%"
    }
  ];

  return (
    <section id="services" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From offices to homes, schools to specialty items - we provide comprehensive cleaning solutions 
            tailored to your specific needs with professional excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all group">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-card-foreground">{service.title}</CardTitle>
                    <div className="text-sm font-semibold text-primary">{service.price}</div>
                  </div>
                </div>
                
                {service.image && (
                  <div className="rounded-lg overflow-hidden mb-4">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-sm text-card-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {service.detailedPricing && (
                  <div className="bg-secondary/30 rounded-lg p-3 border border-secondary">
                    <h4 className="text-sm font-semibold text-card-foreground mb-2">Pricing Details:</h4>
                    <p className="text-xs text-muted-foreground">{service.detailedPricing}</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group"
                  onClick={() => {
                    const message = `Hello! I'd like to get a quote for ${service.title}. ${service.description} Can you provide me with pricing details?`;
                    const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-gradient-primary shadow-medium hover:shadow-strong"
            onClick={() => {
              const message = "Hello! I need a custom quote for cleaning services. I have specific requirements that may not fit your standard packages. Can we discuss my needs and get a personalized quote?";
              const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            Get Custom Quote
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;