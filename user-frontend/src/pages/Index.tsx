import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { useSupabaseData } from "../contexts/SupabaseDataContext";

const Index = () => {
  try {
    const { state } = useSupabaseData();
    
    console.log("Index page rendering - Loading:", state.loading, "Error:", state.error);
    
    if (state.loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: 'blue',
          color: 'white',
          fontSize: '24px'
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: 'red',
          color: 'white',
          fontSize: '24px'
        }}>
          <div>Error: {state.error}</div>
        </div>
      );
    }

    return (
      <div>
        <Header />
        <Hero />
        <Services />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Index page error:', error);
    return (
      <div style={{ 
        backgroundColor: 'orange', 
        minHeight: '100vh', 
        padding: '20px',
        color: 'white',
        fontSize: '24px'
      }}>
        <h1>Index Page Error</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Check the console for more details.</p>
      </div>
    );
  }
};

export default Index;
