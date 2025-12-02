import Hero from "@/components/Hero";
import Navigation from "@/components/Navigations";
import SocialProof from "@/components/SocialProof";
import ProblemSection from "@/components/ProblemSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/TestimonialSection";

const App = () => (
  <>
    <Navigation />
    <Hero />
    <SocialProof/>
    <ProblemSection />
    <FeaturesSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <FAQ />
    <Footer />
  </>
);

export default App;
