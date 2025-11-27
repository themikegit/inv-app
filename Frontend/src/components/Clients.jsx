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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "../services/api";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getClients();
      setClients(data);
    } catch (err) {
      setError(err.message || "Failed to fetch clients");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      notes: "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zip_code: client.zip_code || "",
      country: client.country || "",
      notes: client.notes || "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenView = (client) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const handleOpenDelete = (client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedClient(null);
    setFormError("");
  };

  const handleChange = (e) => {
    console.log(e.target);

    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!formData.name.trim()) {
        setFormError("Name is required");
        setFormLoading(false);
        return;
      }

      if (selectedClient) {
        // Update existing client
        await api.updateClient(selectedClient.id, formData);
      } else {
        // Create new client
        await api.createClient(formData);
      }

      handleClose();
      fetchClients();
    } catch (err) {
      let errorMessage = selectedClient
        ? "Failed to update client"
        : "Failed to create client";

      if (err.detail) {
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

      setFormError(errorMessage);
      console.error("Error saving client:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      setFormLoading(true);
      await api.deleteClient(selectedClient.id);
      setDeleteDialogOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (err) {
      setFormError(err.message || "Failed to delete client");
      console.error("Error deleting client:", err);
    } finally {
      setFormLoading(false);
    }
  };

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
          Clients
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchClients}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            New Client
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {clients.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" align="center">
              No clients found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Create your first client to get started
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
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Phone
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Company
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  City
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email || "N/A"}</TableCell>
                  <TableCell>{client.phone || "N/A"}</TableCell>
                  <TableCell>{client.company || "N/A"}</TableCell>
                  <TableCell>{client.city || "N/A"}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenView(client)}
                      title="View client details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(client)}
                      title="Edit client"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDelete(client)}
                      title="Delete client"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClient ? "Edit Client" : "Create New Client"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="phone"
                  label="Phone"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="company"
                  label="Company"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="address"
                  label="Address"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  name="city"
                  label="City"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  name="state"
                  label="State"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  name="zip_code"
                  label="Zip Code"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.zip_code}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="country"
                  label="Country"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="notes"
                  label="Notes"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={formLoading}
            startIcon={formLoading && <CircularProgress size={20} />}
          >
            {selectedClient ? "Update" : "Create"} Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedClient(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Client Details</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClient.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClient.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClient.phone || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClient.company || "N/A"}
                </Typography>
              </Grid>
              {selectedClient.address && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.address}
                  </Typography>
                </Grid>
              )}
              {(selectedClient.city ||
                selectedClient.state ||
                selectedClient.zip_code) && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.city || "N/A"}
                  </Typography>
                </Grid>
              )}
              {selectedClient.state && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.state}
                  </Typography>
                </Grid>
              )}
              {selectedClient.zip_code && (
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Zip Code
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.zip_code}
                  </Typography>
                </Grid>
              )}
              {selectedClient.country && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Country
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.country}
                  </Typography>
                </Grid>
              )}
              {selectedClient.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedClient(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedClient(null);
        }}
      >
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedClient?.name}</strong>? This action cannot be
            undone.
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedClient(null);
              setFormError("");
            }}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={formLoading}
            startIcon={formLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
