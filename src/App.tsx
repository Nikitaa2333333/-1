import { lazy, Suspense } from "react";
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
const CartPage = lazy(() => import("@/pages/CartPage").then(m => ({ default: m.CartPage })));

function HomePage() {
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

      <CartIcon />
    </div>
  );
}

const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={
        <Suspense fallback={<div className="min-h-screen bg-brand-pink/5" />}>
          <CartPage />
        </Suspense>
      } />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/dashboard" element={
        <Suspense fallback={<div className="min-h-screen bg-brand-pink/5" />}>
          <Dashboard />
        </Suspense>
      } />
    </Routes>
  );
}
