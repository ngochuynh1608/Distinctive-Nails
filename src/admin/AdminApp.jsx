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

const emptyPriceGroup = () => ({
  name: "",
  description: "",
  items: [emptyPrice()],
});

const emptyPriceService = () => ({
  name: "",
  description: "",
  groups: [emptyPriceGroup()],
});

function normalizeHero(h) {
  if (!h || typeof h !== "object") {
    return {
      eyebrow: "",
      title: "",
      subtitle: "",
      imageUrl: "",
      imageUrlDesktop: "",
      imageUrlMobile: "",
    };
  }
  return {
    ...h,
    imageUrl: String(h.imageUrl ?? "").trim(),
    imageUrlDesktop: String(h.imageUrlDesktop ?? "").trim(),
    imageUrlMobile: String(h.imageUrlMobile ?? "").trim(),
  };
}

function normalizeInstagramData(instagram) {
  const data = instagram || {};
  const folders = Array.isArray(data.folders) ? data.folders : [];
  const images = Array.isArray(data.images) ? data.images : [];
  return {
    ...data,
    profileUrl: String(data.profileUrl ?? ""),
    folders: folders.map((folder, idx) => ({
      id: String(folder?.id ?? `folder-${idx + 1}`),
      name: String(folder?.name ?? "").trim() || `Folder ${idx + 1}`,
      designType: String(folder?.designType ?? "").trim(),
      parentId: String(folder?.parentId ?? ""),
    })),
    images: images.map((img) => ({
      imageUrl: String(img?.imageUrl ?? ""),
      alt: String(img?.alt ?? ""),
      folderId: String(img?.folderId ?? ""),
    })),
  };
}

function getFolderPath(folderId, folderMap) {
  const visited = new Set();
  const parts = [];
  let currentId = folderId;
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const folder = folderMap.get(currentId);
    if (!folder) break;
    parts.unshift(folder.name);
    currentId = folder.parentId || "";
  }
  return parts.join(" / ");
}

