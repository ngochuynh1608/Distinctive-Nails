import { createContext, useCallback, useContext, useEffect, useState } from "react";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("Không tải được nội dung");
        return r.json();
      })
      .then(setContent)
      .catch((e) => setError(e.message ?? "Lỗi mạng"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <SiteContext.Provider value={{ content, loading, error, reload }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const v = useContext(SiteContext);
  if (!v) throw new Error("useSite must be used within SiteProvider");
  return v;
}
