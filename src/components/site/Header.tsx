import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import { BUSINESS, telUrl } from "@/lib/business";
import { logo } from "@/lib/local-assets";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/visit", label: "Visit" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:flex sm:justify-between md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logo}
            alt="HI LINE COMFORTS logo"
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gold/40"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-xl leading-none tracking-wide">
              HI LINE COMFORTS
            </span>
            <span className="eyebrow block pt-1">Telangana</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-[0.8rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.to && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={telUrl}
            className="inline-flex items-center gap-2 border border-foreground/80 px-4 py-2 text-[0.75rem] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
          >
            <Phone className="size-3.5" />
            {BUSINESS.phoneDisplay}
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 justify-self-end p-2 sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background sm:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3 text-sm uppercase tracking-[0.18em] text-muted-foreground last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={telUrl}
              className="mt-3 mb-3 inline-flex items-center justify-center gap-2 bg-foreground px-4 py-3 text-[0.75rem] uppercase tracking-[0.18em] text-background"
            >
              <Phone className="size-3.5" />
              Call {BUSINESS.phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
