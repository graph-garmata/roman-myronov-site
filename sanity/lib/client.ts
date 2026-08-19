import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // The `production` dataset is public, so published content is readable
  // without a token. `useCdn` serves it from Sanity's fast, cached edge.
  useCdn: true,
});

/**
 * Small typed fetch helper. Published content is revalidated on an interval
 * (ISR) and can be surgically busted with cache tags via a webhook later.
 * Content authors see edits within `revalidate` seconds; wire up
 * `/api/revalidate` + a Sanity webhook if you want them instantly.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
