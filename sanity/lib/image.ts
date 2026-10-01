import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";

const builder = createImageUrlBuilder(client);

/**
 * Build a Sanity image URL. Use for on-the-fly resizing/cropping, e.g.
 * `urlFor(cover).width(1200).url()`. The GROQ queries already resolve
 * `asset->url` for the simple full-size case, so this is for when a component
 * wants a specific size or format.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
