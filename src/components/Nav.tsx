"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "./ui";
import { useOrg } from "./OrgProvider";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/find", label: "Find My Nonprofit" },
  { href: "/dossier", label: "Dossier" },
  { href: "/frames", label: "Funding Frames" },
  { href: "/funders", label: "Funder Matches" },
  { href: "/assets", label: "Grant Assets" },
  { href: "/readiness", label: "Readiness" },
  { href: "/plan", label: "90-Day Plan" },
];

export function Nav() {
  const pathname = usePathname();
  const { hasProfile, profile } = useOrg();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            FF
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">FundFit</span>
        </Link>
        <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 sm:inline">
          Demo · mock data
        </span>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {hasProfile && profile.name && (
          <span className="ml-auto hidden max-w-[14rem] truncate text-sm text-slate-500 lg:ml-3 lg:block">
            {profile.name}
          </span>
        )}

        <button
          className="ml-auto rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium",
                isActive(item.href) ? "bg-teal-50 text-teal-800" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
