import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  File,
  FileText,
  GraduationCap,
  HandCoins,
  Megaphone,
  PiggyBank,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { fetchAmlTrainingMaterials } from "@/features/aml-training-materials/api";
import { fetchCirculars } from "@/features/circulars/api";
import { fetchCreditTrainingMaterials } from "@/features/credit-training-materials/api";
import { fetchItTrainingMaterials } from "@/features/it-training-materials/api";
import { fetchOperationTrainingMaterials } from "@/features/operation-training-materials/api";
import { fetchPolicies } from "@/features/policies/api";
import { fetchProductPapers } from "@/features/product-papers/api";
import { fetchRiskTrainingMaterials } from "@/features/risk-training-materials/api";
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
    accent: "from-brand-blue-05 via-white to-brand-green-05",
  },
  {
    title: "Credit",
    description:
      "Loan and credit product papers prepared for lending and service teams.",
    href: "/product-paper/credit",
    icon: HandCoins,
    accent: "from-brand-green-05 via-white to-brand-blue-05",
  },
];

const LATEST_UPDATES = [
  {
    section: "Latest Circulars",
    accent: "bg-brand-blue",
    viewAllHref: "/circulars",
    emptyLabel: "No circulars available",
    emptyDescription: "New circular documents will appear here once uploaded.",
    icon: Megaphone,
  },
  {
    section: "Latest Policies",
    accent: "bg-brand-green",
    viewAllHref: "/policies",
    emptyLabel: "No policies available",
    emptyDescription: "Policy documents will appear here once uploaded.",
    icon: ScrollText,
  },
  {
    section: "Latest Training Material",
    accent: "bg-brand-blue-75",
    viewAllHref: "/training-materials/credit",
    emptyLabel: "No documents available",
    emptyDescription: "The newest public training material will appear here.",
    icon: GraduationCap,
  },
];

type LatestDocumentCardData = {
  title: string;
  uploadedAt: string | null;
  description?: string | null;
  viewPdfHref: string;
};

async function getHomepageCounts() {
  const countRequest = { limit: 1 };

  try {
    const [
      productPapers,
      circulars,
      policies,
      amlMaterials,
      creditMaterials,
      itMaterials,
      operationMaterials,
      riskMaterials,
    ] = await Promise.all([
      fetchProductPapers(countRequest),
      fetchCirculars(countRequest),
      fetchPolicies(countRequest),
      fetchAmlTrainingMaterials(countRequest),
      fetchCreditTrainingMaterials(countRequest),
      fetchItTrainingMaterials(countRequest),
      fetchOperationTrainingMaterials(countRequest),
      fetchRiskTrainingMaterials(countRequest),
    ]);

    return {
      productPapers: productPapers.total,
      circulars: circulars.total,
      policies: policies.total,
      trainingMaterials:
        amlMaterials.total +
        creditMaterials.total +
        itMaterials.total +
        operationMaterials.total +
        riskMaterials.total,
    };
  } catch {
    return {
      productPapers: null,
      circulars: null,
      policies: null,
      trainingMaterials: null,
    };
  }
}

function formatCount(value: number | null): string {
  return value === null ? "—" : String(value).padStart(2, "0");
}

