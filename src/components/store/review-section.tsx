import { RatingStars } from "@/components/common/rating-stars";
import { ReviewForm } from "./review-form";
import { Star } from "lucide-react";

export type ReviewItemData = {
  id: string;
  rating: number;
  content: string | null;
  createdAt: Date;
  user: {
    name: string;
  };
};

export function ReviewSection({
  productId,
  reviews,
  ratingAvg,
  ratingCount,
  eligibleOrderItemId,
  path,
}: {
  productId: string;
  reviews: ReviewItemData[];
  ratingAvg: number;
  ratingCount: number;
  eligibleOrderItemId?: string | null;
  path: string;
}) {
  // Compute star rating breakdown
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  }

  const totalReviewsCount = reviews.length > 0 ? reviews.length : ratingCount;

  return (
    <div id="danh-gia" className="space-y-6">
      {eligibleOrderItemId && (
        <ReviewForm
          productId={productId}
          orderItemId={eligibleOrderItemId}
          path={path}
        />
      )}

      {/* Two-column layout: Rating summary bar chart left, list right */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr] items-start">
        {/* Left: Rating Summary & Bar Chart */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <div className="text-4xl font-bold tracking-tight text-foreground">
              {ratingAvg > 0 ? ratingAvg.toFixed(1) : "0"}
            </div>
            <div className="flex justify-center">
              <RatingStars value={ratingAvg} />
            </div>
            <p className="text-xs text-muted-foreground">
              Dựa trên {totalReviewsCount} lượt đánh giá
            </p>
          </div>

          {/* 5-star to 1-star Breakdown Bars */}
          <div className="space-y-2 border-t pt-3 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-11 shrink-0 text-muted-foreground font-medium">
                    <span>{star}</span>
                    <Star className="size-3 fill-warning text-warning" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums text-muted-foreground text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Review List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
              Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên thưởng thức và chia sẻ cảm nhận!
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card shadow-xs">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 space-y-2 first:rounded-t-xl last:rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                        {r.user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-medium">{r.user.name}</span>
                        <div className="flex items-center gap-1.5">
                          <RatingStars value={r.rating} compact />
                        </div>
                      </div>
                    </div>
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </time>
                  </div>
                  {r.content && (
                    <p className="text-xs sm:text-sm text-foreground/90 pl-10 whitespace-pre-line leading-relaxed">
                      {r.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
