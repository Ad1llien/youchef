// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/data`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const syncOnFocus = () => {
      refreshUser();
    };

    window.addEventListener("focus", syncOnFocus);
    document.addEventListener("visibilitychange", syncOnFocus);

    return () => {
      window.removeEventListener("focus", syncOnFocus);
      document.removeEventListener("visibilitychange", syncOnFocus);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);