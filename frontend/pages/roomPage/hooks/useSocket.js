import { useEffect } from "react";
import socketService from "../../../services/socket";

export const useSocket = (roomId, setMessages) => {
  useEffect(() => {
    socketService.connect();

    if (roomId) {
      socketService.joinRoom(roomId);

      socketService.onReceiveMessage((message) => {
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg.id === message.id);
          if (exists) return prevMessages;
          return [...prevMessages, message];
        });
      });
    }

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      socketService.offReceiveMessage();
    };
  }, [roomId, setMessages]);
};