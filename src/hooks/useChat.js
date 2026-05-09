import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useChat — connects to the Socket.io server and manages a single chat room.
 *
 * @param {string} roomId  - Room to join on connect.
 * @returns {{ messages, connected, mySocketId, sendMessage }}
 *
 * Uses dynamic import of socket.io-client so this hook is safe to import
 * in files that are also rendered server-side by Next.js.
 */
export function useChat(roomId) {
  const socketRef = useRef(null);
  const [messages, setMessages]     = useState([]);
  const [connected, setConnected]   = useState(false);
  const [mySocketId, setMySocketId] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    let socket;

    import('socket.io-client').then(({ io }) => {
      socket = io({ autoConnect: true });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        setMySocketId(socket.id);
        socket.emit('join_room', { roomId });
      });

      socket.on('disconnect', () => {
        setConnected(false);
        setMySocketId(null);
      });

      socket.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setMessages([]);
      setConnected(false);
      setMySocketId(null);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (socketRef.current?.connected && text.trim()) {
        socketRef.current.emit('send_message', { roomId, message: text.trim() });
      }
    },
    [roomId]
  );

  return { messages, connected, mySocketId, sendMessage };
}
