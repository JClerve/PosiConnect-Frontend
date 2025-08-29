import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1565c0",
        color: "white",
        mt: "auto",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              PosiConnect
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Connecting you with mental health experts for a positive mindset
              and better well-being.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                sx={{ color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/about"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                About Us
              </Link>
              <Link
                href="/services"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Services
              </Link>
              <Link
                href="/experts"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Find Experts
              </Link>
              <Link
                href="/communities"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Communities
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="/help"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Contact Us
              </Link>
              <Link
                href="/privacy"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, "&:hover": { opacity: 1 } }}
              >
                Terms of Service
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  support@posiconnect.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  New York, NY 10001
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "rgba(255,255,255,0.2)" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            © 2025 PosiConnect. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Made with ❤️ for better mental health
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;