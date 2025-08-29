import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  Chip,
} from "@mui/material";
import { Person, Add, ThumbUp, ThumbDown, Reply as ReplyIcon, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import api from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const [joinedCommunityName, setJoinedCommunityName] = useState("");
  // Feed state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentFor, setOpenCommentFor] = useState(null);
  // Reply to comment handler
  const [replyInputs, setReplyInputs] = useState({});
  const [openReplyFor, setOpenReplyFor] = useState(null);
  // Nested reply handler
  const [nestedReplyInputs, setNestedReplyInputs] = useState({});
  const [openNestedReplyFor, setOpenNestedReplyFor] = useState(null);
  
  // Community creators for expert detection
  const [communityCreators, setCommunityCreators] = useState({});

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if user is expert/creator of the community
  const isExpert = (authorId, communityId) => {
    return communityCreators[communityId] === authorId;
  };

  // Move fetchFeed declaration above useEffect
  const fetchFeed = async () => {
    try {
      const res = await api.get('/communities/member');
      const comms = res.data.joinedCommunities || [];
      
      // Store community creators for expert detection
      const creators = {};
      const communityMap = {};
      
      comms.forEach(comm => {
        creators[comm._id] = comm.creator._id;
        communityMap[comm._id] = comm;
      });
      setCommunityCreators(creators);
      
      const postPromises = comms.map(c => api.get(`/communities/${c._id}/posts`));
      const results = await Promise.all(postPromises);
      
      // Attach community information to each post
      const allPosts = results.flatMap((r, index) => {
        return r.data.map(post => {
          const communityId = post.community;
          return {
            ...post,
            community: {
              _id: communityId,
              name: communityMap[communityId]?.name || 'Unknown Community'
            }
          };
        });
      });
      
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(allPosts);
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    fetchProfile();
    fetchFeed();
  }, [navigate]);

  const handleCloseSuccessDialog = () => {
    setSuccessDialog(false);
  };

  // Vote handler
  const handleVote = async (post, voteType) => {
    try {
      const res = await api.post(`/communities/${post.community._id}/posts/${post._id}/vote`, { voteType });
      // Update post counts locally
      setPosts(prevPosts => prevPosts.map(p => p._id === post._id ? { 
        ...p, 
        upvoteCount: res.data.upvotes, 
        downvoteCount: res.data.downvotes, 
        userVoted: voteType 
      } : p));
    } catch (err) {
      console.error('Vote error', err);
    }
  };

  // Comment handler
  const handleAddComment = async (post) => {
    const content = commentInputs[post._id];
    if (!content) return;
    try {
      const res = await api.post(`/communities/${post.community._id}/posts/${post._id}/comments`, { content });
      // res.data is updated comments array
      setPosts(prevPosts => prevPosts.map(p => p._id === post._id ? { ...p, comments: res.data } : p));
      setCommentInputs(prev => ({ ...prev, [post._id]: '' }));
      setOpenCommentFor(null);
    } catch (err) {
      console.error('Comment error', err);
    }
  };

  // Reply to comment handler
  const handleAddReply = async (post, comment) => {
    const content = replyInputs[comment._id];
    if (!content) return;
    try {
      await api.post(
        `/communities/${post.community._id}/posts/${post._id}/comments/${comment._id}/replies`,
        { content }
      );
      await fetchFeed();
      setReplyInputs(prev => ({ ...prev, [comment._id]: '' }));
      setOpenReplyFor(null);
    } catch (err) {
      console.error('Reply error', err);
    }
  };

  // Nested reply handler
  const handleAddNestedReply = async (post, comment, parentReply) => {
    const content = nestedReplyInputs[parentReply._id];
    if (!content) return;
    try {
      await api.post(
        `/communities/${post.community._id}/posts/${post._id}/comments/${comment._id}/replies/${parentReply._id}/replies`,
        { content }
      );
      // Refresh feed to get populated nested replies
      fetchFeed();
      setNestedReplyInputs(prev => ({ ...prev, [parentReply._id]: '' }));
      setOpenNestedReplyFor(null);
    } catch (err) {
      console.error('Nested reply error', err);
    }
  };

  // Recursive component to render replies with proper nesting and styling
  const renderReplies = (replies, post, comment, level = 0) => {
    if (!replies || replies.length === 0) return null;

    return replies.map((reply) => (
      <Box key={reply._id} sx={{ ml: Math.min(level * 2, 8), mt: 2 }}>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: level % 2 === 0 ? "grey.50" : "grey.100",
            borderLeft: `3px solid ${theme.palette.primary.light}`,
            borderRadius: 2
          }}
        >
          {/* Reply Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main }}
              src={reply.author.profilePicture}
            >
              {reply.author.firstName?.[0]}{reply.author.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {reply.author.firstName} {reply.author.lastName}
                </Typography>
                {isExpert(reply.author._id, post.community) && (
                  <Chip 
                    label="Expert" 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: theme.palette.primary.main, 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {formatDate(reply.createdAt)}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setOpenNestedReplyFor(reply._id)}
              sx={{ color: theme.palette.primary.main }}
            >
              <ReplyIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Reply Content */}
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
            {reply.content}
          </Typography>

          {/* Nested reply form */}
          <Collapse in={openNestedReplyFor === reply._id} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={nestedReplyInputs[reply._id] || ''}
                onChange={(e) => setNestedReplyInputs(prev => ({ ...prev, [reply._id]: e.target.value }))}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => setOpenNestedReplyFor(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddNestedReply(post, comment, reply)}
                  startIcon={<Send />}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Render deeply nested replies recursively */}
          {renderReplies(reply.replies, post, comment, level + 1)}
        </Paper>
      </Box>
    ));
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

  return (
    <LayoutWrapper>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Header with title and action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={600}>Member Dashboard</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/create-post')}
            startIcon={<Add />}
          >
            Create Post
          </Button>
        </Box>
        
        {/* Feed section */}
        <Box>
          {loadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length ? (
            posts.map(post => (
              <Card key={post._id} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                {/* Community Label */}
                {post.community && post.community.name && (
                  <Box sx={{ 
                    bgcolor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                    px: 2,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 'medium'
                  }}>
                    {post.community.name}
                  </Box>
                )}
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }} src={post.author.profilePicture}>
                      {post.anonymous ? '?' : `${post.author.firstName?.[0]}${post.author.lastName?.[0]}`}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {post.title}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {post.anonymous ? 'Anonymous' : `${post.author.firstName} ${post.author.lastName}`}
                      </Typography>
                      {!post.anonymous && isExpert(post.author._id, post.community._id) && (
                        <Chip 
                          label="Expert" 
                          size="small" 
                          sx={{ 
                            height: 18, 
                            fontSize: '0.65rem',
                            bgcolor: theme.palette.primary.main, 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        • {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                
                <CardContent>
                  {post.contentWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {post.contentWarningText}
                    </Alert>
                  )}
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {post.content}
                  </Typography>
                </CardContent>
                
                <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => handleVote(post, 'upvote')} 
                      color={post.userVoted === 'upvote' ? 'primary' : 'default'}
                    >
                      <ThumbUp />
                    </IconButton>
                    <Typography component="span" sx={{ mx: 0.5, minWidth: 20, textAlign: 'center' }}>
                      {post.upvoteCount || 0}
                    </Typography>
                    <IconButton 
                      onClick={() => handleVote(post, 'downvote')} 
                      color={post.userVoted === 'downvote' ? 'secondary' : 'default'}
                    >
                      <ThumbDown />
                    </IconButton>
                    <Typography component="span" sx={{ mx: 0.5, minWidth: 20, textAlign: 'center' }}>
                      {post.downvoteCount || 0}
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    startIcon={<ReplyIcon />}
                    onClick={() => setOpenCommentFor(openCommentFor === post._id ? null : post._id)}
                  >
                    Reply
                  </Button>
                </CardActions>
                
                {/* Comment form */}
                <Collapse in={openCommentFor === post._id} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'grey.50' }}>
                    <TextField
                      fullWidth
                      multiline 
                      rows={3}
                      placeholder="What are your thoughts?"
                      value={commentInputs[post._id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => setOpenCommentFor(null)}>Cancel</Button>
                      <Button 
                        variant="contained" 
                        onClick={() => handleAddComment(post)}
                        startIcon={<Send />}
                      >
                        Comment
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
                
                {/* Comments section */}
                {post.comments && post.comments.length > 0 && (
                  <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Comments ({post.comments.length})
                    </Typography>
                    
                    {post.comments.map((comment, index) => (
                      <Box key={comment._id} sx={{ mb: index === post.comments.length - 1 ? 0 : 3 }}>
                        <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                          {/* Comment Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ width: 40, height: 40, mr: 2, bgcolor: theme.palette.secondary.main }}
                              src={comment.author.profilePicture}
                            >
                              {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                  {comment.author.firstName} {comment.author.lastName}
                                </Typography>
                                {isExpert(comment.author._id, post.community) && (
                                  <Chip 
                                    label="Expert" 
                                    size="small" 
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.7rem',
                                      bgcolor: theme.palette.primary.main, 
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }} 
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {formatDate(comment.createdAt)}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => setOpenReplyFor(openReplyFor === comment._id ? null : comment._id)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <ReplyIcon />
                            </IconButton>
                          </Box>

                          {/* Comment Content */}
                          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {comment.content}
                          </Typography>

                          {/* Reply form for comment */}
                          <Collapse in={openReplyFor === comment._id} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                              <TextField
                                fullWidth
                                multiline 
                                rows={2}
                                placeholder="Write a reply..."
                                value={replyInputs[comment._id] || ''}
                                onChange={e => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                sx={{ mb: 1 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setOpenReplyFor(null)}>Cancel</Button>
                                <Button 
                                  variant="contained" 
                                  onClick={() => handleAddReply(post, comment)}
                                  startIcon={<Send />}
                                >
                                  Reply
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>

                          {/* Render replies recursively */}
                          {renderReplies(comment.replies, post, comment)}
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            ))
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
              No posts yet. Create the first one!
            </Typography>
          )}
        </Box>
      </Container>
    </LayoutWrapper>
  );
};

export default Dashboard;