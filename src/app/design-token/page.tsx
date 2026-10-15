"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Info, Moon, PackageOpen, ShoppingBag, Store, Sun, TrendingUp, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/common/empty-state";
import { FormField } from "@/components/common/form-field";
import { OrderStatusBadge, type OrderStatus } from "@/components/common/order-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";
import { ProductCard } from "@/components/common/product-card";
import { QuantityInput } from "@/components/common/quantity-input";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";
import { ShopCard } from "@/components/common/shop-card";
import { StatCard } from "@/components/common/stat-card";

const semantic = [
  ["background", "foreground", "Nền trang"],
  ["card", "card-foreground", "Card, popover"],
  ["primary", "primary-foreground", "CTA chính, link, focus"],
  ["secondary", "secondary-foreground", "Button phụ"],
  ["muted", "muted-foreground", "Nền phụ, text phụ"],
  ["border", "foreground", "Viền, input"],
];

const status = [
  ["success", "Thành công"],
  ["warning", "Cảnh báo"],
  ["info", "Thông tin"],
  ["destructive", "Lỗi, xóa"],
];

const neutral = [
  ["50", "bg-zinc-50"], ["100", "bg-zinc-100"], ["200", "bg-zinc-200"], ["300", "bg-zinc-300"],
  ["400", "bg-zinc-400"], ["500", "bg-zinc-500"], ["600", "bg-zinc-600"], ["700", "bg-zinc-700"],
  ["800", "bg-zinc-800"], ["900", "bg-zinc-900"], ["950", "bg-zinc-950"],
];

const brand = [
  ["50", "bg-emerald-50"], ["100", "bg-emerald-100"], ["200", "bg-emerald-200"], ["300", "bg-emerald-300"],
  ["400", "bg-emerald-400"], ["500", "bg-emerald-500"], ["600", "bg-emerald-600"], ["700", "bg-emerald-700"],
  ["800", "bg-emerald-800"], ["900", "bg-emerald-900"], ["950", "bg-emerald-950"],
];

const typeScale = [
  ["text-5xl", "48/48", "semibold", "Hero landing", "text-5xl font-semibold"],
  ["text-4xl", "36/40", "semibold", "H1 trang", "text-4xl font-semibold"],
  ["text-3xl", "30/36", "semibold", "Tiêu đề section", "text-3xl font-semibold"],
  ["text-2xl", "24/32", "semibold", "H2", "text-2xl font-semibold"],
  ["text-xl", "20/28", "semibold", "H3, tiêu đề card", "text-xl font-semibold"],
  ["text-lg", "18/28", "medium", "Lead paragraph", "text-lg font-medium"],
  ["text-base", "16/24", "regular", "Body", "text-base"],
  ["text-sm", "14/20", "regular", "UI mặc định: form, bảng, button", "text-sm"],
  ["text-xs", "12/16", "medium", "Caption, badge, meta", "text-xs font-medium"],
];

const placeholder = (hue: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="hsl(${hue} 8% 92%)"/><text x="200" y="208" font-family="sans-serif" font-size="20" text-anchor="middle" fill="hsl(${hue} 6% 55%)">${label}</text></svg>`,
  )}`;

const products = [
  { name: "Mắm tôm Thanh Hóa hũ thủy tinh", price: 85000, originalPrice: 100000, province: "Thanh Hóa", shopName: "Nhà Mắm Sầm Sơn", rating: 4.8, reviewCount: 132, hue: 20 },
  { name: "Chè Thái Nguyên tân cương đặc biệt 500g", price: 320000, province: "Thái Nguyên", shopName: "Trà Tân Cương Xanh", rating: 4.6, reviewCount: 89, hue: 110 },
  { name: "Kẹo dừa Bến Tre nguyên chất", price: 45000, province: "Bến Tre", shopName: "Dừa Xứ Bến", rating: 4.9, reviewCount: 402, hue: 40 },
  { name: "Cà phê Robusta Buôn Ma Thuột rang mộc 1kg", price: 260000, originalPrice: 290000, province: "Đắk Lắk", shopName: "Cà Phê Cao Nguyên", rating: 4.3, reviewCount: 57, hue: 25 },
].map((p) => ({ ...p, href: "#", image: placeholder(p.hue, p.province) }));

const statuses: OrderStatus[] = ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4 py-10">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const nav = [
  ["brand", "Nguyên tắc"],
  ["colors", "Màu"],
  ["typography", "Chữ"],
  ["shape", "Nền tảng"],
  ["buttons", "Button"],
  ["forms", "Form"],
  ["feedback", "Phản hồi"],
  ["overlays", "Overlay"],
  ["data", "Dữ liệu"],
  ["domain", "Component nghiệp vụ"],
];

