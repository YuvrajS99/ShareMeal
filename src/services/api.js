import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

// Minimal JWT decoder (no external deps).
// Assumes a standard "header.payload.signature" token.
export function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payloadB64 = parts[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, "=");

  try {
    const json = atob(payloadB64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserFromToken() {
  const token = getToken();
  const decoded = decodeJwt(token);
  if (!decoded) return null;
  return { id: decoded.id, role: decoded.role };
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const axiosApi = axios.create({
  baseURL: API_BASE_URL
});

// Attach JWT to every request when present.
axiosApi.interceptors.request.use((config) => {
  config.headers = { ...(config.headers || {}), ...getAuthHeaders() };
  return config;
});

function isNotFoundOrMethodNotAllowed(err) {
  const status = err?.response?.status;
  return status === 404 || status === 405;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await axiosApi.post("/api/auth/login", { email, password });
    return res.data;
  },

  register: async ({ name, email, password, role }) => {
    const res = await axiosApi.post("/api/auth/register", {
      name,
      email,
      password,
      role
    });
    return res.data;
  },

  // Donor
  createDonation: async (payload) => {
    const res = await axiosApi.post("/api/donor/create", payload);
    return res.data;
  },

  getMyDonations: async () => {
    // Spec says GET /api/donor/my, but your current backend uses /my-donations.
    try {
      const res = await axiosApi.get("/api/donor/my");
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.get("/api/donor/my-donations");
      return res2.data;
    }
  },

  // NGO
  getPendingDonations: async () => {
    const res = await axiosApi.get("/api/donor/pending");
    return res.data;
  },

  getAcceptedDonations: async () => {
    // Spec says /api/donor/my-accepted but backend uses /api/donor/accepted
    try {
      const res = await axiosApi.get("/api/donor/my-accepted");
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.get("/api/donor/accepted");
      return res2.data;
    }
  },

  acceptDonation: async (id) => {
    // Backend: PATCH /api/donor/:id/accept
    // Spec: PUT /api/donor/accept/:id
    try {
      const res = await axiosApi.patch(`/api/donor/${id}/accept`);
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.put(`/api/donor/accept/${id}`);
      return res2.data;
    }
  },

  markPicked: async (id) => {
    try {
      const res = await axiosApi.patch(`/api/donor/${id}/picked`);
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.put(`/api/donor/picked/${id}`);
      return res2.data;
    }
  },

  markCompleted: async (id) => {
    try {
      const res = await axiosApi.patch(`/api/donor/${id}/completed`);
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.put(`/api/donor/completed/${id}`);
      return res2.data;
    }
  },

  // Dashboard / misc
  getDashboardStats: async () => {
    // Spec says GET /api/dashboard, backend uses /api/dashboard/stats (protected)
    try {
      const res = await axiosApi.get("/api/dashboard");
      return res.data;
    } catch (err) {
      if (!isNotFoundOrMethodNotAllowed(err)) throw err;
      const res2 = await axiosApi.get("/api/dashboard/stats");
      return res2.data;
    }
  },

  getRecommendedNGO: async ({ pickupAddress, expiryTime } = {}) => {
    const res = await axiosApi.get("/api/ngos/recommend", {
      params: {
        pickupAddress,
        expiryTime
      }
    });
    return res.data;
  },

  assignRecommendation: async (donationId) => {
    const res = await axiosApi.get(`/api/recommendation/${donationId}`);
    return res.data;
  },

  // Contact
  contact: async ({ name, email, message }) => {
    const res = await axios.post("http://localhost:5000/api/contact", {
      name,
      email,
      message
    });
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await axiosApi.get("/api/notifications");
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await axiosApi.patch("/api/notifications/read-all");
    return res.data;
  }
};

