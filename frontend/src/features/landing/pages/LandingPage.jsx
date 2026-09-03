import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import BeforeAfterSection from "../components/BeforeAfterSection";
import PhilosophyBanner from "../components/PhilosophyBanner";
import BarbersSection from "../components/BarbersSection";
import Gallery from "../components/Gallery";
import ProductsShowcase from "../components/ProductsShowcase";
import ReviewsSection from "../components/ReviewsSection";
import LoyaltyBanner from "../components/LoyaltyBanner";
import FaqSection from "../components/FaqSection";
import Stats from "../components/Stats";
import Footer from "../components/Footer";
import GoldGlowCursor from "../components/GoldGlowCursor";

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add("landing-active");
    document.body.classList.add("landing-active");

    return () => {
      document.documentElement.classList.remove("landing-active");
      document.body.classList.remove("landing-active");
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen landing-page-root relative selection:bg-[#C9A24A] selection:text-black"
    >
      <GoldGlowCursor />
      
      <Navbar />
      <Hero />
      <Services />
      <BeforeAfterSection />
      <PhilosophyBanner />
      <BarbersSection />
      <Gallery />
      <ProductsShowcase />
      <ReviewsSection />
      <LoyaltyBanner />
      <FaqSection />
      <Stats />
      <Footer />
    </div>
  );
}