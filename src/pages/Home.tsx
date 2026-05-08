import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Zap,
  BadgeCheck,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { fetchFeaturedProducts, getCategories } from "@/services/products";
import { fetchPromoImages } from "@/services/settings";
import { useFilters } from "@/store/filters";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [heroSlides, setHeroSlides] = useState<{ url: string }[]>([]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const heroBackgroundStyle = {
    backgroundImage: `linear-gradient(to right, hsl(0 0% 7% / 0.92), hsl(0 0% 7% / 0.78)), url('${
      heroSlides[heroSlideIndex]?.url ?? "/hero-achetez-mieux.png"
    }')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as const;

  const [products, setProducts] = useState<Product[] | null>(null);
  const f = useFilters();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts(12).then(setProducts);
  }, []);

  useEffect(() => {
    fetchPromoImages().then((data) => {
      if (!data) return;
      const slides = [data.url, data.url_2].filter(Boolean).map((url) => ({ url })) as { url: string }[];
      if (slides.length > 0) {
        setHeroSlides(slides);
      }
    });
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = window.setInterval(() => {
      setHeroSlideIndex((i) => (i + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [heroSlides.length]);

  const categories = useMemo(() => getCategories(products ?? []), [products]);

  const filtered = useMemo(() => {
    if (!products) return null;
    if (f.categories.length === 0) return products;
    return products.filter((p) => f.categories.includes(p.category));
  }, [products, f.categories]);

  const selectCat = (cat: string) => {
    if (cat === "all") { f.set("categories", []); return; }
    f.set("categories", [cat]);
  };

  return (
    <div className="fade-in">

      {/* ══════════════════════════════════════════════════════════════════
          SECTION HERO — desktop uniquement
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="hidden md:block relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background"
        style={heroBackgroundStyle}
      >
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />

        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-32">
          <div className="space-y-8 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent uppercase tracking-widest">
              <Zap className="h-3 w-3" /> Nouvelles arrivées chaque semaine
            </span>
            <h1 className="font-serif-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Achetez mieux,{" "}
              <span className="relative">
                <span className="text-accent">vivez mieux</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                  <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent/50" />
                </svg>
              </span>
            </h1>
            <p className="text-foreground/65 text-lg max-w-lg leading-relaxed">
              Découvrez des milliers de produits — des dernières technologies aux essentiels du quotidien. Livraison rapide, paiements sécurisés et prix imbattables.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/shop" className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth shadow-lg">
                Acheter maintenant <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop?sort=newest" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-medium border border-border hover:border-accent hover:text-accent transition-smooth">
                Nouveautés
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-border/50">
              <div className="flex -space-x-2">
                {["bg-blue-400","bg-purple-400","bg-pink-400","bg-amber-400"].map((c,i) => (
                  <div key={i} className={`h-8 w-8 rounded-full border-2 border-background ${c} grid place-items-center text-white text-[10px] font-bold`}>
                    {String.fromCharCode(65+i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({length:5}).map((_,i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-foreground/55">Approuvé par <span className="font-semibold text-foreground">10 000+</span> clients</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:grid grid-cols-2 gap-4 animate-fade-up">
            {[
              { value: "50 000+", label: "Produits", icon: ShoppingBag },
              { value: "4,9 ★", label: "Note moyenne", icon: Star },
              { value: "24h", label: "Livraison rapide", icon: Truck },
              { value: "100%", label: "Sécurisé", icon: ShieldCheck },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 hover:border-accent/50 transition-smooth hover:shadow-soft">
                <Icon className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-serif-display text-3xl">{value}</p>
                  <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CHIPS CATÉGORIES — scrollables horizontalement
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-[105px] md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
          <button
            onClick={() => selectCat("all")}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-smooth whitespace-nowrap",
              f.categories.length === 0
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-secondary/60 text-foreground/70 border-border hover:border-accent"
            )}
          >
            <LayoutGrid className="h-3 w-3" /> Tout voir
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCat(cat)}
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

      {/* ══════════════════════════════════════════════════════════════════
          BARRE DE CONFIANCE — desktop
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden md:block border-b border-border bg-secondary/20">
        <div className="container py-4">
          <div className="grid grid-cols-4 gap-4 divide-x divide-border">
            {[
              { Icon: Truck,       text: "Livraison gratuite dès $100" },
              { Icon: RotateCcw,   text: "Retours sous 30 jours" },
              { Icon: ShieldCheck, text: "Paiement sécurisé" },
              { Icon: BadgeCheck,  text: "Produits vérifiés" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-3 px-4 py-2">
                <Icon className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm text-foreground/70 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PRODUITS — "CATÉGORIES TOUT VOIR" sur mobile / "Produits en vedette" desktop
      ══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 md:container py-4 md:py-16">
        {/* Titre section */}
        <div className="flex items-end justify-between mb-4 md:mb-10">
          <div>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-accent mb-1 md:mb-3">
              Tendances du moment
            </p>
            <h2 className="text-lg md:font-serif-display md:text-5xl font-bold">
              {/* Mobile : "CATÉGORIES TOUT VOIR" comme l'app */}
              <span className="md:hidden uppercase tracking-wider text-sm font-bold text-foreground">
                Catégories tout voir
              </span>
              <span className="hidden md:block font-serif-display">Produits en vedette</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs md:text-sm text-foreground/50 hover:text-accent transition-smooth"
          >
            Voir tout
          </Link>
        </div>

        {/* Grille — 2 colonnes sur mobile, 4 sur desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {filtered === null
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Bouton voir tout */}
        <div className="text-center mt-8 md:mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground px-8 py-3.5 rounded-xl text-sm font-medium uppercase tracking-wider transition-smooth border border-border hover:border-accent"
          >
            Voir tous les produits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          POURQUOI YUTTOSTORE — desktop uniquement
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden md:block bg-secondary/20 border-y border-border py-20">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3">Pourquoi nous</p>
            <h2 className="font-serif-display text-4xl md:text-5xl">L'avantage YuttoStore</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { Icon: Zap,         title: "Livraison ultra-rapide",    desc: "Commandez aujourd'hui, recevez demain. Nous travaillons avec les meilleurs transporteurs pour vous livrer le plus vite possible." },
              { Icon: ShieldCheck, title: "Paiements 100% sécurisés",  desc: "Vos données financières sont toujours protégées. Nous utilisons un chiffrement de niveau bancaire pour chaque transaction." },
              { Icon: RotateCcw,   title: "Retours sans tracas",       desc: "Pas satisfait ? Retournez n'importe quel article sous 30 jours, sans questions. Votre satisfaction est notre priorité." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-8 hover:border-accent/50 hover:shadow-soft transition-smooth group">
                <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center mb-6 group-hover:bg-accent/20 transition-smooth">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{title}</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CTA — desktop uniquement
      ══════════════════════════════════════════════════════════════════ */}
      <section className="hidden md:block container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-foreground text-background px-8 py-16 md:px-16 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.25em] text-background/50 mb-4">Offre limitée</p>
            <h2 className="font-serif-display text-4xl md:text-5xl mb-4">10% de réduction sur votre première commande</h2>
            <p className="text-background/65 max-w-md mx-auto mb-8">
              Inscrivez-vous et utilisez le code <span className="font-bold text-accent">YUTTO10</span> à la caisse.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth">
              Commencer mes achats <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
