import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import Cookies from "js-cookie";
import UserContext from "../context";

const NavBar = () => {
  const history = useHistory();
  const { userRole, setUserRole } = React.useContext(UserContext);
  console.log(userRole);
  const [show, setShow] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const logout = () => {
    setUserRole(null);
    Cookies.remove("zodiac_token");
    history.push("/login");
  };

  //   const handleLogout = () => {
  //     const auth = getAuth();

  //     signOut(auth)
  //       .then(() => {
  //         history.push("/login");
  //         Cookies.remove("User_Id");
  //       })
  //       .catch((error) => {
  //         console.error("Error during logout:", error);
  //       });
  //   };
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/login") {
      setShow(false);
    } else {
      setShow(true);
    }
  }, [location.pathname]);

  return (
    show && (
      <AppBar
        position="static"
        sx={{ background: "transparent", color: "white", border: "none" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Zodiac
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          {userRole && (
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={handleClose}
                component={Link}
                to="/add_product"
              >
                Add Product
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/">
                Sales Management
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/products">
                Products Available
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/getsales">
                Sales by Date
              </MenuItem>
              <MenuItem onClick={logout} component={Link} to="/login">
                Logout
              </MenuItem>
            </Menu>
          )}

          {/* Logout Button */}
          {/* <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button> */}
        </Toolbar>
      </AppBar>
    )
  );
};

export default NavBar;
