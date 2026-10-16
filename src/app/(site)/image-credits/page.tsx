import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs/promises";
import path from "node:path";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Nguồn ảnh — Phố Đặc Sản",
  description:
    "Danh sách ghi nhận bản quyền, tác giả và nguồn gốc các hình ảnh sử dụng trên hệ thống Phố Đặc Sản.",
};

interface ImageCredit {
  file: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  author: string;
  license: string;
}

function parseCredits(markdown: string): ImageCredit[] {
  const lines = markdown.split("\n");
  const credits: ImageCredit[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith("|") || !line.endsWith("|")) continue;

    const cols = line
      .split("|")
      .slice(1, -1)
      .map((col) => col.trim());

    if (cols.length < 5) continue;

    // Skip table header and separator rows
    if (cols[0].toLowerCase().includes("file") || cols[0].includes("---")) {
      continue;
    }

    const file = cols[0].replace(/`/g, "").trim();
    if (!file) continue;

    const description = cols[1];
    const sourceCol = cols[2];
    const author = cols[3];
    const license = cols[4];

    // Parse markdown link: [text](url)
    const linkMatch = sourceCol.match(/\[(.*?)\]\((.*?)\)/);
    const sourceName = linkMatch ? linkMatch[1].trim() : sourceCol;
    const sourceUrl = linkMatch ? linkMatch[2].trim() : "";

    credits.push({
      file,
      description,
      sourceName,
      sourceUrl,
      author,
      license,
    });
  }

  return credits;
}

async function getCredits(): Promise<ImageCredit[]> {
  try {
    const filePath = path.join(process.cwd(), "public/images/CREDITS.md");
    const content = await fs.readFile(filePath, "utf-8");
    return parseCredits(content);
  } catch (error) {
    console.error("Không thể đọc tập tin CREDITS.md:", error);
    return [];
  }
}

export default async function NguonAnhPage() {
  const credits = await getCredits();

  return (
    <div className="py-10 md:py-16">
      <div className="container-page space-y-8">
        {/* Header & Intro */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ImageIcon className="size-3.5" />
            Minh bạch bản quyền
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nguồn ảnh &amp; Giấy phép
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Tất cả hình ảnh sử dụng trên hệ thống Phố Đặc Sản đều được cấp phép cho mục đích thương mại tự do (Creative Commons CC0, CC BY, CC BY-SA, hoặc Public Domain). Dưới đây là bảng ghi nhận nguồn gốc xuất xứ, tác giả và giấy phép tương ứng của từng tư liệu hình ảnh.
          </p>
        </div>

        {/* Content list / table */}
        {credits.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Chưa có thông tin nguồn ảnh.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile View: Card List */}
            <div className="grid gap-3 md:hidden">
              {credits.map((item, idx) => (
                <div
                  key={`${item.file}-${idx}`}
                  className="flex gap-3 rounded-xl border bg-card p-3 shadow-xs"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={item.file}
                      alt={item.description}
                      width={64}
                      height={64}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-xs font-medium text-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span>Tác giả: <strong className="font-medium text-foreground">{item.author}</strong></span>
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-primary hover:underline"
                        >
                          <span>{item.sourceName}</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      ) : (
                        <span>{item.sourceName}</span>
                      )}
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {item.license}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-xl border bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-20 pl-4">Ảnh</TableHead>
                    <TableHead className="min-w-60">Mô tả</TableHead>
                    <TableHead className="w-48">Tác giả</TableHead>
                    <TableHead className="w-44">Nguồn</TableHead>
                    <TableHead className="w-36 pr-4">Giấy phép</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credits.map((item, idx) => (
                    <TableRow key={`${item.file}-${idx}`} className="align-middle">
                      <TableCell className="pl-4 py-2.5">
                        <div className="relative size-16 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={item.file}
                            alt={item.description}
                            width={64}
                            height={64}
                            className="size-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <p className="text-xs font-medium text-foreground whitespace-normal leading-relaxed">
                          {item.description}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground truncate max-w-sm">
                          {item.file}
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-foreground whitespace-normal">
                        {item.author}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs">
                        {item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="truncate max-w-[130px]">{item.sourceName}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{item.sourceName}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 pr-4">
                        <Badge variant="outline" className="text-xs font-normal">
                          {item.license}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
