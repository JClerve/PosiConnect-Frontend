import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link,
  Avatar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AuthLayout from "../components/AuthLayout";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Work,
  CheckCircle,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Signup = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const expertiseOptions = [
    "Heart Health",
    "Psychology", 
    "Diabetes",
    "Cholesterol",
    "Asthma",
    "Autoimmune",
  ];

  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "member",
    hourlyRate: "",
    expertise: [],
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const steps = ["Basic Info", "Role Selection", "Complete"];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError("All fields are required");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (form.role === "expert") {
        if (!form.hourlyRate || Number(form.hourlyRate) <= 0) {
          setError("Hourly rate is required for experts and must be greater than 0");
          return;
        }
        if (form.expertise.length === 0) {
          setError("Please select at least one area of expertise");
          return;
        }
      }

      const payload = { ...form };
      if (form.role === "expert") {
        payload.hourlyRate = Number(form.hourlyRate);
        payload.expertise = form.expertise;
      }

  await api.post("/auth/signup", payload);
  // Registration successful, please log in
  navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data.message || "Error signing up");
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <TextField
                name="firstName"
                autoComplete="given-name"
                label="First Name"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                name="lastName"
                autoComplete="family-name"
                label="Last Name"
                fullWidth
                required
                value={form.lastName}
                onChange={handleChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
            <TextField
              name="email"
              autoComplete="email"
              label="Email Address"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControl fullWidth required variant="outlined">
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                sx={{ borderRadius: 2 }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
              Choose Your Role
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <Card
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  border: form.role === "member" ? 2 : 1,
                  borderColor: form.role === "member" ? "primary.main" : "grey.300",
                  "&:hover": { borderColor: "primary.main" },
                }}
                onClick={() => setForm({ ...form, role: "member" })}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <PersonAdd sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Member
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Looking for expert guidance and support
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  border: form.role === "expert" ? 2 : 1,
                  borderColor: form.role === "expert" ? "primary.main" : "grey.300",
                  "&:hover": { borderColor: "primary.main" },
                }}
                onClick={() => setForm({ ...form, role: "expert" })}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Work sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Expert
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Provide professional guidance and support
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {form.role === "expert" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
                <TextField
                  name="hourlyRate"
                  label="Hourly Rate ($)"
                  type="number"
                  fullWidth
                  required
                  value={form.hourlyRate}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1 } }}
                  helperText="Set your consulting rate per hour"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Select Your Areas of Expertise
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {expertiseOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        clickable
                        color={form.expertise.includes(option) ? "primary" : "default"}
                        variant={form.expertise.includes(option) ? "filled" : "outlined"}
                        onClick={() => {
                          const newExp = form.expertise.includes(option)
                            ? form.expertise.filter((item) => item !== option)
                            : [...form.expertise, option];
                          setForm({ ...form, expertise: newExp });
                        }}
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                </FormControl>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to Join PosiConnect!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Review your information and complete your registration
            </Typography>
            
            <Paper sx={{ p: 3, textAlign: "left", bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom>
                Registration Summary
              </Typography>
              <Typography><strong>Name:</strong> {form.firstName} {form.lastName}</Typography>
              <Typography><strong>Email:</strong> {form.email}</Typography>
              <Typography><strong>Role:</strong> {form.role === "expert" ? "Expert" : "Member"}</Typography>
              {form.role === "expert" && (
                <>
                  <Typography><strong>Hourly Rate:</strong> ${form.hourlyRate}/hour</Typography>
                  <Typography><strong>Expertise:</strong> {form.expertise.join(", ")}</Typography>
                </>
              )}
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <Container component="main" maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
              <LockOutlined sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Join PosiConnect
            </Typography>

            <Stepper activeStep={activeStep} sx={{ width: "100%", mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ textTransform: "none" }}
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 4,
                      background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    }}
                    disabled={
                      form.role === "expert" &&
                      (!form.hourlyRate || Number(form.hourlyRate) <= 0 || form.expertise.length === 0)
                    }
                  >
                    Create Account
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 4,
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AuthLayout>
  );
};

export default Signup;