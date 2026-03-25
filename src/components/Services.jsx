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

  const activeService =
    Array.isArray(pricing?.services) && pricing.services[activeServiceIndex]
      ? pricing.services[activeServiceIndex]
      : null;
  const activeItems = Array.isArray(activeService?.items) ? activeService.items : [];

  return (
    <section id="services" className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="font-serif text-rose text-lg italic mb-2">{pricing.modalSubtitle || "Price Menu"}</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-4">
          {pricing.modalTitle || "Service Menu"}
        </h2>

        <div className="mt-10 rounded-2xl border border-sand/60 bg-cream/10 p-4 md:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-warm/90">
                Choose service
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {(pricing.services || []).map((service, idx) => {
              const label = service?.name || `Service ${idx + 1}`;
              const isActive = idx === activeServiceIndex;
              return (
                <button
                  key={`${label}-${idx}`}
                  type="button"
                  onClick={() => setActiveServiceIndex(idx)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "bg-charcoal border-charcoal text-cream"
                      : "bg-white/60 border-sand/70 text-charcoal hover:bg-cream"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {activeService ? (
              <>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <h3 className="font-serif text-2xl font-semibold text-charcoal">
                    {activeService.name || `Service ${activeServiceIndex + 1}`}
                  </h3>
                  {activeService.description ? (
                    <p className="text-warm text-sm md:text-base leading-relaxed md:max-w-[52ch] md:text-right">
                      {activeService.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 divide-y divide-sand/70">
                  {activeItems.length ? (
                    activeItems.map((row, rowIndex) => (
                      <div
                        key={`${row?.name || "item"}-${rowIndex}`}
                        className="ml-2 sm:ml-4 pl-4 sm:pl-5 pr-4 border-l-[3px] border-rose/30 bg-cream/55 rounded-r-lg py-3"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <h4 className="font-medium text-charcoal leading-7">
                            {row?.name || `Item ${rowIndex + 1}`}
                          </h4>
                          {row?.price ? (
                            <span className="text-lg font-semibold text-charcoal shrink-0 leading-7">
                              {row.price}
                            </span>
                          ) : null}
                        </div>
                        {row?.description ? (
                          <p className="text-warm text-sm leading-relaxed mt-2">{row.description}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-warm text-sm py-6">Chưa có mục giá cho service này.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-warm text-sm py-6">Chưa có dữ liệu bảng giá.</p>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href={bookingUrl}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-charcoal text-cream font-medium text-sm hover:bg-warm transition-colors duration-200 cursor-pointer"
          >
            Book your appointment
          </a>
        </div>
      </div>
    </section>
  );
}
