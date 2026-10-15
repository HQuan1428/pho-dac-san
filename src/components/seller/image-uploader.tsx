"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadSellerImageAction } from "@/server/seller/upload";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  maxImages = 8,
  label = "Hình ảnh sản phẩm",
  hint = "Tối đa 8 ảnh (JPG, PNG, WebP ≤ 5MB). Ảnh đầu tiên sẽ là ảnh đại diện.",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(`Bạn chỉ có thể tải lên tối đa ${maxImages} hình ảnh`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ảnh "${file.name}" vượt quá dung lượng 5MB`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await uploadSellerImageAction(formData);
        if (res.error) {
          toast.error(res.error);
        } else if (res.url) {
          newUrls.push(res.url);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
        toast.error(msg);
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
      toast.success(`Đã tải lên ${newUrls.length} ảnh`);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= value.length) return;

    const updated = [...value];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">{label}</label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {value.length}/{maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={url}
              alt={`Ảnh ${idx + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
            {idx === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                Ảnh đại diện
              </span>
            )}
            {/* Control buttons */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-between p-1.5">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => handleRemove(idx)}
                  aria-label="Xóa ảnh"
                >
                  <X className="size-3" />
                </Button>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "left")}
                  aria-label="Di chuyển sang trái"
                >
                  <ArrowLeft className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  disabled={idx === value.length - 1}
                  onClick={() => handleMove(idx, "right")}
                  aria-label="Di chuyển sang phải"
                >
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center transition-colors hover:border-primary hover:bg-muted/50 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="size-6 text-muted-foreground" />
                <span className="mt-2 text-xs font-medium text-foreground">Thêm ảnh</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">Tối đa 5MB</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxImages > 1}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
