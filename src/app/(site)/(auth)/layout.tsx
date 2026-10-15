import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản - Phố Đặc Sản",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
