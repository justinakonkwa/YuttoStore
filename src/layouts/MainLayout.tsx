import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Outlet } from "react-router-dom";

export const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Header desktop uniquement */}
    <div className="hidden md:block">
      <Navbar />
    </div>

    {/* Header mobile uniquement */}
    <MobileHeader />

    {/* Contenu principal — padding bottom sur mobile pour la BottomNav */}
    <main className="flex-1 pb-16 md:pb-0">
      <Outlet />
    </main>

    {/* Footer desktop uniquement */}
    <div className="hidden md:block">
      <Footer />
    </div>

    {/* Bottom navigation mobile */}
    <BottomNav />
  </div>
);
