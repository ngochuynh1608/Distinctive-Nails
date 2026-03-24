import { useState } from "react";
import { useSite } from "../context/SiteContext";

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function PaintBrushIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

const services = [
  {
    title: "Manicure",
    description: "Shape, buff, and polish with care. Gel or classic — your choice.",
    linkText: "View Menu",
    icon: SparklesIcon,
    iconBg: "bg-rose/20 group-hover:bg-rose/30",
    iconColor: "text-rose",
  },
  {
    title: "Pedicure",
    description: "Soak, exfoliate, and polish. A treat for your feet in a calm environment.",
    linkText: "View Menu",
    icon: HeartIcon,
    iconBg: "bg-gold/20 group-hover:bg-gold/30",
    iconColor: "text-gold",
  },
  {
    title: "Nail art",
    description: "Custom designs, French tips, gems — we bring your ideas to life.",
    linkText: "View Menu",
    icon: PaintBrushIcon,
    iconBg: "bg-charcoal/10 group-hover:bg-charcoal/15",
    iconColor: "text-charcoal",
  },
];

export default function Services() {
  const { content } = useSite();
  const { pricing: rawPricing } = content;
  const bookingUrl = content.site?.bookingUrl?.trim() || "#book";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  const pricing = Array.isArray(rawPricing?.services)
    ? rawPricing
    : {
        ...rawPricing,
        services: [
          {
            name: rawPricing?.modalTitle || "Service",
            description: "",
            items: Array.isArray(rawPricing?.items) ? rawPricing.items : [],
          },
        ],
      };

  return (
    <section id="services" className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="font-serif text-rose text-lg italic mb-2">What we offer</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-4">
          Services
        </h2>
        <p className="text-warm text-lg max-w-2xl mb-14">
          From classic manicures to bespoke nail art — all in a relaxed, luxurious setting.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group rounded-2xl bg-cream border border-sand/60 p-8 hover:shadow-xl hover:shadow-charcoal/5 hover:border-rose/40 transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-200 ${item.iconBg}`}
                >
                  <Icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-warm text-sm leading-relaxed mb-6">{item.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    const idx = pricing.services.findIndex(
                      (service) => service.name?.toLowerCase() === item.title.toLowerCase(),
                    );
                    setActiveServiceIndex(idx >= 0 ? idx : 0);
                    setIsMenuOpen(true);
                  }}
                  className="text-charcoal font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all duration-200 cursor-pointer"
                >
                  {item.linkText} <ArrowRightIcon />
                </button>
              </article>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <a
            href={bookingUrl}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-charcoal text-cream font-medium text-sm hover:bg-warm transition-colors duration-200 cursor-pointer"
          >
            View all & book
          </a>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-sand/70 shadow-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-serif text-rose italic text-base md:text-lg">
                  {pricing.modalSubtitle}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
                  {pricing.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full border border-sand text-charcoal hover:bg-cream transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {pricing.services.length > 1 ? (
              <div className="mb-5 flex flex-wrap gap-2 border-b border-sand/70 pb-4">
                {pricing.services.map((service, idx) => (
                  <button
                    key={`${service.name}-${idx}`}
                    type="button"
                    onClick={() => setActiveServiceIndex(idx)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors cursor-pointer ${
                      idx === activeServiceIndex
                        ? "bg-charcoal text-cream"
                        : "bg-cream text-charcoal hover:bg-sand/60"
                    }`}
                  >
                    {service.name || `Service ${idx + 1}`}
                  </button>
                ))}
              </div>
            ) : null}

            {pricing.services[activeServiceIndex]?.description ? (
              <p className="text-warm text-sm leading-relaxed mb-5">
                {pricing.services[activeServiceIndex].description}
              </p>
            ) : null}

            <div className="space-y-5">
              {(pricing.services[activeServiceIndex]?.items || []).map((row, i) => (
                <div
                  key={`${row.name}-${i}`}
                  className={
                    i < (pricing.services[activeServiceIndex]?.items || []).length - 1
                      ? "pb-5 border-b border-sand/70"
                      : ""
                  }
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="font-serif text-xl font-semibold text-charcoal">{row.name}</h4>
                    <span className="text-lg font-semibold text-charcoal shrink-0">{row.price}</span>
                  </div>
                  {row.description ? (
                    <p className="text-warm text-sm leading-relaxed">{row.description}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-charcoal text-cream text-sm font-medium hover:bg-warm transition-colors duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
