import { useEffect } from "react";
import { useSite } from "../context/SiteContext";

export default function DocumentMeta() {
  const { content } = useSite();

  useEffect(() => {
    if (!content?.site) return;
    document.title = content.site.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", content.site.description);
  }, [content]);

  return null;
}
