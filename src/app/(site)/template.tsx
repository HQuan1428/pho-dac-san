export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
      {children}
    </div>
  );
}