export default function DesignTokenPage() {
  const [dark, setDark] = useState(false);
  const [qty, setQty] = useState(2);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><Store className="size-3.5" /></span>
            Phố Đặc Sản
          </span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">tokens v0.2</span>
          <nav className="ml-auto hidden gap-3 text-sm lg:flex">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-muted-foreground hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <Button variant="outline" size="icon" onClick={toggleDark} aria-label="Đổi giao diện sáng/tối">
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl divide-y px-4">
        <Section id="brand" title="Nguyên tắc" description="Neutral-first như Linear, Vercel, Stripe: nội dung (ảnh sản phẩm) là màu sắc chính, UI lùi lại phía sau.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-lg border p-8">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Store className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Phố Đặc Sản</span>
            </div>
            <div className="dark flex items-center justify-center gap-2 rounded-lg border bg-background p-8 text-foreground">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Store className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Phố Đặc Sản</span>
            </div>
            <ul className="space-y-2 rounded-lg border p-5 text-sm text-muted-foreground">
              <li><span className="font-medium text-foreground">90% neutral.</span> Xám zinc cho nền, chữ, viền.</li>
              <li><span className="font-medium text-foreground">1 màu brand.</span> Xanh emerald chỉ cho CTA, link, focus.</li>
              <li><span className="font-medium text-foreground">Viền thay bóng.</span> Shadow chỉ cho lớp nổi.</li>
              <li><span className="font-medium text-foreground">1 font.</span> Inter, phân cấp bằng size và weight.</li>
              <li><span className="font-medium text-foreground">WCAG AA.</span> Text ≥ 4.5:1, UI ≥ 3:1.</li>
            </ul>
          </div>
        </Section>

        <Section id="colors" title="Màu" description="Component chỉ dùng token semantic (bg-primary, text-muted-foreground…), không dùng thang màu trực tiếp.">
          <div className="space-y-3">
            <Row label="neutral / zinc">
              <div className="flex w-full overflow-hidden rounded-lg border">
                {neutral.map(([n, c]) => (
                  <div key={n} className="flex-1">
                    <div className={`h-12 ${c}`} />
                    <div className="py-1 text-center font-mono text-[10px] text-muted-foreground">{n}</div>
                  </div>
                ))}
              </div>
            </Row>
            <Row label="brand / emerald">
              <div className="flex w-full overflow-hidden rounded-lg border">
                {brand.map(([n, c]) => (
                  <div key={n} className="flex-1">
                    <div className={`h-12 ${c} ${n === "700" ? "ring-2 ring-foreground ring-inset" : ""}`} />
                    <div className="py-1 text-center font-mono text-[10px] text-muted-foreground">{n}</div>
                  </div>
                ))}
              </div>
            </Row>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>Token</TableHead>
                  <TableHead>Dùng cho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semantic.map(([bg, fg, use]) => (
                  <TableRow key={bg}>
                    <TableCell>
                      <span className="flex size-8 items-center justify-center rounded-md border text-xs font-medium" style={{ background: `var(--${bg})`, color: `var(--${fg})` }}>Aa</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">--{bg} / --{fg}</TableCell>
                    <TableCell className="text-muted-foreground">{use}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Row label="status">
            {status.map(([c, label]) => (
              <span key={c} className="inline-flex items-center gap-2 text-sm">
                <span className="size-3 rounded-full" style={{ background: `var(--${c})` }} />
                <span className="font-mono text-xs">--{c}</span>
                <span className="text-muted-foreground">{label}</span>
              </span>
            ))}
          </Row>
          <Row label="chart-1..5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="h-6 w-12 rounded" style={{ background: `var(--chart-${i})` }} />
            ))}
          </Row>
        </Section>

        <Section id="typography" title="Chữ" description="Inter (hỗ trợ đầy đủ dấu tiếng Việt), số tabular cho giá và bảng. Tiêu đề tracking-tight.">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Size/LH</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Mẫu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typeScale.map(([token, size, weight, use, cls]) => (
                  <TableRow key={token}>
                    <TableCell className="font-mono text-xs">{token}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{size}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{weight}</TableCell>
                    <TableCell className="max-w-0 w-full">
                      <p className={`truncate tracking-tight ${cls}`}>{use}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Row label="mono"><code className="font-mono text-sm">ORD-2026-000123</code></Row>
        </Section>

        <Section id="shape" title="Nền tảng" description="Lưới 4px, bo góc 8px, viền 1px. Đổ bóng chỉ dùng cho lớp nổi (dropdown, dialog).">
          <Row label="radius">
            {[["sm", "rounded-sm", "badge"], ["md", "rounded-md", "input, button"], ["lg", "rounded-lg", "card"], ["xl", "rounded-xl", "dialog"], ["full", "rounded-full", "avatar, pill"]].map(([n, r, use]) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div className={`size-16 border bg-muted ${r}`} />
                <span className="font-mono text-xs">{n}</span>
                <span className="text-[10px] text-muted-foreground">{use}</span>
              </div>
            ))}
          </Row>
          <Row label="elevation">
            {[["0", "border", "card, bảng"], ["1", "border shadow-sm", "sticky header"], ["2", "border shadow-lg", "dropdown, popover"], ["3", "shadow-2xl", "dialog, sheet"]].map(([n, cls, use]) => (
              <div key={n} className={`flex h-20 w-32 flex-col justify-end rounded-lg bg-card p-3 ${cls}`}>
                <span className="font-mono text-xs">level {n}</span>
                <span className="text-[10px] text-muted-foreground">{use}</span>
              </div>
            ))}
          </Row>
          <Row label="spacing (4px)">
            {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <span className="rounded-sm bg-foreground/80" style={{ width: n * 4, height: n * 4 }} />
                <span className="font-mono text-[10px] text-muted-foreground">{n * 4}</span>
              </div>
            ))}
          </Row>
          <Row label="motion">
            <span className="text-sm text-muted-foreground"><code className="font-mono text-foreground">150ms</code> hover, màu · <code className="font-mono text-foreground">200ms</code> dropdown, tooltip · <code className="font-mono text-foreground">300ms</code> dialog, sheet · ease-out · tôn trọng prefers-reduced-motion</span>
          </Row>
          <Row label="breakpoint">
            <span className="text-sm text-muted-foreground">sm 640 · md 768 · lg 1024 · xl 1280 · container max-w-6xl (1152px), gutter 16px mobile / 24px desktop</span>
          </Row>
          <Row label="focus">
            <Button variant="outline" className="ring-3 ring-ring/50 border-ring">Focus ring 3px brand/50</Button>
          </Row>
        </Section>

        <Section id="buttons" title="Button">
          <Row label="variant">
            <Button>Đặt hàng</Button>
            <Button variant="secondary">Thêm vào giỏ</Button>
            <Button variant="outline">Theo dõi shop</Button>
            <Button variant="ghost">Bỏ qua</Button>
            <Button variant="destructive">Hủy đơn</Button>
            <Button variant="link">Xem tất cả</Button>
          </Row>
          <Row label="size">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button>default</Button>
            <Button size="lg">lg</Button>
            <Button size="icon" aria-label="Giỏ hàng"><ShoppingBag /></Button>
          </Row>
          <Row label="state">
            <Button disabled>Disabled</Button>
            <Button><ShoppingBag data-icon="inline-start" />Có icon</Button>
          </Row>
        </Section>

        <Section id="forms" title="Form">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField id="name" label="Họ tên" required hint="Chủ shop sẽ gọi theo tên này">
              <Input id="name" placeholder="Nguyễn Văn A" />
            </FormField>
            <FormField id="phone" label="Số điện thoại" required error="Số điện thoại không hợp lệ">
              <Input id="phone" defaultValue="09123" aria-invalid />
            </FormField>
            <FormField id="province" label="Tỉnh/Thành">
              <Select>
                <SelectTrigger id="province" className="w-full"><SelectValue placeholder="Chọn tỉnh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hn">Hà Nội</SelectItem>
                  <SelectItem value="hue">Huế</SelectItem>
                  <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="search" label="Tìm kiếm">
              <Input id="search" type="search" placeholder="Tìm đặc sản, gian hàng…" />
            </FormField>
            <FormField id="note" label="Ghi chú cho shop">
              <Textarea id="note" placeholder="Gọi sau 18h giúp em" />
            </FormField>
            <div className="grid content-start gap-4">
              <Label className="gap-2"><Checkbox defaultChecked />Lưu địa chỉ này</Label>
              <Label className="gap-2"><Switch defaultChecked />Nhận email khi có đơn mới</Label>
              <RadioGroup defaultValue="500g" className="flex gap-4">
                {["500g", "1kg", "2kg"].map((v) => (
                  <Label key={v} className="gap-2"><RadioGroupItem value={v} />{v}</Label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Section>

        <Section id="feedback" title="Phản hồi">
          <Row label="badge">
            <Badge>Mới</Badge>
            <Badge variant="secondary">Hữu cơ</Badge>
            <Badge variant="outline">Pro</Badge>
            <Badge variant="destructive">Hết hàng</Badge>
          </Row>
          <div className="grid gap-3 md:grid-cols-2">
            <Alert>
              <Info />
              <AlertTitle>Shop đang chờ duyệt</AlertTitle>
              <AlertDescription>Admin sẽ duyệt trong 24 giờ làm việc.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Info />
              <AlertTitle>Không gửi được đơn</AlertTitle>
              <AlertDescription>Bạn đã đặt quá nhiều đơn trong 1 giờ.</AlertDescription>
            </Alert>
          </div>
          <Row label="toast">
            <Button variant="outline" onClick={() => toast.success("Đã thêm vào giỏ hàng")}>Toast thành công</Button>
            <Button variant="outline" onClick={() => toast.error("Có lỗi, vui lòng thử lại")}>Toast lỗi</Button>
          </Row>
          <Row label="skeleton">
            <div className="flex w-full max-w-sm items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Row>
        </Section>

        <Section id="overlays" title="Overlay">
          <Row label="dialog / sheet / menu">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Mở dialog</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hủy đơn hàng?</DialogTitle>
                  <DialogDescription>Khách sẽ nhận được email thông báo hủy.</DialogDescription>
                </DialogHeader>
                <Textarea placeholder="Lý do hủy" />
                <DialogFooter>
                  <Button variant="destructive">Xác nhận hủy</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Mở giỏ hàng (sheet)</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Giỏ hàng</SheetTitle>
                  <SheetDescription>Đơn sẽ được tách theo từng gian hàng.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>Tài khoản</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Đơn hàng của tôi</DropdownMenuItem>
                <DropdownMenuItem>Gian hàng của tôi</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Thông tin" />}>
                <Info />
              </TooltipTrigger>
              <TooltipContent>Tooltip</TooltipContent>
            </Tooltip>
          </Row>
        </Section>

        <Section id="data" title="Dữ liệu">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Trang chủ</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Miền Bắc</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Chè Thái Nguyên</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="new">Mới</TabsTrigger>
              <TabsTrigger value="done">Hoàn thành</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="mt-3 rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Khách</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tổng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statuses.map((s, i) => (
                      <TableRow key={s}>
                        <TableCell className="font-mono">ORD-00{i + 1}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <Avatar className="size-6"><AvatarFallback>KH</AvatarFallback></Avatar>
                            Khách {i + 1}
                          </span>
                        </TableCell>
                        <TableCell><OrderStatusBadge status={s} /></TableCell>
                        <TableCell className="text-right"><Price amount={(i + 1) * 150000} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="new" />
            <TabsContent value="done" />
          </Tabs>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Section>

        <Section id="domain" title="Component nghiệp vụ" description="Nằm ở src/components/common, dùng chung cho mọi phần của app.">
          <PageHeader title="Đơn hàng" description="Quản lý đơn của gian hàng" actions={<Button>Xuất CSV</Button>} />
          <Row label="Price / Rating / Region">
            <Price amount={85000} original={100000} />
            <RatingStars value={4.6} count={89} />
            <RatingStars value={4.6} count={89} compact />
            <RegionTag province="Huế" />
          </Row>
          <Row label="OrderStatusBadge">
            {statuses.map((s) => <OrderStatusBadge key={s} status={s} />)}
          </Row>
          <Row label="QuantityInput"><QuantityInput value={qty} onChange={setQty} /></Row>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.name} product={p} />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ShopCard shop={{ href: "#", name: "Nhà Mắm Sầm Sơn", province: "Thanh Hóa", productCount: 24, followerCount: 1280, verified: true }} />
            <ShopCard shop={{ href: "#", name: "Trà Tân Cương Xanh", province: "Thái Nguyên", productCount: 12, followerCount: 340 }} />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Đơn mới" value="18" delta={12} icon={ShoppingBag} />
            <StatCard label="Doanh thu ước tính" value="12,4 tr" delta={-3} icon={TrendingUp} />
            <StatCard label="Người theo dõi" value="1.280" delta={5} icon={Users} />
            <StatCard label="Sản phẩm" value="24" icon={PackageOpen} />
          </div>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Gói Pro</CardTitle>
              <CardDescription>Cho gian hàng đang lớn</CardDescription>
            </CardHeader>
            <CardContent><Price amount={199000} /><span className="text-sm text-muted-foreground"> /tháng</span></CardContent>
            <CardFooter><Button className="w-full">Chọn gói</Button></CardFooter>
          </Card>
          <EmptyState icon={ShoppingBag} title="Giỏ hàng trống" description="Dạo một vòng phố đặc sản và chọn món quà quê nhé." action={<Button>Khám phá ngay</Button>} />
                  </Section>
      </main>
    </TooltipProvider>
  );
}
