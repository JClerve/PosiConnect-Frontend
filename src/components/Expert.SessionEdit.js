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
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import Header from "./Header";
import ExpertSidebar from "./Expert.Sidebar";

const ExpertSessionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // added
  const [communities, setCommunities] = useState([]);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    heading: "",
    description: "",
    specialNote: "",
    price: "",
    community: "",
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        const s = res.data;
        setForm({
          date: s.date || "",
          startTime: s.startTime || "",
          endTime: s.endTime || "",
          heading: s.heading || "",
          description: s.description || "",
          specialNote: s.specialNote || "",
          price: s.price != null ? s.price : "",
          community:
            typeof s.community === "string"
              ? s.community
              : s.community?._id || "",
        });
      } catch (err) {
        console.error("Failed to load session by id:", err);
        // fallback: try to fetch sessions list for current expert and find by id
        if (err?.response?.status === 404) {
          try {
            const me = await api.get("/user/me");
            const expertId = me.data?._id;
            if (!expertId) throw new Error("Unable to determine current user");
            const listRes = await api.get(`/sessions?expertId=${expertId}`);
            const found = (listRes.data || []).find(
              (x) => (x._id || x.id) === id
            );
            if (found) {
              const s = found;
              setForm({
                date: s.date || "",
                startTime: s.startTime || "",
                endTime: s.endTime || "",
                heading: s.heading || "",
                description: s.description || "",
                specialNote: s.specialNote || "",
                price: s.price != null ? s.price : "",
                community:
                  typeof s.community === "string"
                    ? s.community
                    : s.community?._id || "",
              });
            } else {
              alert(
                "Session not found. It may have been deleted or you may not have access."
              );
              navigate("/expert/dashboard");
            }
          } catch (fallbackErr) {
            console.error("Fallback lookup failed:", fallbackErr);
            alert("Unable to load session. Please try again later.");
            navigate("/expert/dashboard");
          }
        } else {
          alert("Failed to load session");
          navigate("/expert/dashboard");
        }
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchUserAndCommunities = async () => {
      try {
        const me = await api.get("/user/me");
        const expertId = me.data?._id;
        if (expertId) {
          const res = await api.get(`/communities?expertId=${expertId}`);
          setCommunities(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load communities:", err);
      }
    };

    fetchSession();
    fetchUserAndCommunities();
  }, [id]);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.date || !form.startTime || !form.endTime || !form.heading)
      return false;
    if (!form.community) return false;
    if (form.price && Number(form.price) < 0) return false;
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert(
        "Please fill required fields (date, start/end time, heading and community)."
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        heading: form.heading,
        description: form.description,
        specialNote: form.specialNote,
        price: form.price ? Number(form.price) : 0,
        community: form.community,
      };
      await api.put(`/sessions/${id}`, payload);
      alert("Session updated");
      navigate("/expert/dashboard");
    } catch (err) {
      console.error("Failed to update session:", err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Header showMenuButton onMenuToggle={() => setSidebarOpen((s) => !s)} />
        <ExpertSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="permanent"
        />
        <Box sx={{ ml: sidebarOpen ? "280px" : "65px", p: 3, mt: "64px" }}>
          <Typography>Loading session...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header showMenuButton onMenuToggle={() => setSidebarOpen((s) => !s)} />
      <ExpertSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="permanent"
      />
      <Box sx={{ ml: sidebarOpen ? "280px" : "65px", p: 3, mt: "64px" }}>
        <Paper sx={{ p: 3, maxWidth: 800 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit Session
          </Typography>

          <form onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={6} md={4}>
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

              <Grid item xs={6} md={4}>
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

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="community-edit-label">Community</InputLabel>
                  <Select
                    labelId="community-edit-label"
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
                        {c.name || c.title || c._id || c.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Heading"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Special Note"
                  name="specialNote"
                  value={form.specialNote}
                  onChange={handleChange}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/expert/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default ExpertSessionEdit;
