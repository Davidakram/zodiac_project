import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const PrivateRouteWithUserCheck = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState("");
  const token = Cookies.get("zodiac_token");

  useEffect(() => {
    if (token) {
      const { user_name } = jwtDecode(token);
      setUser(user_name);
    }
  }, [token]);

  if (token && user === "Youssef") {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }

  return <Redirect to="/" />;
};

export default PrivateRouteWithUserCheck;
