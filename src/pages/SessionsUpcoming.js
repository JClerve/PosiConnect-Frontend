import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Grid,
  CircularProgress,
} from "@mui/material";
import Header from "../components/Header";
import MemberSidebar from "../components/Member.Sidebar";
import api from "../utils/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const SessionsUpcoming = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState({});
  const navigate = useNavigate();

  // format numbers as USD (fallback to provided currency if present)
  const formatUSD = (value, currency = "USD") => {
    if (value == null || value === 0) return "Free";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sessions/member/upcoming");
      setSessions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (sessionId) => {
    setJoining((s) => ({ ...s, [sessionId]: true }));
    try {
      await api.post(`/sessions/member/${sessionId}/join`);
      // mark locally as joined (optimistic)
      setSessions((prev) =>
        prev.map((p) => (p._id === sessionId ? { ...p, joined: true } : p))
      );
    } catch (err) {
      console.error("Join failed", err);
      // optionally show toast
    } finally {
      setJoining((s) => ({ ...s, [sessionId]: false }));
    }
  };

  return (
    <>
      <Header
        onMenuToggle={() => setOpenSidebar(!openSidebar)}
        showMenuButton
      />
      <MemberSidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        variant="permanent"
      />
      <Box sx={{ ml: openSidebar ? "280px" : "65px", p: 3, mt: "64px" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Upcoming Sessions
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : sessions.length === 0 ? (
          <Typography>No upcoming sessions in your communities.</Typography>
        ) : (
          <Grid container spacing={2}>
            {sessions.map((s) => {
              const sessionDate = (() => {
                try {
                  const [y, m, d] = s.date.split("-");
                  const dt = new Date(Number(y), Number(m) - 1, Number(d));
                  return format(dt, "PPP");
                } catch {
                  return s.date;
                }
              })();

              const expertName = s.expert
                ? `${s.expert.firstName || ""} ${
                    s.expert.lastName || ""
                  }`.trim()
                : "TBD";

              const isJoined =
                s.joined ||
                (s.participants &&
                  s.participants.some(
                    (p) => p === /* string id */ undefined
                  )) ||
                false;
              // simple local joined check: server returns joined participants but we mark optimistically

              return (
                <Grid item xs={12} md={6} key={s._id}>
                  <Paper
                    sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Avatar
                      src={s.expert?.profilePicture}
                      sx={{ width: 56, height: 56 }}
                    >
                      {s.expert?.firstName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{s.heading}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.community?.displayTitle || s.community?.name} —{" "}
                        {sessionDate} • {s.startTime} - {s.endTime}
                      </Typography>
                      <Typography variant="body2">
                        Expert: {expertName}
                      </Typography>
                      <Typography variant="body2">
                        Price: {formatUSD(s.price, s.currency || "USD")}
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        variant={isJoined ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => handleJoin(s._id)}
                        disabled={joining[s._id] || isJoined}
                      >
                        {joining[s._id]
                          ? "Joining..."
                          : isJoined
                          ? "Joined"
                          : "Join"}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default SessionsUpcoming;
