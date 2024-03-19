import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = Cookies.get("zodiac_token");

  if (token) {
    return <Route {...rest} component={Component} />;
  }

  return <Redirect to="/login" />;
};

export default PrivateRoute;
