import { useSite } from "../context/SiteContext";

export default function Testimonial() {
  const { content } = useSite();
  const testimonial = {
    label: "What clients say",
    heading: "Kind words",
    quote:
      "Best Nails feels like a treat every time. The team is so warm and the results are always perfect. I won't go anywhere else.",
    author: "Maria K.",
    role: "Regular client",
    ...(content.testimonial || {}),
  };

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-serif text-rose text-lg italic mb-2">{testimonial.label}</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-10">
          {testimonial.heading}
        </h2>
        <blockquote className="font-serif text-2xl md:text-3xl text-charcoal leading-relaxed mb-8">
          “{testimonial.quote}”
        </blockquote>
        <p className="text-warm font-medium">— {testimonial.author}</p>
        <p className="text-warm text-sm">{testimonial.role}</p>
      </div>
    </section>
  );
}
