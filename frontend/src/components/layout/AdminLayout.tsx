"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminBrand } from "@/components/layout/AdminBrand";
import { Button } from "@/components/ui/Button";

type AdminNavItem = {
  href: string;
  label: string;
};

type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    label: "Navigation",
    items: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/branches", label: "Branches" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/document-review", label: "Document Review" },
      { href: "/admin/product-papers", label: "Product Papers" },
      { href: "/admin/policies", label: "Policies" },
      { href: "/admin/circulars", label: "Circulars" },
    ],
  },
];

const ADMIN_NAV_ITEMS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);

type AdminLayoutProps = {
  children: ReactNode;
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
};

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminSidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 px-3 py-5">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-6 last:mb-0">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-brand-black-50">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-blue-05 text-brand-blue"
                        : "text-brand-black-75 hover:bg-brand-black-05 hover:text-brand-blue"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AdminMobileNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 lg:hidden lg:px-6"
      aria-label="Admin navigation"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-brand-blue"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout({
  children,
  userEmail,
  userRole,
  onLogout,
}: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-brand-blue-05">
      <header className="border-b-4 border-brand-green bg-brand-blue text-white shadow-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:gap-4 lg:px-6">
          <AdminBrand
            variant="light"
            size="sm"
            showAdminLabel
            adminLabel="Admin Portal"
            showTagline
            hideTaglineOnMobile
            tagline="Trusted Banking Partner"
          />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {userEmail ? (
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-white">{userEmail}</p>
                {userRole ? (
                  <p className="text-[11px] capitalize text-brand-blue-25">
                    {userRole}
                  </p>
                ) : null}
              </div>
            ) : null}

            {onLogout ? (
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 hover:text-white sm:px-4 sm:py-2"
              >
                Logout
              </Button>
            ) : null}
          </div>
        </div>

        <AdminMobileNav pathname={pathname} />
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-brand-black-15 bg-white lg:flex lg:flex-col">
          <AdminSidebarNav pathname={pathname} />

          <div className="border-t border-brand-black-15 px-4 py-4 text-xs text-brand-black-50">
            <p>Saptakoshi Development Bank Limited</p>
            <p className="mt-1">Biratnagar-9, Morang, Nepal</p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
