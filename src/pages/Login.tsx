import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? "/";

  const { loginWithEmail, registerWithEmail, loginWithGoogle, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Connexion réussie !");
      } else {
        if (!displayName.trim()) {
          toast.error("Veuillez entrer votre nom.");
          return;
        }
        await registerWithEmail(email, password, displayName);
        toast.success("Compte créé avec succès !");
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = firebaseErrorMessage(err.code);
      toast.error(msg);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success("Connexion Google réussie !");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error("Connexion Google annulée ou échouée.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16 fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="font-serif-display text-3xl">
            Yutto<span className="text-accent">Store</span>
          </Link>
          <p className="text-foreground/55 text-sm mt-2">
            {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
          {/* Tabs */}
          <div className="flex rounded-lg bg-secondary/50 p-1 mb-8">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 text-sm rounded-md transition-smooth",
                  mode === m
                    ? "bg-background text-foreground shadow-sm font-medium"
                    : "text-foreground/55 hover:text-foreground"
                )}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-3 text-sm hover:border-accent hover:text-accent transition-smooth mb-6 disabled:opacity-50"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground/40 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field
                label="Nom complet"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            )}
            <Field
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />
            <div className="relative">
              <Field
                label="Mot de passe"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-[34px] text-foreground/40 hover:text-foreground transition-smooth"
                aria-label={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-3.5 rounded-lg text-sm font-medium uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground/45 mt-6">
          En continuant, vous acceptez nos{" "}
          <Link to="/" className="underline hover:text-accent">
            conditions d'utilisation
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const Field = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-wider text-foreground/55 mb-1.5 block">
      {label}
    </span>
    <input
      {...props}
      className="w-full bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-smooth"
    />
  </label>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou mot de passe incorrect.";
    case "auth/email-already-in-use":
      return "Cet email est déjà utilisé.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caractères.";
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessayez plus tard.";
    case "auth/popup-closed-by-user":
      return "Connexion annulée.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
}

export default Login;
