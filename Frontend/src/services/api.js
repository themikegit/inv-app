const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// API helper function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error("Not authenticated");
    }
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }

    // Throw error with detail for better error messages
    const errorObj = new Error(
      errorData.detail || `HTTP error! status: ${response.status}`
    );
    errorObj.detail = errorData.detail;
    errorObj.status = response.status;
    throw errorObj;
  }

  return response.json();
};

// API functions
export const api = {
  // Get all invoices
  getInvoices: (status = null) => {
    const query = status ? `?status=${status}` : "";
    return apiRequest(`/invoices${query}`);
  },

  // Get single invoice
  getInvoice: (id) => {
    return apiRequest(`/invoices/${id}`);
  },

  // Create invoice
  createInvoice: (invoiceData) => {
    return apiRequest("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
  },

  // Update invoice
  updateInvoice: (id, invoiceData) => {
    return apiRequest(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoiceData),
    });
  },

  // Delete invoice
  deleteInvoice: (id) => {
    return apiRequest(`/invoices/${id}`, {
      method: "DELETE",
    });
  },

  // Login
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");

    return fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    });
  },

  // Register
  register: (userData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: () => {
    return apiRequest("/auth/me");
  },
};
