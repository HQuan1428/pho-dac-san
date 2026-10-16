import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "../_components/admin-pagination";
import { MessageSquare, Mail } from "lucide-react";

export const metadata = {
  title: "Tin nhắn liên hệ — Phố Đặc Sản Admin",
};

export default async function AdminLienHePage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 20;

  const [messages, totalItems] = await Promise.all([
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.contactMessage.count(),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tin nhắn liên hệ"
        description="Danh sách phản hồi, câu hỏi và yêu cầu hợp tác gửi từ biểu mẫu liên hệ của website."
      />

      {/* Toolbar above table */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Tổng cộng: <strong className="text-foreground">{totalItems}</strong> tin nhắn
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
              <TableRow className="h-11">
                <TableHead className="w-48">Người gửi</TableHead>
                <TableHead>Nội dung tin nhắn</TableHead>
                <TableHead className="w-40">Thời gian gửi</TableHead>
                <TableHead className="w-24 text-right">Phản hồi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <MessageSquare className="size-6 text-muted-foreground/60" />
                      <span>Chưa có tin nhắn liên hệ nào.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id} className="align-top hover:bg-muted/30 transition-colors">
                    <TableCell className="py-2.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs">{msg.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{msg.email}</p>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground py-2.5">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(msg.createdAt)}
                    </TableCell>

                    <TableCell className="text-right py-2.5">
                      <Button
                        size="xs"
                        variant="outline"
                        render={
                          <a
                            href={`mailto:${msg.email}?subject=${encodeURIComponent(
                              "[Phố Đặc Sản] Phản hồi liên hệ của quý khách"
                            )}`}
                          />
                        }
                      >
                        <Mail data-icon="inline-start" className="size-3.5" />
                        Email
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/admin/contacts"
        />
      </div>
    </div>
  );
}
