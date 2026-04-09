import { getApiBaseUrl } from "@/utils/api";

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
    return `${getApiBaseUrl().replace(/\/$/, "")}${imageUrl}`;
  }

  return imageUrl;
}
