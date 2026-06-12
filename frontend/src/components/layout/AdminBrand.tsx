"use client";

import Image from "next/image";
import { useState } from "react";

const LOGO_CANDIDATES = ["/logo.png", "/logo.svg"] as const;

export type AdminBrandSize = "sm" | "md" | "lg";
export type AdminBrandVariant = "light" | "dark";

export type AdminBrandProps = {
  size?: AdminBrandSize;
  variant?: AdminBrandVariant;
  showTagline?: boolean;
  tagline?: string;
  showAdminLabel?: boolean;
  adminLabel?: string;
  className?: string;
};

const sizeConfig = {
  sm: {
    logoPx: 48,
    title: "text-sm font-bold leading-tight",
    tagline: "text-[11px] font-medium",
    label: "text-[10px] font-semibold uppercase tracking-wide",
  },
  md: {
    logoPx: 56,
    title: "text-base font-bold leading-tight sm:text-lg",
    tagline: "text-xs font-medium",
    label: "text-[10px] font-semibold uppercase tracking-wide",
  },
  lg: {
    logoPx: 72,
    title: "text-xl font-bold leading-tight sm:text-2xl",
    tagline: "text-sm font-medium",
    label: "text-xs font-semibold uppercase tracking-wide",
  },
} as const;

function AdminLogoPlaceholder({ size }: { size: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-brand-blue-15"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="text-xs font-bold text-brand-blue">SK</span>
    </div>
  );
}

function AdminLogoImage({
  size,
  variant,
}: {
  size: number;
  variant: AdminBrandVariant;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  const ringClass =
    variant === "light"
      ? "shadow-lg shadow-black/20 ring-4 ring-white/35"
      : "shadow-md shadow-brand-blue/10 ring-2 ring-brand-blue-15";

  if (hasFailed || sourceIndex >= LOGO_CANDIDATES.length) {
    return <AdminLogoPlaceholder size={size} />;
  }

  const src = LOGO_CANDIDATES[sourceIndex];
  const isSvg = src.endsWith(".svg");

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-white ${ringClass}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="Saptakoshi Development Bank logo"
        width={isSvg ? size : 3361}
        height={isSvg ? size : 750}
        className={
          isSvg
            ? "h-full w-full object-contain p-1.5"
            : "absolute left-[-2%] top-1/2 h-[120%] w-auto max-w-none -translate-y-1/2 object-left"
        }
        onError={() => {
          if (sourceIndex + 1 < LOGO_CANDIDATES.length) {
            setSourceIndex((current) => current + 1);
            return;
          }

          setHasFailed(true);
        }}
        priority
      />
    </div>
  );
}

export function AdminBrand({
  size = "md",
  variant = "dark",
  showTagline = false,
  tagline = "Trusted Banking Partner",
  showAdminLabel = false,
  adminLabel = "Admin Portal",
  className = "",
}: AdminBrandProps) {
  const isLight = variant === "light";
  const config = sizeConfig[size];

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <AdminLogoImage size={config.logoPx} variant={variant} />

      <div className="min-w-0">
        {showAdminLabel ? (
          <p
            className={`mb-0.5 ${config.label} ${
              isLight ? "text-brand-blue-25" : "text-brand-blue"
            }`}
          >
            {adminLabel}
          </p>
        ) : null}

        <p className={`${config.title} ${isLight ? "text-white" : "text-brand-blue"}`}>
          <span className="text-brand-green">Saptakoshi</span>{" "}
          <span className={isLight ? "text-white" : "text-brand-blue"}>
            Development Bank
          </span>
        </p>

        {showTagline ? (
          <p
            className={`mt-0.5 ${config.tagline} ${
              isLight ? "text-brand-blue-25" : "text-brand-black-75"
            }`}
          >
            {tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
