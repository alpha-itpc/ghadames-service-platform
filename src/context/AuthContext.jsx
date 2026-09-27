import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ghadames_token'));
  const [loading, setLoading] = useState(true);
  
  // Selected City & Area State (Default: Ghadames)
  const [selectedCity, setSelectedCity] = useState({ id: 1, name_ar: 'غدامس' });
  const [selectedArea, setSelectedArea] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ghadames_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ghadames_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('ghadames_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ghadames_token');
    setToken(null);
    setUser(null);
  };

  const toggleFavorite = (item) => {
    const key = `${item.type}-${item.id}`;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.key === key);
      if (exists) {
        return prev.filter((f) => f.key !== key);
      } else {
        return [...prev, { ...item, key }];
      }
    });
  };

  const isFavorite = (type, id) => {
    const key = `${type}-${id}`;
    return favorites.some((f) => f.key === key);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        selectedCity,
        setSelectedCity,
        selectedArea,
        setSelectedArea,
        favorites,
        toggleFavorite,
        isFavorite
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
