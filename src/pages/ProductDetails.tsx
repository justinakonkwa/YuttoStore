import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchProductById } from "@/services/products";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  Share2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => (id ? s.ids.includes(id) : false));
  const toggle = useWishlist((s) => s.toggle);

  useEffect(() => {
    if (!id) return;
    setProduct(undefined);
    fetchProductById(id).then((p) => setProduct(p ?? null));
  }, [id]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (product === undefined) {
    return (
      <div className="container py-16 grid lg:grid-cols-2 gap-12">
        <div className="aspect-[4/5] skeleton-shimmer rounded-2xl" />
        <div className="space-y-4 pt-4">
          <div className="h-3 w-24 skeleton-shimmer rounded" />
          <div className="h-10 w-3/4 skeleton-shimmer rounded" />
          <div className="h-8 w-32 skeleton-shimmer rounded" />
          <div className="h-24 w-full skeleton-shimmer rounded mt-6" />
          <div className="h-12 w-full skeleton-shimmer rounded mt-4" />
        </div>
      </div>
    );
  }

  // ── Introuvable ───────────────────────────────────────────────────────────
  if (product === null) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif-display text-4xl mb-4">Produit introuvable.</p>
        <button
          onClick={() => navigate("/shop")}
          className="text-accent uppercase text-sm tracking-wider border-b border-accent pb-1"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  // Réduction : no_price = ancien prix barré
  const hasDiscount = product.no_price > 0 && product.no_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.no_price - product.price) / product.no_price) * 100)
    : 0;
  const savings = hasDiscount ? product.no_price - product.price : 0;

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      on: true,
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papiers !");
  };

  return (
    <div className="container py-10 fade-in">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-foreground/50 mb-10">
        <Link to="/" className="hover:text-foreground transition-smooth">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-foreground transition-smooth">Boutique</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              to={`/shop?cat=${encodeURIComponent(product.category)}`}
              className="hover:text-foreground transition-smooth"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16">
        {/* ── Galerie ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary cursor-zoom-in"
            onMouseMove={handleMouse}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          >
            {product.images[activeImg]?.url ? (
              <img
                src={product.images[activeImg].url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={
                  zoom.on
                    ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/20 text-sm">
                Aucune image
              </div>
            )}

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> -{discountPct}%
              </span>
            )}
          </div>

          {/* Miniatures */}
          {product.images.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  title={img.color}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-smooth",
                    i === activeImg
                      ? "border-accent shadow-sm"
                      : "border-transparent opacity-55 hover:opacity-100"
                  )}
                >
                  <img src={img.url} alt={img.color} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Infos produit ─────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-28 self-start space-y-6">
          {/* Catégorie + partager */}
          <div className="flex items-start justify-between">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">
              {[product.category, product.subCategory].filter(Boolean).join(" · ")}
            </p>
            <button
              onClick={handleShare}
              className="text-foreground/40 hover:text-accent transition-smooth"
              aria-label="Partager"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <h1 className="font-serif-display text-4xl md:text-5xl leading-tight">
            {product.name}
          </h1>

          {/* Prix */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            {hasDiscount && (
              <>
                <p className="text-xl text-foreground/40 line-through">
                  {formatPrice(product.no_price)}
                </p>
                <span className="text-sm font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Économisez {formatPrice(savings)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-foreground/70 leading-relaxed">{product.description}</p>
          )}

          {/* Caractéristiques techniques */}
          {product.labeledFilters.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-5 bg-secondary/40 rounded-2xl border border-border">
              {product.labeledFilters.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stock + référence */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  product.stock > 5
                    ? "bg-green-500"
                    : product.stock > 0
                    ? "bg-amber-400"
                    : "bg-destructive"
                )}
              />
              <span className="text-foreground/65">
                {product.stock > 5
                  ? `En stock (${product.stock} disponibles)`
                  : product.stock > 0
                  ? `Plus que ${product.stock} en stock`
                  : "Rupture de stock"}
              </span>
            </div>
            {product.reference && (
              <span className="text-xs text-foreground/35 flex items-center gap-1">
                <Package className="h-3 w-3" /> Réf. {product.reference}
              </span>
            )}
          </div>

          {/* Quantité + Ajouter au panier */}
          <div className="flex gap-3 pt-2">
            <div className="flex items-center border border-border rounded-xl">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3.5 hover:text-accent transition-smooth"
                aria-label="Diminuer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="px-4 py-3.5 hover:text-accent transition-smooth"
                aria-label="Augmenter"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                add(product, qty);
                toast.success(`${product.name} ajouté au panier`);
              }}
              disabled={product.stock === 0}
              className="flex-1 bg-foreground text-background uppercase text-sm font-semibold tracking-wider py-3.5 rounded-xl hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
            </button>
            <button
              onClick={() => toggle(product.id)}
              aria-label="Favoris"
              className="px-4 border border-border rounded-xl hover:border-accent transition-smooth"
            >
              <Heart
                className={cn("h-5 w-5", wished ? "fill-accent text-accent" : "")}
              />
            </button>
          </div>

          {/* Badges de confiance */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-border">
            {[
              { Icon: Truck, label: "Livraison rapide" },
              { Icon: ShieldCheck, label: "Paiement sécurisé" },
              { Icon: RotateCcw, label: "Retours faciles" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-smooth"
              >
                <Icon className="h-5 w-5 mx-auto mb-1.5 text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-foreground/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
