import { useEffect } from "react";
import { useSite } from "../context/SiteContext";

function injectScripts(html) {
  const container = document.createElement("div");
  container.innerHTML = html.trim();
  const injected = [];

  container.querySelectorAll("script").forEach((oldScript) => {
    const script = document.createElement("script");
    for (const attr of oldScript.attributes) {
      script.setAttribute(attr.name, attr.value);
    }
    if (oldScript.textContent) {
      script.textContent = oldScript.textContent;
    }
    document.head.appendChild(script);
    injected.push(script);
  });

  return injected;
}

export default function DocumentMeta() {
  const { content } = useSite();
  const scriptHtml = content?.site?.googleAdsScript?.trim() || "";

  useEffect(() => {
    if (!content?.site) return;
    document.title = content.site.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", content.site.description);
  }, [content]);

  useEffect(() => {
    if (!scriptHtml) return undefined;
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      return undefined;
    }
    const injected = injectScripts(scriptHtml);
    return () => {
      injected.forEach((node) => node.remove());
    };
  }, [scriptHtml]);

  return null;
}
