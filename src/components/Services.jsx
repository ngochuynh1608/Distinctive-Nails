import { useState } from "react";
import { useSite } from "../context/SiteContext";

/** Chuẩn hoá hiển thị: JSON cũ chỉ có service.items → một nhóm ẩn tên. */
function getDisplayGroups(service) {
  if (Array.isArray(service?.groups) && service.groups.length > 0) {
    return service.groups.map((g) => ({
      name: (g?.name ?? "").trim(),
      description: (g?.description ?? "").trim(),
      items: Array.isArray(g?.items) ? g.items : [],
    }));
  }
  const items = Array.isArray(service?.items) ? service.items : [];
  return [{ name: "", description: "", items }];
}

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
  const displayGroups = activeService ? getDisplayGroups(activeService) : [];

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
              <p className="text-xs font-medium uppercase tracking-wide text-warm/90">Choose service</p>
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

                <div className="mt-8 space-y-10">
                  {displayGroups.map((group, gIdx) => (
                    <div key={gIdx}>
                      {group.name ? (
                        <h4 className="font-serif text-xl font-semibold text-charcoal mb-1 border-b border-sand/60 pb-2">
                          {group.name}
                        </h4>
                      ) : null}
                      {group.description ? (
                        <p className="text-warm text-sm leading-relaxed mb-4">{group.description}</p>
                      ) : null}

                      <div className="mt-4 space-y-3">
                        {group.items.length ? (
                          group.items.map((row, rowIndex) => (
                            <div
                              key={`${row?.name || "item"}-${gIdx}-${rowIndex}`}
                              className="ml-2 sm:ml-4 pl-4 sm:pl-5 pr-4 border-l-[3px] border-rose/30 bg-cream/55 rounded-r-lg py-3"
                            >
                              <div className="flex items-start justify-between gap-6">
                                <h5 className="font-medium text-charcoal leading-7">
                                  {row?.name || `Item ${rowIndex + 1}`}
                                </h5>
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
                          <p className="text-warm text-sm py-2">Chưa có mục giá trong nhóm này.</p>
                        )}
                      </div>
                    </div>
                  ))}
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
