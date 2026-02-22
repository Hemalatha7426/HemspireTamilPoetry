import { API_BASE_URL } from "../api/client";

export function resolveMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  if (path.startsWith("/uploads/")) {
    return `${API_BASE_URL}${path}`;
  }

  const normalized = path.startsWith("/") ? path.substring(1) : path;

  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  return `${API_BASE_URL}/uploads/${normalized}`;
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

export async function shareContent({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "Shared successfully";
    } catch {
      return "Share cancelled";
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "Link copied to clipboard";
  }

  return "Sharing not supported";
}
