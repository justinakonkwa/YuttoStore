import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/layouts/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound.tsx";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Menu = lazy(() => import("./pages/Menu"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="container py-32">
    <div className="h-10 w-1/3 skeleton-shimmer rounded mb-6" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] skeleton-shimmer rounded-lg mb-4" />
          <div className="h-4 w-1/2 skeleton-shimmer rounded" />
        </div>
      ))}
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Page login sans layout */}
            <Route path="/login" element={<Login />} />

            {/* Pages avec layout principal */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/chat" element={<div className="container py-20 text-center text-foreground/50">Messages — bientôt disponible</div>} />
              {/* Checkout protégé : connexion requise */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
