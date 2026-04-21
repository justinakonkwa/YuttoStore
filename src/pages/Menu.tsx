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
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Menu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnexion réussie.");
    navigate("/");
  };

  return (
    <div className="pb-24 fade-in">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold">Menus</h1>
      </div>

      {/* Informations personnelles */}
      <Section title="INFORMATIONS PERSONNELLES">
        {user ? (
          <MenuItem
            icon={
              user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-accent/20 grid place-items-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )
            }
            label={user.displayName ?? user.email ?? "Mon compte"}
            sublabel={user.email ?? ""}
            showArrow
          />
        ) : (
          <Link to="/login">
            <MenuItem
              icon={
                <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center">
                  <User className="h-4 w-4 text-foreground/60" />
                </div>
              }
              label="Se connecter"
              showArrow
            />
          </Link>
        )}
      </Section>

      {/* Général */}
      <Section title="GÉNÉRAL">
        <MenuItem icon={<Languages className="h-5 w-5" />} label="Changer de langue" showSwitch />
        <MenuItem icon={<Sun className="h-5 w-5" />} label="Système" showSwitch last />
      </Section>

      {/* Support */}
      <Section title="SUPPORT ET COMMENTAIRES">
        <MenuItem icon={<Phone className="h-5 w-5" />} label="Contactez-nous" showArrow />
        <MenuItem icon={<Star className="h-5 w-5" />} label="Laisser un avis" showArrow />
        <MenuItem icon={<Share2 className="h-5 w-5" />} label="Partager l'application" showArrow last />
      </Section>

      {/* Infos app */}
      <Section title="INFORMATIONS SUR L'APPLICATION">
        <MenuItem icon={<Shield className="h-5 w-5" />} label="Politique de confidentialité" showArrow />
        <MenuItem icon={<FileText className="h-5 w-5" />} label="Conditions générales" showArrow last />
      </Section>

      {/* Déconnexion */}
      {user && (
        <div className="px-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive/20 transition-smooth"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Se déconnecter</span>
          </button>
        </div>
      )}

      {!user && (
        <div className="px-4 mt-4">
          <Link
            to="/login"
            className="w-full flex items-center gap-3 px-4 py-4 bg-accent/10 text-accent rounded-2xl hover:bg-accent/20 transition-smooth"
          >
            <LogIn className="h-5 w-5" />
            <span className="font-medium">Se connecter</span>
          </Link>
        </div>
      )}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="px-4 mb-5">
    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-2 px-1">{title}</p>
    <div className="bg-secondary/40 rounded-2xl overflow-hidden border border-border">
      {children}
    </div>
  </div>
);

const MenuItem = ({
  icon,
  label,
  sublabel,
  showArrow,
  showSwitch,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  showArrow?: boolean;
  showSwitch?: boolean;
  last?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 px-4 py-3.5",
      !last && "border-b border-border/50"
    )}
  >
    <div className="text-foreground/60 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {sublabel && <p className="text-xs text-foreground/45 truncate">{sublabel}</p>}
    </div>
    {showArrow && <ChevronRight className="h-4 w-4 text-foreground/30" />}
    {showSwitch && <span className="text-xs text-foreground/40">↔</span>}
  </div>
);

export default Menu;
