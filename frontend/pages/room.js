import React from "react";
import RoomPage from "./roomPage/RoomPage";

export default function Room({ route, navigation }) {
  
  const { room_number, userId, Idroom } = route.params || {};

  return (
    <RoomPage 
      route={{ params: { userId: userId, Idroom, room_number } }} 
      navigation={navigation}
    />
  );
}