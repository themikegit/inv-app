import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "../services/api";
import InvoiceDialog from "./InvoiceDialog";

const statusColors = {
  draft: "default",
  sent: "info",
  paid: "success",
  overdue: "error",
};

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.message || "Failed to fetch invoices");
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
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

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          My Invoices
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvoices}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Invoice
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {invoices.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" align="center">
              No invoices found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Create your first invoice to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Invoice Number
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Due Date
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>
                    ${parseFloat(invoice.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={statusColors[invoice.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setViewDialogOpen(true);
                      }}
                      title="View invoice details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <InvoiceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          fetchInvoices();
        }}
        mode="create"
      />
      <InvoiceDialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedInvoice(null);
        }}
        mode="view"
        invoice={selectedInvoice}
      />
    </Box>
  );
}
