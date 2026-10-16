import { PageHeader } from "@/components/common/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSellerStaffData } from "@/server/seller/staff";
import { InviteStaffDialog } from "@/components/seller/invite-staff-dialog";
import {
  RemoveStaffButton,
  RevokeInviteButton,
} from "@/components/seller/staff-actions";

export const metadata = {
  title: "Quản lý nhân viên",
};

export default async function StaffManagementPage() {
  const { members, pendingInvites } = await getSellerStaffData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đội ngũ nhân viên gian hàng"
        description="Quản lý các thành viên có quyền truy cập xử lý đơn hàng và cập nhật sản phẩm"
      />

      {/* Toolbar above: summary info left, primary action right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Đang có: <strong className="text-foreground">{members.length}</strong> nhân viên ·{" "}
          <strong className="text-foreground">{pendingInvites.length}</strong> lời mời đang chờ
        </div>

        <div>
          <InviteStaffDialog />
        </div>
      </div>

      {/* Active Staff Members */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Nhân viên đang hoạt động ({members.length})
        </h2>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
                <TableRow className="h-11">
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="w-16 text-center">Xóa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                      Gian hàng chưa có nhân viên nào. Bấm &quot;Mời nhân viên&quot; để thêm người hỗ trợ.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((m) => (
                    <TableRow key={m.id} className="h-11">
                      <TableCell className="font-medium text-foreground text-xs">
                        {m.user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {m.user.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {m.user.phone || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Nhân viên
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <RemoveStaffButton memberId={m.id} name={m.user.name} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Lời mời đang chờ chấp nhận ({pendingInvites.length})
          </h2>

          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
                  <TableRow className="h-11">
                    <TableHead>Email nhận lời mời</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Thời hạn hiệu lực</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-24 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((inv) => (
                    <TableRow key={inv.id} className="h-11">
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {inv.email}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        còn đến {new Date(inv.expiresAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning-foreground dark:text-warning">
                          Chờ phản hồi
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <RevokeInviteButton inviteId={inv.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
