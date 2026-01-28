// import axios from "axios";
// import { getAccessToken, logout } from "../auth/authStore";
// import { refreshAccessToken } from "../auth/refresh";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api",
//   withCredentials: true,
// });

// api.interceptors.request.use(config => {
//   const token = getAccessToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   res => res,
//   async error => {
//     const original = error.config;

//     if (error.response?.status !== 401 || original._retry) {
//       return Promise.reject(error);
//     }
    
//     original._retry = true;
    
//     try {
//       await refreshAccessToken();
//       return api(original);
//     } catch {
//       await logout();
//       return Promise.reject(error);
//     }
//   }
// );

// export default api;




import axios from "axios";
import { getAccessToken, setAccessToken, logout } from "../auth/authStore";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    // Don't retry if:
    // - Not a 401 error
    // - Already retried
    // - Request is to auth endpoints (prevent infinite loop)
    if (
      error.response?.status !== 401 || 
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch(err => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      // Use direct axios to avoid interceptor loop
      const res = await axios.post(
        "http://localhost:8080/api/auth/refresh",
        { refresh_token: refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = res.data.access_token;
      const newRefreshToken = res.data.refresh_token;

      setAccessToken(newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Update the failed request with new token
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      
      // Process queued requests
      processQueue(null, newAccessToken);
      
      return api(original);
      
    } catch (refreshError) {
      processQueue(refreshError, null);
      await logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;