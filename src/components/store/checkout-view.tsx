"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, ShieldCheck, ShoppingBag, ArrowLeft, Loader2, Store, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, cart } from "@/lib/cart";
import { getCartLines, type CartLineData, type ValidatedVoucher } from "@/server/store/cart";
import { placeOrder } from "@/server/store/checkout";
import { formatVnd } from "@/components/common/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type ProvinceOption = {
  id: string;
  name: string;
  slug: string;
  region: {
    name: string;
  };
};

export type SavedAddressOption = {
  id: string;
  name: string;
  phone: string;
  provinceId: string;
  detail: string;
  isDefault: boolean;
  province: {
    name: string;
  };
};

export function CheckoutView({
  provinces,
  savedAddresses = [],
  userEmail = "",
  userName = "",
  userPhone = "",
}: {
  provinces: ProvinceOption[];
  savedAddresses?: SavedAddressOption[];
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}) {
  const router = useRouter();
  const cartItems = useCart();
  const [lines, setLines] = useState<CartLineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Record<string, ValidatedVoucher>>({});
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Address selection state
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr ? defaultAddr.id : "new"
  );

  // Form fields
  const [name, setName] = useState(defaultAddr?.name || userName || "");
  const [phone, setPhone] = useState(defaultAddr?.phone || userPhone || "");
  const [email, setEmail] = useState(userEmail || "");
  const [provinceId, setProvinceId] = useState(defaultAddr?.provinceId || "");
  const [addressDetail, setAddressDetail] = useState(defaultAddr?.detail || "");
  const [note, setNote] = useState("");

  // Load vouchers from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pds_vouchers");
      if (saved) {
        setVouchers(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Fetch cart line data
  useEffect(() => {
    let active = true;

    async function load() {
      if (cartItems.length === 0) {
        setLines([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const variantIds = cartItems.map((i) => i.variantId);
        const res = await getCartLines(variantIds);

        if (!active) return;
        if (res.droppedVariantIds.length > 0) {
          res.droppedVariantIds.forEach((id) => cart.remove(id));
        }
        setLines(res.lines);
      } catch (err) {
        console.error("Failed to load checkout lines:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [cartItems]);

  // Handle saved address switch
  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setName(userName || "");
      setPhone(userPhone || "");
      setProvinceId("");
      setAddressDetail("");
    } else {
      const addr = savedAddresses.find((a) => a.id === addrId);
      if (addr) {
        setName(addr.name);
        setPhone(addr.phone);
        setProvinceId(addr.provinceId);
        setAddressDetail(addr.detail);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Đang chuẩn bị đơn hàng…</span>
      </div>
    );
  }

  if (cartItems.length === 0 || lines.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Không có sản phẩm nào để đặt hàng</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành đặt hàng.
        </p>
        <Button className="mt-6 gap-2" render={<Link href="/cho" />}>
          <span>Khám phá chợ đặc sản</span>
        </Button>
      </div>
    );
  }

  // Group by shop
  type ShopOrderSummary = {
    shopId: string;
    shopName: string;
    shopSlug: string;
    provinceName: string;
    items: Array<{
      line: CartLineData;
      quantity: number;
      subtotal: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
  };

  const shopSummaries: ShopOrderSummary[] = [];
  const itemMap = new Map(cartItems.map((i) => [i.variantId, i.quantity]));

  for (const line of lines) {
    const qty = itemMap.get(line.variantId) || 1;
    let group = shopSummaries.find((g) => g.shopId === line.shopId);
    if (!group) {
      group = {
        shopId: line.shopId,
        shopName: line.shopName,
        shopSlug: line.shopSlug,
        provinceName: line.provinceName,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      };
      shopSummaries.push(group);
    }
    const itemSubtotal = line.price * qty;
    group.items.push({ line, quantity: qty, subtotal: itemSubtotal });
    group.subtotal += itemSubtotal;
  }

  // Calculate discounts & totals
  for (const group of shopSummaries) {
    const voucher = vouchers[group.shopId];
    group.discount = voucher ? voucher.discount : 0;
    group.total = Math.max(0, group.subtotal - group.discount);
  }

  const grandSubtotal = shopSummaries.reduce((sum, g) => sum + g.subtotal, 0);
  const grandDiscount = shopSummaries.reduce((sum, g) => sum + g.discount, 0);
  const grandTotal = Math.max(0, grandSubtotal - grandDiscount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend checks
    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại");
      return;
    }
    if (!provinceId) {
      setErrorMessage("Vui lòng chọn Tỉnh/Thành phố");
      return;
    }
    if (!addressDetail.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    startTransition(async () => {
      // Build vouchers map
      const vouchersPayload: Record<string, string> = {};
      for (const [sId, v] of Object.entries(vouchers)) {
        if (v?.code) vouchersPayload[sId] = v.code;
      }

      const res = await placeOrder({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        provinceId,
        addressDetail: addressDetail.trim(),
        note: note.trim() || undefined,
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: itemMap.get(l.variantId) || 1,
        })),
        vouchers: vouchersPayload,
      });

      if (res.error) {
        setErrorMessage(res.error);
        toast.error(res.error);
      } else if (res.success && res.checkoutId) {
        // Clear cart and stored vouchers
        cart.clear();
        try {
          sessionStorage.removeItem("pds_vouchers");
        } catch {}

        toast.success("Đặt hàng thành công!");
        router.push(`/dat-hang/thanh-cong?checkout=${res.checkoutId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Lỗi đặt hàng</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Prominent Payment Notice */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Phone className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-primary">
            Shop sẽ gọi điện xác nhận đơn, thanh toán khi nhận hàng.
          </p>
          <p className="text-muted-foreground mt-0.5">
            Không cần chuyển khoản trước. Bạn được kiểm tra hàng và thanh toán tiền mặt trực tiếp cho người giao hàng.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        {/* Left Column: Customer Information & Delivery Address */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-lg font-semibold text-foreground border-b pb-3">
              Thông tin nhận hàng
            </h3>

            {/* Saved addresses selector (for signed-in users) */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 rounded-lg bg-muted/40 p-3.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sổ địa chỉ của bạn
                </Label>
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={handleAddressSelect}
                  className="space-y-2"
                >
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-2.5 rounded-md border bg-card p-3 cursor-pointer text-sm hover:border-primary/50 transition"
                    >
                      <RadioGroupItem value={addr.id} id={addr.id} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          <span>{addr.name}</span>
                          <span className="text-muted-foreground font-normal">· {addr.phone}</span>
                          {addr.isDefault && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {addr.detail}, {addr.province.name}
                        </p>
                      </div>
                    </label>
                  ))}

                  <label className="flex items-center gap-2.5 rounded-md border border-dashed bg-card/50 p-2.5 cursor-pointer text-sm hover:border-primary/50 transition">
                    <RadioGroupItem value="new" id="new" />
                    <span className="text-xs font-medium">Nhập thông tin nhận hàng khác</span>
                  </label>
                </RadioGroup>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Họ và tên người nhận <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="province">
                  Tỉnh / Thành phố <span className="text-destructive">*</span>
                </Label>
                <Select value={provinceId} onValueChange={(val) => setProvinceId(val ?? "")}>
                  <SelectTrigger id="province" className="w-full">
                    <SelectValue placeholder="Chọn Tỉnh / Thành" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.region.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email nhận thông báo <span className="text-xs text-muted-foreground">(tùy chọn)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="de-nhan-thong-bao@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">
                Địa chỉ chi tiết <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Số nhà, ngõ, đường, phường/xã, quận/huyện…"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">
                Ghi chú cho gian hàng <span className="text-xs text-muted-foreground">(tùy chọn)</span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao…"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary per Shop */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-xs space-y-5 sticky top-20">
            <h3 className="text-lg font-semibold text-foreground border-b pb-3">
              Chi tiết đơn hàng ({shopSummaries.length} gian hàng)
            </h3>

            {/* Shop breakdown */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {shopSummaries.map((shop) => (
                <div key={shop.shopId} className="rounded-md border p-3 bg-muted/20 space-y-2.5">
                  <div className="flex items-center justify-between font-medium text-xs border-b pb-2">
                    <div className="flex items-center gap-1.5">
                      <Store className="size-3.5 text-primary" />
                      <span>{shop.shopName}</span>
                    </div>
                    <span className="text-muted-foreground">{shop.provinceName}</span>
                  </div>

                  <div className="space-y-2">
                    {shop.items.map(({ line, quantity, subtotal }) => (
                      <div key={line.variantId} className="flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground line-clamp-1">{line.productName}</p>
                          <span className="text-muted-foreground">
                            {line.variantName} × {quantity}
                          </span>
                        </div>
                        <span className="font-medium tabular-nums">{formatVnd(subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {shop.discount > 0 && (
                    <div className="flex items-center justify-between text-xs text-primary font-medium border-t pt-1.5">
                      <span>Giảm giá (voucher):</span>
                      <span>-{formatVnd(shop.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-semibold border-t pt-1.5">
                    <span>Tổng shop:</span>
                    <span className="text-primary">{formatVnd(shop.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính ({cartItems.reduce((n, i) => n + i.quantity, 0)} món):</span>
                <span className="font-medium text-foreground">{formatVnd(grandSubtotal)}</span>
              </div>

              {grandDiscount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Tổng giảm giá:</span>
                  <span>-{formatVnd(grandDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Phí vận chuyển:</span>
                <span className="italic">Shop sẽ báo khi xác nhận</span>
              </div>

              <div className="border-t pt-3 flex items-baseline justify-between">
                <span className="font-semibold text-foreground text-base">Tổng thanh toán:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {formatVnd(grandTotal)}
                  </div>
                  <span className="text-xs text-muted-foreground">Thanh toán khi nhận hàng</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full gap-2 text-base font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xử lý đặt hàng…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-5" />
                  <span>Xác nhận đặt hàng</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/gio-hang"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="size-3.5" />
                <span>Quay lại giỏ hàng</span>
              </Link>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>An tâm mua sắm</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
