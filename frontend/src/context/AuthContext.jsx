import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("userInfo");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.log("Auth load error:", e);
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        login: loginUser, // 👈 alias
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
