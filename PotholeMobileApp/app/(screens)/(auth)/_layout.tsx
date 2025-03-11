import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false , animation: 'none'}}>
      <Stack.Screen name="login" options={{ title: "Login", animation: 'none' }} />
      <Stack.Screen name="register" options={{ title: "Register", animation: 'none' }} />
    </Stack>
  );
}