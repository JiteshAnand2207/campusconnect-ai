import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi";

const AuthContext = createContext(null);

const extractUser = (payload) => {
  return payload?.data?.user || payload?.user || payload?.data || payload || null;
};

const extractToken = (payload) => {
  return (
    payload?.data?.accessToken ||
    payload?.data?.token ||
    payload?.accessToken ||
    payload?.token ||
    null
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const loadCurrentUser = async () => {
    try {
      setAuthLoading(true);

      const payload = await getCurrentUser();
      const currentUser = extractUser(payload);

      setUser(currentUser);
      setAuthError("");
    } catch (error) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const register = async (formData) => {
    const payload = await registerUser(formData);
    const registeredUser = extractUser(payload);
    const token = extractToken(payload);

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    setUser(registeredUser);
    setAuthError("");

    return payload;
  };

  const login = async (formData) => {
    const payload = await loginUser(formData);
    const loggedInUser = extractUser(payload);
    const token = extractToken(payload);

    console.log("LOGIN PAYLOAD:", payload);
    console.log("LOGIN TOKEN:", token);

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    setUser(loggedInUser);
    setAuthError("");

    return payload;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const value = {
    user,
    authLoading,
    loading: authLoading,
    authError,
    setAuthError,
    register,
    login,
    logout,
    reloadUser: loadCurrentUser,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};