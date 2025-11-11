import * as React from "react";
import { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { api } from "../services/api";

function StatCard({ title, value, icon, color, trend, trendValue }) {
  const isPositive = trendValue && trendValue > 0;
  const trendColor = isPositive ? "success.main" : "error.main";

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #1e293b 0%, #1e293b 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
          borderColor: `${color}.main`,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              color="text.secondary"
              gutterBottom
              variant="body2"
              sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, mb: trendValue ? 1 : 0 }}
            >
              {value}
            </Typography>
            {trendValue !== undefined && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <TrendingUpIcon
                  sx={{
                    fontSize: 16,
                    color: trendColor,
                    mr: 0.5,
                    transform: isPositive ? "none" : "rotate(180deg)",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: trendColor,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {isPositive ? "+" : ""}
                  {trendValue}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: 12 }}
                >
                  Last 30 days
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.9,
            }}
          >
            {React.cloneElement(icon, {
              sx: { fontSize: 28, color: "#fff" },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Overview() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const invoices = await api.getInvoices();

        const total = invoices.length;
        const totalAmount = invoices.reduce(
          (sum, inv) => sum + parseFloat(inv.amount || 0),
          0
        );
        const paid = invoices.filter((inv) => inv.status === "paid").length;
        const pending = invoices.filter(
          (inv) => inv.status === "draft" || inv.status === "sent"
        ).length;

        setStats({
          totalInvoices: total,
          totalAmount: totalAmount.toFixed(2),
          paidInvoices: paid,
          pendingInvoices: pending,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Calculate trends (mock data for now - you can replace with real calculations)
  const trends = {
    totalInvoices: 25,
    totalAmount: 15,
    paidInvoices: 30,
    pendingInvoices: -10,
  };

  return (
    <Box>
      <Typography
        component="h2"
        variant="h5"
        sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
      >
        Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<ReceiptIcon />}
            color="primary"
            trendValue={trends.totalInvoices}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Amount"
            value={`$${parseFloat(stats.totalAmount).toLocaleString()}`}
            icon={<AttachMoneyIcon />}
            color="success"
            trendValue={trends.totalAmount}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Paid Invoices"
            value={stats.paidInvoices}
            icon={<TrendingUpIcon />}
            color="info"
            trendValue={trends.paidInvoices}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Invoices"
            value={stats.pendingInvoices}
            icon={<ScheduleIcon />}
            color="warning"
            trendValue={trends.pendingInvoices}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
