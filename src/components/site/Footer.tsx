import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, MessageCircle, Phone, Star, Youtube } from "lucide-react";

import { BUSINESS, mapsUrl, telUrl, whatsappUrl } from "@/lib/business";
import { logo } from "@/lib/local-assets";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <img src={logo} alt="Maleka Furnitures logo" className="h-14 w-14 rounded-full object-cover" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            Hyderabad furniture specialists since 2003 — sofas, beds, dining,
            wardrobes and made-to-order pieces.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-gold">
            <Star className="size-4 fill-current" />
            {BUSINESS.rating} rated by customers
          </p>
          <div className="mt-5 flex items-center gap-2" aria-label="Social media">
            <a
              href="https://www.instagram.com/maleka.furniture/?utm_source=ig_web_button_share_sheet"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Maleka Furnitures on Instagram"
              className="inline-flex size-9 items-center justify-center border border-white/20 text-ink-foreground/80 transition-colors hover:border-gold hover:text-gold"
            >
              <Instagram className="size-4" />
            </a>
            <span
              role="img"
              aria-label="Facebook page coming soon"
              title="Facebook page coming soon"
              className="inline-flex size-9 cursor-not-allowed items-center justify-center border border-white/10 text-ink-foreground/30"
            >
              <Facebook className="size-4" />
            </span>
            <span
              role="img"
              aria-label="YouTube channel coming soon"
              title="YouTube channel coming soon"
              className="inline-flex size-9 cursor-not-allowed items-center justify-center border border-white/10 text-ink-foreground/30"
            >
              <Youtube className="size-4" />
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow text-ink-foreground/50">Showroom</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 text-ink-foreground/80 transition-colors hover:text-gold"
          >
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {BUSINESS.address}
          </a>
          <a
            href={telUrl}
            className="flex items-center gap-2 text-ink-foreground/80 transition-colors hover:text-gold"
          >
            <Phone className="size-4 shrink-0" />
            {BUSINESS.phoneDisplay}
          </a>
          <a href={`tel:${BUSINESS.alternatePhone}`} className="flex items-center gap-2 text-ink-foreground/80 transition-colors hover:text-gold"><Phone className="size-4 shrink-0" />+91 89853 14344</a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-ink-foreground/80 transition-colors hover:text-gold"
          >
            <MessageCircle className="size-4 shrink-0" />
            Enquire on WhatsApp
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow text-ink-foreground/50">Browse</p>
          <Link to="/explore" className="block text-ink-foreground/80 hover:text-gold">
            Full catalogue
          </Link>
          <Link to="/visit" className="block text-ink-foreground/80 hover:text-gold">
            Visit the showroom
          </Link>
          <Link to="/privacy" className="block text-ink-foreground/80 hover:text-gold">
            Privacy Policy
          </Link>
          <Link to="/terms" className="block text-ink-foreground/80 hover:text-gold">
            Terms & Conditions
          </Link>
          {/* <Link to="/owner" className="block text-ink-foreground/50 hover:text-gold mt-6">
            Owner login
          </Link> */}
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-ink-foreground/40 md:px-8">
          © {new Date().getFullYear()} Maleka Furnitures, Hyderabad. Display
          pieces only — no online purchase.
        </p>
      </div>
    </footer>
  );
}
