"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { inviteStaffAction } from "@/server/seller/staff";

export function InviteStaffDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email nhân viên");
      return;
    }

    setLoading(true);
    try {
      const res = await inviteStaffAction(email.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã gửi thư mời tới ${email.trim()}`);
        setEmail("");
        setOpen(false);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gửi lời mời thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <UserPlus className="size-4" />
            Mời nhân viên
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mời nhân viên quản lý gian hàng</DialogTitle>
            <DialogDescription>
              Nhân viên được mời sẽ có quyền xem, xử lý đơn hàng và chỉnh sửa sản phẩm. Họ không thể
              sửa thông tin gian hàng, khuyến mãi hay quản lý nhân sự.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FormField
              id="staff-email"
              label="Địa chỉ email nhân viên"
              required
              hint="Hệ thống sẽ gửi email chứa liên kết tham gia có hiệu lực trong 7 ngày"
            >
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="staff-email"
                  type="email"
                  required
                  placeholder="nhanvien@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Gửi lời mời
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
