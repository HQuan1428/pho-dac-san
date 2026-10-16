"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Wrapper for intercepted routes in the (site)/@modal slot: open on mount, closing goes back in history.
export function RouteModal({
  title,
  variant = "dialog",
  className,
  children,
}: {
  title: string;
  variant?: "dialog" | "sheet";
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const onOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  if (variant === "sheet") {
    return (
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="right" className={cn("w-full overflow-y-auto sm:max-w-xl", className)}>
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className={cn("sm:max-w-3xl", className)}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
