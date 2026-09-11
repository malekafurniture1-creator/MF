import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Maleka Furnitures" },
      { name: "description", content: "Privacy policy for Maleka Furnitures, Hyderabad." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">Privacy Policy</h1>
        <div className="mt-10 space-y-6 text-muted-foreground leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <h2 className="font-display text-2xl text-foreground mt-8">1. Information We Collect</h2>
          <p>
            Maleka Furnitures operates this website primarily as a digital catalogue. We do not process online transactions or collect payment information through this site. The only personal information we collect is what you voluntarily provide when contacting us via WhatsApp, phone, or email.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            Any information you provide is used solely to respond to your inquiries, provide furniture details, and assist with your purchases at our physical showroom in Hyderabad.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">3. Information Sharing</h2>
          <p>
            We respect your privacy and do not sell, trade, or rent your personal information to third parties.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">4. Cookies and Tracking</h2>
          <p>
            We use standard analytics tools to understand how visitors interact with our website to improve our digital catalogue. These tools do not personally identify you.
          </p>

          <h2 className="font-display text-2xl text-foreground mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at our showroom or call us at {BUSINESS.phoneDisplay}.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
