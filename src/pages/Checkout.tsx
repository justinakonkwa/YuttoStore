import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { CreditCard, Wallet, Apple, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

const Checkout = () => {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pay, setPay] = useState<"card" | "apple" | "paypal">("card");
  const [done, setDone] = useState(false);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0 && !done) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif-display text-4xl mb-4">Votre panier est vide.</p>
        <Link
          to="/shop"
          className="text-accent uppercase text-sm tracking-wider border-b border-accent pb-1"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    clear();
    toast.success("Commande passée — confirmation envoyée.");
  };

  if (done) {
    return (
      <div className="container py-32 text-center fade-in max-w-xl mx-auto">
        <div className="h-20 w-20 mx-auto rounded-full bg-accent/15 grid place-items-center mb-6">
          <Check className="h-10 w-10 text-accent" />
        </div>
        <h1 className="font-serif-display text-5xl mb-4">Merci !</h1>
        <p className="text-foreground/65 mb-8">
          Votre commande a bien été reçue. Une confirmation vous sera envoyée prochainement.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl text-sm uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="container py-12 fade-in">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-foreground/65 hover:text-accent transition-smooth mb-8"
      >
        <ChevronLeft className="h-4 w-4" /> Retour au panier
      </Link>
      <header className="mb-12">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3">Commande</p>
        <h1 className="font-serif-display text-5xl">Finaliser ma commande</h1>
      </header>

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-12">
          {/* Contact */}
          <Section title="Coordonnées">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom complet" required defaultValue={user?.displayName ?? ""} />
              <Field label="Adresse e-mail" type="email" required defaultValue={user?.email ?? ""} />
              <Field label="Téléphone" type="tel" required />
            </div>
          </Section>

          {/* Adresse */}
          <Section title="Adresse de livraison">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Adresse ligne 1" className="sm:col-span-2" required />
              <Field label="Adresse ligne 2 (optionnel)" className="sm:col-span-2" />
              <Field label="Ville" required />
              <Field label="Code postal" required />
              <Field label="Pays" defaultValue="États-Unis" required />
              <Field label="État / Région" required />
            </div>
          </Section>

          {/* Paiement */}
          <Section title="Mode de paiement">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { id: "card", label: "Carte bancaire", Icon: CreditCard },
                { id: "apple", label: "Apple Pay", Icon: Apple },
                { id: "paypal", label: "PayPal", Icon: Wallet },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPay(m.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-4 rounded-xl border transition-smooth",
                    pay === m.id
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-border text-foreground/65 hover:border-foreground/40"
                  )}
                >
                  <m.Icon className="h-4 w-4" />
                  <span className="text-sm">{m.label}</span>
                </button>
              ))}
            </div>

            {pay === "card" && (
              <div className="mt-6 grid sm:grid-cols-2 gap-4 animate-fade-up">
                <Field
                  label="Numéro de carte"
                  placeholder="1234 5678 9012 3456"
                  className="sm:col-span-2"
                  required
                />
                <Field label="Nom sur la carte" required />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="MM / AA" placeholder="12 / 28" required />
                  <Field label="CVC" placeholder="•••" required />
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-28 self-start bg-card border border-border rounded-2xl p-8 space-y-5 h-fit">
          <h2 className="font-semibold text-xl pb-4 border-b border-border">Récapitulatif</h2>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <img
                    src={product.images[0]?.url ?? ""}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] rounded-full h-4 w-4 grid place-items-center font-bold">
                    {quantity}
                  </span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-foreground line-clamp-1 font-medium">{product.name}</p>
                  <p className="text-foreground/50 text-xs mt-0.5">{product.subCategory}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(product.price * quantity)}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/65">Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/65">Livraison</span>
              <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-border flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-xl">{formatPrice(total)}</span>
          </div>
          <button
            type="submit"
            className="w-full bg-foreground text-background uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-smooth font-semibold"
          >
            Passer la commande
          </button>
          <p className="text-[11px] text-foreground/40 text-center">
            En passant commande, vous acceptez nos conditions d'utilisation.
          </p>
        </aside>
      </form>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-semibold text-xl mb-6">{title}</h2>
    {children}
  </section>
);

const Field = ({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className={cn("block", className)}>
    <span className="text-[11px] uppercase tracking-wider text-foreground/50 mb-2 block">
      {label}
    </span>
    <input
      {...props}
      className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-smooth"
    />
  </label>
);

export default Checkout;
