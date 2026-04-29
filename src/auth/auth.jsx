import axios from "axios";

const BASE_URL = "https://hfapi.herofashion.com/";

// const BASE_URL = "http://127.0.0.1:8000/";
// const BASE_URL = "http://10.1.21.133:7003/";

// ---------------- TOKEN HELPERS ----------------
export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ---------------- AXIOS INSTANCE ----------------
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- LOGIN ----------------
export const loginUser = async (username, password) => {
  const res = await axios.post(BASE_URL + "login/", { username, password });

  setTokens(res.data.access, res.data.refresh);

  startSilentRefresh();

  return res.data;
};

// ---------------- LOGOUT ----------------
export const logoutUser = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      await api.post("logout/", { refresh: refreshToken });
    }
  } catch (err) {
    console.log("Logout error", err);
  } finally {
    clearTokens();
    window.location.href = "/";
  }
};

// ---------------- REQUEST INTERCEPTOR ----------------
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ---------------- RESPONSE INTERCEPTOR ----------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(BASE_URL + "token/refresh/", {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        const newRefresh = res.data.refresh || refreshToken;

        setTokens(newAccess, newRefresh);

        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        console.log("Refresh expired, logging out");
        clearTokens();
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- SILENT REFRESH ----------------
let refreshInterval;

export const startSilentRefresh = () => {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearInterval(refreshInterval);
      return;
    }

    try {
      const res = await axios.post(BASE_URL + "token/refresh/", {
        refresh: refreshToken,
      });

      const newAccess = res.data.access;
      const newRefresh = res.data.refresh || refreshToken;

      setTokens(newAccess, newRefresh);

      console.log("Access token refreshed silently");
    } catch (err) {
      console.log("Silent refresh failed");

      clearTokens();
      clearInterval(refreshInterval);

      window.location.href = "/";
    }
  }, 4 * 60 * 1000);
};


// ---------------- REFRESH ON TAB FOCUS ----------------
document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) return;

    try {
      const res = await axios.post(BASE_URL + "token/refresh/", {
        refresh: refreshToken,
      });

      const newAccess = res.data.access;
      const newRefresh = res.data.refresh || refreshToken;

      setTokens(newAccess, newRefresh);

      console.log("Token refreshed on tab focus");
    } catch (err) {
      console.log("Focus refresh failed");

      clearTokens();
      window.location.href = "/";
    }
  }
});


