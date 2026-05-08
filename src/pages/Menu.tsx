import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Languages,
  Sun,
  Phone,
  Star,
  Share2,
  Shield,
  FileText,
  LogOut,
  LogIn,
  ChevronRight,
  Store,
  Star as StarFilled,
  X,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { APP_PHONE, DEV_EMAIL, PLAY_STORE_URL, PRIVACY_URL, TERMS_URL, WEB_URL } from "@/config/app";

const Menu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const resolved = saved === "light" ? "light" : "dark";
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnexion réussie.");
    navigate("/");
  };

  const handleShare = async () => {
    try {
      if (canShare) {
        await navigator.share({
          title: "YuttoStore",
          text: "Découvrez YuttoStore",
          url: window.location.origin,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Lien copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de partager pour le moment.");
    }
  };

  const handleComingSoon = (label: string) => {
    toast.info(`${label} sera disponible très bientôt.`);
  };

  const toggleTheme = () => {
    const next: "dark" | "light" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
    toast.success(next === "light" ? "Thème clair activé." : "Thème sombre activé.");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Veuillez écrire votre avis.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        userUid: user?.uid ?? "",
        userName: user?.displayName ?? "Anonyme",
        userEmail: user?.email ?? "",
        rating: reviewRating,
        message: reviewText.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Merci pour votre avis.");
      setReviewOpen(false);
      setReviewText("");
      setReviewRating(5);
    } catch {
      toast.error("Impossible d'envoyer l'avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="container py-8 md:py-12 pb-24 fade-in">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-2">Compte</p>
        <h1 className="font-serif-display text-4xl md:text-5xl">Menu</h1>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6 lg:gap-8">
        <section className="border border-border rounded-2xl bg-card/60 p-5 lg:p-6 h-fit">
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-3">Informations personnelles</p>
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-accent/20 grid place-items-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{user.displayName ?? "Mon compte"}</p>
                <p className="text-sm text-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-accent transition-smooth"
            >
              <User className="h-4 w-4" /> Se connecter
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-smooth"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          )}
        </section>

        <section className="space-y-5">
          <Block title="Général">
            <ActionButton
              icon={<Languages className="h-5 w-5" />}
              label="Changer de langue"
              onClick={() => handleComingSoon("Le changement de langue")}
            />
            <ActionButton
              icon={<Sun className="h-5 w-5" />}
              label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
              onClick={toggleTheme}
            />
          </Block>

          <Block title="Support et commentaires">
            {user && <ActionButton icon={<Store className="h-5 w-5" />} label="Espace vendeur" onClick={() => navigate("/seller")} arrow />}
            <ActionButton
              icon={<Phone className="h-5 w-5" />}
              label={`Contactez-nous (${APP_PHONE})`}
              onClick={() => (window.location.href = `mailto:${DEV_EMAIL}`)}
              arrow
            />
            <ActionButton
              icon={<Star className="h-5 w-5" />}
              label="Laisser un avis"
              onClick={() => setReviewOpen(true)}
              arrow
            />
            <ActionButton
              icon={<Share2 className="h-5 w-5" />}
              label="Partager l'application"
              onClick={() => {
                void handleShare();
                window.open(PLAY_STORE_URL, "_blank", "noopener,noreferrer");
              }}
              arrow
            />
          </Block>

          <Block title="Informations sur l'application">
            <ActionButton
              icon={<Shield className="h-5 w-5" />}
              label="Politique de confidentialité"
              onClick={() => window.open(PRIVACY_URL, "_blank", "noopener,noreferrer")}
              arrow
            />
            <ActionButton
              icon={<FileText className="h-5 w-5" />}
              label="Conditions générales"
              onClick={() => window.open(TERMS_URL, "_blank", "noopener,noreferrer")}
              arrow
            />
            <ActionButton
              icon={<Share2 className="h-5 w-5" />}
              label="Site web"
              onClick={() => window.open(WEB_URL, "_blank", "noopener,noreferrer")}
              arrow
            />
          </Block>
        </section>
      </div>

      {!user && (
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-5 py-3 bg-accent/10 text-accent rounded-xl hover:bg-accent/20 transition-smooth"
          >
            <LogIn className="h-5 w-5" />
            <span className="font-medium">Se connecter</span>
          </Link>
        </div>
      )}

      {reviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-xl">Laisser un avis</h2>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="text-foreground/50 hover:text-foreground transition-smooth"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitReview} className="p-6 space-y-5">
              <div>
                <p className="text-sm text-foreground/70 mb-2">Votre note</p>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const active = val <= reviewRating;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReviewRating(val)}
                        className={cn("p-1", active ? "text-amber-400" : "text-foreground/30")}
                        aria-label={`Donner ${val} étoiles`}
                      >
                        <StarFilled className={cn("h-5 w-5", active && "fill-amber-400")} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="text-sm text-foreground/70 mb-2 block">Message</span>
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Partagez votre expérience avec YuttoStore..."
                  className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full px-5 py-3 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-50"
              >
                {isSubmittingReview ? "Envoi..." : "Envoyer mon avis"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2 px-1">{title}</p>
    <div className="bg-card/60 rounded-2xl overflow-hidden border border-border">{children}</div>
  </div>
);

const ActionButton = ({
  icon,
  label,
  arrow,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  arrow?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-secondary/50 transition-smooth"
  >
    <div className="text-foreground/60 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
    </div>
    {arrow && <ChevronRight className="h-4 w-4 text-foreground/30" />}
  </button>
);

export default Menu;
