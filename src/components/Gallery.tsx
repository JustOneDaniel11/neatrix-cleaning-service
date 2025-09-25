import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Star,
  MapPin,
  Calendar,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "office", label: "Office Cleaning" },
    { id: "residential", label: "House Cleaning" },
    { id: "commercial", label: "Commercial" },
    { id: "team", label: "Our Team" }
  ];

  const galleryItems = [
    {
      id: 1,
      category: "office",
      type: "before-after",
      title: "Corporate Office Transformation",
      location: "Victoria Island, Lagos",
      beforeImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EBefore: Cluttered Office%3C/text%3E%3C/svg%3E",
      afterImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dbeafe'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%232563eb'%3EAfter: Pristine Office%3C/text%3E%3C/svg%3E",
      description: "Complete office deep cleaning and organization",
      rating: 5,
      date: "March 2024"
    },
    {
      id: 2,
      category: "residential",
      type: "before-after",
      title: "Family Home Deep Clean",
      location: "Lekki, Lagos",
      beforeImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fef3c7'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%23d97706'%3EBefore: Dusty Living Room%3C/text%3E%3C/svg%3E",
      afterImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dcfce7'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%2316a34a'%3EAfter: Spotless Living Room%3C/text%3E%3C/svg%3E",
      description: "Post-renovation cleaning and sanitization",
      rating: 5,
      date: "February 2024"
    },
    {
      id: 3,
      category: "commercial",
      type: "before-after",
      title: "Restaurant Kitchen Sanitization",
      location: "Ikeja, Lagos",
      beforeImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fee2e2'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%23dc2626'%3EBefore: Greasy Kitchen%3C/text%3E%3C/svg%3E",
      afterImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f9ff'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%230284c7'%3EAfter: Sanitized Kitchen%3C/text%3E%3C/svg%3E",
      description: "Commercial kitchen deep cleaning and sanitization",
      rating: 5,
      date: "March 2024"
    },
    {
      id: 4,
      category: "team",
      type: "team-photo",
      title: "Professional Cleaning Team",
      location: "Lagos Office",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e0f2fe'/%3E%3Cg%3E%3Ccircle cx='150' cy='120' r='25' fill='%230277bd'/%3E%3Ccircle cx='200' cy='120' r='25' fill='%230277bd'/%3E%3Ccircle cx='250' cy='120' r='25' fill='%230277bd'/%3E%3Ctext x='200' y='200' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%230277bd'%3ENeatrix Professional Team%3C/text%3E%3C/g%3E%3C/svg%3E",
      description: "Our certified cleaning professionals ready to serve",
      teamSize: 8
    },
    {
      id: 5,
      category: "residential",
      type: "before-after",
      title: "Bathroom Restoration",
      location: "Abuja",
      beforeImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EBefore: Stained Bathroom%3C/text%3E%3C/svg%3E",
      afterImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f9ff'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%230284c7'%3EAfter: Sparkling Bathroom%3C/text%3E%3C/svg%3E",
      description: "Complete bathroom deep cleaning and tile restoration",
      rating: 5,
      date: "January 2024"
    },
    {
      id: 6,
      category: "team",
      type: "team-photo",
      title: "Equipment & Training",
      location: "Training Center",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0fdf4'/%3E%3Cg%3E%3Crect x='100' y='100' width='60' height='80' fill='%2316a34a' rx='5'/%3E%3Crect x='180' y='100' width='60' height='80' fill='%2316a34a' rx='5'/%3E%3Crect x='260' y='100' width='60' height='80' fill='%2316a34a' rx='5'/%3E%3Ctext x='200' y='220' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2316a34a'%3EProfessional Equipment%3C/text%3E%3C/g%3E%3C/svg%3E",
      description: "State-of-the-art cleaning equipment and ongoing training",
      teamSize: 12
    }
  ];

  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Our Work Gallery
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See the transformation we bring to every space. From cluttered offices to pristine homes, 
            our before-and-after gallery showcases the quality and attention to detail that sets us apart.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentImageIndex(0);
              }}
              className={activeCategory === category.id 
                ? "bg-gradient-primary shadow-medium" 
                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Featured Image Carousel */}
        {filteredItems.length > 0 && (
          <div className="mb-16">
            <Card className="bg-gradient-card border-0 shadow-soft overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {filteredItems[currentImageIndex].type === "before-after" ? (
                    <div className="grid md:grid-cols-2">
                      <div className="relative">
                        <img 
                          src={filteredItems[currentImageIndex].beforeImage} 
                          alt="Before cleaning"
                          className="w-full h-64 md:h-80 object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                          Before
                        </Badge>
                      </div>
                      <div className="relative">
                        <img 
                          src={filteredItems[currentImageIndex].afterImage} 
                          alt="After cleaning"
                          className="w-full h-64 md:h-80 object-cover"
                        />
                        <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                          After
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={filteredItems[currentImageIndex].image} 
                        alt={filteredItems[currentImageIndex].title}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      {filteredItems[currentImageIndex].teamSize && (
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                          <Users className="w-3 h-3 mr-1" />
                          {filteredItems[currentImageIndex].teamSize} Team Members
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {filteredItems.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Image Info */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-card-foreground mb-2">
                        {filteredItems[currentImageIndex].title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {filteredItems[currentImageIndex].description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {filteredItems[currentImageIndex].location}
                        </div>
                        {filteredItems[currentImageIndex].date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {filteredItems[currentImageIndex].date}
                          </div>
                        )}
                        {filteredItems[currentImageIndex].rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(filteredItems[currentImageIndex].rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {currentImageIndex + 1} of {filteredItems.length}
                      </div>
                      <div className="flex gap-2">
                        {filteredItems.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all cursor-pointer group"
              onClick={() => setCurrentImageIndex(index)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  {item.type === "before-after" ? (
                    <div className="relative">
                      <img 
                        src={item.afterImage} 
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                        Before/After
                      </Badge>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
                        Team
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-card-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.location}</span>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-card-foreground mb-4">
            Ready to See Your Space Transformed?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our gallery of satisfied customers. Book your cleaning service today and 
            experience the Neatrix difference for yourself.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary shadow-medium hover:shadow-strong"
            onClick={() => navigate('/signup')}
          >
            Book Your Cleaning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;