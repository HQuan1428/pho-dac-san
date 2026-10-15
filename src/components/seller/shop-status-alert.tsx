import { AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ShopStatusAlertProps {
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  statusReason?: string | null;
}

export function ShopStatusAlert({ status, statusReason }: ShopStatusAlertProps) {
  if (status === "ACTIVE") return null;

  if (status === "PENDING") {
    return (
      <Alert className="border-warning/50 bg-warning/10 text-foreground">
        <Clock className="size-4 text-warning-foreground dark:text-warning" />
        <AlertTitle className="font-semibold text-warning-foreground dark:text-warning">
          Gian hàng đang chờ duyệt
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          {statusReason ||
            "Hồ sơ gian hàng đang được ban quản trị xem xét (thường trong 24 giờ). Bạn vẫn có thể chuẩn bị sản phẩm và thiết lập gian hàng, nhưng gian hàng chưa hiển thị công khai trên sàn."}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle className="font-semibold">Gian hàng bị từ chối duyệt</AlertTitle>
        <AlertDescription className="text-sm">
          {statusReason
            ? `Lý do: ${statusReason}. Vui lòng cập nhật lại thông tin hoặc liên hệ ban quản trị để được hỗ trợ.`
            : "Hồ sơ gian hàng chưa đạt tiêu chuẩn. Vui lòng liên hệ ban quản trị để biết thêm chi tiết."}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle className="font-semibold">Gian hàng đang bị tạm dừng hoạt động</AlertTitle>
        <AlertDescription className="text-sm">
          {statusReason
            ? `Lý do: ${statusReason}. Các sản phẩm của gian hàng tạm thời ẩn khỏi sàn.`
            : "Gian hàng đang bị tạm dừng hoạt động do vi phạm chính sách hoặc yêu cầu bảo trì."}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
