import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Paper,
  Alert,
  Chip,
  Divider,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
} from "@mui/material";
import {
  Send,
  Close,
  Add,
  Group,
  Edit,
  Article,
  WarningAmber,
  VisibilityOff,
  LocalOffer,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const flairOptions = ["Question", "Vent", "Success Story", "Resource"];

const flairColors = {
  "Question": "info",
  "Vent": "warning", 
  "Success Story": "success",
  "Resource": "secondary"
};

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const initialCommunityId = location.state?.communityId || "";
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    communityId: initialCommunityId,
    title: "",
    content: "",
    contentWarning: false,
    contentWarningText: "",
    anonymous: false,
    flair: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await api.get("/communities/member");
        setCommunities(res.data.joinedCommunities || []);
      } catch (err) {
        console.error("Error fetching member communities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!form.communityId) newErrors.communityId = "Community is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (form.title.length > 150) newErrors.title = "Title cannot exceed 150 characters";
    if (form.contentWarning && !form.contentWarningText.trim()) {
      newErrors.contentWarningText = "Content warning text is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/communities/${form.communityId}/posts`, {
        title: form.title,
        content: form.content,
        contentWarning: form.contentWarning,
        contentWarningText: form.contentWarningText,
        anonymous: form.anonymous,
        flair: form.flair,
        media: [],
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating post:", err);
      setErrors({ submit: err.response?.data?.message || "Failed to create post" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading communities...
            </Typography>
          </Box>
        </Container>
      </LayoutWrapper>
    );
  }

  const titleLength = form.title.length;
  const titleProgress = (titleLength / 150) * 100;

  return (
    <LayoutWrapper>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Add sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Create New Post
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share your thoughts, questions, or experiences with the community
          </Typography>
        </Box>

        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader 
            title="Post Details"
            sx={{ 
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '& .MuiCardHeader-title': {
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Community Selection */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Group sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Select Community
                  </Typography>
                </Box>
                <FormControl fullWidth error={!!errors.communityId}>
                  <InputLabel id="community-label">Choose a community</InputLabel>
                  <Select
                    labelId="community-label"
                    name="communityId"
                    value={form.communityId}
                    label="Choose a community"
                    onChange={handleChange}
                    sx={{ borderRadius: 2 }}
                  >
                    {communities.map((comm) => (
                      <MenuItem key={comm._id} value={comm._id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {comm.displayTitle}
                          </Typography>
                          {comm.description && (
                            <Typography variant="caption" color="text.secondary">
                              {comm.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.communityId && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.communityId}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Title Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Edit sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Post Title
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="What's your post about?"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  inputProps={{ maxLength: 150 }}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={titleProgress}
                    sx={{ 
                      flex: 1, 
                      mr: 2, 
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: titleProgress > 90 ? 'error.main' : titleProgress > 70 ? 'warning.main' : 'primary.main'
                      }
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    color={titleProgress > 90 ? 'error.main' : 'text.secondary'}
                  >
                    {titleLength}/150
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Content Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Article sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Post Content
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Share your thoughts... (optional)"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Options Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Post Options
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Content Warning */}
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningAmber sx={{ mr: 1, color: theme.palette.warning.main }} />
                      <FormControlLabel
                        control={
                          <Switch
                            name="contentWarning"
                            checked={form.contentWarning}
                            onChange={handleChange}
                          />
                        }
                        label={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Add Content Warning
                          </Typography>
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add a warning if your post contains sensitive content
                    </Typography>
                    {form.contentWarning && (
                      <TextField
                        fullWidth
                        label="Content Warning Description"
                        name="contentWarningText"
                        value={form.contentWarningText}
                        onChange={handleChange}
                        error={!!errors.contentWarningText}
                        helperText={errors.contentWarningText}
                        placeholder="e.g., Contains discussion of mental health topics"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white'
                          }
                        }}
                      />
                    )}
                  </Paper>

                  {/* Anonymous Posting */}
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VisibilityOff sx={{ mr: 1, color: theme.palette.info.main }} />
                      <FormControlLabel
                        control={
                          <Switch
                            name="anonymous"
                            checked={form.anonymous}
                            onChange={handleChange}
                          />
                        }
                        label={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Post Anonymously
                          </Typography>
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Your name won't be shown with this post
                    </Typography>
                  </Paper>

                  {/* Flair Selection */}
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalOffer sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Add Flair (Optional)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Help categorize your post with a flair
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="flair-label">Select a flair</InputLabel>
                      <Select
                        labelId="flair-label"
                        name="flair"
                        value={form.flair}
                        label="Select a flair"
                        onChange={handleChange}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'white'
                        }}
                      >
                        <MenuItem value="">
                          <em>No Flair</em>
                        </MenuItem>
                        {flairOptions.map((f) => (
                          <MenuItem key={f} value={f}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label={f} 
                                size="small" 
                                color={flairColors[f]} 
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                              {f}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {form.flair && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Preview: 
                        </Typography>
                        <Chip 
                          label={form.flair} 
                          size="small" 
                          color={flairColors[form.flair]} 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>

              {/* Error Display */}
              {errors.submit && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}

              {/* Action Buttons */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2,
                  pt: 3,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  startIcon={<Close />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    minWidth: 120
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : 'Create Post'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Paper sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'info.dark' }}>
            💡 Posting Tips
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'info.dark' }}>
              Choose a clear, descriptive title that summarizes your post
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'info.dark' }}>
              Use appropriate flairs to help others find and understand your content
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: 'info.dark' }}>
              Add content warnings for sensitive topics to create a safe space
            </Typography>
            <Typography component="li" variant="body2" color="info.dark">
              Be respectful and follow community guidelines
            </Typography>
          </Box>
        </Paper>
      </Container>
    </LayoutWrapper>
  );
};

export default CreatePost;