import { defineQuery } from "next-sanity";

// Every dump item, newest first. Layout (position / rotation / size) is NOT
// stored — it's generated on the frontend on each mount (see
// components/dump-scatter.tsx). `type` is derived from the uploaded file's
// MIME type so authors only ever have to upload a file.
export const DUMP_QUERY = defineQuery(`
  *[_type == "dumpItem" && defined(file.asset)] | order(_createdAt desc) {
    _id,
    caption,
    "url": file.asset->url,
    "type": select(
      string::startsWith(file.asset->mimeType, "video/") => "video",
      "image"
    )
  }
`);
