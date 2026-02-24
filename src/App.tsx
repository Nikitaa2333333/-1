import { ScrollSequence } from "@/components/ScrollSequence";
import { Manifesto } from "@/components/Manifesto";
import { Features } from "@/components/Features";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { OrderCTA } from "@/components/OrderCTA";

export function App() {
  return (
    <div className="bg-brand-pink/5 min-h-screen font-sans selection:bg-brand-hot selection:text-white overflow-clip">
      <ScrollSequence />
      <Marquee />
      <Manifesto />
      <Features />
      <ProductGrid />
      <OrderCTA />
      <Footer />
    </div>
  );
}
