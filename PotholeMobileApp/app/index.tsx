import { Redirect } from "expo-router";

const isAuthenticated = false; // Replace with real auth logic

export default function Index() {
  return <Redirect href={isAuthenticated ? "/dashboard" : "/auth/login"} />;
}