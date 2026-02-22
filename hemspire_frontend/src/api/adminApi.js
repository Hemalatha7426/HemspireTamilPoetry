import { del, get, put } from "./client";

export function getAdminStats() {
  return get("/api/admin/stats");
}

export function getAdminUsers() {
  return get("/api/admin/users");
}

export function updateUserRole(id, role) {
  return put(`/api/admin/users/${id}/role`, { role });
}

export function deleteUser(id) {
  return del(`/api/admin/users/${id}`);
}
