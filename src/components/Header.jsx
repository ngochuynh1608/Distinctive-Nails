import { useState } from "react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:px-8">
      <div className="max-w-6xl mx-auto mb-2 px-4 py-2 rounded-2xl bg-cream/95 backdrop-blur-sm">
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
      <nav className="max-w-6xl mx-auto flex items-center justify-between py-3 px-5 rounded-2xl bg-cream/95 backdrop-blur-sm">
        <a
          href="#"
          className="flex items-center gap-3 font-serif text-2xl font-semibold text-charcoal tracking-tight"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-9 w-auto object-contain max-w-[140px]" />
          ) : null}
          <span>{site.brandName}</span>
        </a>
        <button
          type="button"
          className="md:hidden group inline-flex items-center justify-center w-11 h-11 rounded-full border border-charcoal/12 text-charcoal bg-white/95 shadow-[0_1px_2px_rgba(44,40,38,0.06)] hover:border-charcoal/22 hover:shadow-[0_4px_14px_rgba(44,40,38,0.1)] active:scale-[0.97] transition-all duration-300"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon className="w-[22px] h-[22px] text-charcoal/90 group-hover:text-charcoal transition-colors duration-300" />
        </button>

        <div className="hidden md:flex items-center gap-3 md:gap-6 text-sm md:text-base">
          <a
            href="#"
            className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
          >
            Home
          </a>
          <a
            href="#about-us"
            className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
          >
            About Us
          </a>
          <a
            href="#services"
            className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
          >
            Services
          </a>
          <a
            href="#instagram"
            className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
          >
            Gallary
          </a>
          {promotion.enabled ? (
            <a
              href="#promotion"
              className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
            >
              Promotion
            </a>
          ) : null}
          <a
            href={bookingUrl}
            className="text-warm hover:text-charcoal transition-colors duration-200 whitespace-nowrap"
          >
            Contact Us
          </a>
          <a
            href={bookingUrl}
            className="inline-flex items-center justify-center px-4 md:px-5 py-2 rounded-full bg-charcoal text-cream font-medium text-sm hover:bg-warm transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            Booking Now
          </a>
        </div>
      </nav>

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
              <a href="#" className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>Home</a>
              <a href="#about-us" className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>About Us</a>
              <a href="#services" className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="#instagram" className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>Gallary</a>
              {promotion.enabled ? (
                <a href="#promotion" className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>Promotion</a>
              ) : null}
              <a href={bookingUrl} className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-charcoal" onClick={() => setMenuOpen(false)}>Contact Us</a>
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
