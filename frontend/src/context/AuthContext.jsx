/* eslint-disable react-refresh/only-export-components */
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check if token cookie exists
  const hasTokens = useCallback(() => {
    // Check cookie first
    const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('authenticated=true'));
    if (hasCookie) return true;
    
    // Fallback to localStorage for more robust persistence on some browsers/localhost
    return localStorage.getItem('authenticated') === 'true';
  }, []);

  const clearAuthCookie = useCallback(() => {
    const isProduction = import.meta.env.MODE === 'production';
    const baseOptions = `; path=/; ${isProduction ? 'secure; SameSite=None' : 'SameSite=Lax'}`;
    
    // Clear cookies for current domain and without domain specified
    const clear = (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${baseOptions}`;
    };

    clear("authenticated");
    clear("csrfToken");
    
    // Also clear localStorage fallback
    localStorage.removeItem('authenticated');
  }, []);

  // Fetch current authenticated user
  const fetchUser = useCallback(async () => {
    if (!hasTokens()) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      setAuthError(null);
      return;
    }

    try {
      setAuthError(null);
      const response = await api.get("/auth/me");
      
      if (!response.data.success || !response.data.user) {
        // If the backend says success: false, it means we are not authenticated
        clearAuthCookie();
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Format user object to ensure name and avatar are available
      const userData = response.data.user;
      if (userData && userData.profile) {
        userData.name = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || userData.username;
        userData.profileImage = userData.profile.avatar;
      }
      
      setUser(userData);
    } catch (err) {
      // Don't log 401 as an error, it just means session is expired/invalid
      if (err.response?.status !== 401) {
        console.error("Failed to fetch user:", err);
      }
      
      // If unauthorized, clear the frontend cookie to stop further attempts
      if (err.response?.status === 401) {
        clearAuthCookie();
      }
      setUser(null);
      setAuthError(
        err.response?.status === 401 ? null : (err.response?.data?.error || "Authentication failed")
      );
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [hasTokens, clearAuthCookie]);

  // Initial load
  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      clearAuthCookie();
      setUser(null);
      setLoading(false);
      setInitialized(true);
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [fetchUser]);

  // Login
  const login = async (credentials) => {
    try {
      setAuthError(null);

      const response = await api.post("/auth/login", credentials);

      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        if (userData && userData.profile) {
          userData.name = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || userData.username;
          userData.profileImage = userData.profile.avatar;
        }
        
        // Persist login state in localStorage as a fallback to cookie for better stability on localhost
        localStorage.setItem('authenticated', 'true');
        
        setUser(userData);
        return { success: true, user: userData };
      }

      throw new Error("Invalid server response");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Login failed";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setAuthError(null);

      const response = await api.post("/auth/register", userData);

      if (response.data.success) {
        return { success: true, email: response.data.email };
      }

      throw new Error("Invalid server response");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Registration failed";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Verify Email
  const verifyEmail = async (email, code) => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/verify-email", { email, code });
      if (response.data.success && response.data.user) {
        localStorage.setItem('authenticated', 'true');
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error("Verification failed");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Email verification failed";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // 1. Clear state immediately to improve UI responsiveness
      setUser(null);
      setAuthError(null);

      // 2. Call backend to invalidate session (swallow error if it fails)
      await api.post("/auth/logout").catch(err => {
        console.warn("Backend logout failed, proceeding with local clear:", err);
      });

      // 3. Clear all local storage related to admin/auth (except deviceId)
      const keysToRemove = [
        "redirectAfterLogin",
        "adminToken",
        "admin-user",
        "sidebar-collapsed",
        "adminTheme",
        "toast-config"
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 4. Force clear cookies
      clearAuthCookie();
      
      // 5. Clear session storage
      sessionStorage.clear();
      
      // 6. Optional: trigger a custom event for other parts of the app to react
      window.dispatchEvent(new Event("logout"));
      
    } catch (err) {
      console.error("Critical logout error:", err);
    } finally {
      setIsLoggingOut(false);
      // Optional: window.location.href = "/login"; // Force full reload if needed
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      setAuthError(null);
      const response = await api.put("/auth/update-profile", profileData);
      if (response.data.success) {
        const userData = response.data.user;
        if (userData && userData.profile) {
          userData.name = `${userData.profile.firstName || ''} ${userData.profile.lastName || ''}`.trim() || userData.username;
        }
        setUser(userData);
        return { success: true };
      }
      throw new Error("Update failed");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Profile update failed";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Update Password
  const updatePassword = async (passwordData) => {
    try {
      setAuthError(null);
      const response = await api.put("/auth/update-password", passwordData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Password update failed";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to send reset code";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Verify OTP
  const verifyOTP = async (email, code) => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/verify-otp", { email, code });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Invalid verification code";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Reset Password (with token)
  const resetPassword = async (token, password) => {
    try {
      setAuthError(null);
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to reset password";
      setAuthError(errorMessage);
      throw err;
    }
  };

  // Resend OTP
  const resendOTP = async (email, type = 'verification') => {
    try {
      setAuthError(null);
      const response = await api.post("/auth/resend-otp", { email, type });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to resend code";
      setAuthError(errorMessage);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isLoggingOut,
    initialized,
    authError,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    verifyOTP,
    resetPassword,
    resendOTP,
    fetchUser,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "superadmin",
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    userRole: user?.role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};