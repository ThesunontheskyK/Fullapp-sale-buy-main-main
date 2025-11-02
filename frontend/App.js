import "./global.css";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getItem } from './storage';

import LoginPage from "./pages/auth/login";
import OTP from "./pages/auth/auth_otp";
import Register from "./pages/auth/register/Register";
import HomePage from "./pages/homePage/home";
import RoomPage from "./pages/room";
import PaymentPage from "./pages/paymentpage/PaymentPage";
import MessengerPage from "./pages/messenger";
import confirmEmail from "./pages/auth/register/confirmemail";
import Terms from "./pages/auth/Terms";

const Stack = createNativeStackNavigator();

export default function App() {

  const [initialRoute, setInitialRoute] = useState(null);
  const [userId, setUserId] = useState("205");

  useEffect(() => {

    async function checkToken() {
      try {
        
        const token = await getItem('token');
        const storedUserId = await getItem('user_id');

        if (!token || String(token || '').trim() === "" || !storedUserId) {
          setInitialRoute('Login');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        setInitialRoute('Login');
      }
    }

    checkToken();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="Register" component={Register}/>
        <Stack.Screen name="Login" component={LoginPage} initialParams={{ userId: userId }} />
        <Stack.Screen name="OTP" component={OTP}/>
        <Stack.Screen name="Terms" component={Terms}/>
        <Stack.Screen name="Home" component={HomePage} initialParams={{ userId: userId }} />
        <Stack.Screen name="Room" component={RoomPage} initialParams={{ userId: userId }} />
        <Stack.Screen name="Messager" component={MessengerPage} initialParams={{ userId: userId }} />
        <Stack.Screen name="ConfirmEmail" component={confirmEmail} options={{animation: "slide_from_right"}}/>
        <Stack.Screen name="PaymentPage" component={PaymentPage} options={{ animation: "slide_from_right" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
