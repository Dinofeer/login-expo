import React, { createContext, useState, useEffect } from 'react';
import { saveUser, getUser, removeUser } from '../utils/secureStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getUser('user');
      if (storedUser) setUser(storedUser);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const storedUser = await getUser('user');
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      setUser(storedUser);
      return true;
    }
    return false;
  };

  const register = async (email, password) => {
    const newUser = { email, password };
    await saveUser('user', newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await removeUser('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
