import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { decodeToken, isTokenExpired } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const localToken = localStorage.getItem("token");
    if (localToken && isTokenExpired(localToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      return null;
    }
    return localToken;
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username");
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("role");
  });

  // Auto logout when token expires
  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      logout();
      window.location.href = "/login";
      return;
    }

    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      const delay = (decoded.exp * 1000) - Date.now();
      const timer = setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, Math.max(0, delay));

      return () => clearTimeout(timer);
    }
  }, [token]);

  const login = async (usernameInput, password) => {
    const res = await api.post("/login", {
      username: usernameInput,
      password,
    });

    const jwtToken = res.data.token;
    const userRole = res.data.role || "user";
    const userName = res.data.username || usernameInput;

    localStorage.setItem("token", jwtToken);
    localStorage.setItem("username", userName);
    localStorage.setItem("role", userRole);

    setToken(jwtToken);
    setUsername(userName);
    setRole(userRole);
  };

  const register = async (usernameInput, password) => {
    await api.post("/register", {
      username: usernameInput,
      password,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        login,
        register,
        logout,
        isTokenExpired,
        decodeToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);