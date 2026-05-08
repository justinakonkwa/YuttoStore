import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { CreditCard, Wallet, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";
import { checkTransaction, makeCardPayment, makePayment } from "@/services/flexpay";

type PaymentStatus = "pending" | "success" | "failed";

const Checkout = () => {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pay, setPay] = useState<"card" | "mobileMoney">("mobileMoney");
  const [done, setDone] = useState(false);
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Paiement initié. Vérification en cours...");
  const [orderNumber, setOrderNumber] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const pollingRef = useRef<number | null>(null);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const stopPolling = () => {
    if (pollingRef.current !== null) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  };

  const isFailureMessage = (message: string) => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("n'a pas réussi") ||
      normalized.includes("na pas reussi") ||
      /(failed|échoué|echec|annul|refus|declin|expire|invalid|error|pas réussi|pas reussi)/i.test(
        message
      )
    );
  };

  const isSuccessMessage = (message: string) => {
    if (isFailureMessage(message)) return false;
    return /(success|réussi|reussi|effectu|validé|valide|payé|paye)/i.test(message);
  };

  const pollTransactionStatus = async (currentOrderNumber: string) => {
    try {
      const message = await checkTransaction(currentOrderNumber);
      if (!message) return;

      setStatusMessage(message);

      if (isSuccessMessage(message)) {
        setPaymentStatus("success");
        stopPolling();
        setIsStatusModalOpen(false);
        setDone(true);
        clear();
        toast.success("Paiement confirmé. Commande validée.");
        return;
      }

      if (isFailureMessage(message)) {
        setPaymentStatus("failed");
        stopPolling();
        toast.error(message);
      }
    } catch {
      // On continue le polling, erreur réseau temporaire possible.
    }
  };

  const startPolling = (currentOrderNumber: string) => {
    stopPolling();
    setIsPolling(true);
    pollingRef.current = window.setInterval(() => {
      void pollTransactionStatus(currentOrderNumber);
    }, 5000);
  };

  useEffect(() => stopPolling, []);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reference = `ORDER-${Date.now()}`;
    const description = `Commande Cart Luxe (${items.length} article${items.length > 1 ? "s" : ""})`;

    setIsProcessing(true);

    try {
      if (pay === "card") {
        const redirectUrl = await makeCardPayment({
          amount: total.toFixed(2),
          reference,
          description,
        });

        if (!redirectUrl) {
          throw new Error("Impossible de créer le paiement carte.");
        }

        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        toast.success("Paiement initié. Finalisez le paiement dans la page ouverte.");
      } else if (pay === "mobileMoney") {
        if (!phone.trim()) {
          throw new Error("Veuillez renseigner votre numéro de téléphone.");
        }

        const orderNumber = await makePayment({
          amount: total.toFixed(2),
          phone: phone.trim(),
          reference,
          description,
        });

        if (!orderNumber) {
          throw new Error("La création du paiement a échoué.");
        }

        setOrderNumber(orderNumber);
        setPaymentStatus("pending");
        setStatusMessage("Paiement initié. Vérification en cours...");
        setIsStatusModalOpen(true);
        void pollTransactionStatus(orderNumber);
        startPolling(orderNumber);
      } else {
        throw new Error("Mode de paiement non pris en charge.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Le paiement a échoué.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
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
              <Field
                label="Téléphone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </Section>

          {/* Adresse */}
          <Section title="Adresse de livraison">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Adresse ligne 1" className="sm:col-span-2" required />
            </div>
          </Section>

          {/* Paiement */}
          <Section title="Mode de paiement">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "card", label: "Carte bancaire", Icon: CreditCard },
                { id: "mobileMoney", label: "Mobile Money", Icon: Wallet },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPay(m.id as "card" | "mobileMoney")}
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

            {pay === "mobileMoney" && (
              <p className="mt-4 text-sm text-foreground/65 animate-fade-up">
                Le numéro de téléphone renseigné dans vos coordonnées sera utilisé pour le paiement
                Mobile Money.
              </p>
            )}

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
            disabled={isProcessing}
            className="w-full bg-foreground text-background uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-accent hover:text-accent-foreground transition-smooth font-semibold"
          >
            {isProcessing ? "Traitement..." : "Passer la commande"}
          </button>
          <p className="text-[11px] text-foreground/40 text-center">
            En passant commande, vous acceptez nos conditions d'utilisation.
          </p>
        </aside>
      </form>

      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-elegant overflow-hidden">
            <div className="p-8 md:p-10 border-b border-border bg-secondary/30">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Suivi en temps réel</p>
                  <h3 className="font-serif-display text-3xl md:text-4xl">Statut de votre paiement</h3>
                </div>
                <div
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border",
                    paymentStatus === "pending" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
                    paymentStatus === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                    paymentStatus === "failed" && "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  )}
                >
                  {paymentStatus === "pending" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {paymentStatus === "success" && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                  {paymentStatus === "failed" && <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />}
                  {paymentStatus === "pending" ? "En cours" : paymentStatus === "success" ? "Réussi" : "Échoué"}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-foreground/50 mb-1">Référence</p>
                  <p className="text-sm md:text-base font-medium break-all">{orderNumber}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-foreground/50 mb-1">Actualisation</p>
                  <p className="text-sm md:text-base font-medium">Toutes les 5 secondes</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-xs uppercase tracking-wider text-foreground/50 mb-2">Message du provider</p>
                <p className="text-base text-foreground/90">{statusMessage}</p>
              </div>

              {isPolling && (
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <span className="h-5 w-5 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
                  Vérification du callback en cours...
                </div>
              )}
            </div>

            <div className="p-6 md:px-10 md:pb-8 flex flex-wrap justify-end gap-3 border-t border-border">
              {paymentStatus === "failed" && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus("pending");
                    setStatusMessage("Nouvelle vérification en cours...");
                    void pollTransactionStatus(orderNumber);
                    startPolling(orderNumber);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-smooth"
                >
                  Réessayer la vérification
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setIsStatusModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-foreground/40 transition-smooth"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
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
