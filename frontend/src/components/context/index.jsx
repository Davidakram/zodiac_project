import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

// Create a context
const UserContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useUser().
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get("zodiac_token");
    if (token) {
      const { user_name } = jwtDecode(token);
      setUser({ user_name });
    }
  }, []);

  const userlogin = (token) => {
    const { user_name } = jwtDecode(token);
    Cookies.set("zodiac_token", token);
    setUser({ user_name }); // Update user context here
  };
  const logout = () => {
    Cookies.remove("zodiac_token");
    setUser(null); // clear user data
  };

  return (
    <UserContext.Provider value={{ user, logout, userlogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
