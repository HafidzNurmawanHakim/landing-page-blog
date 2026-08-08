import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a package image via next/image, or a neutral placeholder when the
 * package has no image URL set.
 */
export function PackageImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string | null;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary text-secondary-foreground/60",
          className
        )}
      >
        <MapPin className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}
