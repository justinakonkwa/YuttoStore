import { Link } from "react-router-dom";
import { useCart } from "@/store/cart";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const Cart = () => {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center fade-in">
        <ShoppingBag className="h-12 w-12 mx-auto text-foreground/30 mb-6" />
        <h1 className="font-serif-display text-5xl mb-4">Votre panier est vide</h1>
        <p className="text-foreground/60 mb-8">
          Découvrez nos produits et commencez vos achats.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-xl text-sm uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth"
        >
          Voir la boutique <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 fade-in">
      <header className="mb-12">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3">Mon panier</p>
        <h1 className="font-serif-display text-5xl">Votre sélection</h1>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-16">
        {/* Articles */}
        <div className="space-y-6">
          {items.map(({ product, quantity }) => {
            const img = product.images[0]?.url ?? "";
            return (
              <div
                key={product.id}
                className="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[120px_1fr_auto] gap-6 pb-6 border-b border-border"
              >
                <Link
                  to={`/product/${product.id}`}
                  className="aspect-square overflow-hidden rounded-xl bg-secondary"
                >
                  {img && (
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </Link>
                <div className="flex flex-col gap-1.5">
                  {product.subCategory && (
                    <p className="text-[11px] uppercase tracking-wider text-foreground/45">
                      {product.subCategory}
                    </p>
                  )}
                  <Link
                    to={`/product/${product.id}`}
                    className="font-medium text-lg hover:text-accent transition-smooth leading-snug"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-foreground/55">{product.category}</p>
                  <div className="flex items-center gap-4 mt-auto pt-3">
                    <div className="inline-flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQty(product.id, quantity - 1)}
                        className="px-3 py-2 hover:text-accent transition-smooth"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => setQty(product.id, quantity + 1)}
                        className="px-3 py-2 hover:text-accent transition-smooth"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(product.id)}
                      className="text-xs text-foreground/45 hover:text-destructive uppercase tracking-wider inline-flex items-center gap-1 transition-smooth"
                    >
                      <X className="h-3 w-3" /> Retirer
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    {formatPrice(product.price * quantity)}
                  </p>
                  <p className="text-xs text-foreground/45 mt-1">
                    {formatPrice(product.price)} / unité
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-28 self-start bg-card border border-border rounded-2xl p-8 space-y-5 h-fit">
          <h2 className="font-semibold text-xl pb-4 border-b border-border">Récapitulatif</h2>
          <Row label="Sous-total" value={formatPrice(subtotal)} />
          <Row
            label="Livraison"
            value={shipping === 0 ? "Offerte" : formatPrice(shipping)}
          />
          {shipping === 0 && subtotal > 0 && (
            <p className="text-xs text-accent">🎉 Vous bénéficiez de la livraison gratuite !</p>
          )}
          {shipping > 0 && (
            <p className="text-xs text-foreground/50">
              Ajoutez {formatPrice(100 - subtotal)} pour bénéficier de la livraison gratuite
            </p>
          )}
          <div className="pt-4 border-t border-border flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-xl">{formatPrice(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="block text-center bg-foreground text-background uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-smooth font-medium"
          >
            Passer la commande
          </Link>
          <Link
            to="/shop"
            className="block text-center text-xs text-foreground/50 hover:text-accent uppercase tracking-wider transition-smooth"
          >
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-foreground/65">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default Cart;
