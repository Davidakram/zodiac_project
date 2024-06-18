import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useUser } from "../context";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const NavBar = () => {
  const { user, logout } = useUser();
  const [user_name, setUserName] = useState("");
  const [show, setShow] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const location = useLocation();
  useEffect(() => {
    if (Cookies.get("zodiac_token")) {
      const { user_name } = jwtDecode(Cookies.get("zodiac_token"));
      setUserName(user_name);
    }

    if (location.pathname === "/login") {
      setShow(false);
    } else {
      setShow(true);
    }
  }, [location.pathname]);

  return (
    show &&
    user && (
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
              className={user_name === "Youssef" ? "d-block" : "d-none"}
            >
              Add Product
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/">
              Sales Management
            </MenuItem>
            <MenuItem
              onClick={handleClose}
              component={Link}
              to="/products"
              className={user_name === "Youssef" ? "d-block" : "d-none"}
            >
              Products Available
            </MenuItem>
            <MenuItem
              onClick={handleClose}
              component={Link}
              to="/getsales"
              className={user_name === "Youssef" ? "d-block" : "d-none"}
            >
              Sales by Date
            </MenuItem>
            <MenuItem
              onClick={handleClose}
              component={Link}
              to="/inventory"
              className={user_name === "Youssef" ? "d-block" : "d-none"}
            >
              Inventory
            </MenuItem>
            <MenuItem onClick={logout} component={Link} to="/login">
              Logout
            </MenuItem>
          </Menu>

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
