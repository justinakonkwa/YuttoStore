import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchPromoImages, type PromoImage } from "@/services/settings";
import { cn } from "@/lib/utils";

export const PromoBanner = () => {
  const [promo, setPromo] = useState<PromoImage | null>(null);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPromoImages().then((data) => {
      setPromo(data);
      setLoaded(true);
    });
  }, []);

  const images = promo
    ? [
        promo.url ? { url: promo.url, link: promo.link } : null,
        promo.url_2 ? { url: promo.url_2, link: promo.link_2 } : null,
      ].filter(Boolean) as { url: string; link?: string }[]
    : [];

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  // Auto-slide toutes les 5s si plusieurs images
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [images.length, next]);

  if (!loaded || images.length === 0 || dismissed) return null;

  const slide = images[current];

  const Inner = (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-elegant">
      <img
        src={slide.url}
        alt="Promotion"
        className="w-full object-cover max-h-[420px] transition-opacity duration-500"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Dismiss */}
      <button
        onClick={(e) => { e.preventDefault(); setDismissed(true); }}
        className="absolute top-3 right-3 h-8 w-8 grid place-items-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-smooth"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-smooth"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-10 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-smooth"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return slide.link ? (
    <Link to={slide.link} className="block">
      {Inner}
    </Link>
  ) : (
    Inner
  );
};
