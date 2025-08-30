import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  ButtonGroup,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import Header from "./Header";
import ExpertSidebar from "./Expert.Sidebar";

const ExpertMyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("upcoming"); // "upcoming" or "all"

  //   useEffect(() => {
  //     const fetchMe = async () => {
  //       try {
  //         const res = await api.get("/user/me");
  //         setUser(res.data);
  //         if (res.data && res.data._id) fetchSessions(res.data._id, mode);
  //       } catch (err) {
  //         console.error("fetch user failed", err);
  //       }
  //     };
  //     fetchMe();
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
        if (res.data && res.data._id) {
          // Inline the session fetching
          const query =
            mode === "upcoming"
              ? `?expertId=${res.data._id}&upcoming=true`
              : `?expertId=${res.data._id}`;
          const sessionsRes = await api.get(`/sessions${query}`);
          setSessions(sessionsRes.data || []);
        }
      } catch (err) {
        console.error("fetch user failed", err);
      }
    };
    fetchMe();
  }, [mode]);

  // react to navigation state.refresh to refetch (when navigate set state)
  useEffect(() => {
    const refresh = location?.state?.refresh;
    if (refresh && user && user._id) {
      fetchSessions(user._id, mode);
      try {
        window.history.replaceState(
          {},
          document.title,
          location.pathname + location.search
        );
      } catch (err) {
        /* ignore */
      }
    }
  }, [location, user, mode]);

  // localStorage cross-tab notification
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sessionsUpdated") {
        if (user && user._id) fetchSessions(user._id, mode);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user, mode]);

  // custom in-page event (same-tab)
  useEffect(() => {
    const onCustom = () => {
      if (user && user._id) fetchSessions(user._id, mode);
    };
    window.addEventListener("sessionsUpdated", onCustom);
    return () => window.removeEventListener("sessionsUpdated", onCustom);
  }, [user, mode]);

  // fetch sessions — upcoming or all depending on mode
  const fetchSessions = async (expertId, modeArg = mode) => {
    if (!expertId) return;
    setLoading(true);
    try {
      const query =
        modeArg === "upcoming"
          ? `?expertId=${expertId}&upcoming=true`
          : `?expertId=${expertId}`;
      const res = await api.get(`/sessions${query}`);
      setSessions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sessionId) => {
    navigate(`/expert/session/edit/${sessionId}`);
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (user && user._id) fetchSessions(user._id, newMode);
  };

  return (
    <>
      <Header showMenuButton onMenuToggle={() => setSidebarOpen((s) => !s)} />
      <ExpertSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="permanent"
      />

      <Box sx={{ ml: sidebarOpen ? "280px" : "65px", p: 3, mt: "64px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5">My Dashboard — Sessions</Typography>
          <Box>
            <ButtonGroup size="small" sx={{ mr: 2 }}>
              <Button
                variant={mode === "upcoming" ? "contained" : "outlined"}
                onClick={() => handleModeChange("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={mode === "all" ? "contained" : "outlined"}
                onClick={() => handleModeChange("all")}
              >
                All
              </Button>
            </ButtonGroup>
            <Button
              size="small"
              onClick={() => user && fetchSessions(user._id, mode)}
            >
              REFRESH
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Showing {sessions.length} {mode === "upcoming" ? "upcoming" : "total"}{" "}
          session(s)
        </Typography>

        <Grid container spacing={2}>
          {sessions.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No sessions found.</Typography>
            </Grid>
          )}

          {sessions.map((s) => (
            <Grid item xs={12} md={6} key={s._id || s.id}>
              <Paper
                sx={{
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {s.heading}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.date} • {s.startTime} - {s.endTime}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {s.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {s.community
                      ? `Community: ${
                          typeof s.community === "string"
                            ? s.community
                            : s.community?.name || ""
                        }`
                      : ""}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {s.price ? `$${s.price}` : "Free"}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(s._id || s.id)}
                  >
                    Edit
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default ExpertMyDashboard;
