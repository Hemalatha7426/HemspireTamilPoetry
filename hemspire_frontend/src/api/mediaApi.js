import { del, get, post, postMultipart } from "./client";

function buildSearchPath(basePath, keyword) {
  if (!keyword || !keyword.trim()) {
    return basePath;
  }
  return `${basePath}/search?keyword=${encodeURIComponent(keyword.trim())}`;
}

export const poemApi = {
  getAll: () => get("/api/poems"),
  search: (keyword) => get(buildSearchPath("/api/poems", keyword)),
  like: (id) => post(`/api/poems/${id}/like`, {}),
  getMyLikedIds: () => get("/api/poems/likes/me"),
  create: (formData) => postMultipart("/api/poems/upload", formData),
  update: (id, formData) => postMultipart(`/api/poems/${id}`, formData, "PUT"),
  remove: (id) => del(`/api/poems/${id}`),
};

export const audioApi = {
  getAll: () => get("/api/audios"),
  search: (keyword) => get(buildSearchPath("/api/audios", keyword)),
  like: (id) => post(`/api/audios/${id}/like`, {}),
  getMyLikedIds: () => get("/api/audios/likes/me"),
  create: (formData) => postMultipart("/api/audios/upload", formData),
  update: (id, formData) => postMultipart(`/api/audios/${id}`, formData, "PUT"),
  remove: (id) => del(`/api/audios/${id}`),
};

export const videoApi = {
  getAll: () => get("/api/videos"),
  search: (keyword) => get(buildSearchPath("/api/videos", keyword)),
  like: (id) => post(`/api/videos/${id}/like`, {}),
  getMyLikedIds: () => get("/api/videos/likes/me"),
  create: (formData) => postMultipart("/api/videos/upload", formData),
  update: (id, formData) => postMultipart(`/api/videos/${id}`, formData, "PUT"),
  remove: (id) => del(`/api/videos/${id}`),
};
