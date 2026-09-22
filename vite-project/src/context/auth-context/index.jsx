import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      const data = await registerService(signUpFormData);
      console.log("User registered:", data);
      if (data.success) {
        setNotification({
          message: "Registration successful! Please log in.",
          type: "success",
          show: true,
        });
        // Reset form
        setSignUpFormData(initialSignUpFormData);
        // Auto-hide after 5 seconds
        setTimeout(
          () => setNotification({ message: "", type: "", show: false }),
          5000,
        );
      } else {
        setNotification({
          message: data.message || "Registration failed. Please try again.",
          type: "error",
          show: true,
        });
        setTimeout(
          () => setNotification({ message: "", type: "", show: false }),
          5000,
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your connection and try again.";
      setNotification({ message: errorMessage, type: "error", show: true });
      setTimeout(
        () => setNotification({ message: "", type: "", show: false }),
        5000,
      );
    }
  }
  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      console.log("🔐 Login Response:", data);
      if (data && data.success) {
        const token = data.data.accessToken;
        sessionStorage.setItem("accessToken", token);
        console.log("✅ Token stored:", token);
        console.log("👤 User role:", data.data.user.role);
        console.log("📍 User data:", JSON.stringify(data.data.user));
        setAuth({
          authenticated: true,
          user: data.data.user,
        });
        console.log("🎯 Auth state updated, redirecting...");
      } else {
        setNotification({
          message:
            data?.message || "Login failed. Please check your credentials.",
          type: "error",
          show: true,
        });
        setTimeout(
          () => setNotification({ message: "", type: "", show: false }),
          5000,
        );
        setAuth({
          authenticated: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your connection and try again.";
      setNotification({ message: errorMessage, type: "error", show: true });
      setTimeout(
        () => setNotification({ message: "", type: "", show: false }),
        5000,
      );
      setAuth({
        authenticated: false,
        user: null,
      });
    }
  }

  async function checkAuthUser() {
    try {
      const tokenString = sessionStorage.getItem("accessToken");
      if (!tokenString) {
        setAuth({
          authenticated: false,
          user: null,
        });
        setLoading(false);
        return;
      }
      const data = await checkAuthService();
      if (data && data.success) {
        setAuth({
          authenticated: true,
          user: data.data.user,
        });
      } else {
        sessionStorage.removeItem("accessToken");
        setAuth({
          authenticated: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      sessionStorage.removeItem("accessToken");
      setAuth({
        authenticated: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    checkAuthUser();
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    setAuth({
      authenticated: false,
      user: null,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        handleLogout,
        auth,
        notification,
        setNotification,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
