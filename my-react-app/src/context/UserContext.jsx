// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/user/data", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => { if(data.success) setUser(data.userData); })
      .catch(err => console.error(err));
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);