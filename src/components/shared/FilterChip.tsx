import { cn } from "@/lib/utils";

/** Toggle button used by category and FAQ filters. */
export function FilterChip({
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-navy bg-navy text-primary-foreground"
          : "bg-white text-muted-foreground hover:border-surface-blue-strong hover:text-navy",
        className,
      )}
      {...props}
    />
  );
}
