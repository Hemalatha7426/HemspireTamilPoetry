import { post } from "./client";

export function registerUser(payload) {
  return post("/api/auth/register", payload);
}

export function loginUser(payload) {
  return post("/api/auth/login", payload);
}
