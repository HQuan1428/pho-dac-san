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
    <div className="space-y-8">
      <PageHeader
        title="Đội ngũ nhân viên gian hàng"
        description="Quản lý các thành viên có quyền truy cập xử lý đơn hàng và cập nhật sản phẩm"
        actions={<InviteStaffDialog />}
      />

      {/* Active Staff Members */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Nhân viên đang hoạt động ({members.length})
        </h2>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-foreground">
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

      {/* Pending Invitations */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Lời mời đang chờ chấp nhận ({pendingInvites.length})
        </h2>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email nhận lời mời</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Thời hạn hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-24 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    Không có lời mời nào đang chờ.
                  </TableCell>
                </TableRow>
              ) : (
                pendingInvites.map((inv) => (
                  <TableRow key={inv.id}>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
