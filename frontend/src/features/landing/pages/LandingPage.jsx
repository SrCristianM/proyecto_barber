import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import PhilosophyBanner from "../components/PhilosophyBanner";
import Gallery from "../components/Gallery";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }} className="min-h-screen">

      <Navbar />

      <Hero />
      <Services />
      <PhilosophyBanner />
      <Gallery />
      <Stats />
      <Footer />
    </div>
  );
}