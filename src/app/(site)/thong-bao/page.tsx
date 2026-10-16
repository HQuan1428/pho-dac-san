import Link from "next/link";
import { type Metadata } from "next";
import { Bell } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = {
  title: "Thông báo - Phố Đặc Sản",
};

export default async function NotificationsPage() {
  const user = await requireUser("/thong-bao");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông báo"
        description="Cập nhật tin tức về đơn hàng, tài khoản và các ưu đãi mới nhất"
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Chưa có thông báo nào"
          description="Bạn hiện không có thông báo mới nào từ hệ thống hoặc gian hàng."
          action={<Button render={<Link href="/" />}>Khám phá đặc sản</Button>}
        />
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
