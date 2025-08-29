import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import api from '../utils/api';
import LayoutWrapper from '../components/LayoutWrapper';

const FindExperts = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        console.log('Fetching experts...');
        const res = await api.get('/experts');
        console.log('Experts data received:', res.data);
        setExperts(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching experts:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const joinCommunity = async (communityId) => {
    try {
      console.log('Joining community:', communityId);
      await api.post(`/communities/${communityId}/join`);
      alert('Joined community successfully.');
      // Refresh experts list
      const res = await api.get('/experts');
      setExperts(res.data);
    } catch (error) {
      console.error('Error joining community:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to join community.');
      }
    }
  };

  // Sidebar is now handled by the LayoutWrapper

  if (loading) {
    return (
      <LayoutWrapper>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Find Experts</Typography>
          <Typography>Loading experts...</Typography>
        </Box>
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Find Experts</Typography>
          <Typography color="error">Error loading experts: {error}</Typography>
        </Box>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mt: 2, 
            mb: 2, 
            fontWeight: 600, 
            color: '#2c3e50' 
          }}
        >
          Find Experts
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Found {experts.length} expert(s)
        </Typography>
        
        {experts.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            p: 5, 
            bgcolor: '#f8f9fa',
            borderRadius: 2 
          }}>
            <Typography variant="h5">No Experts Found</Typography>
            <Typography>There are currently no registered experts in the system.</Typography>
          </Box>
        ) : (
          experts.map((expert) => (
            <Box 
              key={expert._id} 
              sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 3,
                p: 3, 
                mb: 2.5,
                bgcolor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ mb: 2.5 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    m: 0, 
                    mb: 1, 
                    color: '#2c3e50',
                    fontWeight: 600
                  }}
                >
                  {expert.firstName} {expert.lastName}
                </Typography>
                
                <Box sx={{ mb: 1.5 }}>
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: '#7f8c8d', 
                      display: 'inline-block',
                      mr: 2.5
                    }}
                  >
                    📧 {expert.email}
                  </Typography>
                  
                  {expert.hourlyRate && (
                    <Typography 
                      component="span" 
                      sx={{ 
                        color: '#27ae60', 
                        fontWeight: 500
                      }}
                    >
                      💰 ${expert.hourlyRate}/hour
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    m: 0, 
                    mb: 1.5, 
                    color: '#34495e',
                    fontWeight: 500
                  }}
                >
                  🎯 Areas of Expertise
                </Typography>
                
                {expert.expertise && expert.expertise.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {expert.expertise.map((area, index) => (
                      <Box 
                        key={index} 
                        component="span"
                        sx={{
                          bgcolor: '#3498db',
                          color: 'white',
                          px: 1.75,
                          py: 0.75,
                          borderRadius: 5,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      >
                        {area}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography 
                    sx={{ 
                      color: '#95a5a6', 
                      fontStyle: 'italic',
                      m: 0
                    }}
                  >
                    No expertise areas specified.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    m: 0, 
                    mb: 1.5, 
                    color: '#34495e',
                    fontWeight: 500
                  }}
                >
                  🏘️ Communities Created ({expert.communities ? expert.communities.length : 0})
                </Typography>
                
                {expert.communities && expert.communities.length > 0 ? (
                  expert.communities.map((community) => (
                    <Box 
                      key={community._id}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center', 
                        mb: 1.5,
                        p: 2,
                        bgcolor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            m: 0, 
                            mb: 0.5,
                            color: '#2c3e50',
                            fontWeight: 600
                          }}
                        >
                          {community.displayTitle || community.name}
                        </Typography>
                        
                        {community.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              m: 0, 
                              mb: 1, 
                              color: '#6c757d', 
                              lineHeight: 1.4
                            }}
                          >
                            {community.description}
                          </Typography>
                        )}
                        
                        {community.category && (
                          <Box 
                            component="span"
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.25,
                              bgcolor: '#e9ecef',
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              color: '#495057',
                              fontWeight: 500
                            }}
                          >
                            📂 {community.category}
                          </Box>
                        )}
                      </Box>
                      
                      <Box 
                        component="button" 
                        onClick={() => joinCommunity(community._id)}
                        sx={{
                          ml: 2,
                          px: 2.5,
                          py: 1.25,
                          bgcolor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 0.75,
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          transition: 'background-color 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: '#218838'
                          }
                        }}
                      >
                        ➕ Join
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box 
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      bgcolor: '#f8f9fa',
                      border: '1px dashed #dee2e6',
                      borderRadius: 1,
                      color: '#6c757d'
                    }}
                  >
                    <Typography sx={{ m: 0, fontStyle: 'italic' }}>
                      This expert hasn't created any communities yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </LayoutWrapper>
  );
};

export default FindExperts;