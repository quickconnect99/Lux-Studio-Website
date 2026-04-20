import { cn } from "@/lib/utils";

export type MetadataItem = {
  label: string;
  value: string;
};

type MetadataGridProps = {
  items: MetadataItem[];
  variant?: "divider" | "cards";
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function MetadataGrid({
  items,
  variant = "divider",
  className,
  labelClassName,
  valueClassName
}: MetadataGridProps) {
  return (
    <div
      className={cn(
        variant === "divider" ? "metadata-grid" : "metadata-grid-cards",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(variant === "cards" && "metadata-card")}
        >
          <p className={cn("metadata-label", labelClassName)}>{item.label}</p>
          <p
            className={cn(
              variant === "divider"
                ? "metadata-value"
                : "metadata-value-compact",
              valueClassName
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
