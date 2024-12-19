import { useState, createContext, useEffect } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import { getToken, setToken, clearToken } from '@/util/authUtil';
import { AuthContext } from './AuthContext';
import logInUser from '@/util/logInUser';
import api from '@/util/api';

// export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // const [user, setUser] = useState(() => {
  //   const token = getToken();
  //   return token ? jwtDecode(token) : null;
  // });
  // const [isLoggedIn, setIsLoggedIn] = useState(() => {
  //   const token = getToken();
  //   return token ? true : false;
  // });
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        let res = await api.authenticate();
        setUser(res.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to authenticate user ' + err);
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    authenticate();
  }, []);

  const login = async (email, password) => {
    const encodedLogin = Buffer.from(`${email}:${password}`, 'utf-8').toString(
      'base64'
    );
    let res;
    try {
      axios.defaults.headers.common['Authorization'] = `Basic ${encodedLogin}`;
      axios.defaults.headers.common['Content-Type'] = 'application/json';
      let requestUrl = `${import.meta.env.VITE_SERVER}/jotter/login`;
      res = await axios.post(requestUrl, { withCredentials: true });
      console.log('response:', res.data); // delete later
      setUser(res.data.user);
      setToken(res.data.token);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      res = err;
    }
    return res;
    // return encodedLogin;
  };

  const logout = async () => {
    try {
      let requestUrl = `${import.meta.env.VITE_SERVER}/jotter/logout`;
      await axios.post(requestUrl, {}, { withCredentials: true });
      setUser(null);
      setIsLoggedIn(false);
      clearToken();
      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Failed to log user out:', err);
    }
  };

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// export { AuthContext };
