import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark focus-visible:ring-brand-blue disabled:bg-brand-blue-50",
  secondary:
    "bg-brand-green text-white hover:bg-brand-green-dark focus-visible:ring-brand-green disabled:bg-brand-green-75",
  outline:
    "border border-brand-blue-25 bg-white text-brand-blue hover:bg-brand-blue-05 focus-visible:ring-brand-blue",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

type SharedButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
    isLoading?: boolean;
  };

type ButtonAsLinkProps = SharedButtonProps & {
  href: string;
  isLoading?: never;
};

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href } = props;
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { isLoading = false, disabled, ...buttonProps } = props as ButtonAsButtonProps;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
