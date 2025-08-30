import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Header from "./Header";
import ExpertSidebar from "./Expert.Sidebar";

const ExpertSession = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    heading: "",
    description: "",
    specialNote: "",
    price: "",
    community: "", // keep community
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [communities, setCommunities] = useState([]); // keep communities

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
        if (res.data && res.data._id) {
          // removed fetchUpcoming call
          fetchCommunities(res.data._id);
        }
      } catch (err) {
        console.error("fetch user failed", err);
      }
    };
    fetchMe();
  }, []);

  // fetchCommunities stays
  const fetchCommunities = async (expertId) => {
    if (!expertId) return;
    try {
      const res = await api.get(`/communities?expertId=${expertId}`);
      setCommunities(res.data || []);
    } catch (err) {
      console.error("Failed to fetch communities:", err);
    }
  };

  // removed fetchUpcoming function entirely

  const validate = () => {
    if (!form.date || !form.startTime || !form.endTime || !form.heading)
      return false;
    if (!form.community) return false; // require community target
    if (form.price && Number(form.price) < 0) return false;
    return true;
  };

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert(
        "Please fill required fields (date, start/end time, heading and community)."
      );
      return;
    }
    setLoading(true);
    try {
      let expertId = user?._id;
      if (!expertId) {
        const me = await api.get("/user/me");
        expertId = me.data._id;
      }
      const payload = {
        expert: expertId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        heading: form.heading,
        description: form.description,
        specialNote: form.specialNote,
        price: form.price ? Number(form.price) : 0,
        community: form.community,
      };
      await api.post("/sessions", payload);
      // notify other parts of the app (and other tabs) that sessions changed
      try {
        const stamp = String(Date.now());
        localStorage.setItem("sessionsUpdated", stamp); // cross-tab notification
        // in-tab notification (custom event)
        try {
          window.dispatchEvent(
            new CustomEvent("sessionsUpdated", { detail: stamp })
          );
        } catch (evErr) {
          console.warn("dispatchEvent failed", evErr);
        }
      } catch (storageErr) {
        console.warn(
          "Could not write sessionsUpdated to localStorage",
          storageErr
        );
      }
      alert("Session created");
      // navigate to dashboard and signal refresh
      navigate("/expert/dashboard", { state: { refresh: true } });
      // dispatch again shortly after navigation so newly mounted listeners receive it
      setTimeout(() => {
        try {
          window.dispatchEvent(
            new CustomEvent("sessionsUpdated", { detail: String(Date.now()) })
          );
        } catch (evErr) {
          /* ignore */
        }
      }, 300);
    } catch (err) {
      console.error("Failed to create session:", err);
      if (err?.response?.status === 404) {
        alert(
          "Create session failed with 404. Backend sessions route not found. See Backend/INTEGRATE-SESSIONS-ROUTE.txt for integration steps."
        );
      } else {
        alert("Failed to create session");
      }
    } finally {
      setLoading(false);
    }
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Create Session
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Time"
                      name="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Time"
                      name="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>

                {/* Community selector (required) */}
                <FormControl fullWidth sx={{ my: 2 }} required>
                  <InputLabel id="community-label">Community</InputLabel>
                  <Select
                    labelId="community-label"
                    label="Community"
                    name="community"
                    value={form.community}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>Select community</em>
                    </MenuItem>
                    {communities.map((c) => (
                      <MenuItem key={c._id || c.id} value={c._id || c.id}>
                        {c.name || c.title || c.heading || c._id || c.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Heading"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  fullWidth
                  sx={{ my: 2 }}
                  required
                />

                <TextField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Special Note"
                  name="specialNote"
                  value={form.specialNote}
                  onChange={handleChange}
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button variant="contained" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Create Session"}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Removed Upcoming Sessions from this page.
            Upcoming sessions are shown only on /expert/dashboard (Expert.MyDashboard). */}
      </Box>
    </>
  );
};

export default ExpertSession;
