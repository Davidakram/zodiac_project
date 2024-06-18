import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const PrivateRouteWithUserCheck = ({ component: Component, ...rest }) => {
  const token = Cookies.get("zodiac_token");

  if (token && jwtDecode(token).user_name === "Youssef") {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }

  return <Redirect to="/" />;
};

export default PrivateRouteWithUserCheck;
