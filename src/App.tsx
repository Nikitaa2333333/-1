import { useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PromoBanner } from "@/components/PromoBanner";
import { ScrollSequence } from "@/components/ScrollSequence";
import { Manifesto } from "@/components/Manifesto";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { OrderCTA } from "@/components/OrderCTA";
import { CartIcon } from "@/components/CartIcon";
import { CheckoutPage } from "@/pages/CheckoutPage";

const ProductGrid = lazy(() => import("@/components/ProductGrid").then(m => ({ default: m.ProductGrid })));
const CartDrawer = lazy(() => import("@/components/CartDrawer").then(m => ({ default: m.CartDrawer })));

function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="bg-brand-pink/5 min-h-screen font-sans selection:bg-brand-hot selection:text-white overflow-clip">
      <ScrollSequence />
      <Marquee />
      <Manifesto />
      <Features />
      <PromoBanner />
      <Suspense fallback={<div className="py-24 bg-brand-pink/10" />}>
        <ProductGrid />
      </Suspense>
      <OrderCTA />
      <Footer />

      <CartIcon onClick={() => setIsCartOpen(true)} />
      <Suspense fallback={null}>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </Suspense>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  );
}
