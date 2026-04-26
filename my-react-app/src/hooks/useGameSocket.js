import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { API_ORIGIN } from "../config/api";  // ← API_ORIGIN вместо API_BASE_URL

export function useGameSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_ORIGIN, {  // ← API_ORIGIN всегда реальный URL
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  return { emit, on, off, connected, socket: socketRef };
}