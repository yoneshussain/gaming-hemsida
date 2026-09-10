import { Disc3, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { platformById } from "@/config/store";
import { ProductFormat } from "@/lib/catalog";

const PLATFORM_CLASS: Record<string, string> = {
  ps5: "border-platform-ps5/40 text-platform-ps5 bg-platform-ps5/10",
  xbox: "border-platform-xbox/40 text-platform-xbox bg-platform-xbox/10",
  pc: "border-platform-pc/40 text-platform-pc bg-platform-pc/10",
};

export function PlatformBadge({ platform, className }: { platform: string; className?: string }) {
  const meta = platformById(platform);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        PLATFORM_CLASS[platform] ?? "border-border text-muted-foreground",
        className,
      )}
    >
      {meta?.name ?? platform}
    </span>
  );
}

export function FormatBadge({ format, className }: { format: ProductFormat; className?: string }) {
  const physical = format === "physical";
  const Icon = physical ? Disc3 : Download;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {physical ? "Physical disc" : "Digital"}
    </span>
  );
}
