import { useState, useEffect } from "react";
import api from "../../../config/api";

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