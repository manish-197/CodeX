import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authToast, setAuthToast] = useState(null);

  // Helper to decode JWT token payload without external libraries
  const parseJwt = (jwtToken) => {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Re-validate and hydrate session from localStorage on application boot
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const savedToken = localStorage.getItem('arogya_token');
        const savedUserStr = localStorage.getItem('arogya_user');

        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        // Check JWT expiration
        const decoded = parseJwt(savedToken);
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn('[Auth] Session token has expired.');
          logout();
          setIsLoading(false);
          return;
        }

        // Set optimistic session from storage
        let initialUser = null;
        if (savedUserStr) {
          try {
            initialUser = JSON.parse(savedUserStr);
            setCurrentUser(initialUser);
            setToken(savedToken);
          } catch (e) {}
        }

        // Re-validate and re-fetch latest profile from server
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              setToken(savedToken);
              localStorage.setItem('arogya_user', JSON.stringify(data.user));
            }
          } else if (res.status === 401 || res.status === 403) {
            // Token invalid or revoked
            logout();
          }
        } catch (serverErr) {
          // If server is temporarily unreachable, preserve offline user session
          console.warn('[Auth] Server re-fetch failed, using offline session:', serverErr.message);
          if (initialUser) {
            setCurrentUser(initialUser);
            setToken(savedToken);
          }
        }
      } catch (err) {
        console.error('[Auth] Hydration error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const login = (jwtToken, user) => {
    setToken(jwtToken);
    setCurrentUser(user);
    try {
      localStorage.setItem('arogya_token', jwtToken);
      localStorage.setItem('arogya_user', JSON.stringify(user));
    } catch (e) {}
    setAuthModalOpen(false);
    setAuthToast(null);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('arogya_token');
      localStorage.removeItem('arogya_user');
    } catch (e) {}
  };

  const openLogin = (toastMsg = 'Please log in to continue.') => {
    setAuthToast(toastMsg);
    setAuthModalOpen(true);
  };

  const closeLogin = () => {
    setAuthModalOpen(false);
    setAuthToast(null);
  };

  const requireAuth = (callback, toastMsg = 'Please log in to continue.') => {
    if (currentUser && token) {
      if (callback) callback();
      return true;
    }
    openLogin(toastMsg);
    return false;
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: Boolean(currentUser && token),
    userRole: currentUser?.role || 'citizen',
    isKioskOperator: currentUser?.role === 'kiosk_operator',
    isLoading,
    authModalOpen,
    authToast,
    login,
    logout,
    openLogin,
    closeLogin,
    requireAuth,
    setAuthToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
