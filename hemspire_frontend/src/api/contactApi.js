import { post } from "./client";

export function submitContact(payload) {
  return post("/api/contact", payload);
}
