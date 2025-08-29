import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  LinearProgress,
} from "@mui/material";
import {
  LockReset,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    return strength;
  };

  const getStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return { label: "", color: "transparent" };
    if (strength === 1) return { label: "Weak", color: "error.main" };
    if (strength === 2) return { label: "Fair", color: "warning.main" };
    if (strength === 3) return { label: "Good", color: "info.main" };
    return { label: "Strong", color: "success.main" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.patch(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setMessage("Password reset successful! Please log in with your new password.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Container component="main" maxWidth="sm">
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "success.main",
                width: 80,
                height: 80,
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: "success.main" }}>
              Password Reset Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been successfully reset. You will be redirected to the login page shortly to sign in with your new password.
            </Typography>
            <LinearProgress sx={{ mb: 3 }} />
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const strengthInfo = getStrengthLabel();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
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
              <LockReset sx={{ fontSize: 36 }} />
            </Avatar>
            
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 1,
                fontWeight: 700,
                textAlign: "center",
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Reset Password
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
              Enter your new password below
            </Typography>

            {message && (
              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                fullWidth
                required
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                helperText="Password must be at least 6 characters long"
              />

              {password && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2">Password Strength</Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: strengthInfo.color,
                        fontWeight: 600,
                      }}
                    >
                      {strengthInfo.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(getPasswordStrength() / 4) * 100}
                    sx={{ 
                      borderRadius: 1,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: strengthInfo.color,
                      }
                    }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                required
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!(confirmPassword && password !== confirmPassword)}
                helperText={
                  confirmPassword && password !== confirmPassword
                    ? "Passwords do not match"
                    : "Re-enter your new password"
                }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
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
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <ArrowBack sx={{ fontSize: 18 }} />
                  Back to Login
                </MuiLink>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;