import Image from "next/image";

import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const sizes = {
  sm: { box: "size-10 text-sm", px: 40 },
  lg: { box: "size-16 text-lg", px: 64 },
};

/** Photo when available, otherwise initials. Decorative: the name is always shown beside it. */
export function PersonAvatar({
  name,
  image,
  size = "sm",
  className,
}: {
  name: string;
  image: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { box, px } = sizes[size];

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={px}
        height={px}
        className={cn(box, "shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-full bg-surface-blue font-semibold text-navy",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
