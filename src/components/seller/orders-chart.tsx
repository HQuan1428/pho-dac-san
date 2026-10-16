import { formatVnd } from "@/components/common/price";

interface OrdersChartProps {
  data: {
    dateKey: string;
    label: string;
    count: number;
    revenue: number;
  }[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 5);
  const totalOrders = data.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Lượng đơn hàng 30 ngày qua</h2>
          <p className="text-xs text-muted-foreground">Thống kê số lượng đơn đặt theo từng ngày</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Tổng đơn: </span>
            <span className="font-semibold text-foreground">{totalOrders}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Doanh thu hoàn tất: </span>
            <span className="font-semibold text-primary">{formatVnd(totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* Graph wrapper */}
        <div className="relative h-44 w-full">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-muted-foreground/60">
            <div className="border-b border-dashed border-border/60 pb-1">
              <span>{maxCount} đơn</span>
            </div>
            <div className="border-b border-dashed border-border/60 pb-1">
              <span>{Math.round(maxCount / 2)} đơn</span>
            </div>
            <div className="border-b border-border text-transparent select-none">
              <span>0</span>
            </div>
          </div>

          {/* Bar columns */}
          <div className="relative z-10 flex h-full items-end gap-1 sm:gap-1.5 xl:gap-2 pt-5">
            {data.map((item) => {
              const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const hasOrders = item.count > 0;

              return (
                <div
                  key={item.dateKey}
                  className="group relative flex h-full flex-1 flex-col justify-end items-center"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute bottom-full mb-2 hidden -translate-x-1/2 left-1/2 z-30 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-[11px] shadow-md group-hover:flex flex-col items-center">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-primary font-semibold">{item.count} đơn hàng</span>
                    {item.revenue > 0 && (
                      <span className="text-muted-foreground text-[10px]">
                        {formatVnd(item.revenue)}
                      </span>
                    )}
                  </div>

                  {/* Bar element */}
                  <div
                    style={{ height: hasOrders ? `${Math.max(heightPercent, 8)}%` : "3px" }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      hasOrders
                        ? "bg-primary group-hover:bg-primary/80"
                        : "bg-muted group-hover:bg-muted-foreground/30"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-[11px] font-mono text-muted-foreground">
          <span>{data[0]?.label}</span>
          <span className="hidden sm:inline">{data[Math.floor(data.length / 3)]?.label}</span>
          <span className="hidden sm:inline">{data[Math.floor((data.length * 2) / 3)]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
}
