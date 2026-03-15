import React, { createContext, useContext, useState } from "react";
import { apiService } from "../services/api";

interface User {
  id: string;
  email: string;
  organizationId: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem("authToken");
    if (saved) apiService.setToken(saved); // Sync the API service immediately
    return saved;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("authUser");
    try {
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  /*
  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser && storedUser !== undefined) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiService.setToken(storedToken);
      } catch (error) {
          console.error("Failed to parse authUser:", error);
          //logout();
      }
    }

    setIsLoading(false);
  }, []);
*/

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);

      const accessToken = response.tokens.accessToken;
      const userData = response.user;

      setToken(accessToken);
      setUser(userData);

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("authUser", JSON.stringify(userData));

      apiService.setToken(accessToken);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    apiService.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
