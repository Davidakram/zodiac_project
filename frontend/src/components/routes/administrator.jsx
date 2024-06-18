import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const PrivateRouteWithUserCheck = ({ component: Component, ...rest }) => {
  const token = Cookies.get("zodiac_token");
  const { user_name } = jwtDecode(token);
  console.log(user_name);
  if (token && user_name === "Youssef") {
    return <Route {...rest} component={Component} />;
  }

  return <Redirect to="/" />;
};

export default PrivateRouteWithUserCheck;
