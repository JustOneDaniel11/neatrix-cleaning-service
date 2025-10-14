import Header from "@/components/Header";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <Blog />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;