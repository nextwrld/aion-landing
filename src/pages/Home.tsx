import HeroSection from '../sections/HeroSection'
import PainPointsSection from '../sections/PainPointsSection'
import BenefitsSection from '../sections/BenefitsSection'
import FrontDeskSection from '../sections/FrontDeskSection'
import HowItWorksSection from '../sections/HowItWorksSection'
import FAQSection from '../sections/FAQSection'
import MVPSection from '../sections/MVPSection'
import LeadFormSection from '../sections/LeadFormSection'

/** Home page: the original landing, unchanged. */
export default function Home() {
  return (
    <>
      <HeroSection />
      <PainPointsSection />
      <BenefitsSection />
      <FrontDeskSection />
      <HowItWorksSection />
      <FAQSection />
      <MVPSection />
      <LeadFormSection />
    </>
  )
}
