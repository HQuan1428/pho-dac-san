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
        actions={<AddProvinceDialog regions={regionOptions} />}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-3">
        <span>
          Hiện có: <strong className="text-foreground">{regions.length}</strong> vùng miền ·{" "}
          <strong className="text-foreground">{totalProvinces}</strong> tỉnh/thành phố
        </span>
      </div>

      <div className="space-y-6">
        {regions.map((region) => (
          <Card key={region.id}>
            <CardHeader className="border-b pb-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      {region.name}
                      <Badge variant="secondary" className="text-xs">
                        {region.provinces.length} tỉnh thành
                      </Badge>
                    </CardTitle>
                    <p className="font-mono text-xs text-muted-foreground">/{region.slug}</p>
                  </div>
                </div>

                <EditRegionDialog region={{ id: region.id, name: region.name }} />
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {region.provinces.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Chưa có tỉnh thành nào thuộc vùng miền này.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {region.provinces.map((prov) => (
                    <div
                      key={prov.id}
                      className="flex items-center justify-between rounded-md border bg-card p-2.5 hover:border-foreground/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{prov.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono">{prov.slug}</span>
                          <span>·</span>
                          <span>{prov._count.shops} shop</span>
                          <span>·</span>
                          <span>{prov._count.products} SP</span>
                        </div>
                      </div>

                      <EditProvinceDialog
                        province={{
                          id: prov.id,
                          name: prov.name,
                          regionId: region.id,
                        }}
                        regions={regionOptions}
                      />
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
