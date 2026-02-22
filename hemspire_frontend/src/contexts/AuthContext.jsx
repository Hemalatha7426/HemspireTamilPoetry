import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

const AuthContext = createContext(null);

function parseRole(roleValue) {
  if (!roleValue) return "USER";
  return roleValue.replace("ROLE_", "").toUpperCase();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(parseRole(localStorage.getItem("role")));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }, [token, role]);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    const normalizedRole = parseRole(result.role);

    // Persist immediately to avoid race conditions on first protected API calls after navigate.
    localStorage.setItem("token", result.token || "");
    localStorage.setItem("role", normalizedRole);

    setToken(result.token);
    setRole(normalizedRole);
    return result;
  };

  const register = async (payload) => registerUser(payload);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("USER");
  };

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      isAdmin: role === "ADMIN",
      login,
      register,
      logout,
    }),
    [token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
