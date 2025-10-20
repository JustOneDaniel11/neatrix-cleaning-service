const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-hero text-primary sm:bg-clip-text sm:text-transparent">
              Our Services
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            From offices to homes, schools to specialty items - we provide comprehensive cleaning solutions 
            tailored to your specific needs with professional excellence.
          </p>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="bg-gradient-card rounded-2xl p-6 md:p-8 shadow-soft">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-card-foreground">
              Professional Cleaning Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Office Cleaning:</strong> Professional commercial cleaning for offices, buildings, and workspaces. Keep your business environment pristine and productive.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">House Cleaning:</strong> Residential cleaning services that make your home sparkle. Regular maintenance or deep cleaning - we've got you covered.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Post-Construction Cleaning:</strong> Specialized cleaning services for newly constructed or renovated spaces. Remove construction debris, dust, and prepare your space for occupancy.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Rug & Tiles Cleaning:</strong> Deep cleaning services for rugs, carpets, and tile surfaces. Restore the beauty and hygiene of your floor coverings.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Couch Cleaning:</strong> Professional upholstery cleaning for sofas, chairs, and furniture. Extend the life of your furniture with expert care.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Laundry Service:</strong> Complete laundry solutions with wash, dry, and fold services. Professional care for all your clothing and household items.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Dry Cleaning:</strong> Professional dry cleaning services for delicate fabrics and specialty items. Quality care for your valuable garments.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-card-foreground">Ironing Service:</strong> Professional ironing and pressing services to keep your clothes crisp and wrinkle-free. Perfect finishing for all garments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;