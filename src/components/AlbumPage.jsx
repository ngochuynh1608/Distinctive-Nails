import { useEffect, useMemo, useState } from "react";
import { useSite } from "../context/SiteContext";

function normalizeInstagram(instagram) {
  const data = instagram || {};
  const folders = Array.isArray(data.folders) ? data.folders : [];
  const images = Array.isArray(data.images) ? data.images : [];
  return {
    profileUrl: data.profileUrl?.trim() || "https://instagram.com",
    folders: folders.map((f, idx) => ({
      id: (f?.id ?? `folder-${idx + 1}`).toString(),
      name: (f?.name ?? "").toString().trim() || `Folder ${idx + 1}`,
      designType: (f?.designType ?? "").toString().trim(),
      parentId: (f?.parentId ?? "").toString(),
    })),
    images: images.map((img) => ({
      imageUrl: (img?.imageUrl ?? "").toString(),
      alt: (img?.alt ?? "").toString(),
      folderId: (img?.folderId ?? "").toString(),
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

export default function AlbumPage() {
  const { content } = useSite();
  const instagram = normalizeInstagram(content.instagram);
  const [sortBy, setSortBy] = useState("newest");
  const [filterFolderId, setFilterFolderId] = useState("all");
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  const folderMap = useMemo(() => {
    const map = new Map();
    instagram.folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [instagram.folders]);
  const allImages = useMemo(
    () =>
      instagram.images
        .map((img, idx) => ({ ...img, _idx: idx }))
        .filter((img) => img.imageUrl.trim()),
    [instagram.images],
  );

  const filteredAndSortedImages = useMemo(() => {
    const filtered =
      filterFolderId === "all" ? allImages : allImages.filter((img) => img.folderId === filterFolderId);
    const next = [...filtered];
    if (sortBy === "oldest") {
      next.sort((a, b) => a._idx - b._idx);
    } else if (sortBy === "name") {
      next.sort((a, b) => (a.alt || "").localeCompare(b.alt || ""));
    } else if (sortBy === "folder") {
      next.sort((a, b) => {
        const aFolder = a.folderId ? getFolderPath(a.folderId, folderMap) : "";
        const bFolder = b.folderId ? getFolderPath(b.folderId, folderMap) : "";
        return aFolder.localeCompare(bFolder);
      });
    } else if (sortBy === "designType") {
      next.sort((a, b) => {
        const aType = folderMap.get(a.folderId)?.designType || "";
        const bType = folderMap.get(b.folderId)?.designType || "";
        return aType.localeCompare(bType);
      });
    } else {
      next.sort((a, b) => b._idx - a._idx);
    }
    return next;
  }, [allImages, sortBy, folderMap, filterFolderId]);

  useEffect(() => {
    setPage(1);
  }, [filterFolderId, sortBy]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedImages.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedImages = filteredAndSortedImages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main className="pt-[var(--header-offset)]">
      <section className="py-16 md:py-20 px-4 md:px-8 bg-cream border-y border-sand/60 min-h-[70vh]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="font-serif text-rose text-lg italic mb-2">Gallery</p>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-2">
                All Salon Albums
              </h1>
              <p className="text-warm text-sm md:text-base">
                Browse all uploaded designs by folder and style type.
              </p>
            </div>
            <a
              href={instagram.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-charcoal/20 text-charcoal text-sm font-medium hover:border-charcoal hover:bg-charcoal/5 transition-colors"
            >
              Open Instagram
            </a>
          </div>

          <div className="rounded-2xl border border-sand/60 bg-white p-4 md:p-5 mb-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterFolderId("all")}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  filterFolderId === "all"
                    ? "bg-charcoal border-charcoal text-cream"
                    : "bg-cream/60 border-sand/70 text-charcoal hover:bg-cream"
                }`}
              >
                All
              </button>
              {instagram.folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setFilterFolderId(folder.id)}
                  className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                    filterFolderId === folder.id
                      ? "bg-charcoal border-charcoal text-cream"
                      : "bg-cream/60 border-sand/70 text-charcoal hover:bg-cream"
                  }`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <label className="text-sm text-warm inline-flex items-center gap-2">
              <span>Sort</span>
              <select
                className="rounded-lg border border-sand px-3 py-2 text-charcoal bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name (A-Z)</option>
                <option value="folder">Folder (A-Z)</option>
                <option value="designType">Design type (A-Z)</option>
              </select>
            </label>
          </div>

          {filteredAndSortedImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {pagedImages.map((img, idx) => {
                  const absoluteIndex = (currentPage - 1) * pageSize + idx;
                  return (
                    <button
                      key={`${img.imageUrl}-${absoluteIndex}`}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className="group rounded-2xl overflow-hidden bg-sand/40 text-left cursor-zoom-in"
                    >
                      <div className="aspect-[4/5]">
                        <img
                          src={img.imageUrl}
                          alt={img.alt || `Album image ${absoluteIndex + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-sand px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-warm">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-sand px-3 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-sand/80 bg-white p-8 text-center text-warm text-sm">
              No images yet.
            </div>
          )}
        </div>
      </section>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[120] bg-charcoal/85 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/90 border border-sand px-3 py-1.5 text-sm text-charcoal hover:bg-white"
            onClick={() => setActiveImage(null)}
          >
            Close
          </button>
          <img
            src={activeImage.imageUrl}
            alt={activeImage.alt || "Album image"}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </main>
  );
}
