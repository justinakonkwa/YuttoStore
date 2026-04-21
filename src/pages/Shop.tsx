import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { fetchProducts, getCategories, getSubCategories } from "@/services/products";
import { useFilters } from "@/store/filters";
import type { Product } from "@/types";
import { SlidersHorizontal, X, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const Shop = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [params] = useSearchParams();
  const [mobileFilters, setMobileFilters] = useState(false);
  const f = useFilters();
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // Sync URL params → filters
  useEffect(() => {
    const cat = params.get("cat");
    const sort = params.get("sort") as any;
    if (cat && !f.categories.includes(cat)) f.set("categories", [cat]);
    if (sort) f.set("sort", sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const q = params.get("q")?.toLowerCase() ?? "";

  const categories = useMemo(() => getCategories(products ?? []), [products]);
  const subCategories = useMemo(() => getSubCategories(products ?? []), [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let res = products.filter((p) => {
      if (q && !`${p.name} ${p.category} ${p.subCategory} ${p.description}`.toLowerCase().includes(q))
        return false;
      if (f.categories.length && !f.categories.includes(p.category)) return false;
      if (f.subCategories.length && !f.subCategories.includes(p.subCategory)) return false;
      if (p.price < f.priceRange[0] || p.price > f.priceRange[1]) return false;
      if (f.inStockOnly && p.stock === 0) return false;
      return true;
    });
    switch (f.sort) {
      case "price-asc": res = [...res].sort((a, b) => a.price - b.price); break;
      case "price-desc": res = [...res].sort((a, b) => b.price - a.price); break;
      case "name-asc": res = [...res].sort((a, b) => a.name.localeCompare(b.name)); break;
      default: res = [...res].sort((a, b) => b.date.localeCompare(a.date));
    }
    return res;
  }, [products, f, q]);

  const toggleCat = (cat: string) => {
    if (cat === "all") { f.set("categories", []); return; }
    f.set("categories", f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [cat]);
  };

  return (
    <div className="fade-in">
      {/* ── Chips catégories (mobile + desktop) ─────────────────────────── */}
      <div className="sticky top-[105px] md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div
          ref={chipsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Chip "Tout voir" */}
          <button
            onClick={() => toggleCat("all")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-smooth whitespace-nowrap",
              f.categories.length === 0
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-secondary/60 text-foreground/70 border-border hover:border-accent"
            )}
          >
            <LayoutGrid className="h-3 w-3" />
            Tout voir
          </button>

          {/* Chips catégories dynamiques */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-smooth whitespace-nowrap",
                f.categories.includes(cat)
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary/60 text-foreground/70 border-border hover:border-accent"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif-display text-2xl md:text-4xl">
              {f.categories.length === 1 ? f.categories[0] : "Tous les produits"}
            </h1>
            <p className="text-foreground/50 text-sm mt-0.5">
              {products === null ? "Chargement…" : `${filtered.length} produit${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtres mobile */}
            <button
              onClick={() => setMobileFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 text-sm border border-border px-3 py-2 rounded-xl hover:border-accent transition-smooth"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>

            {/* Tri */}
            <select
              value={f.sort}
              onChange={(e) => f.set("sort", e.target.value as any)}
              className="bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="newest">Plus récents</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
              <option value="name-asc">A → Z</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar desktop */}
          <div className="hidden lg:block sticky top-36 self-start">
            <FilterSidebar categories={categories} subCategories={subCategories} />
          </div>

          {/* Grille produits */}
          <div>
            {products === null ? (
              /* Skeleton — 2 colonnes sur mobile, 3 sur desktop */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif-display text-3xl mb-3">Aucun résultat.</p>
                <p className="text-foreground/60 mb-6">Essayez d'élargir vos filtres.</p>
                <button
                  onClick={f.reset}
                  className="text-sm uppercase tracking-wider border-b border-accent text-accent pb-1"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              /* 2 colonnes sur mobile, 3 sur desktop */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer filtres mobile */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] bg-background lg:hidden overflow-y-auto">
          <div className="container py-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif-display text-2xl">Filtres</h2>
              <button onClick={() => setMobileFilters(false)} aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterSidebar categories={categories} subCategories={subCategories} />
            <button
              onClick={() => setMobileFilters(false)}
              className="w-full mt-10 bg-foreground text-background py-4 rounded-xl text-sm uppercase tracking-wider"
            >
              Voir {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
