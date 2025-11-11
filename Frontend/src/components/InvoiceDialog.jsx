import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material";
import { api } from "../services/api";

const statusColors = {
  draft: "default",
  sent: "info",
  paid: "success",
  overdue: "error",
};

export default function InvoiceDialog({
  open,
  onClose,
  onSuccess,
  mode = "create",
  invoice = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isViewMode = mode === "view";

  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_name: "",
    customer_email: "",
    amount: "",
    status: "draft",
    description: "",
    issue_date: "",
    due_date: "",
  });

  // Load invoice data when in view mode
  useEffect(() => {
    if (isViewMode && invoice && open) {
      setFormData({
        invoice_number: invoice.invoice_number || "",
        customer_name: invoice.customer_name || "",
        customer_email: invoice.customer_email || "",
        amount: invoice.amount ? parseFloat(invoice.amount).toFixed(2) : "",
        status: invoice.status || "draft",
        description: invoice.description || "",
        issue_date: invoice.issue_date ? invoice.issue_date.split("T")[0] : "",
        due_date: invoice.due_date ? invoice.due_date.split("T")[0] : "",
      });
    } else if (!isViewMode && open) {
      // Reset form when opening in create mode
      setFormData({
        invoice_number: "",
        customer_name: "",
        customer_email: "",
        amount: "",
        status: "draft",
        description: "",
        issue_date: "",
        due_date: "",
      });
    }
  }, [isViewMode, invoice, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.invoice_number ||
        !formData.customer_name ||
        !formData.amount ||
        !formData.issue_date ||
        !formData.due_date
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate email format if provided
      if (formData.customer_email && formData.customer_email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.customer_email)) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }
      }

      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError("Amount must be a positive number");
        setLoading(false);
        return;
      }

      // Validate dates
      const issueDate = new Date(formData.issue_date);
      const dueDate = new Date(formData.due_date);
      if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
        setError("Please enter valid dates");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const invoiceData = {
        invoice_number: formData.invoice_number.trim(),
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email?.trim()
          ? formData.customer_email.trim()
          : null,
        amount: amount,
        status: formData.status,
        description: formData.description?.trim()
          ? formData.description.trim()
          : null,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
      };

      await api.createInvoice(invoiceData);

      // Reset form
      setFormData({
        invoice_number: "",
        customer_name: "",
        customer_email: "",
        amount: "",
        status: "draft",
        description: "",
        issue_date: "",
        due_date: "",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      // Try to extract detailed error message from backend
      let errorMessage = "Failed to create invoice";

      if (err.detail) {
        // Handle FastAPI validation errors (422)
        if (Array.isArray(err.detail)) {
          errorMessage = err.detail
            .map((e) => {
              const field = e.loc?.[e.loc.length - 1] || "field";
              return `${field}: ${e.msg || e}`;
            })
            .join(", ");
        } else {
          errorMessage = err.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Error creating invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        invoice_number: "",
        customer_name: "",
        customer_email: "",
        amount: "",
        status: "draft",
        description: "",
        issue_date: "",
        due_date: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isViewMode ? "Invoice Details" : "Create New Invoice"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus={!isViewMode}
                margin="dense"
                name="invoice_number"
                label="Invoice Number"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.invoice_number}
                onChange={handleChange}
                required={!isViewMode}
                disabled={loading || isViewMode}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {isViewMode ? (
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    label={formData.status}
                    color={statusColors[formData.status] || "default"}
                    size="medium"
                  />
                </Box>
              ) : (
                <TextField
                  margin="dense"
                  name="status"
                  label="Status"
                  select
                  fullWidth
                  variant="outlined"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="customer_name"
                label="Customer Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.customer_name}
                onChange={handleChange}
                required={!isViewMode}
                disabled={loading || isViewMode}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="customer_email"
                label="Customer Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.customer_email}
                onChange={handleChange}
                disabled={loading || isViewMode}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="amount"
                label="Amount"
                type={isViewMode ? "text" : "number"}
                fullWidth
                variant="outlined"
                value={isViewMode ? `$${formData.amount}` : formData.amount}
                onChange={handleChange}
                required={!isViewMode}
                disabled={loading || isViewMode}
                inputProps={isViewMode ? {} : { step: "0.01", min: "0.01" }}
                helperText={isViewMode ? "" : "Must be greater than 0"}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="issue_date"
                label="Issue Date"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.issue_date}
                onChange={handleChange}
                required={!isViewMode}
                disabled={loading || isViewMode}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="due_date"
                label="Due Date"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.due_date}
                onChange={handleChange}
                required={!isViewMode}
                disabled={loading || isViewMode}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={loading || isViewMode}
                InputProps={{
                  readOnly: isViewMode,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Create Invoice
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
