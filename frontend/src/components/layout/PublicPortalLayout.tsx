"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  HandCoins,
  House,
  Megaphone,
  Menu,
  PiggyBank,
  ScrollText,
  ShieldUser,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { AdminBrand } from "@/components/layout/AdminBrand";
import { cn } from "@/lib/utils";

const PRODUCT_PAPER_LINKS = [
  { href: "/product-paper/deposit", label: "Deposit", icon: PiggyBank },
  { href: "/product-paper/credit", label: "Credit", icon: HandCoins },
];

const TRAINING_MATERIAL_LINKS = [
  { href: "/training-materials/aml", label: "AML", icon: ShieldCheck },
  { href: "/training-materials/credit", label: "Credit", icon: HandCoins },
  { href: "/training-materials/operation", label: "Operation", icon: ClipboardList },
  { href: "/training-materials/risks", label: "Risks", icon: TriangleAlert },
];

export function PublicPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isTrainingMenuOpen, setIsTrainingMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const trainingMenuRef = useRef<HTMLDivElement>(null);
  const isProductPaperActive = PRODUCT_PAPER_LINKS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const isTrainingMaterialsActive = TRAINING_MATERIAL_LINKS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const isPoliciesActive =
    pathname === "/policies" || pathname.startsWith("/policies/");
  const isCircularsActive =
    pathname === "/circulars" || pathname.startsWith("/circulars/");

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!productMenuRef.current?.contains(event.target as Node)) {
        setIsProductMenuOpen(false);
      }
      if (!trainingMenuRef.current?.contains(event.target as Node)) {
        setIsTrainingMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProductMenuOpen(false);
        setIsTrainingMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function navLinkClass(isActive: boolean) {
    return cn(
      "group relative inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white transition-colors hover:bg-white/10",
      isActive && "font-semibold"
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-blue-05">
      <header className="border-b-4 border-brand-green bg-brand-blue text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <AdminBrand
            variant="light"
            size="sm"
            showTagline
            hideTaglineOnMobile
            tagline="Trusted Banking Partner"
          />

          <nav
            aria-label="Public navigation"
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            <Link href="/" className={navLinkClass(pathname === "/")}>
              <House className="h-4 w-4" aria-hidden="true" />
              Home
              <span
                className={cn(
                  "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                  pathname === "/" ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                )}
                aria-hidden="true"
              />
            </Link>

            <div
              ref={productMenuRef}
              className="relative"
              onMouseEnter={() => setIsProductMenuOpen(true)}
              onMouseLeave={() => setIsProductMenuOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  navLinkClass(isProductPaperActive || isProductMenuOpen),
                  isProductMenuOpen && "bg-white/10"
                )}
                aria-expanded={isProductMenuOpen}
                aria-haspopup="menu"
                aria-controls="product-paper-menu"
                onClick={() => setIsProductMenuOpen((open) => !open)}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Product Paper
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isProductMenuOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                    isProductPaperActive || isProductMenuOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-70"
                  )}
                  aria-hidden="true"
                />
              </button>

              {isProductMenuOpen ? (
                <div className="absolute left-0 top-full z-50 pt-1.5">
                  <div
                    id="product-paper-menu"
                    role="menu"
                    className="min-w-[12rem] overflow-hidden rounded-lg border border-brand-black-15 bg-white py-1 shadow-lg"
                  >
                    {PRODUCT_PAPER_LINKS.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black transition-colors hover:bg-brand-blue-05",
                            isActive && "bg-brand-blue-05 font-semibold text-brand-blue"
                          )}
                          onClick={() => setIsProductMenuOpen(false)}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-brand-blue"
                            aria-hidden="true"
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              ref={trainingMenuRef}
              className="relative"
              onMouseEnter={() => setIsTrainingMenuOpen(true)}
              onMouseLeave={() => setIsTrainingMenuOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  navLinkClass(isTrainingMaterialsActive || isTrainingMenuOpen),
                  isTrainingMenuOpen && "bg-white/10"
                )}
                aria-expanded={isTrainingMenuOpen}
                aria-haspopup="menu"
                aria-controls="training-materials-menu"
                onClick={() => setIsTrainingMenuOpen((open) => !open)}
              >
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Training Materials
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isTrainingMenuOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                    isTrainingMaterialsActive || isTrainingMenuOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-70"
                  )}
                  aria-hidden="true"
                />
              </button>

              {isTrainingMenuOpen ? (
                <div className="absolute left-0 top-full z-50 pt-1.5">
                  <div
                    id="training-materials-menu"
                    role="menu"
                    className="min-w-[12rem] overflow-hidden rounded-lg border border-brand-black-15 bg-white py-1 shadow-lg"
                  >
                    {TRAINING_MATERIAL_LINKS.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black transition-colors hover:bg-brand-blue-05",
                            isActive && "bg-brand-blue-05 font-semibold text-brand-blue"
                          )}
                          onClick={() => setIsTrainingMenuOpen(false)}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-brand-blue"
                            aria-hidden="true"
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <Link href="/policies" className={navLinkClass(isPoliciesActive)}>
              <ScrollText className="h-4 w-4" aria-hidden="true" />
              Policies
              <span
                className={cn(
                  "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                  isPoliciesActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                )}
                aria-hidden="true"
              />
            </Link>

            <Link href="/circulars" className={navLinkClass(isCircularsActive)}>
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              Circulars
              <span
                className={cn(
                  "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-white transition-opacity",
                  isCircularsActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                )}
                aria-hidden="true"
              />
            </Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-medium text-white transition-colors hover:bg-white/10",
                pathname === "/login" && "font-semibold bg-white/10"
              )}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Staff Login
            </Link>
            <Link
              href="/admin/login"
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue-05",
                pathname === "/admin/login" && "ring-2 ring-white/40"
              )}
            >
              <ShieldUser className="h-4 w-4" aria-hidden="true" />
              Admin Login
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="public-mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <nav
            id="public-mobile-menu"
            aria-label="Mobile navigation"
            className="border-t border-white/10 px-4 py-3 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10",
                  pathname === "/" && "bg-white/10 font-semibold"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <House className="h-4 w-4" aria-hidden="true" />
                Home
              </Link>

              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-brand-blue-25">
                Product Paper
              </p>
              {PRODUCT_PAPER_LINKS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10",
                      isActive && "bg-white/10 font-semibold"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-brand-blue-25">
                Training Materials
              </p>
              {TRAINING_MATERIAL_LINKS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10",
                      isActive && "bg-white/10 font-semibold"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/policies"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10",
                  isPoliciesActive && "bg-white/10 font-semibold"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                Policies
              </Link>

              <Link
                href="/circulars"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10",
                  isCircularsActive && "bg-white/10 font-semibold"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                Circulars
              </Link>

              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 py-2.5 text-sm text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Staff Login
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-brand-blue"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldUser className="h-4 w-4" aria-hidden="true" />
                  Admin Login
                </Link>
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
