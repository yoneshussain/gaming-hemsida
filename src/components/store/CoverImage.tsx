import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { coverFor } from "@/data/covers";

interface CoverImageProps {
  imageKey: string;
  title: string;
  className?: string;
  priority?: boolean;
}

/** Cover art with a consistent 3:4 ratio and a polished fallback if the image is missing. */
export function CoverImage({ imageKey, title, className, priority }: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const src = coverFor(imageKey);

  return (
    <div className={cn("relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary", className)}>
      {src && !failed ? (
        <img
          src={src}
          alt={`${title} cover artwork`}
          width={768}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--gradient-surface)] p-4 text-center">
          <Gamepad2 className="h-8 w-8 text-primary/70" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Artwork unavailable
          </span>
        </div>
      )}
    </div>
  );
}
