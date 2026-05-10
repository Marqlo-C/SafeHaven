/**
 * ChatFeature — friend-gated real-time messaging via Socket.io.
 *
 * Activated in src/app.js when config.features.enable_anonymous_chat === true.
 *
 * Privacy contract:
 *  - Socket auth uses the existing HTTP-only auth cookie.
 *  - Room IDs are accepted Friend relationship IDs.
 *  - Messages are stored in MongoDB for persistence.
 *  - Real usernames are never sent; clients receive anonymous display names.
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../config/config');
const { connectDB } = require('../lib/db');
const Friend = require('../models/Friend');
const ChatMessage = require('../models/ChatMessage');

const MAX_MESSAGE_LENGTH = 2000;
const HISTORY_LIMIT = 100;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
}

function authenticateSocket(socket) {
  const cookies = parseCookies(socket.handshake.headers.cookie);
  const token = cookies.auth_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.env.JWT_SECRET);
    return {
      userId: decoded.sub,
      displayName: decoded.displayName,
      duressMode: decoded.duressMode || false,
    };
  } catch {
    return null;
  }
}

function serializeMessage(message) {
  const senderId = message.senderId._id?.toString() || message.senderId.toString();

  return {
    id: message._id.toString(),
    senderId,
    senderDisplayName: message.senderId.anonymousDisplayName,
    message: message.message,
    timestamp: message.createdAt.getTime(),
  };
}

class ChatFeature {
  /**
   * @param {import('socket.io').Server} io
   */
  static init(io) {
    console.log('[ChatFeature] Friend-gated persistent chat enabled.');

    io.on('connection', (socket) => {
      const session = authenticateSocket(socket);

      if (!session) {
        socket.emit('chat_error', { error: 'Authentication required.' });
        socket.disconnect(true);
        return;
      }

      socket.data.session = session;
      socket.data.allowedRooms = new Set();

      console.log(`[ChatFeature] Client connected: ${socket.id}`);

      /**
       * Client emits: { roomId: friendRelationshipId }
       * Server joins only if the relationship is accepted and includes user.
       */
      socket.on('join_room', async ({ roomId }) => {
        if (!roomId || typeof roomId !== 'string') return;
        if (!mongoose.isValidObjectId(roomId)) {
          socket.emit('chat_error', { error: 'Invalid friend chat.' });
          return;
        }

        try {
          await connectDB();

          const friend = await Friend.findOne({
            _id: roomId,
            status: 'accepted',
            $or: [
              { requesterId: session.userId },
              { recipientId: session.userId },
            ],
          });

          if (!friend) {
            socket.emit('chat_error', { error: 'You can only chat with accepted friends.' });
            return;
          }

          const socketRoom = `friend:${friend._id.toString()}`;
          socket.join(socketRoom);
          socket.data.allowedRooms.add(socketRoom);

          const history = await ChatMessage
            .find({ friendId: friend._id })
            .sort({ createdAt: -1 })
            .limit(HISTORY_LIMIT)
            .populate('senderId', 'anonymousDisplayName')
            .select('-__v');

          socket.emit('chat_history', {
            roomId,
            currentUserId: session.userId,
            messages: history.reverse().map(serializeMessage),
          });

          socket.to(socketRoom).emit('user_joined', { roomId });
        } catch (err) {
          console.error('[ChatFeature] join_room error:', err.name, err.message);
          socket.emit('chat_error', { error: 'Unable to join chat.' });
        }
      });

      /**
       * Client emits: { roomId: friendRelationshipId, message: string }
       * Server stores then broadcasts to all sockets in the friend room.
       */
      socket.on('send_message', async ({ roomId, message }) => {
        if (!roomId || !message || typeof message !== 'string') return;
        if (!mongoose.isValidObjectId(roomId)) return;

        const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!trimmed) return;

        const socketRoom = `friend:${roomId}`;
        if (!socket.data.allowedRooms.has(socketRoom)) {
          socket.emit('chat_error', { error: 'Join an accepted friend chat before sending.' });
          return;
        }

        try {
          await connectDB();

          const friend = await Friend.exists({
            _id: roomId,
            status: 'accepted',
            $or: [
              { requesterId: session.userId },
              { recipientId: session.userId },
            ],
          });

          if (!friend) {
            socket.emit('chat_error', { error: 'Friend chat is no longer available.' });
            return;
          }

          const savedMessage = await ChatMessage.create({
            friendId: roomId,
            senderId: session.userId,
            message: trimmed,
          });

          await savedMessage.populate('senderId', 'anonymousDisplayName');

          io.to(socketRoom).emit('receive_message', serializeMessage(savedMessage));
        } catch (err) {
          console.error('[ChatFeature] send_message error:', err.name, err.message);
          socket.emit('chat_error', { error: 'Unable to send message.' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`[ChatFeature] Client disconnected: ${socket.id}`);
      });
    });
  }
}

module.exports = { ChatFeature };
