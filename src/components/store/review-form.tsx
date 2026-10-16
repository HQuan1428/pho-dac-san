"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/server/store/reviews";
import { cn } from "@/lib/utils";

export function ReviewForm({
  productId,
  orderItemId,
  path,
}: {
  productId: string;
  orderItemId: string;
  path: string;
}) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("orderItemId", orderItemId);
      formData.set("rating", String(rating));
      formData.set("content", content);
      formData.set("path", path);

      const res = await submitReview(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
        setSubmitted(true);
        setContent("");
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-primary">
        Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-1">
        <h4 className="font-semibold text-foreground">Viết đánh giá cho sản phẩm đã mua</h4>
        <p className="text-xs text-muted-foreground">
          Chia sẻ trải nghiệm của bạn về chất lượng và hương vị đặc sản này nhé!
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Chất lượng:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-0.5 text-muted-foreground transition hover:scale-110"
              >
                <Star
                  className={cn(
                    "size-5 transition",
                    active ? "fill-warning text-warning" : "text-muted-foreground/30"
                  )}
                />
              </button>
            );
          })}
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            {rating === 5
              ? "Tuyệt vời"
              : rating === 4
              ? "Hài lòng"
              : rating === 3
              ? "Bình thường"
              : rating === 2
              ? "Không hài lòng"
              : "Rất tệ"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hãy chia sẻ cảm nhận chi tiết của bạn về sản phẩm..."
          rows={3}
          maxLength={1000}
          className="text-sm"
        />
        <div className="text-right text-xs text-muted-foreground">
          {content.length}/1000
        </div>
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}
