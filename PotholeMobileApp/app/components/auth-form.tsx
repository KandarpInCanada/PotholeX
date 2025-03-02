import type React from "react";
import { StyleSheet } from "react-native";
import { MotiView } from "moti";

interface AuthFormProps {
  children: React.ReactNode;
}

export const AuthForm = ({ children }: AuthFormProps) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 1000,
        delay: 500,
      }}
      style={styles.formContainer}
    >
      {children}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    maxWidth: 360,
  },
});
