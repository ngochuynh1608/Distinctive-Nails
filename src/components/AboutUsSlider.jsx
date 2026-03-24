import { useEffect, useState } from "react";
import { useSite } from "../context/SiteContext";

export default function AboutUsSlider() {
  const { content } = useSite();
  const { slides, aboutSlider } = content;
  const bookingUrl = content.site?.bookingUrl?.trim() || "#book";
  const [activeIndex, setActiveIndex] = useState(0);

  const len = slides.length || 1;

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + len) % len);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % len);
  };

  return (
    <section id="about-us" className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <p className="font-serif text-rose text-lg italic mb-2">{aboutSlider.label}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-5">
            {aboutSlider.heading}
          </h2>
          <p className="text-warm text-base md:text-lg leading-relaxed mb-5">{aboutSlider.paragraph1}</p>
          <p className="text-warm text-base md:text-lg leading-relaxed mb-8">{aboutSlider.paragraph2}</p>
          <a
            href={bookingUrl}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-charcoal text-cream font-medium text-sm hover:bg-warm transition-colors duration-200 cursor-pointer"
          >
            Book now
          </a>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-sand/60 shadow-xl shadow-charcoal/10 aspect-[4/3] bg-cream">
            {slides.map((image, idx) => (
              <img
                key={`${image.imageUrl}-${idx}`}
                src={image.imageUrl}
                alt={image.alt || ""}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  idx === activeIndex ? "opacity-100" : "opacity-0"
                }`}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 to-transparent" />

            {slides[activeIndex]?.description ? (
              <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm text-cream/95 bg-charcoal/45 backdrop-blur-[2px]">
                {slides[activeIndex].description}
              </p>
            ) : null}

            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-charcoal hover:bg-white transition-colors cursor-pointer"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-charcoal hover:bg-white transition-colors cursor-pointer"
            >
              &#8250;
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((image, idx) => (
              <button
                key={`dot-${image.imageUrl}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === activeIndex ? "w-8 bg-charcoal" : "w-2.5 bg-sand"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
