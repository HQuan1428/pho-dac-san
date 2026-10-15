export function getProductPlaceholder(label = "Phố Đặc Sản"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#f4f4f5"/>
    <g transform="translate(160, 140)" stroke="#a1a1aa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" transform="scale(3.2) translate(-2, -2)"/>
    </g>
    <text x="200" y="255" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" text-anchor="middle" fill="#71717a">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getProductImageUrl(images?: string[] | null, label = "Phố Đặc Sản"): string {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  return getProductPlaceholder(label);
}
