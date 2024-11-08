import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://imagequest-28858b43b1c8.herokuapp.com/api', // Use Heroku URL as fallback
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
