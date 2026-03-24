import { useCallback, useEffect, useState } from "react";

const emptySlide = () => ({
  imageUrl: "",
  description: "",
  alt: "",
});

const emptyPrice = () => ({
  name: "",
  price: "",
  description: "",
});

const emptyPriceService = () => ({
  name: "",
  description: "",
  items: [emptyPrice()],
});

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Upload thất bại");
  return j.url;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-charcoal mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function ImageThumb({ src, alt }) {
  if (!src?.trim()) return null;
  return (
    <div className="mt-2">
      <img
        src={src}
        alt={alt}
        className="w-full max-w-[280px] h-36 rounded-xl border border-sand/70 object-cover bg-cream"
      />
    </div>
  );
}

function FilePickerButton({ id, label, accept = "image/*", multiple = false, onPick }) {
  return (
    <>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            await onPick(files);
          }
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-charcoal/20 bg-white px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-cream hover:border-charcoal transition-colors cursor-pointer whitespace-nowrap"
      >
        <span aria-hidden="true">📷</span>
        <span>{label}</span>
      </label>
    </>
  );
}

export default function AdminApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [draft, setDraft] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeSection, setActiveSection] = useState("general");

  const loadContent = useCallback(async () => {
    setLoadErr("");
    try {
      const r = await fetch("/api/content");
      if (!r.ok) throw new Error("Không tải được dữ liệu");
      setDraft(await r.json());
    } catch (e) {
      setLoadErr(e.message ?? "Lỗi");
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        setAuthenticated(!!j.authenticated);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (authenticated) loadContent();
  }, [authenticated, loadContent]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: loginUser, password: loginPass }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setLoginErr(j.error || "Đăng nhập thất bại");
      return;
    }
    setAuthenticated(true);
    setLoginPass("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAuthenticated(false);
    setDraft(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const r = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draft),
      });
      if (r.status === 401) {
        setAuthenticated(false);
        setSaveMsg("Phiên đăng nhập hết hạn.");
        return;
      }
      if (!r.ok) throw new Error("Lưu thất bại");
      setSaveMsg("Đã lưu thành công.");
    } catch (err) {
      setSaveMsg(err.message ?? "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  function setSite(patch) {
    setDraft((d) => ({ ...d, site: { ...d.site, ...patch } }));
  }

  function setHero(patch) {
    setDraft((d) => ({ ...d, hero: { ...d.hero, ...patch } }));
  }

  function setAboutSlider(patch) {
    setDraft((d) => ({ ...d, aboutSlider: { ...d.aboutSlider, ...patch } }));
  }

  function setTestimonial(patch) {
    setDraft((d) => ({ ...d, testimonial: { ...(d.testimonial || {}), ...patch } }));
  }

  function setPricing(patch) {
    setDraft((d) => ({ ...d, pricing: { ...d.pricing, ...patch } }));
  }

  function setInstagram(patch) {
    setDraft((d) => ({
      ...d,
      instagram: { ...(d.instagram || {}), ...patch },
    }));
  }

  function normalizePricing(p) {
    if (Array.isArray(p?.services)) return p;
    const legacyItems = Array.isArray(p?.items) ? p.items : [];
    return {
      ...p,
      services: [
        {
          name: p?.modalTitle || "Service",
          description: "",
          items: legacyItems,
        },
      ],
    };
  }

  function setSlide(i, patch) {
    setDraft((d) => {
      const slides = [...d.slides];
      slides[i] = { ...slides[i], ...patch };
      return { ...d, slides };
    });
  }

  function addSlide() {
    setDraft((d) => ({ ...d, slides: [...d.slides, emptySlide()] }));
  }

  function removeSlide(i) {
    setDraft((d) => ({ ...d, slides: d.slides.filter((_, j) => j !== i) }));
  }

  function setPriceService(serviceIndex, patch) {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      const services = [...pricing.services];
      services[serviceIndex] = { ...services[serviceIndex], ...patch };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function addPriceService() {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      return {
        ...d,
        pricing: { ...pricing, services: [...pricing.services, emptyPriceService()] },
      };
    });
  }

  function removePriceService(serviceIndex) {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      return {
        ...d,
        pricing: {
          ...pricing,
          services: pricing.services.filter((_, i) => i !== serviceIndex),
        },
      };
    });
  }

  function setPriceItemByService(serviceIndex, itemIndex, patch) {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      const services = [...pricing.services];
      const items = [...(services[serviceIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], ...patch };
      services[serviceIndex] = { ...services[serviceIndex], items };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function addPriceItemToService(serviceIndex) {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      const services = [...pricing.services];
      const items = [...(services[serviceIndex].items || []), emptyPrice()];
      services[serviceIndex] = { ...services[serviceIndex], items };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function removePriceItemFromService(serviceIndex, itemIndex) {
    setDraft((d) => {
      const pricing = normalizePricing(d.pricing);
      const services = [...pricing.services];
      const items = (services[serviceIndex].items || []).filter((_, i) => i !== itemIndex);
      services[serviceIndex] = { ...services[serviceIndex], items };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-warm">
        Đang tải…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-sand/70 bg-white p-8 shadow-lg"
        >
          <h1 className="font-serif text-2xl text-charcoal mb-6 text-center">Admin Best Nails</h1>
          <div className="space-y-4">
            <Field label="Tài khoản">
              <input
                className="w-full rounded-xl border border-sand px-4 py-2.5 text-charcoal"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="Mật khẩu">
              <input
                type="password"
                className="w-full rounded-xl border border-sand px-4 py-2.5 text-charcoal"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            {loginErr && <p className="text-sm text-red-700">{loginErr}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-charcoal text-cream py-3 font-medium hover:bg-warm transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-warm">
            <a href="/" className="text-rose hover:underline cursor-pointer">
              Về trang chủ
            </a>
          </p>
        </form>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-cream px-4 py-12">
        <p className="text-center text-warm">{loadErr || "Đang tải dữ liệu…"}</p>
      </div>
    );
  }

  const pricing = normalizePricing(draft.pricing);
  const instagram = {
    profileUrl: "",
    images: [],
    ...(draft.instagram || {}),
  };

  function setInstagramImage(index, patch) {
    setDraft((d) => {
      const instagramData = {
        profileUrl: "",
        images: [],
        ...(d.instagram || {}),
      };
      const images = [...(instagramData.images || [])];
      images[index] = { ...images[index], ...patch };
      return { ...d, instagram: { ...instagramData, images } };
    });
  }

  function addInstagramImage() {
    setDraft((d) => {
      const instagramData = {
        profileUrl: "",
        images: [],
        ...(d.instagram || {}),
      };
      return {
        ...d,
        instagram: {
          ...instagramData,
          images: [...(instagramData.images || []), { imageUrl: "", alt: "" }],
        },
      };
    });
  }

  function removeInstagramImage(index) {
    setDraft((d) => {
      const instagramData = {
        profileUrl: "",
        images: [],
        ...(d.instagram || {}),
      };
      return {
        ...d,
        instagram: {
          ...instagramData,
          images: (instagramData.images || []).filter((_, i) => i !== index),
        },
      };
    });
  }

  const promotion = {
    enabled: true,
    title: "",
    imageUrl: "",
    description: "",
    ...(draft.promotion || {}),
  };
  const testimonial = {
    label: "What clients say",
    heading: "Kind words",
    quote:
      "Best Nails feels like a treat every time. The team is so warm and the results are always perfect. I won't go anywhere else.",
    author: "Maria K.",
    role: "Regular client",
    ...(draft.testimonial || {}),
  };

  function setPromotion(patch) {
    setDraft((d) => ({
      ...d,
      promotion: { ...promotion, ...patch },
    }));
  }
  const sectionTabs = [
    { id: "general", label: "Chung", icon: "🏢" },
    { id: "hero", label: "Hero", icon: "🖼️" },
    { id: "slides", label: "Slide", icon: "🎞️" },
    { id: "pricing", label: "Bảng giá", icon: "💲" },
    { id: "promotion", label: "Promotion", icon: "🏷️" },
    { id: "testimonial", label: "Testimonial", icon: "💬" },
    { id: "instagram", label: "Instagram", icon: "📸" },
  ];

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <header className="border-b border-sand/70 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="font-serif text-xl font-semibold">Quản trị nội dung</h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-warm hover:text-charcoal cursor-pointer"
            >
              Xem website
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm rounded-full border border-sand px-4 py-2 hover:bg-cream cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={handleSave} className="max-w-5xl mx-auto px-4 py-10 pb-24">
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-sand/70 bg-white p-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-warm px-2 pb-2">Menu chỉnh sửa</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                    activeSection === tab.id
                      ? "bg-charcoal text-cream"
                      : "bg-cream text-charcoal hover:bg-sand/50"
                  }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "general" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Thông tin chung & liên hệ
          </h2>
          <Field label="Logo (URL hoặc upload)">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                value={draft.site.logoUrl}
                onChange={(e) => setSite({ logoUrl: e.target.value })}
                placeholder="https://..."
              />
              <FilePickerButton
                id="upload-logo"
                label="Choose image"
                onPick={async (files) => {
                  const f = files[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setSite({ logoUrl: url });
                  } catch (err) {
                    alert(err.message);
                  }
                }}
              />
            </div>
            <ImageThumb src={draft.site.logoUrl} alt="Logo preview" />
          </Field>
          <Field label="Tiêu đề trang (title)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.title}
              onChange={(e) => setSite({ title: e.target.value })}
            />
          </Field>
          <Field label="Mô tả SEO (meta description)">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[80px]"
              value={draft.site.description}
              onChange={(e) => setSite({ description: e.target.value })}
            />
          </Field>
          <Field label="Tên thương hiệu (header/footer)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.brandName}
              onChange={(e) => setSite({ brandName: e.target.value })}
            />
          </Field>
          <Field label="Điện thoại (hiển thị)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.phone}
              onChange={(e) => setSite({ phone: e.target.value })}
            />
          </Field>
          <Field label="Số gọi (tel: ví dụ +84901234567)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.phoneTel}
              onChange={(e) => setSite({ phoneTel: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.email}
              onChange={(e) => setSite({ email: e.target.value })}
            />
          </Field>
          <Field label="Địa chỉ">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[72px]"
              value={draft.site.address}
              onChange={(e) => setSite({ address: e.target.value })}
            />
          </Field>
          <Field label="Link booking (URL)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.bookingUrl || ""}
              onChange={(e) => setSite({ bookingUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field label="Dòng chân trang (copyright)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.site.footerTagline}
              onChange={(e) => setSite({ footerTagline: e.target.value })}
            />
          </Field>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "hero" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Hero (trang đầu)
          </h2>
          <Field label="Dòng phụ (italic)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.hero.eyebrow}
              onChange={(e) => setHero({ eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Tiêu đề chính">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.hero.title}
              onChange={(e) => setHero({ title: e.target.value })}
            />
          </Field>
          <Field label="Đoạn mô tả">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[100px]"
              value={draft.hero.subtitle}
              onChange={(e) => setHero({ subtitle: e.target.value })}
            />
          </Field>
          <Field label="Ảnh nền hero (URL hoặc upload)">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                value={draft.hero.imageUrl}
                onChange={(e) => setHero({ imageUrl: e.target.value })}
              />
              <FilePickerButton
                id="upload-hero"
                label="Choose image"
                onPick={async (files) => {
                  const f = files[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setHero({ imageUrl: url });
                  } catch (err) {
                    alert(err.message);
                  }
                }}
              />
            </div>
            <ImageThumb src={draft.hero.imageUrl} alt="Hero image preview" />
          </Field>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "slides" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Slide “About us”
          </h2>
          <div className="space-y-6">
            {draft.slides.map((slide, i) => (
              <div
                key={i}
                className="rounded-xl border border-sand/60 p-4 space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => removeSlide(i)}
                  className="absolute top-2 right-2 text-sm text-red-700 hover:underline cursor-pointer"
                >
                  Xóa
                </button>
                <Field label={`Slide ${i + 1} — ảnh (URL)`}>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                      value={slide.imageUrl}
                      onChange={(e) => setSlide(i, { imageUrl: e.target.value })}
                    />
                    <FilePickerButton
                      id={`upload-slide-${i}`}
                      label="Choose image"
                      onPick={async (files) => {
                        const f = files[0];
                        if (!f) return;
                        try {
                          const url = await uploadFile(f);
                          setSlide(i, { imageUrl: url });
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                    />
                  </div>
                  <ImageThumb src={slide.imageUrl} alt={`Slide ${i + 1} preview`} />
                </Field>
                <Field label="Mô tả / caption">
                  <textarea
                    className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[60px]"
                    value={slide.description}
                    onChange={(e) => setSlide(i, { description: e.target.value })}
                  />
                </Field>
                <Field label="Alt (SEO)">
                  <input
                    className="w-full rounded-xl border border-sand px-4 py-2.5"
                    value={slide.alt}
                    onChange={(e) => setSlide(i, { alt: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSlide}
            className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
          >
            + Thêm slide
          </button>

          <h3 className="font-medium pt-4">Nội dung chữ bên cạnh slide</h3>
          <Field label="Nhãn (About us)">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.aboutSlider.label}
              onChange={(e) => setAboutSlider({ label: e.target.value })}
            />
          </Field>
          <Field label="Tiêu đề">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={draft.aboutSlider.heading}
              onChange={(e) => setAboutSlider({ heading: e.target.value })}
            />
          </Field>
          <Field label="Đoạn 1">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[80px]"
              value={draft.aboutSlider.paragraph1}
              onChange={(e) => setAboutSlider({ paragraph1: e.target.value })}
            />
          </Field>
          <Field label="Đoạn 2">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[80px]"
              value={draft.aboutSlider.paragraph2}
              onChange={(e) => setAboutSlider({ paragraph2: e.target.value })}
            />
          </Field>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "pricing" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Bảng giá (menu trong Services)
          </h2>
          <Field label="Dòng phụ popup">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={pricing.modalSubtitle}
              onChange={(e) => setPricing({ modalSubtitle: e.target.value })}
            />
          </Field>
          <Field label="Tiêu đề popup">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={pricing.modalTitle}
              onChange={(e) => setPricing({ modalTitle: e.target.value })}
            />
          </Field>
          <div className="space-y-4">
            {pricing.services.map((service, serviceIndex) => (
              <div key={serviceIndex} className="rounded-xl border border-sand/60 p-4 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => removePriceService(serviceIndex)}
                  className="absolute top-2 right-2 text-sm text-red-700 hover:underline cursor-pointer"
                >
                  Xóa service
                </button>
                <Field label={`Service ${serviceIndex + 1} - Tên`}>
                  <input
                    className="w-full rounded-xl border border-sand px-4 py-2.5"
                    value={service.name}
                    onChange={(e) => setPriceService(serviceIndex, { name: e.target.value })}
                  />
                </Field>
                <Field label="Mô tả service (tuỳ chọn)">
                  <textarea
                    className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[60px]"
                    value={service.description || ""}
                    onChange={(e) => setPriceService(serviceIndex, { description: e.target.value })}
                  />
                </Field>

                <div className="space-y-3">
                  {(service.items || []).map((item, itemIndex) => (
                    <div key={itemIndex} className="rounded-xl border border-sand/50 p-3 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removePriceItemFromService(serviceIndex, itemIndex)}
                        className="absolute top-2 right-2 text-xs text-red-700 hover:underline cursor-pointer"
                      >
                        Xóa item
                      </button>
                      <Field label="Tên item">
                        <input
                          className="w-full rounded-xl border border-sand px-4 py-2.5"
                          value={item.name}
                          onChange={(e) =>
                            setPriceItemByService(serviceIndex, itemIndex, { name: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Giá">
                        <input
                          className="w-full rounded-xl border border-sand px-4 py-2.5"
                          value={item.price}
                          onChange={(e) =>
                            setPriceItemByService(serviceIndex, itemIndex, { price: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Mô tả item (tuỳ chọn)">
                        <textarea
                          className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[60px]"
                          value={item.description}
                          onChange={(e) =>
                            setPriceItemByService(serviceIndex, itemIndex, {
                              description: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addPriceItemToService(serviceIndex)}
                  className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
                >
                  + Thêm item cho service này
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPriceService}
            className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
          >
            + Thêm service
          </button>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "promotion" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Promotions
          </h2>
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={!!promotion.enabled}
              onChange={(e) => setPromotion({ enabled: e.target.checked })}
            />
            Enable promotion section
          </label>
          <Field label="Tiêu đề">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={promotion.title}
              onChange={(e) => setPromotion({ title: e.target.value })}
            />
          </Field>
          <Field label="Hình ảnh (URL hoặc upload)">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                value={promotion.imageUrl}
                onChange={(e) => setPromotion({ imageUrl: e.target.value })}
              />
              <FilePickerButton
                id="upload-promotion"
                label="Choose image"
                onPick={async (files) => {
                  const f = files[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setPromotion({ imageUrl: url });
                  } catch (err) {
                    alert(err.message || "Upload promotion image failed");
                  }
                }}
              />
            </div>
            <ImageThumb src={promotion.imageUrl} alt={promotion.title || "Promotion"} />
          </Field>
          <Field label="Mô tả">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[90px]"
              value={promotion.description}
              onChange={(e) => setPromotion({ description: e.target.value })}
            />
          </Field>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "testimonial" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            What clients say
          </h2>
          <Field label="Label">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={testimonial.label}
              onChange={(e) => setTestimonial({ label: e.target.value })}
            />
          </Field>
          <Field label="Heading">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={testimonial.heading}
              onChange={(e) => setTestimonial({ heading: e.target.value })}
            />
          </Field>
          <Field label="Quote">
            <textarea
              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[120px]"
              value={testimonial.quote}
              onChange={(e) => setTestimonial({ quote: e.target.value })}
            />
          </Field>
          <Field label="Author">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={testimonial.author}
              onChange={(e) => setTestimonial({ author: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={testimonial.role}
              onChange={(e) => setTestimonial({ role: e.target.value })}
            />
          </Field>
        </section>

        <section
          className={`rounded-2xl border border-sand/70 bg-white p-6 shadow-sm space-y-4 ${
            activeSection === "instagram" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Instagram Gallery
          </h2>

          <Field label="Link Instagram">
            <input
              className="w-full rounded-xl border border-sand px-4 py-2.5"
              value={instagram.profileUrl || ""}
              onChange={(e) => setInstagram({ profileUrl: e.target.value })}
              placeholder="https://instagram.com/your_account"
            />
          </Field>

          <Field label="Tải nhiều ảnh từ máy">
            <FilePickerButton
              id="upload-instagram-multiple"
              label="Choose images"
              multiple
              onPick={async (files) => {
                if (files.length === 0) return;
                try {
                  const uploaded = [];
                  for (const file of files) {
                    const url = await uploadFile(file);
                    uploaded.push({
                      imageUrl: url,
                      alt: file.name?.replace(/\.[^/.]+$/, "") || "",
                    });
                  }
                  setDraft((d) => {
                    const instagramData = {
                      profileUrl: "",
                      images: [],
                      ...(d.instagram || {}),
                    };
                    return {
                      ...d,
                      instagram: {
                        ...instagramData,
                        images: [...(instagramData.images || []), ...uploaded],
                      },
                    };
                  });
                } catch (err) {
                  alert(err.message || "Upload Instagram images failed");
                }
              }}
            />
          </Field>

          <div className="space-y-4">
            {(instagram.images || []).map((img, index) => (
              <div key={index} className="rounded-xl border border-sand/60 p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeInstagramImage(index)}
                  className="absolute top-2 right-2 text-sm text-red-700 hover:underline cursor-pointer"
                >
                  Xóa
                </button>
                <Field label={`Ảnh ${index + 1} - URL`}>
                  <input
                    className="w-full rounded-xl border border-sand px-4 py-2.5"
                    value={img.imageUrl || ""}
                    onChange={(e) => setInstagramImage(index, { imageUrl: e.target.value })}
                  />
                </Field>
                <Field label="Alt text (tuỳ chọn)">
                  <input
                    className="w-full rounded-xl border border-sand px-4 py-2.5"
                    value={img.alt || ""}
                    onChange={(e) => setInstagramImage(index, { alt: e.target.value })}
                  />
                </Field>
                <ImageThumb src={img.imageUrl} alt={img.alt || `Instagram image ${index + 1}`} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addInstagramImage}
            className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
          >
            + Thêm ảnh Instagram
          </button>

          <p className="text-sm text-warm">
            Tải ảnh hoặc nhập URL ảnh, và đặt link Instagram. Bấm "Lưu tất cả" để hiển thị ngoài website.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-4 sticky bottom-4 bg-cream/95 py-3 rounded-xl border border-sand/60 px-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-charcoal text-cream px-8 py-3 font-medium hover:bg-warm transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Lưu tất cả"}
          </button>
          {saveMsg && <span className="text-sm text-warm">{saveMsg}</span>}
        </div>
          </div>
        </div>
      </form>
    </div>
  );
}
