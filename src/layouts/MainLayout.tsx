import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useApp();

  useEffect(() => {
    // In Android WebView builds, Zoho pages often fail when loaded in-app.
    // Route Zoho delivery links to public Google Maps URLs instead.
    const ua = navigator.userAgent || "";
    const isAndroidWebView = /Android/i.test(ua) && (/wv/i.test(ua) || /Version\/\d+\.\d+/i.test(ua));
    if (!isAndroidWebView) return;

    const toGoogleMapsUrl = (zohoUrl: URL): string => {
      const p = zohoUrl.searchParams;
      const lat = p.get("lat") || p.get("latitude");
      const lng = p.get("lng") || p.get("lon") || p.get("longitude");
      const destination = p.get("destination") || p.get("address") || p.get("location") || p.get("q");
      if (lat && lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
      }
      if (destination && destination.trim()) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.trim())}`;
      }
      return "https://www.google.com/maps";
    };

    const onClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      const host = url.hostname.toLowerCase();
      const isZoho = host.endsWith("zoho.com") || host.endsWith("zoho.in") || host.includes(".zoho.");
      if (!isZoho) return;

      ev.preventDefault();
      const mapsUrl = toGoogleMapsUrl(url);
      const opened = window.open(mapsUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Fallback when popup/open call is blocked by shell policy.
        window.location.assign(mapsUrl);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-dash-canvas font-sans selection:bg-dash-lime selection:text-dash-ink">
      <Sidebar />
      <div className="flex min-h-screen flex-col print:ml-0 lg:pl-[284px]">
        <Navbar />
        <main className="flex-1 p-4 lg:p-8 pt-2 lg:pt-2 animate-fade-in relative z-10 w-full max-w-[1600px] mx-auto">
          {isBootstrapping ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-dash-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm font-medium">Loading latest data...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
