import { initials } from "@/lib/money";
import { safeImageSrc } from "@/lib/url";

export function ProductImage({
  src,
  name,
  className = "",
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  const image = safeImageSrc(src);
  if (image) {
    return <img src={image} alt={name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-neutral-200 text-2xl font-serif text-neutral-500 ${className}`}>
      {initials(name)}
    </div>
  );
}
