import { useEffect } from "react";
import socketService from "../../../services/socket";

export const useSocket = (roomId, setMessages) => {
  useEffect(() => {
    // เชื่อมต่อ socket
    const socket = socketService.connect();

    if (roomId) {
      socketService.joinRoom(roomId);

      // ป้องกัน listener ซ้ำ
      socketService.offReceiveMessage();
      socketService.onReceiveMessage((message) => {
        console.log("Realtime message:", message);
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === message.id);
          if (exists) return prevMessages;
          return [...prevMessages, message];
        });
      });
    }

    return () => {
      if (roomId) socketService.leaveRoom(roomId);
      socketService.offReceiveMessage();
      // ไม่ disconnect socket
    };
  }, [roomId, setMessages]);
};
