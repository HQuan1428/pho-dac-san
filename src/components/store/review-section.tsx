import { RatingStars } from "@/components/common/rating-stars";
import { ReviewForm } from "./review-form";

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
  return (
    <section id="danh-gia" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Đánh giá sản phẩm</h3>
          <p className="text-sm text-muted-foreground">
            Phản hồi thực tế từ những khách hàng đã mua và trải nghiệm sản phẩm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-foreground">
            {ratingAvg > 0 ? ratingAvg.toFixed(1) : "0"}
          </div>
          <div className="space-y-0.5">
            <RatingStars value={ratingAvg} />
            <div className="text-xs text-muted-foreground">{ratingCount} lượt đánh giá</div>
          </div>
        </div>
      </div>

      {eligibleOrderItemId && (
        <ReviewForm
          productId={productId}
          orderItemId={eligibleOrderItemId}
          path={path}
        />
      )}

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên thưởng thức và chia sẻ cảm nhận!
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                    {r.user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{r.user.name}</span>
                    <div className="flex items-center gap-2">
                      <RatingStars value={r.rating} compact />
                    </div>
                  </div>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                </time>
              </div>
              {r.content && (
                <p className="text-sm text-foreground/90 pl-10 whitespace-pre-line leading-relaxed">
                  {r.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
