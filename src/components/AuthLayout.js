import React from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

// This layout is specifically for authentication pages (Login, Signup, etc.)
// It includes the Header and Footer but not the sidebar
const AuthLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header showMenuButton={false} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          mt: 8, // Account for fixed header
          background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          pt: 4,
          pb: 4,
        }}
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default AuthLayout;
