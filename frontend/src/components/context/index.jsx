import React from "react";

const UserContext = React.createContext({
  userRole: null,
  setUserRole: () => {},
});

export default UserContext;
