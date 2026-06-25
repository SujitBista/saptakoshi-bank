"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminBrand } from "@/components/layout/AdminBrand";

const PRODUCT_PAPER_LINKS = [
  { href: "/product-paper/deposit", label: "Deposit" },
  { href: "/product-paper/credit", label: "Credit" },
];

export function PublicPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-brand-blue-05">
      <header className="border-b-4 border-brand-green bg-brand-blue text-white shadow-md">
        <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <AdminBrand
              variant="light"
              size="sm"
              showTagline
              hideTaglineOnMobile
              tagline="Trusted Banking Partner"
            />
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Staff Login
              </Link>
              <Link
                href="/admin/login"
                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue-05"
              >
                Admin Login
              </Link>
            </div>
          </div>

          <nav
            aria-label="Public navigation"
            className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue-25">
              Product Paper
            </span>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_PAPER_LINKS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-brand-blue"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
