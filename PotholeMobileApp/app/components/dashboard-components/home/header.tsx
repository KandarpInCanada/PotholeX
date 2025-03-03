"use client";

import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const router = useRouter();

  return (
    <View style={styles.headerContent}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerActions}>
        <IconButton
          icon="tune-vertical"
          size={24}
          iconColor="#0284c7"
          onPress={() => router.push("/dashboard/filters")}
        />
        <IconButton
          icon="map"
          size={24}
          iconColor="#0284c7"
          onPress={() => router.push("/dashboard/map")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
});

export default Header;
