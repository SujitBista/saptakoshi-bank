import type { ReactNode } from "react";

export function DataListCards({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function DataListCard({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-brand-black-15 bg-white p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-brand-blue">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-brand-black-75">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {children ? (
        <dl className="mt-3 space-y-2 border-t border-brand-black-15 pt-3">
          {children}
        </dl>
      ) : null}

      {actions ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-brand-black-15 pt-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function DataListCardField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,6.5rem)_1fr] gap-x-3 gap-y-0.5 text-sm">
      <dt className="text-brand-black-50">{label}</dt>
      <dd className="min-w-0 font-medium text-brand-black">{value}</dd>
    </div>
  );
}
