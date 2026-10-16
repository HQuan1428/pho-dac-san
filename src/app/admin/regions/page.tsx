import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  EditRegionDialog,
  AddProvinceDialog,
  EditProvinceDialog,
} from "./region-dialogs";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Quản lý vùng miền & Tỉnh thành — Phố Đặc Sản Admin",
};

export default async function AdminVungMienPage() {
  await requireAdmin();

  const regions = await db.region.findMany({
    include: {
      provinces: {
        include: {
          _count: {
            select: { shops: true, products: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const totalProvinces = regions.reduce((acc, r) => acc + r.provinces.length, 0);
  const regionOptions = regions.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý vùng miền & Tỉnh thành"
        description="Quản lý 34 tỉnh thành và các phân vùng địa lý để phân loại nguồn gốc chỉ dẫn đặc sản."
      />

      {/* Toolbar above: summary info left, primary action right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Hiện có: <strong className="text-foreground">{regions.length}</strong> vùng miền ·{" "}
          <strong className="text-foreground">{totalProvinces}</strong> tỉnh/thành phố
        </div>

        <div>
          <AddProvinceDialog regions={regionOptions} />
        </div>
      </div>

      <div className="space-y-6">
        {regions.map((region) => (
          <Card key={region.id}>
            <CardHeader className="border-b py-3 px-4 bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold flex flex-wrap items-center gap-2">
                      <span className="truncate">{region.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {region.provinces.length} tỉnh thành
                      </Badge>
                    </CardTitle>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">/{region.slug}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <EditRegionDialog region={{ id: region.id, name: region.name }} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4">
              {region.provinces.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Chưa có tỉnh thành nào thuộc vùng miền này.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
                  {region.provinces.map((prov) => (
                    <div
                      key={prov.id}
                      className="flex items-center justify-between gap-2 rounded-md border bg-card p-2.5 hover:border-foreground/30 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{prov.name}</p>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground">
                          <span className="font-mono truncate max-w-[100px]">{prov.slug}</span>
                          <span>·</span>
                          <span className="whitespace-nowrap">{prov._count.shops} shop</span>
                          <span>·</span>
                          <span className="whitespace-nowrap">{prov._count.products} SP</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <EditProvinceDialog
                          province={{
                            id: prov.id,
                            name: prov.name,
                            regionId: prov.regionId,
                          }}
                          regions={regionOptions}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
