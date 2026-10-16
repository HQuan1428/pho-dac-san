"use client";

import { useEffect } from "react";

// One document-level listener feeds the CSS pointer effects in globals.css
// ([data-spotlight], [data-tilt], [data-parallax]). Renders nothing.
export function PointerFx() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    let frame = 0;
    let e: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;

    const apply = () => {
      frame = 0;
      if (!e) return;
      const target = e.target as Element | null;
      root.style.setProperty("--px", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty("--py", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));

      const spot = target?.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilted && tilted !== tilt) {
        tilted.style.removeProperty("--rx");
        tilted.style.removeProperty("--ry");
      }
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
      }
    };

    const onMove = (ev: PointerEvent) => {
      e = ev;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
