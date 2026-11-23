import Image, { type StaticImageData } from "next/image";
import { ViewTransition } from "react";

// Full-width photo strip at the top of a content page (prototype `.banner-img-container`).
// `name` pairs it with its home card, which morphs into it.
// `height` overrides the prototype's 320 px (Qui sommes-nous runs taller).
export function PageBanner({
  src,
  alt,
  name,
  height = "h-80",
}: {
  src: StaticImageData;
  alt: string;
  name: string;
  height?: string;
}) {
  return (
    <ViewTransition name={`banner-${name}`} share="morph" default="none">
      <div className={`relative w-full overflow-hidden ${height}`}>
        <Image src={src} alt={alt} fill sizes="100vw" loading="eager" fetchPriority="high" className="object-cover" />
      </div>
    </ViewTransition>
  );
}
