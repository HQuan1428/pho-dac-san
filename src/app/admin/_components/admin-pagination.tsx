import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 20,
  baseUrl,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>Hiển thị {totalItems} kết quả</span>
        <span>Trang 1 / 1</span>
      </div>
    );
  }

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams) {
      for (const [key, val] of Object.entries(searchParams)) {
        if (val && key !== "page") {
          params.set(key, val);
        }
      }
    }
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3 text-sm">
      <div className="text-xs text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{startItem}</span> -{" "}
        <span className="font-medium text-foreground">{endItem}</span> trên tổng số{" "}
        <span className="font-medium text-foreground">{totalItems}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          render={
            currentPage > 1 ? (
              <Link href={buildUrl(currentPage - 1)} />
            ) : undefined
          }
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        <span className="px-2 text-xs font-medium text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          render={
            currentPage < totalPages ? (
              <Link href={buildUrl(currentPage + 1)} />
            ) : undefined
          }
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
