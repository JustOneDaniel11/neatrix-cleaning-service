import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Search,
  Tag,
  BookOpen,
  TrendingUp,
  Heart,
  Share2
} from "lucide-react";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", label: "All Posts", count: 12 },
    { id: "tips", label: "Cleaning Tips", count: 5 },
    { id: "fabric-care", label: "Fabric Care", count: 3 },
    { id: "stain-removal", label: "Stain Removal", count: 4 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Cleaning Tips for Nigerian Homes",
      excerpt: "Discover effective cleaning strategies specifically designed for Nigeria's climate and common household challenges.",
      content: "Living in Nigeria presents unique cleaning challenges due to our tropical climate, dust levels, and humidity. Here are 10 essential tips to keep your home spotless...",
      category: "tips",
      author: "Neatrix Team",
      date: "March 15, 2024",
      readTime: "5 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23dbeafe'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%232563eb'%3ECleaning Tips for Nigerian Homes%3C/text%3E%3C/svg%3E",
      tags: ["home cleaning", "tips", "nigeria"],
      featured: true,
      likes: 45,
      shares: 12
    },
    {
      id: 2,
      title: "How to Remove Common Stains from Nigerian Fabrics",
      excerpt: "Learn professional techniques for removing palm oil, tomato, and other common stains from traditional and modern fabrics.",
      content: "Nigerian cuisine and lifestyle can create unique staining challenges. From palm oil to tomato stains, here's how to tackle them effectively...",
      category: "stain-removal",
      author: "Sarah Adebayo",
      date: "March 10, 2024",
      readTime: "7 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23fef3c7'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%23d97706'%3EStain Removal Guide%3C/text%3E%3C/svg%3E",
      tags: ["stain removal", "fabrics", "laundry"],
      featured: false,
      likes: 32,
      shares: 8
    },
    {
      id: 3,
      title: "Caring for Traditional Nigerian Fabrics: Ankara, Aso-Oke & More",
      excerpt: "Preserve the beauty and longevity of your traditional fabrics with these expert care tips and washing techniques.",
      content: "Traditional Nigerian fabrics require special care to maintain their vibrant colors and intricate patterns. Here's your complete guide...",
      category: "fabric-care",
      author: "Kemi Ogundimu",
      date: "March 5, 2024",
      readTime: "6 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23dcfce7'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%2316a34a'%3ETraditional Fabric Care%3C/text%3E%3C/svg%3E",
      tags: ["fabric care", "traditional", "ankara"],
      featured: true,
      likes: 28,
      shares: 15
    },
    {
      id: 4,
      title: "Office Cleaning During Harmattan Season",
      excerpt: "Special cleaning strategies to combat dust and maintain a healthy office environment during Nigeria's dry season.",
      content: "Harmattan season brings unique challenges for office cleaning. Here's how to maintain a clean, healthy workspace during this dusty period...",
      category: "tips",
      author: "Neatrix Team",
      date: "February 28, 2024",
      readTime: "4 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f0f9ff'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%230284c7'%3EHarmattan Office Cleaning%3C/text%3E%3C/svg%3E",
      tags: ["office cleaning", "harmattan", "dust"],
      featured: false,
      likes: 19,
      shares: 6
    },
    {
      id: 5,
      title: "DIY Natural Cleaning Solutions Using Local Ingredients",
      excerpt: "Create effective, eco-friendly cleaning solutions using common Nigerian household items like lime, salt, and local herbs.",
      content: "You don't always need expensive chemicals to clean effectively. Discover how to make powerful cleaning solutions using ingredients from your kitchen...",
      category: "tips",
      author: "Funmi Adeyemi",
      date: "February 20, 2024",
      readTime: "8 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f0fdf4'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%2316a34a'%3EDIY Natural Cleaners%3C/text%3E%3C/svg%3E",
      tags: ["diy", "natural", "eco-friendly"],
      featured: false,
      likes: 41,
      shares: 22
    },
    {
      id: 6,
      title: "Removing Red Soil Stains: A Nigerian Household Challenge",
      excerpt: "Master the art of removing stubborn red soil stains from clothes, carpets, and upholstery with these proven techniques.",
      content: "Red soil stains are a common challenge in many parts of Nigeria. Here are professional techniques to remove these stubborn stains completely...",
      category: "stain-removal",
      author: "Neatrix Team",
      date: "February 15, 2024",
      readTime: "5 min read",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23fee2e2'/%3E%3Ctext x='200' y='125' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='16' fill='%23dc2626'%3ERed Soil Stain Removal%3C/text%3E%3C/svg%3E",
      tags: ["stain removal", "red soil", "laundry"],
      featured: false,
      likes: 35,
      shares: 11
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <section id="blog" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero text-primary sm:bg-clip-text sm:text-transparent">
              Cleaning Tips & Insights
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert advice, practical tips, and professional insights to help you maintain 
            spotless spaces. From stain removal hacks to fabric care guides, we share our 
            knowledge to empower you.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id 
                    ? "bg-gradient-primary shadow-medium" 
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {selectedCategory === "all" && searchTerm === "" && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-card-foreground mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Featured Articles
            </h3>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h4 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Posts Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              {selectedCategory === "all" ? "All Articles" : categories.find(c => c.id === selectedCategory)?.label}
            </h3>
            <div className="text-sm text-muted-foreground">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all group cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    />
                    {post.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h4 className="font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{post.author}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {post.shares}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary text-xs">
                        Read
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Stay Updated with Cleaning Tips
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest cleaning tips, stain removal hacks, 
              and exclusive offers delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button className="bg-gradient-primary shadow-medium hover:shadow-strong">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Blog;