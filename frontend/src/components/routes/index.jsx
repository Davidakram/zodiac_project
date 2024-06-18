import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";
const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = Cookies.get("zodiac_token");

  const isAuthenticated = !!token;
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
