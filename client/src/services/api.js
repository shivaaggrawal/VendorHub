import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://vendorhub-dwpl.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 90000, // 90-second timeout specifically configured to absorb Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token if stored in localStorage (if not relying solely on cookies)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      try {
        // Dynamically import store and logout slice action to resolve circular dependency
        const { default: store } = await import("../redux/store");
        const { logout } = await import("../redux/slices/authSlice");
        store.dispatch(logout());
      } catch (err) {
        console.error("Failed to dynamically dispatch logout on 401:", err);
      }
    } else {
      // Dispatches custom window event for automatic notification toasts
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "A network connection issue occurred.";
      window.dispatchEvent(new CustomEvent("api-error", { detail: { message } }));
    }
    return Promise.reject(error);
  }
);

export default api;
