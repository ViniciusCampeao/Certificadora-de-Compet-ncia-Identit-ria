import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, setUnauthorizedHandler } from "../api/client.js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const readUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("ellp-user"));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const login = useCallback(async (identifier, password) => {
    const data = await api.post("/auth/login", { user: identifier, password });
    sessionStorage.setItem("ellp-token", data.token);
    sessionStorage.setItem("ellp-user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("ellp-token");
    sessionStorage.removeItem("ellp-user");
    setUser(null);
  }, []);

  const patchUser = useCallback((patch) => {
    setUser((current) => {
      const next = { ...current, ...patch };
      sessionStorage.setItem("ellp-user", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, patchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
