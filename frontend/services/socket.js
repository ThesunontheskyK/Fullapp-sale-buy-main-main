import { io } from "socket.io-client";
import { Platform } from "react-native";

const getSocketUrl = () => {
  const CUSTOM_IP = "http://10.197.195.216:5000";

  if (CUSTOM_IP) return CUSTOM_IP;

  if (Platform.OS === "android") return "http://10.197.195.216:5000";
  if (Platform.OS === "ios") return "http://localhost:5000";
  return "http://localhost:5000";
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.connected) return this.socket;

    const socketUrl = getSocketUrl();
    console.log("Connecting to socket:", socketUrl);

    this.socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit("join-room", roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit("leave-room", roomId);
    }
    // ไม่ต้อง disconnect
  }

  sendMessage(roomId, message) {
    if (this.socket && this.connected) {
      this.socket.emit("send-message", { roomId, message });
    }
  }

  deleteMessage(roomId, messageId) {
    if (this.socket && this.connected) {
      this.socket.emit("delete-message", { roomId, messageId });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off("receive-message"); // ป้องกัน listener ซ้ำ
      this.socket.on("receive-message", callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) this.socket.off("receive-message");
  }

  onMessageDeleted(callback) {
    if (this.socket) this.socket.on("message-deleted", callback);
  }

  offMessageDeleted() {
    if (this.socket) this.socket.off("message-deleted");
  }

  onUserJoined(callback) {
    if (this.socket) this.socket.on("user-joined", callback);
  }

  onUserLeft(callback) {
    if (this.socket) this.socket.on("user-left", callback);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected;
  }

  onRoomUpdate(callback) {
    if (this.socket) this.socket.on("room-updated", callback);
  }

  offRoomUpdate() {
    if (this.socket) this.socket.off("room-updated");
  }

  onNewMessage(callback) {
    if (this.socket) this.socket.on("new-message", callback);
  }

  offNewMessage() {
    if (this.socket) this.socket.off("new-message");
  }

  checkPayment(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit("check-payment", { roomId });
    }
  }

  onPaymentStatus(callback) {
    if (this.socket) this.socket.on("payment-status", callback);
  }

  offPaymentStatus() {
    if (this.socket) this.socket.off("payment-status");
  }
}

export default new SocketService();
