type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";
type BadgeSize = "default" | "compact";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-brand-green-05 text-brand-green border-brand-green-15",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-brand-black-05 text-brand-black-75 border-brand-black-15",
  info: "bg-brand-blue-05 text-brand-blue border-brand-blue-15",
};

const sizeClasses: Record<BadgeSize, string> = {
  default: "px-2.5 py-0.5 text-xs",
  compact: "px-1.5 py-0 text-[11px] leading-4",
};

export function Badge({
  children,
  variant = "neutral",
  size = "default",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
