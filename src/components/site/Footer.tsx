import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone, Star } from "lucide-react";

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
          <Link to="/owner" className="block text-ink-foreground/50 hover:text-gold mt-6">
            Owner login
          </Link>
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
