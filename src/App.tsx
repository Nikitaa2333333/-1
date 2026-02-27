import { useState } from "react";
import { PromoBanner } from "@/components/PromoBanner";
import { ScrollSequence } from "@/components/ScrollSequence";
import { Manifesto } from "@/components/Manifesto";
import { Features } from "@/components/Features";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { OrderCTA } from "@/components/OrderCTA";
import { CartDrawer } from "@/components/CartDrawer";
import { CartIcon } from "@/components/CartIcon";

export function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="bg-brand-pink/5 min-h-screen font-sans selection:bg-brand-hot selection:text-white overflow-clip">
      <ScrollSequence />
      <Marquee />
      <Manifesto />
      <Features />
      <PromoBanner />
      <ProductGrid />
      <OrderCTA />
      <Footer />

      {/* Shopping Cart UI */}
      <CartIcon onClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
