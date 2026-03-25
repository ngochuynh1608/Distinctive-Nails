import AdminApp from "./admin/AdminApp";
import { SiteProvider, useSite } from "./context/SiteContext";
import DocumentMeta from "./components/DocumentMeta";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutUsSlider from "./components/AboutUsSlider";
import Services from "./components/Services";
import About from "./components/About";
import InstagramGallery from "./components/InstagramGallery";
import Testimonial from "./components/Testimonial";
import PromotionSection from "./components/PromotionSection";
import BookCTA from "./components/BookCTA";
import Footer from "./components/Footer";

function PublicLayout() {
  const { loading, error, content } = useSite();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-6 bg-cream text-warm text-center">
        <p>{error}</p>
        <p className="text-sm mt-2">
          Chạy server bằng:{" "}
          <code className="bg-sand/50 px-2 py-0.5 rounded text-charcoal">bun run dev</code>
        </p>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-warm">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-10 h-10 animate-spin text-warm/70"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentMeta />
      <Header />
      <main className="pt-[var(--header-offset)]">
        <Hero />
        <AboutUsSlider />
        <Services />
        <InstagramGallery />
        <PromotionSection />
        <About />
        <Testimonial />
        <BookCTA />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (path.startsWith("/admin")) {
    return <AdminApp />;
  }
  return (
    <SiteProvider>
      <PublicLayout />
    </SiteProvider>
  );
}
