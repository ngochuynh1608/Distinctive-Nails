import { useEffect } from "react";
import { useSite } from "../context/SiteContext";

function injectScripts(html, trackingKey) {
  const container = document.createElement("div");
  container.innerHTML = html.trim();
  const injected = [];

  container.querySelectorAll("script").forEach((oldScript) => {
    const script = document.createElement("script");
    for (const attr of oldScript.attributes) {
      script.setAttribute(attr.name, attr.value);
    }
    script.setAttribute("data-bn-tracking", trackingKey);
    if (oldScript.textContent) {
      script.textContent = oldScript.textContent;
    }
    document.head.appendChild(script);
    injected.push(script);
  });

  return injected;
}

function useTrackingScripts(scriptHtml, trackingKey, headMarker) {
  useEffect(() => {
    if (!scriptHtml) return undefined;
    if (document.querySelector(`script[data-bn-tracking="${trackingKey}"]`)) {
      return undefined;
    }
    const headHtml = document.head?.innerHTML || "";
    if (headMarker && headHtml.includes(headMarker)) {
      return undefined;
    }

    const injected = injectScripts(scriptHtml, trackingKey);
    return () => {
      injected.forEach((node) => node.remove());
    };
  }, [scriptHtml, trackingKey, headMarker]);
}

export default function DocumentMeta() {
  const { content } = useSite();
  const adsScript = content?.site?.googleAdsScript?.trim() || "";
  const analyticsScript = content?.site?.googleAnalyticsScript?.trim() || "";

  useEffect(() => {
    if (!content?.site) return;
    document.title = content.site.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", content.site.description);
  }, [content]);

  useTrackingScripts(adsScript, "google-ads", "google-ads-start");
  useTrackingScripts(analyticsScript, "google-analytics", "google-analytics-start");

  return null;
}
