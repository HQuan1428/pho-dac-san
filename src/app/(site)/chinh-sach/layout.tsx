import { Calendar } from "lucide-react";
import { PolicyNav } from "./policy-nav";

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Văn bản pháp lý
              </h2>
              <PolicyNav />
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground">
              <Calendar className="size-4 shrink-0 text-foreground" />
              <span>
                Cập nhật lần cuối: <strong className="text-foreground">15/10/2026</strong>
              </span>
            </div>
          </aside>

          <main className="max-w-prose space-y-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
