import { cn } from "@/lib/utils";

/** The one page container every section aligns to. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}
