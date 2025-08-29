import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Grid,
  Link as MuiLink,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  LockOutlined,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;

      try {
        console.log("Fetching user profile after login");
        const profileRes = await api.get("/user/me");
        const userRole = profileRes.data.role;
        console.log("User role from profile:", userRole);
        
        if (userRole === "expert") {
          console.log("Navigating to expert dashboard");
          navigate("/expert-dashboard");
        } else {
          console.log("Navigating to member dashboard");
          navigate("/dashboard");
        }
      } catch (profileErr) {
        console.error("Error fetching profile after login:", profileErr);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              sx={{
                m: 1,
                bgcolor: "primary.main",
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              }}
            >
              <LockOutlined sx={{ fontSize: 36 }} />
            </Avatar>
            
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: 700,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to your PosiConnect account
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                inputProps={{
                  autoComplete: "email",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                inputProps={{
                  autoComplete: "current-password",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <MuiLink
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                  },
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              {/* <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography> */}
              {/* </Divider>

              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    py: 1.2,
                    borderColor: "rgba(25, 118, 210, 0.5)",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    py: 1.2,
                    borderColor: "rgba(25, 118, 210, 0.5)",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Facebook
                </Button>
              </Box> */}

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <MuiLink
                    component={RouterLink}
                    to="/signup"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Sign up here
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AuthLayout>
  );
};

export default Login;