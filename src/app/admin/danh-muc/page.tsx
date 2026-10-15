import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "../_components/admin-pagination";
import {
  CreateCategoryDialog,
  EditCategoryDialog,
  DeleteCategoryButton,
} from "./category-dialogs";
import { FolderTree } from "lucide-react";

export const metadata = {
  title: "Quản lý danh mục — Phố Đặc Sản Admin",
};

export default async function AdminDanhMucPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 20;

  const [categories, allCategories, totalItems] = await Promise.all([
    db.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.category.count(),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý danh mục"
        description="Cấu trúc cây phân loại ngành hàng đặc sản và các nhóm sản phẩm vùng miền."
        actions={<CreateCategoryDialog categories={allCategories} />}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead className="text-center">Thứ tự</TableHead>
              <TableHead className="text-center">Sản phẩm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <FolderTree className="size-6 text-muted-foreground/60" />
                    <span>Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {c.name}
                      {c._count.children > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {c._count.children} nhóm con
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.slug}
                  </TableCell>

                  <TableCell className="text-xs">
                    {c.parent ? (
                      <span className="font-medium text-foreground">{c.parent.name}</span>
                    ) : (
                      <span className="text-muted-foreground">— (Cấp 1)</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center font-mono text-xs">
                    {c.sortOrder}
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {c._count.products}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditCategoryDialog
                        category={{
                          id: c.id,
                          name: c.name,
                          parentId: c.parentId,
                          sortOrder: c.sortOrder,
                        }}
                        allCategories={allCategories}
                      />
                      <DeleteCategoryButton
                        categoryId={c.id}
                        categoryName={c.name}
                        productCount={c._count.products}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          baseUrl="/admin/danh-muc"
        />
      </div>
    </div>
  );
}
