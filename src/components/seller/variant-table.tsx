"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface VariantItem {
  id?: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  sku?: string | null;
}

interface VariantTableProps {
  variants: VariantItem[];
  onChange: (variants: VariantItem[]) => void;
}

export function VariantTable({ variants, onChange }: VariantTableProps) {
  const handleAdd = () => {
    onChange([
      ...variants,
      {
        name: "",
        price: 0,
        compareAtPrice: null,
        stock: 10,
        sku: "",
      },
    ]);
  };

  const handleRemove = (index: number) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof VariantItem,
    value: string | number | null
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">Phân loại sản phẩm</label>
          <p className="text-xs text-muted-foreground">
            Ít nhất 1 phân loại (Ví dụ: &quot;Hộp 250g&quot;, &quot;Gói 500g&quot; hoặc &quot;Mặc định&quot;)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          Thêm phân loại
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Tên phân loại *</TableHead>
              <TableHead className="min-w-[120px]">Giá bán (đ) *</TableHead>
              <TableHead className="min-w-[120px]">Giá gốc (đ)</TableHead>
              <TableHead className="min-w-[100px]">Tồn kho *</TableHead>
              <TableHead className="min-w-[100px]">SKU</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v, idx) => (
              <TableRow key={idx}>
                <TableCell className="p-2">
                  <Input
                    required
                    placeholder="VD: Hộp 500g"
                    value={v.name}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    required
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={v.price === 0 ? "" : v.price}
                    onChange={(e) => handleChange(idx, "price", Number(e.target.value) || 0)}
                    className="h-8 font-mono text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Không bắt buộc"
                    value={v.compareAtPrice ?? ""}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "compareAtPrice",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="h-8 font-mono text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    required
                    type="number"
                    min={0}
                    placeholder="0"
                    value={v.stock}
                    onChange={(e) => handleChange(idx, "stock", Number(e.target.value) || 0)}
                    className="h-8 font-mono text-xs"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    placeholder="Mã SKU"
                    value={v.sku || ""}
                    onChange={(e) => handleChange(idx, "sku", e.target.value)}
                    className="h-8 font-mono text-xs"
                  />
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={variants.length <= 1}
                    onClick={() => handleRemove(idx)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Xóa phân loại"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
