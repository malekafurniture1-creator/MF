import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Maleka Furnitures" },
      { name: "description", content: "Terms and Conditions for Maleka Furnitures, Hyderabad." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">Terms and Conditions</h1>
        <div className="mt-10 space-y-6 text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="font-display text-2xl text-foreground mt-8">1. Website Purpose</h2>
          <p>
            The Maleka Furnitures website serves as a digital catalogue for our physical showroom in Moghalpura, Hyderabad. We do not offer direct online purchasing or e-commerce checkout.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">2. Pricing and Availability</h2>
          <p>
            While we strive to keep our online catalogue updated, all products, prices, and availability are subject to change without notice. Please contact us via WhatsApp or visit our showroom to confirm exact pricing and stock.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">3. Intellectual Property</h2>
          <p>
            All images, logos, and content on this website are the property of Maleka Furnitures. Unauthorized use, reproduction, or distribution of our media is strictly prohibited.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">4. Contact Information</h2>
          <p>
            For any queries regarding our terms, products, or services, please visit our showroom at {BUSINESS.address} or call us at {BUSINESS.phoneDisplay}.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
