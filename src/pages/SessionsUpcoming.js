import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import Header from "../components/Header";
import MemberSidebar from "../components/Member.Sidebar";
import api from "../utils/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const SessionsUpcoming = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState({});
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState(null); // {clientSecret, publishableKey}
  const [currentSession, setCurrentSession] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
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

  // New: when Join clicked, create PaymentIntent (unless free) and open modal
  const handleJoin = async (session) => {
    const sessionId = session._id;
    // If free, just call existing join API
    const price = session.price || 0;
    if (!price || price === 0) {
      setJoining((s) => ({ ...s, [sessionId]: true }));
      try {
        await api.post(`/sessions/member/${sessionId}/join`);
        setSessions((prev) =>
          prev.map((p) => (p._id === sessionId ? { ...p, joined: true } : p))
        );
      } catch (err) {
        console.error("Join failed", err);
      } finally {
        setJoining((s) => ({ ...s, [sessionId]: false }));
      }
      return;
    }

    setJoining((s) => ({ ...s, [sessionId]: true }));
    try {
      const res = await api.post("/payments/create-payment-intent", {
        amount: price,
        currency: (session.currency || "usd").toLowerCase(),
        sessionId,
      });
      const { clientSecret, publishableKey } = res.data;
      setPaymentOptions({ clientSecret, publishableKey });
      setCurrentSession(session);
      setPaymentError(null);
      setPaymentOpen(true);
    } catch (err) {
      console.error("Failed to create payment intent", err);
    } finally {
      setJoining((s) => ({ ...s, [sessionId]: false }));
    }
  };

  // PaymentModal component with proper Elements context wrapping
  const PaymentModal = ({ open, onClose, options, session }) => {
    if (!options || !options.clientSecret) return null;

    const appearance = { theme: "stripe" };
    const elementsOptions = { clientSecret: options.clientSecret, appearance };

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Pay for session: {session?.heading}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Elements options={elementsOptions} stripe={stripePromise}>
              <PaymentForm
                session={session}
                onClose={onClose}
                clientSecret={options.clientSecret} // Pass clientSecret as prop
              />
            </Elements>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  // Fixed PaymentForm component - receives clientSecret as prop
  const PaymentForm = ({ session, onClose, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [localError, setLocalError] = useState(null);

    const handleSubmitPayment = async () => {
      setProcessing(true);
      setLocalError(null);

      if (!stripe || !elements) {
        setLocalError("Stripe has not loaded yet.");
        setProcessing(false);
        return;
      }

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          setLocalError(error.message || "Payment failed");
          setProcessing(false);
          return;
        }

        // Use the clientSecret prop instead of options.clientSecret
        const pi =
          paymentIntent || (await stripe.retrievePaymentIntent(clientSecret));

        if (pi && pi.status === "succeeded") {
          // record server-side
          await api.post("/payments/record", {
            paymentIntentId: pi.id,
            sessionId: session._id,
          });

          // also call join endpoint to add member to session participants
          try {
            await api.post(`/sessions/member/${session._id}/join`);
          } catch (err) {
            // non-fatal: we still proceed
            console.warn("Failed to join session after payment:", err);
          }

          // update local UI: mark joined
          setSessions((prev) =>
            prev.map((p) =>
              p._id === session._id ? { ...p, joined: true } : p
            )
          );

          onClose();
        } else {
          setLocalError("Payment not completed. Status: " + (pi && pi.status));
        }
      } catch (err) {
        console.error("confirmPayment error:", err);
        setLocalError("Payment confirmation failed");
      } finally {
        setProcessing(false);
      }
    };

    return (
      <>
        {localError && <Alert severity="error">{localError}</Alert>}
        <PaymentElement />
        <DialogActions>
          <Button onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={processing || !stripe}
          >
            {processing
              ? "Processing..."
              : `Pay ${formatUSD(session?.price, session?.currency || "USD")}`}
          </Button>
        </DialogActions>
      </>
    );
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
                        onClick={() => handleJoin(s)}
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

        {/* Payment modal */}
        {paymentOptions && currentSession && (
          <PaymentModal
            open={paymentOpen}
            onClose={() => {
              setPaymentOpen(false);
              setPaymentOptions(null);
              setCurrentSession(null);
            }}
            options={paymentOptions}
            session={currentSession}
          />
        )}
      </Box>
    </>
  );
};

export default SessionsUpcoming;
