import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useChat — connects to the Socket.io server and manages a single chat room.
 *
 * @param {string} roomId  - Accepted Friend relationship ID to join on connect.
 * @returns {{ messages, connected, currentUserId, error, sendMessage }}
 *
 * Uses dynamic import of socket.io-client so this hook is safe to import
 * in files that are also rendered server-side by Next.js.
 */
export function useChat(roomId) {
  const socketRef = useRef(null);
  const [messages, setMessages]     = useState([]);
  const [connected, setConnected]   = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    let socket;

    import('socket.io-client').then(({ io }) => {
      console.log(`[useChat] Connecting to socket for room: ${roomId}`);
      socket = io({ autoConnect: true });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log(`[useChat] Connected! Socket ID: ${socket.id}`);
        setConnected(true);
        setError('');
        socket.emit('join_room', { roomId });
      });

      socket.on('session_info', ({ userId }) => {
        console.log('[useChat] Received session_info, userId:', userId);
        setCurrentUserId(userId);
      });

      socket.on('connect_error', (err) => {
        console.error('[useChat] Connection error:', err.message);
        setError(`Connection failed: ${err.message}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[useChat] Disconnected: ${reason}`);
        setConnected(false);
        setCurrentUserId(null);
      });

      socket.on('chat_history', ({ messages: history, currentUserId: userId }) => {
        console.log(`[useChat] Received history: ${history.length} messages. User ID: ${userId}`);
        setMessages(Array.isArray(history) ? history : []);
        setCurrentUserId(userId || null);
      });

      socket.on('receive_message', (msg) => {
        console.log('[useChat] Received message:', msg.id, 'roomId:', msg.roomId, 'currentRoom:', roomId);
        
        // Only add if it belongs to this room
        if (String(msg.roomId) !== String(roomId)) {
          console.debug('[useChat] Message belongs to different room, ignoring.');
          return;
        }

        setMessages((prev) => {
          const filtered = prev.filter(m => 
            m.id !== msg.id && 
            (!msg.clientId || m.clientId !== msg.clientId) &&
            (!m.isOptimistic || m.message !== msg.message)
          );
          return [...filtered, msg];
        });
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setMessages([]);
      setConnected(false);
      setCurrentUserId(null);
      setError('');
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (socketRef.current?.connected && text.trim()) {
        const clientId = `client-${Date.now()}-${Math.random()}`;
        const optimisticMsg = {
          id: clientId, // Use clientId as temp ID
          senderId: currentUserId,
          message: text.trim(),
          timestamp: Date.now(),
          isOptimistic: true,
          clientId // Tag for deduplication
        };
        
        console.log('[useChat] Sending message with clientId:', clientId);
        setMessages((prev) => [...prev, optimisticMsg]);
        socketRef.current.emit('send_message', { roomId, message: text.trim(), clientId });
      }
    },
    [roomId, currentUserId]
  );

  return { messages, connected, currentUserId, error, sendMessage };
}
