import Navbar from "@/components/landing-ui/navbar";
import Footer from "@/components/landing-ui/footer";
import HeroSection from "@/components/landing-ui/hero";
import ProgramsSection from "@/components/landing-ui/features";
import PromoSection from "@/components/landing-ui/promo";
import TestimonialSection from "@/components/landing-ui/testimoni";
import ActivitiesSection from "@/components/landing-ui/activity";
import FAQSection from "@/components/landing-ui/faq";
import LocationsSection from "@/components/landing-ui/location";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <ProgramsSection />
      <LocationsSection />
      <PromoSection />
      <TestimonialSection />
      <ActivitiesSection />
      <FAQSection />
      <Footer />
    </>
  );
}
