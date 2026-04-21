import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, MessageCircle, Menu } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/",      icon: Home,          label: "Accueil",   end: true  },
  { to: "/cart",  icon: ShoppingCart,  label: "Panier",    end: false },
  { to: "/chat",  icon: MessageCircle, label: "Messages",  end: false },
  { to: "/menu",  icon: Menu,          label: "Menu",      end: false },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const cartCount = useCart((s) => s.count());

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="grid grid-cols-4 h-[60px]">
        {TABS.map(({ to, icon: Icon, label, end }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 relative transition-smooth",
                isActive ? "text-accent" : "text-foreground/40"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {/* Badge panier */}
                {to === "/cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-accent" : "text-foreground/40"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
