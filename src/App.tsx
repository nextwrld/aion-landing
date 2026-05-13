import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisProvider } from "./hooks/useLenis";
import { I18nProvider } from "./i18n/I18nProvider";
import Navbar from "./components/Navbar";
import BackToTop from "./components/BackToTop";
import HeroSection from "./sections/HeroSection";
import PainPointsSection from "./sections/PainPointsSection";
import BenefitsSection from "./sections/BenefitsSection";
import FrontDeskSection from "./sections/FrontDeskSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import FAQSection from "./sections/FAQSection";
import MVPSection from "./sections/MVPSection";
import LeadFormSection from "./sections/LeadFormSection";
import Footer from "./sections/Footer";

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <PainPointsSection />
        <BenefitsSection />
        <FrontDeskSection />
        <HowItWorksSection />
        <FAQSection />
        <MVPSection />
        <LeadFormSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <LenisProvider>
        <AppContent />
      </LenisProvider>
    </I18nProvider>
  );
}

export default App;
