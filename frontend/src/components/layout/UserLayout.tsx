"use client";

import type { ReactNode } from "react";
import { AdminBrand } from "@/components/layout/AdminBrand";
import { Button } from "@/components/ui/Button";

type UserLayoutProps = {
  children: ReactNode;
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
};

export function UserLayout({
  children,
  userEmail,
  userRole,
  onLogout,
}: UserLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-blue-05">
      <header className="border-b-4 border-brand-green bg-brand-blue text-white shadow-md">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <AdminBrand
            variant="light"
            size="sm"
            showTagline
            tagline="Trusted Banking Partner"
          />

          <div className="flex shrink-0 items-center gap-3">
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
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                Logout
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
