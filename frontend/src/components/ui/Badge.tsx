type BadgeVariant = "success" | "neutral";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-brand-green-05 text-brand-green border-brand-green-15",
  neutral: "bg-brand-black-05 text-brand-black-75 border-brand-black-15",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
