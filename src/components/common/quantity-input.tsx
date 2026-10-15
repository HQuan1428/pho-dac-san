"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border">
      <Button variant="ghost" size="icon-sm" aria-label="Giảm" disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus />
      </Button>
      <span className="w-10 text-center text-sm tabular-nums">{value}</span>
      <Button variant="ghost" size="icon-sm" aria-label="Tăng" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  );
}
