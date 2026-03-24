import { useSite } from "../context/SiteContext";

export default function PromotionSection() {
  const { content } = useSite();
  const promotion = {
    enabled: true,
    ...(content.promotion || {}),
  };

  if (!promotion.enabled) return null;

  return (
    <section id="promotion" className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="font-serif text-rose text-lg italic mb-2">Special offer</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-6">
          {promotion.title || "Promotion"}
        </h2>

        <div className="rounded-3xl border border-sand/70 bg-cream overflow-hidden md:grid md:grid-cols-2">
          {promotion.imageUrl ? (
            <img
              src={promotion.imageUrl}
              alt={promotion.title || "Promotion"}
              className="w-full h-64 md:h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-64 md:h-full bg-sand/40" />
          )}
          <div className="p-6 md:p-8">
            <p className="text-warm leading-relaxed whitespace-pre-line">
              {promotion.description || "Chưa có nội dung promotion."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