function normalizePricingData(p) {
  let pricing = p;
  if (!Array.isArray(p?.services)) {
    const legacyItems = Array.isArray(p?.items) ? p.items : [];
    pricing = {
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
  const services = (pricing.services || []).map((svc) => {
    if (Array.isArray(svc?.groups) && svc.groups.length > 0) {
      return {
        ...svc,
        groups: svc.groups.map((g) => ({
          name: g?.name ?? "",
          description: g?.description ?? "",
          items:
            Array.isArray(g?.items) && g.items.length > 0 ? g.items : [emptyPrice()],
        })),
      };
    }
    const legacyItems = Array.isArray(svc?.items) && svc.items.length > 0 ? svc.items : [emptyPrice()];
    return {
      ...svc,
      groups: [{ name: "", description: "", items: legacyItems }],
    };
  });
  return { ...pricing, services };
}

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
  /** Bảng giá: true = thu gọn (admin) */
  const [pricingSvcCollapsed, setPricingSvcCollapsed] = useState({});
  const [pricingGrpCollapsed, setPricingGrpCollapsed] = useState({});
  const [instagramActiveFolderId, setInstagramActiveFolderId] = useState("all");

  const loadContent = useCallback(async () => {
    setLoadErr("");
    try {
      const r = await fetch("/api/content");
      if (!r.ok) throw new Error("Không tải được dữ liệu");
      const j = await r.json();
      setDraft({
        ...j,
        hero: normalizeHero(j.hero),
        instagram: normalizeInstagramData(j.instagram),
        pricing: normalizePricingData(j.pricing || {}),
      });
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
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      services[serviceIndex] = { ...services[serviceIndex], ...patch };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function addPriceService() {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      return {
        ...d,
        pricing: { ...pricing, services: [...pricing.services, emptyPriceService()] },
      };
    });
  }

  function removePriceService(serviceIndex) {
    setPricingSvcCollapsed((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) {
        const i = Number(k);
        if (Number.isNaN(i)) continue;
        if (i < serviceIndex) next[k] = prev[k];
        else if (i > serviceIndex) next[String(i - 1)] = prev[k];
      }
      return next;
    });
    setPricingGrpCollapsed((prev) => {
      const next = {};
      for (const [key, v] of Object.entries(prev)) {
        const [si, gi] = key.split("-").map(Number);
        if (Number.isNaN(si) || Number.isNaN(gi)) continue;
        if (si < serviceIndex) next[key] = v;
        else if (si > serviceIndex) next[`${si - 1}-${gi}`] = v;
      }
      return next;
    });
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      return {
        ...d,
        pricing: {
          ...pricing,
          services: pricing.services.filter((_, i) => i !== serviceIndex),
        },
      };
    });
  }

  function setPriceGroup(serviceIndex, groupIndex, patch) {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const groups = [...(services[serviceIndex].groups || [])];
      groups[groupIndex] = { ...groups[groupIndex], ...patch };
      services[serviceIndex] = { ...services[serviceIndex], groups };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function addPriceGroup(serviceIndex) {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const groups = [...(services[serviceIndex].groups || []), emptyPriceGroup()];
      services[serviceIndex] = { ...services[serviceIndex], groups };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function removePriceGroup(serviceIndex, groupIndex) {
    setPricingGrpCollapsed((prev) => {
      const next = {};
      for (const [key, v] of Object.entries(prev)) {
        const [si, gi] = key.split("-").map(Number);
        if (Number.isNaN(si) || Number.isNaN(gi)) continue;
        if (si !== serviceIndex) {
          next[key] = v;
          continue;
        }
        if (gi < groupIndex) next[key] = v;
        else if (gi > groupIndex) next[`${si}-${gi - 1}`] = v;
      }
      return next;
    });
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const nextGroups = (services[serviceIndex].groups || []).filter((_, i) => i !== groupIndex);
      services[serviceIndex] = {
        ...services[serviceIndex],
        groups: nextGroups.length > 0 ? nextGroups : [emptyPriceGroup()],
      };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function setPriceItemByGroup(serviceIndex, groupIndex, itemIndex, patch) {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const groups = [...(services[serviceIndex].groups || [])];
      const items = [...(groups[groupIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], ...patch };
      groups[groupIndex] = { ...groups[groupIndex], items };
      services[serviceIndex] = { ...services[serviceIndex], groups };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function addPriceItemToGroup(serviceIndex, groupIndex) {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const groups = [...(services[serviceIndex].groups || [])];
      const items = [...(groups[groupIndex].items || []), emptyPrice()];
      groups[groupIndex] = { ...groups[groupIndex], items };
      services[serviceIndex] = { ...services[serviceIndex], groups };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function removePriceItemFromGroup(serviceIndex, groupIndex, itemIndex) {
    setDraft((d) => {
      const pricing = normalizePricingData(d.pricing);
      const services = [...pricing.services];
      const groups = [...(services[serviceIndex].groups || [])];
      const items = (groups[groupIndex].items || []).filter((_, i) => i !== itemIndex);
      groups[groupIndex] = {
        ...groups[groupIndex],
        items: items.length > 0 ? items : [emptyPrice()],
      };
      services[serviceIndex] = { ...services[serviceIndex], groups };
      return { ...d, pricing: { ...pricing, services } };
    });
  }

  function togglePricingServiceCollapse(i) {
    setPricingSvcCollapsed((p) => ({ ...p, [i]: p[i] !== true }));
  }
  function togglePricingGroupCollapse(si, gi) {
    const key = `${si}-${gi}`;
    setPricingGrpCollapsed((p) => ({ ...p, [key]: p[key] !== true }));
  }
  function isPricingServiceExpanded(i) {
    return pricingSvcCollapsed[i] !== true;
  }
  function isPricingGroupExpanded(si, gi) {
    return pricingGrpCollapsed[`${si}-${gi}`] !== true;
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

  const pricing = normalizePricingData(draft.pricing);
  const instagram = normalizeInstagramData(draft.instagram);
  const folderMap = new Map((instagram.folders || []).map((folder) => [folder.id, folder]));
  const effectiveInstagramFolderId =
    instagramActiveFolderId === "all" ||
    (instagram.folders || []).some((folder) => folder.id === instagramActiveFolderId)
      ? instagramActiveFolderId
      : "all";
  const instagramVisibleImages =
    effectiveInstagramFolderId === "all"
      ? (instagram.images || []).map((img, idx) => ({ ...img, _index: idx }))
      : (instagram.images || [])
          .map((img, idx) => ({ ...img, _index: idx }))
          .filter((img) => (img?.folderId || "") === effectiveInstagramFolderId);

  function removeInstagramImage(index) {
    setDraft((d) => {
      const instagramData = normalizeInstagramData(d.instagram);
      return {
        ...d,
        instagram: {
          ...instagramData,
          images: (instagramData.images || []).filter((_, i) => i !== index),
        },
      };
    });
  }

  function setInstagramFolder(index, patch) {
    setDraft((d) => {
      const instagramData = normalizeInstagramData(d.instagram);
      const folders = [...(instagramData.folders || [])];
      folders[index] = { ...folders[index], ...patch };
      return { ...d, instagram: { ...instagramData, folders } };
    });
  }

  function addInstagramFolder() {
    setDraft((d) => {
      const instagramData = normalizeInstagramData(d.instagram);
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `folder-${Date.now()}`;
      return {
        ...d,
        instagram: {
          ...instagramData,
          folders: [
            ...(instagramData.folders || []),
            {
              id,
              name: `New folder ${(instagramData.folders || []).length + 1}`,
              designType: "",
              parentId: "",
            },
          ],
        },
      };
    });
  }

  function removeInstagramFolder(index) {
    setDraft((d) => {
      const instagramData = normalizeInstagramData(d.instagram);
      const target = instagramData.folders[index];
      const nextFolders = (instagramData.folders || []).filter((_, i) => i !== index);
      const removedId = target?.id || "";
      const sanitizeParent = (folder) => {
        if (!removedId) return folder;
        return folder.parentId === removedId ? { ...folder, parentId: "" } : folder;
      };
      const nextImages = (instagramData.images || []).map((img) =>
        target && img.folderId === target.id ? { ...img, folderId: "" } : img,
      );
      return {
        ...d,
        instagram: {
          ...instagramData,
          folders: nextFolders.map(sanitizeParent),
          images: nextImages,
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

  function defaultHeaderMenuItems() {
    return [
      { key: "home", label: "Home", href: "/", enabled: true },
      { key: "about", label: "About Us", href: "#about-us", enabled: true },
      { key: "services", label: "Services", href: "#services", enabled: true },
      { key: "gallery", label: "Gallery", href: "#instagram", enabled: true },
      { key: "promotion", label: "Promotion", href: "#promotion", enabled: !!promotion.enabled },
      { key: "contact", label: "Contact Us", href: "#book", enabled: true },
    ];
  }

  const sectionTabs = [
    { id: "general", label: "Chung", icon: "🏢" },
    { id: "menu", label: "Menu", icon: "🧭" },
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
            activeSection === "menu" ? "block" : "hidden"
          }`}
        >
          <h2 className="font-serif text-lg font-semibold border-b border-sand/60 pb-2">
            Menu header (đổi tên/tắt-bật/thêm mục)
          </h2>

          {(() => {
            const menuItems = Array.isArray(draft?.site?.menu)
              ? draft.site.menu
              : defaultHeaderMenuItems();

            function setMenuItems(next) {
              setSite({ menu: next });
            }

            function updateItem(itemIndex, patch) {
              const next = [...menuItems];
              next[itemIndex] = { ...next[itemIndex], ...patch };
              setMenuItems(next);
            }

            function removeItem(itemIndex) {
              const next = menuItems.filter((_, i) => i !== itemIndex);
              setMenuItems(next);
            }

            function addItem() {
              const newItem = {
                key:
                  (typeof crypto !== "undefined" && crypto?.randomUUID?.()) ||
                  `menu-${Date.now()}`,
                label: "New menu item",
                href: "",
                enabled: true,
              };
              setMenuItems([...menuItems, newItem]);
            }

            return (
              <div className="space-y-4">
                <p className="text-sm text-warm">
                  Nhập link dạng anchor như <span className="font-mono">#services</span>, hoặc link ngoài.
                </p>

                <div className="space-y-3">
                  {menuItems.map((item, itemIndex) => (
                    <div
                      key={item.key ?? itemIndex}
                      className="rounded-xl border border-sand/60 p-4 space-y-3 relative bg-cream/20"
                    >
                      <button
                        type="button"
                        onClick={() => removeItem(itemIndex)}
                        className="absolute top-3 right-3 text-xs text-red-700 hover:underline cursor-pointer"
                      >
                        Xóa
                      </button>

                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={(e) => updateItem(itemIndex, { enabled: e.target.checked })}
                          />
                          Enabled
                        </label>
                      </div>

                      <Field label={`Tên item menu (${itemIndex + 1})`}>
                        <input
                          className="w-full rounded-xl border border-sand px-4 py-2.5"
                          value={item.label || ""}
                          onChange={(e) => updateItem(itemIndex, { label: e.target.value })}
                        />
                      </Field>

                      <Field label="Link (href)">
                        <input
                          className="w-full rounded-xl border border-sand px-4 py-2.5"
                          value={item.href || ""}
                          onChange={(e) => updateItem(itemIndex, { href: e.target.value })}
                        />
                      </Field>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
                >
                  + Thêm mục menu
                </button>
              </div>
            );
          })()}
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
          <p className="text-xs text-warm leading-relaxed">
            Desktop từ 768px trở lên; mobile từ 767px trở xuống. Để trống mobile sẽ dùng ảnh desktop. Nếu
            chưa điền desktop, site vẫn dùng ảnh hero đã lưu trước đó (một ảnh chung).
          </p>
          <Field label="Ảnh hero — Desktop (URL hoặc upload)">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                value={draft.hero.imageUrlDesktop}
                onChange={(e) => setHero({ imageUrlDesktop: e.target.value })}
                placeholder={draft.hero.imageUrl || "https://…"}
              />
              <FilePickerButton
                id="upload-hero-desktop"
                label="Upload desktop"
                onPick={async (files) => {
                  const f = files[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setHero({ imageUrlDesktop: url });
                  } catch (err) {
                    alert(err.message);
                  }
                }}
              />
            </div>
            <ImageThumb
              src={draft.hero.imageUrlDesktop || draft.hero.imageUrl}
              alt="Hero desktop preview"
            />
          </Field>
          <Field label="Ảnh hero — Mobile (URL hoặc upload)">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded-xl border border-sand px-4 py-2.5"
                value={draft.hero.imageUrlMobile}
                onChange={(e) => setHero({ imageUrlMobile: e.target.value })}
              />
              <FilePickerButton
                id="upload-hero-mobile"
                label="Upload mobile"
                onPick={async (files) => {
                  const f = files[0];
                  if (!f) return;
                  try {
                    const url = await uploadFile(f);
                    setHero({ imageUrlMobile: url });
                  } catch (err) {
                    alert(err.message);
                  }
                }}
              />
            </div>
            <ImageThumb
              src={draft.hero.imageUrlMobile || draft.hero.imageUrlDesktop || draft.hero.imageUrl}
              alt="Hero mobile preview"
            />
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
            {pricing.services.map((service, serviceIndex) => {
              const svcOpen = isPricingServiceExpanded(serviceIndex);
              const nGroups = (service.groups || []).length;
              return (
                <div
                  key={serviceIndex}
                  className="rounded-xl border border-sand/60 overflow-hidden relative bg-white"
                >
                  <div className="flex items-center gap-2 border-b border-sand/55 bg-cream/35 px-3 py-2.5 pr-24">
                    <button
                      type="button"
                      onClick={() => togglePricingServiceCollapse(serviceIndex)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sand/80 bg-white text-charcoal hover:bg-cream transition-colors cursor-pointer"
                      aria-expanded={svcOpen}
                      aria-label={svcOpen ? "Thu gọn service" : "Mở rộng service"}
                    >
                      <span
                        className={`inline-block text-[10px] leading-none transition-transform duration-200 ${
                          svcOpen ? "rotate-90" : ""
                        }`}
                        aria-hidden
                      >
                        ▶
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-warm">
                        Service {serviceIndex + 1}
                      </span>
                      <p className="truncate text-sm font-medium text-charcoal">
                        {service.name?.trim() || "Chưa đặt tên"}
                      </p>
                      <p className="text-xs text-warm/85">
                        {nGroups} nhóm con
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePriceService(serviceIndex)}
                      className="absolute top-2 right-2 text-sm text-red-700 hover:underline cursor-pointer"
                    >
                      Xóa service
                    </button>
                  </div>

                  {svcOpen ? (
                    <div className="space-y-4 p-4">
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
                          onChange={(e) =>
                            setPriceService(serviceIndex, { description: e.target.value })
                          }
                        />
                      </Field>

                      <div className="mt-1 ml-2 sm:ml-4 space-y-4 rounded-r-lg border-l-[3px] border-rose/35 bg-cream/60 py-4 pl-4 sm:pl-5 pr-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-warm/90">
                          Nhóm con (vd: MANICURE / PEDICURE) — mỗi nhóm có danh sách giá
                        </p>
                        {(service.groups || []).map((group, groupIndex) => {
                          const grpOpen = isPricingGroupExpanded(serviceIndex, groupIndex);
                          const nItems = (group.items || []).length;
                          return (
                            <div
                              key={groupIndex}
                              className={`relative rounded-xl border border-sand/55 border-l-[4px] border-l-rose/45 bg-white/90 shadow-sm ${
                                groupIndex > 0
                                  ? "border-t border-dashed border-sand/70 pt-5 mt-1"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 border-b border-sand/45 px-3 py-2.5 pr-24">
                                <button
                                  type="button"
                                  onClick={() => togglePricingGroupCollapse(serviceIndex, groupIndex)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sand/80 bg-cream/80 text-charcoal hover:bg-cream transition-colors cursor-pointer"
                                  aria-expanded={grpOpen}
                                  aria-label={grpOpen ? "Thu gọn nhóm" : "Mở rộng nhóm"}
                                >
                                  <span
                                    className={`inline-block text-[10px] leading-none transition-transform duration-200 ${
                                      grpOpen ? "rotate-90" : ""
                                    }`}
                                    aria-hidden
                                  >
                                    ▶
                                  </span>
                                </button>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
                                    Nhóm {groupIndex + 1}
                                  </span>
                                  <p className="truncate text-sm font-medium text-charcoal">
                                    {group.name?.trim() || "Chưa đặt tên"}
                                  </p>
                                  <p className="text-xs text-warm/85">{nItems} dòng giá</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePriceGroup(serviceIndex, groupIndex)}
                                  className="absolute top-2 right-2 text-xs text-red-700 hover:underline cursor-pointer"
                                >
                                  Xóa nhóm
                                </button>
                              </div>

                              {grpOpen ? (
                                <div className="space-y-3 p-4">
                                  <div className="pr-2 sm:pr-12">
                                    <Field label={`Nhóm ${groupIndex + 1} — Tên (vd: MANICURE)`}>
                                      <input
                                        className="w-full rounded-xl border border-sand px-4 py-2.5"
                                        value={group.name || ""}
                                        onChange={(e) =>
                                          setPriceGroup(serviceIndex, groupIndex, {
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <Field label="Mô tả nhóm (tuỳ chọn)">
                                      <textarea
                                        className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[48px]"
                                        value={group.description || ""}
                                        onChange={(e) =>
                                          setPriceGroup(serviceIndex, groupIndex, {
                                            description: e.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                  </div>
                                  <div className="border-t border-sand/65 pt-4 mt-1">
                                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-charcoal/55">
                                      Dòng giá trong nhóm
                                    </p>
                                    <div className="ml-1 space-y-3 border-l-[3px] border-charcoal/20 pl-4 sm:ml-2 sm:pl-5">
                                      {(group.items || []).map((item, itemIndex) => (
                                        <div
                                          key={itemIndex}
                                          className="relative rounded-lg border border-sand/65 bg-cream/50 py-3 pl-4 sm:pl-5 pr-3 space-y-2"
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removePriceItemFromGroup(
                                                serviceIndex,
                                                groupIndex,
                                                itemIndex
                                              )
                                            }
                                            className="absolute top-2 right-2 text-xs text-red-700 hover:underline cursor-pointer"
                                          >
                                            Xóa item
                                          </button>
                                          <Field label={`Item ${itemIndex + 1} — Tên`}>
                                            <input
                                              className="w-full rounded-xl border border-sand px-4 py-2.5"
                                              value={item.name}
                                              onChange={(e) =>
                                                setPriceItemByGroup(
                                                  serviceIndex,
                                                  groupIndex,
                                                  itemIndex,
                                                  { name: e.target.value }
                                                )
                                              }
                                            />
                                          </Field>
                                          <Field label="Giá">
                                            <input
                                              className="w-full rounded-xl border border-sand px-4 py-2.5"
                                              value={item.price}
                                              onChange={(e) =>
                                                setPriceItemByGroup(
                                                  serviceIndex,
                                                  groupIndex,
                                                  itemIndex,
                                                  { price: e.target.value }
                                                )
                                              }
                                            />
                                          </Field>
                                          <Field label="Mô tả item (tuỳ chọn)">
                                            <textarea
                                              className="w-full rounded-xl border border-sand px-4 py-2.5 min-h-[60px]"
                                              value={item.description}
                                              onChange={(e) =>
                                                setPriceItemByGroup(
                                                  serviceIndex,
                                                  groupIndex,
                                                  itemIndex,
                                                  { description: e.target.value }
                                                )
                                              }
                                            />
                                          </Field>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => addPriceItemToGroup(serviceIndex, groupIndex)}
                                      className="mt-2 rounded-full border border-charcoal/30 bg-white px-4 py-2 text-sm text-charcoal hover:bg-cream cursor-pointer"
                                    >
                                      + Thêm item trong nhóm này
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => addPriceGroup(serviceIndex)}
                          className="rounded-full border border-charcoal px-4 py-2 text-sm hover:bg-cream cursor-pointer"
                        >
                          + Thêm nhóm con (MANICURE / PEDICURE…)
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
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

          <div className="rounded-xl border border-sand/60 p-4 space-y-3 bg-cream/30">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-charcoal">Folders (computer style: parent / child)</h3>
              <button
                type="button"
                onClick={addInstagramFolder}
                className="rounded-full border border-charcoal px-3.5 py-1.5 text-sm hover:bg-cream cursor-pointer"
              >
                + Create folder
              </button>
            </div>
            {(instagram.folders || []).length > 0 ? (
              <div className="space-y-3">
                {(instagram.folders || []).map((folder, folderIndex) => (
                  <div
                    key={folder.id || folderIndex}
                    className="rounded-lg border border-sand/60 bg-white p-3 relative grid md:grid-cols-3 gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => removeInstagramFolder(folderIndex)}
                      className="absolute top-2 right-2 text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Xóa folder
                    </button>
                    <Field label="Folder name">
                      <input
                        className="w-full rounded-xl border border-sand px-4 py-2.5"
                        value={folder.name || ""}
                        onChange={(e) => setInstagramFolder(folderIndex, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="Parent folder">
                      <select
                        className="w-full rounded-xl border border-sand px-4 py-2.5 bg-white"
                        value={folder.parentId || ""}
                        onChange={(e) => setInstagramFolder(folderIndex, { parentId: e.target.value })}
                      >
                        <option value="">(root)</option>
                        {(instagram.folders || [])
                          .filter((it) => it.id !== folder.id)
                          .map((it) => (
                            <option key={it.id} value={it.id}>
                              {getFolderPath(it.id, folderMap)}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Design type">
                      <input
                        className="w-full rounded-xl border border-sand px-4 py-2.5"
                        value={folder.designType || ""}
                        onChange={(e) =>
                          setInstagramFolder(folderIndex, { designType: e.target.value })
                        }
                        placeholder="e.g. Ombre, French, Cat Eye"
                      />
                    </Field>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warm">
                Chưa có folder. Tạo folder và chọn parent để có cấu trúc thư mục con giống máy tính.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-sand/60 p-4 bg-white space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-warm/90">
              Xem ảnh theo folder
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInstagramActiveFolderId("all")}
                className={`rounded-full border px-3.5 py-1.5 text-sm cursor-pointer ${
                  effectiveInstagramFolderId === "all"
                    ? "bg-charcoal border-charcoal text-cream"
                    : "bg-cream/50 border-sand/70 text-charcoal hover:bg-cream"
                }`}
              >
                All images ({(instagram.images || []).length})
              </button>
              {(instagram.folders || []).map((folder) => {
                const id = folder.id || "";
                const count = (instagram.images || []).filter((img) => (img?.folderId || "") === id).length;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setInstagramActiveFolderId(id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm cursor-pointer ${
                      effectiveInstagramFolderId === id
                        ? "bg-charcoal border-charcoal text-cream"
                        : "bg-cream/50 border-sand/70 text-charcoal hover:bg-cream"
                    }`}
                  >
                    {folder.name || "Folder"} ({count})
                  </button>
                );
              })}
            </div>
            <div className="pt-1">
              <FilePickerButton
                id="upload-instagram-by-folder"
                label="Thêm nhiều ảnh vào folder đang chọn"
                multiple
                onPick={async (files) => {
                  if (files.length === 0) return;
                  if ((instagram.folders || []).length > 0 && effectiveInstagramFolderId === "all") {
                    alert("Vui lòng chọn folder trước khi tải ảnh.");
                    return;
                  }
                  const targetFolderId = effectiveInstagramFolderId === "all" ? "" : effectiveInstagramFolderId;
                  try {
                    const uploaded = [];
                    for (const file of files) {
                      const url = await uploadFile(file);
                      uploaded.push({
                        imageUrl: url,
                        alt: file.name?.replace(/\.[^/.]+$/, "") || "",
                        folderId: targetFolderId,
                      });
                    }
                    setDraft((d) => {
                      const instagramData = normalizeInstagramData(d.instagram);
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
            </div>
          </div>

          <div className="space-y-4">
            {instagramVisibleImages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sand/70 bg-cream/20 p-4 text-sm text-warm">
                Folder này chưa có ảnh.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {instagramVisibleImages.map((img, index) => (
                  <div
                    key={img._index ?? index}
                    className="group relative overflow-hidden rounded-xl border border-sand/60 bg-cream/30 aspect-[4/5]"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt || `Instagram image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => removeInstagramImage(img._index)}
                      className="absolute top-2 right-2 rounded-full bg-white/90 border border-sand px-2 py-1 text-xs text-red-700 hover:bg-white cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-warm">
            Chọn folder rồi tải nhiều ảnh cùng lúc. Bấm "Lưu tất cả" để hiển thị ngoài website.
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
