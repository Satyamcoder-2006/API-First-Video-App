import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, clearToken } from "../storage/tokenStorage";
import { apiCall } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        const { data, error } = await apiCall("/auth/me", { method: "GET" });
        if (error) {
          await clearToken();
          setTokenState(null);
        } else {
          setTokenState(storedToken);
        }
      } else {
        setTokenState(null);
      }
    } catch (err) {
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data, error } = await apiCall("/auth/login", {
      method: "POST",
      data: { email, password },
    });
    if (error || !data?.token) {
      return { success: false, error: error || "Login failed" };
    }
    await setToken(data.token);
    setTokenState(data.token);
    return { success: true };
  }

  async function signup(name, email, password) {
    const { data, error } = await apiCall("/auth/signup", {
      method: "POST",
      data: { name, email, password },
    });
    if (error || !data?.token) {
      return { success: false, error: error || "Signup failed" };
    }
    await setToken(data.token);
    setTokenState(data.token);
    return { success: true };
  }

  async function logout() {
    await apiCall("/auth/logout", { method: "POST" });
    await clearToken();
    setTokenState(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
