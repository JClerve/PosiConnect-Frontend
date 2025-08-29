import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import MemberSidebar from "./Member.Sidebar";
import ExpertSidebar from "./Expert.Sidebar";
import api from "../utils/api";

const LayoutWrapper = ({ children, requireAuth = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (requireAuth) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const res = await api.get("/user/me");
            setUser(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [requireAuth]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading && requireAuth) {
    return null; // Or a loading component
  }

  const isExpert = user?.role === "expert";
  const showSidebar = requireAuth && user;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Header 
        onMenuToggle={handleSidebarToggle} 
        showMenuButton={showSidebar} 
      />
      
      {showSidebar && (
        <>
          {isExpert ? (
            <ExpertSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              variant={isMobile ? "temporary" : "permanent"}
            />
          ) : (
            <MemberSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              variant={isMobile ? "temporary" : "permanent"}
            />
          )}
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          mt: 8, // Account for fixed header
          ml: 0, // No margin
          width: "100%", // Full width
          padding: 0, // Remove padding to prevent overflow
          position: "relative", // Make sure it positions relative to its container
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ flex: 1, padding: 3 }}> {/* Move padding here to not affect footer */}
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default LayoutWrapper;