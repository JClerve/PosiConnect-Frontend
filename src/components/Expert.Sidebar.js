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
  Dashboard,
  AccessTime,
  Add,
  Event,
  Notifications,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  Schedule,
  History,
  Notes,
  PersonAdd,
  ExitToApp,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 65; // Width when collapsed, showing only icons

const ExpertSidebar = ({ open, onClose, variant = "temporary" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Auto-expand submenus if a related route is active
  const [bookingsOpen, setBookingsOpen] = React.useState(() => {
    const bookingsRoutes = ["/expert/bookings/upcoming", "/expert/bookings/past", "/expert/bookings/notes"];
    return bookingsRoutes.some(route => location.pathname.startsWith(route));
  });
  
  const [memberRequestsOpen, setMemberRequestsOpen] = React.useState(() => {
    const memberRequestsRoutes = ["/expert/member-requests/joins", "/expert/member-requests/exits", "/expert/member-requests/history"];
    return memberRequestsRoutes.some(route => location.pathname.startsWith(route));
  });
  
  // Auto-expand relevant submenu based on current location
  useEffect(() => {
    const bookingsRoutes = ["/expert/bookings/upcoming", "/expert/bookings/past", "/expert/bookings/notes"];
    if (bookingsRoutes.some(route => location.pathname.startsWith(route))) {
      setBookingsOpen(true);
    }
    
    const memberRequestsRoutes = ["/expert/member-requests/joins", "/expert/member-requests/exits", "/expert/member-requests/history"];
    if (memberRequestsRoutes.some(route => location.pathname.startsWith(route))) {
      setMemberRequestsOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      text: "Home / Feed",
      icon: <Home />,
      path: "/expert-dashboard",
    },
    {
      text: "Communities",
      icon: <Groups />,
      path: "/expert/communities",
      badge: "Manage",
    },
    {
      text: "Member Requests",
      icon: <Groups />,
      hasSubmenu: true,
      path: "/expert/member-requests", // Add a direct path for the main menu item
      submenu: [
        { text: "Pending Joins", icon: <PersonAdd />, path: "/expert/member-requests/joins", badge: "New" },
        { text: "Pending Exits", icon: <ExitToApp />, path: "/expert/member-requests/exits" },
        { text: "Member History", icon: <History />, path: "/expert/member-requests/history" },
      ],
    },
    {
      text: "My Dashboard",
      icon: <Dashboard />,
      path: "/expert/dashboard",
    },
    {
      text: "Availability",
      icon: <AccessTime />,
      path: "/expert/availability",
    },
    {
      text: "Create Session",
      icon: <Add />,
      path: "/expert/create-session",
    },
    {
      text: "Bookings",
      icon: <Event />,
      hasSubmenu: true,
      submenu: [
        { text: "Upcoming", icon: <Schedule />, path: "/expert/bookings/upcoming", badge: 4 },
        { text: "Past", icon: <History />, path: "/expert/bookings/past" },
        { text: "Notes", icon: <Notes />, path: "/expert/bookings/notes" },
      ],
    },
    {
      text: "Notifications",
      icon: <Notifications />,
      path: "/expert/notifications",
      badge: 7,
    },
    {
      text: "Profile",
      icon: <AccountCircle />,
      path: "/expert/profile",
    },
  ];

  const handleItemClick = (item) => {
    if (item.hasSubmenu) {
      if (item.text === "Bookings") {
        setBookingsOpen(!bookingsOpen);
      } else if (item.text === "Member Requests") {
        setMemberRequestsOpen(!memberRequestsOpen);
        // Also navigate to the main member requests page when clicking the menu
        if (item.path) {
          navigate(item.path);
          if (variant === "temporary") {
            onClose();
          }
        }
      }
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
    
    // Check for expert-dashboard as home page
    if (path === "/expert-dashboard" && location.pathname === "/") return true;
    
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
              Expert Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage your practice
            </Typography>
          </>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            EP
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
                  (item.text === "Bookings" && bookingsOpen) || (item.text === "Member Requests" && memberRequestsOpen) 
                    ? <ExpandLess /> 
                    : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.hasSubmenu && item.text === "Bookings" && (
              <Collapse in={bookingsOpen} timeout="auto" unmountOnExit>
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
                            bgcolor: isActive(submenuItem.path) ? "primary.main" : "primary.light",
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
                          {submenuItem.badge ? (
                            <Badge badgeContent={submenuItem.badge} color="error" size="small">
                              {submenuItem.icon}
                            </Badge>
                          ) : (
                            submenuItem.icon
                          )}
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

            {(index === 1 || index === 4) && <Divider sx={{ my: 1 }} />}
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

export default ExpertSidebar;