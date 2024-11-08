import axios from 'axios';



export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set or clear the Authorization header dynamically
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
