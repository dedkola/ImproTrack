import Image from "next/image";

type ProductCollageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ProductCollage({
  alt,
  className = "",
  priority = false,
}: ProductCollageProps) {
  return (
    <figure className={`product-collage ${className}`}>
      <Image
        src="/brand/home-collage.png"
        alt={alt}
        width={1800}
        height={1200}
        priority={priority}
        className="product-collage-image"
        sizes="(min-width: 1280px) 760px, (min-width: 1024px) 54vw, (min-width: 768px) 84vw, 112vw"
      />
    </figure>
  );
}
