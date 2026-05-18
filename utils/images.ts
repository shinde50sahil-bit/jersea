import { getApiBaseUrl } from "@/utils/api";

const UPLOADS_BASE =
  process.env.NEXT_PUBLIC_UPLOADS_URL?.replace(/\/$/, "") || "";

export function resolveImageUrl(imageUrl: string) {
  if (!imageUrl) {
    return imageUrl;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    // /uploads/ paths → Railway backend (where the files actually live)
    // everything else → local API base
    const base = imageUrl.startsWith("/uploads/")
      ? UPLOADS_BASE || getApiBaseUrl().replace(/\/$/, "")
      : getApiBaseUrl().replace(/\/$/, "");
    return `${base}${imageUrl}`;
  }

  return imageUrl;
}

