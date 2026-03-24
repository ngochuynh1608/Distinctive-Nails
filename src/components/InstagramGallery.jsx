import { useSite } from "../context/SiteContext";

function InstagramIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17" cy="7" r="1.2" />
    </svg>
  );
}

export default function InstagramGallery() {
  const { content } = useSite();
  const instagram = content.instagram || {};
  const profileUrl = instagram.profileUrl?.trim() || "https://instagram.com";
  const posts = Array.isArray(instagram.images) ? instagram.images : [];

  return (
    <section
      id="instagram"
      className="py-20 md:py-28 px-4 md:px-8 bg-cream border-y border-sand/60"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="font-serif text-rose text-lg italic mb-2">
              From our Instagram
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-3">
              Salon moments
            </h2>
            <p className="text-warm text-sm md:text-base max-w-xl">
              A peek inside the studio: fresh sets, color stories, and tiny
              details we love.
            </p>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 self-start px-4 py-2.5 rounded-full border border-charcoal/20 text-charcoal text-sm font-medium hover:border-charcoal hover:bg-charcoal/5 transition-colors duration-200 cursor-pointer"
          >
            <InstagramIcon />
            <span>Open Instagram</span>
          </a>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
            {posts.map((post, idx) => (
              <a
                key={`${post.imageUrl || "instagram"}-${idx}`}
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative block overflow-hidden rounded-2xl bg-sand/40 aspect-[4/5] cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  alt={post.alt || `Instagram photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-cream text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="truncate">View on Instagram</span>
                  <InstagramIcon />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-sand/80 bg-white p-8 text-center text-warm text-sm">
            Chưa có ảnh Instagram. Vào Admin → Instagram để tải ảnh.
          </div>
        )}
      </div>
    </section>
  );
}

