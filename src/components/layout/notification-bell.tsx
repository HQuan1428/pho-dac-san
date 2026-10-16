"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Package,
  Store,
  Ticket,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  markAllAsReadAction,
  markAsReadAction,
} from "@/app/(site)/notifications/actions";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
};

export function formatRelativeTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  return `${Math.floor(diffInMonths / 12)} năm trước`;
}

function getNotificationTypeIcon(item: NotificationItem) {
  const lowerTitle = item.title.toLowerCase();
  const link = item.link || "";

  if (link.includes("/orders") || lowerTitle.includes("đơn hàng")) {
    return {
      icon: Package,
      className: "bg-primary/10 text-primary",
    };
  }
  if (link.includes("/seller") || lowerTitle.includes("gian hàng")) {
    return {
      icon: Store,
      className: "bg-turmeric/15 text-turmeric",
    };
  }
  if (lowerTitle.includes("voucher") || lowerTitle.includes("ưu đãi") || lowerTitle.includes("giảm giá")) {
    return {
      icon: Ticket,
      className: "bg-lotus/10 text-lotus",
    };
  }
  return {
    icon: Bell,
    className: "bg-sky/10 text-sky",
  };
}

export function NotificationBell({
  initialNotifications = [],
  initialUnreadCount = 0,
}: {
  initialNotifications?: NotificationItem[];
  initialUnreadCount?: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      try {
        await markAsReadAction(id);
      } catch (err) {
        console.error("Mark as read error:", err);
      }
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date() }))
    );
    setUnreadCount(0);

    startTransition(async () => {
      try {
        await markAllAsReadAction();
      } catch (err) {
        console.error("Mark all as read error:", err);
      }
    });
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.readAt) {
      handleMarkAsRead(item.id);
    }
    setPopoverOpen(false);
    setSheetOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const closeOverlays = () => {
    setPopoverOpen(false);
    setSheetOpen(false);
  };

  const renderContent = () => (
    <div className="flex flex-col h-full max-h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">Thông báo</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {unreadCount} mới
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCheck className="size-3.5" aria-hidden="true" />
            )}
            <span>Đọc tất cả</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Bell className="size-8 stroke-[1.5] text-muted-foreground/50 mb-2" aria-hidden="true" />
            <p className="text-sm">Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.readAt;
            const { icon: TypeIcon, className: iconTone } = getNotificationTypeIcon(item);

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                  isUnread
                    ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                    : "hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconTone}`}
                >
                  <TypeIcon className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs leading-snug line-clamp-2 ${
                        isUnread ? "font-semibold text-foreground" : "text-foreground/80 font-normal"
                      }`}
                    >
                      {item.title}
                    </p>
                    {isUnread && (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                        aria-label="Chưa đọc"
                      />
                    )}
                  </div>

                  {item.body && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {item.link && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                        Chi tiết
                        <ExternalLink className="size-2.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item.id);
                    }}
                    title="Đánh dấu đã đọc"
                    aria-label="Đánh dấu đã đọc"
                    className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  >
                    <Check className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link */}
      <div className="border-t border-border/80 bg-muted/30 p-2 text-center">
        <Link
          href="/notifications"
          onClick={closeOverlays}
          className="text-xs font-medium text-primary hover:underline"
        >
          Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Popover */}
      <div className="hidden md:block">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : "Thông báo"
                }
                className="relative"
              />
            }
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-xl overflow-hidden">
            <PopoverHeader className="sr-only">
              <PopoverTitle>Thông báo</PopoverTitle>
            </PopoverHeader>
            {renderContent()}
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : "Thông báo"
                }
                className="relative"
              />
            }
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0 max-h-[85vh] rounded-t-2xl overflow-hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Thông báo</SheetTitle>
            </SheetHeader>
            {renderContent()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
