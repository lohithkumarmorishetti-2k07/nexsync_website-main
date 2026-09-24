import { initialSignInFormData } from "@/config";
import { checkAuthService, loginService } from "@/services";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
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

  async function handleLoginUser(event) {
    if (event && event.preventDefault) event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      if (data && data.success) {
        const token = data.data.accessToken;
        sessionStorage.setItem("accessToken", token);
        setAuth({
          authenticated: true,
          user: data.data.user,
        });
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
        "Login failed. Please check your connection and credentials.";
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
        handleLoginUser,
        handleLogout,
        auth,
        notification,
        setNotification,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-black text-[#ccff00] font-mono text-sm">
          INITIALIZING TELEMETRY LINK...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
