import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

export const ProductCard = ({ product }: { product: Product }) => {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);

  const hasDiscount = product.no_price > 0 && product.no_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.no_price - product.price) / product.no_price) * 100)
    : 0;

  const img1 = product.images[0]?.url ?? "";
  const img2 = product.images[1]?.url ?? "";

  return (
    <article className="group relative flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary mb-2">
          {img1 ? (
            <img
              src={img1}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-secondary/80" />
          )}
          {img2 && (
            <img
              src={img2}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            />
          )}

          {/* Badge réduction — coin haut gauche */}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-background/85 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              -{discountPct}%
            </span>
          )}

          {/* Rupture */}
          {product.stock === 0 && (
            <span className="absolute top-2 left-2 bg-background/85 text-foreground/70 text-[10px] uppercase px-1.5 py-0.5 rounded-md">
              Rupture
            </span>
          )}

          {/* Favoris — coin haut droit, toujours visible */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
              toast(wished ? "Retiré des favoris" : "Ajouté aux favoris");
            }}
            aria-label="Favoris"
            className="absolute top-2 right-2 h-7 w-7 grid place-items-center bg-background/80 backdrop-blur rounded-full transition-smooth hover:bg-background"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-smooth",
                wished ? "fill-accent text-accent" : "text-foreground/70"
              )}
            />
          </button>

          {/* Bouton AJOUTER — barre en bas de l'image, toujours visible */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.stock === 0) return;
              add(product, 1);
              toast.success(`${product.name} ajouté au panier`);
            }}
            disabled={product.stock === 0}
            className="absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-semibold uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground transition-smooth"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stock === 0 ? "Indisponible" : "Ajouter"}
          </button>
        </div>
      </Link>

      {/* Infos texte — exactement comme l'app mobile */}
      <div className="flex flex-col gap-0.5 px-0.5 flex-1">
        {/* Sous-catégorie en orange (couleur accent) */}
        {product.subCategory && (
          <p className="text-[10px] uppercase tracking-wider text-accent font-medium truncate">
            {product.subCategory}
          </p>
        )}

        {/* Nom du produit */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-xs font-medium text-foreground hover:text-accent transition-smooth leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Prix : prix actuel en gras + ancien prix barré */}
        <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-foreground/40 line-through">
              {formatPrice(product.no_price)}
            </span>
          )}
        </div>

        {/* Stock — en orange comme l'app */}
        {product.stock > 0 && product.stock <= 5 ? (
          <p className="text-[10px] text-accent uppercase tracking-wider font-medium">
            Plus que {product.stock} en stock
          </p>
        ) : product.stock > 5 ? (
          <p className="text-[10px] text-accent uppercase tracking-wider font-medium">
            Plus que 5 en stock
          </p>
        ) : null}
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="aspect-square rounded-xl skeleton-shimmer" />
    <div className="h-2.5 w-16 skeleton-shimmer rounded" />
    <div className="h-3.5 w-full skeleton-shimmer rounded" />
    <div className="h-3.5 w-3/4 skeleton-shimmer rounded" />
    <div className="h-4 w-20 skeleton-shimmer rounded" />
  </div>
);
