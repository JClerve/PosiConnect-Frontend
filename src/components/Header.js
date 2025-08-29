import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Header = ({ onMenuToggle, showMenuButton = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3); // Mock data

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
    navigate("/login");
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
        boxShadow: "0 2px 10px rgba(25, 118, 210, 0.3)",
      }}
    >
      <Toolbar>
        {showMenuButton && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={() => navigate("/")}
        >
          PosiConnect
        </Typography>

        {token ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  fontSize: "0.875rem",
                }}
              >
                {user?.firstName?.[0] || <AccountCircle />}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/login")}
              sx={{
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/signup")}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;