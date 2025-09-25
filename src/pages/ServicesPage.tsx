import Header from "@/components/Header";
import Services from "@/components/Services";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Cleaning Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional cleaning services tailored to your needs. From residential homes to commercial offices, 
              we provide comprehensive cleaning solutions with eco-friendly products and experienced staff.
            </p>
          </div>
        </div>
        <Services />
        <SubscriptionPlans />
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;