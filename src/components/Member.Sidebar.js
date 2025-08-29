import React, { useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  Badge,
} from "@mui/material";
import {
  Home,
  Groups,
  MedicalServices,
  Event,
  Notifications,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  Schedule,
  History,
  Receipt,
  Create,
  PostAdd,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link } from "react-router-dom";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 65; // Width when collapsed, showing only icons

const MemberSidebar = ({ open, onClose, variant = "temporary" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Auto-expand sessions menu if a sessions route is active
  const [sessionsOpen, setSessionsOpen] = React.useState(() => {
    const sessionsRoutes = ["/sessions/upcoming", "/sessions/past", "/sessions/invoices"];
    return sessionsRoutes.some(route => location.pathname.startsWith(route));
  });
  
  // Auto-expand relevant submenu based on current location
  useEffect(() => {
    const sessionsRoutes = ["/sessions/upcoming", "/sessions/past", "/sessions/invoices"];
    if (sessionsRoutes.some(route => location.pathname.startsWith(route))) {
      setSessionsOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      text: "Home / Feed",
      icon: <Home />,
      path: "/dashboard",
    },
    {
      text: "Communities",
      icon: <Groups />,
      path: "/communities",
      badge: "New",
    },
    
    {
      text: "Create Post",
      icon: <PostAdd />,
      path: "/create-post",
    },
    
    {
      text: "Find Experts",
      icon: <MedicalServices />,
      path: "/experts",
    },
    {
      text: "My Sessions",
      icon: <Event />,
      hasSubmenu: true,
      submenu: [
        { text: "Upcoming", icon: <Schedule />, path: "/sessions/upcoming" },
        { text: "Past", icon: <History />, path: "/sessions/past" },
        { text: "Invoices", icon: <Receipt />, path: "/sessions/invoices" },
      ],
    },
    {
      text: "Notifications",
      icon: <Notifications />,
      path: "/notifications",
      badge: 3,
    },
    {
      text: "Profile",
      icon: <AccountCircle />,
      path: "/profile",
    },
  ];

  const handleItemClick = (item) => {
    if (item.hasSubmenu && item.text === "My Sessions") {
      setSessionsOpen(!sessionsOpen);
    } else if (item.path) {
      navigate(item.path);
      if (variant === "temporary") {
        onClose();
      }
    }
  };

  const handleSubmenuClick = (submenuItem) => {
    navigate(submenuItem.path);
    if (variant === "temporary") {
      onClose();
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    
    // Exact path match
    if (location.pathname === path) return true;
    
    // Check for dashboard as home page
    if (path === "/dashboard" && location.pathname === "/") return true;
    
    // Check for path prefix match (for nested routes)
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      {/* Add space equal to app bar height */}
      <Box sx={{ height: "64px" }} /> 
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          display: 'flex',
          flexDirection: 'column',
          alignItems: variant === "temporary" || open ? 'flex-start' : 'center',
        }}
      >
        {(variant === "temporary" || open) ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Member Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome back!
            </Typography>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            MP
          </Typography>
        )}
      </Box>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  position: 'relative',
                  bgcolor: isActive(item.path) ? "primary.main" : "transparent",
                  color: isActive(item.path) ? "white" : "inherit",
                  boxShadow: isActive(item.path) ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  '&::before': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    backgroundColor: 'white',
                  } : {},
                  "&:hover": {
                    bgcolor: isActive(item.path) ? "primary.dark" : "primary.light",
                    color: "white",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? "white" : "primary.main",
                    minWidth: 40,
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {(variant === "temporary" || open) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                )}
                {item.hasSubmenu && (
                  sessionsOpen ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.hasSubmenu && item.text === "My Sessions" && (
              <Collapse in={sessionsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((submenuItem) => (
                    <ListItem key={submenuItem.text} disablePadding>
                      <ListItemButton
                        onClick={() => handleSubmenuClick(submenuItem)}
                        sx={{
                          mx: 2,
                          my: 0.25,
                          borderRadius: 2,
                          position: 'relative',
                          bgcolor: isActive(submenuItem.path) ? "primary.main" : "transparent",
                          color: isActive(submenuItem.path) ? "white" : "inherit",
                          boxShadow: isActive(submenuItem.path) ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                          transition: 'all 0.2s ease',
                          overflow: 'hidden',
                          '&::before': isActive(submenuItem.path) ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: '4px',
                            backgroundColor: 'white',
                          } : {},
                          "&:hover": {
                            bgcolor: isActive(submenuItem.path) ? "primary.dark" : "primary.light",
                            color: "white",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive(submenuItem.path) ? "white" : "primary.main",
                            minWidth: 36,
                            ml: 1,
                          }}
                        >
                          {submenuItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={submenuItem.text}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight: isActive(submenuItem.path) ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}

            {index === 2 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={variant === "temporary" ? open : true}
      onClose={onClose}
      sx={{
        width: variant === "temporary" 
          ? DRAWER_WIDTH 
          : open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          position: "fixed",
          width: variant === "temporary" 
            ? DRAWER_WIDTH 
            : open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(25, 118, 210, 0.12)",
          top: 0,
          height: '100%',
          zIndex: (theme) => theme.zIndex.drawer,
          transition: (theme) => theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default MemberSidebar;