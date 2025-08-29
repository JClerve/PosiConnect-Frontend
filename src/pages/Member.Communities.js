//pages/Member.Communities.js

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Tab,
  Tabs,
  useTheme,
  TextField,
} from "@mui/material";
import {
  Group,
  GroupAdd,
  Add,
  Search,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import api from "../utils/api";

const Communities = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Communities state
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [communityError, setCommunityError] = useState(null);
  
  // Dialog states
  const [successDialog, setSuccessDialog] = useState(false);
  const [joinedCommunityName, setJoinedCommunityName] = useState("");
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [joinDialog, setJoinDialog] = useState(false);
  const [joinError, setJoinError] = useState(""); // Add state for join dialog error message
  const [joinCommunityData, setJoinCommunityData] = useState({
    communityId: '',
    communityName: '',
    reason: '',
    nic: ''
  });
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveError, setLeaveError] = useState(""); // Add state for leave dialog error message
  const [leaveCommunityData, setLeaveCommunityData] = useState({
    communityId: '',
    communityName: '',
    reason: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // The token is already added by the axios interceptor, so no need to add it again
        const res = await api.get("/user/me");
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingCommunities(true);
        setCommunityError(null);
        
        const res = await api.get("/communities/member", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setJoinedCommunities(res.data.joinedCommunities);
        setAvailableCommunities(res.data.availableCommunities);
        setLoadingCommunities(false);
      } catch (err) {
        console.error("Communities fetch error:", err);
        setCommunityError("Failed to load communities");
        setLoadingCommunities(false);
      }
    };

    fetchProfile();
    fetchCommunities();
  }, [navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Open join dialog
  const openJoinDialog = (communityId, communityName) => {
    setJoinCommunityData({
      communityId,
      communityName,
      reason: '',
      nic: ''
    });
    setJoinError(""); // Reset error message when opening dialog
    setJoinDialog(true);
  };
  
  const handleJoinDialogClose = () => {
    setJoinDialog(false);
  };
  
  const handleJoinInputChange = (e) => {
    const { name, value } = e.target;
    setJoinCommunityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit join request
// Submit join request
  const submitJoinRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const { communityId, reason, nic } = joinCommunityData;
      
      if (!reason.trim()) {
        alert("Please provide a reason for joining the community");
        return;
      }
      
      if (!nic.trim()) {
        alert("Please provide your NIC number");
        return;
      }
      
      // Validate NIC format (Sri Lankan NIC - old or new format)
      const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
      if (!nicRegex.test(nic)) {
        alert("Please enter a valid NIC number (9 digits with V/X or 12 digits)");
        return;
      }
      
      // Use the api instance which already handles authorization
      await api.post(`/communities/${communityId}/join`, { reason, nic });
      
      // Close join dialog
      setJoinDialog(false);
      
      // Refresh communities after successful request
      const res = await api.get("/communities/member");
      setJoinedCommunities(res.data.joinedCommunities);
      setAvailableCommunities(res.data.availableCommunities);
      
      // Set joined community name for success dialog
      setJoinedCommunityName(joinCommunityData.communityName);
      
      // Show success dialog
      setSuccessDialog(true);
    } catch (err) {
      console.error("Join community request error:", err);
      
      // Get detailed error message
      const errorMessage = err.response?.data?.message || "Failed to submit join request. Please try again.";
      console.log("Error response data:", err.response?.data);
      
      // Set error message in the dialog instead of showing alert
      setJoinError(errorMessage);
    }
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };
  
  // Handle viewing community details
  const handleViewDetails = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // The token is already added by the axios interceptor, so no need to add it again
      const response = await api.get(`/communities/${communityId}`);
      
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
  
  // Navigate to Create Post page with selected community
  const handleCreatePost = () => {
    navigate('/create-post', { state: { communityId: selectedCommunity._id } });
    setDetailsDialog(false);
  };
  
  // Open leave dialog
  const openLeaveDialog = (communityId, communityName) => {
    setLeaveCommunityData({
      communityId,
      communityName,
      reason: '',
    });
    setLeaveError(""); // Reset error message when opening dialog
    setLeaveDialog(true);
  };
  
  const handleLeaveDialogClose = () => {
    setLeaveDialog(false);
  };
  
  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveCommunityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit leave request
  const submitLeaveRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const { communityId, reason } = leaveCommunityData;
      
      if (!reason.trim()) {
        setLeaveError("Please provide a reason for leaving the community");
        return;
      }
      
      // The token is already added by the axios interceptor, so no need to add it again
      await api.post(`/communities/${communityId}/leave`, { reason });
      
      // Close leave dialog
      setLeaveDialog(false);
      setDetailsDialog(false);
      
      // Set joined community name for success dialog
      setJoinedCommunityName(leaveCommunityData.communityName);
      
      // Show success dialog
      setSuccessDialog(true);
    } catch (err) {
      console.error("Leave community request error:", err);
      
      // Get detailed error message
      const errorMessage = err.response?.data?.message || "Failed to submit leave request. Please try again.";
      console.log("Error response data:", err.response?.data);
      
      // Set error message in the dialog instead of showing alert
      setLeaveError(errorMessage);
    }
  };

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

  const renderCommunityCard = (community, isJoined) => (
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
          borderBottom: `4px solid ${isJoined ? theme.palette.primary.main : theme.palette.primary.light}`
        }}>
          <Typography variant="h6" component="div" noWrap sx={{ fontWeight: 600 }}>
            {community.displayTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Avatar 
              sx={{ width: 24, height: 24, mr: 1 }}
              alt={`${community.creator?.firstName} ${community.creator?.lastName}`}
              src={community.creator?.profilePicture || ""}
            >
              {community.creator?.firstName?.[0]}{community.creator?.lastName?.[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Created by {community.creator?.firstName} {community.creator?.lastName}
            </Typography>
          </Box>
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
          {isJoined ? (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mt: 2, textTransform: "none", borderRadius: 1 }}
              onClick={() => handleViewDetails(community._id)}
            >
              View Details
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              size="small"
              sx={{ mt: 2, textTransform: "none", borderRadius: 1 }}
              onClick={() => openJoinDialog(community._id, community.displayTitle)}
              startIcon={<Add />}
            >
              Join
            </Button>
          )}
        </Box>
      </Card>
    </Grid>
  );

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
                    Communities
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Join communities to connect with experts and other members
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Communities Tabs */}
          <Paper sx={{ borderRadius: 3, mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTabs-indicator': { height: 3 }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Group sx={{ mr: 1 }} />
                    Your Communities ({joinedCommunities.length})
                  </Box>
                } 
                sx={{ textTransform: 'none', py: 2 }}
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupAdd sx={{ mr: 1 }} />
                    Available Communities ({availableCommunities.length})
                  </Box>
                } 
                sx={{ textTransform: 'none', py: 2 }}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {loadingCommunities ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : communityError ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              {communityError}
            </Alert>
          ) : (
            <div>
              {/* Your Communities Tab */}
              <div role="tabpanel" hidden={activeTab !== 0}>
                {joinedCommunities.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <GroupAdd sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      You haven't joined any communities yet
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Join a community to connect with experts and other members with similar interests
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab(1)}
                      sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
                    >
                      Explore Available Communities
                    </Button>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {joinedCommunities.map(community => renderCommunityCard(community, true))}
                  </Grid>
                )}
              </div>

              {/* Available Communities Tab */}
              <div role="tabpanel" hidden={activeTab !== 1}>
                {availableCommunities.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Group sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      No new communities to join
                    </Typography>
                    <Typography color="text.secondary">
                      You've already joined all available communities!
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {availableCommunities.map(community => renderCommunityCard(community, false))}
                  </Grid>
                )}
              </div>
            </div>
          )}

          {/* Success Dialog */}
          <Dialog
            open={successDialog}
            onClose={handleCloseSuccessDialog}
            aria-labelledby="success-dialog-title"
          >
            <DialogTitle id="success-dialog-title">
              Successfully Joined Community
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                You have successfully joined the "{joinedCommunityName}" community!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
                Close
              </Button>
            </DialogActions>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar 
                      sx={{ width: 24, height: 24, mr: 1 }}
                      alt={`${selectedCommunity.creator?.firstName} ${selectedCommunity.creator?.lastName}`}
                      src={selectedCommunity.creator?.profilePicture || ""}
                    >
                      {selectedCommunity.creator?.firstName?.[0]}{selectedCommunity.creator?.lastName?.[0]}
                    </Avatar>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Created by {selectedCommunity.creator?.firstName} {selectedCommunity.creator?.lastName}
                    </Typography>
                  </Box>
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
                  {/* Create Post button */}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreatePost}
                  >
                    Create Post
                  </Button>
                  {selectedCommunity.creator._id !== user?._id && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => openLeaveDialog(selectedCommunity._id, selectedCommunity.displayTitle)}
                    >
                      Leave Community
                    </Button>
                  )}
                  <Button onClick={handleCloseDetailsDialog} color="primary" autoFocus>
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
          
          {/* Join Community Dialog */}
          <Dialog
            open={joinDialog}
            onClose={handleJoinDialogClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="join-dialog-title"
          >
            <DialogTitle id="join-dialog-title">
              Join {joinCommunityData.communityName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                To join this community, please provide the following information:
              </DialogContentText>
              
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="reason"
                  label="Reason for joining"
                  name="reason"
                  multiline
                  rows={3}
                  value={joinCommunityData.reason}
                  onChange={handleJoinInputChange}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nic"
                  label="NIC Number"
                  name="nic"
                  value={joinCommunityData.nic}
                  onChange={handleJoinInputChange}
                  helperText="Format: 9 digits with V/X or 12 digits"
                />
                
                {/* Error message display */}
                {joinError && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'white' }}>
                    <Typography variant="body2">{joinError}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleJoinDialogClose}>Cancel</Button>
              {!joinError ? (
                <Button 
                  onClick={submitJoinRequest} 
                  color="primary" 
                  variant="contained"
                >
                  Submit Request
                </Button>
              ) : (
                <Button 
                  onClick={handleJoinDialogClose} 
                  color="primary" 
                  variant="contained"
                >
                  Close
                </Button>
              )}
            </DialogActions>
          </Dialog>
          
          {/* Leave Community Dialog */}
          <Dialog
            open={leaveDialog}
            onClose={handleLeaveDialogClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="leave-dialog-title"
          >
            <DialogTitle id="leave-dialog-title">
              Leave {leaveCommunityData.communityName}
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                To leave this community, please provide a reason for leaving:
              </DialogContentText>
              
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="reason"
                  label="Reason for leaving"
                  name="reason"
                  multiline
                  rows={3}
                  value={leaveCommunityData.reason}
                  onChange={handleLeaveInputChange}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLeaveDialogClose}>Cancel</Button>
              <Button 
                onClick={submitLeaveRequest} 
                color="error" 
                variant="contained"
              >
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success Dialog */}
          <Dialog
            open={successDialog}
            onClose={handleCloseSuccessDialog}
            maxWidth="sm"
            fullWidth
            aria-labelledby="success-dialog-title"
          >
            <DialogTitle id="success-dialog-title" sx={{ bgcolor: 'success.light', color: 'white' }}>
              Request Submitted Successfully
            </DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Typography variant="body1" paragraph>
                  Your request {leaveDialog ? 'to leave' : 'to join'} <strong>{joinedCommunityName}</strong> has been submitted and is pending approval from the community expert.
                </Typography>
                <Typography variant="body1" paragraph>
                  You will receive an email notification when your request is approved or rejected.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseSuccessDialog} 
                color="primary" 
                variant="contained"
                autoFocus
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LayoutWrapper>
  );
};

export default Communities;
