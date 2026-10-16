import { PageHeader } from "@/components/common/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSellerVouchers } from "@/server/seller/vouchers";
import { VoucherDialog } from "@/components/seller/voucher-dialog";
import { VoucherTableRow } from "@/components/seller/voucher-table-row";

export const metadata = {
  title: "Mã giảm giá",
};

export default async function VouchersPage() {
  const vouchers = await getSellerVouchers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khuyến mãi & Mã giảm giá"
        description="Tạo ưu đãi giảm giá theo phần trăm hoặc số tiền cố định cho khách mua đặc sản tại gian hàng"
      />

      {/* Toolbar above: summary info left, primary action right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Hiện có: <strong className="text-foreground">{vouchers.length}</strong> mã ưu đãi
        </div>

        <div>
          <VoucherDialog />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
              <TableRow className="h-11">
                <TableHead className="min-w-[120px]">Mã voucher</TableHead>
                <TableHead className="min-w-[140px]">Mức giảm</TableHead>
                <TableHead className="min-w-[110px]">Đơn tối thiểu</TableHead>
                <TableHead className="min-w-[160px]">Thời hạn áp dụng</TableHead>
                <TableHead className="text-center min-w-[100px]">Đã dùng</TableHead>
                <TableHead className="text-center w-24">Trạng thái</TableHead>
                <TableHead className="text-center w-20">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    Gian hàng chưa có mã giảm giá nào. Hãy bấm &quot;Tạo mã giảm giá&quot; để bắt đầu.
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((v) => <VoucherTableRow key={v.id} voucher={v} />)
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
