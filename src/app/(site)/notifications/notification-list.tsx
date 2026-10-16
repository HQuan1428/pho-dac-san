"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markAllAsReadAction, markAsReadAction } from "./actions";

export type NotificationItemData = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItemData[];
}) {
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsReadAction();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    });
  };

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Đánh dấu tất cả đã đọc ({unreadCount})
          </Button>
        </div>
      )}

      <div className="space-y-2.5">
        {notifications.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ item }: { item: NotificationItemData }) {
  const [isPending, startTransition] = useTransition();
  const isUnread = !item.readAt;

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await markAsReadAction(item.id);
    });
  };

  const Content = (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isUnread && (
            <span className="size-2 rounded-full bg-primary shrink-0" />
          )}
          <h3
            className={`text-sm ${
              isUnread
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80"
            }`}
          >
            {item.title}
          </h3>
        </div>

        {item.body && (
          <p className="text-sm text-muted-foreground leading-relaxed pl-4">
            {item.body}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 pl-4 text-xs text-muted-foreground">
          <span>
            {new Date(item.createdAt).toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
          {item.link && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-primary hover:underline">
                Xem chi tiết
                <ExternalLink className="size-3" />
              </span>
            </>
          )}
        </div>
      </div>

      {isUnread && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkRead}
          disabled={isPending}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          title="Đánh dấu đã đọc"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          <span className="hidden sm:inline">Đã đọc</span>
        </Button>
      )}
    </div>
  );

  return (
    <Card
      className={`transition-colors ${
        isUnread
          ? "border-primary/40 bg-primary/[0.03]"
          : "bg-card text-muted-foreground"
      }`}
    >
      <CardContent className="p-4 sm:p-5">
        {item.link ? (
          <Link
            href={item.link}
            onClick={() => {
              if (isUnread) {
                markAsReadAction(item.id);
              }
            }}
            className="block hover:opacity-90"
          >
            {Content}
          </Link>
        ) : (
          Content
        )}
      </CardContent>
    </Card>
  );
}
