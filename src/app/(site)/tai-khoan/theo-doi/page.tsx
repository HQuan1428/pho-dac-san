import Link from "next/link";
import { type Metadata } from "next";
import { Store } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { FollowedShopCard, type FollowedShopData } from "./followed-shop-card";

export const metadata: Metadata = {
  title: "Gian hàng đang theo dõi - Phố Đặc Sản",
};

export default async function FollowedShopsPage() {
  const user = await requireUser("/tai-khoan/theo-doi");

  const follows = await db.shopFollow.findMany({
    where: { userId: user.id },
    include: {
      shop: {
        include: {
          province: { select: { name: true } },
          _count: {
            select: {
              products: true,
              followers: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedShops: FollowedShopData[] = follows.map((f) => ({
    id: f.shop.id,
    href: `/gian-hang/${f.shop.slug}`,
    name: f.shop.name,
    logo: f.shop.logo,
    province: f.shop.province.name,
    productCount: f.shop._count.products,
    followerCount: f.shop._count.followers,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gian hàng theo dõi"
        description="Cập nhật nhanh nhất các món đặc sản mới và ưu đãi từ các gian hàng bạn yêu thích"
      />

      {formattedShops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Chưa theo dõi gian hàng nào"
          description="Bạn chưa bấm theo dõi gian hàng nào. Khám phá các gian hàng uy tín và bấm theo dõi để nhận thông báo mới nhé!"
          action={<Button render={<Link href="/" />}>Khám phá gian hàng</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {formattedShops.map((shop) => (
            <FollowedShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
