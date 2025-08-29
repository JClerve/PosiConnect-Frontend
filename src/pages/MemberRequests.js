import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { format } from 'date-fns';
import LayoutWrapper from '../components/LayoutWrapper';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

const MemberRequests = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Set active tab based on URL parameter
  const [activeTab, setActiveTab] = useState(() => {
    console.log("URL tab parameter:", tab);
    if (tab === 'exits') return 1;
    if (tab === 'history') return 2;
    return 0; // Default to 'joins' tab
  });
  
  // Requests state
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [pendingExitRequests, setPendingExitRequests] = useState([]);
  const [memberHistory, setMemberHistory] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState(null);

  // Selected community state
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  
  // Response dialog state
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseData, setResponseData] = useState({
    requestId: '',
    requestType: '', // 'join' or 'exit'
    status: '', // 'approved' or 'rejected'
    memberName: '',
  });
  
  // Success dialog state
  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successAction, setSuccessAction] = useState(""); // 'approved' or 'rejected'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Fetching user profile...");
        const res = await api.get("/user/me");
        setUser(res.data);
        setLoading(false);
        
        // Fetch communities after user data is loaded
        fetchCommunities(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    const fetchCommunities = async (userData) => {
      try {
        console.log("Fetching expert communities...", userData);
        // Get all communities - will filter expert's created communities
        const res = await api.get("/communities");
        console.log("Communities fetch response:", res.data);
        
        // Filter only the communities where the user is the creator
        const expertCommunities = res.data.filter(community => {
          console.log("Comparing creator IDs:", community.creator._id, userData._id);
          // IDs might be objects so we should compare their string values
          return community.creator._id === userData._id;
        });
        
        console.log("Expert created communities:", expertCommunities);
        
        setCommunities(expertCommunities);
        if (expertCommunities.length > 0) {
          console.log("Setting selected community:", expertCommunities[0]._id);
          setSelectedCommunity(expertCommunities[0]._id);
          fetchRequestsForCommunity(expertCommunities[0]._id);
        } else {
          console.log("No communities found for expert");
          setLoadingRequests(false);
        }
      } catch (err) {
        console.error("Communities fetch error:", err);
        setRequestsError("Failed to load communities");
        setLoadingRequests(false);
      }
    };

    fetchProfile();
    // fetchCommunities() is now called from within fetchProfile
  }, [navigate]);

  const fetchRequestsForCommunity = async (communityId) => {
    try {
      if (!communityId) {
        console.log("No community ID provided");
        return;
      }

      setLoadingRequests(true);
      console.log("Fetching requests for community:", communityId);
      
      try {
        // Fetch pending join requests
        console.log("Fetching membership requests...");
        const joinRes = await api.get(`/communities/${communityId}/membership-requests`);
        console.log("Join requests response:", joinRes.data);
        setPendingJoinRequests(joinRes.data);
      } catch (joinErr) {
        console.error("Error fetching join requests:", joinErr);
        setPendingJoinRequests([]);
      }
      
      try {
        // Fetch pending exit requests
        console.log("Fetching exit requests...");
        const exitRes = await api.get(`/communities/${communityId}/exit-requests`);
        console.log("Exit requests response:", exitRes.data);
        setPendingExitRequests(exitRes.data);
      } catch (exitErr) {
        console.error("Error fetching exit requests:", exitErr);
        setPendingExitRequests([]);
      }
      
      try {
        // Fetch member history
        console.log("Fetching member history...");
        const historyRes = await api.get(`/communities/${communityId}/member-history`);
        console.log("Member history response:", historyRes.data);
        setMemberHistory(historyRes.data);
      } catch (historyErr) {
        console.error("Error fetching member history:", historyErr);
        setMemberHistory([]);
      }
      
      setLoadingRequests(false);
    } catch (err) {
      console.error("Request fetch error:", err);
      setRequestsError("Failed to load requests");
      setLoadingRequests(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Update URL based on selected tab
    let tabPath = 'joins';
    if (newValue === 1) tabPath = 'exits';
    if (newValue === 2) tabPath = 'history';
    
    navigate(`/expert/member-requests/${tabPath}`);
  };
  
  // Handle community change
  const handleCommunityChange = (communityId) => {
    setSelectedCommunity(communityId);
    fetchRequestsForCommunity(communityId);
  };
  
  // Open response dialog
  const openResponseDialog = (requestId, requestType, status, memberName) => {
    setResponseData({
      requestId,
      requestType,
      status,
      memberName
    });
    setResponseDialog(true);
  };
  
  const handleResponseDialogClose = () => {
    setResponseDialog(false);
  };
  
  // Handle request response (approve/reject)
  const handleRequestResponse = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const { requestId, requestType, status, memberName } = responseData;
      console.log("Handling request response:", { requestId, requestType, status, communityId: selectedCommunity });
      
      if (requestType === 'join') {
        console.log(`Sending ${status} for join request:`, requestId);
        await api.post(`/communities/${selectedCommunity}/membership-requests/${requestId}`, 
          { status }
        );
      } else if (requestType === 'exit') {
        console.log(`Sending ${status} for exit request:`, requestId);
        await api.post(`/communities/${selectedCommunity}/exit-requests/${requestId}`, 
          { status }
        );
      }
      
      // Close response dialog
      setResponseDialog(false);
      
      // Refresh requests
      fetchRequestsForCommunity(selectedCommunity);
      
      // Set success message
      const requestTypeText = requestType === 'join' ? 'join' : 'leave';
      const actionText = status === 'approved' ? 'approved' : 'rejected';
      setSuccessMessage(`${memberName}'s request to ${requestTypeText} has been ${actionText}.`);
      setSuccessAction(status);
      
      // Show success dialog
      setSuccessDialog(true);
    } catch (err) {
      console.error("Request response error:", err);
      alert(err.response?.data?.message || `Failed to ${responseData.status} request`);
    }
  };
  
  // Close success dialog
  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <LayoutWrapper>
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom>
            Member Requests
          </Typography>
          
          {/* Community Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Community
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {communities.map((community) => (
                <Chip
                  key={community._id}
                  label={community.displayTitle}
                  onClick={() => handleCommunityChange(community._id)}
                  color={selectedCommunity === community._id ? "primary" : "default"}
                  variant={selectedCommunity === community._id ? "filled" : "outlined"}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
          
          {/* Tabs */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="request tabs">
                <Tab label="Pending Join Requests" />
                <Tab label="Pending Exit Requests" />
                <Tab label="Member History" />
              </Tabs>
            </Box>
            
            {/* Tab Content */}
            {loadingRequests ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : requestsError ? (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography color="error">{requestsError}</Typography>
              </Paper>
            ) : (
              <>
                {/* Join Requests Tab */}
                <Box role="tabpanel" hidden={activeTab !== 0}>
                  {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                      {console.log("Rendering join requests:", pendingJoinRequests)}
                      {pendingJoinRequests.length === 0 ? (
                        <Typography>No pending join requests</Typography>
                      ) : (
                        <Grid container spacing={3}>
                          {pendingJoinRequests.map((request) => (
                            <Grid item xs={12} md={6} key={request._id}>
                              <Card elevation={3}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                      src={request.user.profilePicture} 
                                      alt={`${request.user.firstName} ${request.user.lastName}`}
                                    />
                                    <Box sx={{ ml: 2 }}>
                                      <Typography variant="h6">
                                        {request.user.firstName} {request.user.lastName}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        {request.user.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Divider sx={{ my: 2 }} />
                                  
                                  <Typography variant="body2" gutterBottom>
                                    <strong>NIC:</strong> {request.nic}
                                  </Typography>
                                  
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Request Date:</strong> {format(new Date(request.requestDate), 'PPpp')}
                                  </Typography>
                                  
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Reason for joining:</strong>
                                  </Typography>
                                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="body2">{request.reason}</Typography>
                                  </Paper>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button 
                                      color="error" 
                                      variant="outlined" 
                                      sx={{ mr: 1 }}
                                      onClick={() => openResponseDialog(
                                        request._id,
                                        'join',
                                        'rejected',
                                        `${request.user.firstName} ${request.user.lastName}`
                                      )}
                                    >
                                      Reject
                                    </Button>
                                    <Button 
                                      color="primary" 
                                      variant="contained"
                                      onClick={() => openResponseDialog(
                                        request._id,
                                        'join',
                                        'approved',
                                        `${request.user.firstName} ${request.user.lastName}`
                                      )}
                                    >
                                      Approve
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  )}
                </Box>
                
                {/* Exit Requests Tab */}
                <Box role="tabpanel" hidden={activeTab !== 1}>
                  {activeTab === 1 && (
                    <Box sx={{ p: 3 }}>
                      {pendingExitRequests.length === 0 ? (
                        <Typography>No pending exit requests</Typography>
                      ) : (
                        <Grid container spacing={3}>
                          {pendingExitRequests.map((request) => (
                            <Grid item xs={12} md={6} key={request._id}>
                              <Card elevation={3}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar 
                                      src={request.user.profilePicture} 
                                      alt={`${request.user.firstName} ${request.user.lastName}`}
                                    />
                                    <Box sx={{ ml: 2 }}>
                                      <Typography variant="h6">
                                        {request.user.firstName} {request.user.lastName}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        {request.user.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <Divider sx={{ my: 2 }} />
                                  
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Request Date:</strong> {format(new Date(request.requestDate), 'PPpp')}
                                  </Typography>
                                  
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Reason for leaving:</strong>
                                  </Typography>
                                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="body2">{request.reason}</Typography>
                                  </Paper>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button 
                                      color="error" 
                                      variant="outlined" 
                                      sx={{ mr: 1 }}
                                      onClick={() => openResponseDialog(
                                        request._id,
                                        'exit',
                                        'rejected',
                                        `${request.user.firstName} ${request.user.lastName}`
                                      )}
                                    >
                                      Reject
                                    </Button>
                                    <Button 
                                      color="primary" 
                                      variant="contained"
                                      onClick={() => openResponseDialog(
                                        request._id,
                                        'exit',
                                        'approved',
                                        `${request.user.firstName} ${request.user.lastName}`
                                      )}
                                    >
                                      Approve
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  )}
                </Box>
                
                {/* Member History Tab */}
                <Box role="tabpanel" hidden={activeTab !== 2}>
                  {activeTab === 2 && (
                    <Box sx={{ p: 3 }}>
                      {memberHistory.length === 0 ? (
                        <Typography>No member history available</Typography>
                      ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Member History</Typography>
                          </Box>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Member</th>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>NIC</th>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Joined At</th>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Left At</th>
                                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memberHistory.map((entry) => (
                                <tr key={entry._id} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '16px' }}>
                                    {entry.user.firstName} {entry.user.lastName}
                                  </td>
                                  <td style={{ padding: '16px' }}>{entry.user.email}</td>
                                  <td style={{ padding: '16px' }}>{entry.nic || 'N/A'}</td>
                                  <td style={{ padding: '16px' }}>
                                    {format(new Date(entry.joinedAt), 'PPpp')}
                                  </td>
                                  <td style={{ padding: '16px' }}>
                                    {entry.leftAt ? format(new Date(entry.leftAt), 'PPpp') : 'Still active'}
                                  </td>
                                  <td style={{ padding: '16px' }}>{entry.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
          
          {/* Response Dialog */}
          <Dialog
            open={responseDialog}
            onClose={handleResponseDialogClose}
            aria-labelledby="response-dialog-title"
          >
            <DialogTitle id="response-dialog-title">
              {responseData.status === 'approved' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to {responseData.status} {responseData.memberName}'s
                request to {responseData.requestType === 'join' ? 'join' : 'leave'} this community?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleResponseDialogClose}>Cancel</Button>
              <Button 
                onClick={handleRequestResponse}
                color={responseData.status === 'approved' ? 'primary' : 'error'}
                variant="contained"
              >
                Confirm {responseData.status}
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
            <DialogTitle id="success-dialog-title" 
              sx={{ 
                bgcolor: successAction === 'approved' ? 'success.light' : 'info.light', 
                color: successAction === 'approved' ? 'success.contrastText' : 'info.contrastText' 
              }}
            >
              Request {successAction === 'approved' ? 'Approved' : 'Rejected'} Successfully
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" gutterBottom align="center">
                  {successMessage}
                </Typography>
                {successAction === 'approved' && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', textAlign: 'center' }}>
                    The member has been notified of your decision.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseSuccessDialog} 
                color="primary" 
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

export default MemberRequests;
