export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

function buildHeaders(extraHeaders = {}, isJson = true) {
  const headers = { ...extraHeaders };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (isJson && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {}, options.isJson !== false),
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function get(path) {
  return request(path, { method: "GET" });
}

export function del(path) {
  return request(path, { method: "DELETE" });
}

export function post(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function put(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function postMultipart(path, formData, method = "POST") {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
