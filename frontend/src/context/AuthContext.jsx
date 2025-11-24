import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/endpoints";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      try {
        const p = JSON.parse(atob(t.split(".")[1]));
        if (p.exp * 1000 > Date.now()) {
          setUser({ uid: p.sub, token: t });
        } else {
          localStorage.removeItem("token");
        }
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (e, p) => {
    const res = await authAPI.login({ email: e, password: p });
    const t = res.data.access_token;
    localStorage.setItem("token", t);
    const pay = JSON.parse(atob(t.split(".")[1]));
    setUser({ uid: pay.sub, token: t });
  };

  const register = async (e, p) => {
    return authAPI.reg({ email: e, password: p });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};