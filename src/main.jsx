import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global Axios Interceptor for "Hard" Logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 (Unauthorized/Expired Token)
    if (error.response && error.response.status === 401) {
      localStorage.clear(); // Wipe the session
      window.location.href = "/"; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)