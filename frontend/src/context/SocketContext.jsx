// context/SocketContext.jsx - FIXED VERSION
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    // Don't connect if no user
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null); // eslint-disable-line react-hooks/set-state-in-effect
        setConnected(false); // eslint-disable-line react-hooks/set-state-in-effect
      }
      return;
    }

    // Don't reconnect if already connected
    if (socketRef.current?.connected) {
      return;
    }

    // Get token from cookie
    const getToken = () => {
      const match = document.cookie.match(/accessToken=([^;]+)/);
      return match ? match[1] : null;
    };

    const token = getToken();
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    
    console.log("🔌 Connecting socket...");
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    // Handle account deactivation
    newSocket.on("account_deactivated", (data) => {
      console.warn("🚫 Account deactivated:", data);
      addToast("Your account has been deactivated by an administrator.", "error", 0);
      logout();
      navigate("/login", { 
        state: { message: "Your account has been deactivated. Please contact an administrator." }
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    return () => {
      console.log("🔌 Disconnecting socket...");
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.off("account_deactivated");
        newSocket.off("connect_error");
        newSocket.disconnect();
      }
    };
  }, [user, logout, addToast, navigate]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};