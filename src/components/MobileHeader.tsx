import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, MapPin, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const MobileHeader = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  return (
    <div className="md:hidden bg-background border-b border-border sticky top-0 z-40">
      {/* Ligne 1 : Logo + Localisation + Cloche */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2">
        {/* Logo style app mobile : icône sac + texte */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-accent grid place-items-center">
            <ShoppingBag className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Yutto<span className="text-accent">Store</span>
          </span>
        </Link>

        {/* Localisation */}
        <div className="flex items-center gap-1 text-foreground/60 flex-1 justify-center mx-1 min-w-0">
          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="text-[11px] leading-tight truncate">
            Livraison à Kinshasa,<br className="hidden" /> Goma et Bukavu
          </span>
        </div>

        {/* Cloche */}
        <button
          className="relative text-foreground/70 hover:text-foreground transition-smooth shrink-0"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>

      {/* Ligne 2 : Barre de recherche */}
      <form onSubmit={submit} className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Recherche sur Yutto Store..."
            className="w-full bg-secondary/60 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </form>
    </div>
  );
};
