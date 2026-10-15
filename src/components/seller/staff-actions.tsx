"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeStaffAction, revokeInviteAction } from "@/server/seller/staff";

export function RemoveStaffButton({
  memberId,
  name,
}: {
  memberId: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" khỏi gian hàng?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await removeStaffAction(memberId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã xóa nhân viên "${name}"`);
        router.refresh();
      }
    } catch {
      toast.error("Không thể xóa nhân viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      disabled={loading}
      onClick={handleRemove}
      className="text-muted-foreground hover:text-destructive"
      aria-label="Xóa nhân viên"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <UserX className="size-3.5" />
      )}
    </Button>
  );
}

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi lời mời này?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await revokeInviteAction(inviteId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã thu hồi lời mời");
        router.refresh();
      }
    } catch {
      toast.error("Không thể thu hồi lời mời");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      disabled={loading}
      onClick={handleRevoke}
      className="text-muted-foreground hover:text-destructive text-xs gap-1"
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3" />
      )}
      Thu hồi
    </Button>
  );
}
