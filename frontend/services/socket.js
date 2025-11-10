import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketUrl = () => {
  const CUSTOM_IP = 'http://192.168.0.107:5000';

  if (CUSTOM_IP) {
    return CUSTOM_IP;
  }

  if (Platform.OS === 'android') {
    return 'http://192.168.0.107:5000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5000';
  } else {
    return 'http://localhost:5000';
  }
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const socketUrl = getSocketUrl();
    console.log('Connecting to socket:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  joinRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('join-room', roomId);
      console.log('Joined room:', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave-room', roomId);
      console.log('Left room:', roomId);
    }
  }

  sendMessage(roomId, message) {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', { roomId, message });
      console.log('Message sent to room:', roomId);
    }
  }

  deleteMessage(roomId, messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('delete-message', { roomId, messageId });
      console.log('Delete message request sent:', messageId);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive-message');
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message-deleted', callback);
    }
  }

  offMessageDeleted() {
    if (this.socket) {
      this.socket.off('message-deleted');
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
