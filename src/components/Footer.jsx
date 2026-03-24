import { useSite } from "../context/SiteContext";

export default function Footer() {
  const { content } = useSite();
  const { site } = content;
  const tel = site.phoneTel?.trim() || "";
  const bookingUrl = site.bookingUrl?.trim() || "#book";

  return (
    <footer className="py-12 px-4 md:px-8 bg-charcoal border-t border-sand/20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-serif text-xl font-semibold text-cream">{site.brandName}</span>
        <div className="flex gap-8 text-sand/90 text-sm">
          <a href="#services" className="hover:text-cream transition-colors duration-200 cursor-pointer">
            Services
          </a>
          <a href="#about-us" className="hover:text-cream transition-colors duration-200 cursor-pointer">
            About
          </a>
          <a href={bookingUrl} className="hover:text-cream transition-colors duration-200 cursor-pointer">
            Book
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 space-y-2 text-sand/70 text-sm text-center md:text-left">
        <p>
          <a href={`mailto:${site.email}`} className="hover:text-cream transition-colors cursor-pointer">
            {site.email}
          </a>
          {tel ? (
            <>
              {" · "}
              <a href={`tel:${tel}`} className="hover:text-cream transition-colors cursor-pointer">
                {site.phone}
              </a>
            </>
          ) : null}
        </p>
        <p>{site.address}</p>
        <p className="text-sand/60">
          © {site.brandName}. {site.footerTagline}
        </p>
      </div>
    </footer>
  );
}
