import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText,
  IconButton,
  useTheme,
  Divider,
  Autocomplete,
} from "@mui/material";
import {
  Group,
  Add,
  Close,
  Edit,
  Delete,
  People,
  Tag as TagIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import api from "../utils/api";

const CATEGORIES = [
  "Health & Wellness",
  "Mental Health",
  "Fitness",
  "Nutrition",
  "Disease Management",
  "Chronic Conditions",
  "Lifestyle",
  "Recovery",
  "Support Group",
  "Other"
];

const SUGGESTED_TAGS = [
  "Anxiety", 
  "Depression", 
  "Stress",
  "Sleep",
  "Relationship",
  "Addiction Recovery",
  "PTSD",
  "Bipolar",
  "OCD",
  "Eating Disorders",
  "Self-Care",
  "Mindfulness",
  "Meditation",
  "Grief",
  "Trauma",
  "Parenting",
  "Work-Life Balance",
  "Burnout",
  "Anger Management",
  "Social Anxiety"
];

const ExpertCommunities = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Communities state
  const [myCommunities, setMyCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [communityError, setCommunityError] = useState(null);
  
  // Create Community form state
  const [createCommunityDialog, setCreateCommunityDialog] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: "",
    displayTitle: "",
    description: "",
    category: "",
    tags: [],
    rules: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Dialog states
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdCommunity, setCreatedCommunity] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState(null);

    useEffect(() => {
      // Load profile then communities
      const loadData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/login");
            return;
          }
          // Fetch user profile
          const profileRes = await api.get("/user/me", { headers: { Authorization: `Bearer ${token}` } });
          if (profileRes.data.role !== "expert") {
            navigate("/communities");
            return;
          }
          setUser(profileRes.data);
          setLoading(false);
          
          // Fetch member communities
          setLoadingCommunities(true);
          setCommunityError(null);
          
          // Use two separate API calls to ensure we get all communities properly
          // First, get all communities where user is a member
          const commRes = await api.get("/communities/member", { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          
          // Populate members properly if they are missing
          let joined = commRes.data.joinedCommunities || [];
          
          // For each community where this expert is the creator, ensure it's properly populated
          const expertId = profileRes.data._id;
          const created = joined.filter(c => {
            // Check if creator is populated or just an ID
            if (typeof c.creator === 'string') {
              return c.creator === expertId;
            } else {
              return c.creator._id === expertId;
            }
          });
          
          // If no communities were found, make another check to see if there's an issue with population
          if (created.length === 0) {
            // Make a direct call to get all communities and check manually
            const allCommsRes = await api.get("/communities", { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            
            const expertCreatedComms = allCommsRes.data.filter(c => {
              if (typeof c.creator === 'string') {
                return c.creator === expertId;
              } else {
                return c.creator._id === expertId;
              }
            });
            
            if (expertCreatedComms.length > 0) {
              setMyCommunities(expertCreatedComms);
            } else {
              setMyCommunities(created);
            }
          } else {
            setMyCommunities(created);
          }
          
          setLoadingCommunities(false);
        } catch (err) {
          console.error("Error loading data:", err);
          setError("Failed to load communities or profile.");
          setLoading(false);
          setLoadingCommunities(false);
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 3000);
        }
      };
      loadData();
    }, [navigate]);
  
  // Community form handlers
  const handleOpenCreateCommunityDialog = () => setCreateCommunityDialog(true);
  const handleCloseCreateCommunityDialog = () => {
    setCreateCommunityDialog(false);
    // Reset form
    setCommunityForm({ name: "", displayTitle: "", description: "", category: "", tags: [], rules: "" });
    setFormErrors({});
  };
  
  const handleCommunityFormChange = (e) => {
    const { name, value } = e.target;
    setCommunityForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Tag management now handled by Autocomplete component
  
  const validateForm = () => {
    const errors = {};
    
    if (!communityForm.name.trim()) {
      errors.name = "Community name is required";
    } else if (communityForm.name.length > 100) {
      errors.name = "Name cannot exceed 100 characters";
    }
    
    if (!communityForm.displayTitle.trim()) {
      errors.displayTitle = "Display title is required";
    } else if (communityForm.displayTitle.length > 100) {
      errors.displayTitle = "Display title cannot exceed 100 characters";
    }
    
    if (!communityForm.description.trim()) {
      errors.description = "Description is required";
    } else if (communityForm.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }
    
    if (!communityForm.category) {
      errors.category = "Category is required";
    }
    
    if (communityForm.rules.length > 2000) {
      errors.rules = "Rules cannot exceed 2000 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateCommunity = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await api.post("/communities", communityForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCreatedCommunity(res.data);
      setSubmitting(false);
      setCreateCommunityDialog(false);
      setSuccessDialog(true);
      
      // Add to my communities list
      setMyCommunities(prev => [res.data, ...prev]);
      
      // Reset form
      setCommunityForm({
        name: "",
        displayTitle: "",
        description: "",
        category: "",
        tags: [],
        rules: ""
      });
      
    } catch (err) {
      setSubmitting(false);
      console.error("Create community error:", err);
      
      // Handle validation errors from server
      if (err.response && err.response.data && err.response.data.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          serverErrors[error.param] = error.msg;
        });
        setFormErrors(serverErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to create community. Please try again.");
      }
    }
  };
  
  // Handle viewing community details
  const handleViewDetails = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await api.get(`/communities/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSelectedCommunity(response.data);
      setDetailsDialog(true);
    } catch (err) {
      console.error("Get community details error:", err);
      alert("Failed to load community details. Please try again.");
    }
  };
  
  const handleCloseDetailsDialog = () => {
    setDetailsDialog(false);
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };
  
  // Handle deleting a community
  const handleOpenDeleteDialog = (community) => {
    setCommunityToDelete(community);
    setDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
    setCommunityToDelete(null);
  };
  
  const handleDeleteCommunity = async () => {
    try {
      if (!communityToDelete) return;
      
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      await api.delete(`/communities/${communityToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from communities list
      setMyCommunities(prev => prev.filter(c => c._id !== communityToDelete._id));
      setDeleteDialog(false);
      setCommunityToDelete(null);
      
    } catch (err) {
      console.error("Delete community error:", err);
      alert("Failed to delete community. Please try again.");
    }
  };

  const renderCommunityCard = (community) => (
    <Grid item xs={12} md={6} lg={4} key={community._id}>
      <Card sx={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}>
        <Box sx={{ 
          p: 2, 
          pb: 1,
          borderBottom: `4px solid ${theme.palette.primary.main}`
        }}>
          <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 600 }}>
            {community.displayTitle}
          </Typography>
        </Box>
        <CardContent sx={{ flexGrow: 1, pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {community.description}
          </Typography>
        </CardContent>
        <Box sx={{ p: 2, pt: 0 }}>
          <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
            {community.members?.length || 0} member{community.members?.length !== 1 ? 's' : ''}
          </Typography>
          {community.tags && community.tags.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {community.tags.slice(0, 2).map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
              {community.tags.length > 2 && (
                <Chip 
                  label={`+${community.tags.length - 2} more`} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              sx={{ textTransform: "none", borderRadius: 1 }}
              onClick={() => handleViewDetails(community._id)}
            >
              View Details
            </Button>
            <Button
              color="error"
              variant="outlined"
              size="small"
              sx={{ textTransform: "none", borderRadius: 1, minWidth: 'unset' }}
              onClick={() => handleOpenDeleteDialog(community)}
            >
              <Delete fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <LayoutWrapper>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Container maxWidth="xl">
          {/* Page Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Group sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    Expert Communities
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Create and manage communities for your members
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Add />}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                }}
                onClick={handleOpenCreateCommunityDialog}
              >
                Create Community
              </Button>
            </Box>
          </Paper>

          {/* My Communities */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                My Created Communities
              </Typography>
            </Box>
            
            {loadingCommunities ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            ) : communityError ? (
              <Alert severity="error" sx={{ mt: 3 }}>
                {communityError}
              </Alert>
            ) : myCommunities.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, backgroundColor: '#f9f9f9' }}>
                <Group sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  You haven't created any communities yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Create your first community to start connecting with members
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleOpenCreateCommunityDialog}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                  startIcon={<Add />}
                >
                  Create Community
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {myCommunities.map(community => renderCommunityCard(community))}
              </Grid>
            )}
          </Paper>

          {/* Create Community Dialog */}
          <Dialog 
            open={createCommunityDialog} 
            onClose={handleCloseCreateCommunityDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                overflow: 'hidden'
              }
            }}
          >
            <Box sx={{
              p: 3,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
            }}>
              <DialogTitle sx={{ p: 0 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  Create New Community
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseCreateCommunityDialog}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white'
                  }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                Create a supportive space for members with similar interests and goals
              </Typography>
            </Box>
            <DialogContent sx={{ p: 3, pt: 4 }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderRadius: 2,
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}>
                <Group sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Typography variant="body2" color="text.secondary">
                  Communities are spaces where members can connect, share experiences, and support each other. 
                  Fill out the form below to create your new community.
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                {/* Community Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="name"
                    label="Community Name"
                    value={communityForm.name}
                    onChange={handleCommunityFormChange}
                    fullWidth
                    variant="outlined"
                    helperText={formErrors.name || "Unique identifier for the community (no spaces)"}
                    error={Boolean(formErrors.name)}
                    disabled={submitting}
                    required
                    InputProps={{
                      sx: { borderRadius: 1.5 }
                    }}
                  />
                </Grid>
                
                {/* Display Title */}
                <Grid item xs={12} md={6}>
                  <TextField
                    name="displayTitle"
                    label="Display Title"
                    value={communityForm.displayTitle}
                    onChange={handleCommunityFormChange}
                    fullWidth
                    variant="outlined"
                    helperText={formErrors.displayTitle || "Public title shown to members"}
                    error={Boolean(formErrors.displayTitle)}
                    disabled={submitting}
                    required
                    InputProps={{
                      sx: { borderRadius: 1.5 }
                    }}
                  />
                </Grid>
                
                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    value={communityForm.description}
                    onChange={handleCommunityFormChange}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    helperText={formErrors.description || `${communityForm.description.length}/1000 characters`}
                    error={Boolean(formErrors.description)}
                    disabled={submitting}
                    required
                    InputProps={{
                      sx: { borderRadius: 1.5 }
                    }}
                    placeholder="Describe what your community is about, who it's for, and what members can expect"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 1, color: 'primary.main' }}>
                    Classification & Tags
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                {/* Category */}
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    variant="outlined" 
                    error={Boolean(formErrors.category)}
                    disabled={submitting}
                    required
                  >
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={communityForm.category}
                      onChange={handleCommunityFormChange}
                      label="Category"
                      sx={{ borderRadius: 1.5 }}
                    >
                      {CATEGORIES.map(category => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.category && (
                      <FormHelperText error>{formErrors.category}</FormHelperText>
                    )}
                    {!formErrors.category && (
                      <FormHelperText>Select the main category that best describes your community</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Tags */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" disabled={submitting}>
                    <Autocomplete
                      multiple
                      freeSolo
                      value={communityForm.tags}
                      onChange={(event, newValue) => {
                        setCommunityForm(prev => ({
                          ...prev,
                          tags: newValue
                        }));
                      }}
                      options={SUGGESTED_TAGS}
                      // Use default tag rendering
                      // renderTags removed to avoid key spread warning
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Select or add tags"
                          helperText="Select from suggestions or type and press enter to add custom tags"
                          variant="outlined"
                        />
                      )}
                      disabled={submitting}
                    />
                  </FormControl>
                  
                  {/* Suggested tags */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TagIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                      Suggested Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {SUGGESTED_TAGS.slice(0, 8).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onClick={() => {
                            if (!communityForm.tags.includes(tag)) {
                              setCommunityForm(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag]
                              }));
                            }
                          }}
                          disabled={communityForm.tags.includes(tag) || submitting}
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.15)' },
                            cursor: communityForm.tags.includes(tag) ? 'default' : 'pointer'
                          }}
                        />
                      ))}
                      {SUGGESTED_TAGS.length > 8 && (
                        <Chip
                          label="..."
                          size="small"
                          variant="outlined"
                          sx={{ cursor: 'default' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, mb: 1, color: 'primary.main' }}>
                    Community Guidelines
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                {/* Rules */}
                <Grid item xs={12}>
                  <TextField
                    name="rules"
                    label="Community Rules"
                    value={communityForm.rules}
                    onChange={handleCommunityFormChange}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    helperText={formErrors.rules || `${communityForm.rules.length}/2000 characters (optional)`}
                    error={Boolean(formErrors.rules)}
                    disabled={submitting}
                    InputProps={{
                      sx: { borderRadius: 1.5 }
                    }}
                    placeholder="Specify community guidelines and expectations for members (e.g., be respectful, maintain confidentiality, no promotional content)"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Button 
                onClick={handleCloseCreateCommunityDialog}
                disabled={submitting}
                variant="outlined"
                sx={{ borderRadius: 1.5, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateCommunity}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <Group />}
                sx={{ borderRadius: 1.5, px: 4 }}
              >
                {submitting ? "Creating..." : "Create Community"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success Dialog */}
          <Dialog
            open={successDialog}
            onClose={handleCloseSuccessDialog}
            aria-labelledby="success-dialog-title"
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxWidth: '400px'
              }
            }}
          >
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'success.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                mt: 2
              }}>
                <Group sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
              <DialogTitle id="success-dialog-title" sx={{ pb: 0 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                  Community Created!
                </Typography>
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mt: 1 }}>
                  Your community "{createdCommunity?.displayTitle}" has been created successfully! Members can now join and engage with your community.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 1 }}>
                <Button 
                  onClick={handleCloseSuccessDialog} 
                  color="primary" 
                  variant="contained"
                  sx={{ borderRadius: 1.5, px: 4 }}
                  autoFocus
                >
                  Done
                </Button>
              </DialogActions>
            </Box>
          </Dialog>
          
          {/* Community Details Dialog */}
          <Dialog
            open={detailsDialog}
            onClose={handleCloseDetailsDialog}
            maxWidth="md"
            fullWidth
            scroll="paper"
            aria-labelledby="community-details-dialog-title"
          >
            {selectedCommunity && (
              <>
                <Box
                  sx={{
                    p: 3,
                    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                    color: "white",
                  }}
                >
                  <DialogTitle id="community-details-dialog-title" sx={{ p: 0 }}>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                      {selectedCommunity.displayTitle}
                    </Typography>
                  </DialogTitle>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={selectedCommunity.category} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }} 
                    />
                    <Chip 
                      label={`${selectedCommunity.members?.length || 0} member${selectedCommunity.members?.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                      }} 
                    />
                  </Box>
                </Box>
                
                <DialogContent dividers sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCommunity.description}
                  </Typography>
                  
                  {selectedCommunity.tags && selectedCommunity.tags.length > 0 && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>Tags</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {selectedCommunity.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </>
                  )}
                  
                  {selectedCommunity.rules && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>Community Rules</Typography>
                      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                        {selectedCommunity.rules}
                      </Typography>
                    </>
                  )}
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>Members</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedCommunity.members?.map((member) => (
                      <Box key={member._id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ width: 32, height: 32, mr: 1 }}
                          alt={`${member.firstName} ${member.lastName}`}
                          src={member.profilePicture || ""}
                        >
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member._id === selectedCommunity.creator._id ? "Creator" : member.role === "expert" ? "Expert" : "Member"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </DialogContent>
                
                <DialogActions sx={{ p: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => {
                      handleCloseDetailsDialog();
                      handleOpenDeleteDialog(selectedCommunity);
                    }}
                  >
                    Delete Community
                  </Button>
                  <Button onClick={handleCloseDetailsDialog} color="primary" autoFocus>
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">
              Delete Community?
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the community "{communityToDelete?.displayTitle}"? 
                This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>
                Cancel
              </Button>
              <Button onClick={handleDeleteCommunity} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LayoutWrapper>
  );
};

export default ExpertCommunities;
