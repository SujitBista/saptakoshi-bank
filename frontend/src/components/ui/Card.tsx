import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-brand-blue-15 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
}

export function CardHeader({ title, description }: CardHeaderProps) {
  return (
    <div className="border-b border-brand-blue-15 px-6 py-5">
      <h2 className="text-lg font-semibold text-brand-blue">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-brand-black-75">{description}</p>
      ) : null}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
