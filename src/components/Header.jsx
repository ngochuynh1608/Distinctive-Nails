import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSite } from "../context/SiteContext";

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.4 4.2a1 1 0 01-.24 1.02L8.7 10.6a16 16 0 006.7 6.7l1.7-1.7a1 1 0 011.02-.24l4.2 1.4a1 1 0 01.68.95V21a2 2 0 01-2 2h-1C10.3 23 1 13.7 1 2V1a2 2 0 012-2z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18v12H3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 7 9-7" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" strokeWidth="2" />
    </svg>
  );
}

/** Thin-stroke menu glyph — reads more refined on mobile. */
function MenuIcon({ className = "w-[22px] h-[22px]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" d="M5.5 8h13M5.5 12h13M5.5 16h13" />
    </svg>
  );
}

function CloseMenuIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

function defaultMenuItems(promotionEnabled) {
  return [
    { key: "home", label: "Home", href: "/", enabled: true },
    { key: "about", label: "About Us", href: "#about-us", enabled: true },
    { key: "services", label: "Services", href: "#services", enabled: true },
    { key: "gallery", label: "Gallery", href: "#instagram", enabled: true },
    { key: "promotion", label: "Promotion", href: "#promotion", enabled: !!promotionEnabled },
    { key: "contact", label: "Contact Us", href: "#book", enabled: true },
  ];
}

export default function Header() {
  const { content } = useSite();
  const { site } = content;
  const promotion = { enabled: true, ...(content.promotion || {}) };
  const logoUrl = site.logoUrl?.trim();
  const phone = site.phone?.trim();
  const phoneTel = site.phoneTel?.trim();
  const email = site.email?.trim();
  const bookingUrl = site.bookingUrl?.trim() || "#book";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerShellRef = useRef(null);

  useLayoutEffect(() => {
    const el = headerShellRef.current;
    if (!el) return;

    function syncHeaderOffset() {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-offset", `${h}px`);
    }

    syncHeaderOffset();
    const ro = new ResizeObserver(syncHeaderOffset);
    ro.observe(el);
    window.addEventListener("resize", syncHeaderOffset, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeaderOffset);
      document.documentElement.style.removeProperty("--header-offset");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const siteMenu = Array.isArray(site.menu) ? site.menu : null;
  const menuItemsRaw = siteMenu?.length ? siteMenu : defaultMenuItems(promotion.enabled);
  const menuItems = menuItemsRaw
    .map((it) => ({
      key: it?.key,
      label: (it?.label ?? "").toString(),
      href: (it?.href ?? "").toString().trim(),
      enabled: it?.enabled ?? true,
    }))
    .map((it) =>
      it.href === "#promotion"
        ? { ...it, enabled: !!it.enabled && !!promotion.enabled }
        : it,
    )
    .filter((it) => it.label.trim() && it.enabled !== false && it.href.trim());

  return (
    <header
      ref={headerShellRef}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="max-w-6xl mx-auto pt-3">
        <div
          className={`px-4 py-2 rounded-2xl bg-cream/95 backdrop-blur-sm transition-all duration-300 overflow-hidden ${
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-32 opacity-100"
          }`}
          aria-hidden={isScrolled}
        >
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-4 gap-y-1 text-xs md:text-sm text-warm">
            {phone ? (
              phoneTel ? (
                <a
                  href={`tel:${phoneTel}`}
                  className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors"
                >
                  <PhoneIcon />
                  <span>{phone}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon />
                  <span>{phone}</span>
                </span>
              )
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors"
              >
                <MailIcon />
                <span>{email}</span>
              </a>
            ) : null}
            {site.address ? (
              <span className="inline-flex items-center gap-1.5 text-center">
                <MapPinIcon />
                <span>{site.address}</span>
              </span>
            ) : null}
          </div>
        </div>

        <nav className="py-3 px-5 rounded-2xl bg-cream/95 backdrop-blur-sm flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-3 font-serif text-2xl font-semibold text-charcoal tracking-tight"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-9 w-auto object-contain max-w-[140px]" />
            ) : null}
            <span>{site.brandName}</span>
          </a>

          <div className="hidden md:flex items-center gap-3 md:gap-6 text-sm md:text-base">
            {menuItems.map((item, idx) => (
              <a
                key={item.key ?? idx}
                href={item.href}
                className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}

            <a
              href={bookingUrl}
              className="inline-flex items-center justify-center px-4 md:px-5 py-2 rounded-full bg-charcoal text-cream font-medium text-sm hover:bg-warm transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              Booking Now
            </a>
          </div>

          <button
            type="button"
            className="md:hidden group inline-flex items-center justify-center w-11 h-11 rounded-full border border-charcoal/12 text-charcoal bg-white/95 shadow-[0_1px_2px_rgba(44,40,38,0.06)] hover:border-charcoal/22 hover:shadow-[0_4px_14px_rgba(44,40,38,0.1)] active:scale-[0.97] transition-all duration-300"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="w-[22px] h-[22px] text-charcoal/90 group-hover:text-charcoal transition-colors duration-300" />
          </button>
        </nav>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-[70] transition-opacity duration-300 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/55 backdrop-blur-[1px]"
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
        />

        <aside
          className={`absolute top-0 right-0 h-full w-[84%] max-w-[360px] bg-cream/95 backdrop-blur-xl border-l border-sand/60 shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="font-serif text-xl text-charcoal">{site.brandName}</span>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-charcoal/12 text-charcoal bg-white/95 shadow-[0_1px_2px_rgba(44,40,38,0.06)] hover:border-charcoal/22 hover:shadow-[0_4px_14px_rgba(44,40,38,0.1)] active:scale-[0.97] transition-all duration-300"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <CloseMenuIcon className="w-[18px] h-[18px] text-charcoal/85" />
              </button>
            </div>

            <nav className="grid gap-2 text-[15px]">
              {menuItems.map((item, idx) => (
                <a
                  key={item.key ?? idx}
                  href={item.href}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href={bookingUrl}
              className="mt-auto inline-flex items-center justify-center px-4 py-3 rounded-full bg-charcoal text-cream font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Booking Now
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}
