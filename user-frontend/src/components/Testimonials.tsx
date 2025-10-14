import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ExternalLink, Filter, Calendar, MapPin, ThumbsUp, MessageCircle } from "lucide-react";
import { useState } from "react";

const Testimonials = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showGoogleReviews, setShowGoogleReviews] = useState(false);

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Tech Solutions Inc.",
      role: "Office Manager",
      rating: 5,
      text: "Neatrix has transformed our office environment. Their attention to detail is exceptional, and our employees love coming to work in such a clean, fresh space.",
      avatar: "SJ",
      service: "office",
      date: "2024-01-10",
      location: "Victoria Island, Lagos",
      verified: true,
      source: "website"
    },
    {
      name: "Michael Chen",
      company: "Residential Customer",
      role: "Homeowner",
      rating: 5,
      text: "I've been using Neatrix for monthly deep cleaning for over a year. They're reliable, thorough, and always exceed my expectations. Highly recommended!",
      avatar: "MC",
      service: "house",
      date: "2024-01-08",
      location: "Lekki, Lagos",
      verified: true,
      source: "website"
    },
    {
      name: "Lisa Rodriguez",
      company: "Sunshine Elementary",
      role: "Principal",
      rating: 5,
      text: "The safety and cleanliness of our school is paramount. Neatrix provides exceptional service that gives us peace of mind and creates a healthy learning environment.",
      avatar: "LR",
      service: "school",
      date: "2024-01-05",
      location: "Ikeja, Lagos",
      verified: true,
      source: "website"
    },
    {
      name: "Adebayo Ogundimu",
      company: "Residential Customer",
      role: "Business Executive",
      rating: 5,
      text: "Outstanding service! They cleaned my 4-bedroom apartment perfectly. The team was professional, punctual, and used eco-friendly products. Will definitely book again.",
      avatar: "AO",
      service: "house",
      date: "2024-01-12",
      location: "Ikoyi, Lagos",
      verified: true,
      source: "website"
    },
    {
      name: "Fatima Abdullahi",
      company: "Kano State University",
      role: "Lecturer",
      rating: 5,
      text: "Their dry cleaning service is exceptional. My delicate fabrics are always handled with care and returned in perfect condition. Highly professional team.",
      avatar: "FA",
      service: "dry-cleaning",
      date: "2024-01-09",
      location: "Surulere, Lagos",
      verified: true,
      source: "website"
    },
    {
      name: "Chinedu Okwu",
      company: "Okwu & Associates",
      role: "Law Firm Partner",
      rating: 5,
      text: "We've been using Neatrix for our law firm for 6 months. Their attention to detail and professionalism is unmatched. Our clients always comment on how clean our office is.",
      avatar: "CO",
      service: "office",
      date: "2024-01-07",
      location: "Lagos Island, Lagos",
      verified: true,
      source: "website"
    }
  ];

  const googleReviews = [
    {
      name: "Blessing Eze",
      rating: 5,
      text: "Amazing cleaning service! They transformed my home completely. Very professional and affordable. I'm now a regular customer.",
      avatar: "BE",
      date: "2024-01-11",
      location: "Ajah, Lagos",
      verified: true,
      source: "google",
      helpful: 12,
      service: "house"
    },
    {
      name: "Tunde Adebayo",
      rating: 5,
      text: "Best cleaning service in Lagos! They cleaned my office building and the results were outstanding. Highly recommend to everyone.",
      avatar: "TA",
      date: "2024-01-06",
      location: "Maryland, Lagos",
      verified: true,
      source: "google",
      helpful: 8,
      service: "office"
    },
    {
      name: "Amina Hassan",
      rating: 4,
      text: "Very good service. The team was punctual and thorough. Only minor issue was scheduling, but overall excellent experience.",
      avatar: "AH",
      date: "2024-01-04",
      location: "Gbagada, Lagos",
      verified: true,
      source: "google",
      helpful: 5,
      service: "house"
    }
  ];

  const allReviews = showGoogleReviews ? [...testimonials, ...googleReviews] : testimonials;

  const filteredReviews = selectedFilter === 'all' 
    ? allReviews 
    : allReviews.filter(review => review.service === selectedFilter);

  const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  const totalReviews = allReviews.length;

  const serviceFilters = [
    { id: 'all', name: 'All Services', count: allReviews.length },
    { id: 'house', name: 'House Cleaning', count: allReviews.filter(r => r.service === 'house').length },
    { id: 'office', name: 'Office Cleaning', count: allReviews.filter(r => r.service === 'office').length },
    { id: 'dry-cleaning', name: 'Dry Cleaning', count: allReviews.filter(r => r.service === 'dry-cleaning').length },
    { id: 'school', name: 'School Cleaning', count: allReviews.filter(r => r.service === 'school').length }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Don't just take our word for it. Here's what our satisfied customers have to say about our cleaning services.
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-foreground mr-2">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalReviews} reviews
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGoogleReviews(!showGoogleReviews)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showGoogleReviews 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                Include Google Reviews
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {serviceFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
            >
              <Filter className="w-4 h-4" />
              {filter.name}
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReviews.map((review, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-4">
                      {review.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{review.name}</h3>
                      {'role' in review && (
                        <>
                          <p className="text-sm text-muted-foreground">{review.role}</p>
                          <p className="text-sm text-muted-foreground">{review.company}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {review.verified && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Verified
                      </div>
                    )}
                    {review.source === 'google' && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Google
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                  <p className="text-muted-foreground italic pl-6">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {review.location}
                  </div>
                  
                  {'helpful' in review && (
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.helpful} helpful
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Google Reviews CTA */}
        <div className="text-center mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Love our service? Share your experience!
          </h3>
          <p className="text-muted-foreground mb-4">
            Help others discover Neatrix by leaving a review on Google
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://g.page/r/your-google-business-id/review"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Leave Google Review
            </a>
            <button 
              onClick={() => {
                const element = document.getElementById('contact');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Share Your Experience
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to experience the Neatrix difference?
          </p>
          <button 
            onClick={() => {
              const element = document.getElementById('contact');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Your Free Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;