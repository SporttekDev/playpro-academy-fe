// lib/laravel/image.ts
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL_STORAGE!;

export function getImageUrl(path?: string | null): string {
  if (!path) {
    return "/images/fallback-picture.svg";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Hindari duplikasi "/storage" jika path sudah diawali dengannya
  // sementara API_URL juga sudah mengandung "/storage" di akhirnya.
  const normalizedPath = path.startsWith("/storage")
    ? path.slice("/storage".length)
    : path;

  return `${API_URL}${
    normalizedPath.startsWith("/") ? "" : "/"
  }${normalizedPath}`;
}
