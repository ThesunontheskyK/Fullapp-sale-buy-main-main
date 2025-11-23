import { useState, useEffect } from "react";
import api from "../../../config/api";
import socketService from "../../../services/socket"; // สมมติคุณมี service socket

export const useRoomData = (roomId, userId, role) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(role || "buyer");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/chat/rooms/${roomId}`);
        
        if (response.data.success) {
          const roomData = response.data.data.chatRoom;
          setRoom(roomData);

          const messagesArray = Object.entries(roomData.messages || {}).map(
            ([id, msg]) => ({ id, ...msg })
          );
          setMessages(messagesArray);

          setCurrentUserId(userId);

          const fetchedRole = roomData.users?.[userId]?.role;
          setCurrentUserRole(fetchedRole);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    socketService.connect();
    socketService.joinRoom(roomId);

    socketService.onRoomUpdate((updatedRoom) => {
      setRoom(updatedRoom);
      const messagesArray = Object.entries(updatedRoom.messages || {}).map(
        ([id, msg]) => ({ id, ...msg })
      );
      setMessages(messagesArray);
    });

    socketService.onNewMessage((newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socketService.onPaymentStatus((data) => {
      
      if (data.status === true) {
        fetchRoomData();
      }
    });

    return () => {
      socketService.leaveRoom(roomId);
      socketService.offRoomUpdate();
      socketService.offNewMessage();
    };
  }, [roomId, userId]);

  return {
    room,
    loading,
    currentUserId,
    currentUserRole,
    messages,
    setMessages,
  };
};