function formatDocumentDate(value: string | null): string {
  if (!value) {
    return "Upload date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

async function getLatestDocuments() {
  const latestRequest = { limit: 1 };

  try {
    const [circulars, policies, amlMaterials, creditMaterials, itMaterials, operationMaterials, riskMaterials] =
      await Promise.all([
        fetchCirculars(latestRequest),
        fetchPolicies(latestRequest),
        fetchAmlTrainingMaterials(latestRequest),
        fetchCreditTrainingMaterials(latestRequest),
        fetchItTrainingMaterials(latestRequest),
        fetchOperationTrainingMaterials(latestRequest),
        fetchRiskTrainingMaterials(latestRequest),
      ]);

    const latestCircular = circulars.data[0]
      ? {
          title: circulars.data[0].title,
          uploadedAt: circulars.data[0].createdAt,
          viewPdfHref: `/circulars/view/${circulars.data[0].id}`,
        }
      : null;

    const latestPolicy = policies.data[0]
      ? {
          title: policies.data[0].title,
          uploadedAt: policies.data[0].createdAt,
          viewPdfHref: `/policies/view/${policies.data[0].id}`,
        }
      : null;

    const trainingCandidates: LatestDocumentCardData[] = [
      amlMaterials.data[0]
        ? {
            title: amlMaterials.data[0].title,
            uploadedAt: amlMaterials.data[0].createdAt,
            viewPdfHref: `/training-materials/aml/view/${amlMaterials.data[0].id}`,
          }
        : null,
      creditMaterials.data[0]
        ? {
            title: creditMaterials.data[0].title,
            uploadedAt: creditMaterials.data[0].createdAt,
            viewPdfHref: `/training-materials/credit/view/${creditMaterials.data[0].id}`,
          }
        : null,
      itMaterials.data[0]
        ? {
            title: itMaterials.data[0].title,
            uploadedAt: itMaterials.data[0].createdAt,
            viewPdfHref: `/training-materials/it/view/${itMaterials.data[0].id}`,
          }
        : null,
      operationMaterials.data[0]
        ? {
            title: operationMaterials.data[0].title,
            uploadedAt: operationMaterials.data[0].createdAt,
            viewPdfHref: `/training-materials/operation/view/${operationMaterials.data[0].id}`,
          }
        : null,
      riskMaterials.data[0]
        ? {
            title: riskMaterials.data[0].title,
            uploadedAt: riskMaterials.data[0].createdAt,
            viewPdfHref: `/training-materials/risks/view/${riskMaterials.data[0].id}`,
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    const latestTrainingMaterial =
      trainingCandidates.length > 0
        ? trainingCandidates.sort((a, b) => {
            const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
            const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
            return bTime - aTime;
          })[0]
        : null;

    return {
      circular: latestCircular,
      policy: latestPolicy,
      trainingMaterial: latestTrainingMaterial,
    };
  } catch {
    return {
      circular: null,
      policy: null,
      trainingMaterial: null,
    };
  }
}

function LatestDocumentCard({
  title,
  accent,
  icon: Icon,
  viewAllHref,
  emptyLabel,
  emptyDescription,
  document,
}: {
  title: string;
  accent: string;
  icon: typeof Megaphone;
  viewAllHref: string;
  emptyLabel: string;
  emptyDescription: string;
  document: LatestDocumentCardData | null;
}) {
  return (
    <div className="flex h-full flex-col rounded-[1.6rem] border border-brand-blue-15/80 bg-white/88 p-5 shadow-[0_12px_28px_rgba(0,122,181,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue-25 hover:shadow-[0_18px_40px_rgba(0,122,181,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-10 rounded-full ${accent}`} aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-black-50">
            {title}
          </p>
        </div>
        <div className="rounded-xl bg-brand-blue-05 p-2 text-brand-blue">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      {document ? (
        <>
          <p className="mt-5 text-sm font-medium text-brand-black-50">
            {formatDocumentDate(document.uploadedAt)}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-brand-blue">{document.title}</h3>
          {document.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-black-75">
              {document.description}
            </p>
          ) : (
            <div className="mt-2 min-h-12" />
          )}
          <div className="mt-auto flex items-center justify-between gap-4 pt-5">
            <Button href={document.viewPdfHref} variant="outline" className="px-4 py-2 text-sm">
              View PDF
            </Button>
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green"
            >
              View All
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col justify-between">
          <div className="pt-6">
            <div className="mb-4 inline-flex rounded-2xl bg-brand-blue-05 p-3 text-brand-blue">
              <File className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-brand-blue">{emptyLabel}</p>
            <p className="mt-2 text-sm leading-6 text-brand-black-75">{emptyDescription}</p>
          </div>
          <div className="pt-5">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green"
            >
              View All
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function Home() {
  const counts = await getHomepageCounts();
  const latestDocuments = await getLatestDocuments();
  const portalStats = [
    {
      label: "Product Papers",
      value: formatCount(counts.productPapers),
      detail: "Public product paper documents",
      icon: FileText,
    },
    {
      label: "Circulars",
      value: formatCount(counts.circulars),
      detail: "Public circular documents",
      icon: Megaphone,
    },
    {
      label: "Policies",
      value: formatCount(counts.policies),
      detail: "Public policy documents",
      icon: ShieldCheck,
    },
    {
      label: "Training Materials",
      value: formatCount(counts.trainingMaterials),
      detail: "All public training documents",
      icon: GraduationCap,
    },
  ];

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(0,122,181,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(116,181,60,0.10),transparent_26%),linear-gradient(180deg,#f8fbfd_0%,#eef6fa_50%,#f7fbf6_100%)] px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-45"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,122,181,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,122,181,0.045) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex flex-col gap-7 lg:gap-9">
            <section className="relative overflow-hidden rounded-[2rem] border border-brand-blue-15/80 bg-white/80 shadow-[0_20px_50px_rgba(0,122,181,0.10)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-brand-blue-15 blur-3xl" />
                <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-brand-green-15 blur-3xl" />
                <div className="absolute -bottom-14 left-1/4 h-28 w-80 rounded-[999px] bg-[linear-gradient(90deg,rgba(0,122,181,0.10),rgba(116,181,60,0.08))] blur-2xl" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.72))]" />
              </div>

              <div className="relative grid gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:px-10 lg:py-7">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-15 bg-brand-green-05 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">
                    <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
                    Secure Internal Knowledge Hub
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-[1.9rem] font-bold tracking-tight text-brand-blue sm:text-[2.2rem] lg:text-[2.45rem]">
                      Saptakoshi Development Bank
                    </h1>
                    <p className="text-base font-semibold text-brand-black sm:text-lg">
                      Digital Document Portal
                    </p>
                    <p className="max-w-xl text-sm leading-7 text-brand-black-75 sm:text-base">
                      Access product papers, circulars, policies and training materials from one
                      secure and organized platform.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:pt-1">
                    <Button href="/product-paper/deposit" className="min-w-52">
                      Browse Product Papers
                    </Button>
                    <Button href="/circulars" variant="outline" className="min-w-52">
                      View Circulars
                    </Button>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/80 bg-white/65 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">
                        Trusted Access
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-brand-blue">
                        Official bank documents in one place
                      </h2>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-2 border-brand-blue/70 pl-4">
                        <p className="text-sm font-semibold text-brand-blue">Official Records</p>
                        <p className="mt-1 text-sm leading-6 text-brand-black-75">
                          Verified circulars, policies and product resources organized for faster
                          access.
                        </p>
                      </div>

                      <div className="border-l-2 border-brand-green/70 pl-4">
                        <p className="text-sm font-semibold text-brand-blue">
                          Protected Staff Features
                        </p>
                        <p className="mt-1 text-sm leading-6 text-brand-black-75">
                          Internal workflows, review features and administration remain secured by
                          login.
                        </p>
                      </div>
                    </div>

                    <Button href="/login" variant="secondary" className="w-full sm:w-auto">
                      Staff Login
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/70 bg-white/65 px-5 py-4 shadow-[0_10px_28px_rgba(0,122,181,0.05)] backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {portalStats.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-4 xl:pr-4">
                      <div className="rounded-xl bg-brand-blue-05 p-3 text-brand-blue">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-bold text-brand-blue">{item.value}</p>
                        <p className="text-sm font-semibold text-brand-black">{item.label}</p>
                        <p className="text-sm text-brand-black-75">{item.detail}</p>
                      </div>
                      {index < portalStats.length - 1 ? (
                        <div className="ml-auto hidden h-12 w-px bg-brand-blue-15 xl:block" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
                  Quick Access
                </p>
                <h2 className="text-2xl font-bold text-brand-blue">Find documents faster</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {QUICK_ACCESS_LINKS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group rounded-[1.4rem] border border-transparent bg-white/55 px-4 py-4 shadow-[0_8px_22px_rgba(0,122,181,0.04)] ring-1 ring-brand-blue-15/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/82 hover:shadow-[0_16px_34px_rgba(0,122,181,0.10)] hover:ring-brand-blue-25"
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex rounded-xl bg-brand-blue-05 p-2.5 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-brand-blue">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-brand-black-75">
                            {item.description}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-green">
                            Open
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
                  Latest Documents
                </p>
                <h2 className="text-2xl font-bold text-brand-blue">Newest uploaded documents</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <LatestDocumentCard
                  title={LATEST_UPDATES[0].section}
                  accent={LATEST_UPDATES[0].accent}
                  icon={LATEST_UPDATES[0].icon}
                  viewAllHref={LATEST_UPDATES[0].viewAllHref}
                  emptyLabel={LATEST_UPDATES[0].emptyLabel}
                  emptyDescription={LATEST_UPDATES[0].emptyDescription}
                  document={latestDocuments.circular}
                />
                <LatestDocumentCard
                  title={LATEST_UPDATES[1].section}
                  accent={LATEST_UPDATES[1].accent}
                  icon={LATEST_UPDATES[1].icon}
                  viewAllHref={LATEST_UPDATES[1].viewAllHref}
                  emptyLabel={LATEST_UPDATES[1].emptyLabel}
                  emptyDescription={LATEST_UPDATES[1].emptyDescription}
                  document={latestDocuments.policy}
                />
                <LatestDocumentCard
                  title={LATEST_UPDATES[2].section}
                  accent={LATEST_UPDATES[2].accent}
                  icon={LATEST_UPDATES[2].icon}
                  viewAllHref={LATEST_UPDATES[2].viewAllHref}
                  emptyLabel={LATEST_UPDATES[2].emptyLabel}
                  emptyDescription={LATEST_UPDATES[2].emptyDescription}
                  document={latestDocuments.trainingMaterial}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
                  Product Paper Categories
                </p>
                <h2 className="text-2xl font-bold text-brand-blue">
                  Browse by banking category
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {PRODUCT_PAPER_CATEGORIES.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`group relative overflow-hidden rounded-[1.8rem] border border-brand-blue-15 bg-gradient-to-br ${item.accent} p-6 shadow-[0_14px_34px_rgba(0,122,181,0.07)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue-25 hover:shadow-[0_22px_48px_rgba(0,122,181,0.15)]`}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-green via-brand-blue to-brand-green"
                        aria-hidden="true"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green">
                            Product Category
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-brand-blue">
                            {item.title}
                          </h3>
                          <p className="mt-3 max-w-md text-sm leading-6 text-brand-black-75">
                            {item.description}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/80 bg-white/80 p-3 text-brand-blue shadow-sm transition-colors group-hover:bg-brand-blue group-hover:text-white">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/70 pt-4">
                        <span className="text-sm font-semibold text-brand-blue">
                          Open {item.title} Product Papers
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green">
                          Browse
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
              <div className="rounded-[1.8rem] bg-white/55 p-6 shadow-[0_10px_28px_rgba(0,122,181,0.04)] ring-1 ring-brand-blue-15/70 backdrop-blur">
                <div className="mb-3 space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">
                    About This Portal
                  </p>
                  <h2 className="text-2xl font-bold text-brand-blue">
                    Official documents with secure staff access
                  </h2>
                </div>
                <div className="max-w-3xl">
                  <p className="text-sm leading-7 text-brand-black-75 sm:text-base">
                    This portal gives teams and authorized users access to official product
                    papers, circulars, policies and training materials in one organized digital
                    workspace. Public document areas can be viewed directly, while internal staff
                    features, review workflows and administration require login access.
                  </p>
                </div>
              </div>

              <Card className="h-full overflow-hidden border-brand-blue-15 bg-transparent">
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

            <footer className="rounded-3xl border border-brand-blue-15 bg-white/90 px-6 py-5 shadow-[0_10px_30px_rgba(0,122,181,0.06)]">
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
        </div>
      </div>
    </PublicPortalLayout>
  );
}
