import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X, User, LogOut, LogIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const cartCount = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu user en cliquant ailleurs
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitSearch = () => {
    if (!search.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
    setSearchOpen(false);
    setSearch("");
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    toast.success("Déconnexion réussie.");
    navigate("/");
  };

  const NAV = [
    { to: "/", label: "Accueil", end: true },
    { to: "/shop", label: "Boutique", end: false },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-smooth border-b",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-border"
          : "bg-background/40 backdrop-blur-md border-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-6">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground/80 hover:text-foreground"
          onClick={() => setMobile(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="font-serif-display text-2xl tracking-wide">
          Yutto<span className="text-accent">Store</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => (
            <RouterNavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "transition-smooth hover:text-foreground",
                  isActive ? "text-foreground" : "text-foreground/65"
                )
              }
            >
              {n.label}
            </RouterNavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="text-foreground/80 hover:text-foreground transition-smooth"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist */}
          <Link
            to="/"
            className="hidden sm:flex relative text-foreground/80 hover:text-foreground transition-smooth"
            aria-label="Favoris"
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative text-foreground/80 hover:text-foreground transition-smooth"
            aria-label="Panier"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-smooth"
                  aria-label="Mon compte"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? ""}
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent/20 grid place-items-center">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-elegant py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {user.displayName ?? "Mon compte"}
                      </p>
                      <p className="text-xs text-foreground/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:text-destructive hover:bg-destructive/5 transition-smooth"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-smooth border border-border px-3 py-1.5 rounded-md hover:border-accent"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Rechercher un produit…"
                className="w-full bg-secondary/60 border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col">
          <div className="flex h-20 items-center justify-between container">
            <span className="font-serif-display text-2xl">
              Yutto<span className="text-accent">Store</span>
            </span>
            <button onClick={() => setMobile(false)} aria-label="Fermer le menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container flex flex-col gap-2 mt-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobile(false)}
                className="font-serif-display text-3xl py-2 text-foreground/85 hover:text-accent transition-smooth"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t border-border">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobile(false); }}
                  className="flex items-center gap-3 text-foreground/70 hover:text-destructive transition-smooth"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-lg">Se déconnecter</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobile(false)}
                  className="flex items-center gap-3 text-foreground/70 hover:text-accent transition-smooth"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="font-serif-display text-3xl">Connexion</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
