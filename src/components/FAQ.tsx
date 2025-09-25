import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  Shield,
  Leaf,
  CreditCard,
  MapPin
} from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "General Services",
      icon: Clock,
      faqs: [
        {
          question: "What cleaning services do you offer?",
          answer: "We offer comprehensive cleaning services including house cleaning, office cleaning, commercial cleaning, dry cleaning, laundry services, ironing, and express cleaning. We also provide specialized services like post-construction cleanup, deep cleaning, and sanitization."
        },
        {
          question: "Do you work weekends and holidays?",
          answer: "Yes, we work 7 days a week including weekends and most holidays. We understand that cleaning needs don't follow a 9-5 schedule, so we offer flexible scheduling to accommodate your needs. Weekend and holiday services may have different rates."
        },
        {
          question: "How far in advance do I need to book?",
          answer: "For regular cleaning services, we recommend booking at least 24-48 hours in advance. However, we also offer same-day and emergency cleaning services based on availability. During peak seasons, we recommend booking a week in advance."
        },
        {
          question: "Do you provide cleaning supplies and equipment?",
          answer: "Yes, we bring all necessary cleaning supplies, equipment, and tools. We use professional-grade, eco-friendly products that are safe for your family and pets. If you prefer us to use your specific products, we're happy to accommodate that request."
        }
      ]
    },
    {
      title: "Eco-Friendly & Safety",
      icon: Leaf,
      faqs: [
        {
          question: "Do you use eco-friendly detergents?",
          answer: "Absolutely! We're committed to using environmentally safe, biodegradable cleaning products that are non-toxic and safe for children, pets, and the environment. Our eco-friendly approach doesn't compromise on cleaning effectiveness."
        },
        {
          question: "Are your cleaning products safe for children and pets?",
          answer: "Yes, all our cleaning products are non-toxic, hypoallergenic, and safe for children and pets. We use plant-based formulas that effectively clean without harmful chemicals. Your family's safety is our top priority."
        },
        {
          question: "What happens if fabric gets damaged during cleaning?",
          answer: "We're fully insured and bonded to protect against any accidental damage. In the rare event that damage occurs, we have comprehensive insurance coverage and will work with you to resolve the issue promptly and fairly. We also conduct thorough inspections before and after cleaning."
        },
        {
          question: "Are your staff background checked?",
          answer: "Yes, all our team members undergo thorough background checks, reference verification, and professional training before joining our team. We also provide ongoing training to ensure consistent, high-quality service."
        }
      ]
    },
    {
      title: "Pricing & Payment",
      icon: CreditCard,
      faqs: [
        {
          question: "How do you calculate pricing?",
          answer: "Our pricing is based on factors including the size of the space, type of cleaning required, frequency of service, and specific requirements. We offer transparent, upfront pricing with no hidden fees. Contact us for a free, personalized quote."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept multiple payment methods including cash, bank transfers, debit/credit cards, USSD payments, and mobile money. We also integrate with local payment gateways like Paystack and Flutterwave for secure online payments."
        },
        {
          question: "Do you offer discounts for regular customers?",
          answer: "Yes! We offer attractive discounts for weekly, bi-weekly, and monthly cleaning packages. Regular customers also enjoy priority booking, loyalty rewards, and special promotional offers throughout the year."
        },
        {
          question: "Is there a cancellation fee?",
          answer: "We understand that plans change. You can cancel or reschedule your appointment up to 24 hours before the scheduled time without any fee. Cancellations with less than 24 hours notice may incur a small cancellation fee."
        }
      ]
    },
    {
      title: "Service Areas & Logistics",
      icon: MapPin,
      faqs: [
        {
          question: "Which areas do you serve?",
          answer: "We proudly serve Lagos, Abuja, Port Harcourt, and surrounding areas. Our service areas include Victoria Island, Lekki, Ikeja, Surulere, Yaba, Wuse, Garki, Maitama, GRA Port Harcourt, and many other locations. Contact us to confirm service availability in your area."
        },
        {
          question: "Do you offer pick-up and delivery services?",
          answer: "Yes, we offer convenient pick-up and delivery services for dry cleaning and laundry. You can schedule collection and drop-off times that work for your schedule. We also provide real-time tracking so you know exactly when your items will be ready."
        },
        {
          question: "How long does a typical cleaning take?",
          answer: "Cleaning time varies based on the size and condition of the space. A standard 2-3 bedroom apartment typically takes 2-4 hours, while office cleaning depends on square footage and requirements. We'll provide an estimated timeframe when you book."
        },
        {
          question: "Can I track my laundry/dry cleaning order?",
          answer: "Yes! We provide order tracking for all pick-up and delivery services. You'll receive SMS updates on your order status including 'Picked Up', 'In Progress', 'Ready for Delivery', and 'Delivered'. You can also check your order status through our customer portal."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      description: "Quick responses via WhatsApp",
      action: "Chat Now",
      color: "bg-green-500",
      onClick: () => {
        const message = "Hello! I have a question about your cleaning services. Can you help me?";
        const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "+234 803 123 4567",
      action: "Call Now",
      color: "bg-blue-500",
      onClick: () => {
        window.location.href = "tel:+2348031234567";
      }
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "info@neatrix.ng",
      action: "Send Email",
      color: "bg-purple-500",
      onClick: () => {
        const subject = "Question about Neatrix Cleaning Services";
        const body = "Hello,\n\nI have a question about your cleaning services. Please get back to me at your earliest convenience.\n\nThank you!";
        const mailtoUrl = `mailto:info@neatrix.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      }
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our cleaning services, policies, and procedures. 
            Can't find what you're looking for? Contact us directly for personalized assistance.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8 mb-16">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isOpen = openItems.includes(globalIndex);
                    
                    return (
                      <div key={faqIndex} className="border border-border rounded-lg overflow-hidden">
                        <button
                          className="w-full px-6 py-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between"
                          onClick={() => toggleItem(globalIndex)}
                        >
                          <span className="font-semibold text-card-foreground pr-4">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-background/50">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Contact */}
        <Card className="bg-gradient-card border-0 shadow-soft mb-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our friendly customer service team is here to help. Reach out through your preferred 
              communication method and we'll get back to you promptly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="bg-background border-0 shadow-soft hover:shadow-medium transition-all group cursor-pointer" onClick={method.onClick}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-card-foreground mb-2">{method.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        method.onClick();
                      }}
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-card-foreground mb-4">
            Need Immediate Assistance?
          </h3>
          <p className="text-muted-foreground mb-6">
            For urgent cleaning needs or emergency services, call us directly at{" "}
            <span className="font-semibold text-primary">+234 803 123 4567</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary shadow-medium hover:shadow-strong"
              onClick={() => {
                window.location.href = "tel:+2348031234567";
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
              onClick={() => {
                const message = "Hello! I need immediate assistance with cleaning services. Can you help me?";
                const whatsappUrl = `https://wa.me/2348031234567?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Chat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;