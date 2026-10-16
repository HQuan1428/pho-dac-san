import { redirect } from "next/navigation";

export default async function WishlistRedirectPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();
  params.set("tab", "wishlist");
  for (const [key, val] of Object.entries(searchParams)) {
    if (key !== "tab") {
      if (Array.isArray(val)) {
        for (const v of val) params.append(key, v);
      } else if (typeof val === "string") {
        params.set(key, val);
      }
    }
  }
  redirect(`/account?${params.toString()}`);
}
