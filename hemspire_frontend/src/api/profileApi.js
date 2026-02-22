import { get } from "./client";

export function getMyProfile() {
  return get("/api/profile/me");
}
