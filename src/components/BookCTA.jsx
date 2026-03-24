import { useSite } from "../context/SiteContext";

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function BookCTA() {
  const { content } = useSite();
  const { phone, phoneTel, address } = content.site;
  const telDigits = phoneTel?.replace(/^tel:/i, "").trim();
  const bookingUrl = content.site?.bookingUrl?.trim() || "#book";
  const mapSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : "https://www.google.com/maps?q=Best+Nails&output=embed";

  return (
    <section id="book" className="py-20 md:py-28 px-4 md:px-8 bg-charcoal">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
          Ready to treat yourself?
        </h2>
        <p className="text-sand text-lg mb-10">
          Book your appointment online — choose your service and a time that works for you.
        </p>
        <a
          href={bookingUrl}
          className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gold text-charcoal font-semibold text-base hover:bg-amber-600 transition-colors duration-200 cursor-pointer shadow-lg"
        >
          <CalendarIcon />
          Book your visit
        </a>
        <p className="text-sand/80 text-sm mt-6">
          Or call us:{" "}
          {telDigits ? (
            <a href={`tel:${telDigits}`} className="text-gold hover:underline cursor-pointer">
              {phone}
            </a>
          ) : (
            <span className="text-gold">{phone}</span>
          )}
        </p>

        <div className="mt-10 rounded-2xl overflow-hidden border border-sand/30 bg-cream/10">
          <iframe
            title="Google Map"
            src={mapSrc}
            className="w-full h-[320px] md:h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
