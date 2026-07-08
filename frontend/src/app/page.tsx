import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FileText,
  GraduationCap,
  HandCoins,
  Megaphone,
  PiggyBank,
  ScrollText,
} from "lucide-react";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const QUICK_ACCESS_LINKS = [
  {
    title: "Product Papers",
    description: "Explore approved banking product documents by business category.",
    href: "/product-paper/deposit",
    icon: FileText,
  },
  {
    title: "Circulars",
    description: "Review official circulars and updates shared across the bank.",
    href: "/circulars",
    icon: Megaphone,
  },
  {
    title: "Policies",
    description: "Find policy documents and guidance in one organized location.",
    href: "/policies",
    icon: ScrollText,
  },
  {
    title: "Training Materials",
    description: "Access learning resources for operational and compliance training.",
    href: "/training-materials/credit",
    icon: GraduationCap,
  },
];

const PRODUCT_PAPER_CATEGORIES = [
  {
    title: "Deposit",
    description:
      "Savings, fixed deposit and related product documents for customer-facing teams.",
    href: "/product-paper/deposit",
    icon: PiggyBank,
  },
  {
    title: "Credit",
    description:
      "Loan and credit product papers prepared for lending and service teams.",
    href: "/product-paper/credit",
    icon: HandCoins,
  },
];

const LATEST_UPDATES = [
  {
    title: "Latest Circulars",
    description:
      "Recent circulars and communications will appear here as soon as they are published.",
    accent: "bg-brand-blue",
    href: "/circulars",
  },
  {
    title: "Latest Policies",
    description:
      "Updated policy references will be listed here to help staff find the latest version.",
    accent: "bg-brand-green",
    href: "/policies",
  },
  {
    title: "Latest Training Materials",
    description:
      "Newly added training resources will be highlighted here for quick access.",
    accent: "bg-brand-blue-75",
    href: "/training-materials/credit",
  },
];

export default function Home() {
  return (
    <PublicPortalLayout>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-brand-blue-15 bg-white shadow-[0_20px_45px_rgba(0,122,181,0.14)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:px-10 lg:py-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-15 bg-brand-green-05 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">
                <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
                Secure Internal Knowledge Hub
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl lg:text-5xl">
                  Saptakoshi Development Bank
                </h1>
                <p className="text-lg font-semibold text-brand-black sm:text-xl">
                  Digital Document Portal
                </p>
                <p className="max-w-3xl text-sm leading-7 text-brand-black-75 sm:text-base">
                  Access product papers, circulars, policies and training materials
                  from one secure and organized platform.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href="/product-paper/deposit" className="min-w-52">
                  Browse Product Papers
                </Button>
                <Button href="/circulars" variant="outline" className="min-w-52">
                  View Circulars
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-brand-blue-15 bg-brand-blue-05 p-5 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-blue p-3 text-white">
                    <Building2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-blue">Official Records</p>
                    <p className="mt-2 text-sm leading-6 text-brand-black-75">
                      Centralized access to verified public and internal banking documents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-green-15 bg-brand-green-05 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-green p-3 text-white">
                    <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-blue">Staff Access</p>
                    <p className="mt-2 text-sm leading-6 text-brand-black-75">
                      Internal workflows, staff features and administration remain protected by
                      login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
              Quick Access
            </p>
            <h2 className="text-2xl font-bold text-brand-blue">Find documents faster</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACCESS_LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-brand-blue-15 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue-25 hover:shadow-[0_18px_40px_rgba(0,122,181,0.16)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-brand-blue-05 p-3 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-blue">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-black-75">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-green">
                    Open section
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader
              title="Product Paper Categories"
              description="Browse official product paper documents by banking category."
            />
            <CardContent className="grid gap-4 md:grid-cols-2">
              {PRODUCT_PAPER_CATEGORIES.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group relative overflow-hidden rounded-2xl border border-brand-blue-15 bg-gradient-to-br from-white via-white to-brand-blue-05 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue-25 hover:shadow-[0_18px_40px_rgba(0,122,181,0.14)]"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 bg-brand-green"
                      aria-hidden="true"
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-brand-blue">{item.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-brand-black-75">
                          {item.description}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-brand-blue-05 p-3 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
                      Open {item.title} Product Papers
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
              Latest Updates
            </p>
            <h2 className="text-2xl font-bold text-brand-blue">Recently highlighted resources</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {LATEST_UPDATES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-brand-blue-15 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,122,181,0.14)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-12 rounded-full ${item.accent}`}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-black-50">
                    Placeholder
                  </p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-brand-blue">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-black-75">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-green">
                  View section
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <Card className="h-full">
            <CardHeader
              title="About this Portal"
              description="A secure space for official banking documents and internal knowledge resources."
            />
            <CardContent>
              <p className="text-sm leading-7 text-brand-black-75 sm:text-base">
                This portal gives teams and authorized users access to official product papers,
                circulars, policies and training materials in one organized digital workspace.
                Public document areas can be viewed directly, while internal staff features,
                review workflows and administration require login access.
              </p>
            </CardContent>
          </Card>

          <Card className="h-full overflow-hidden">
            <CardContent className="flex h-full flex-col justify-between gap-5 bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white">
              <div>
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
                  <BookOpen className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold">Need secure staff access?</h2>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Continue to the staff portal for document workflows and internal operations.
                </p>
              </div>
              <div>
                <Button href="/login" variant="secondary" className="w-full">
                  Staff Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="rounded-3xl border border-brand-blue-15 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-brand-blue">
                Saptakoshi Development Bank
              </p>
              <p className="text-sm text-brand-black-75">Trusted Banking Partner</p>
            </div>
            <p className="text-sm text-brand-black-50">
              Copyright © Saptakoshi Development Bank. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </PublicPortalLayout>
  );
}
