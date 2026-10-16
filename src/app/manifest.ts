import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Phố Đặc Sản",
    short_name: "Phố Đặc Sản",
    description: "Chợ đặc sản vùng miền nhiều gian hàng",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b6b55",
    lang: "vi",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/logo-mark-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
