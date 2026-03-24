function ShieldIcon() {
  return (
    <svg className="w-5 h-5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

const features = [
  {
    title: "Clean & safe",
    description: "Sterilized tools and single-use where it matters.",
    icon: ShieldIcon,
    iconBg: "bg-rose/20",
  },
  {
    title: "Premium products",
    description: "Long-lasting polish and gentle care for your nails.",
    icon: SparklesIcon,
    iconBg: "bg-gold/20",
  },
  {
    title: "No rush",
    description: "We take our time so you leave feeling truly pampered.",
    icon: ClockIcon,
    iconBg: "bg-charcoal/10",
  },
  {
    title: "Welcoming space",
    description: "Relax in a calm, beautiful environment.",
    icon: HeartIcon,
    iconBg: "bg-rose/20",
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 px-4 md:px-8 bg-cream">
      <div className="max-w-6xl mx-auto">
        <p className="font-serif text-rose text-lg italic mb-2">Why choose us</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-4">
          Luxurious & friendly
        </h2>
        <p className="text-warm text-lg max-w-2xl mb-14">
          We believe great nail care is both premium and personal. Clean tools, quality products,
          and a team that remembers your name.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-start">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${item.iconBg}`}
                >
                  <Icon />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">
                  {item.title}
                </h3>
                <p className="text-warm text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
