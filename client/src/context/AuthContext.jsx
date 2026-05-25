// ============================================================================
// 🔒 BOOKKART CUSTOMER & ADMIN AUTHENTICATION STATE PROVIDER (Context)
// ============================================================================
// This file coordinates client-side user sessions. It registers account profiles,
// manages login attempts, validates cryptographical JSON Web Tokens (JWT), fetches profiles,
// and maintains reactive user objects in global state, determining routing behaviors.

import React, { createContext, useState, useEffect } from 'react'; // Imports React core hooks and context engine

// Instantiate the Authentication context hook to be consumed by child components
export const AuthContext = createContext();

// Server Endpoint prefix path mapped from local proxy settings
const API_URL = 'http://localhost:5000/api';

// AuthProvider: Wraps child components, serving as the single-source-of-truth for session state.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the currently logged-in MERN user profile object
  const [loading, setLoading] = useState(true); // Flag showing if initial startup token verification is running
  const [error, setError] = useState(null); // String captured if a registration or login handshake fails

  // Initial Session Sync Effect: Runs exactly once during front-end startup. 
  // Inspects localStorage for a JWT session token and runs a profile fetch to verify credentials.
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token'); // Retrieve stored JWT session token
      
      // A. Stop checks immediately if no session token was found
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // B. Ping Express API profile check route, attaching JWT token in Bearer headers
        const res = await fetch(`${API_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // Attach token for verification check
          }
        });

        const data = await res.json();

        if (data.success) {
          // C. Profile success! Load User metadata object into local reactive state
          setUser(data.user);
        } else {
          // D. Bad token! Purge token from localStorage to prevent infinity checks
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setUser(null);
      } finally {
        setLoading(false); // Authentication check finished
      }
    };

    checkUserLoggedIn();
  }, []);

  // register: Calls customer registration endpoint. Saves JWT token on success.
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      // Enforce response errors
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token locally and load active customer state
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err; // Forward error to UI components for local form warning displays
    } finally {
      setLoading(false);
    }
  };

  // login: Calls customer login endpoint. Stores JWT token on success.
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      // Enforce response errors
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT token locally and register User profile
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err; // Forward error to form UI
    } finally {
      setLoading(false);
    }
  };

  // adminLogin: Calls administrator credentials verification endpoint.
  const adminLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      // Enforce response errors
      if (!data.success) {
        throw new Error(data.message || 'Admin login failed');
      }

      // Store JWT token locally and register Admin profile
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err; // Forward error to form UI
    } finally {
      setLoading(false);
    }
  };

  // logout: Tears down active login session, purges localStorage JWT token, and resets User state.
  const logout = () => {
    localStorage.removeItem('token'); // Purge token
    setUser(null); // Reset user state to null
  };

  // Helper check: True if user exists and carries role = admin
  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        register,
        login,
        adminLogin,
        logout,
        setUser,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
//
