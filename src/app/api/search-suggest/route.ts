import { NextResponse, type NextRequest } from "next/server";
import { suggestSearch, getFeaturedCategories } from "@/server/store/catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    const featuredCategories = await getFeaturedCategories();
    return NextResponse.json({
      products: [],
      shops: [],
      categories: [],
      featuredCategories,
    });
  }

  const results = await suggestSearch(q);
  return NextResponse.json(results);
}
