import Link from "next/link";
import { Button } from "@/components/ui/button";

// Header sign-in / sign-up entry points for guests. Owned by the auth-dialog work; header only renders it.
export function AuthButtons() {
  return (
    <>
      <Button variant="ghost" size="sm" render={<Link href="/login" />}>Đăng nhập</Button>
      <Button size="sm" render={<Link href="/register" />}>Đăng ký</Button>
    </>
  );
}
