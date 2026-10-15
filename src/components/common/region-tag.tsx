import { MapPin } from "lucide-react";

export function RegionTag({ province }: { province: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground">
      <MapPin className="size-3" />
      {province}
    </span>
  );
}
