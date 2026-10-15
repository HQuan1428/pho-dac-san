"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCallNoteAction } from "@/server/seller/orders";

interface CallNoteFormProps {
  code: string;
}

export function CallNoteForm({ code }: CallNoteFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    setLoading(true);
    try {
      const res = await addCallNoteAction({ code, note: note.trim() });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã thêm ghi chú cuộc gọi");
        setNote("");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thêm ghi chú thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2 border-b pb-3">
        <PhoneCall className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Ghi chú cuộc gọi</h3>
      </div>

      <Textarea
        rows={3}
        placeholder="Ghi nhận kết quả cuộc gọi (VD: Đã gọi xác nhận địa chỉ, khách hẹn nhận vào chiều thứ 7...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading || !note.trim()}>
          {loading && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
          Lưu ghi chú
        </Button>
      </div>
    </form>
  );
}
