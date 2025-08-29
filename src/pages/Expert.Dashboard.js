import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  Paper,
  TextField,
  IconButton,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  useTheme,
  Chip,
} from "@mui/material";
import { Person, Reply as ReplyIcon, Send, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import api from "../utils/api";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // Reply states
  const [replyForms, setReplyForms] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.role !== "expert") {
          navigate("/dashboard");
          return;
        }
        setUser(res.data);
        setLoading(false);
        fetchFeed(res.data._id);
      } catch (err) {
        console.error("Expert Dashboard error:", err);
        setError("Failed to load profile. Please login again.");
        setLoading(false);
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 3000);
      }
    };
    fetchProfile();
  }, [navigate]);

  // fetch posts for communities created by this expert
  const fetchFeed = async (expertId) => {
    try {
      const commRes = await api.get("/communities/member");
      const joined = commRes.data.joinedCommunities || [];
      const myComms = joined.filter((c) => c.creator._id === expertId);
      
      // Create a map of community IDs to community objects for quick lookup
      const communityMap = {};
      myComms.forEach(community => {
        communityMap[community._id] = community;
      });
      
      const postPromises = myComms.map((c) => api.get(`/communities/${c._id}/posts`));
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
      console.error("Expert feed error:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if user is expert (author)
  const isExpert = (authorId) => {
    return user && user._id === authorId;
  };

  // Toggle reply form visibility
  const toggleReplyForm = (key) => {
    setReplyForms(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle reply content change
  const handleReplyContentChange = (key, content) => {
    setReplyContent(prev => ({
      ...prev,
      [key]: content
    }));
  };

  // Submit reply to post (comment)
  const submitPostReply = async (postId, communityId) => {
    const key = `post-${postId}`;
    const content = replyContent[key];
    
    if (!content || content.trim().length === 0) {
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [key]: true }));

    try {
      await api.post(`/communities/${communityId}/posts/${postId}/comments`, {
        content: content.trim()
      });

      // Refresh the posts to show new comment
      if (user) {
        await fetchFeed(user._id);
      }

      // Reset form
      setReplyContent(prev => ({ ...prev, [key]: '' }));
      setReplyForms(prev => ({ ...prev, [key]: false }));
    } catch (err) {
      console.error("Error submitting reply:", err);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(prev => ({ ...prev, [key]: false }));
    }
  };

  // Submit reply to comment
  const submitCommentReply = async (postId, communityId, commentId) => {
    const key = `comment-${commentId}`;
    const content = replyContent[key];
    
    if (!content || content.trim().length === 0) {
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [key]: true }));

    try {
      await api.post(`/communities/${communityId}/posts/${postId}/comments/${commentId}/replies`, {
        content: content.trim()
      });

      // Refresh the posts to show new reply
      if (user) {
        await fetchFeed(user._id);
      }

      // Reset form
      setReplyContent(prev => ({ ...prev, [key]: '' }));
      setReplyForms(prev => ({ ...prev, [key]: false }));
    } catch (err) {
      console.error("Error submitting reply:", err);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(prev => ({ ...prev, [key]: false }));
    }
  };

  // Submit reply to reply (nested reply)
  const submitReplyToReply = async (postId, communityId, commentId, replyId) => {
    const key = `reply-${replyId}`;
    const content = replyContent[key];
    
    if (!content || content.trim().length === 0) {
      return;
    }

    setSubmittingReply(prev => ({ ...prev, [key]: true }));

    try {
      await api.post(`/communities/${communityId}/posts/${postId}/comments/${commentId}/replies/${replyId}/replies`, {
        content: content.trim()
      });

      // Refresh the posts to show new nested reply
      if (user) {
        await fetchFeed(user._id);
      }

      // Reset form
      setReplyContent(prev => ({ ...prev, [key]: '' }));
      setReplyForms(prev => ({ ...prev, [key]: false }));
    } catch (err) {
      console.error("Error submitting reply:", err);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(prev => ({ ...prev, [key]: false }));
    }
  };

  // Recursive component to render replies with proper nesting and styling
  const renderReplies = (replies, postId, communityId, commentId, level = 0) => {
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
                {isExpert(reply.author._id) && (
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
              onClick={() => toggleReplyForm(`reply-${reply._id}`)}
              sx={{ color: theme.palette.primary.main }}
            >
              <ReplyIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Reply Content */}
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
            {reply.content}
          </Typography>

          {/* Reply form for this reply */}
          <Collapse in={replyForms[`reply-${reply._id}`]}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyContent[`reply-${reply._id}`] || ''}
                onChange={(e) => handleReplyContentChange(`reply-${reply._id}`, e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => toggleReplyForm(`reply-${reply._id}`)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => submitReplyToReply(postId, communityId, commentId, reply._id)}
                  disabled={submittingReply[`reply-${reply._id}`]}
                  startIcon={submittingReply[`reply-${reply._id}`] ? <CircularProgress size={16} /> : <Send />}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Render nested replies recursively */}
          {renderReplies(reply.replies, postId, communityId, commentId, level + 1)}
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
          <Typography variant="h4" fontWeight={600}>Expert Dashboard</Typography>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-post")}
            startIcon={<Add />}
          >
            Create Post
          </Button> */}
        </Box>

        {loadingPosts ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Typography sx={{ mt: 4, textAlign: 'center' }}>No posts in your communities yet.</Typography>
        ) : (
          <Box sx={{ mt: 4 }}>
            {posts.map((post) => (
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
                {/* Post Header */}
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
                    <Typography variant="body2" color="text.secondary">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {post.anonymous ? 'Anonymous' : `${post.author.firstName} ${post.author.lastName}`}
                        {!post.anonymous && isExpert(post.author._id) && (
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
                        <span> • {formatDate(post.createdAt)}</span>
                      </Box>
                    </Typography>
                  }
                />

                {/* Post Content */}
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

                {/* Post Actions */}
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    startIcon={<ReplyIcon />}
                    size="small"
                    onClick={() => toggleReplyForm(`post-${post._id}`)}
                  >
                    Reply to Post
                  </Button>
                </CardActions>

                {/* Reply form for post */}
                <Collapse in={replyForms[`post-${post._id}`]}>
                  <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'grey.50' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Write your comment..."
                      value={replyContent[`post-${post._id}`] || ''}
                      onChange={(e) => handleReplyContentChange(`post-${post._id}`, e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => toggleReplyForm(`post-${post._id}`)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => submitPostReply(post._id, post.community)}
                        disabled={submittingReply[`post-${post._id}`]}
                        startIcon={submittingReply[`post-${post._id}`] ? <CircularProgress size={16} /> : <Send />}
                      >
                        Comment
                      </Button>
                    </Box>
                  </Box>
                </Collapse>

                {/* Comments Section */}
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
                                {isExpert(comment.author._id) && (
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
                              onClick={() => toggleReplyForm(`comment-${comment._id}`)}
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
                          <Collapse in={replyForms[`comment-${comment._id}`]}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                placeholder="Write a reply..."
                                value={replyContent[`comment-${comment._id}`] || ''}
                                onChange={(e) => handleReplyContentChange(`comment-${comment._id}`, e.target.value)}
                                sx={{ mb: 1 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button 
                                  size="small" 
                                  onClick={() => toggleReplyForm(`comment-${comment._id}`)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => submitCommentReply(post._id, post.community, comment._id)}
                                  disabled={submittingReply[`comment-${comment._id}`]}
                                  startIcon={submittingReply[`comment-${comment._id}`] ? <CircularProgress size={16} /> : <Send />}
                                >
                                  Reply
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>

                          {/* Render replies recursively */}
                          {renderReplies(comment.replies, post._id, post.community, comment._id)}
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </LayoutWrapper>
  );
};

export default ExpertDashboard;