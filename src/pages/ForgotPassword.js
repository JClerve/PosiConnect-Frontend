import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  Paper,
  InputAdornment,
  Link as MuiLink,
} from "@mui/material";
import {
  LockReset,
  Email,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import api from "../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!email) {
      setError("Email address is required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setOpenDialog(true);
    } catch (err) {
      setError(err.response?.data.message || "Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate('/login');
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
              Forgot Password?
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 4, textAlign: "center", maxWidth: 400 }}
            >
              Don't worry! Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {message && (
              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-message": { width: "100%" },
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
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                helperText="We'll send a password reset link to this email"
              />

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
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
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

      {/* Success Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 }
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Avatar
            sx={{
              bgcolor: "success.main",
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircle sx={{ fontSize: 32 }} />
          </Avatar>
          <DialogTitle sx={{ p: 0, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Check Your Email
            </Typography>
          </DialogTitle>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Didn't receive the email? Check your spam folder or try again with a different email address.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleDialogClose}
            variant="contained"
            size="large"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 4,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            }}
          >
            Back to Login
          </Button>
        </DialogActions>
      </Dialog>
    </AuthLayout>
  );
};

export default ForgotPassword;