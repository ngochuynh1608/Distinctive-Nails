import { useSite } from "../context/SiteContext";

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

const HERO_VIDEO_URL = null;

export default function Hero() {
  const { content } = useSite();
  const hero = content.hero;
  const bookingUrl = content.site?.bookingUrl?.trim() || "#book";

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={hero.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {HERO_VIDEO_URL && (
        <div className="absolute inset-0" aria-hidden="true">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      )}
      <div
        className="absolute inset-0 bg-charcoal/50 bg-gradient-to-br from-charcoal/60 via-charcoal/40 to-rose/30"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-rose/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto text-center">
        <p className="font-serif text-cream/90 text-lg md:text-xl italic mb-4">{hero.eyebrow}</p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-cream tracking-tight leading-tight mb-6">
          {hero.title}
        </h1>
        <p className="text-sand/95 text-lg md:text-xl max-w-2xl mx-auto mb-10">{hero.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingUrl}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold text-charcoal font-medium text-base hover:bg-amber-600 transition-colors duration-200 cursor-pointer shadow-lg"
          >
            <CalendarIcon />
            Book your visit
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-cream/60 text-cream font-medium text-base hover:bg-cream/10 transition-colors duration-200 cursor-pointer"
          >
            See services
          </a>
        </div>
      </div>
    </section>
  );
}
